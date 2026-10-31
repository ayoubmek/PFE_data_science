from typing import Optional

import numpy as np

SEASONAL_LAG = 7


def _round(x: Optional[float], nd: int) -> Optional[float]:
    return None if x is None or not np.isfinite(x) else round(float(x), nd)


def naive_scale(train) -> Optional[float]:
    y = np.asarray(train, dtype=float)
    if len(y) <= SEASONAL_LAG:
        return None
    scale = float(np.mean(np.abs(y[SEASONAL_LAG:] - y[:-SEASONAL_LAG])))
    return scale if scale > 0 else None


def compute_eval_metrics(actual, pred, scale=None) -> dict:
    actual = np.asarray(actual, dtype=float)
    pred = np.asarray(pred, dtype=float)
    err = pred - actual
    abs_err = np.abs(err)
    total = float(actual.sum())
    mase = None
    if scale is not None:
        scale = np.broadcast_to(np.asarray(scale, dtype=float), abs_err.shape)
        valid = np.isfinite(scale) & (scale > 0)
        mase = float(np.mean(abs_err[valid] / scale[valid])) if valid.any() else None
    return {
        "mae": _round(float(np.mean(abs_err)), 1),
        "rmse": _round(float(np.sqrt(np.mean(err ** 2))), 1),
        "wape": _round(float(abs_err.sum()) / total * 100, 1) if total > 0 else None,
        "mase": _round(mase, 3),
        "bias": _round(float(err.sum()) / total * 100, 1) if total > 0 else None,
    }
