from typing import Optional

import numpy as np


def _round(x: Optional[float], nd: int) -> Optional[float]:
    return None if x is None or not np.isfinite(x) else round(float(x), nd)


def compute_eval_metrics(actual, pred) -> dict:
    actual = np.asarray(actual, dtype=float)
    pred = np.asarray(pred, dtype=float)
    err = actual - pred
    abs_err = np.abs(err)
    mae = float(np.mean(abs_err))
    ss_tot = float(np.sum((actual - actual.mean()) ** 2))
    # MAPE calculée sur les jours produits : un jour de fermeture (production nulle) n'a pas d'erreur relative.
    produced = actual > 0
    mape = float(np.mean(abs_err[produced] / actual[produced]) * 100) if produced.any() else None
    return {
        "mae": _round(mae, 1),
        "rmse": _round(float(np.sqrt(np.mean(err ** 2))), 1),
        "r2": _round(1.0 - float(np.sum(err ** 2)) / ss_tot, 4) if ss_tot > 0 else None,
        "mape": _round(mape, 1),
    }
