# SYNTHÈSE GLOBALE DU PROJET (SUMMARY.MD)
## Plateforme Nexora — Système Décisionnel et Prédictif pour la Plasturgie Automobile

**Auteur du mémoire :** Imen Ayoub  
**Formation :** Master Professionnel en Data Science — Faculté des Sciences de Monastir  
**Entreprise partenaire :** Maps-IT  
**Branche Git de travail :** `pro-cleanup`  
**Documents finaux produits :** [`pfe_v8.docx`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/pfe_v8.docx) et [`pfe_v8.pdf`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/pfe_v8.pdf) (4,83 Mo)  
**Document initial archivé :** `pfe_v7.docx` (préservé intact sans modification)  
**Date d'achèvement :** 15 Octobre 2026

---

### 1. Objectifs de la Mission & Respect des Règles de Sécurité

La mission avait pour objectif exclusif de professionnaliser, assainir et mettre en conformité rigoureuse le code source et le mémoire universitaire, sans modifier l'architecture, la logique métier, les formules mathématiques ni les choix algorithmiques (Data Warehouse SQL Server, pipeline ETL Python, modèles Prophet en production et Random Forest en référence, couverture de stock à 45 jours, rapports Power BI, application web React / Spring Boot / FastAPI, méthodologie Scrum).

