import logging
import sys
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import numpy as np
import pandas as pd
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

_cur_dir = Path(__file__).resolve().parent
if str(_cur_dir) not in sys.path:
    sys.path.insert(0, str(_cur_dir))

import config
from models import (
    MODEL_FACTORIES,
    DWHUnavailableError,
    ProphetModel,
    benchmark_custom_series,
    build_forecast_bundle,
    load_production_dataset,
    load_production_series,
    load_stock_snapshot,
)
from models import data_loader, stock
from models.data_loader import PRODUCTION_DECIMALS

if config.ML_MODEL not in MODEL_FACTORIES:
    raise RuntimeError(f"ML_MODEL='{config.ML_MODEL}' inconnu. Valeurs possibles : {', '.join(MODEL_FACTORIES)}")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ml-service")


def require_api_key(x_api_key: Optional[str] = Header(default=None)):
    if config.ML_API_KEY and x_api_key != config.ML_API_KEY:
        raise HTTPException(401, "Clé d'API ML invalide ou absente (en-tête X-API-Key).")


app = FastAPI(
    title="Nexora - ML Service",
    description="Prévisions, benchmark des modèles et analyses de stock calculés sur le Data Warehouse dbDWH.",
    version="3.0.0",
)
if config.ML_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.ML_CORS_ORIGINS,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )


@app.exception_handler(DWHUnavailableError)
def dwh_unavailable_handler(request: Request, exc: DWHUnavailableError):
    return JSONResponse(status_code=503, content={"error": "DWH indisponible", "detail": str(exc)})


# ---------------------------------------------------------------------------
# Cache des calculs coûteux (ré-entraînement de 4 modèles x n origines)
# ---------------------------------------------------------------------------
_cache: dict = {}
_cache_lock = threading.Lock()


def _cached(key, compute):
    with _cache_lock:
        hit = _cache.get(key)
        if hit and time.time() - hit[0] < config.ML_CACHE_TTL_SECONDS:
            return hit[1]
        value = compute()
        _cache[key] = (time.time(), value)
        return value


MAX_DAYS_AHEAD = 400


def _compute_forecast_bundle(horizon: int, start: Optional[str] = None) -> dict:
    series, meta = load_production_dataset()
    start_ts = pd.Timestamp(start) if start else None
    if start_ts is not None and (start_ts - series.index[-1]).days > MAX_DAYS_AHEAD:
        raise HTTPException(400, f"La date de début doit se situer au plus {MAX_DAYS_AHEAD} jours après "
                                 f"la dernière donnée du DWH ({series.index[-1]:%Y-%m-%d}).")
    bundle = build_forecast_bundle(series, horizon, config.ML_BACKTEST_ORIGINS, start=start_ts,
                                   models=[config.ML_MODEL])
    bundle.update(meta)
    return bundle


def forecast_bundle(horizon: int, start: Optional[str] = None) -> dict:
    return _cached(("forecast", horizon, start), lambda: _compute_forecast_bundle(horizon, start))


@app.on_event("startup")
def warm_cache():
    def _warm():
        try:
            logger.info("Pré-calcul des prévisions (horizon 30 j) sur dbDWH...")
            b = forecast_bundle(30)
            logger.info(f"Prévisions prêtes en {b['computed_in_seconds']} s — modèle retenu : {b['best_model_name']}")
        except Exception as e:
            logger.warning(f"Pré-calcul impossible : {e}")

    threading.Thread(target=_warm, daemon=True).start()


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "Nexora ML Service",
        "version": app.version,
        "database": {"connected": data_loader.is_available(), "server": config.DB_HOST, "database": config.DB_NAME},
        "timestamp": datetime.now().isoformat(timespec="seconds"),
    }


