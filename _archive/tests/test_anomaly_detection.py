"""
Unit Test Suite: Prophet 95% Confidence Band Anomaly Detection (Option 1).
Validates:
1. Days outside [lower_95, upper_95] are flagged as anomalies.
2. Under-production (y < lower_95) is labeled DEFICIT_CRITIQUE.
3. Over-production (y > upper_95) is labeled SURPLUS_PIC.
4. Exactly 100% of the 68 factory zero-production days are detected as anomalies.
"""
import pytest
import numpy as np
import pandas as pd
import sys
from pathlib import Path

ML_DIR = Path(__file__).resolve().parent.parent / "ml-service"
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

from models.prophet_model import ProphetModel


def test_prophet_anomaly_detection_logic():
    dates = pd.date_range("2025-01-01", periods=100, freq="D")
    np.random.seed(42)
    base = 65000.0 + np.sin(np.arange(100) / 3.0) * 5000.0
    noise = np.random.normal(0, 1000, 100)
    values = base + noise

    # Inject one spike and one drop
    values[20] = 95000.0  # Surplus anomaly
    values[50] = 10000.0  # Deficit anomaly

    df = pd.DataFrame({"date": dates, "value": values})
    model = ProphetModel().fit(df)
    results = model.detect_anomalies(df)

    assert "is_anomaly" in results.columns
    assert "anomaly_type" in results.columns

    # Day 20 must be flagged as SURPLUS_PIC
    row_20 = results.iloc[20]
    assert row_20["is_anomaly"] is True or row_20["is_anomaly"] == 1
    assert row_20["anomaly_type"] == "SURPLUS_PIC"

    # Day 50 must be flagged as DEFICIT_CRITIQUE
    row_50 = results.iloc[50]
    assert row_50["is_anomaly"] is True or row_50["is_anomaly"] == 1
    assert row_50["anomaly_type"] == "DEFICIT_CRITIQUE"


def test_validation_on_68_zero_production_days():
    """Validates that all 68 zero-production days are flagged as critical anomalies."""
    dates = pd.date_range("2024-01-01", periods=851, freq="D")
    np.random.seed(123)
    values = np.random.normal(64890, 4500, 851)

    # Inject 68 factory shutdown days
    zero_indices = np.random.choice(851, size=68, replace=False)
    values[zero_indices] = 0.0

    df = pd.DataFrame({"date": dates, "value": values})
    model = ProphetModel().fit(df)
    res = model.detect_anomalies(df)

    zero_rows = res[res["is_zero_day"]]
    assert len(zero_rows) == 68

    detected_zero_anomalies = zero_rows["is_anomaly"].sum()
    assert detected_zero_anomalies == 68, f"Expected 68, got {detected_zero_anomalies}"

    types = zero_rows["anomaly_type"].unique()
    assert list(types) == ["DEFICIT_CRITIQUE"]
