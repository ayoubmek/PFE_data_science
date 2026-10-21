import hashlib
import itertools
import logging
import time
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

from .arima_model import ARIMAModel
from .calendar_features import learn_recurring_closures
from .linear_regression_model import LinearRegressionModel
from .metrics import compute_eval_metrics
from .prophet_model import ProphetModel
from .random_forest_model import RandomForestModel

MODEL_FACTORIES = {
    "prophet": ProphetModel,
    "random_forest": RandomForestModel,
    "arima": ARIMAModel,
    "linear_regression": LinearRegressionModel,
}
MODEL_NAMES = {k: f.name for k, f in MODEL_FACTORIES.items()}
MIN_TRAIN_DAYS = 60

logger = logging.getLogger("ml-service")

_tuning_cache: Dict[tuple, dict] = {}


class Tracker:
    """Suivi d'un entraînement : sans effet par défaut, journalisé en direct par la page Benchmark."""

    def __init__(self):
        self.total, self.done = 1, 0

    def plan(self, total: int):
        self.total, self.done = max(1, total), 0

    def running(self, text: str):
        pass

    def step(self, phase: str, message: str, advance: int = 0, **data):
        self.done += advance


def _n(x: Optional[float]) -> str:
    return "—" if x is None else f"{x:,.0f}".replace(",", " ")


def clean_training_series(series: pd.Series) -> pd.Series:
    q1, q3 = np.quantile(series.to_numpy(dtype=float), [0.25, 0.75])
    return series.clip(upper=float(q3 + 3.0 * (q3 - q1)))


def fit_predict(key: str, train: pd.Series, horizon: int, params: Optional[dict] = None) -> pd.Series:
    clean = clean_training_series(train)
    yhat = MODEL_FACTORIES[key](**(params or {})).fit(clean).predict(horizon)
    closures = learn_recurring_closures(clean)
    closed = np.array([(d.month, d.day) in closures for d in yhat.index], dtype=bool)
    return yhat.mask(closed, 0.0)


def _cuts(n: int, horizon: int, n_folds: int) -> List[int]:
    return [n - k * horizon for k in range(n_folds, 0, -1) if n - k * horizon >= MIN_TRAIN_DAYS]


def cv_mae(key: str, series: pd.Series, horizon: int, n_folds: int, params: dict) -> Optional[float]:
    actual, pred = [], []
    for cut in _cuts(len(series), horizon, n_folds):
        test = series.iloc[cut:cut + horizon].to_numpy()
        actual.extend(test)
        pred.extend(fit_predict(key, series.iloc[:cut], len(test), params).to_numpy())
    return compute_eval_metrics(actual, pred)["mae"]


def tune(key: str, series: pd.Series, horizon: int, n_folds: int) -> dict:
    factory = MODEL_FACTORIES[key]
    if not factory.GRID or n_folds < 1 or not _cuts(len(series), horizon, n_folds):
        return {"params": dict(factory.DEFAULT_PARAMS), "criterion": None, "candidates": []}

    digest = hashlib.sha1(pd.util.hash_pandas_object(series, index=True).to_numpy().tobytes()).hexdigest()
    cache_key = (key, horizon, n_folds, digest)
    if cache_key in _tuning_cache:
        return _tuning_cache[cache_key]

    criterion = "aic" if factory.SELECT_BY_AIC else "mae_cv"
    candidates = []
    for values in itertools.product(*factory.GRID.values()):
        params = dict(zip(factory.GRID, values))
        try:
            if factory.SELECT_BY_AIC:
                score = round(factory(**params).fit(clean_training_series(series)).aic, 1)
            else:
                score = cv_mae(key, series, horizon, n_folds, params)
        except Exception:
            score = None
        candidates.append({"params": params, "score": score})

    scored = [c for c in candidates if c["score"] is not None]
    best = min(scored, key=lambda c: c["score"])["params"] if scored else dict(factory.DEFAULT_PARAMS)
    result = {"params": best, "criterion": criterion, "candidates": candidates}
    _tuning_cache[cache_key] = result
    return result


