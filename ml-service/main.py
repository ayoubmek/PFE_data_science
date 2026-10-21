import hashlib
import logging
import threading
import time
import uuid
from typing import List, Optional

import numpy as np
import pandas as pd
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import config
from models.data_loader import PRODUCTION_DECIMALS, DWHUnavailableError, is_available, load_production_series
from models.evaluation import MIN_TRAIN_DAYS, MODEL_FACTORIES, Tracker, build_custom_forecast, build_forecast

if config.ML_MODEL != "auto" and config.ML_MODEL not in MODEL_FACTORIES:
    raise RuntimeError(f"ML_MODEL='{config.ML_MODEL}' inconnu. Valeurs possibles : auto, {', '.join(MODEL_FACTORIES)}")
APP_MODELS = list(MODEL_FACTORIES) if config.ML_MODEL == "auto" else [config.ML_MODEL]
MAX_DAYS_AHEAD = 400
WARMUP_ATTEMPTS = 5
WARMUP_RETRY_SECONDS = 30

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


def _compute_dwh_forecast(horizon: int, start: Optional[str], tracker: Optional[Tracker] = None) -> dict:
    tracker = tracker or Tracker()
    tracker.running("Lecture de la production journalière dans dbDWH (FACT_CLE)…")
    series = load_production_series()
    tracker.step("load", f"{len(series)} jours de production chargés depuis FACT_CLE, du {series.index[0]:%d/%m/%Y} "
                         f"au {series.index[-1]:%d/%m/%Y}")
    start_ts = _parse_start(start)
    if start_ts is not None and (start_ts - series.index[-1]).days > MAX_DAYS_AHEAD:
        raise HTTPException(400, f"La date de début doit se situer au plus {MAX_DAYS_AHEAD} jours après "
                                 f"la dernière donnée du DWH ({series.index[-1]:%Y-%m-%d}).")
    train = series
    if start_ts is not None and start_ts <= series.index[-1]:
        train = series.loc[:start_ts - pd.Timedelta(days=1)]
        if len(train) < MIN_TRAIN_DAYS + horizon:
            raise HTTPException(400, f"Historique insuffisant avant le {start_ts:%d/%m/%Y} pour entraîner les modèles.")
        tracker.step("load", f"Mois passé : apprentissage limité aux {len(train)} jours avant le {start_ts:%d/%m/%Y}, "
                             f"la production réelle sert de comparaison")
    return build_forecast(train, horizon, config.ML_BACKTEST_ORIGINS, APP_MODELS, start_ts,
                          tuning_folds=config.ML_TUNING_FOLDS, reference=series, tracker=tracker)


def dwh_forecast(horizon: int, start: Optional[str]) -> dict:
    return _cached(("forecast", horizon, start), lambda: _compute_dwh_forecast(horizon, start))


@app.on_event("startup")
def warm_cache():
    def _warm():
        start = config.ML_WARMUP_START or None
        for attempt in range(1, WARMUP_ATTEMPTS + 1):
            try:
                logger.info(f"Pré-calcul des prévisions (début {start or 'lendemain des données'}, essai {attempt})...")
                result = dwh_forecast(30, start)
                logger.info(f"Prévisions prêtes en {result['computed_in_seconds']} s — meilleur modèle : {result['best_model_name']}")
                return
            except HTTPException as e:
                logger.warning(f"Pré-calcul annulé : {e.detail}")
                return
            except Exception as e:
                logger.warning(f"Pré-calcul impossible (essai {attempt}/{WARMUP_ATTEMPTS}) : {e}")
                time.sleep(WARMUP_RETRY_SECONDS)

    threading.Thread(target=_warm, daemon=True).start()


@app.get("/health")
def health():
    return {"status": "UP", "database": {"connected": is_available(), "server": config.DB_HOST, "database": config.DB_NAME}}


@app.get("/predict/production", dependencies=[Depends(require_api_key)])
def predict_production(horizon: int = 30, start: Optional[str] = None):
    _check_horizon(horizon)
    start_ts = _parse_start(start)
    return dwh_forecast(horizon, start_ts.strftime("%Y-%m-%d") if start_ts is not None else None)


JOB_TTL_SECONDS = 3600


class TrainingJob(Tracker):
    """Entraînement complet lancé par la page Benchmark, sans cache, dont les étapes sont suivies en direct."""

    def __init__(self, horizon: int, start: Optional[str]):
        super().__init__()
        self.id = uuid.uuid4().hex[:12]
        self.key = (horizon, start)
        self.status = "running"
        self.steps: list = []
        self.current = ""
        self.result: Optional[dict] = None
        self.error: Optional[str] = None
        self.t0 = time.time()
        self.elapsed: Optional[float] = None

    def running(self, text: str):
        self.current = text

    def step(self, phase: str, message: str, advance: int = 0, **data):
        super().step(phase, message, advance)
        self.steps.append({"t": round(time.time() - self.t0, 1), "phase": phase, "message": message, **data})

    def run(self):
        horizon, start = self.key
        try:
            result = _compute_dwh_forecast(horizon, start, self)
            _cache[("forecast", horizon, start)] = (time.time(), result)
            self.result = result
            self.step("done", f"Entraînement terminé en {round(time.time() - self.t0, 1)} s · "
                              f"meilleur modèle : {result['best_model_name']}")
            self.status = "done"
        except HTTPException as e:
            self.error, self.status = str(e.detail), "error"
        except DWHUnavailableError as e:
            self.error, self.status = str(e), "error"
        except Exception as e:
            logger.exception("Entraînement Benchmark en échec")
            self.error, self.status = f"Échec de l'entraînement : {e}", "error"
        finally:
            self.elapsed = round(time.time() - self.t0, 1)
            self.current = ""

    def snapshot(self, since: int) -> dict:
        steps = self.steps[since:]
        percent = 100 if self.status == "done" else min(99, round(100 * self.done / self.total))
        return {
            "job_id": self.id,
            "status": self.status,
            "percent": percent,
            "elapsed": self.elapsed if self.elapsed is not None else round(time.time() - self.t0, 1),
            "current": self.current,
            "steps": steps,
            "next": since + len(steps),
            "result": self.result,
            "error": self.error,
        }


_jobs: dict = {}
_jobs_guard = threading.Lock()


@app.post("/benchmark/start", dependencies=[Depends(require_api_key)])
def benchmark_start(horizon: int = 30, start: Optional[str] = None):
    _check_horizon(horizon)
    start_ts = _parse_start(start)
    key = (horizon, start_ts.strftime("%Y-%m-%d") if start_ts is not None else None)
    with _jobs_guard:
        for job_id, job in list(_jobs.items()):
            if job.status != "running" and time.time() - job.t0 > JOB_TTL_SECONDS:
                del _jobs[job_id]
        running = next((j for j in _jobs.values() if j.key == key and j.status == "running"), None)
        if running:
            return {"job_id": running.id}
        job = TrainingJob(*key)
        _jobs[job.id] = job
    threading.Thread(target=job.run, daemon=True).start()
    return {"job_id": job.id}


@app.get("/benchmark/{job_id}", dependencies=[Depends(require_api_key)])
def benchmark_status(job_id: str, since: int = 0):
    job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(404, "Entraînement introuvable ou expiré.")
    return job.snapshot(max(0, since))


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
