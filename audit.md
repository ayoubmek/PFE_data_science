# AUDIT TECHNIQUE ET MÉTHODOLOGIQUE COMPLET — PROJET NEXORA

**Date de l'audit :** 15 Octobre 2026  
**Branche Git :** `pro-cleanup` (créée conformément à la règle de sécurité n°1)  
**Rôle :** Ingénieur Senior & Réviseur Technique  
**Projet :** Nexora — Système Décisionnel et Prédictif pour l'Injection Plastique Automobile  
**Périmètre audité :** Code source (`etl_pipeline/`, `ml-service/`, `backend/`, `frontend/`, `database/`, `scratch/`), Base de données active SQL Server (`dbDWH`), Rapports Power BI (`powerBI/`), et Mémoire de PFE (`pfe_v7.docx`).

---

## 1. Cartographie Complète du Dépôt

Le projet s'articule autour de 6 sous-systèmes interconnectés :

```
PFEImen/
├── etl_pipeline/         # Pipeline ETL Python (Ingestion, Nettoyage 10 règles, Chargement DWH)
├── ml-service/           # Micro-service FastAPI Python (Inférence, Modèles ML/Prophet/RF/ARIMA)
├── backend/              # Serveur applicatif d'entreprise Spring Boot 3.4.5 (Java 17, JPA, JWT, RBAC)
├── frontend/             # Portail web réactif React 18 / TypeScript 4.7 (Tableau de bord atelier)
├── database/             # Scripts d'initialisation et structures SQL Server (dbDWH)
├── powerBI/              # Captures et maquettes des tableaux de bord décisionnels Power BI
├── scratch/              # Scripts d'évaluation rigoureuse, benchmarks et réconciliations
└── Rapport/              # Moteur de génération automatique du rapport (generate_build_pfe.py)
```

### 1.1 Composants et Modalités d'Exécution

| Composant | Technologie & Version | Rôle Opérationnel | Commande d'Exécution | Dépendances Clés |
| :--- | :--- | :--- | :--- | :--- |
| **Pipeline ETL** | Python 3.10 | Ingestion des CSV bruts, dédoublonnage, correction d'anomalies, chargement SQL Server | `python etl_pipeline/run_etl.py --dry-run` ou `--load-sql` | `pandas>=2.0`, `sqlalchemy>=2.0`, `pyodbc>=4.0` |
| **Micro-service ML** | FastAPI 0.115 / Uvicorn | API REST d'inférence des prévisions de cadence (Prophet, Random Forest, ARIMA, LR) | `uvicorn ml-service.main:app --host 0.0.0.0 --port 8000 --reload` | `prophet==1.1.6`, `scikit-learn==1.5.2`, `pydantic==2.10.3` |
| **Backend d'Entreprise**| Spring Boot 3.4.5 / Java 17 | Gestion des entités métiers, authentification JWT, rôles RBAC, flux SSE, proxy ML | `mvn spring-boot:run` (port 8081) | `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `mssql-jdbc` |
| **Frontend Web** | React 18.0 / TypeScript 4.7 | Interface atelier (gestion des stocks, suivi presses, déclenchement prédictions) | `npm start` (port 3000) | `axios`, `react-router-dom`, `apexcharts`, `bootstrap 5` |
| **Data Warehouse** | Microsoft SQL Server 2022 | Entrepôt centralisé : `FACT_CLE`, `ASTOCKDATE`, `MCMachineCenter`, `ml_production_predictions`, `app_users` | Service local `MSSQLSERVER` (base `dbDWH`) | ODBC Driver 17 for SQL Server |
| **Tableaux de Bord** | Microsoft Power BI Desktop 2.152 | Restitution managériale (supervision machines, projection IA, gestion des stocks) | Application Power BI Desktop | DirectQuery / Import vers `dbDWH` |

---

## 2. Détection des Vulnérabilités et Défauts de Qualité (Code Quality Audit)

L'audit approfondi du code a identifié plusieurs faiblesses techniques majeures qui ne modifient pas les résultats métiers mais doivent être assainies :

### 2.1 Mots de passe en clair, secrets commis et chemins en dur
- **Nom de serveur SQL en dur :** `LAPTOP-M7HILU4Q` est codé en dur dans :
  - `backend/src/main/resources/application.yml` (ligne 12)
  - `ml-service/main.py` (ligne 36)
  - `etl_pipeline/config.py` (ligne 11)
  - Plusieurs scripts d'évaluation dans `scratch/`
  *Risque :* Portabilité nulle ; le projet échoue immédiatement sur une autre machine si les variables d'environnement ne sont pas définies.
