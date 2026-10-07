import logging
from pathlib import Path
from typing import Dict
import pandas as pd
from sqlalchemy import create_engine, text

from .config import DB_URL, OUTPUT_CLEAN_DIR

logger = logging.getLogger(__name__)


class DWHLoader:
    def __init__(self, db_url: str = DB_URL, output_dir: Path = OUTPUT_CLEAN_DIR):
        self.db_url = db_url
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._engine = None

    def get_engine(self):
        if self._engine is None:
            self._engine = create_engine(
                self.db_url,
                fast_executemany=True,
                pool_pre_ping=True,
            )
        return self._engine

    def test_connection(self) -> bool:
        try:
            engine = self.get_engine()
            with engine.connect() as conn:
                result = conn.execute(text("SELECT @@VERSION")).fetchone()
                logger.info(f"Connected to SQL Server: {result[0][:50]}...")
                return True
        except Exception as e:
            logger.warning(f"SQL Server connection test failed: {e}")
            return False

    def load_table_to_sql(
        self, df: pd.DataFrame, table_name: str, if_exists: str = "replace"
    ) -> int:
        engine = self.get_engine()
        logger.info(f"Loading {len(df):,} rows into SQL Server table '[dbo].[{table_name}]'...")
        df.to_sql(
            name=table_name,
            con=engine,
            schema="dbo",
            if_exists=if_exists,
            index=False,
            chunksize=5000,
        )
        logger.info(f"Successfully loaded '{table_name}'.")
        return len(df)

    def export_to_clean_files(self, tables: Dict[str, pd.DataFrame]):
        logger.info(f"Saving cleaned tables to disk in {self.output_dir}...")
        for name, df in tables.items():
            csv_path = self.output_dir / f"{name}.csv"
            df.to_csv(csv_path, index=False, encoding="utf-8")
            logger.info(f"Saved: {csv_path.name} ({len(df):,} rows)")

    def load_all(
        self,
        tables: Dict[str, pd.DataFrame],
        dry_run: bool = False,
        if_exists: str = "replace",
    ) -> Dict[str, str]:
        status = {}
        self.export_to_clean_files(tables)

        if dry_run:
            logger.info("DRY-RUN mode enabled: skipping live database insertion.")
            return {k: "SAVED_TO_CSV" for k in tables.keys()}

        if not self.test_connection():
            logger.warning("Database unavailable. Cleaned files were saved to disk in 'output_clean/'.")
            return {k: "SAVED_TO_CSV_DB_OFFLINE" for k in tables.keys()}

        logger.info("=== Loading Cleaned Tables into SQL Server dbDWH1 ===")
        for name, df in tables.items():
            try:
                self.load_table_to_sql(df, name, if_exists=if_exists)
                status[name] = "LOADED_SUCCESSFULLY"
            except Exception as e:
                logger.error(f"Error loading {name}: {e}")
                status[name] = f"ERROR: {str(e)[:80]}"

        return status
