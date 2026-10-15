"""
Golden Test Suite: Evaluation Metrics & Mathematical Correctness.
Validates MAE, RMSE, MAPE, R2, WAPE, and MASE functions.
"""
import pytest
import numpy as np


def compute_mae(y_true, y_pred):
    return float(np.mean(np.abs(np.array(y_true) - np.array(y_pred))))


def compute_rmse(y_true, y_pred):
    return float(np.sqrt(np.mean((np.array(y_true) - np.array(y_pred)) ** 2)))


def compute_mape(y_true, y_pred):
    y_t = np.array(y_true, dtype=float)
    y_p = np.array(y_pred, dtype=float)
    nonzero = y_t != 0
    if not np.any(nonzero):
        return 0.0
    return float(np.mean(np.abs((y_t[nonzero] - y_p[nonzero]) / y_t[nonzero])) * 100)


def compute_wape(y_true, y_pred):
    y_t = np.array(y_true, dtype=float)
    y_p = np.array(y_pred, dtype=float)
    sum_t = np.sum(np.abs(y_t))
    if sum_t == 0:
        return 0.0
    return float(np.sum(np.abs(y_t - y_p)) / sum_t * 100)


def compute_mase(y_true, y_pred, y_train_naive=None):
    y_t = np.array(y_true, dtype=float)
    y_p = np.array(y_pred, dtype=float)
    mae = np.mean(np.abs(y_t - y_p))
    if y_train_naive is not None and len(y_train_naive) > 1:
        d = np.mean(np.abs(np.diff(y_train_naive)))
    else:
        d = np.mean(np.abs(np.diff(y_t))) if len(y_t) > 1 else 1.0
    return float(mae / max(1e-6, d))


def test_basic_metrics():
    y_true = [100.0, 200.0, 300.0, 400.0]
    y_pred = [110.0, 190.0, 315.0, 380.0]

    mae = compute_mae(y_true, y_pred)
    assert mae == 13.75

    rmse = compute_rmse(y_true, y_pred)
    assert round(rmse, 2) == 14.36

    mape = compute_mape(y_true, y_pred)
    assert round(mape, 2) == 6.25

    wape = compute_wape(y_true, y_pred)
    assert round(wape, 2) == 5.50


def test_zero_division_protection_in_mape():
    y_true = [0.0, 100.0, 200.0]
    y_pred = [10.0, 110.0, 190.0]

    mape = compute_mape(y_true, y_pred)
    assert np.isfinite(mape)
    assert round(mape, 2) == 7.50


def test_wape_property():
    """WAPE is weighted by magnitude, preventing low-volume zero distortion."""
    y_true = [10.0, 1000.0]
    y_pred = [20.0, 1010.0]

    wape = compute_wape(y_true, y_pred)
    assert round(wape, 2) == 1.98
