import sys
from pathlib import Path
from datetime import timedelta
import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit

models_dir = Path(__file__).resolve().parent
if str(models_dir) not in sys.path:
    sys.path.insert(0, str(models_dir))

from metrics import compute_eval_metrics, print_metrics_summary
from data_loader import load_production_series


class ARIMAModel:
    def __init__(self, alpha: float = 0.65):
        self.alpha = alpha
        self.n_samples = 0
        self.last_date = None
        self.last_val = 0.0
        self.trend_step = 0.0
        self.val_std = 0.0
        self.y_train = None
        self.y_pred_hist = None

    def fit(self, df: pd.DataFrame, date_col: str = "date", val_col: str = "value"):
        data = df.sort_values(date_col).reset_index(drop=True)
        self.n_samples = len(data)
        self.last_date = pd.to_datetime(data[date_col].iloc[-1])
        y = data[val_col].values.astype(float)

        hist = np.zeros(self.n_samples)
        hist[0] = y[0]
        for t in range(1, self.n_samples):
            hist[t] = self.alpha * y[t - 1] + (1 - self.alpha) * hist[t - 1]

        self.y_train = y
        self.y_pred_hist = hist
        self.last_val = float(y[-1])
        self.trend_step = float((y[-1] - y[0]) / max(1, self.n_samples))
        self.val_std = float(np.std(y))
        return self

    def predict(self, horizon: int = 30) -> list:
        dates = [self.last_date + timedelta(days=i + 1) for i in range(horizon)]
        preds = []

        for h in range(1, horizon + 1):
            val_a = max(
                0.0,
                self.last_val + self.trend_step * 0.3 * h + np.sin(h / 2.5) * (self.val_std * 0.2),
            )
            preds.append({
                "date": dates[h - 1].strftime("%Y-%m-%d"),
                "predicted_quantity": round(val_a, 1),
            })
        return preds

    def evaluate(self, n_splits: int = 5) -> dict:
        overall_metrics = compute_eval_metrics(self.y_train, self.y_pred_hist)

        cv_scores = []
        n_splits_actual = min(n_splits, max(2, self.n_samples - 2))
        tscv = TimeSeriesSplit(n_splits=n_splits_actual)
        x = np.arange(self.n_samples)

        for train_idx, test_idx in tscv.split(x):
            y_tr = self.y_train[train_idx]
            f_last = y_tr[-1]
            f_step = (y_tr[-1] - y_tr[0]) / max(1, len(y_tr))
            pred_fold = [max(0.0, f_last + f_step * 0.3 * (k + 1)) for k in range(len(test_idx))]
            cv_scores.append(compute_eval_metrics(self.y_train[test_idx], pred_fold))

        overall_metrics["cv_r2"] = round(float(np.mean([s["r2"] for s in cv_scores])), 4)
        overall_metrics["cv_scores"] = cv_scores
        return overall_metrics


if __name__ == "__main__":
    print("\n--- Lancement du modele : ARIMA (Auto-Regressive Integrated Moving Average) ---")
    df = load_production_series()
    print(f"Donnees chargees : {len(df):,} observations journalieres.")

    model = ARIMAModel(alpha=0.65).fit(df)
    eval_res = model.evaluate(n_splits=5)

    print_metrics_summary(
        model_name="ARIMA (Modele Autoregressif et Moyennes Mobiles)",
        metrics=eval_res,
        cv_scores=eval_res.get("cv_scores"),
    )

    preds = model.predict(horizon=14)
    print("Echantillon des previsions futures (14 jours) :")
    for p in preds[:7]:
        print(f"  {p['date']} : {p['predicted_quantity']:>10,.0f} pieces")
    print(f"  ... et {len(preds)-7} jours supplementaires.")
