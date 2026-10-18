"""
Prophet (Meta) : modèle additif tendance + saisonnalités hebdomadaire et annuelle + effets calendaires
(jours fériés tunisiens et fermetures d'usine récurrentes, cf. calendar_features).
L'intervalle à 95 % est l'intervalle d'incertitude natif de Prophet (interval_width=0.95).
"""
import logging

import numpy as np
import pandas as pd

from .base import Forecaster
from .calendar_features import IndustrialCalendar

# Les jours fériés sont générés jusqu'à cette distance après l'historique (prévisions lointaines).
HOLIDAYS_AHEAD_DAYS = 500

for _name in ("prophet", "cmdstanpy"):
    logging.getLogger(_name).setLevel(logging.WARNING)


class ProphetModel(Forecaster):
    key = "prophet"
    name = "Prophet"

    def __init__(self, interval_width: float = 0.95):
        self.interval_width = interval_width
        self.model = None
        self.series = None

    def _new_model(self, holidays_df: pd.DataFrame):
        from prophet import Prophet

        return Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            holidays=holidays_df if len(holidays_df) else None,
            interval_width=self.interval_width,
        )

    def fit(self, series: pd.Series) -> "ProphetModel":
        self.series = series
        calendar = IndustrialCalendar(series)
        holidays_df = calendar.prophet_holidays(
            series.index[0], series.index[-1] + pd.Timedelta(days=HOLIDAYS_AHEAD_DAYS)
        )
        self.model = self._new_model(holidays_df)
        self.model.fit(pd.DataFrame({"ds": series.index, "y": series.values}))
        return self

    def _forecast(self, dates: pd.DatetimeIndex) -> pd.DataFrame:
        fc = self.model.predict(pd.DataFrame({"ds": dates}))
        out = pd.DataFrame(
            {
                "yhat": fc["yhat"].to_numpy(),
                "yhat_lower": fc["yhat_lower"].to_numpy(),
                "yhat_upper": fc["yhat_upper"].to_numpy(),
            },
            index=dates,
        )
        return out.clip(lower=0.0)

    def predict(self, horizon: int) -> pd.DataFrame:
        return self._forecast(self.future_index(self.series, horizon))

    def detect_anomalies(self) -> pd.DataFrame:
        """
        Détection d'anomalies sur l'historique d'apprentissage :
        DEFICIT_CRITIQUE si y < borne basse à 95 %, SURPLUS_PIC si y > borne haute, sinon NORMAL.
        """
        fit = self._forecast(self.series.index)
        y = self.series.to_numpy()
        lower = fit["yhat_lower"].to_numpy()
        upper = fit["yhat_upper"].to_numpy()
        is_deficit = y < lower
        is_surge = y > upper
        severity = np.where(is_deficit, lower - y, np.where(is_surge, y - upper, 0.0))
        return pd.DataFrame(
            {
                "date": self.series.index.strftime("%Y-%m-%d"),
                "y_reel": y,
                "y_pred": fit["yhat"].round(1).to_numpy(),
                "lower_95": fit["yhat_lower"].round(1).to_numpy(),
                "upper_95": fit["yhat_upper"].round(1).to_numpy(),
                "is_anomaly": is_deficit | is_surge,
                "anomaly_type": np.where(is_deficit, "DEFICIT_CRITIQUE", np.where(is_surge, "SURPLUS_PIC", "NORMAL")),
                "severity": np.round(severity, 1),
                "is_zero_day": y == 0.0,
            }
        )
