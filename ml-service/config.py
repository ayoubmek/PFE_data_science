"""
Configuration du service ML, lue exclusivement depuis l'environnement (ou le fichier .env
à la racine du dépôt). Aucune donnée métier n'est définie ici : uniquement des paramètres.
"""
import os
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass


def _int(name: str, default: int) -> int:
    return int(os.getenv(name, str(default)))


# --- Connexion au Data Warehouse SQL Server (dbDWH) ---
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "dbDWH")
DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
DB_TRUSTED = os.getenv("DB_TRUSTED", "yes").lower() in ("yes", "true", "1")
DB_USER = os.getenv("DB_USER", "")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

# --- Série de production utilisée pour l'apprentissage ---
# Début de l'historique d'apprentissage (la fin est toujours la dernière date de dbo.FACT_CLE).
ML_HISTORY_START = os.getenv("ML_HISTORY_START", "2024-01-01")
# Un jour en fin de série est considéré non consolidé si sa TRS est inférieure à ce ratio de l'Output déclaré.
ML_TRS_COMPLETENESS_RATIO = float(os.getenv("ML_TRS_COMPLETENESS_RATIO", "0.5"))

# --- Modèle utilisé par l'application ---
# Choisi à partir de l'étude comparative des 4 modèles sur 12 mois de tests (python ml-service/evaluate_dwh.py) :
# Prophet obtient le WAPE le plus faible. Valeurs possibles : prophet, random_forest, arima, linear_regression.
ML_MODEL = os.getenv("ML_MODEL", "prophet")

# --- Protocole d'évaluation (backtest rolling-origin, sans fuite de données) ---
# 12 périodes de 30 jours : l'erreur affichée couvre une année complète de tests.
ML_BACKTEST_ORIGINS = _int("ML_BACKTEST_ORIGINS", 12)
ML_CACHE_TTL_SECONDS = _int("ML_CACHE_TTL_SECONDS", 3600)

# --- Règles de gestion des stocks (paramètres métier, pas des données) ---
STOCK_CONSO_WINDOW_DAYS = _int("STOCK_CONSO_WINDOW_DAYS", 365)
STOCK_RUPTURE_RECENT_DAYS = _int("STOCK_RUPTURE_RECENT_DAYS", 30)
STOCK_CRITIQUE_DAYS = _int("STOCK_CRITIQUE_DAYS", 15)
STOCK_SURSTOCK_DAYS = _int("STOCK_SURSTOCK_DAYS", 120)
STOCK_COVERAGE_TARGET_DAYS = _int("STOCK_COVERAGE_TARGET_DAYS", 45)

# --- Sécurité du service ---
ML_SERVICE_HOST = os.getenv("ML_SERVICE_HOST", "127.0.0.1")
ML_SERVICE_PORT = _int("ML_SERVICE_PORT", 8000)
# Si défini, chaque appel (hors /health) doit fournir l'en-tête X-API-Key.
ML_API_KEY = os.getenv("ML_API_KEY", "")
# Origines navigateur autorisées (séparées par des virgules). Vide = aucun appel navigateur direct :
# le frontend passe par le backend Spring Boot.
ML_CORS_ORIGINS = [o.strip() for o in os.getenv("ML_CORS_ORIGINS", "").split(",") if o.strip()]
