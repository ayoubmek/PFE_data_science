"""
Accès en lecture seule au Data Warehouse SQL Server (dbDWH).

Toutes les données consommées par le service ML proviennent d'ici. Il n'existe volontairement
aucune donnée de repli simulée : si le DWH est indisponible, une DWHUnavailableError est levée
et l'API répond 503.
"""
import logging
import threading
from typing import Optional, Tuple

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

import config

logger = logging.getLogger("ml-service.dwh")

_engine: Optional[Engine] = None
_engine_lock = threading.Lock()


PRODUCTION_DECIMALS = 6


class DWHUnavailableError(RuntimeError):
    pass


def _connection_url() -> str:
    driver = config.DB_DRIVER.replace(" ", "+")
    base = f"/{config.DB_NAME}?driver={driver}&TrustServerCertificate=yes&encrypt=no"
    if config.DB_TRUSTED:
        return f"mssql+pyodbc://@{config.DB_HOST}{base}&trusted_connection=yes"
    return f"mssql+pyodbc://{config.DB_USER}:{config.DB_PASSWORD}@{config.DB_HOST}{base}"


def get_engine() -> Engine:
    global _engine
    with _engine_lock:
        if _engine is None:
            _engine = create_engine(_connection_url(), pool_pre_ping=True)
        return _engine


def is_available() -> bool:
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.warning(f"DWH indisponible : {e}")
        return False


def read_sql(sql: str, params: Optional[dict] = None) -> pd.DataFrame:
    try:
        with get_engine().connect() as conn:
            return pd.read_sql(text(sql), conn, params=params or {})
    except Exception as e:
        raise DWHUnavailableError(f"Lecture dbDWH impossible : {e}") from e


def load_production_dataset(start: Optional[str] = None) -> Tuple[pd.Series, dict]:
    """
    Série journalière de production : somme de [Quantité produite TRS] de dbo.FACT_CLE, tous sites.
    Les jours calendaires sans déclaration (fermetures d'usine) sont présents avec la valeur 0.

    Les derniers jours dont la TRS n'est pas encore consolidée dans le DWH (TRS < ML_TRS_COMPLETENESS_RATIO
    x [Output Quantity] déclarée) sont retirés de la fin de la série : ils ne représentent pas une
    production nulle mais un chargement incomplet.
    """
    start = start or config.ML_HISTORY_START
    df = read_sql(
        """
        SELECT CAST([Posting Date] AS date) AS d,
               SUM(CAST([Quantité produite TRS] AS FLOAT)) AS trs,
               SUM(CAST([Output Quantity] AS FLOAT)) AS output
        FROM dbo.FACT_CLE WITH (NOLOCK)
        WHERE [Posting Date] >= :start
        GROUP BY CAST([Posting Date] AS date)
        """,
        {"start": start},
    )
    if df.empty:
        raise DWHUnavailableError(f"Aucune production dans dbo.FACT_CLE depuis {start}.")
    df = df.assign(d=pd.to_datetime(df["d"])).set_index("d").sort_index()

    excluded = []
    while len(df) and df["output"].iloc[-1] > 0 and df["trs"].iloc[-1] < config.ML_TRS_COMPLETENESS_RATIO * df["output"].iloc[-1]:
        excluded.append({"date": df.index[-1].strftime("%Y-%m-%d"),
                         "trs": float(df["trs"].iloc[-1]), "output_quantity": float(df["output"].iloc[-1])})
        df = df.iloc[:-1]
    if df.empty:
        raise DWHUnavailableError("Aucun jour de production consolidé dans dbo.FACT_CLE.")

    s = df["trs"].reindex(pd.date_range(df.index.min(), df.index.max(), freq="D"), fill_value=0.0).astype(float)
    # Arrondi à 6 décimales : supprime le bruit des sommes en virgule flottante (le DWH stocke au plus 3 décimales)
    # et garantit qu'un fichier exporté puis réimporté donne exactement la même série.
    s = s.round(PRODUCTION_DECIMALS)
    s.index.name = "date"
    s.name = "value"
    meta = {
        "last_posting_date": (pd.Timestamp(excluded[0]["date"]) if excluded else s.index[-1]).strftime("%Y-%m-%d"),
        "excluded_unconsolidated_days": excluded[::-1],
    }
    return s, meta


def load_production_series(start: Optional[str] = None) -> pd.Series:
    return load_production_dataset(start)[0]


def load_stock_snapshot() -> pd.DataFrame:
    """Lignes du dernier instantané de dbo.ASTOCKDATE. [Cout] est la valeur totale de la ligne (TND)."""
    df = read_sql(
        """
        SELECT s.[No_] AS reference, s.[Description] AS designation,
               ISNULL(NULLIF(LTRIM(RTRIM(s.[GroupeItem])), ''), 'Non classé') AS categorie,
               s.[Site] AS site,
               CAST(s.[Quantité] AS FLOAT) AS quantite,
               CAST(s.[Cout] AS FLOAT) AS valeur,
               s.DateStock AS date_stock
        FROM dbo.ASTOCKDATE s WITH (NOLOCK)
        WHERE s.DateStock = (SELECT MAX(DateStock) FROM dbo.ASTOCKDATE)
        """
    )
    if df.empty:
        raise DWHUnavailableError("dbo.ASTOCKDATE est vide.")
    return df
