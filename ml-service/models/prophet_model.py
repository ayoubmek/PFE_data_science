import logging

import pandas as pd

from .base import Forecaster
from .calendar_features import IndustrialCalendar

HOLIDAYS_AHEAD_DAYS = 500

for _name in ("prophet", "cmdstanpy"):
    logging.getLogger(_name).setLevel(logging.WARNING)


class ProphetModel(Forecaster):
    name = "Prophet"
    DEFAULT_PARAMS = {"changepoint_prior_scale": 0.05, "seasonality_mode": "additive"}
    GRID = {"changepoint_prior_scale": [0.01, 0.05, 0.5], "seasonality_mode": ["additive", "multiplicative"]}

    def __init__(self, changepoint_prior_scale=0.05, seasonality_mode="additive"):
        self.changepoint_prior_scale = changepoint_prior_scale
        self.seasonality_mode = seasonality_mode

    def fit(self, series: pd.Series) -> "ProphetModel":
        from prophet import Prophet

        self.series = series
        holidays_df = IndustrialCalendar(series).prophet_holidays(
            series.index[0], series.index[-1] + pd.Timedelta(days=HOLIDAYS_AHEAD_DAYS)
        )
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=self.changepoint_prior_scale,
            seasonality_mode=self.seasonality_mode,
            holidays=holidays_df if len(holidays_df) else None,
            uncertainty_samples=0,
        )
        self.model.fit(pd.DataFrame({"ds": series.index, "y": series.values}))
        return self

    def predict(self, horizon: int) -> pd.Series:
        dates = self.future_index(self.series, horizon)
        yhat = self.model.predict(pd.DataFrame({"ds": dates}))["yhat"].to_numpy()
        return pd.Series(yhat, index=dates).clip(lower=0.0)