@app.get("/predict/production", dependencies=[Depends(require_api_key)])
def predict_production(horizon: int = 30, start: Optional[str] = None):
    """`start` (AAAA-MM-JJ, optionnel) : premier jour de la période prévue ; par défaut, le lendemain des données."""
    if not 1 <= horizon <= 90:
        raise HTTPException(400, "L'horizon doit être compris entre 1 et 90 jours.")
    if start:
        try:
            start = pd.Timestamp(start).strftime("%Y-%m-%d")
        except ValueError:
            raise HTTPException(400, "Date de début invalide (format attendu : AAAA-MM-JJ).")
    return forecast_bundle(horizon, start)


@app.get("/benchmark", dependencies=[Depends(require_api_key)])
def benchmark(horizon: int = 30):
    b = predict_production(horizon)
    return {k: b[k] for k in ("data_source", "history_start", "history_end", "history_days", "horizon_days",
                              "best_model", "best_model_name", "metrics", "backtest", "generated_at")}


class ScenarioRequest(BaseModel):
    variation_percent: float = 0.0
    horizon: int = 30


@app.post("/simulate/scenario", dependencies=[Depends(require_api_key)])
def simulate_scenario(request: ScenarioRequest):
    b = predict_production(request.horizon)
    factor = 1 + request.variation_percent / 100
    baseline = [p["best_quantity"] for p in b["predictions"]]
    scenario = [round(v * factor, 1) for v in baseline]
    return {
        "type": "production",
        "baseline_model": b["best_model_name"],
        "variation_percent": request.variation_percent,
        "horizon": request.horizon,
        "dates": [p["date"] for p in b["predictions"]],
        "baseline": baseline,
        "scenario": scenario,
        "total_baseline": round(sum(baseline), 1),
        "total_scenario": round(sum(scenario), 1),
    }


class AnomalyRequest(BaseModel):
    dates: Optional[List[str]] = None
    values: Optional[List[float]] = None


def _anomaly_report(series: pd.Series) -> dict:
    df = ProphetModel().fit(series).detect_anomalies()
    total = len(df)
    n_anom = int(df["is_anomaly"].sum())
    return {
        "period": {"start": df["date"].iloc[0], "end": df["date"].iloc[-1]},
        "total_observations": total,
        "anomalies_count": n_anom,
        "anomaly_rate_pct": round(n_anom / total * 100, 2) if total else 0.0,
        "deficits_critiques": int((df["anomaly_type"] == "DEFICIT_CRITIQUE").sum()),
        "surplus_pics": int((df["anomaly_type"] == "SURPLUS_PIC").sum()),
        "zero_days_total": int(df["is_zero_day"].sum()),
        "zero_days_detected_as_anomaly": int((df["is_zero_day"] & df["is_anomaly"]).sum()),
        "detection_rule": "y < borne basse 95 % (déficit) OU y > borne haute 95 % (sur-cadence)",
        "model": "Prophet (intervalle d'incertitude natif à 95 %)",
        "anomalies": df[df["is_anomaly"]].to_dict("records"),
    }


@app.get("/detect/anomalies", dependencies=[Depends(require_api_key)])
def detect_anomalies_dwh():
    report = _cached(("anomalies",), lambda: _anomaly_report(load_production_series()))
    return {"data_source": "dbDWH.dbo.FACT_CLE", **report}


@app.post("/detect/anomalies", dependencies=[Depends(require_api_key)])
def detect_anomalies_custom(req: AnomalyRequest):
    if not req.values or not req.dates or len(req.values) != len(req.dates) or len(req.values) < 30:
        raise HTTPException(400, "Fournir `dates` et `values` de même longueur (au moins 30 observations).")
    s = pd.Series(req.values, index=pd.to_datetime(req.dates)).groupby(level=0).sum().asfreq("D", fill_value=0.0)
    return {"data_source": "Série fournie dans la requête", **_anomaly_report(s)}


# ---------------------------------------------------------------------------
# Analyses de stock (dbo.ASTOCKDATE + dbo.FACT_ILE)
# ---------------------------------------------------------------------------
def _abc(df_articles: pd.DataFrame) -> pd.DataFrame:
    df = df_articles[df_articles["valeur"] > 0].sort_values("valeur", ascending=False).reset_index(drop=True)
    total = df["valeur"].sum()
    df["cum_pct"] = df["valeur"].cumsum() / total * 100
    df["classe"] = np.where(df["cum_pct"] <= 80, "A", np.where(df["cum_pct"] <= 95, "B", "C"))
    return df


