"""Interface commune des modèles de prévision de la production journalière."""
import pandas as pd


class Forecaster:
    key = ""
    name = ""

    def fit(self, series: pd.Series) -> "Forecaster":
        """`series` : valeurs journalières indexées par un DatetimeIndex continu (fréquence D)."""
        raise NotImplementedError

    def predict(self, horizon: int) -> pd.DataFrame:
        """
        Retourne un DataFrame indexé par les `horizon` dates suivant la fin de l'apprentissage,
        avec la colonne `yhat` et, si le modèle les fournit nativement, `yhat_lower` / `yhat_upper` (95 %).
        """
        raise NotImplementedError

    @staticmethod
    def future_index(series: pd.Series, horizon: int) -> pd.DatetimeIndex:
        return pd.date_range(series.index[-1] + pd.Timedelta(days=1), periods=horizon, freq="D")
