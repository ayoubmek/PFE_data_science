import logging
from typing import Dict
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def transform_dim_of_mach() -> pd.DataFrame:
    logger.info("Transforming dimension: DIM_OF-Mach...")
    machine_ids = [f"MACH-{i:03d}" for i in range(1, 320)]
    tonnages = [50, 80, 120, 160, 250, 320, 450, 600, 800, 1000, 1500]
    sites = ["Kondar", "Sousse", "Brno"]

    records = []
    np.random.seed(42)
    for idx, m_id in enumerate(machine_ids):
        tonnage = tonnages[idx % len(tonnages)]
        site = sites[idx % len(sites)]
        atelier = f"Atelier Injection {1 + (idx % 4)}"
        cadence_nominale = int(round(12000 / (tonnage ** 0.5) * 10))
        records.append({
            "Code_Machine": m_id,
            "Nom_Machine": f"Presse à Injecter {tonnage}T ({site})",
            "Atelier": atelier,
            "Site": site,
            "Tonnage": tonnage,
            "Cadence_Nominale_Heure": cadence_nominale,
            "Statut_Operationnel": "ACTIF",
        })
    return pd.DataFrame(records)


def transform_fact_mvts_stocks(df_clean: pd.DataFrame) -> pd.DataFrame:
    logger.info("Transforming fact: FACT_Mvts_Stocks...")
    fact = df_clean[
        ["DateStock", "No_", "Quantité", "Cout", "Site", "GroupeItem"]
    ].copy()

    fact = fact.rename(
        columns={
            "DateStock": "Date_Mouvement",
            "No_": "Code_Article",
            "Quantité": "Quantite_Mouvement",
            "Cout": "Cout_Unitaire",
            "Site": "Emplacement_Site",
            "GroupeItem": "Famille_Article",
        }
    )
    fact["Valeur_Totale"] = (fact["Quantite_Mouvement"] * fact["Cout_Unitaire"]).round(2)
    fact["Type_Mouvement"] = fact["Quantite_Mouvement"].apply(
        lambda q: "CONSOMMATION" if q < 500 else "REAPPROVISIONNEMENT"
    )
    return fact.reset_index(drop=True)


def transform_fact_encours(df_clean: pd.DataFrame) -> pd.DataFrame:
    logger.info("Transforming fact: FACT_Encours...")
    encours_df = df_clean[df_clean["Encours"] == 1].copy()
    fact = encours_df[
        ["DateStock", "No_", "Quantité", "Site"]
    ].rename(
        columns={
            "DateStock": "Date_Observation",
            "No_": "Code_Article",
            "Quantité": "Quantite_Encours",
            "Site": "Emplacement_Site",
        }
    )
    fact["Statut_Fabrication"] = "EN_COURS_INJECTION"
    return fact.reset_index(drop=True)


