import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from .base import Forecaster


class LinearRegressionModel(Forecaster):
    """Régression linéaire simple : la production est expliquée par le temps seul (y = a + b·t)."""

    name = "Régression linéaire simple"

    def __init__(self):
        self.model = LinearRegression()

    def fit(self, series: pd.Series) -> "LinearRegressionModel":
        self.series = series
        t = np.arange(len(series), dtype=float).reshape(-1, 1)
        self.model.fit(t, series.to_numpy(dtype=float))
        return self

    def predict(self, horizon: int) -> pd.Series:
        dates = self.future_index(self.series, horizon)
        t = np.arange(len(self.series), len(self.series) + horizon, dtype=float).reshape(-1, 1)
        return pd.Series(np.maximum(0.0, self.model.predict(t)), index=dates)