def rolling_backtest(series: pd.Series, horizon: int, n_origins: int, models: List[str],
                     params: Dict[str, dict], tracker: Optional[Tracker] = None) -> dict:
    tracker = tracker or Tracker()
    n = len(series)
    cuts = _cuts(n, horizon, n_origins)
    if not cuts:
        raise ValueError(f"Historique trop court ({n} jours) : au moins {MIN_TRAIN_DAYS + horizon} jours sont nécessaires.")
    scope = f"{len(models)} modèles" if len(models) > 1 else MODEL_NAMES[models[0]]
    tracker.step("cv", f"Validation croisée glissante : {len(cuts)} fenêtres de {horizon} jours · {scope}")

    actual = []
    preds = {k: [] for k in models}
    failed: Dict[str, str] = {}
    for fold, cut in enumerate(cuts, start=1):
        train, test = series.iloc[:cut], series.iloc[cut:cut + horizon].to_numpy()
        period = f"{series.index[cut]:%d/%m/%Y} → {series.index[min(cut + horizon, n) - 1]:%d/%m/%Y}"
        actual.extend(test)
        for key in models:
            if key in failed:
                continue
            tracker.running(f"Fenêtre {fold}/{len(cuts)} · entraînement {MODEL_NAMES[key]} sur {cut} jours…")
            try:
                yhat = fit_predict(key, train, len(test), params[key]).to_numpy()
            except Exception as e:
                failed[key] = str(e)[:200]
                logger.warning(f"Modèle {MODEL_NAMES[key]} ignoré : {failed[key]}")
                tracker.step("cv", f"{MODEL_NAMES[key]} ignoré : {failed[key]}", advance=len(cuts) - fold + 1,
                             model=key, failed=True)
                continue
            preds[key].extend(yhat)
            fold_mae = compute_eval_metrics(test, yhat)["mae"]
            tracker.step("cv", f"Fenêtre {fold}/{len(cuts)} ({period}) · {MODEL_NAMES[key]} : MAE {_n(fold_mae)}",
                         advance=1, model=key, fold=fold, folds=len(cuts), mae=fold_mae)

    if len(failed) == len(models):
        raise RuntimeError("Aucun modèle de prévision n'a pu être entraîné.")
    metrics = {}
    for key in models:
        if key in failed:
            metrics[key] = {"mae": None, "rmse": None, "r2": None, "mape": None,
                            "name": MODEL_NAMES[key], "error": failed[key]}
            continue
        m = compute_eval_metrics(actual, preds[key])
        m["name"] = MODEL_NAMES[key]
        metrics[key] = m
        r2 = "—" if m["r2"] is None else f"{m['r2']:.3f}".replace(".", ",")
        mape = "—" if m["mape"] is None else f"{m['mape']:.1f}".replace(".", ",") + " %"
        tracker.step("cv", f"{m['name']} · validation croisée ({len(cuts)} fenêtres) : MAE {_n(m['mae'])} · "
                           f"RMSE {_n(m['rmse'])} · R² {r2} · MAPE {mape}",
                     model=key, cv_mae=m["mae"], cv_rmse=m["rmse"], cv_r2=m["r2"], cv_mape=m["mape"])
    return metrics


def same_period_last_year_mae(series: pd.Series, forecast_start: pd.Timestamp, horizon: int,
                               models: List[str], params: Dict[str, dict],
                               tracker: Optional[Tracker] = None) -> Optional[dict]:
    tracker = tracker or Tracker()
    test_start = forecast_start - pd.DateOffset(years=1)
    test = series.loc[test_start:test_start + pd.Timedelta(days=horizon - 1)]
    train = series.loc[:test_start - pd.Timedelta(days=1)]
    if len(test) < horizon or len(train) < MIN_TRAIN_DAYS:
        tracker.step("n1", "Même période de l'an dernier indisponible : classement sur la validation croisée",
                     advance=len(models))
        return None
    tracker.step("n1", f"Test sur la même période l'an dernier : du {test.index[0]:%d/%m/%Y} au {test.index[-1]:%d/%m/%Y} "
                       f"(apprentissage jusqu'au {train.index[-1]:%d/%m/%Y})")
    result = {}
    for key in models:
        tracker.running(f"Même période l'an dernier · entraînement {MODEL_NAMES[key]}…")
        try:
            result[key] = compute_eval_metrics(test.to_numpy(), fit_predict(key, train, horizon, params[key]).to_numpy())["mae"]
            tracker.step("n1", f"{MODEL_NAMES[key]} : MAE {_n(result[key])} unités/jour", advance=1,
                         model=key, mae_n1=result[key])
        except Exception as e:
            logger.warning(f"Modèle {MODEL_NAMES[key]} ignoré pour la période N-1 : {str(e)[:200]}")
            result[key] = None
            tracker.step("n1", f"{MODEL_NAMES[key]} ignoré : {str(e)[:200]}", advance=1, model=key, failed=True)
    return result


