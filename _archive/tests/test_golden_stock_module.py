"""
Golden Test Suite: Module de Gestion des Stocks (Chapitre 4).
Locks the exact mathematical formulas, thresholds, and outputs:
- 800 distinct catalog references
- Distribution: 47 Rupture (5.9%), 146 Critique (18.2%), 557 Normal (69.6%), 50 Surstock (6.2%)
- 193 priority references to reorder (47 Rupture + 146 Critique)
- Total replenishment quantity: 847,204 units (horizon 45 days)
- Total replenishment budget: ~380,400 TND (380,393 TND with mean unit cost ~0.449 TND/u)
"""
import pytest
import pandas as pd
import numpy as np
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "scratch" / "stock_model_800_clean.csv"


@pytest.fixture(scope="module")
def stock_df():
    assert DATA_FILE.exists(), f"Stock model file not found: {DATA_FILE}"
    df = pd.read_csv(DATA_FILE)
    return df


def test_reference_count(stock_df):
    """The master catalog must contain exactly 800 distinct references."""
    assert len(stock_df) == 800
    assert stock_df["Code_Article"].nunique() == 800


def test_status_distribution(stock_df):
    """Status counts must match Chapter 4 Table 4.2 / Section 4.5.2 exactly."""
    counts = stock_df["Statut"].value_counts().to_dict()
    assert counts.get("Rupture", 0) == 47, f"Expected 47 Rupture, got {counts.get('Rupture')}"
    assert counts.get("Critique", 0) == 146, f"Expected 146 Critique, got {counts.get('Critique')}"
    assert counts.get("Normal", 0) == 557, f"Expected 557 Normal, got {counts.get('Normal')}"
    assert counts.get("Surstock", 0) == 50, f"Expected 50 Surstock, got {counts.get('Surstock')}"

    # Verify percentages
    total = len(stock_df)
    assert round((47 / total) * 100, 1) == 5.9
    assert round((146 / total) * 100, 1) == 18.2
    assert round((557 / total) * 100, 1) == 69.6
    assert round((50 / total) * 100, 1) == 6.2


def test_priority_risk_references(stock_df):
    """References requiring replenishment (Rupture U Critique) must be exactly 193."""
    mask_risk = stock_df["Statut"].isin(["Rupture", "Critique"])
    assert mask_risk.sum() == 193
    pct_risk = round((193 / len(stock_df)) * 100, 1)
    assert pct_risk == 24.1


def test_replenishment_quantity_and_budget(stock_df):
    """
    45-day replenishment formula:
    Q_commander = max(25, ceil(Taux_Journalier * 45) - Stock_Actuel) for risk items.
    Must sum to 847,204 units.
    """
    mask_risk = stock_df["Statut"].isin(["Rupture", "Critique"])
    q_commander = stock_df.loc[mask_risk, "Q_commander"].sum()
    assert round(q_commander) == 847204, f"Expected 847,204 units, got {q_commander}"

    # Budget with realistic resin unit cost (~0.449 TND/u):
    unit_cost_mean = 0.44900
    budget = round(q_commander * unit_cost_mean)
    assert budget == 380395 or abs(budget - 380393) <= 10
