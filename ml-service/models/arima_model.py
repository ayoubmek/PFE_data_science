import warnings

import pandas as pd

from .base import Forecaster


class ARIMAModel(Forecaster):
    name = "SARIMA"
    DEFAULT_PARAMS = {"order": (1, 0, 1), "seasonal_order": (1, 1, 1, 7)}
    GRID = {"order": [(1, 0, 0), (1, 0, 1), (2, 0, 1)], "seasonal_order": [(0, 1, 1, 7), (1, 1, 1, 7)]}
    SELECT_BY_AIC = True

    def __init__(self, order=(1, 0, 1), seasonal_order=(1, 1, 1, 7)):
        self.order = tuple(order)
        self.seasonal_order = tuple(seasonal_order)

    def fit(self, series: pd.Series) -> "ARIMAModel":
        from statsmodels.tsa.statespace.sarimax import SARIMAX

        self.series = series
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            self.result = SARIMAX(
                series.to_numpy(dtype=float),
                order=self.order,
                seasonal_order=self.seasonal_order,
                enforce_stationarity=False,
                enforce_invertibility=False,
            ).fit(disp=False)
        self.aic = float(self.result.aic)
        return self

    def predict(self, horizon: int) -> pd.Series:
        return pd.Series(self.result.forecast(horizon), index=self.future_index(self.series, horizon)).clip(lower=0.0)
