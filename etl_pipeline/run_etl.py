import sys
import time
import argparse
import logging
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from etl_pipeline.extract import extract_raw_stock_csv, extract_production_data
from etl_pipeline.cleaners import DataCleaner
from etl_pipeline.transform import transform_all
from etl_pipeline.load import DWHLoader

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("ETL_Master")


def print_banner():
    banner = """
    ========================================================================
       NEXORA DATA WAREHOUSE (dbDWH) - ETL PIPELINE & QUALITY ENGINE
       Raw CSV Ingestion -> 10 Quality Cleaners -> 3 DWH Tables
    ========================================================================
    """
    print(banner)


def print_audit_summary(report: dict, elapsed_sec: float):
    print("\n" + "=" * 75)
    print("               DATA QUALITY & SANITIZATION AUDIT REPORT")
    print("=" * 75)
    print(f"  • Lignes brutes extraites (Raw Input)     : {report.get('initial_rows', 0):>10,}")
    print(f"  • Identifiants manquants purgés (IDs)     : {report.get('invalid_ids_dropped', 0):>10,}")
    print(f"  • Doublons éliminés (Deduplication)       : {report.get('duplicates_removed', 0):>10,}")
    print(f"  • Dates impossibles / hors limites purges : {report.get('invalid_dates_dropped', 0):>10,}")
    print(f"  • Formats de dates harmonisés en ISO 8601 : {report.get('dates_standardized', 0):>10,}")
    print(f"  • Textes et espaces superflus nettoyés   : {report.get('text_fields_trimmed', 0):>10,}")
    print(f"  • Nombres et séparateurs décimaux corrigés: {report.get('numerics_cleaned', 0):>10,}")
    print(f"  • Coûts négatifs / aberrants réajustés    : {report.get('invalid_costs_adjusted', 0):>10,}")
    print(f"  • Stocks négatifs transitoires redressés  : {report.get('negative_stocks_resolved', 0):>10,}")
    print(f"  • Incohérences logiques résolues          : {report.get('logical_mismatches_fixed', 0):>10,}")
    print(f"  • Valeurs manquantes imputées (Imputation): {report.get('missing_imputed', 0):>10,}")
    print("-" * 75)
    print(f"  ==> Lignes valides certifiées (Clean DWH) : {report.get('final_clean_rows', 0):>10,}")
    print(f"  ==> Taux de rétention qualité             : {report.get('retention_rate_pct', 0):>9.2f} %")
    print(f"  ==> Durée totale d'exécution              : {elapsed_sec:>9.2f} s")
    print("=" * 75 + "\n")


def run_pipeline(dry_run: bool = True, limit: int = None):
    t_start = time.perf_counter()
    print_banner()

    logger.info("PHASE 1: Extraction des données brutes (Raw CSV & Excel)...")
    t0 = time.perf_counter()
    df_stock_raw = extract_raw_stock_csv(nrows=limit)
    df_prod_raw = extract_production_data(nrows=limit)
    t_extract = time.perf_counter() - t0
    logger.info(f"Phase 1 terminée en {t_extract:.2f} s ({len(df_stock_raw):,} lignes stock, {len(df_prod_raw):,} lignes prod)")

    logger.info("PHASE 2: Exécution des 10 règles de nettoyage de données...")
    t0 = time.perf_counter()
    cleaner = DataCleaner(df_stock_raw)
    df_stock_clean, audit_report = cleaner.run_all_cleaners()
    t_clean = time.perf_counter() - t0
    logger.info(f"Phase 2 terminée en {t_clean:.2f} s ({len(df_stock_clean):,} lignes certifiées)")

    logger.info("PHASE 3: Modélisation et projection dans les tables du DWH...")
    t0 = time.perf_counter()
    tables_dict = transform_all(df_stock_clean, df_prod_raw)
    t_transform = time.perf_counter() - t0
    logger.info(f"Phase 3 terminée en {t_transform:.2f} s ({len(tables_dict)} tables structurées)")

    logger.info("PHASE 4: Chargement des tables...")
    t0 = time.perf_counter()
    loader = DWHLoader()
    load_results = loader.load_all(
        tables=tables_dict,
        dry_run=dry_run,
    )
    t_load = time.perf_counter() - t0
    logger.info(f"Phase 4 terminée en {t_load:.2f} s")

    elapsed = time.perf_counter() - t_start
    audit_report["timing_breakdown"] = {
        "extraction_sec": round(t_extract, 2),
        "cleaning_sec": round(t_clean, 2),
        "transformation_sec": round(t_transform, 2),
        "loading_sec": round(t_load, 2),
        "total_elapsed_sec": round(elapsed, 2),
    }
    print_audit_summary(audit_report, elapsed)

    print("Timing Breakdown by Stage:")
    print(f"  • Extraction     : {t_extract:6.2f} s")
    print(f"  • Nettoyage (10) : {t_clean:6.2f} s")
    print(f"  • Transformation : {t_transform:6.2f} s")
    print(f"  • Chargement DWH : {t_load:6.2f} s")
    print(f"  • TOTAL GLOBAL   : {elapsed:6.2f} s")

    print("Table Loading Status:")
    for tbl, status in load_results.items():
        print(f"  - [dbo].[{tbl:18s}]: {status}")
    print("\nETL Execution completed successfully!\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", default=False)
    parser.add_argument("--load-sql", action="store_true", default=False)
    parser.add_argument("--limit", type=int, default=None)

    args = parser.parse_args()
    dry_mode = args.dry_run or (not args.load_sql)
    run_pipeline(dry_run=dry_mode, limit=args.limit)
