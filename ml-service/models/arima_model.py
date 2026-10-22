import warnings

import pandas as pd

from .base import Forecaster


class ARIMAModel(Forecaster):
    """ARIMA(p,d,q) sans composante saisonnière ; p = 7 permet de reprendre le même jour de la semaine précédente."""

    name = "ARIMA"
    DEFAULT_PARAMS = {"order": (7, 0, 1)}
    GRID = {"order": [(7, 0, 0), (7, 0, 1), (7, 1, 1)]}
    SELECT_BY_AIC = True

    def __init__(self, order=(7, 0, 1)):
        self.order = tuple(order)

    def fit(self, series: pd.Series) -> "ARIMAModel":
        from statsmodels.tsa.arima.model import ARIMA

        self.series = series
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            self.result = ARIMA(
                series.to_numpy(dtype=float),
                order=self.order,
                trend="c" if self.order[1] == 0 else "n",
                enforce_stationarity=False,
                enforce_invertibility=False,
            ).fit()
        self.aic = float(self.result.aic)
        return self

    def predict(self, horizon: int) -> pd.Series:
        return pd.Series(self.result.forecast(horizon), index=self.future_index(self.series, horizon)).clip(lower=0.0)
