import hashlib
import logging
import threading
import time
from typing import List, Optional

import numpy as np
import pandas as pd
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import config
from models.data_loader import PRODUCTION_DECIMALS, DWHUnavailableError, is_available, load_production_series
from models.evaluation import MODEL_FACTORIES, build_custom_forecast, build_forecast

if config.ML_MODEL != "auto" and config.ML_MODEL not in MODEL_FACTORIES:
    raise RuntimeError(f"ML_MODEL='{config.ML_MODEL}' inconnu. Valeurs possibles : auto, {', '.join(MODEL_FACTORIES)}")
APP_MODELS = list(MODEL_FACTORIES) if config.ML_MODEL == "auto" else [config.ML_MODEL]
MAX_DAYS_AHEAD = 400

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ml-service")

app = FastAPI(title="Nexora - ML Service")
if config.ML_CORS_ORIGINS:
    app.add_middleware(CORSMiddleware, allow_origins=config.ML_CORS_ORIGINS, allow_methods=["GET", "POST"],
                       allow_headers=["*"])


def require_api_key(x_api_key: Optional[str] = Header(default=None)):
    if config.ML_API_KEY and x_api_key != config.ML_API_KEY:
        raise HTTPException(401, "Clé d'API ML invalide ou absente (en-tête X-API-Key).")


@app.exception_handler(DWHUnavailableError)
def dwh_unavailable_handler(request: Request, exc: DWHUnavailableError):
    return JSONResponse(status_code=503, content={"error": "DWH indisponible", "detail": str(exc)})


_cache: dict = {}
_key_locks: dict = {}
_key_locks_guard = threading.Lock()


def _fresh(key):
    hit = _cache.get(key)
    return hit[1] if hit and time.time() - hit[0] < config.ML_CACHE_TTL_SECONDS else None


def _cached(key, compute):
    value = _fresh(key)
    if value is not None:
        return value
    with _key_locks_guard:
        lock = _key_locks.setdefault(key, threading.Lock())
    with lock:
        value = _fresh(key)
        if value is None:
            value = compute()
            _cache[key] = (time.time(), value)
        return value


def _parse_start(start: Optional[str]) -> Optional[pd.Timestamp]:
    if not start:
        return None
    try:
        return pd.Timestamp(start)
    except ValueError:
        raise HTTPException(400, "Date de début invalide (format attendu : AAAA-MM-JJ).")


def _check_horizon(horizon: int):
    if not 1 <= horizon <= 90:
        raise HTTPException(400, "L'horizon doit être compris entre 1 et 90 jours.")


def _compute_dwh_forecast(horizon: int, start: Optional[str]) -> dict:
    series = load_production_series()
    start_ts = _parse_start(start)
    if start_ts is not None and (start_ts - series.index[-1]).days > MAX_DAYS_AHEAD:
        raise HTTPException(400, f"La date de début doit se situer au plus {MAX_DAYS_AHEAD} jours après "
                                 f"la dernière donnée du DWH ({series.index[-1]:%Y-%m-%d}).")
    return build_forecast(series, horizon, config.ML_BACKTEST_ORIGINS, APP_MODELS, start_ts,
                          tuning_folds=config.ML_TUNING_FOLDS)


def dwh_forecast(horizon: int, start: Optional[str]) -> dict:
    return _cached(("forecast", horizon, start), lambda: _compute_dwh_forecast(horizon, start))


@app.on_event("startup")
def warm_cache():
    def _warm():
        try:
            start = config.ML_WARMUP_START or None
            logger.info(f"Pré-calcul des prévisions (début {start or 'lendemain des données'})...")
            result = dwh_forecast(30, start)
            logger.info(f"Prévisions prêtes en {result['computed_in_seconds']} s — meilleur modèle : {result['best_model_name']}")
        except Exception as e:
            logger.warning(f"Pré-calcul impossible : {e}")

    threading.Thread(target=_warm, daemon=True).start()


@app.get("/health")
def health():
    return {"status": "UP", "database": {"connected": is_available(), "server": config.DB_HOST, "database": config.DB_NAME}}


@app.get("/predict/production", dependencies=[Depends(require_api_key)])
def predict_production(horizon: int = 30, start: Optional[str] = None):
    _check_horizon(horizon)
    start_ts = _parse_start(start)
    return dwh_forecast(horizon, start_ts.strftime("%Y-%m-%d") if start_ts is not None else None)


class CustomDataPoint(BaseModel):
    date: str
    value: float


class CustomPredictionRequest(BaseModel):
    data: List[CustomDataPoint]
    horizon: int = 30
    start: Optional[str] = None


@app.post("/predict/custom", dependencies=[Depends(require_api_key)])
def predict_custom(req: CustomPredictionRequest):
    _check_horizon(req.horizon)
    try:
        s = (pd.Series([p.value for p in req.data], index=pd.to_datetime([p.date for p in req.data], format="%Y-%m-%d"))
               .groupby(level=0).sum().sort_index().asfreq("D", fill_value=0.0))
    except Exception as e:
        raise HTTPException(400, f"Dates ou valeurs invalides : {e}")
    if len(s) < 90:
        raise HTTPException(400, f"Le fichier couvre {len(s)} jours ; au moins 90 jours consécutifs sont nécessaires.")
    s = s.round(PRODUCTION_DECIMALS)

    start_ts = _parse_start(req.start)
    if start_ts is not None and not (s.index[-1] < start_ts <= s.index[-1] + pd.Timedelta(days=MAX_DAYS_AHEAD)):
        start_ts = None
    start_key = start_ts.strftime("%Y-%m-%d") if start_ts is not None else None

    def compute():
        try:
            dwh_series = load_production_series()
            if dwh_series.index.equals(s.index) and np.array_equal(dwh_series.to_numpy(), s.to_numpy()):
                return dwh_forecast(req.horizon, start_key)
        except DWHUnavailableError:
            pass
        return build_custom_forecast(s, req.horizon, config.ML_BACKTEST_ORIGINS, APP_MODELS, start_ts,
                                     tuning_folds=config.ML_TUNING_FOLDS)

    content_key = hashlib.sha1(pd.util.hash_pandas_object(s, index=True).to_numpy().tobytes()).hexdigest()
    try:
        return _cached(("custom", content_key, req.horizon, start_key), compute)
    except ValueError as e:
        raise HTTPException(400, str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=config.ML_SERVICE_HOST, port=config.ML_SERVICE_PORT)
