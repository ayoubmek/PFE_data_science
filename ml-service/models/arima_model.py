"""
ARIMA saisonnier (SARIMA) de statsmodels : ordre (1,0,1) x (1,1,1) de période 7.
La différenciation saisonnière hebdomadaire absorbe le cycle jours ouvrés / week-end.
L'intervalle à 95 % est l'intervalle de prévision analytique du modèle d'état.
"""
import warnings

import pandas as pd

from .base import Forecaster


class ARIMAModel(Forecaster):
    key = "arima"
    name = "SARIMA (1,0,1)x(1,1,1)7"

    def __init__(self, order=(1, 0, 1), seasonal_order=(1, 1, 1, 7)):
        self.order = order
        self.seasonal_order = seasonal_order
        self.result = None
        self.series = None

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
        return self

    def predict(self, horizon: int) -> pd.DataFrame:
        fc = self.result.get_forecast(horizon)
        ci = fc.conf_int(alpha=0.05)
        out = pd.DataFrame(
            {"yhat": fc.predicted_mean, "yhat_lower": ci[:, 0], "yhat_upper": ci[:, 1]},
            index=self.future_index(self.series, horizon),
        )
        return out.clip(lower=0.0)
