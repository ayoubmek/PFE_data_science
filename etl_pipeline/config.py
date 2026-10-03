"""
Configuration module for the ETL Pipeline.
Defines SQL Server connection parameters, source file paths, and target DWH tables.
"""

import os
from pathlib import Path

# Base Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT
OUTPUT_CLEAN_DIR = PROJECT_ROOT / "etl_pipeline" / "output_clean"

# Source Raw Data Files
RAW_STOCK_CSV = PROJECT_ROOT / "ASTOCKDATE_RAW.csv"
SAMPLE_STOCK_XLSX = PROJECT_ROOT / "echantillon_dwh_stock.xlsx"
SAMPLE_PROD_XLSX = PROJECT_ROOT / "echantillon_dwh_production.xlsx"

# Database Connection (Microsoft SQL Server dbDWH1)
DB_CONFIG = {
    "server": os.getenv("DB_SERVER", "localhost\\SQLEXPRESS"),
    "database": os.getenv("DB_NAME", "dbDWH1"),
    "driver": os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server"),
    "trusted_connection": os.getenv("DB_TRUSTED", "yes"),  # Windows Authentication
    "username": os.getenv("DB_USER", "sa"),
    "password": os.getenv("DB_PASSWORD", ""),
}

# Construct SQLAlchemy Connection String
if DB_CONFIG["trusted_connection"].lower() in ["yes", "true", "1"]:
    DB_URL = (
        f"mssql+pyodbc://@{DB_CONFIG['server']}/{DB_CONFIG['database']}?"
        f"driver={DB_CONFIG['driver'].replace(' ', '+')}&trusted_connection=yes"
    )
else:
    DB_URL = (
        f"mssql+pyodbc://{DB_CONFIG['username']}:{DB_CONFIG['password']}@"
        f"{DB_CONFIG['server']}/{DB_CONFIG['database']}?"
        f"driver={DB_CONFIG['driver'].replace(' ', '+')}"
    )

# DWH Target Tables (SQL Server dbDWH1 Schema)
TARGET_TABLES = {
    # Dimensions
    "dim_famart": "DIM_FamArt",
    "dim_of_mach": "DIM_OF-Mach",
    # Facts
    "fact_bom": "FACT_BOM",
    "fact_encours": "FACT_Encours",
    "fact_mvts_stocks": "FACT_Mvts_Stocks",
    "fact_of_rebuts": "FACT_OF-Rebuts",
    "fact_pa": "Fact_PA",
}

# Data Quality Thresholds
QUALITY_THRESHOLDS = {
    "min_valid_year": 2020,
    "max_valid_year": 2030,
    "max_quantity_outlier": 50000.0,
    "max_cost_outlier": 10000.0,
    "chunk_size": 10000,
}
