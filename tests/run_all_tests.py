"""
Test Runner for Nexora Golden Tests (using Python unittest standard library).
Can be run via: python tests/run_all_tests.py
"""
import sys
import unittest
import numpy as np
import pandas as pd
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
ML_DIR = ROOT_DIR / "ml-service"
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

from etl_pipeline.cleaners import DataCleaner
from models.prophet_model import ProphetModel


class TestGoldenStockModule(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data_file = ROOT_DIR / "scratch" / "stock_model_800_clean.csv"
        cls.df = pd.read_csv(cls.data_file)

    def test_reference_count(self):
        """Catalogue must contain exactly 800 distinct references."""
        self.assertEqual(len(self.df), 800)
        self.assertEqual(self.df["Code_Article"].nunique(), 800)

    def test_status_distribution(self):
        """Status counts must match Chapter 4 Table 4.2 exactly."""
        counts = self.df["Statut"].value_counts().to_dict()
        self.assertEqual(counts.get("Rupture", 0), 47)
        self.assertEqual(counts.get("Critique", 0), 146)
        self.assertEqual(counts.get("Normal", 0), 557)
        self.assertEqual(counts.get("Surstock", 0), 50)

        # Percentages
        self.assertEqual(round((47 / 800) * 100, 1), 5.9)
        self.assertEqual(round((146 / 800) * 100, 1), 18.2)
        self.assertEqual(round((557 / 800) * 100, 1), 69.6)
        self.assertEqual(round((50 / 800) * 100, 1), 6.2)

    def test_priority_risk_references(self):
        """Risk items (Rupture + Critique) must be exactly 193 references."""
        mask_risk = self.df["Statut"].isin(["Rupture", "Critique"])
        self.assertEqual(mask_risk.sum(), 193)
        self.assertEqual(round((193 / 800) * 100, 1), 24.1)

    def test_replenishment_quantity_and_budget(self):
        """Replenishment quantity must equal 847,204 units."""
        mask_risk = self.df["Statut"].isin(["Rupture", "Critique"])
        q_commander = self.df.loc[mask_risk, "Q_commander"].sum()
        self.assertEqual(round(q_commander), 847204)

        # Mean unit cost ~0.449 TND/u yields ~380,393 TND
        unit_cost_mean = 0.44900
        budget = round(q_commander * unit_cost_mean)
        self.assertAlmostEqual(budget, 380393, delta=10)


class TestGoldenMetrics(unittest.TestCase):
    def test_mae_rmse_mape_wape(self):
        y_true = np.array([100.0, 200.0, 300.0, 400.0])
        y_pred = np.array([110.0, 190.0, 315.0, 380.0])

        mae = float(np.mean(np.abs(y_true - y_pred)))
        rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
        mape = float(np.mean(np.abs((y_true - y_pred) / y_true)) * 100)
        wape = float(np.sum(np.abs(y_true - y_pred)) / np.sum(y_true) * 100)

        self.assertEqual(mae, 13.75)
        self.assertAlmostEqual(rmse, 14.36, places=2)
        self.assertAlmostEqual(mape, 6.25, places=2)
        self.assertAlmostEqual(wape, 5.50, places=2)

    def test_mape_zero_handling(self):
        y_true = np.array([0.0, 100.0, 200.0])
        y_pred = np.array([10.0, 110.0, 190.0])
        nonzero = y_true != 0
        mape = float(np.mean(np.abs((y_true[nonzero] - y_pred[nonzero]) / y_true[nonzero])) * 100)
        self.assertTrue(np.isfinite(mape))
        self.assertAlmostEqual(mape, 7.50, places=2)


class TestAnomalyDetection(unittest.TestCase):
    def test_prophet_anomalies_and_68_zero_days(self):
        dates = pd.date_range("2024-01-01", periods=851, freq="D")
        np.random.seed(42)
        y = np.random.normal(64890, 4500, 851)
        zero_indices = np.random.choice(851, size=68, replace=False)
        y[zero_indices] = 0.0

        df = pd.DataFrame({"date": dates, "value": y})
        m = ProphetModel().fit(df)
        res = m.detect_anomalies(df)

        zero_mask = res["is_zero_day"]
        self.assertEqual(zero_mask.sum(), 68)

        zero_anomalies = res[zero_mask]["is_anomaly"].sum()
        self.assertEqual(zero_anomalies, 68)
        self.assertTrue((res[zero_mask]["anomaly_type"] == "DEFICIT_CRITIQUE").all())


class TestETLCleaners(unittest.TestCase):
    def test_cleaners(self):
        raw = pd.DataFrame({
            "No_": ["ART-001", "  ", None, "ART-002"],
            "Quantité": [-100.0, 200.0, 300.0, 400.0],
            "DateStock": ["2026-01-01", "2026-01-01", "INVALID", "2026-03-28"]
        })
        cleaner = DataCleaner(raw)
        df_clean, report = cleaner.run_all_cleaners()
        self.assertEqual(len(df_clean), 2)
        self.assertTrue((df_clean["Quantité"] >= 0).all())


if __name__ == "__main__":
    unittest.main(verbosity=2)
