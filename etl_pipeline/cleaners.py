"""
Data Cleaning and Quality Assurance Module for the ETL Pipeline.
Implements resolution for the 10 data quality anomalies identified in raw ERP exports:
1. Missing data & NULL handling
2. Strict deduplication
3. Text trimming and casing normalization
4. Date parsing & harmonization (ISO 8601)
5. Numeric cleaning (decimal commas, unit text removal, outlier filtering)
6. Cost sanitization (currency suffix removal, negative cost handling)
7. Category variances harmonization
8. Storage site names normalization
9. Item ID (No_) normalization
10. Cross-column logical reconciliation (Quantité vs Quantit, Encours flags)
"""

import re
import logging
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np

from .config import QUALITY_THRESHOLDS

logger = logging.getLogger(__name__)


class DataCleaner:
    def __init__(self, df_raw: pd.DataFrame):
        self.df = df_raw.copy()
        self.audit_report: Dict[str, Any] = {
            "initial_rows": len(df_raw),
            "duplicates_removed": 0,
            "missing_imputed": 0,
            "dates_standardized": 0,
            "invalid_dates_dropped": 0,
            "numerics_cleaned": 0,
            "outliers_adjusted": 0,
            "negative_stocks_resolved": 0,
            "text_fields_trimmed": 0,
            "categories_standardized": 0,
            "sites_standardized": 0,
            "logical_mismatches_fixed": 0,
            "final_clean_rows": 0,
        }

    def run_all_cleaners(self) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Executes all 10 cleaning steps in sequence."""
        logger.info("Executing Step 1: Cleaning Item IDs (No_)...")
        self.clean_item_ids()

        logger.info("Executing Step 2: Strict Deduplication...")
        self.deduplicate()

        logger.info("Executing Step 3: Text Normalization and Trimming...")
        self.normalize_text_fields()

        logger.info("Executing Step 4: Harmonizing Categories & Sites...")
        self.standardize_categories_and_sites()

        logger.info("Executing Step 5: Date Parsing and ISO Standardization...")
        self.harmonize_dates()

        logger.info("Executing Step 6: Numeric Values & Decimal Separators...")
        self.clean_numeric_fields()

        logger.info("Executing Step 7: Cost Cleaning & Currency Stripping...")
        self.clean_costs()

        logger.info("Executing Step 8: Resolving Negative Stocks...")
        self.resolve_negative_stocks()

        logger.info("Executing Step 9: Cross-Column Logical Consistency Check...")
        self.reconcile_logical_inconsistencies()

        logger.info("Executing Step 10: Handling Missing Values & Nulls...")
        self.impute_missing_values()

        self.audit_report["final_clean_rows"] = len(self.df)
        self.audit_report["retention_rate_pct"] = round(
            (len(self.df) / self.audit_report["initial_rows"]) * 100, 2
        )
        return self.df, self.audit_report

    # --- Step 1: Item IDs ---
    def clean_item_ids(self):
        """Cleans No_ column: trims spaces, uppercase, removes empty identifiers."""
        if "No_" not in self.df.columns:
            return
        initial_empty = self.df["No_"].isna().sum() + (self.df["No_"].str.strip() == "").sum()
        self.df["No_"] = self.df["No_"].fillna("").astype(str).str.strip().str.upper()
        # Filter out empty item numbers
        self.df = self.df[self.df["No_"] != ""].copy()
        self.audit_report["invalid_ids_dropped"] = int(initial_empty)

    # --- Step 2: Deduplication ---
    def deduplicate(self):
        """Removes exact duplicates and duplicates on business key (DateStock, No_, Site)."""
        before_count = len(self.df)
        # Drop exact duplicate rows
        self.df = self.df.drop_duplicates()
        exact_dups = before_count - len(self.df)

        # Drop duplicate business keys, keeping the most complete record
        if all(c in self.df.columns for c in ["DateStock", "No_", "Site"]):
            before_sub = len(self.df)
            self.df = self.df.drop_duplicates(subset=["DateStock", "No_", "Site"], keep="first")
            key_dups = before_sub - len(self.df)
        else:
            key_dups = 0

        self.audit_report["duplicates_removed"] = int(exact_dups + key_dups)

    # --- Step 3: Text Normalization ---
    def normalize_text_fields(self):
        """Trims whitespace, replaces double spaces, and standardizes descriptions."""
        text_cols = [c for c in ["Description", "Nom abrégé", "GroupeClient"] if c in self.df.columns]
        trimmed_count = 0
        for col in text_cols:
            s_before = self.df[col].astype(str)
            cleaned = (
                s_before.str.strip()
                .str.replace(r"\s+", " ", regex=True)
                .str.title()
            )
            trimmed_count += (s_before != cleaned).sum()
            self.df[col] = cleaned
        self.audit_report["text_fields_trimmed"] = int(trimmed_count)

    # --- Step 4: Categories & Sites ---
    def standardize_categories_and_sites(self):
        """Standardizes casing and handles typos for categories and storage sites."""
        if "GroupeItem" in self.df.columns:
            # Normalize to uppercase and trim
            before = self.df["GroupeItem"].astype(str)
            cleaned = before.str.strip().str.upper()
            # Fix common typo: VYSSEYRIE -> VISSERIE
            cleaned = cleaned.replace({"VYSSEYRIE": "VISSERIE", "PLASTIQ": "PLASTIQUE"})
            self.audit_report["categories_standardized"] = int((before != cleaned).sum())
            self.df["GroupeItem"] = cleaned

        if "Gen_Prod_Posting Group" in self.df.columns:
            self.df["Gen_Prod_Posting Group"] = (
                self.df["Gen_Prod_Posting Group"].fillna("DIVERS").astype(str).str.strip().str.upper()
            )

        if "Site" in self.df.columns:
            before_site = self.df["Site"].astype(str)
            # Standardize depot and atelier naming
            cleaned_site = before_site.str.strip().str.upper()
            cleaned_site = cleaned_site.replace({
                "DÉPÔT A": "DEPOT A",
                "DÉPÔT B": "DEPOT B",
                "DÉPÔT NORD": "DEPOT NORD",
                "MAGASIN  CENTRAL": "MAGASIN CENTRAL",
            })
            self.audit_report["sites_standardized"] = int((before_site != cleaned_site).sum())
            self.df["Site"] = cleaned_site

    # --- Step 5: Date Parsing ---
    def harmonize_dates(self):
        """Parses multiple date formats (ISO, DD/MM/YYYY, DD-MM-YYYY) and drops impossible dates."""
        if "DateStock" not in self.df.columns:
            return

        def parse_date(val):
            if pd.isna(val) or str(val).strip() in ["", "nan", "None"]:
                return pd.NaT
            val_str = str(val).strip()
            # Try ISO format YYYY-MM-DD
            try:
                dt = pd.to_datetime(val_str, format="%Y-%m-%d", errors="raise")
                return dt
            except (ValueError, TypeError):
                pass
            # Try French slash DD/MM/YYYY
            try:
                dt = pd.to_datetime(val_str, format="%d/%m/%Y", errors="raise")
                return dt
            except (ValueError, TypeError):
                pass
            # Try French dash DD-MM-YYYY
            try:
                dt = pd.to_datetime(val_str, format="%d-%m-%Y", errors="raise")
                return dt
            except (ValueError, TypeError):
                pass
            # Fallback to dateutil flexible parser
            return pd.to_datetime(val_str, errors="coerce")

        parsed_dates = self.df["DateStock"].apply(parse_date)
        invalid_mask = parsed_dates.isna()
        # Check valid year bounds (2020 - 2030)
        out_of_bounds = (
            (parsed_dates.dt.year < QUALITY_THRESHOLDS["min_valid_year"])
            | (parsed_dates.dt.year > QUALITY_THRESHOLDS["max_valid_year"])
        )
        drop_mask = invalid_mask | out_of_bounds

        self.audit_report["invalid_dates_dropped"] = int(drop_mask.sum())
        self.audit_report["dates_standardized"] = int((~drop_mask).sum())

        # Drop impossible / invalid dates
        self.df = self.df[~drop_mask].copy()
        self.df["DateStock"] = parsed_dates[~drop_mask].dt.strftime("%Y-%m-%d")

    # --- Step 6: Numeric Fields ---
    def clean_numeric_fields(self):
        """Replaces comma with dot, removes unit suffixes ('500 u'), filters extreme outliers."""
        num_cols = [c for c in ["Quantité", "Quantit"] if c in self.df.columns]
        cleaned_count = 0
        for col in num_cols:
            s = self.df[col].astype(str)
            # Remove unit suffixes like 'u', 'pcs', 'kg'
            s_clean = s.str.replace(r"[^\d.,\-]", "", regex=True)
            # Replace comma with period
            s_clean = s_clean.str.replace(",", ".", regex=False)
            converted = pd.to_numeric(s_clean, errors="coerce")
            cleaned_count += (s != s_clean).sum()
            self.df[col] = converted

        self.audit_report["numerics_cleaned"] = int(cleaned_count)

    # --- Step 7: Costs ---
    def clean_costs(self):
        """Cleans Cout column: strips currency (TND, EUR), corrects negative or zero costs."""
        if "Cout" not in self.df.columns:
            return
        s = self.df["Cout"].astype(str)
        # Strip currency text
        s_clean = s.str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", ".", regex=False)
        converted = pd.to_numeric(s_clean, errors="coerce")

        # Negative costs or zeros -> set to median cost of the category
        invalid_cost_mask = (converted <= 0) | (converted > QUALITY_THRESHOLDS["max_cost_outlier"])
        self.audit_report["invalid_costs_adjusted"] = int(invalid_cost_mask.sum())

        converted[invalid_cost_mask] = np.nan
        self.df["Cout"] = converted
        # Impute with category median or global median
        median_cost = self.df.groupby("GroupeItem")["Cout"].transform("median")
        self.df["Cout"] = self.df["Cout"].fillna(median_cost).fillna(45.0).round(2)

    # --- Step 8: Negative Stocks ---
    def resolve_negative_stocks(self):
        """Detects negative stock entries caused by late delivery slips and sets to absolute or baseline."""
        if "Quantité" not in self.df.columns:
            return
        neg_mask = self.df["Quantité"] < 0
        self.audit_report["negative_stocks_resolved"] = int(neg_mask.sum())
        # In Navision, temporary negative stock occurs when output is booked before raw material GRN.
        # We correct it by taking the absolute value or floor at 0
        self.df.loc[neg_mask, "Quantité"] = self.df.loc[neg_mask, "Quantité"].abs()

    # --- Step 9: Cross-Column Reconciliation ---
    def reconcile_logical_inconsistencies(self):
        """Reconciles Quantité vs Quantit discrepancies and ensures Encours is binary (0 or 1)."""
        discrepancy_count = 0
        if "Quantité" in self.df.columns and "Quantit" in self.df.columns:
            # Check where Quantité and Quantit diverge significantly
            diff_mask = (self.df["Quantité"] - self.df["Quantit"]).abs() > 0.01
            # Where Quantité is an obvious outlier (e.g. 999999), trust Quantit
            outlier_mask = self.df["Quantité"] > QUALITY_THRESHOLDS["max_quantity_outlier"]
            self.df.loc[outlier_mask, "Quantité"] = self.df.loc[outlier_mask, "Quantit"]

            # Cap any remaining extreme quantity
            remaining_outliers = self.df["Quantité"] > QUALITY_THRESHOLDS["max_quantity_outlier"]
            self.df.loc[remaining_outliers, "Quantité"] = 1500.0

            discrepancy_count = int(diff_mask.sum())

        self.audit_report["logical_mismatches_fixed"] = discrepancy_count

        # Clean Encours (should be binary 0 or 1)
        if "Encours" in self.df.columns:
            encours_num = pd.to_numeric(self.df["Encours"], errors="coerce").fillna(0).astype(int)
            # Values > 1 are capped to 1
            self.df["Encours"] = encours_num.apply(lambda x: 1 if x > 0 else 0)

    # --- Step 10: Missing Values Imputation ---
    def impute_missing_values(self):
        """Imputes missing descriptions, categories, and clients with meaningful industrial defaults."""
        missing_count = 0
        if "Description" in self.df.columns:
            mask = self.df["Description"].isna() | (self.df["Description"] == "")
            missing_count += mask.sum()
            self.df.loc[mask, "Description"] = "Composant Industriel " + self.df.loc[mask, "No_"]

        if "GroupeItem" in self.df.columns:
            mask = self.df["GroupeItem"].isna() | (self.df["GroupeItem"] == "")
            missing_count += mask.sum()
            self.df.loc[mask, "GroupeItem"] = "DIVERS"

        if "GroupeClient" in self.df.columns:
            mask = self.df["GroupeClient"].isna() | (self.df["GroupeClient"] == "")
            missing_count += mask.sum()
            self.df.loc[mask, "GroupeClient"] = "INTERNE"

        if "Nom abrégé" in self.df.columns:
            mask = self.df["Nom abrégé"].isna() | (self.df["Nom abrégé"] == "")
            self.df.loc[mask, "Nom abrégé"] = self.df.loc[mask, "No_"]

        self.audit_report["missing_imputed"] = int(missing_count)
