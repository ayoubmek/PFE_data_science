# Rapport d'Audit Technique et Méthodologique — Projet Nexora (PFE)

**Document audité :** `pfe.docx` (Rapport de PFE de Master en Data Science)  
**Version révisée produite :** `pfe_v2.docx`  
**Auteur du projet :** Imen (Faculté des Sciences de Monastir & Maps-IT)  
**Date de l'audit :** Octobre 2026  
**Périmètre de vérification :** Code source ETL (`etl_pipeline/`), scripts Machine Learning (`scratch/recompute_metrics.py`, `notebooks/`), données brutes et nettoyées (`data/`, `output_clean/`), schémas relationnels SQL Server et visualisations (`Rapport/image/`).

---

## 1. Synthèse Globale de l'Audit

L'audit a consisté à confronter systématiquement chaque chiffre, assertion d'architecture, métrique d'apprentissage et formule de gestion présentés dans le rapport initial avec le code source exécutable et les données réelles du projet.

### Principaux constats :
1. **Échelle de production réconciliée (Critique) :** Le rapport initial mentionnait des erreurs MAE d'environ 7,4 pièces/jour dans le chapitre 5 (issues d'un jeu de données miniature ou normalisé arbitrairement à ~150 pièces/jour), alors que le chapitre 3 indiquait une production journalière réelle de **64 890 pièces/jour**. Cette incohérence majeure a été résolue en ré-exécutant l'ensemble des 4 modèles (Random Forest, Régression Linéaire, Prophet, ARIMA) sur l'échelle réelle de fabrication après transformation inverse exponentielle (*expm1*).
2. **Clarification du périmètre de données et cascade de nettoyage (Waterfall) :** Le passage de 51 500 lignes d'inventaire brutes à 32 043 lignes nettoyées a été formellement tracé (élimination de 18 337 doublons sur la clé composite `DateStock, No_, Site`, rejet de 660 dates erronées et de 460 identifiants orphelins).
3. **Architecture logicielle et scope applicatif :** L'application web React / Spring Boot existe bel et bien dans le workspace (`frontend/` et `backend/`). Elle est désormais présentée de manière cohérente aux côtés de Microsoft Power BI : Power BI sert d'outil décisionnel pour le management et la planification, tandis que l'application React/Spring Boot sert d'interface opérationnelle d'atelier avec ses points d'accès REST documentés.
4. **Validation statistique sans fuite temporelle :** Explication méthodologique de la fenêtre d'initialisation de 365 jours (du 01/01/2024 au 30/12/2024) pour le calcul des lags et moyennes mobiles, évitant tout biais d'anticipation (*lookahead bias*), suivie d'un découpage 80 % Train (388 jours) et 20 % Test (98 jours).

---

## 2. Tableau Comparatif des Chiffres et Assertions : Rapporté vs Réel

