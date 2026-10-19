import hashlib
import itertools
import time
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

from .arima_model import ARIMAModel
from .calendar_features import learn_recurring_closures
from .linear_regression_model import LinearRegressionModel
from .metrics import compute_eval_metrics, seasonal_naive_scale
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

_tuning_cache: Dict[tuple, dict] = {}


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


def cv_wape(key: str, series: pd.Series, horizon: int, n_folds: int, params: dict) -> Optional[float]:
    actual, pred = [], []
    for cut in _cuts(len(series), horizon, n_folds):
        test = series.iloc[cut:cut + horizon].to_numpy()
        actual.extend(test)
        pred.extend(fit_predict(key, series.iloc[:cut], len(test), params).to_numpy())
    return compute_eval_metrics(actual, pred)["wape"]


def tune(key: str, series: pd.Series, horizon: int, n_folds: int) -> dict:
    factory = MODEL_FACTORIES[key]
    if not factory.GRID or n_folds < 1 or not _cuts(len(series), horizon, n_folds):
        return {"params": dict(factory.DEFAULT_PARAMS), "criterion": None, "candidates": []}

    digest = hashlib.sha1(pd.util.hash_pandas_object(series, index=True).to_numpy().tobytes()).hexdigest()
    cache_key = (key, horizon, n_folds, digest)
    if cache_key in _tuning_cache:
        return _tuning_cache[cache_key]

    criterion = "aic" if factory.SELECT_BY_AIC else "wape_cv"
    candidates = []
    for values in itertools.product(*factory.GRID.values()):
        params = dict(zip(factory.GRID, values))
        try:
            if factory.SELECT_BY_AIC:
                score = round(factory(**params).fit(clean_training_series(series)).aic, 1)
            else:
                score = cv_wape(key, series, horizon, n_folds, params)
        except Exception:
            score = None
        candidates.append({"params": params, "score": score})

    scored = [c for c in candidates if c["score"] is not None]
    best = min(scored, key=lambda c: c["score"])["params"] if scored else dict(factory.DEFAULT_PARAMS)
    result = {"params": best, "criterion": criterion, "candidates": candidates}
    _tuning_cache[cache_key] = result
    return result


def rolling_backtest(series: pd.Series, horizon: int, n_origins: int, models: List[str],
                     params: Dict[str, dict]) -> dict:
    n = len(series)
    cuts = _cuts(n, horizon, n_origins)
    if not cuts:
        raise ValueError(f"Historique trop court ({n} jours) : au moins {MIN_TRAIN_DAYS + horizon} jours sont nécessaires.")

    actual = []
    preds = {k: [] for k in models}
    mase = {k: [] for k in models}
    for cut in cuts:
        train, test = series.iloc[:cut], series.iloc[cut:cut + horizon].to_numpy()
        scale = seasonal_naive_scale(train.to_numpy())
        actual.extend(test)
        for key in models:
            yhat = fit_predict(key, train, len(test), params[key]).to_numpy()
            preds[key].extend(yhat)
            fold_mase = compute_eval_metrics(test, yhat, scale)["mase"]
            if fold_mase is not None:
                mase[key].append(fold_mase)

    metrics = {}
    for key in models:
        m = compute_eval_metrics(actual, preds[key])
        m["mase"] = round(float(np.mean(mase[key])), 3) if mase[key] else None
        m["name"] = MODEL_NAMES[key]
        metrics[key] = m
    return metrics


def same_period_last_year_wape(series: pd.Series, forecast_start: pd.Timestamp, horizon: int,
                               models: List[str], params: Dict[str, dict]) -> Optional[dict]:
    test_start = forecast_start - pd.DateOffset(years=1)
    test = series.loc[test_start:test_start + pd.Timedelta(days=horizon - 1)]
    train = series.loc[:test_start - pd.Timedelta(days=1)]
    if len(test) < horizon or len(train) < MIN_TRAIN_DAYS:
        return None
    return {key: compute_eval_metrics(test.to_numpy(), fit_predict(key, train, horizon, params[key]).to_numpy())["wape"]
            for key in models}


def build_forecast(series: pd.Series, horizon: int, n_origins: int, models: List[str],
                   start: Optional[pd.Timestamp] = None, backtest_horizon: Optional[int] = None,
                   tuning_folds: int = 0) -> dict:
    t0 = time.perf_counter()
    bt_horizon = backtest_horizon or horizon
    first_future = series.index[-1] + pd.Timedelta(days=1)
    gap = max(0, (start - first_future).days) if start is not None else 0
    forecast_start = first_future + pd.Timedelta(days=gap)

    holdout_start = forecast_start - pd.DateOffset(years=1)
    tuning_series = series.loc[:holdout_start - pd.Timedelta(days=1)]
    if len(tuning_series) < MIN_TRAIN_DAYS + bt_horizon:
        tuning_series = series.iloc[:-bt_horizon]
    tuning = {key: tune(key, tuning_series, bt_horizon, tuning_folds) for key in models}
    tuned = {key: tuning[key]["params"] for key in models}
    defaults = {key: dict(MODEL_FACTORIES[key].DEFAULT_PARAMS) for key in models}

    metrics = rolling_backtest(series, bt_horizon, n_origins, models, tuned)
    last_year = same_period_last_year_wape(series, forecast_start, horizon, models, tuned)
    changed = [key for key in models if tuned[key] != defaults[key]]
    last_year_default = (same_period_last_year_wape(series, forecast_start, horizon, changed, defaults)
                         if last_year and changed else {}) or {}

    for key, m in metrics.items():
        m["wape_selection"] = last_year[key] if last_year else m["wape"]
        m["wape_default"] = last_year_default.get(key, m["wape_selection"]) if last_year else None
        m["params"] = tuned[key]
        m["default_params"] = defaults[key]
        m["tuning_criterion"] = tuning[key]["criterion"]
        m["tuning_candidates"] = tuning[key]["candidates"]
    ranked = sorted((k for k in metrics if metrics[k]["wape_selection"] is not None),
                    key=lambda k: (metrics[k]["wape_selection"], metrics[k]["wape"] or 0.0))
    for rank, key in enumerate(ranked, start=1):
        metrics[key]["rank"] = rank
    best = ranked[0] if ranked else models[0]

    yhat = fit_predict(best, series, gap + horizon, tuned[best]).iloc[gap:]
    predictions = []
    for d, value in yhat.items():
        d_last_year = d - pd.Timedelta(weeks=52)
        predictions.append({
            "date": d.strftime("%Y-%m-%d"),
            "best_quantity": round(float(value), 1),
            "real_last_year_date": d_last_year.strftime("%Y-%m-%d"),
            "real_last_year": float(series[d_last_year]) if d_last_year in series.index else None,
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
