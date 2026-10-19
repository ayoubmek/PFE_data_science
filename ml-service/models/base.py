import pandas as pd


class Forecaster:
    name = ""
    DEFAULT_PARAMS: dict = {}
    GRID: dict = {}
    SELECT_BY_AIC = False

    @staticmethod
    def future_index(series: pd.Series, horizon: int) -> pd.DatetimeIndex:
        return pd.date_range(series.index[-1] + pd.Timedelta(days=1), periods=horizon, freq="D")