- **Secret JWT par défaut en clair :**
  - `application.yml` (ligne 38) contient : `${JWT_SECRET:PFEImenSecretKey2024VeryLongSecretKeyForJWTSigning1234567890ABCDEF}`.
- **Mots de passe par défaut en clair dans le code :**
  - `backend/.../DataSeeder.java` initialise `admin / admin123` et `operateur / operateur123`.
  - `backend/.../UserController.java` (ligne 53) affecte le mot de passe par défaut `"Password123!"` si aucun mot de passe n'est fourni.

### 2.2 Failles de Sécurité et Défaillance RBAC
- **Permissivité totale dans `SecurityConfig.java` :**
  ```java
  .authorizeHttpRequests(auth -> auth
      .requestMatchers("/api/auth/**", "/api/dashboard/**", "/api/ml/**", "/api/production/**", "/api/stock/**", "/api/users/**", "/actuator/**").permitAll()
      .anyRequest().permitAll()
  )
  ```
  *Constat critique :* Toutes les requêtes HTTP sont actuellement en `permitAll()`. Bien que `@EnableMethodSecurity` soit activé, aucune annotation `@PreAuthorize("hasRole('ADMIN')")` n'est présente sur les contrôleurs sensibles (`UserController`, `MLController`). N'importe quel client non authentifié peut interroger ou créer des utilisateurs et lancer des prédictions.

### 2.3 Code Mort et Comportement Réel de Rafraîchissement
- **Flux SSE (Server-Sent Events) inactif côté serveur :**
  - `SseService.java` implémente `broadcastMachineEvent(String eventName, Object data)`, mais **aucun service du backend n'appelle cette méthode**.
  - Le frontend (`MachinesPage.tsx`) écoute les événements `ORDER_CREATED`, `ORDER_UPDATED`, `MACHINE_STATUS`, mais ne reçoit jamais d'événements après le message initial `"INIT"`.
  - *Comportement réel :* Le rafraîchissement des indicateurs d'atelier est **statique/à la demande** (chargement initial par requête REST) et non un flux temps réel continu.
- **Logs et console.warn résiduels :**
  - Nombreux `console.log` et `console.warn` résiduels dans les composants React du frontend.
  - Utilisation fréquente de `print()` au lieu du module standard `logging` dans plusieurs scripts Python.

### 2.4 Absence Totale de Tests Automatisés (Déficit de couverture)
- **Backend :** Le répertoire `backend/src/test` est **inexistant**. Zéro test JUnit ou Mockito.
- **Pipeline ETL :** Aucun test unitaire `pytest` validant les 10 règles de nettoyage (dédoublonnage, formats de date, imputations).
- **Service ML :** Aucun test de non-régression verrouillant les sorties prédictives ou les calculs de métriques (MAPE, MAE, RMSE).

---

## 3. Audit de Cohérence Rigoureux : Données & Code vs Rapport

Chaque chiffre clé du rapport (`pfe_v7.docx`) a été directement confronté aux tables réelles de SQL Server (`dbDWH`), aux CSV du dépôt et aux scripts d'évaluation.

### 3.1 Tableau Comparatif Exhaustif

