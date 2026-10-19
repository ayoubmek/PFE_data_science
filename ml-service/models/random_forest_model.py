import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from .base import Forecaster
from .calendar_features import IndustrialCalendar

LAGS = (1, 7, 14, 28)


def _features(history: np.ndarray, date: pd.Timestamp, flags) -> list:
    return (
        [date.dayofweek, date.month, flags[0], flags[1]]
        + [history[-l] for l in LAGS]
        + [float(np.mean(history[-7:])), float(np.mean(history[-28:]))]
    )


class RandomForestModel(Forecaster):
    name = "Random Forest (récursif)"
    DEFAULT_PARAMS = {"n_estimators": 200, "max_depth": 12, "min_samples_leaf": 1}
    GRID = {"n_estimators": [100, 200], "max_depth": [6, 12, None], "min_samples_leaf": [1, 5]}

    def __init__(self, n_estimators=200, max_depth=12, min_samples_leaf=1):
        self.model = RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth,
                                           min_samples_leaf=min_samples_leaf, random_state=42, n_jobs=-1)

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

    def predict(self, horizon: int) -> pd.Series:
        history = list(self.series.to_numpy(dtype=float))
        dates = self.future_index(self.series, horizon)
        flags = self.calendar.flags(dates).to_numpy()
        preds = []
        for i, d in enumerate(dates):
            p = max(0.0, float(self.model.predict(np.array([_features(np.array(history), d, flags[i])]))[0]))
            preds.append(p)
            history.append(p)
        return pd.Series(preds, index=dates)
