import os
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass


def _int(name: str, default: int) -> int:
    return int(os.getenv(name, str(default)))


DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "dbDWH")
DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
DB_TRUSTED = os.getenv("DB_TRUSTED", "yes").lower() in ("yes", "true", "1")
DB_USER = os.getenv("DB_USER", "")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

ML_HISTORY_START = os.getenv("ML_HISTORY_START", "2020-01-01")
ML_TRS_COMPLETENESS_RATIO = float(os.getenv("ML_TRS_COMPLETENESS_RATIO", "0.5"))
# Modèle utilisé par l'application ; "auto" compare les quatre modèles et retient le meilleur.
ML_MODEL = os.getenv("ML_MODEL", "random_forest")
ML_BACKTEST_ORIGINS = _int("ML_BACKTEST_ORIGINS", 12)
ML_TUNING_FOLDS = _int("ML_TUNING_FOLDS", 0)
ML_CACHE_TTL_SECONDS = _int("ML_CACHE_TTL_SECONDS", 3600)
ML_WARMUP_START = os.getenv("ML_WARMUP_START", "")

ML_SERVICE_HOST = os.getenv("ML_SERVICE_HOST", "127.0.0.1")
ML_SERVICE_PORT = _int("ML_SERVICE_PORT", 8000)
ML_API_KEY = os.getenv("ML_API_KEY", "")
ML_CORS_ORIGINS = [o.strip() for o in os.getenv("ML_CORS_ORIGINS", "").split(",") if o.strip()]