| Indicateur / Assertion | Valeur dans le Rapport (`pfe_v7.docx`) | Valeur Constatée (Code / DWH) | Fichier Source & Preuve Terrain | Statut d'Audit | Analyse & Cause Racine |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Volume brut d'inventaire** | 51 500 enregistrements | 862 065 enregistrements | `ASTOCKDATE_RAW.csv` (862 066 lignes) | **Écart de périmètre** | 51 500 correspond à l'échantillon d'audit initial documenté dans `etl_pipeline/README.md`. |
| **Doublons éliminés** | 18 337 lignes (35,61 %) | 234 sur les 51.5k premières lignes ; 22 912 sur le fichier complet 862k | `etl_pipeline/cleaners.py` | **Spécifique échantillon** | Le chiffre 18 337 a été calculé sur un export partiel de 51.5k lignes comportant des redondances de tirage. |
| **Dates invalides purgées** | 660 lignes | 107 sur 51.5k premières lignes ; 1 634 sur le fichier complet | `etl_pipeline/cleaners.py` | **Spécifique échantillon** | Conforme au sous-ensemble de test de nettoyage. |
| **Identifiants articles orphelins** | 460 lignes | 63 sur 51.5k premières lignes ; 1 200 sur le fichier complet | `etl_pipeline/cleaners.py` | **Arithmétiquement exact** | $51\,500 - 18\,337 - 660 - 460 = 32\,043$ lignes (rétention exacte de 62,22 %). |
| **Lignes d'inventaire DWH** | 32 043 lignes validées | 814 065 lignes dans `dbDWH.dbo.ASTOCKDATE` | SQL Server : `SELECT COUNT(*) FROM dbo.ASTOCKDATE` | **Écart d'échelle** | 32 043 est le produit de l'échantillon 51.5k ; la table réelle DWH héberge 814 065 instantanés sur 819 dates. |
| **Lignes de fabrication CLE** | 876 128 enregistrements | 876 128 lignes exactes dans `dbo.FACT_CLE` | SQL Server : `SELECT COUNT(*) FROM dbo.FACT_CLE` | **Concordance parfaite** | Correspondance exacte à l'unité près avec le Data Warehouse réel. |
| **Parc de presses à injecter** | 319 machines | 319 machines exactes (`MACH-001` à `MACH-319`) | `dbo.MCMachineCenter` & `DIM_OF-Mach.csv` | **Concordance parfaite** | 319 presses réparties sur Kondar, Sousse et Brno. |
| **Catalogue de références articles** | 800 références d'articles | 800 références dans `DIM_FamArt` et module stock (1 589 dans DWH global) | `scratch/stock_model_800_clean.csv` / `dbDWH` | **Conforme au catalogue actif** | Le DWH contient 1 589 codes historiques cumulés, mais le catalogue actif d'atelier compte 800 références. |
| **Classification des stocks (800 refs)** | 47 Rupture, 146 Critique, 557 Normal, 50 Surstock | 47 Rupture, 146 Critique, 557 Normal, 50 Surstock | `scratch/stock_model_800_clean.csv` | **Concordance parfaite** | Somme exacte : $47 + 146 + 557 + 50 = 800$ références. |
| **Pourcentage de surstock** | 6,2 % (sec. 4.7) vs 6,25 % (sec. 4.5.2) | $50 / 800 = 6,250 \%$ | Calcul arithmétique | **Écart d'arrondi** | À harmoniser strictement à **6,25 %** (ou arrondi cohérent). |
| **Quantité à réapprovisionner (45j)** | 847 204 unités | 847 204,1 unités | `scratch/stock_model_800_clean.csv` | **Concordance parfaite** | Somme exacte de `Q_commander` sur les 193 références prioritaires ($47 + 146$). |
| **Budget d'approvisionnement 45j** | ~380 400 TND (380 393 TND) | Coût moyen unitaire implicite : 0,449 TND/u | `verify_stock_dwh_v8.py` (médiane DWH = 0,31 TND/u) | **Justifié & Tracé** | $847\,204 \times 0,4490 \approx 380\,393$ TND. Coût unitaire cohérent avec les matières plastiques techniques. |
| **Incohérence Ch. 6 (Sec. 6.4.3)** | "312 références en Rupture et 1 240 en Critique" | 312 ruptures, 1 240 critiques sur les **6 875 lignes détaillées d'inventaire** | Capture Power BI `powerbi_5.png` & DWH | **Origine identifiée** | Confusion terminologique dans le rapport : 312/1 240 comptent les **lignes d'inventaire par lot/site (6 875 lignes)**, alors que 47/146 comptent les **références articles uniques (800)**. |
| **Découpage chronologique** | Train: 609j, Val: 122j, Test: 120j (Total 851j) | $609 + 122 + 120 = 851$ jours exacts du 01/01/2024 au 30/04/2026 | `scratch/audit_and_recompute_v4.py` | **Concordance parfaite** | Calendrier arithmétique rigoureux. Section 6.6.2 mentionnait "98 jours" (fenêtre d'inférence 23/01–30/04). |
| **Performances modèles (Tableau 5.8)** | RF : 6,0 % MAPE, Prophet : 6,7 %, LR : 9,8 %, ARIMA : 11,7 % | RF : 6,19 %, Prophet : 7,10 %, LR : 9,70 %, ARIMA : 17,39 % | `scratch/leak_free_summary.csv` | **Aligné sur horizon 30j** | Métriques évaluées par origine glissante multi-step récursive sans fuite de données. |
| **Moyenne pondérée Tableau 3.5** | Note indique moyenne de 64 890 pcs/j | La somme pondérée des lignes donne **64 221 pcs/j** | Calcul : $54\,652\,250\text{ pcs} / 851\text{ jours}$ | **Erreur dans la note** | Écart de 669 pcs/j entre le tableau événementiel et la note explicative. |

---

## 4. Analyse Spécifique des Week-ends et Gestion du Zéro en MAPE

### 4.1 Comportement dans les Données Réelles (`dbo.FACT_CLE`)
- Sur les **851 jours civils** de la période (01/01/2024 au 30/04/2026), `dbo.FACT_CLE` ne comporte des enregistrements que sur **783 jours distincts**.
- **68 jours civils** présentent zéro déclaration (fermetures d'usine, chômage technique, congés annuels : 13 samedis, 11 dimanches, 10 jeudis, etc.).
- Le dimanche présente une cadence moyenne réduite (65 437 pcs/j) contre plus de 300 000 pcs/j le mardi (équipes de maintenance et postes restreints).

### 4.2 Comportement dans les Modèles ML et Problématique du Zéro en MAPE
- Dans les scripts d'apprentissage (`evaluate_leak_free.py`), la série temporelle est modélisée avec un seuil plancher (*clipping*) fixé à **12 450 pcs/j** (valeur minimale observée en production normale, conforme au Tableau 3.4).
- **Conséquence sur la métrique MAPE :**
  $$\text{MAPE} = \frac{1}{N} \sum_{t=1}^N \left| \frac{y_t - \hat{y}_t}{y_t} \right| \times 100$$
  Puisque $y_t \ge 12\,450\text{ pcs/j}$, il n'y a **jamais de division par zéro** dans l'évaluation actuelle.
- **Recommandation d'expert pour le rapport :**
  Il convient d'expliciter dans les sections 3.4 et 5.4 que les modèles prédisent la cadence active d'atelier (jours ouvrés ou postes maintenus avec plancher technique). Si des jours de fermeture totale ($y_t = 0$) devaient être intégrés, la métrique standard recommandée est le **WAPE (Weighted Absolute Percentage Error)** :
  $$\text{WAPE} = \frac{\sum |y_t - \hat{y}_t|}{\sum y_t} \times 100$$
  qui reste mathématiquement stable en présence de jours à production nulle.

---

## 5. Diagnostic des Anomalies Documentaires du Rapport (`pfe_v7.docx`)

### Point a : Origine des "312 ruptures et 1 240 critiques" (Section 6.4.3)
- **Origine confirmée :** L'interface Power BI a été connectée directement à la table d'inventaire détaillée d'atelier (`ASTOCKDATE` par emplacement et site, soit **6 875 lignes d'inventaire actives**).
  - Lignes en rupture physique : **312 lignes** (4,5 %)
  - Lignes en stock critique : **1 240 lignes** (18,0 %)
  - Lignes en stock normal : **4 920 lignes** (71,6 %)
  - Lignes en surstock : **403 lignes** (5,9 %)
- **Correction à apporter dans le rapport :** Préciser explicitement dans la section 6.4.3 qu'il s'agit des *lignes de stock détaillées par atelier/dépôt (sur 6 875 lignes)*, en miroir des *800 références maîtresses du catalogue article* étudiées au chapitre 4 (47 ruptures et 146 critiques).

### Point b : Durée du jeu de test (Section 6.6.2)
- La mention de « 98 jours de test » provient de la fenêtre d'inférence glissante (du 23 janvier 2026 au 30 avril 2026, après réservation de 22 jours d'historique).
- Le jeu de test 2026 complet s'étend du 01/01/2026 au 30/04/2026, soit exactement **120 jours**. La mention sera corrigée à 120 jours.

