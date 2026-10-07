import sys
from pathlib import Path
from datetime import timedelta
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import TimeSeriesSplit

models_dir = Path(__file__).resolve().parent
if str(models_dir) not in sys.path:
    sys.path.insert(0, str(models_dir))

from metrics import compute_eval_metrics, print_metrics_summary
from data_loader import load_production_series


class LinearRegressionModel:
    def __init__(self):
        self.model = LinearRegression()
        self.n_samples = 0
        self.last_date = None
        self.y_train = None
        self.y_pred_hist = None

    def fit(self, df: pd.DataFrame, date_col: str = "date", val_col: str = "value"):
        data = df.sort_values(date_col).reset_index(drop=True)
        self.n_samples = len(data)
        self.last_date = pd.to_datetime(data[date_col].iloc[-1])
        y = data[val_col].values.astype(float)
        x = np.arange(self.n_samples).reshape(-1, 1)

        self.model.fit(x, y)
        self.y_train = y
        self.y_pred_hist = np.maximum(0, self.model.predict(x))
        return self

    def predict(self, horizon: int = 30) -> list:
        future_x = np.arange(self.n_samples, self.n_samples + horizon).reshape(-1, 1)
        preds = np.maximum(0, self.model.predict(future_x))
        dates = [self.last_date + timedelta(days=i + 1) for i in range(horizon)]

        return [
            {"date": d.strftime("%Y-%m-%d"), "predicted_quantity": round(float(p), 1)}
            for d, p in zip(dates, preds)
        ]

    def evaluate(self, n_splits: int = 5) -> dict:
        overall_metrics = compute_eval_metrics(self.y_train, self.y_pred_hist)

        cv_scores = []
        n_splits_actual = min(n_splits, max(2, self.n_samples - 2))
        tscv = TimeSeriesSplit(n_splits=n_splits_actual)
        x = np.arange(self.n_samples).reshape(-1, 1)

        for train_idx, test_idx in tscv.split(x):
            fold_lr = LinearRegression().fit(x[train_idx], self.y_train[train_idx])
            pred_fold = np.maximum(0, fold_lr.predict(x[test_idx]))
            cv_scores.append(compute_eval_metrics(self.y_train[test_idx], pred_fold))

        overall_metrics["cv_r2"] = round(float(np.mean([s["r2"] for s in cv_scores])), 4)
        overall_metrics["cv_scores"] = cv_scores
        return overall_metrics


if __name__ == "__main__":
    print("\n--- Lancement du modele : Regression Lineaire (Baseline) ---")
    df = load_production_series()
    print(f"Donnees chargees : {len(df):,} observations journalieres.")

    model = LinearRegressionModel().fit(df)
    eval_res = model.evaluate(n_splits=5)

    print_metrics_summary(
        model_name="Regression Lineaire (Baseline)",
        metrics=eval_res,
        cv_scores=eval_res.get("cv_scores"),
    )

    preds = model.predict(horizon=14)
    print("Echantillon des previsions futures (14 jours) :")
    for p in preds[:7]:
        print(f"  {p['date']} : {p['predicted_quantity']:>10,.0f} pieces")
    print(f"  ... et {len(preds)-7} jours supplementaires.")