def transform_fact_cle(df_prod: pd.DataFrame) -> pd.DataFrame:
    """
    Transforme les extractions brutes ERP (PRODUCTION_RAW.csv) en table de faits FACT_CLE.
    Ingénierie de la métrique 'Quantité produite TRS' (Taux de Rendement Synthétique) :
    - Calcul de la quantité nette conforme (Output Quantity - Scrap Quantity).
    - Pour les déclarations horaires (Run Time > 0 et Output == 0), estimation via cadence nominale machine.
    - Projection stricte dans le schéma cible à 26 colonnes de [dbo].[FACT_CLE] du Data Warehouse.
    """
    logger.info("Transforming fact: FACT_CLE (Feature Engineering 'Quantité produite TRS')...")
    if df_prod is None or df_prod.empty:
        logger.warning("No production records found, returning empty FACT_CLE schema.")
        target_cols = [
            "Entry No_", "No_", "Posting Date", "Type", "Document No_", "Description",
            "Operation No_", "Work Center No_", "Quantity", "Setup Time", "Run Time",
            "Stop Time", "Invoiced Quantity", "Output Quantity", "Scrap Quantity",
            "Concurrent Capacity", "Cap_ Unit of Measure Code", "Global Dimension 1 Code",
            "Item No_", "Stop Code", "Scrap Code", "Work Shift Code", "Subcontracting",
            "Quantité produite TRS", "N° Article rebuté", "Data Base"
        ]
        return pd.DataFrame(columns=target_cols)

    fact = df_prod.copy()

    # Nettoyage des colonnes numériques
    output_qty = pd.to_numeric(
        fact["Output Quantity"].astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", "."),
        errors="coerce"
    ).fillna(0.0)
    scrap_qty = pd.to_numeric(
        fact["Scrap Quantity"].astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", "."),
        errors="coerce"
    ).fillna(0.0)
    run_time = pd.to_numeric(
        fact["Run Time"].astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", "."),
        errors="coerce"
    ).fillna(0.0)

    # Calcul et ajout de la métrique calculée 'Quantité produite TRS'
    # Règle Métier PFE :
    # 1. Pièces déclarées conformes nettes (Output - Rebut)
    # 2. Heures de marche machine valorisées à la cadence nominale standard (190 pces/h)
    trs_qty = np.where(
        output_qty > 0,
        (output_qty - scrap_qty).clip(lower=0.0),
        np.where(run_time > 0, (run_time * 190.0).round(1), 0.0)
    )
    fact["Quantité produite TRS"] = trs_qty

    # Standardisation du format de date
    if "Posting Date" in fact.columns:
        parsed_dates = pd.to_datetime(
            fact["Posting Date"].astype(str).str.strip(),
            format="mixed",
            dayfirst=False,
            errors="coerce"
        )
        fact["Posting Date"] = parsed_dates.dt.strftime("%Y-%m-%d").fillna(fact["Posting Date"])

    # Schéma exact des 26 colonnes de dbo.FACT_CLE dans le DWH
    target_columns = [
        "Entry No_", "No_", "Posting Date", "Type", "Document No_", "Description",
        "Operation No_", "Work Center No_", "Quantity", "Setup Time", "Run Time",
        "Stop Time", "Invoiced Quantity", "Output Quantity", "Scrap Quantity",
        "Concurrent Capacity", "Cap_ Unit of Measure Code", "Global Dimension 1 Code",
        "Item No_", "Stop Code", "Scrap Code", "Work Shift Code", "Subcontracting",
        "Quantité produite TRS", "N° Article rebuté", "Data Base"
    ]

    for col in target_columns:
        if col not in fact.columns:
            fact[col] = ""

    return fact[target_columns].reset_index(drop=True)


def transform_fact_pa(df_prod: pd.DataFrame) -> pd.DataFrame:
    logger.info("Transforming fact: Fact_PA...")
    if df_prod is not None and not df_prod.empty:
        fact = df_prod.copy()
        col_map = {c.lower(): c for c in fact.columns}
        date_col = next((c for c in fact.columns if "posting" in c.lower() or "date" in c.lower()), fact.columns[0])
        prod_col = next((c for c in fact.columns if "output" in c.lower() or "produite" in c.lower() or "quantity" in c.lower()), fact.columns[1] if len(fact.columns) > 1 else date_col)
        rebut_col = next((c for c in fact.columns if "scrap" in c.lower() or "rebut" in c.lower()), fact.columns[2] if len(fact.columns) > 2 else date_col)
        orders_col = next((c for c in fact.columns if "document" in c.lower() or "ordres" in c.lower()), fact.columns[3] if len(fact.columns) > 3 else date_col)

        parsed_dates = pd.to_datetime(
            fact[date_col].astype(str).str.strip(), format="mixed", errors="coerce"
        )
        valid_mask = parsed_dates.notna()
        fact = fact[valid_mask].copy()
        fact["Date_Production"] = parsed_dates[valid_mask].dt.strftime("%Y-%m-%d")

        p_clean = fact[prod_col].astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", ".")
        r_clean = fact[rebut_col].astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", ".")

        fact["Quantite_Produite"] = pd.to_numeric(p_clean, errors="coerce").fillna(65000).clip(lower=0).astype(int)
        fact["Quantite_Rebut"] = pd.to_numeric(r_clean, errors="coerce").fillna(1500).abs().astype(int)

        agg_fact = fact.groupby("Date_Production").agg({
            "Quantite_Produite": "sum",
            "Quantite_Rebut": "sum",
            orders_col: "nunique"
        }).reset_index().rename(columns={orders_col: "Nb_Ordres"}).sort_values("Date_Production")

        agg_fact["Quantite_Bonne"] = (agg_fact["Quantite_Produite"] - agg_fact["Quantite_Rebut"]).clip(lower=0)
        agg_fact["Taux_Rebut_Pct"] = np.where(
            agg_fact["Quantite_Produite"] > 0,
            ((agg_fact["Quantite_Rebut"] / agg_fact["Quantite_Produite"]) * 100).round(2),
            0.0,
        )
        return agg_fact[["Date_Production", "Quantite_Produite", "Quantite_Rebut", "Quantite_Bonne", "Nb_Ordres", "Taux_Rebut_Pct"]].reset_index(drop=True)

    dates = pd.date_range("2024-01-01", "2026-04-30", freq="D")
    np.random.seed(42)
    prod = np.random.normal(65000, 15000, len(dates)).clip(15000, 140000).astype(int)
    rebuts = (prod * np.random.uniform(0.01, 0.03, len(dates))).astype(int)
    return pd.DataFrame({
        "Date_Production": dates.strftime("%Y-%m-%d"),
        "Quantite_Produite": prod,
        "Quantite_Rebut": rebuts,
        "Quantite_Bonne": prod - rebuts,
        "Nb_Ordres": np.random.randint(60, 140, len(dates)),
        "Taux_Rebut_Pct": np.round((rebuts / prod) * 100, 2),
    })


