"""
Métriques d'évaluation hors échantillon. Elles ne sont jamais calculées sur les données
d'apprentissage et ne sont pas bornées artificiellement (un R² négatif reste négatif).
"""
from typing import Optional

import numpy as np


def _round(x: Optional[float], nd: int) -> Optional[float]:
    return None if x is None or not np.isfinite(x) else round(float(x), nd)


def seasonal_naive_scale(train, m: int = 7) -> Optional[float]:
    """Dénominateur du MASE : MAE de la prévision naïve saisonnière (y_t = y_{t-m}) sur l'apprentissage."""
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
    rmse = float(np.sqrt(np.mean(err ** 2)))

    sum_actual = float(np.sum(np.abs(actual)))
    wape = float(np.sum(abs_err) / sum_actual * 100) if sum_actual > 0 else None

    # MAPE indéfini pour les jours à production nulle : ces jours sont exclus et leur nombre est rapporté.
    nz = actual != 0
    mape = float(np.mean(abs_err[nz] / np.abs(actual[nz])) * 100) if np.any(nz) else None

    ss_tot = float(np.sum((actual - actual.mean()) ** 2))
    r2 = 1.0 - float(np.sum(err ** 2)) / ss_tot if ss_tot > 0 else None

    mase = mae / mase_scale if mase_scale else None

    return {
        "mae": _round(mae, 1),
        "rmse": _round(rmse, 1),
        "mape": _round(mape, 2),
        "wape": _round(wape, 2),
        "mase": _round(mase, 3),
        "r2": _round(r2, 4),
        "n_obs": int(len(actual)),
        "n_zero_days_excluded_from_mape": int((~nz).sum()),
    }


def interval_coverage(actual, lower, upper) -> Optional[float]:
    actual = np.asarray(actual, dtype=float)
    lower = np.asarray(lower, dtype=float)
    upper = np.asarray(upper, dtype=float)
    if len(actual) == 0:
        return None
    return round(float(np.mean((actual >= lower) & (actual <= upper)) * 100), 2)
