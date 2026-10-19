from typing import Optional

import numpy as np


def _round(x: Optional[float], nd: int) -> Optional[float]:
    return None if x is None or not np.isfinite(x) else round(float(x), nd)


def seasonal_naive_scale(train, m: int = 7) -> Optional[float]:
    train = np.asarray(train, dtype=float)
    if len(train) <= m:
        return None
    scale = float(np.mean(np.abs(train[m:] - train[:-m])))
    return scale if scale > 0 else None


def compute_eval_metrics(actual, pred, mase_scale: Optional[float] = None) -> dict:
    actual = np.asarray(actual, dtype=float)
    pred = np.asarray(pred, dtype=float)
    err = actual - pred
    abs_err = np.abs(err)
    mae = float(np.mean(abs_err))
    sum_actual = float(np.sum(np.abs(actual)))
    ss_tot = float(np.sum((actual - actual.mean()) ** 2))
    return {
        "mae": _round(mae, 1),
        "rmse": _round(float(np.sqrt(np.mean(err ** 2))), 1),
        "wape": _round(float(np.sum(abs_err) / sum_actual * 100), 2) if sum_actual > 0 else None,
        "mase": _round(mae / mase_scale, 3) if mase_scale else None,
        "r2": _round(1.0 - float(np.sum(err ** 2)) / ss_tot, 4) if ss_tot > 0 else None,
    }