def _snapshot_by_article() -> pd.DataFrame:
    snap = load_stock_snapshot()
    return (snap.groupby("reference")
                .agg(designation=("designation", "first"), categorie=("categorie", "first"),
                     quantite=("quantite", "sum"), valeur=("valeur", "sum"), date_stock=("date_stock", "first"))
                .reset_index())


@app.get("/analyze/abc", dependencies=[Depends(require_api_key)])
def analyze_abc():
    articles = _snapshot_by_article()
    df = _abc(articles)
    if df.empty:
        raise HTTPException(404, "Aucun article valorisé dans le dernier instantané de stock.")
    total = float(df["valeur"].sum())
    classes = []
    for cl in ["A", "B", "C"]:
        sub = df[df["classe"] == cl]
        classes.append({
            "classe": cl,
            "nb_articles": int(len(sub)),
            "pct_articles": round(len(sub) / len(df) * 100, 1),
            "valeur_totale_tnd": round(float(sub["valeur"].sum()), 2),
            "pct_valeur": round(float(sub["valeur"].sum()) / total * 100, 1),
        })
    return {
        "data_source": "dbDWH.dbo.ASTOCKDATE (dernier instantané)",
        "date_stock": str(articles["date_stock"].iloc[0]),
        "total_articles": int(len(df)),
        "valeur_totale_tnd": round(total, 2),
        "classes": classes,
        "top10": df.head(10)[["reference", "designation", "categorie", "quantite", "valeur", "classe"]].to_dict("records"),
    }


@app.get("/analyze/stock-status", dependencies=[Depends(require_api_key)])
def analyze_stock_status():
    df = stock.load_article_status()
    return {
        "data_source": "dbDWH.dbo.ASTOCKDATE + dbDWH.dbo.FACT_ILE",
        "date_stock": str(df["date_stock"].iloc[0]),
        "date_consommation": str(df["date_conso"].iloc[0]),
        "regles": {
            "fenetre_consommation_jours": config.STOCK_CONSO_WINDOW_DAYS,
            "fenetre_rupture_jours": config.STOCK_RUPTURE_RECENT_DAYS,
            "seuil_critique_jours": config.STOCK_CRITIQUE_DAYS,
            "seuil_surstock_jours": config.STOCK_SURSTOCK_DAYS,
            "couverture_cible_jours": config.STOCK_COVERAGE_TARGET_DAYS,
        },
        "nb_articles": int(len(df)),
        "statuts": stock.status_counts(df),
        "reapprovisionnement": stock.replenishment_summary(df),
        "articles": stock.to_records(df.drop(columns=["date_stock", "date_conso"])),
    }


@app.get("/analyze/stats", dependencies=[Depends(require_api_key)])
def analyze_stats():
    df = stock.load_article_status()
    by_cat = (df.assign(categorie=df["categorie"].fillna("Non classé"))
                .groupby("categorie")
                .agg(nb=("reference", "count"), qte_totale=("stock", "sum"), valeur_totale=("valeur", "sum"))
                .reset_index().sort_values("valeur_totale", ascending=False).round(2))
    return {
        "data_source": "dbDWH.dbo.ASTOCKDATE + dbDWH.dbo.FACT_ILE",
        "total_articles": int(len(df)),
        "statuts": stock.status_counts(df),
        "quantite_stats": df["stock"].describe().round(2).to_dict(),
        "valeur_stats": df["valeur"].describe().round(2).to_dict(),
        "by_category": by_cat.to_dict("records"),
    }


