import sys
from pathlib import Path
from datetime import timedelta
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import TimeSeriesSplit

models_dir = Path(__file__).resolve().parent
if str(models_dir) not in sys.path:
    sys.path.insert(0, str(models_dir))

from metrics import compute_eval_metrics, print_metrics_summary
from data_loader import load_production_series


class RandomForestModel:
    def __init__(self, n_estimators: int = 50, max_depth: int = 8, random_state: int = 42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.random_state = random_state
        self.model = RandomForestRegressor(
            n_estimators=self.n_estimators, max_depth=self.max_depth, random_state=self.random_state
        )
        self.n_samples = 0
        self.last_date = None
        self.y_train = None
        self.X_train = None
        self.y_pred_hist = None

    def _build_features(self, df: pd.DataFrame, val_col: str):
        n = len(df)
        y = df[val_col].values.astype(float)
        dates = pd.to_datetime(df["date"])

        X = []
        for t in range(n):
            dow = dates.iloc[t].dayofweek
            is_wknd = 1.0 if dow in [5, 6] else 0.0
            lag1 = y[t - 1] if t > 0 else y[0]
            lag7 = y[t - 7] if t >= 7 else y[0]
            roll7 = float(np.mean(y[max(0, t - 7):t])) if t > 0 else y[0]
            X.append([t, dow, is_wknd, lag1, lag7, roll7])

        return np.array(X), y

    def fit(self, df: pd.DataFrame, date_col: str = "date", val_col: str = "value"):
        data = df.sort_values(date_col).reset_index(drop=True)
        self.n_samples = len(data)
        self.last_date = pd.to_datetime(data[date_col].iloc[-1])

        self.X_train, self.y_train = self._build_features(data, val_col)
        self.model.fit(self.X_train, self.y_train)
        self.y_pred_hist = np.maximum(0, self.model.predict(self.X_train))
        return self

    def predict(self, horizon: int = 30) -> list:
        recent_y = list(self.y_train[-14:])
        preds = []
        dates = [self.last_date + timedelta(days=i + 1) for i in range(horizon)]

        for i, f_date in enumerate(dates):
            t_idx = self.n_samples + i
            dow = f_date.dayofweek
            is_wknd = 1.0 if dow in [5, 6] else 0.0
            lag1 = recent_y[-1]
            lag7 = recent_y[-7] if len(recent_y) >= 7 else recent_y[0]
            roll7 = float(np.mean(recent_y[-7:]))

            features = np.array([[t_idx, dow, is_wknd, lag1, lag7, roll7]])
            val_pred = max(0.0, float(self.model.predict(features)[0]))
            preds.append({"date": f_date.strftime("%Y-%m-%d"), "predicted_quantity": round(val_pred, 1)})
            recent_y.append(val_pred)

        return preds

    def evaluate(self, n_splits: int = 5) -> dict:
        overall_metrics = compute_eval_metrics(self.y_train, self.y_pred_hist)

        cv_scores = []
        n_splits_actual = min(n_splits, max(2, self.n_samples - 2))
        tscv = TimeSeriesSplit(n_splits=n_splits_actual)

        for train_idx, test_idx in tscv.split(self.X_train):
            fold_rf = RandomForestRegressor(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                random_state=self.random_state,
            )
            fold_rf.fit(self.X_train[train_idx], self.y_train[train_idx])
            pred_fold = np.maximum(0, fold_rf.predict(self.X_train[test_idx]))
            cv_scores.append(compute_eval_metrics(self.y_train[test_idx], pred_fold))

        overall_metrics["cv_r2"] = round(float(np.mean([s["r2"] for s in cv_scores])), 4)
        overall_metrics["cv_scores"] = cv_scores
        overall_metrics["feature_importances"] = {
            "t": round(float(self.model.feature_importances_[0]), 4),
            "day_of_week": round(float(self.model.feature_importances_[1]), 4),
            "is_weekend": round(float(self.model.feature_importances_[2]), 4),
            "lag_1": round(float(self.model.feature_importances_[3]), 4),
            "lag_7": round(float(self.model.feature_importances_[4]), 4),
            "rolling_mean_7": round(float(self.model.feature_importances_[5]), 4),
        }
        return overall_metrics


if __name__ == "__main__":
    print("\n--- Lancement du modele : Random Forest Regressor (Champion) ---")
    df = load_production_series()
    print(f"Donnees chargees : {len(df):,} observations journalieres.")

    model = RandomForestModel(n_estimators=50, max_depth=8).fit(df)
    eval_res = model.evaluate(n_splits=5)

    print_metrics_summary(
        model_name="Random Forest Regressor (Champion)",
        metrics=eval_res,
        cv_scores=eval_res.get("cv_scores"),
    )

    print("Importance des variables (Feature Importance) :")
    for feat, imp in eval_res["feature_importances"].items():
        print(f"  * {feat:15s} : {imp * 100:>6.2f} %")

    preds = model.predict(horizon=14)
    print("\nEchantillon des previsions futures (14 jours) :")
    for p in preds[:7]:
        print(f"  {p['date']} : {p['predicted_quantity']:>10,.0f} pieces")
    print(f"  ... et {len(preds)-7} jours supplementaires.")
