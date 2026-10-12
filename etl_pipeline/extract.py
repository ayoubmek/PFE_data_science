import logging
from typing import Optional
import pandas as pd

from .config import RAW_STOCK_CSV, RAW_PROD_CSV

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def extract_raw_stock_csv(nrows: Optional[int] = None) -> pd.DataFrame:
    path = RAW_STOCK_CSV
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
                dtype=str,
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


def extract_production_data(nrows: Optional[int] = None) -> pd.DataFrame:
    path = RAW_PROD_CSV
    if not path.exists():
        raise FileNotFoundError(f"Raw production CSV file not found: {path}")

    logger.info(f"Extracting production data from: {path.name}...")
    try:
        df = pd.read_csv(path, nrows=nrows, dtype=str)
        logger.info(f"Read {len(df):,} production records from {path.name}.")
        return df
    except Exception as e:
        logger.error(f"Error reading production data: {e}")
        raise

