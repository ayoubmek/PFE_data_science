"""
Protocole d'évaluation et de prévision.

Backtest rolling-origin sans fuite de données : les `n_origins` dernières fenêtres consécutives de
`horizon` jours sont successivement masquées ; chaque modèle est ré-entraîné uniquement sur les
données antérieures à la fenêtre, puis prévoit la fenêtre entière (multi-pas, sans voir les valeurs
réelles). Les métriques sont calculées sur l'ensemble des jours prévus (agrégation des fenêtres).

Modèle de l'application : choisi une fois pour toutes (paramètre ML_MODEL, Prophet par défaut) à partir de
l'étude comparative des 4 modèles sur 12 mois de tests (cf. evaluate_dwh.py). Le choix ne dépend donc pas de
la date prévue. Si plusieurs modèles sont évalués, le classement se fait au WAPE minimal (le WAPE est préféré
au MAPE, instable les jours à faible production).
"""
import logging
import time
from datetime import datetime
from typing import Callable, Dict, List, Optional

import numpy as np
import pandas as pd

from .arima_model import ARIMAModel
from .calendar_features import learn_recurring_closures
from .linear_regression_model import LinearRegressionModel
from .metrics import compute_eval_metrics, interval_coverage, seasonal_naive_scale
from .prophet_model import ProphetModel
from .random_forest_model import RandomForestModel

logger = logging.getLogger("ml-service.evaluation")

MODEL_FACTORIES: Dict[str, Callable] = {
    "prophet": ProphetModel,
    "random_forest": RandomForestModel,
    "arima": ARIMAModel,
    "linear_regression": LinearRegressionModel,
}
MODEL_NAMES = {k: f().name for k, f in MODEL_FACTORIES.items()}
# Clés des colonnes de prévision attendues par le frontend et par dbo.ml_production_predictions.
OUTPUT_KEYS = {"prophet": "prophet_quantity", "random_forest": "rf_quantity",
               "arima": "arima_quantity", "linear_regression": "lr_quantity"}
MIN_TRAIN_DAYS = 60


def tukey_upper_fence(series: pd.Series) -> float:
    q1, q3 = np.quantile(series.to_numpy(dtype=float), [0.25, 0.75])
    return float(q3 + 3.0 * (q3 - q1))


def clean_training_series(series: pd.Series) -> pd.Series:
    """
    Plafonne les valeurs aberrantes au-dessus de la barrière de Tukey Q3 + 3·IQR (« far out »).
    Exemple réel : le 2025-06-03, dbo.FACT_CLE contient des déclarations dupliquées jusqu'à 78 fois
    (même OF / machine / opération / équipe), soit 14 fois la production moyenne. Appliqué uniquement
    aux données d'apprentissage ; les métriques sont calculées sur les valeurs réelles brutes.
    """
    return series.clip(upper=tukey_upper_fence(series))


def _fit_predict(key: str, train: pd.Series, horizon: int) -> pd.DataFrame:
    """
    Entraîne le modèle puis applique la règle métier commune aux 4 modèles : les dates de fermeture
    d'usine récurrente (apprises sur les seules données d'apprentissage) ont une production prévue nulle.
    """
    clean = clean_training_series(train)
    fc = MODEL_FACTORIES[key]().fit(clean).predict(horizon)
    closures = learn_recurring_closures(clean)
    closed = np.array([(d.month, d.day) in closures for d in fc.index], dtype=bool)
    if closed.any():
        fc.loc[closed, :] = 0.0
    return fc