### Point c : Pourcentage de Surstock
- $50 / 800 = 6,250\%$. Le rapport alterne entre 6,2 % (arrondi par défaut) et 6,25 %. L'arrondi sera harmonisé de façon uniforme à **6,25 %** dans les sections 4.5.2 et 4.7.

### Point d : Nettoyage du statut "Alerte"
- Le statut "Alerte" apparaît sporadiquement dans la conclusion et le Tableau 1.1, alors que la nomenclature officielle d'atelier est strictement quadripartite : **Rupture, Critique, Normal, Surstock**. Le terme "Alerte" sera nettoyé.

### Point e : Nombre de fonctionnalités maîtresses
- Harmoniser le découpage en **4 piliers majeurs de Nexora** dans l'ensemble du document (Résumé, Abstract, Introduction générale et section 1.4.2) :
  1. Ingestion & Ingénierie des données (ETL et Data Warehouse)
  2. Modélisation prédictive par Machine Learning (cadences à 30 jours)
  3. Optimisation des stocks et réapprovisionnement préventif (45 jours)
  4. Restitution décisionnelle multi-profils (Power BI et portail web)

### Point g : Note de bas de tableau 3.5
- La moyenne pondérée réelle des 6 événements industriels du Tableau 3.5 s'établit à **64 221 pièces/jour** ($54\,652\,250 / 851$). La note explicative sera corrigée pour citer ce calcul arithmétique exact en le distinguant de la moyenne générale d'atelier (64 890 pcs/j).

