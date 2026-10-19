import logging
from typing import Dict

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

FACT_CLE_COLUMNS = [
    "Entry No_", "No_", "Posting Date", "Type", "Document No_", "Description",
    "Operation No_", "Work Center No_", "Quantity", "Setup Time", "Run Time",
    "Stop Time", "Invoiced Quantity", "Output Quantity", "Scrap Quantity",
    "Concurrent Capacity", "Cap_ Unit of Measure Code", "Global Dimension 1 Code",
    "Item No_", "Stop Code", "Scrap Code", "Work Shift Code", "Subcontracting",
    "Quantité produite TRS", "N° Article rebuté", "Data Base",
]


def _to_number(series: pd.Series) -> pd.Series:
    return pd.to_numeric(
        series.astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", "."),
        errors="coerce",
    ).fillna(0.0)


def transform_fact_cle(df_prod: pd.DataFrame) -> pd.DataFrame:
    logger.info("Transforming fact: FACT_CLE (Feature Engineering 'Quantité produite TRS')...")
    if df_prod is None or df_prod.empty:
        logger.warning("No production records found, returning empty FACT_CLE schema.")
        return pd.DataFrame(columns=FACT_CLE_COLUMNS)

    fact = df_prod.copy()
    output_qty = _to_number(fact["Output Quantity"])
    scrap_qty = _to_number(fact["Scrap Quantity"])
    run_time = _to_number(fact["Run Time"])

    both = (output_qty > 0) & (run_time > 0)
    rates = (output_qty[both] / run_time[both]).groupby(fact.loc[both, "No_"]).median()
    global_rate = float((output_qty[both] / run_time[both]).median()) if both.any() else np.nan
    machine_rate = fact["No_"].map(rates).fillna(global_rate)
    if np.isnan(global_rate):
        logger.warning("Aucune déclaration avec Output et Run Time : la TRS horaire ne peut pas être estimée.")
    logger.info(f"Cadence observée calculée pour {len(rates)} machine(s) ; médiane globale = {global_rate:,.1f} pcs/h")

    trs_qty = np.where(
        output_qty > 0,
        (output_qty - scrap_qty).clip(lower=0.0),
        np.where(run_time > 0, (run_time * machine_rate).round(1), 0.0),
    )
    fact["Quantité produite TRS"] = np.nan_to_num(trs_qty, nan=0.0)

    if "Posting Date" in fact.columns:
        raw = fact["Posting Date"].astype(str).str.strip()
        iso = pd.to_datetime(raw, format="%Y-%m-%d", errors="coerce")
        parsed = iso.fillna(pd.to_datetime(raw.where(iso.isna()), format="mixed", dayfirst=True, errors="coerce"))
        fact["Posting Date"] = parsed.dt.strftime("%Y-%m-%d").fillna(fact["Posting Date"])

    for col in FACT_CLE_COLUMNS:
        if col not in fact.columns:
            fact[col] = ""

    return fact[FACT_CLE_COLUMNS].reset_index(drop=True)


def transform_astockdate(df_clean: pd.DataFrame) -> pd.DataFrame:
    logger.info("Transforming table: ASTOCKDATE...")
    cols = [c for c in [
        "DateStock", "No_", "Description", "Gen_Prod_Posting Group",
        "Quantité", "Cout", "Site", "Encours", "Nom abrégé", "GroupeItem", "GroupeClient"
    ] if c in df_clean.columns]
    return df_clean[cols].reset_index(drop=True)


def transform_all(df_clean: pd.DataFrame, df_prod: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    logger.info("=== Transforming Data into dbDWH Schema Tables ===")
    tables = {
        "ASTOCKDATE": transform_astockdate(df_clean),
        "FACT_CLE": transform_fact_cle(df_prod),
    }
    for name, df in tables.items():
        logger.info(f"Generated {name:20s}: {len(df):,} rows, {len(df.columns)} columns")
    logger.info("=== Transformation Completed ===")
    return tables