def rolling_origin_backtest(series: pd.Series, horizon: int, n_origins: int,
                            models: Optional[List[str]] = None) -> dict:
    models = models or list(MODEL_FACTORIES)
    n = len(series)
    cuts = [n - k * horizon for k in range(n_origins, 0, -1) if n - k * horizon >= MIN_TRAIN_DAYS]
    if not cuts:
        raise ValueError(
            f"Historique trop court ({n} jours) pour un backtest de {horizon} jours "
            f"(minimum {MIN_TRAIN_DAYS + horizon} jours)."
        )

    folds = []
    pooled = {k: {"actual": [], "pred": [], "lower": [], "upper": [], "mase": []} for k in models}
    last_fold_rows = None

    for cut in cuts:
        train, test = series.iloc[:cut], series.iloc[cut:cut + horizon]
        scale = seasonal_naive_scale(train.to_numpy())
        fold = {"train_end": train.index[-1].strftime("%Y-%m-%d"),
                "test_start": test.index[0].strftime("%Y-%m-%d"),
                "test_end": test.index[-1].strftime("%Y-%m-%d"),
                "metrics": {}}
        fold_preds = {}
        for key in models:
            t0 = time.perf_counter()
            fc = _fit_predict(key, train, len(test))
            yhat = fc["yhat"].to_numpy()
            fold_preds[key] = yhat
            m = compute_eval_metrics(test.to_numpy(), yhat, scale)
            m["fit_predict_seconds"] = round(time.perf_counter() - t0, 2)
            fold["metrics"][key] = m
            p = pooled[key]
            p["actual"].extend(test.to_numpy())
            p["pred"].extend(yhat)
            if m["mase"] is not None:
                p["mase"].append(m["mase"])
            if "yhat_lower" in fc:
                p["lower"].extend(fc["yhat_lower"].to_numpy())
                p["upper"].extend(fc["yhat_upper"].to_numpy())
        folds.append(fold)
        last_fold_rows = [
            {"date": d.strftime("%Y-%m-%d"), "actual": float(test.iloc[i]),
             **{k: round(float(fold_preds[k][i]), 1) for k in models}}
            for i, d in enumerate(test.index)
        ]

    metrics, residuals = {}, {}
    for key, p in pooled.items():
        m = compute_eval_metrics(p["actual"], p["pred"])
        m["mase"] = round(float(np.mean(p["mase"])), 3) if p["mase"] else None
        m["coverage_95_pct"] = interval_coverage(p["actual"], p["lower"], p["upper"]) if p["lower"] else None
        m["name"] = MODEL_NAMES[key]
        metrics[key] = m
        residuals[key] = np.asarray(p["actual"]) - np.asarray(p["pred"])

    return {
        "method": "Rolling-origin (fenêtres consécutives non chevauchantes, ré-entraînement à chaque origine)",
        "horizon": horizon,
        "n_origins": len(cuts),
        "folds": folds,
        "metrics": metrics,
        "last_fold": last_fold_rows,
        "_residuals": residuals,
        "_pooled": {k: (list(p["actual"]), list(p["pred"])) for k, p in pooled.items()},
    }


def select_best_model(backtest: dict, last_year: Optional[dict]) -> str:
    """
    Classe les modèles évalués par WAPE sur les fenêtres glissantes uniquement : le choix ne dépend pas de la
    date prévue. Le WAPE sur la même période N-1 est conservé à titre d'information (wape_last_year).
    """
    metrics = backtest["metrics"]
    for key in metrics:
        metrics[key]["wape_rolling"] = metrics[key]["wape"]
        metrics[key]["wape_selection"] = metrics[key]["wape"]
        metrics[key]["wape_last_year"] = last_year["metrics"][key]["wape"] if last_year else None
    ranked = sorted((k for k in metrics if metrics[k]["wape"] is not None), key=lambda k: metrics[k]["wape"])
    for rank, key in enumerate(ranked, start=1):
        metrics[key]["rank"] = rank
    backtest["n_test_windows"] = backtest["n_origins"]
    backtest["selection_criterion"] = (
        f"WAPE sur {backtest['n_origins']} périodes de test de {backtest['horizon']} jours"
    )
    return ranked[0] if ranked else "prophet"


def same_period_last_year(series: pd.Series, forecast_start: pd.Timestamp, horizon: int,
                          models: Optional[List[str]] = None) -> Optional[dict]:
    """
    Test sur la même période un an plus tôt : chaque modèle est entraîné uniquement sur les données
    antérieures à (début de la prévision - 1 an), prévoit `horizon` jours, puis est comparé au réel du DWH.
    Retourne None si cette période n'est pas entièrement présente dans l'historique.
    """
    test_start = forecast_start - pd.DateOffset(years=1)
    test = series.loc[test_start:test_start + pd.Timedelta(days=horizon - 1)]
    train = series.loc[:test_start - pd.Timedelta(days=1)]
    if len(test) < horizon or len(train) < MIN_TRAIN_DAYS:
        return None
    models = models or list(MODEL_FACTORIES)
    scale = seasonal_naive_scale(train.to_numpy())
    preds, metrics = {}, {}
    for key in models:
        yhat = _fit_predict(key, train, horizon)["yhat"].to_numpy()
        preds[key] = yhat
        metrics[key] = {**compute_eval_metrics(test.to_numpy(), yhat, scale), "name": MODEL_NAMES[key]}
    return {
        "test_start": test.index[0].strftime("%Y-%m-%d"),
        "test_end": test.index[-1].strftime("%Y-%m-%d"),
        "train_end": train.index[-1].strftime("%Y-%m-%d"),
        "metrics": metrics,
        "rows": [
            {"date": d.strftime("%Y-%m-%d"), "actual": float(test.iloc[i]),
             **{k: round(float(preds[k][i]), 1) for k in models}}
            for i, d in enumerate(test.index)
        ],
    }


