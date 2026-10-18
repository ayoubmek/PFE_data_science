"""
Random Forest à prévision récursive multi-pas.

Les variables explicatives d'un jour t n'utilisent que des valeurs strictement antérieures à t
(retards 1/7/14/28, moyennes glissantes 7 et 28 jours) et le calendrier (jour de semaine, mois).
Le calendrier industriel (jour férié tunisien, fermeture d'usine récurrente) est ajouté aux variables.
En prévision, chaque valeur prédite est réinjectée comme retard pour le pas suivant.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from .base import Forecaster
from .calendar_features import IndustrialCalendar

LAGS = (1, 7, 14, 28)
FEATURE_NAMES = (["day_of_week", "month", "is_public_holiday", "is_closure"]
                 + [f"lag_{l}" for l in LAGS] + ["roll_mean_7", "roll_mean_28"])


def _features(history: np.ndarray, date: pd.Timestamp, flags: tuple) -> list:
    return (
        [date.dayofweek, date.month, flags[0], flags[1]]
        + [history[-l] for l in LAGS]
        + [float(np.mean(history[-7:])), float(np.mean(history[-28:]))]
    )


class RandomForestModel(Forecaster):
    key = "random_forest"
    name = "Random Forest (récursif)"

    def __init__(self, n_estimators: int = 200, max_depth: int = 12, random_state: int = 42):
        self.model = RandomForestRegressor(
            n_estimators=n_estimators, max_depth=max_depth, random_state=random_state, n_jobs=-1
        )
        self.series = None

    def fit(self, series: pd.Series) -> "RandomForestModel":
        self.series = series
        self.calendar = IndustrialCalendar(series)
        values = series.to_numpy(dtype=float)
        start = max(LAGS)
        if len(values) <= start + 1:
            raise ValueError(f"Random Forest : au moins {start + 2} observations sont nécessaires.")
        flags = self.calendar.flags(series.index).to_numpy()
        X = [_features(values[:t], series.index[t], flags[t]) for t in range(start, len(values))]
        self.model.fit(np.array(X), values[start:])
        return self

    def predict(self, horizon: int) -> pd.DataFrame:
        history = list(self.series.to_numpy(dtype=float))
        dates = self.future_index(self.series, horizon)
        flags = self.calendar.flags(dates).to_numpy()
        preds = []
        for i, d in enumerate(dates):
            p = max(0.0, float(self.model.predict(np.array([_features(np.array(history), d, flags[i])]))[0]))
            preds.append(p)
            history.append(p)
        return pd.DataFrame({"yhat": preds}, index=dates)

    def feature_importances(self) -> dict:
        return {n: round(float(v), 4) for n, v in zip(FEATURE_NAMES, self.model.feature_importances_)}