@app.get("/insights", dependencies=[Depends(require_api_key)])
def get_insights():
    df = stock.load_article_status()
    counts = stock.status_counts(df)
    plan = stock.replenishment_summary(df)
    abc = _abc(df.rename(columns={"stock": "quantite"}))
    total = len(df)
    insights = []
    if counts["RUPTURE"]:
        insights.append({"type": "danger", "priority": 1,
                         "title": f"{counts['RUPTURE']} article(s) consommé(s) en rupture de stock",
                         "detail": f"Soit {counts['RUPTURE'] / total * 100:.1f} % des articles suivis."})
    if counts["CRITIQUE"]:
        insights.append({"type": "warning", "priority": 2,
                         "title": f"{counts['CRITIQUE']} article(s) avec moins de {config.STOCK_CRITIQUE_DAYS} jours de couverture",
                         "detail": f"Plan {plan['horizon_jours']} j : {plan['nb_references']} références, "
                                   f"{plan['quantite_totale']:,.0f} unités, {plan['budget_tnd']:,.0f} TND."})
    if not abc.empty:
        a_count = int((abc["classe"] == "A").sum())
        insights.append({"type": "info", "priority": 3,
                         "title": f"Pareto : {a_count} article(s) concentrent 80 % de la valeur du stock",
                         "detail": f"Valeur totale du stock : {abc['valeur'].sum():,.0f} TND."})
    if counts["SURSTOCK"]:
        insights.append({"type": "info", "priority": 4,
                         "title": f"{counts['SURSTOCK']} article(s) en surstock (≥ {config.STOCK_SURSTOCK_DAYS} jours de couverture)",
                         "detail": "Capital immobilisé à réduire."})
    if counts["SANS_CONSOMMATION"]:
        insights.append({"type": "secondary", "priority": 5,
                         "title": f"{counts['SANS_CONSOMMATION']} article(s) sans consommation sur {config.STOCK_CONSO_WINDOW_DAYS} jours",
                         "detail": "Stock dormant à analyser."})
    return {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "data_source": "dbDWH.dbo.ASTOCKDATE + dbDWH.dbo.FACT_ILE",
        "total_articles": total,
        "statuts": counts,
        "reapprovisionnement": plan,
        "insights": insights,
    }


# ---------------------------------------------------------------------------
# Benchmark sur un fichier importé par l'utilisateur
# ---------------------------------------------------------------------------
class CustomDataPoint(BaseModel):
    date: str
    value: float


class CustomPredictionRequest(BaseModel):
    data: List[CustomDataPoint]
    horizon: int = 30
    # Premier jour de la période prévue (AAAA-MM-JJ) ; ignoré s'il n'est pas après la fin du fichier
    start: Optional[str] = None


@app.post("/predict/custom", dependencies=[Depends(require_api_key)])
def predict_custom(req: CustomPredictionRequest):
    if not 1 <= req.horizon <= 90:
        raise HTTPException(400, "L'horizon doit être compris entre 1 et 90 jours.")
    try:
        s = (pd.Series([p.value for p in req.data], index=pd.to_datetime([p.date for p in req.data], format="%Y-%m-%d"))
               .groupby(level=0).sum().sort_index().asfreq("D", fill_value=0.0))
    except Exception as e:
        raise HTTPException(400, f"Dates ou valeurs invalides : {e}")
    if len(s) < 90:
        raise HTTPException(400, f"Le fichier couvre {len(s)} jours ; au moins 90 jours consécutifs sont nécessaires.")
    s.index.name, s.name = "date", "value"
    s = s.round(PRODUCTION_DECIMALS)  # même précision que la série chargée depuis le DWH

    start_ts = None
    if req.start:
        try:
            start_ts = pd.Timestamp(req.start)
        except ValueError:
            raise HTTPException(400, "Date de début invalide (format attendu : AAAA-MM-JJ).")
        if not (s.index[-1] < start_ts <= s.index[-1] + pd.Timedelta(days=MAX_DAYS_AHEAD)):
            start_ts = None  # période demandée incompatible avec ce fichier : prévision juste après la fin du fichier
    try:
        return benchmark_custom_series(s, req.horizon, config.ML_BACKTEST_ORIGINS, start_ts,
                                       models=[config.ML_MODEL])
    except ValueError as e:
        raise HTTPException(400, str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=config.ML_SERVICE_HOST, port=config.ML_SERVICE_PORT)