def build_forecast_bundle(series: pd.Series, horizon: int, n_origins: int,
                          backtest_horizon: Optional[int] = None, history_days: int = 90,
                          start: Optional[pd.Timestamp] = None, models: Optional[List[str]] = None) -> dict:
    """
    `start` : premier jour de la période affichée. Les modèles prévoient tous les jours depuis la fin de
    l'historique jusqu'à start + horizon - 1 ; seuls les `horizon` derniers jours sont retournés.
    """
    t0 = time.perf_counter()
    models = models or list(MODEL_FACTORIES)
    backtest = rolling_origin_backtest(series, backtest_horizon or horizon, n_origins, models)
    first_future = series.index[-1] + pd.Timedelta(days=1)
    gap = max(0, (start - first_future).days) if start is not None else 0
    last_year = same_period_last_year(series, first_future + pd.Timedelta(days=gap), horizon, models)
    best = select_best_model(backtest, last_year)
    backtest["best_model"] = best
    forecasts = {key: _fit_predict(key, series, gap + horizon).iloc[gap:] for key in models}
    best_fc = forecasts[best]
    if "yhat_lower" in best_fc:
        lower, upper = best_fc["yhat_lower"].to_numpy(), best_fc["yhat_upper"].to_numpy()
        interval_method = f"Intervalle natif à 95 % du modèle {MODEL_NAMES[best]}"
    else:
        res = backtest["_residuals"][best]
        q_lo, q_hi = np.quantile(res, [0.025, 0.975])
        lower = np.maximum(0.0, best_fc["yhat"].to_numpy() + q_lo)
        upper = best_fc["yhat"].to_numpy() + q_hi
        interval_method = "Intervalle empirique à 95 % (quantiles 2,5 % / 97,5 % des résidus du backtest)"

    predictions = []
    for i, d in enumerate(best_fc.index):
        row = {"date": d.strftime("%Y-%m-%d")}
        for key, fc in forecasts.items():
            row[OUTPUT_KEYS[key]] = round(float(fc["yhat"].iloc[i]), 1)
        row["best_quantity"] = round(float(best_fc["yhat"].iloc[i]), 1)
        # Production réelle du jour si le DWH la contient déjà (sinon None : jamais de valeur inventée)
        row["actual"] = float(series[d]) if d in series.index else None
        # Réel de l'an dernier, même jour de la semaine (52 semaines = 364 jours plus tôt : lundi <-> lundi)
        d_n1 = d - pd.Timedelta(weeks=52)
        row["real_last_year_date"] = d_n1.strftime("%Y-%m-%d")
        row["real_last_year"] = float(series[d_n1]) if d_n1 in series.index else None
        row["lower_95"] = round(float(lower[i]), 1)
        row["upper_95"] = round(float(upper[i]), 1)
        predictions.append(row)

    fence = tukey_upper_fence(series)
    outliers = series[series > fence]
    recent_year = clean_training_series(series).iloc[-365:]
    backtest.pop("_residuals")
    backtest.pop("_pooled")
    return {
        "data_source": "dbDWH.dbo.FACT_CLE — SUM([Quantité produite TRS]) par jour, tous sites",
        "history_start": series.index[0].strftime("%Y-%m-%d"),
        "history_end": series.index[-1].strftime("%Y-%m-%d"),
        "history_days": int(len(series)),
        "zero_days_in_history": int((series == 0).sum()),
        "outlier_treatment": {
            "rule": "Plafonnement à Q3 + 3·IQR (barrière de Tukey) sur les données d'apprentissage",
            "upper_fence": round(fence, 1),
            "capped_days": [{"date": d.strftime("%Y-%m-%d"), "value": float(v)} for d, v in outliers.items()],
        },
        "history": [{"date": d.strftime("%Y-%m-%d"), "value": float(v)} for d, v in series.iloc[-history_days:].items()],
        "horizon_days": horizon,
        "same_period_last_year": last_year,
        "forecast_start": best_fc.index[0].strftime("%Y-%m-%d"),
        "days_ahead_of_history": int(gap),
        "best_model": best,
        "best_model_name": MODEL_NAMES[best],
        "interval_method": interval_method,
        "predictions": predictions,
        "metrics": backtest["metrics"],
        "backtest": {k: v for k, v in backtest.items() if k != "metrics"},
        "capacity": {
            "window_days": int(len(recent_year)),
            "p95_daily": round(float(np.quantile(recent_year, 0.95)), 1),
            "max_daily": round(float(recent_year.max()), 1),
            "mean_daily": round(float(recent_year.mean()), 1),
        },
        "computed_in_seconds": round(time.perf_counter() - t0, 1),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
    }


def benchmark_custom_series(series: pd.Series, horizon: int, n_origins: int,
                            start: Optional[pd.Timestamp] = None, models: Optional[List[str]] = None) -> dict:
    """
    Benchmark sur une série fournie par l'utilisateur, avec exactement le même protocole que le mode DWH
    (mêmes fenêtres de test, même période prévue) : un fichier contenant les mêmes données que le DWH donne
    donc le même résultat. Les fenêtres ne sont raccourcies que si le fichier est trop court.
    """
    n = len(series)
    if n >= MIN_TRAIN_DAYS + n_origins * horizon:
        bt_horizon = horizon
    else:
        bt_horizon = min(horizon, max(7, (n - MIN_TRAIN_DAYS) // 2))
        n_origins = max(1, min(n_origins, (n - MIN_TRAIN_DAYS) // bt_horizon))
    bundle = build_forecast_bundle(series, horizon, n_origins, backtest_horizon=bt_horizon, start=start,
                                   models=models)
    bundle["data_source"] = "Fichier importé par l'utilisateur"
    return bundle