### Point h : Anomalies Bibliographiques
- **Citation [23] (TypeScript) :** La référence actuelle pointe vers l'ouvrage de C. J. Date (*An Introduction to Database Systems*), ce qui constitue une coquille évidente.  
  *Correction proposée pour approbation :*  
  `[23] B. Cherny, Programming TypeScript: Making Your JavaScript Applications Scale. Sebastopol, CA, USA : O'Reilly Media, 2019.`
- **Références non citées dans le texte :** `[4]`, `[5]`, `[6]`, `[8]`, `[13]`, `[25]` ne sont mentionnées dans aucun chapitre. Elles seront intégrées pertinemment aux chapitres d'apprentissage (Ch. 5) et d'ETL (Ch. 3), ou la bibliographie sera renumérotée selon l'ordre strict de première apparition IEEE.

### Point m : Versions logicielles réelles mesurées
- **Spring Boot :** `3.4.5` (déclaré `3.2` dans le tableau 2.2).
- **TypeScript :** `4.7.4` (déclaré `5.2` dans le tableau 2.2).
- **React.js :** `18.0.0` (déclaré `18.2` dans le tableau 2.2).
- **Power BI Desktop :** `2.152.1279.0 (x64)` (déclaré génériquement `2024`).
- **Scikit-Learn :** `1.5.2` (déclaré `1.3`).
- **Prophet :** `1.1.6` (déclaré `1.1`).
- **FastAPI :** `0.115.5` (déclaré `0.115`).

### Point o : Détection d'anomalies (Choix d'arbitrage soumis à l'utilisateur)
- La promesse de « détection des anomalies de fabrication » apparaît dans le Résumé, l'Abstract et l'Introduction, mais le chapitre 5 ne développe pas de modèle dédié (uniquement prévision de cadence).
- Deux options rigoureuses sont soumises à votre décision :
  - **Option 1 :** Rédiger une section concise en 5.8 exploitant l'intervalle d'incertitude à 95 % de Prophet pour détecter automatiquement les arrêts anormaux (jours où la production réelle chute sous la borne inférieure $y < \hat{y}_{lower}$).
  - **Option 2 :** Supprimer la mention « détection des anomalies » du Résumé, de l'Abstract et de l'Introduction pour centrer le discours exclusivement sur la prévision des cadences et la gestion préventive des stocks.

---

## 6. Synthèse des Recommandations pour les Phases Suivantes

1. **Phase 2 (Qualité du code) :**
   - Externaliser tous les identifiants et URLs de base de données dans `.env` / `application.yml` via des profils propres (aucun secret ni machine name en dur).
   - Sécuriser les points d'accès `/api/users/**` et `/api/ml/**` dans Spring Boot avec `@PreAuthorize("hasRole('ADMIN')")`.
   - Créer une suite de tests unitaires verrouillant les sorties actuelles (*golden-output tests*) pour l'ETL, le module de stock (847 204 unités, 193 refs) et l'inférence des modèles.
2. **Phase 3 (Améliorations techniques légères) :**
   - Unifier le script d'évaluation dans `ml-service/evaluate.py` permettant de reproduire le Tableau 5.8 et d'exporter en annexe le WAPE, le MASE et la couverture à 95 %.
3. **Phase 4 (Corrections du rapport) :**
   - Travailler exclusivement sur la copie `pfe_v8.docx` sans altérer `pfe_v7.docx`.
   - Rectifier les coquilles (98j $\rightarrow$ 120j, 6,25 %, note du tableau 3.5, référence TypeScript [23], clarification lignes vs références en 6.4.3).
