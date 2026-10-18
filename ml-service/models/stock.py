"""
Classification des articles par couverture de stock, calculée sur le DWH :

- Stock et valeur      : dernier instantané de dbo.ASTOCKDATE (somme des sites). [Cout] = valeur de la ligne.
- Consommation         : dbo.FACT_ILE, écritures de type Vente (1) et Consommation (5) sur la fenêtre
                         STOCK_CONSO_WINDOW_DAYS précédant la dernière date comptabilisée.
- Coût unitaire        : SUM(Cout) / SUM(Quantité) de l'article sur la même fenêtre (lignes à quantité > 0).
- Périmètre            : articles présents dans ASTOCKDATE durant la fenêtre (articles suivis en stock).

Statuts : RUPTURE (stock <= 0 et sorties sur les STOCK_RUPTURE_RECENT_DAYS derniers jours),
INACTIF (stock <= 0 sans sortie récente), CRITIQUE (couverture < STOCK_CRITIQUE_DAYS), NORMAL,
SURSTOCK (couverture >= STOCK_SURSTOCK_DAYS), SANS_CONSOMMATION (stock sans aucune sortie sur la fenêtre).
La même requête et les mêmes règles sont utilisées par le backend Spring Boot (StockService).
"""
import math

import numpy as np
import pandas as pd

import config
from .data_loader import read_sql

ARTICLE_STATUS_SQL = """
WITH snap AS (SELECT MAX(DateStock) AS d FROM dbo.ASTOCKDATE),
ile_end AS (SELECT MAX([Posting Date]) AS d FROM dbo.FACT_ILE),
tracked AS (
    SELECT s.[No_] AS art,
           MAX(s.[Description]) AS designation,
           MAX(s.[GroupeItem]) AS categorie,
           SUM(CASE WHEN s.[Quantité] > 0 THEN CAST(s.[Cout] AS FLOAT) ELSE 0 END)
             / NULLIF(SUM(CASE WHEN s.[Quantité] > 0 THEN CAST(s.[Quantité] AS FLOAT) ELSE 0 END), 0) AS cout_unitaire
    FROM dbo.ASTOCKDATE s WITH (NOLOCK) CROSS JOIN snap
    WHERE s.DateStock > DATEADD(day, -:window, snap.d)
    GROUP BY s.[No_]
),
cur AS (
    SELECT s.[No_] AS art, SUM(CAST(s.[Quantité] AS FLOAT)) AS qte, SUM(CAST(s.[Cout] AS FLOAT)) AS valeur
    FROM dbo.ASTOCKDATE s WITH (NOLOCK) JOIN snap ON s.DateStock = snap.d
    GROUP BY s.[No_]
),
conso AS (
    SELECT i.[Item No_] AS art, -SUM(CAST(i.Quantity AS FLOAT)) AS conso,
           -SUM(CASE WHEN i.[Posting Date] > DATEADD(day, -:recent, ile_end.d) THEN CAST(i.Quantity AS FLOAT) ELSE 0 END) AS conso_recente
    FROM dbo.FACT_ILE i WITH (NOLOCK) CROSS JOIN ile_end
    WHERE i.[Entry Type] IN ('1', '5') AND i.[Posting Date] > DATEADD(day, -:window, ile_end.d)
    GROUP BY i.[Item No_]
)
SELECT t.art AS reference, t.designation, t.categorie, t.cout_unitaire,
       ISNULL(c.qte, 0) AS stock, ISNULL(c.valeur, 0) AS valeur,
       ISNULL(co.conso, 0) AS conso_fenetre, ISNULL(co.conso_recente, 0) AS conso_recente,
       (SELECT d FROM snap) AS date_stock, (SELECT d FROM ile_end) AS date_conso
FROM tracked t
LEFT JOIN cur c ON c.art = t.art
LEFT JOIN conso co ON co.art = t.art
"""


STATUSES = ["RUPTURE", "CRITIQUE", "NORMAL", "SURSTOCK", "INACTIF", "SANS_CONSOMMATION"]


def classify(stock: float, daily_rate: float, recent_out: float) -> tuple:
    if daily_rate <= 0:
        return ("INACTIF" if stock <= 0 else "SANS_CONSOMMATION"), None
    if stock <= 0:
        return ("RUPTURE" if recent_out > 0 else "INACTIF"), 0.0
    coverage = stock / daily_rate
    if coverage < config.STOCK_CRITIQUE_DAYS:
        return "CRITIQUE", coverage
    if coverage < config.STOCK_SURSTOCK_DAYS:
        return "NORMAL", coverage
    return "SURSTOCK", coverage


def load_article_status() -> pd.DataFrame:
    df = read_sql(ARTICLE_STATUS_SQL, {"window": config.STOCK_CONSO_WINDOW_DAYS,
                                       "recent": config.STOCK_RUPTURE_RECENT_DAYS})
    df["conso_journaliere"] = df["conso_fenetre"].clip(lower=0) / config.STOCK_CONSO_WINDOW_DAYS
    status = [classify(s, r, c) for s, r, c in zip(df["stock"], df["conso_journaliere"], df["conso_recente"])]
    df["statut"] = [s for s, _ in status]
    df["couverture_jours"] = [c for _, c in status]

    at_risk = df["statut"].isin(["RUPTURE", "CRITIQUE"])
    need = np.ceil(df["conso_journaliere"] * config.STOCK_COVERAGE_TARGET_DAYS) - df["stock"].clip(lower=0)
    df["qte_a_commander"] = np.where(at_risk, need.clip(lower=0), 0.0)
    df["montant_commande"] = df["qte_a_commander"] * df["cout_unitaire"]
    return df


def replenishment_summary(df: pd.DataFrame) -> dict:
    plan = df[df["qte_a_commander"] > 0]
    priced = plan[plan["cout_unitaire"].notna()]
    return {
        "horizon_jours": config.STOCK_COVERAGE_TARGET_DAYS,
        "nb_references": int(len(plan)),
        "quantite_totale": float(plan["qte_a_commander"].sum()),
        "budget_tnd": float(priced["montant_commande"].sum()),
        "nb_references_sans_cout": int(len(plan) - len(priced)),
    }


def status_counts(df: pd.DataFrame) -> dict:
    counts = df["statut"].value_counts()
    return {k: int(counts.get(k, 0)) for k in STATUSES}


def to_records(df: pd.DataFrame) -> list:
    out = []
    for r in df.to_dict("records"):
        out.append({k: (None if isinstance(v, float) and math.isnan(v) else v) for k, v in r.items()})
    return out
