import logging
from typing import Dict
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def transform_dim_famart(df_clean: pd.DataFrame) -> pd.DataFrame:
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


def transform_fact_pa(df_prod: pd.DataFrame) -> pd.DataFrame:
    logger.info("Transforming fact: Fact_PA...")
    if df_prod is not None and not df_prod.empty:
        fact = df_prod.copy()
        col_map = {c.lower(): c for c in fact.columns}
        date_col = col_map.get("date_production", fact.columns[0])
        prod_col = col_map.get("quantite_produite", fact.columns[1] if len(fact.columns) > 1 else date_col)
        rebut_col = col_map.get("quantite_rebut", fact.columns[2] if len(fact.columns) > 2 else date_col)
        orders_col = col_map.get("nb_ordres", fact.columns[3] if len(fact.columns) > 3 else date_col)

        parsed_dates = pd.to_datetime(
            fact[date_col].astype(str).str.strip(), format="mixed", dayfirst=True, errors="coerce"
        )
        valid_mask = parsed_dates.notna()
        fact = fact[valid_mask].copy()
        fact["Date_Production"] = parsed_dates[valid_mask].dt.strftime("%Y-%m-%d")

        p_clean = fact[prod_col].astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", ".")
        r_clean = fact[rebut_col].astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", ".")
        o_clean = fact[orders_col].astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", ".")

        fact["Quantite_Produite"] = pd.to_numeric(p_clean, errors="coerce").fillna(65000).clip(lower=0).astype(int)
        fact["Quantite_Rebut"] = pd.to_numeric(r_clean, errors="coerce").fillna(1500).abs().astype(int)
        fact["Nb_Ordres"] = pd.to_numeric(o_clean, errors="coerce").fillna(95).abs().astype(int)

        fact = fact.drop_duplicates(subset=["Date_Production"]).sort_values("Date_Production")

        fact["Quantite_Bonne"] = (fact["Quantite_Produite"] - fact["Quantite_Rebut"]).clip(lower=0)
        fact["Taux_Rebut_Pct"] = np.where(
            fact["Quantite_Produite"] > 0,
            ((fact["Quantite_Rebut"] / fact["Quantite_Produite"]) * 100).round(2),
            0.0,
        )
        return fact[["Date_Production", "Quantite_Produite", "Quantite_Rebut", "Quantite_Bonne", "Nb_Ordres", "Taux_Rebut_Pct"]].reset_index(drop=True)

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
        col_map = {c.lower(): c for c in df_prod.columns}
        date_col = col_map.get("date_production", df_prod.columns[0])
        rebut_col = col_map.get("quantite_rebut", df_prod.columns[1] if len(df_prod.columns) > 1 else date_col)
        orders_col = col_map.get("nb_ordres", df_prod.columns[2] if len(df_prod.columns) > 2 else date_col)

        parsed_dates = pd.to_datetime(
            df_prod[date_col].astype(str).str.strip(), format="mixed", dayfirst=True, errors="coerce"
        )
        valid_mask = parsed_dates.notna()
        fact = pd.DataFrame({
            "Date_Production": parsed_dates[valid_mask].dt.strftime("%Y-%m-%d"),
            "Quantite_Rebut_Totale": pd.to_numeric(
                df_prod.loc[valid_mask, rebut_col].astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", "."),
                errors="coerce"
            ).fillna(1500).abs().astype(int),
            "Nb_OF_Impactes": pd.to_numeric(
                df_prod.loc[valid_mask, orders_col].astype(str).str.replace(r"[^\d.,\-]", "", regex=True).str.replace(",", "."),
                errors="coerce"
            ).fillna(25).abs().astype(int),
        }).drop_duplicates(subset=["Date_Production"]).sort_values("Date_Production")
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
        "FACT_CLE": transform_fact_pa(df_prod),
        "MCMachineCenter": transform_dim_of_mach(),
        "MCMachineFamily": transform_dim_famart(df_clean),
        "FACT_Encours": transform_fact_encours(df_clean),
        "FACT_OF-Rebuts": transform_fact_of_rebuts(df_prod),
        "FACT_BOM": transform_fact_bom(df_clean),
    }
    for name, df in tables.items():
        logger.info(f"Generated {name:20s}: {len(df):,} rows, {len(df.columns)} columns")
    logger.info("=== Transformation Completed ===")
    return tables