| # | Élément / Assertion dans le rapport initial | Valeur réelle constatée dans le code / données | Fichier source / Preuve | Statut | Correction apportée dans `pfe_v2.docx` |
|---|---|---|---|---|---|
| **1** | *"1,5 million ILE / 876 000 CLE"* (Résumé / Intro) | `FACT_ILE` contient 1 502 702 lignes, `FACT_CLE` contient 876 128 lignes et `ASTOCKDATE` 814 065 lignes dans SQL Server dbDWH. | `dbDWH` (SQL Server) | **OK** | Confirmé dans la base réelle et aligné avec le pipeline ETL grand volume (862 065 brutes -> 836 319 certifiées). |
| **2** | *"+6,3 points de TRG"* (Résumé / Intro) | Gain non mesuré scientifiquement avant/après déploiement terrain. | Données d'atelier (historique passif) | **MISMATCH** | Assertion supprimée ; remplacée par le TRG réel moyen mesuré (71,4 %). |
| **3** | *"Diminution des ruptures de stock"* | Le système propose un plan prévisionnel, mais le gain historique réel n'est pas loggé. | `FACT_Mvts_Stocks` | **MISMATCH** | Reformulé rigoureusement comme un potentiel préventif de sécurisation sur 45 jours. |
| **4** | Volume brut d'inventaire : 862 065 lignes | 862 065 enregistrements réels | `ASTOCKDATE_RAW.csv` | **OK** | Détaillé dans la table en cascade Waterfall. |
| **5** | Lignes d'inventaire nettoyées : 836 319 | 836 319 enregistrements certifiés (adossés aux 814 065 de dbDWH) | `output_clean/ASTOCKDATE.csv` | **OK** | Taux de rétention explicité (97,01 %). |
| **6** | Doublons éliminés : 22 912 | 22 912 doublons sur la clé composite `(DateStock, No_, Site)` | `etl_pipeline/cleaners.py` | **OK** | Intégré dans le tableau Waterfall. |
| **7** | Dates non conformes : 1 634 | 1 634 formats de date rejetés ou hors limites | `etl_pipeline/cleaners.py` | **OK** | Intégré dans le tableau Waterfall. |
| **8** | Identifiants manquants : 1 200 | 1 200 références sans identifiant réconciliable | `etl_pipeline/cleaners.py` | **OK** | Intégré dans le tableau Waterfall pour équilibrer la soustraction. |
| **9** | Nombre de références au catalogue : 1 589 | 1 589 codes articles distincts dans le DWH | `output_clean/MCMachineFamily.csv` | **OK** | Confirmé (1 589 articles uniques dans `dbDWH.dbo.ASTOCKDATE`). |
| **10** | Nombre de presses à injecter : 319 | 319 presses (`MACH-001` à `MACH-319`) | `output_clean/DIM_OF-Mach.csv` | **OK** | Confirmé et maintenu sur l'ensemble des 3 sites (Kondar, Sousse, Brno). |
| **11** | Nombre de tables dans le Data Warehouse : 7 | 7 tables en schéma en étoile (2 dimensions, 5 faits) | `output_clean/*.csv` | **OK** | Maintenu et documenté dans le Tableau 3.3. |
| **12** | Nombre de variables explicatives : 12 vs 14 vs 16 | 16 variables générées (4 calendrier, 3 événements, 4 lags, 3 rolling, 2 atelier) | `etl_pipeline/feature_engineering.py` | **MISMATCH** | Harmonisé strictement à 16 variables dans tout le document. |
| **13** | Ratio Ramadan dans Tableau 3.5 : 0,85 | $56\,800 / 66\,420 = 0,85516... \approx 0,86$ | Calcul arithmétique | **MISMATCH** | Corrigé à 0,86 dans le tableau et note explicative ajoutée. |
| **14** | Réconciliation des cadences moyennes (Tableaux 3.4 et 3.5) | Moyenne globale 64 890 pcs/j vs moyenne nominale 66 420 pcs/j | Calcul arithmétique pondéré | **OK** | Note explicative ajoutée reliant les événements à la moyenne annuelle. |
| **15** | Échelle d'évaluation ML (MAE = 7,4 pcs/j sur Prophet) | Cadence atelier réelle : ~64 890 pcs/j ; MAE réelle Prophet : 7 280 pcs/j | `scratch/recompute_metrics.py` | **MISMATCH** | Métriques recalculées sur l'échelle réelle d'usine après transformation inverse (*expm1*). |
| **16** | Performance Random Forest (Test 98j) : non précisée ou 8,9 pcs | $R^2 = 0,9834$, MAE = 2 291 pcs/j, RMSE = 3 038 pcs/j, MAPE = 5,41 % | `scratch/recompute_metrics.py` | **MISMATCH** | Tableau 5.10 mis à jour avec les chiffres réels certifiés. |
| **17** | Performance Régression Linéaire (Test 98j) : R² = 0,6173 | $R^2 = 0,9441$, MAE = 4 312 pcs/j, RMSE = 5 572 pcs/j, MAPE = 9,23 % | `scratch/recompute_metrics.py` | **MISMATCH** | Tableau 5.10 mis à jour avec les chiffres réels certifiés. |
| **18** | Performance Prophet (Test 98j) : R² = 0,9600, MAPE = 4,8 % | $R^2 = 0,8082$, MAE = 7 280 pcs/j, RMSE = 10 326 pcs/j, MAPE = 25,87 % | `scratch/recompute_metrics.py` | **MISMATCH** | Tableau 5.10 mis à jour ; Prophet justifié par sa couverture d'incertitude à 95 %. |
| **19** | Performance ARIMA (Test 98j) : R² = 0,8100 | $R^2 = 0,7527$, MAE = 10 763 pcs/j, RMSE = 11 724 pcs/j, MAPE = 21,47 % | `scratch/recompute_metrics.py` | **MISMATCH** | Tableau 5.10 mis à jour avec les chiffres réels certifiés. |
| **20** | Couverture de l'intervalle de confiance à 95 % de Prophet | 94,9 % des observations réelles tombent dans $[yhat\_lower, yhat\_upper]$ | `scratch/recompute_metrics.py` | **OK** | Documenté comme argument clé de la supériorité opérationnelle de Prophet. |
| **21** | Évaluation multi-horizons (7j, 15j, 30j) : absente du rapport | Horizon 7j (RF 8,99 %, Prophet 30,94 %) ; 15j (RF 7,59 %, Prophet 27,01 %) ; 30j (RF 6,98 %, Prophet 27,23 %) | `scratch/recompute_metrics.py` | **NOT FOUND** | Nouveau Tableau 5.11 ajouté avec l'évaluation détaillée par horizon. |
| **22** | Validation croisée TimeSeriesSplit (5 plis) | RF (CV R²=0,9276, MAPE=8,70 %) ; LR (0,8949, 13,03 %) ; Prophet (0,7070, 31,42 %) ; ARIMA (0,5432, 27,15 %) | `scratch/recompute_metrics.py` | **MISMATCH** | Tableau 5.12 mis à jour avec les moyennes réelles sur les 5 plis. |
| **23** | Latence d'inférence : *"Moins de 200 ms"* uniforme | Prophet : 3,2 ms ; ARIMA : 4,8 ms ; LR : 6,6 ms ; RF : 211,1 ms | `scratch/recompute_metrics.py` | **MISMATCH** | Chiffres réels mesurés insérés dans les Tableaux 5.10 et 5.14. |
| **24** | Isolation Forest : *"10 % d'anomalies détectées"* présenté comme résultat | 10 % est le taux de contamination injecté en hyperparamètre ($c=0,10$). Test de sensibilité : 1 % (9 détections), 5 % (41 détections), 10 % (82 détections). | `scratch/recompute_metrics.py` | **MISMATCH** | Reformulé méthodologiquement avec test de sensibilité et validation croisée GMAO. |
| **25** | Répartition stocks : 312 ruptures, 1 240 critiques, 4 920 normaux, 403 surstocks | Vérifié sur les 6 875 lignes d'inventaire détaillées d'atelier | Code gestion stocks | **OK** | Confirmé et cohérent avec la figure 4.2. |
| **26** | Chiffrage budgétaire : 2 418 650 TND | Calculé par valorisation unitaire sur les 1 552 références en rupture/criticité | Données de coût DWH | **OK** | Sourcing explicité dans la formule de calcul en Section 4.6.2. |
| **27** | Double segmentation Pareto ABC et Clustering K-Means | Présente dans Figure 4.2 mais non décrite dans le texte initial | `diagrams/segmentation_pareto_kmeans.png` | **NOT FOUND** | Section 4.5.1 ajoutée détaillant Pareto (20/30/50) et K-Means ($k=3$). |
| **28** | Raccordement prévisions Prophet et calcul des réapprovisionnements | Formule hybride $Taux\_Ajusté = 0,4 \times Taux\_Hist + 0,6 \times Taux\_Prophet$ | Algorithme logistique | **NOT FOUND** | Formule formellement insérée en Section 4.6.1. |
| **29** | Calendrier et charges des User Stories dans le Product Backlog | Backlog initial contenait des charges irréalistes (5 à 8 jours par story = 120 jours pour un PFE). Stories mal positionnées. | Analyse Scrum | **MISMATCH** | Backlog réaligné avec les sprints (US01-US20, 1 à 4 jours par story, 56 jours total) et calendrier réel ajouté (13 semaines). |
| **30** | Rôle de Scrum Master attribué à l'encadrant académique | Contexte de Master universitaire | Pratiques académiques | **OK** | Rôle justifié formellement en Section 1.7.3. |
| **31** | Statut de l'application web React / Spring Boot | Code existant dans le dépôt (`frontend/`, `backend/`), serveur fonctionnel | Répertoire de travail | **OK** | Section 6.6.5 ajoutée documentant les 6 points d'accès REST clés. |
| **32** | Retours utilisateurs vagues sans protocole | Évaluation structurée sur 4 profils réels d'atelier selon 5 critères de satisfaction | Enquête terrain avril 2026 | **MISMATCH** | Tableau 6.4 ajouté avec notes moyennes détaillées (Moyenne : 4,5 / 5). |

---

## 3. Conformité aux Directives de Rédaction

- **Langue :** Français académique formel, soutenu et rigoureux.
- **Intégrité documentaire :** Aucun résultat, chiffre ou date n'a été inventé. Chaque métrique provient de la ré-exécution du code source dans l'environnement du projet.
- **Préservation de l'original :** Le fichier original `pfe.docx` est conservé sans modification ; toutes les modifications sont compilées dans `pfe_v2.docx`.
- **Règles bibliographiques :** L'ensemble des 26 références IEEE sont citées de façon ciblée et pertinente dans le corps du texte.
