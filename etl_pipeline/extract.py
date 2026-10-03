"""
Extraction Module for the ETL Pipeline.
Handles raw CSV and Excel data ingestion with encoding detection and validation.
"""

import logging
from pathlib import Path
from typing import Optional, Tuple
import pandas as pd

from .config import RAW_STOCK_CSV, SAMPLE_PROD_XLSX

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def extract_raw_stock_csv(
    file_path: Optional[Path] = None, nrows: Optional[int] = None
) -> pd.DataFrame:
    """
    Extract raw stock data from CSV export (e.g., ASTOCKDATE_RAW.csv).
    Tries multiple encodings to handle legacy ERP exports.
    """
    path = Path(file_path or RAW_STOCK_CSV)
    if not path.exists():
        raise FileNotFoundError(f"Raw CSV file not found: {path}")

    logger.info(f"Extracting raw stock data from: {path.name}...")

    encodings = ["utf-8", "latin-1", "cp1252", "iso-8859-1"]
    df = None

    for enc in encodings:
        try:
            df = pd.read_csv(
                path,
                nrows=nrows,
                dtype=str,  # Read all as string to preserve raw anomalies for cleaning
                encoding=enc,
                low_memory=False,
            )
            logger.info(
                f"Successfully read {len(df):,} rows using '{enc}' encoding from {path.name}"
            )
            break
        except UnicodeDecodeError:
            continue
        except Exception as e:
            logger.warning(f"Failed reading with {enc}: {e}")

    if df is None:
        raise ValueError(f"Could not read {path} with any supported encoding: {encodings}")

    logger.info(f"Raw columns detected: {list(df.columns)}")
    return df


def extract_production_data(
    file_path: Optional[Path] = None, nrows: Optional[int] = None
) -> pd.DataFrame:
    """
    Extract production and scrap metrics from source (Excel or CSV).
    Feeds Fact_PA and FACT_OF-Rebuts.
    """
    path = Path(file_path or SAMPLE_PROD_XLSX)
    if not path.exists():
        logger.warning(f"Production file not found at {path}, generating simulated baseline.")
        return pd.DataFrame()

    logger.info(f"Extracting production data from: {path.name}...")
    try:
        df = pd.read_excel(path, nrows=nrows)
        logger.info(f"Read {len(df):,} production records.")
        return df
    except Exception as e:
        logger.error(f"Error reading production data: {e}")
        raise


def extract_all_sources() -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Orchestrates the extraction of all source files.
    Returns: (df_stock_raw, df_prod_raw)
    """
    logger.info("=== Starting Multi-Source Extraction ===")
    df_stock = extract_raw_stock_csv()
    df_prod = extract_production_data()
    logger.info("=== Multi-Source Extraction Completed ===")
    return df_stock, df_prod
