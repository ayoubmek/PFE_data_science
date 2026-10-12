# 🏭 Nexora ETL Data Pipeline — Data Warehouse `dbDWH1`

Ce dossier contient l'ensemble du code source du pipeline **ETL (Extract - Transform/Clean - Load)** développé pour le projet de fin d'études (PFE).

Il assure la transition entre les extractions brutes d'atelier / ERP (fichiers CSV complexes avec anomalies) et le **Data Warehouse d'entreprise Microsoft SQL Server (`dbDWH1`)**, structuré selon un schéma en étoile certifié pour alimenter les modèles d'Intelligence Artificielle et les tableaux de bord Power BI.

---

## 🏗️ Architecture du Pipeline

```
┌────────────────────────────────────────────────────────┐
│                   SOURCES BRUTES (RAW)                 │
│  - ASTOCKDATE_RAW.csv (51 500 lignes, ~25% anomalies)   │
│  - Exports d'exécution d'atelier & cadences machines   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                 PIPELINE ETL PYTHON                    │
│                                                        │
│  1. Ingestion Multi-Sources (extract.py)              │
│     - Détection automatique d'encodage (UTF-8, Latin1) │
│                                                        │
│  2. Moteur de Nettoyage Qualité (cleaners.py)          │
│     - Application systématique des 10 règles qualité   │
│     - Audit & rapport de conformité avant/après       │
│                                                        │
│  3. Modélisation Schéma DWH (transform.py)             │
│     - Projection vers les 3 tables cibles              │
│                                                        │
│  4. Chargement Haute Performance (load.py)             │
│     - Insertion en masse (fast_executemany / pyodbc)   │
│     - Export miroir CSV certifié                       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│         DATA WAREHOUSE SQL SERVER (dbDWH1)             │
│                                                        │
│  • Tables d'Inventaire et Production :                 │
│    - dbo.ASTOCKDATE       (Instantanés d'inventaire)   │
│    - dbo.FACT_CLE         (Production réelle & TRS)    │
│    - dbo.MCMachineCenter  (Centres de charge machines) │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌──────────────┐                       ┌──────────────┐
│  MODÈLES IA  │                       │   POWER BI   │
│  Sprints 2&3 │                       │  DASHBOARDS  │
└──────────────┘                       └──────────────┘
```

---

## 🔍 Les 10 Anomalies de Qualité Traitées

Le module `cleaners.py` résout automatiquement les 10 anomalies documentées dans `DATA_QUALITY_ISSUES.md` :

| # | Anomalie constatée dans l'export brut | Solution implémentée dans le pipeline |
|---|---|---|
| **1** | **Données Manquantes (NULLs)** | Imputation contrôlée (articles génériques, familles par défaut, valeurs médianes). |
| **2** | **Doublons stricts et partiels** | Dédoublonnage sur la clé métier composite `(DateStock, No_, Site)`. |
| **3** | **Textes désordonnés et espaces** | Trimming complet, suppression des doubles espaces internes, titrage uniforme. |
| **4** | **Incohérences de dates** | Harmonisation multi-formats (`DD/MM/YYYY`, `DD-MM-YYYY`) vers **ISO 8601** (`YYYY-MM-DD`) et purge des dates impossibles (ex: 30 février). |
| **5** | **Incohérences numériques** | Remplacement de la virgule décimale par le point, extraction des nombres sans unités (`500 u` $\rightarrow$ `500.0`), filtrage IQR de Tukey. |
| **6** | **Anomalies sur les coûts** | Suppression des devises concaténées (`TND`), remplacement des coûts négatifs ou nuls par la médiane de la famille. |
| **7** | **Variances de catégories** | Normalisation de la casse en majuscule et correction des fautes de frappe (`VYSSEYRIE` $\rightarrow$ `VISSERIE`). |
| **8** | **Variances de sites** | Harmonisation des dépôts (`DÉPÔT A` $\rightarrow$ `DEPOT A`, `MAGASIN CENTRAL`). |
| **9** | **Identifiants invalides** | Normalisation de la clé `No_` en majuscules strictes et suppression des codes vides. |
| **10**| **Incohérences logiques** | Réconciliation entre `Quantité` et `Quantit`, et binarisation stricte de l'indicateur `Encours` (0 ou 1). |

---

## 🚀 Utilisation et Commandes

### 1. Installation des dépendances
```bash
pip install -r etl_pipeline/requirements.txt
```

### 2. Exécution en mode Dry-Run (Sans connexion SQL Server requise)
Génère le rapport d'audit et exporte les 3 tables propres au format CSV dans `etl_pipeline/output_clean/` :
```bash
python -m etl_pipeline.run_etl --dry-run
```

### 3. Exécution avec chargement direct dans SQL Server (`dbDWH1`)
```bash
python -m etl_pipeline.run_etl --load-sql
```

### 4. Test rapide sur un échantillon (ex: 5 000 lignes)
```bash
python -m etl_pipeline.run_etl --limit 5000 --dry-run
```

---

## 🗄️ Mapping vers les 3 Tables du DWH `dbDWH1`

1. **`dbo.ASTOCKDATE`** : Instantanés d'inventaire multi-sites (Kondar, Sousse, Brno), niveaux de stock et valorisations.
2. **`dbo.FACT_CLE`** : Suivi de la production réelle, déclarations de fabrication, métrique TRS nette et rebuts d'atelier.
3. **`dbo.MCMachineCenter`** : Référentiel des 319 presses à injecter réparties sur les 3 sites d'injection.


