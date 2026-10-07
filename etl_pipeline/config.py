import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_CLEAN_DIR = PROJECT_ROOT / "etl_pipeline" / "output_clean"

RAW_STOCK_CSV = PROJECT_ROOT / "ASTOCKDATE_RAW.csv"
RAW_PROD_CSV = PROJECT_ROOT / "PRODUCTION_RAW.csv"
SAMPLE_PROD_XLSX = PROJECT_ROOT / "echantillon_dwh_production.xlsx"

DB_CONFIG = {
    "server": os.getenv("DB_SERVER", "localhost"),
    "database": os.getenv("DB_NAME", "dbDWH"),
    "driver": os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server"),
    "trusted_connection": os.getenv("DB_TRUSTED", "yes"),
    "username": os.getenv("DB_USER", "sa"),
    "password": os.getenv("DB_PASSWORD", ""),
}

if DB_CONFIG["trusted_connection"].lower() in ["yes", "true", "1"]:
    DB_URL = (
        f"mssql+pyodbc://@{DB_CONFIG['server']}/{DB_CONFIG['database']}?"
        f"driver={DB_CONFIG['driver'].replace(' ', '+')}&trusted_connection=yes&TrustServerCertificate=yes"
    )
else:
    DB_URL = (
        f"mssql+pyodbc://{DB_CONFIG['username']}:{DB_CONFIG['password']}@"
        f"{DB_CONFIG['server']}/{DB_CONFIG['database']}?"
        f"driver={DB_CONFIG['driver'].replace(' ', '+')}&TrustServerCertificate=yes"
    )

QUALITY_THRESHOLDS = {
    "min_valid_year": 2020,
    "max_valid_year": 2030,
    "max_quantity_outlier": 50000.0,
    "max_cost_outlier": 10000.0,
}

