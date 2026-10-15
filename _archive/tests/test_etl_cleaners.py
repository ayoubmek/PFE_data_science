"""
Unit Test Suite: ETL Data Quality Cleaners.
Validates the 10 cleaning steps of DataCleaner.
"""
import pytest
import pandas as pd
import numpy as np
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from etl_pipeline.cleaners import DataCleaner


def test_clean_item_ids():
    raw_data = pd.DataFrame({
        "No_": ["ART-001", "  ", None, "ART-002", ""],
        "Quantité": [10, 20, 30, 40, 50]
    })
    cleaner = DataCleaner(raw_data)
    cleaner.clean_item_ids()
    assert len(cleaner.df) == 2
    assert list(cleaner.df["No_"]) == ["ART-001", "ART-002"]


def test_deduplicate():
    raw_data = pd.DataFrame({
        "DateStock": ["2026-01-01", "2026-01-01", "2026-01-02"],
        "No_": ["ART-001", "ART-001", "ART-001"],
        "Site": ["DEPOT A", "DEPOT A", "DEPOT A"],
        "Quantité": [100, 100, 200]
    })
    cleaner = DataCleaner(raw_data)
    cleaner.deduplicate()
    assert len(cleaner.df) == 2


def test_resolve_negative_stocks():
    raw_data = pd.DataFrame({
        "No_": ["ART-001", "ART-002"],
        "Quantité": [-150.0, 300.0]
    })
    cleaner = DataCleaner(raw_data)
    cleaner.resolve_negative_stocks()
    assert (cleaner.df["Quantité"] >= 0).all()
    assert cleaner.df.loc[cleaner.df["No_"] == "ART-001", "Quantité"].iloc[0] == 150.0


def test_harmonize_dates():
    raw_data = pd.DataFrame({
        "No_": ["A1", "A2", "A3"],
        "DateStock": ["15/01/2025", "2026-03-28", "INVALID_DATE"]
    })
    cleaner = DataCleaner(raw_data)
    cleaner.harmonize_dates()
    assert len(cleaner.df) == 2
    assert "2025-01-15" in cleaner.df["DateStock"].values
    assert "2026-03-28" in cleaner.df["DateStock"].values