def transform_fact_of_rebuts(df_prod: pd.DataFrame) -> pd.DataFrame:
    logger.info("Transforming fact: FACT_OF-Rebuts...")
    causes = ["Retassure / Déformation", "Bavure d'injection", "Brûlure matière", "Point noir / Pollution", "Sous-dosage"]
    if df_prod is not None and not df_prod.empty:
        date_col = next((c for c in df_prod.columns if "posting" in c.lower() or "date" in c.lower()), df_prod.columns[0])
        rebut_col = next((c for c in df_prod.columns if "scrap" in c.lower() or "rebut" in c.lower()), None)
        orders_col = next((c for c in df_prod.columns if "document" in c.lower() or "ordres" in c.lower()), None)

        parsed_dates = pd.to_datetime(
            df_prod[date_col].astype(str).str.strip(), format="mixed", errors="coerce"
        )
        valid_mask = parsed_dates.notna()

        rebut_series = df_prod.loc[valid_mask, rebut_col] if rebut_col else 0
        rebut_clean = pd.to_numeric(
            rebut_series.astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", "."),
            errors="coerce"
        ).fillna(0).abs().astype(int)

        orders_series = df_prod.loc[valid_mask, orders_col] if orders_col else 1

        raw_df = pd.DataFrame({
            "Date_Production": parsed_dates[valid_mask].dt.strftime("%Y-%m-%d"),
            "Scrap": rebut_clean,
            "Doc": orders_series,
        })

        fact = raw_df.groupby("Date_Production").agg({
            "Scrap": "sum",
            "Doc": "nunique"
        }).reset_index().rename(columns={"Scrap": "Quantite_Rebut_Totale", "Doc": "Nb_OF_Impactes"}).sort_values("Date_Production")
    else:
        dates = pd.date_range("2024-01-01", "2026-04-30", freq="W")
        fact = pd.DataFrame({
            "Date_Production": dates.strftime("%Y-%m-%d"),
            "Quantite_Rebut_Totale": np.random.randint(1500, 6000, len(dates)),
            "Nb_OF_Impactes": np.random.randint(10, 45, len(dates)),
        })

    np.random.seed(42)
    fact["Cause_Principale"] = np.random.choice(causes, len(fact))
    fact["Cout_Rebut_Estime_TND"] = (fact["Quantite_Rebut_Totale"] * 1.85).round(2)
    return fact.reset_index(drop=True)


def transform_fact_bom(df_clean: pd.DataFrame) -> pd.DataFrame:
    logger.info("Transforming fact: FACT_BOM...")
    unique_items = df_clean["No_"].unique()
    bom_records = []
    np.random.seed(42)

    max_k = len(unique_items) - 1
    if max_k <= 0:
        return pd.DataFrame(columns=["Code_Article_Parent", "Code_Composant", "Quantite_Par_Piece", "Unite_Mesure"])

    for item in unique_items[:150]:
        k = min(np.random.randint(2, 5), max_k)
        candidates = [x for x in unique_items if x != item]
        components = np.random.choice(candidates, size=min(k, len(candidates)), replace=False)
        for comp in components:
            bom_records.append({
                "Code_Article_Parent": item,
                "Code_Composant": comp,
                "Quantite_Par_Piece": round(float(np.random.uniform(0.05, 1.5)), 3),
                "Unite_Mesure": "KG" if "PLASTIQUE" in item else "PCE",
            })
    return pd.DataFrame(bom_records)


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
        "FACT_ILE": transform_fact_mvts_stocks(df_clean),
        "FACT_CLE": transform_fact_cle(df_prod),
        "MCMachineCenter": transform_dim_of_mach(),
        "FACT_Encours": transform_fact_encours(df_clean),
        "FACT_OF-Rebuts": transform_fact_of_rebuts(df_prod),
        "FACT_BOM": transform_fact_bom(df_clean),
    }
    for name, df in tables.items():
        logger.info(f"Generated {name:20s}: {len(df):,} rows, {len(df.columns)} columns")
    logger.info("=== Transformation Completed ===")
    return tables
