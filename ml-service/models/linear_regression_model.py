"""
Régression linéaire de référence (baseline) : tendance linéaire + indicatrices jour de semaine et mois
+ calendrier industriel (jour férié tunisien, fermeture d'usine récurrente).
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from .base import Forecaster
from .calendar_features import IndustrialCalendar


def _design(t: np.ndarray, dates: pd.DatetimeIndex, calendar: IndustrialCalendar) -> np.ndarray:
    dow = np.eye(7)[np.asarray(dates.dayofweek)][:, 1:]
    month = np.eye(12)[np.asarray(dates.month) - 1][:, 1:]
    return np.column_stack([t, dow, month, calendar.flags(dates).to_numpy()])


class LinearRegressionModel(Forecaster):
    key = "linear_regression"
    name = "Régression linéaire (tendance + calendrier)"

    def __init__(self):
        self.model = LinearRegression()
        self.series = None

    def fit(self, series: pd.Series) -> "LinearRegressionModel":
        self.series = series
        self.calendar = IndustrialCalendar(series)
        t = np.arange(len(series), dtype=float)
        self.model.fit(_design(t, series.index, self.calendar), series.to_numpy(dtype=float))
        return self

    def predict(self, horizon: int) -> pd.DataFrame:
        dates = self.future_index(self.series, horizon)
        t = np.arange(len(self.series), len(self.series) + horizon, dtype=float)
        yhat = np.maximum(0.0, self.model.predict(_design(t, dates, self.calendar)))
        return pd.DataFrame({"yhat": yhat}, index=dates)
