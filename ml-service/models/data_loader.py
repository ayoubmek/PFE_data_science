import threading
from typing import Optional

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

import config

PRODUCTION_DECIMALS = 6

_engine: Optional[Engine] = None
_engine_lock = threading.Lock()


class DWHUnavailableError(RuntimeError):
    pass


def get_engine() -> Engine:
    global _engine
    with _engine_lock:
        if _engine is None:
            driver = config.DB_DRIVER.replace(" ", "+")
            base = f"/{config.DB_NAME}?driver={driver}&TrustServerCertificate=yes&encrypt=no"
            if config.DB_TRUSTED:
                url = f"mssql+pyodbc://@{config.DB_HOST}{base}&trusted_connection=yes"
            else:
                url = f"mssql+pyodbc://{config.DB_USER}:{config.DB_PASSWORD}@{config.DB_HOST}{base}"
            _engine = create_engine(url, pool_pre_ping=True)
        return _engine


def is_available() -> bool:
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


def load_production_series() -> pd.Series:
    try:
        with get_engine().connect() as conn:
            df = pd.read_sql(
                text(
                    """
                    SELECT CAST([Posting Date] AS date) AS d,
                           SUM(CAST([Quantité produite TRS] AS FLOAT)) AS trs,
                           SUM(CAST([Output Quantity] AS FLOAT)) AS output
                    FROM dbo.FACT_CLE WITH (NOLOCK)
                    WHERE [Posting Date] >= :start
                    GROUP BY CAST([Posting Date] AS date)
                    """
                ),
                conn,
                params={"start": config.ML_HISTORY_START},
            )
    except Exception as e:
        raise DWHUnavailableError(f"Lecture dbDWH impossible : {e}") from e

    df = df.assign(d=pd.to_datetime(df["d"])).set_index("d").sort_index()
    while len(df) and df["output"].iloc[-1] > 0 and df["trs"].iloc[-1] < config.ML_TRS_COMPLETENESS_RATIO * df["output"].iloc[-1]:
        df = df.iloc[:-1]
    if df.empty:
        raise DWHUnavailableError("Aucun jour de production consolidé dans dbo.FACT_CLE.")

    s = df["trs"].reindex(pd.date_range(df.index.min(), df.index.max(), freq="D"), fill_value=0.0).astype(float)
    return s.round(PRODUCTION_DECIMALS)
