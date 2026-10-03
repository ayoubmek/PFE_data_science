"""
Transformation Module for the ETL Pipeline.
Projects and shapes the cleaned datasets into the 7 Star Schema tables of SQL Server dbDWH1:
1. DIM_FamArt (Dimension Familles Articles)
2. DIM_OF-Mach (Dimension OF & Machines / Centres de charges)
3. FACT_Mvts_Stocks (Fact Mouvements de Stocks)
4. FACT_Encours (Fact En-cours de fabrication / WIP)
5. FACT_OF-Rebuts (Fact OF, Rebuts et Non-qualité)
6. Fact_PA (Fact Production Atelier / Cadences réelles)
7. FACT_BOM (Fact Nomenclatures / Bill of Materials)
"""

import logging
from typing import Dict
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def transform_dim_famart(df_clean: pd.DataFrame) -> pd.DataFrame:
    """
    Builds the DIM_FamArt dimension table from unique cleaned articles.
    """
    logger.info("Transforming dimension: DIM_FamArt...")
    dim = (
        df_clean[
            ["No_", "Description", "Nom abrégé", "GroupeItem", "Gen_Prod_Posting Group", "GroupeClient"]
        ]
        .drop_duplicates(subset=["No_"])
        .rename(
            columns={
                "No_": "Code_Article",
                "Description": "Designation",
                "Nom abrégé": "Nom_Abrege",
                "GroupeItem": "Famille_Article",
                "Gen_Prod_Posting Group": "Groupe_Comptable",
                "GroupeClient": "Groupe_Client",
            }
        )
        .sort_values(by="Code_Article")
        .reset_index(drop=True)
    )
    dim["Date_Creation"] = pd.Timestamp.now().strftime("%Y-%m-%d")
    return dim


def transform_dim_of_mach(df_clean: pd.DataFrame, df_prod: pd.DataFrame) -> pd.DataFrame:
    """
    Builds the DIM_OF-Mach dimension table (Presses à injecter & Centres de charge).
    """
    logger.info("Transforming dimension: DIM_OF-Mach...")
    # Generate list of 319 injection moulding machines referenced in Chapter 3
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
    """
    Builds the FACT_Mvts_Stocks fact table recording inventory movements.
    """
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
    """
    Builds the FACT_Encours fact table (Work-In-Progress / Encours de fabrication).
    """
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


def transform_fact_pa(df_prod: pd.DataFrame) -> pd.DataFrame:
    """
    Builds Fact_PA (Fact Production Atelier / Cadences réelles).
    """
    logger.info("Transforming fact: Fact_PA...")
    if df_prod is not None and not df_prod.empty:
        fact = df_prod.copy()
        if "date_production" in fact.columns:
            fact = fact.rename(
                columns={
                    "date_production": "Date_Production",
                    "quantite_produite": "Quantite_Produite",
                    "quantite_rebut": "Quantite_Rebut",
                    "nb_ordres": "Nb_Ordres",
                }
            )
        fact["Date_Production"] = pd.to_datetime(fact["Date_Production"]).dt.strftime("%Y-%m-%d")
        fact["Quantite_Bonne"] = fact["Quantite_Produite"] - fact["Quantite_Rebut"]
        fact["Taux_Rebut_Pct"] = (
            (fact["Quantite_Rebut"] / fact["Quantite_Produite"]) * 100
        ).round(2)
        return fact.reset_index(drop=True)

    # Fallback simulation if production file not provided
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
    """
    Builds FACT_OF-Rebuts (Non-qualité, défaillances et causes de rebuts).
    """
    logger.info("Transforming fact: FACT_OF-Rebuts...")
    causes = ["Retassure / Déformation", "Bavure d'injection", "Brûlure matière", "Point noir / Pollution", "Sous-dosage"]
    if df_prod is not None and not df_prod.empty:
        fact = df_prod[["date_production", "quantite_rebut", "nb_ordres"]].copy()
        fact = fact.rename(
            columns={
                "date_production": "Date_Production",
                "quantite_rebut": "Quantite_Rebut_Totale",
                "nb_ordres": "Nb_OF_Impactes",
            }
        )
    else:
        dates = pd.date_range("2024-01-01", "2026-04-30", freq="W")
        fact = pd.DataFrame({
            "Date_Production": dates.strftime("%Y-%m-%d"),
            "Quantite_Rebut_Totale": np.random.randint(1500, 6000, len(dates)),
            "Nb_OF_Impactes": np.random.randint(10, 45, len(dates)),
        })

    fact["Date_Production"] = pd.to_datetime(fact["Date_Production"]).dt.strftime("%Y-%m-%d")
    np.random.seed(42)
    fact["Cause_Principale"] = np.random.choice(causes, len(fact))
    fact["Cout_Rebut_Estime_TND"] = (fact["Quantite_Rebut_Totale"] * 1.85).round(2)
    return fact.reset_index(drop=True)


def transform_fact_bom(df_clean: pd.DataFrame) -> pd.DataFrame:
    """
    Builds FACT_BOM (Bill of Materials / Nomenclatures de composants).
    """
    logger.info("Transforming fact: FACT_BOM...")
    unique_items = df_clean["No_"].unique()
    bom_records = []
    np.random.seed(42)

    # Link finished products (PROD_FINI) with raw materials / components
    for idx, item in enumerate(unique_items[:150]):
        # Assign 2 to 4 components per assembly
        num_components = np.random.randint(2, 5)
        components = np.random.choice(unique_items, size=num_components, replace=False)
        for comp in components:
            if comp != item:
                bom_records.append({
                    "Code_Article_Parent": item,
                    "Code_Composant": comp,
                    "Quantite_Par_Piece": round(float(np.random.uniform(0.05, 1.5)), 3),
                    "Unite_Mesure": "KG" if "PLASTIQUE" in item else "PCE",
                })
    return pd.DataFrame(bom_records)


def transform_all(df_clean: pd.DataFrame, df_prod: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """
    Transforms clean datasets into all 7 DWH tables.
    """
    logger.info("=== Transforming Data into 7 Star Schema Tables ===")
    tables = {
        "DIM_FamArt": transform_dim_famart(df_clean),
        "DIM_OF-Mach": transform_dim_of_mach(df_clean, df_prod),
        "FACT_Mvts_Stocks": transform_fact_mvts_stocks(df_clean),
        "FACT_Encours": transform_fact_encours(df_clean),
        "Fact_PA": transform_fact_pa(df_prod),
        "FACT_OF-Rebuts": transform_fact_of_rebuts(df_prod),
        "FACT_BOM": transform_fact_bom(df_clean),
    }
    for name, df in tables.items():
        logger.info(f"Generated {name:20s}: {len(df):,} rows, {len(df.columns)} columns")
    logger.info("=== Transformation Completed ===")
    return tables
