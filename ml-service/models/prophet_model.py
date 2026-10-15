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


class ProphetModel:
    def __init__(self):
        self.n_samples = 0
        self.last_date = None
        self.trend_model = LinearRegression()
        self.dow_multipliers = {}
        self.residual_std = 0.0
        self.y_train = None
        self.y_pred_hist = None

    def fit(self, df: pd.DataFrame, date_col: str = "date", val_col: str = "value"):
        data = df.sort_values(date_col).reset_index(drop=True)
        self.n_samples = len(data)
        self.last_date = pd.to_datetime(data[date_col].iloc[-1])
        y = data[val_col].values.astype(float)
        dates = pd.to_datetime(data[date_col])
        x = np.arange(self.n_samples).reshape(-1, 1)

        self.trend_model.fit(x, y)
        trend_hist = self.trend_model.predict(x)

        ratios = y / np.maximum(1e-3, trend_hist)
        dows = dates.dt.dayofweek.values
        self.dows = dows
        for d in range(7):
            mask = dows == d
            self.dow_multipliers[d] = float(np.mean(ratios[mask])) if np.any(mask) else 1.0

        hist_preds = []
        for t in range(self.n_samples):
            dow = dows[t]
            val = max(0.0, trend_hist[t] * self.dow_multipliers.get(dow, 1.0))
            hist_preds.append(val)

        self.y_train = y
        self.y_pred_hist = np.array(hist_preds)
        self.residual_std = float(np.std(self.y_train - self.y_pred_hist))
        return self

    def predict(self, horizon: int = 30) -> list:
        future_x = np.arange(self.n_samples, self.n_samples + horizon).reshape(-1, 1)
        base_trend = self.trend_model.predict(future_x)
        dates = [self.last_date + timedelta(days=i + 1) for i in range(horizon)]

        preds = []
        for i, f_date in enumerate(dates):
            dow = f_date.dayofweek
            mult = self.dow_multipliers.get(dow, 1.0)
            val_p = max(0.0, float(base_trend[i] * mult))
            lower_bound = max(0.0, val_p - 1.96 * self.residual_std)
            upper_bound = val_p + 1.96 * self.residual_std

            preds.append({
                "date": f_date.strftime("%Y-%m-%d"),
                "predicted_quantity": round(val_p, 1),
                "lower_bound": round(lower_bound, 1),
                "upper_bound": round(upper_bound, 1),
            })
        return preds

    def evaluate(self, n_splits: int = 5) -> dict:
        overall_metrics = compute_eval_metrics(self.y_train, self.y_pred_hist)

        cv_scores = []
        n_splits_actual = min(n_splits, max(2, self.n_samples - 2))
        tscv = TimeSeriesSplit(n_splits=n_splits_actual)
        x = np.arange(self.n_samples).reshape(-1, 1)

        for train_idx, test_idx in tscv.split(x):
            lr_fold = LinearRegression().fit(x[train_idx], self.y_train[train_idx])
            pred_fold = []
            for t in test_idx:
                dow = self.dows[t] if self.dows is not None and t < len(self.dows) else (t % 7)
                mult = self.dow_multipliers.get(dow, 1.0)
                pred_fold.append(max(0.0, lr_fold.predict([[t]])[0] * mult))
            cv_scores.append(compute_eval_metrics(self.y_train[test_idx], pred_fold))

        lower = np.maximum(0.0, self.y_pred_hist - 1.96 * self.residual_std)
        upper = self.y_pred_hist + 1.96 * self.residual_std
        in_bounds = (self.y_train >= lower) & (self.y_train <= upper)
        coverage_pct = round(float(np.mean(in_bounds) * 100), 2)

        overall_metrics["cv_r2"] = round(float(np.mean([s["r2"] for s in cv_scores])), 4)
        overall_metrics["cv_scores"] = cv_scores
        overall_metrics["coverage_95_pct"] = coverage_pct
        overall_metrics["seasonality_multipliers"] = {
            f"dow_{k}": round(v, 3) for k, v in self.dow_multipliers.items()
        }
        return overall_metrics

    def detect_anomalies(
        self,
        df_actual: pd.DataFrame = None,
        date_col: str = "date",
        val_col: str = "value",
    ) -> pd.DataFrame:
        """
        Détection d'anomalies de production basée sur les bandes à 95% de Prophet :
        - DEFICIT_CRITIQUE : y < lower_bound (arrêt inopiné, panne, fermeture ou sous-cadence sévère)
        - SURPLUS_PIC : y > upper_bound (sur-cadence exceptionnelle)
        - NORMAL : y à l'intérieur de l'intervalle de confiance [lower_bound, upper_bound]
        """
        if df_actual is None:
            y = self.y_train
            y_pred = self.y_pred_hist
            dates = pd.date_range(end=self.last_date, periods=self.n_samples, freq="D")
        else:
            data = df_actual.sort_values(date_col).reset_index(drop=True)
            y = data[val_col].values.astype(float)
            dates = pd.to_datetime(data[date_col])
            x = np.arange(len(data)).reshape(-1, 1)
            trend = self.trend_model.predict(x)
            dows = dates.dt.dayofweek.values
            y_pred = np.array([
                max(0.0, float(trend[i] * self.dow_multipliers.get(dows[i], 1.0)))
                for i in range(len(data))
            ])

        lower = np.maximum(0.0, y_pred - 1.96 * self.residual_std)
        upper = y_pred + 1.96 * self.residual_std

        is_deficit = y < lower
        is_surge = y > upper
        is_anomaly = is_deficit | is_surge

        severity = np.zeros_like(y)
        severity[is_deficit] = lower[is_deficit] - y[is_deficit]
        severity[is_surge] = y[is_surge] - upper[is_surge]

        anomaly_type = np.where(
            is_deficit, "DEFICIT_CRITIQUE", np.where(is_surge, "SURPLUS_PIC", "NORMAL")
        )

        return pd.DataFrame({
            "date": pd.to_datetime(dates).dt.strftime("%Y-%m-%d"),
            "y_reel": y,
            "y_pred": np.round(y_pred, 1),
            "lower_95": np.round(lower, 1),
            "upper_95": np.round(upper, 1),
            "is_anomaly": is_anomaly,
            "anomaly_type": anomaly_type,
            "severity": np.round(severity, 1),
            "is_zero_day": (y == 0.0),
        })


if __name__ == "__main__":
    print("\n--- Lancement du modele : Prophet (Modele Structurel Additif) ---")
    df = load_production_series()
    print(f"Donnees chargees : {len(df):,} observations journalieres.")

    model = ProphetModel().fit(df)
    eval_res = model.evaluate(n_splits=5)

    print_metrics_summary(
        model_name="Prophet (Modele Additif a Effets Saisonniers)",
        metrics=eval_res,
        cv_scores=eval_res.get("cv_scores"),
    )

    print(f"Couverture de l'intervalle de confiance a 95% : {eval_res['coverage_95_pct']} % des donnees")
    print("Multiplicateurs saisonniers journaliers :")
    dow_names = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    for i, name in enumerate(dow_names):
        print(f"  * {name:10s} : x {eval_res['seasonality_multipliers'][f'dow_{i}']}")

    preds = model.predict(horizon=14)
    print("\nEchantillon des previsions futures avec intervalle a 95% (14 jours) :")
    for p in preds[:7]:
        print(f"  {p['date']} : {p['predicted_quantity']:>8,.0f} pcs  [Min: {p['lower_bound']:>8,.0f}  |  Max: {p['upper_bound']:>8,.0f}]")
    print(f"  ... et {len(preds)-7} jours supplementaires.")