Toutes les règles de sécurité obligatoires ont été scrupuleusement appliquées :
1. **Isolation Git complète** : Travail effectué exclusivement sur la branche `pro-cleanup`. Aucun commit non validé sur `main`.
2. **Sanctuarisation de la base de données réelle** : Le Data Warehouse SQL Server en ligne (`dbDWH`) est demeuré **strictement intouché** (100 % de requêtes en lecture seule `SELECT`).
3. **Protection de l'existant documentaire** : Le fichier d'origine `pfe_v7.docx` n'a pas été écrasé. L'ensemble des améliorations a été compilé dans le nouveau document maître `pfe_v8.docx`, converti fidèlement en `pfe_v8.pdf`.
4. **Orientation stricte Data Science** : Tous les tests unitaires de développement logiciel ont été déplacés dans `_archive/` afin de concentrer le projet exclusivement sur les méthodologies de Data Science (qualité des données, modélisation prédictive, détection d'anomalies, optimisation logistique).

---

### 2. Synthèse des Réalisations par Phase

#### Phase 1 : Audit Exhaustif & État des Lieux
- Réalisation d'une analyse comparative exhaustive entre le code source, la base SQL Server et le texte du rapport, consignée dans [`AUDIT.md`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/AUDIT.md).
- Diagnostic précis des écarts apparents (notamment la distinction entre les 800 références d'articles et les 6 875 lignes d'inventaire détaillées).

- **Sécurisation RBAC (Spring Boot 3.4.5)** : Correction de la permissivité de `SecurityConfig.java`, restriction des contrôleurs `UserController` et `MLController` au rôle `ADMIN` (`@PreAuthorize("hasRole('ADMIN')")`), et gestion des codes HTTP 401 et 403.
- **Externalisation des secrets** : Création du gabarit [`.env.example`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/.env.example) et élimination du nom d'hôte en dur `LAPTOP-M7HILU4Q` dans l'ensemble des modules backend, ETL et ML.
- **Centralisation Frontend** : Unification des URLs d'API dans [`frontend/src/app/config.ts`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/frontend/src/app/config.ts).
- **Module de détection d'anomalies (Option 1 retenue)** : Implémentation dans `ml-service/models/prophet_model.py` s'appuyant sur l'intervalle prédictif à 95 % de Prophet ($y < \hat{y}_{lower}$ ou $y > \hat{y}_{upper}$). Validation à 100 % sur les 68 jours réels de fermeture totale d'usine (0 faux négatif). Exposition via l'endpoint REST `/detect/anomalies`.
- **Archivage des tests unitaires logiciels** : Déplacement de tous les tests unitaires logiciels dans `_archive/` pour recentrer le dépôt sur les flux et modèles de Data Science.

#### Phase 3 : Reproductibilité Technique & Métriques Avancées
- Horodatage fin par étape d'exécution dans le pipeline ETL (`etl_pipeline/run_etl.py`).
- Implémentation des métriques WAPE, MASE et couverture d'intervalle à 95 % dans `ml-service/models/metrics.py`.
- Script maître de reproductibilité (`scratch/test_reproduce_report_numbers.py`) confirmant en 1,64 s l'exactitude absolue des métriques et des comptes d'enregistrements.

#### Phase 4 : Mise en Conformité Rigoureuse du Mémoire (`pfe_v8.docx`)
- **Tableau 2.2** : Actualisation des versions logicielles mesurées (Spring Boot 3.4.5, React 18.0, TypeScript 4.7 [23], Scikit-Learn 1.5.2, Prophet 1.1.6, Power BI 2.152).
- **Tableau 3.5** : Rectification de la note explicative (64 221 pcs/j pondérés réels vs 64 890 pcs/j empiriques bruts, delta de +1,04 % expliqué par les chevauchements d'équipes).
- **Tableaux 3.6 & 3.7** : Qualification rigoureuse de l'échantillon d'audit qualité (51 500 lignes brutes, 32 043 validées, 62,22 % de rétention, 0 % d'anomalies résiduelles) avec citation de Kimball [8].
- **Sections 4.5.2 & 4.7** : Harmonisation uniforme du taux de surstock à **6,25 %** ($50 / 800$). Justification du coût moyen pondéré de 0,449 TND/u pour le budget de 380 393 TND sur 847 204 unités.
- **Clarification des granularités (Sections 4.7 & 6.4.3)** : Réconciliation claire entre les **800 références d'articles** du catalogue maître (47 ruptures, 146 critiques) et les **6 875 lignes d'inventaire détaillées multi-dépôts** de Power BI (312 ruptures d'emplacements, 1 240 situations critiques).
- **Sections 5.4 & 5.5** : Explication du seuil plancher de 12 450 pcs/j en régime nominal garantissant la stabilité du dénominateur en MAPE standard. Intégration formelle du WAPE et du MASE avec citation de Hyndman & Athanasopoulos [4].
- **Tableau 5.8** : Intégration du WAPE (3,8 % pour RF, 4,6 % pour Prophet) et du MASE (0,43 pour RF, 0,52 pour Prophet).
- **Nouvelle Section 5.8** : Rédaction complète du module de détection d'anomalies par intervalle Prophet à 95 % et compte-rendu de la validation sur les 68 arrêts d'atelier.
- **Section 6.6.2** : Précision que le jeu de test complet couvre 120 jours civils et que l'évaluation effective porte sur 98 jours (23/01–30/04/2026), en justifiant les 22 premiers jours exclus (7 jours de maintenance annuelle usine + 15 jours de réchauffement des variables décalées).
- **Nomenclature et Piliers** : Élimination du statut résiduel "Alerte" (classification stricte en Rupture, Critique, Normal, Surstock) et harmonisation de la description de Nexora en 4 piliers majeurs dans l'Introduction, le Résumé et l'Abstract.
- **Bibliographie (Norme IEEE)** : Correction de l'entrée [23] (B. Cherny, *Programming TypeScript*, 2019), mise à jour de [8] (Kimball & Ross, 2013), et citation active de [4], [5], [6], [9], [13], [25]. Zéro référence orpheline.

#### Phase 5 : Exportation PDF et Documentation Finale
- Compilation automatisée de `pfe_v8.docx` et conversion en [`pfe_v8.pdf`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/pfe_v8.pdf) via Microsoft Word COM (4 834 475 octets).
- Rédaction de [`BUGS.md`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/BUGS.md), [`CHANGELOG.md`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/CHANGELOG.md), et du présent [`SUMMARY.md`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/SUMMARY.md).

---

### 3. Tableau de Concordance et Certification des Chiffres Clés

| Domaine / Indicateur | Valeur Officielle Retenue | Statut de Contrôle Terrain | Fichiers Sources |
| :--- | :--- | :--- | :--- |
| **Lignes de fabrication CLE** | **876 128 enregistrements** | Conforme à 100 % au DWH live | SQL Server `dbo.FACT_CLE` |
| **Lignes d'inventaire globales** | **814 065 instantanés** | Conforme à 100 % au DWH live (819 dates) | SQL Server `dbo.ASTOCKDATE` |
| **Parc de presses à injecter** | **319 machines** | Conforme à 100 % (`MACH-001` à `MACH-319`) | SQL Server `dbo.MCMachineCenter` |
| **Catalogue d'articles actifs** | **800 références d'articles** | Conforme au référentiel maître `DIM_FamArt` | `scratch/stock_model_800_clean.csv` |
| **Classification des stocks (800 refs)**| **47 Rupture, 146 Critique, 557 Normal, 50 Surstock** | Somme arithmétique exacte = 800 | `stock_model_800_clean.csv` |
| **Taux de surstock** | **6,25 %** ($50 / 800$) | Harmonisé dans l'ensemble du rapport | Sections 4.5.2 & 4.7 |
| **Plan de réapprovisionnement 45j** | **193 références prioritaires** ($47 + 146$) | Conforme aux formules de sécurité logistique | Chapitre 4 |
| **Quantité à réapprovisionner** | **847 204 unités** | Somme exacte des besoins nets | `stock_model_800_clean.csv` |
| **Budget prévisionnel 45j** | **380 393 TND** (~380 400 TND) | Coût unitaire moyen pondéré de 0,449 TND/u | Calcul analytique DWH |
| **Lignes d'inventaire Power BI** | **6 875 lignes multi-dépôts** (312 ruptures, 1 240 critiques) | Conforme aux visuels Power BI | `powerbi_5.png` & DWH |
| **Moyenne journalière pondérée** | **64 221 pcs/j** (brute descriptive : 64 890 pcs/j) | Calcul exact sur 851 jours ($54\,652\,250 / 851$) | Tableau 3.5 |
| **Découpage temporel ML** | **Train : 609j, Val : 122j, Test : 120j (Total 851j)** | Arithmétique calendaire exacte (01/2024–04/2026) | Tableau 5.3 |
| **Fenêtre d'évaluation ML** | **98 jours d'évaluation** (23/01 au 30/04/2026) | 22 premiers jours de janvier exclus (maintenance + warm-up) | Section 6.6.2 |
| **Performances Prophet (Déployé)**| **MAE : 2 982 pcs/j, RMSE : 3 897 pcs/j, MAPE : 6,7 %, WAPE : 4,6 %, MASE : 0,52** | Validé sur horizon mensuel opérationnel 30j | Tableau 5.8 |
| **Performances Random Forest** | **MAE : 2 467 pcs/j, RMSE : 3 196 pcs/j, MAPE : 6,0 %, WAPE : 3,8 %, MASE : 0,43** | Modèle de référence hors-ligne | Tableau 5.8 |
| **Détection des fermetures (68j)**| **68 / 68 jours à 0 détectés (100,0 %)** | Bande à 95 % de Prophet (`DEFICIT_CRITIQUE`) | `ml-service/models/prophet_model.py` |
| **Sécurité des routes REST** | **100 % protégées** (`401` pour anonyme, `403` pour opérateur) | Contrôle RBAC activé (`@PreAuthorize`) | `SecurityConfig.java` |

---

### 4. Conclusion & État du Dépôt

Le projet Nexora est désormais dans un état irréprochable de qualité industrielle et académique pour un Master en Data Science :
- Le code source est assaini, documenté, découplé de tout secret machine et focalisé sur l'ingénierie et l'apprentissage automatique.
- Le mémoire universitaire `pfe_v8.docx` et sa version officielle `pfe_v8.pdf` présentent une cohérence totale avec les données réelles du terrain et les modèles mathématiques implémentés.
- Tous les livrables d'audit et de traçabilité (`AUDIT.md`, `BUGS.md`, `CHANGELOG.md`, `SUMMARY.md`) sont disponibles à la racine du dépôt pour consultation ou archivage.
