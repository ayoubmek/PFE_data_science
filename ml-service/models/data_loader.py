from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
FACT_CLE_CSV = PROJECT_ROOT / "etl_pipeline" / "output_clean" / "FACT_CLE.csv"
PROD_RAW_CSV = PROJECT_ROOT / "PRODUCTION_RAW.csv"
STOCK_CLEAN_CSV = PROJECT_ROOT / "etl_pipeline" / "output_clean" / "ASTOCKDATE.csv"


def load_production_series() -> pd.DataFrame:
    if FACT_CLE_CSV.exists():
        df = pd.read_csv(FACT_CLE_CSV)
        date_col = next((c for c in df.columns if "date" in c.lower()), df.columns[0])
        val_col = next((c for c in df.columns if "bonne" in c.lower() or "produite" in c.lower()), df.columns[1])
        df = df[[date_col, val_col]].rename(columns={date_col: "date", val_col: "value"})
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df["value"] = pd.to_numeric(df["value"], errors="coerce").fillna(0)
        df = df.dropna().sort_values("date").reset_index(drop=True)
        return df

    if PROD_RAW_CSV.exists():
        df = pd.read_csv(PROD_RAW_CSV)
        date_col = next((c for c in df.columns if "date" in c.lower()), df.columns[0])
        val_col = next((c for c in df.columns if "produite" in c.lower()), df.columns[1])
        df = df[[date_col, val_col]].rename(columns={date_col: "date", val_col: "value"})
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df["value"] = pd.to_numeric(df["value"].astype(str).str.replace(",", "."), errors="coerce").fillna(0)
        df = df.dropna().groupby("date")["value"].sum().reset_index().sort_values("date").reset_index(drop=True)
        return df

    dates = pd.date_range("2024-01-01", "2026-03-31", freq="D")
    np.random.seed(42)
    base = 65000
    values = []
    for d in dates:
        if d.weekday() >= 5:
            values.append(int(base * 0.15 + np.random.normal(0, 2000)))
        else:
            values.append(int(base + np.sin(d.dayofyear / 20) * 8000 + np.random.normal(0, 3500)))
    return pd.DataFrame({"date": dates, "value": np.maximum(500, values)})


def load_stock_items(limit: int = 5000) -> pd.DataFrame:
    if STOCK_CLEAN_CSV.exists():
        df = pd.read_csv(STOCK_CLEAN_CSV, nrows=limit, low_memory=False)
        cols_map = {
            "No_": "reference",
            "Description": "designation",
            "Quantité": "quantite",
            "Cout": "cout",
            "GroupeItem": "categorie",
            "Site": "site",
        }
        df = df.rename(columns={k: v for k, v in cols_map.items() if k in df.columns})
        df["quantite"] = pd.to_numeric(df["quantite"], errors="coerce").fillna(0)
        df["cout"] = pd.to_numeric(df["cout"], errors="coerce").fillna(0)
        df["valeur"] = (df["quantite"] * df["cout"]).round(2)
        return df

    rng = np.random.default_rng(42)
    n = 200
    categories = ["MATIERE PREMIERE", "PRODUIT FINI", "COMPOSANT", "EMBALLAGE", "CONSOMMABLE"]
    return pd.DataFrame({
        "reference": [f"ART-{i:04d}" for i in range(1, n + 1)],
        "designation": [f"Composant Injection {i}" for i in range(1, n + 1)],
        "categorie": rng.choice(categories, n).tolist(),
        "quantite": rng.uniform(0, 1500, n).round(1).tolist(),
        "cout": rng.uniform(5, 500, n).round(2).tolist(),
        "valeur": rng.uniform(500, 75000, n).round(2).tolist(),
        "site": rng.choice(["Kondar", "Sousse", "Brno"], n).tolist(),
    })


REBUTS_CSV = PROJECT_ROOT / "etl_pipeline" / "output_clean" / "FACT_OF-Rebuts.csv"


def load_rebuts_data(limit: int = 5000) -> pd.DataFrame:
    if REBUTS_CSV.exists():
        df = pd.read_csv(REBUTS_CSV, nrows=limit)
        cols_map = {
            "Date_Production": "date",
            "Quantite_Rebut_Totale": "quantite_rebut",
            "Nb_OF_Impactes": "nb_of_impactes",
            "Cause_Principale": "cause",
            "Cout_Rebut_Estime_TND": "cout_rebut",
        }
        df = df.rename(columns={k: v for k, v in cols_map.items() if k in df.columns})
        df["quantite_rebut"] = pd.to_numeric(df["quantite_rebut"], errors="coerce").fillna(0)
        df["cout_rebut"] = pd.to_numeric(df["cout_rebut"], errors="coerce").fillna(0)
        return df

    rng = np.random.default_rng(42)
    n = 300
    dates = pd.date_range("2025-01-01", periods=n, freq="D")
    base_scrap = rng.integers(30, 200, n).astype(float)
    outliers_idx = rng.choice(n, size=int(n * 0.08), replace=False)
    base_scrap[outliers_idx] *= rng.uniform(3.5, 7.0, len(outliers_idx))

    return pd.DataFrame({
        "date": dates.strftime("%Y-%m-%d"),
        "quantite_rebut": base_scrap.round(1),
        "nb_of_impactes": rng.integers(1, 6, n),
        "cout_rebut": (base_scrap * 1.85).round(2),
        "cause": rng.choice(["Bavure d'injection", "Sous-dosage", "Brûlure matière", "Point noir"], n),
    })