def build_forecast(series: pd.Series, horizon: int, n_origins: int, models: List[str],
                   start: Optional[pd.Timestamp] = None, backtest_horizon: Optional[int] = None,
                   tuning_folds: int = 0, reference: Optional[pd.Series] = None,
                   tracker: Optional[Tracker] = None) -> dict:
    t0 = time.perf_counter()
    tracker = tracker or Tracker()
    reference = series if reference is None else reference
    bt_horizon = backtest_horizon or horizon
    first_future = series.index[-1] + pd.Timedelta(days=1)
    gap = max(0, (start - first_future).days) if start is not None else 0
    forecast_start = first_future + pd.Timedelta(days=gap)
    n_folds = len(_cuts(len(series), bt_horizon, n_origins))
    tracker.plan(n_folds * len(models) + len(models) + 1 + (len(models) if tuning_folds > 0 else 0))

    holdout_start = forecast_start - pd.DateOffset(years=1)
    tuning_series = series.loc[:holdout_start - pd.Timedelta(days=1)]
    if len(tuning_series) < MIN_TRAIN_DAYS + bt_horizon:
        tuning_series = series.iloc[:-bt_horizon]
    tuning = {}
    for key in models:
        if tuning_folds > 0:
            tracker.running(f"Réglage des hyperparamètres · {MODEL_NAMES[key]}…")
        tuning[key] = tune(key, tuning_series, bt_horizon, tuning_folds)
        if tuning_folds > 0:
            tracker.step("tuning", f"{MODEL_NAMES[key]} : hyperparamètres réglés", advance=1, model=key)
    tuned = {key: tuning[key]["params"] for key in models}
    defaults = {key: dict(MODEL_FACTORIES[key].DEFAULT_PARAMS) for key in models}

    metrics = rolling_backtest(series, bt_horizon, n_origins, models, tuned, tracker)
    last_year = same_period_last_year_mae(series, forecast_start, horizon, models, tuned, tracker)
    changed = [key for key in models if tuned[key] != defaults[key]]
    last_year_default = (same_period_last_year_mae(series, forecast_start, horizon, changed, defaults)
                         if last_year and changed else {}) or {}

    for key, m in metrics.items():
        m["mae_selection"] = last_year[key] if last_year else m["mae"]
        m["mae_default"] = last_year_default.get(key, m["mae_selection"]) if last_year else None
        m["params"] = tuned[key]
        m["default_params"] = defaults[key]
        m["tuning_criterion"] = tuning[key]["criterion"]
        m["tuning_candidates"] = tuning[key]["candidates"]
    ranked = sorted((k for k in metrics if metrics[k]["mae_selection"] is not None),
                    key=lambda k: (metrics[k]["mae_selection"], metrics[k]["mae"] or 0.0))
    for rank, key in enumerate(ranked, start=1):
        metrics[key]["rank"] = rank
    if not ranked:
        raise RuntimeError("Aucun modèle de prévision n'a pu être évalué.")
    best = ranked[0]
    criterion = "même période l'an dernier" if last_year else "validation croisée"
    if len(ranked) > 1:
        summary = f"Classement (MAE {criterion}) : " + " · ".join(
            f"{metrics[k]['rank']}. {MODEL_NAMES[k]} ({_n(metrics[k]['mae_selection'])})" for k in ranked)
    else:
        summary = f"Modèle utilisé : {MODEL_NAMES[best]} (MAE {criterion} : {_n(metrics[best]['mae_selection'])} unités/jour)"
    tracker.step("rank", summary,
                 ranking=[{"model": k, "rank": metrics[k]["rank"], "mae": metrics[k]["mae_selection"]} for k in ranked])

    tracker.running(f"Entraînement final de {MODEL_NAMES[best]} sur {len(series)} jours…")
    yhat = fit_predict(best, series, gap + horizon, tuned[best]).iloc[gap:]
    tracker.step("final", f"{MODEL_NAMES[best]} réentraîné sur tout l'historique ({len(series)} jours) : "
                          f"prévision du {yhat.index[0]:%d/%m/%Y} au {yhat.index[-1]:%d/%m/%Y} générée",
                 advance=1, model=best)
    predictions = []
    for d, value in yhat.items():
        d_last_year = d - pd.Timedelta(weeks=52)
        predictions.append({
            "date": d.strftime("%Y-%m-%d"),
            "best_quantity": round(float(value), 1),
            "real_last_year_date": d_last_year.strftime("%Y-%m-%d"),
            "real_last_year": float(reference[d_last_year]) if d_last_year in reference.index else None,
            "real": float(reference[d]) if d in reference.index else None,
        })

    return {
        "best_model": best,
        "best_model_name": MODEL_NAMES[best],
        "metrics": metrics,
        "predictions": predictions,
        "computed_in_seconds": round(time.perf_counter() - t0, 1),
    }


def build_custom_forecast(series: pd.Series, horizon: int, n_origins: int, models: List[str],
                          start: Optional[pd.Timestamp] = None, tuning_folds: int = 0) -> dict:
    n = len(series)
    if n >= MIN_TRAIN_DAYS + n_origins * horizon:
        return build_forecast(series, horizon, n_origins, models, start, tuning_folds=tuning_folds)
    bt_horizon = min(horizon, max(7, (n - MIN_TRAIN_DAYS) // 2))
    n_origins = max(1, min(n_origins, (n - MIN_TRAIN_DAYS) // bt_horizon))
    return build_forecast(series, horizon, n_origins, models, start, backtest_horizon=bt_horizon,
                          tuning_folds=tuning_folds)
