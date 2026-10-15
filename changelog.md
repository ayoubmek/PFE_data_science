# JOURNAL DES MODIFICATIONS (CHANGELOG.MD)
## Projet Nexora — Système Décisionnel & Prédictif pour la Plasturgie Automobile
**Branche Git :** `pro-cleanup`  
**Version cible du mémoire :** `pfe_v8.docx` & `pfe_v8.pdf`  
**Version originale archivée :** `pfe_v7.docx` (préservée intacte)  
**Date :** 15 Octobre 2026

---

### [8.0.0] - 2026-10-15 (Refonte Qualité, Sécurité, Reproductibilité et Cohérence)

#### 1. Sécurité & Contrôle d'Accès (Spring Boot 3.4.5)
- **Correction critique RBAC (`SecurityConfig.java`)** : Remplacement de la politique permissive `.anyRequest().permitAll()` par une politique d'authentification stricte (`authenticated()`), isolant les points d'accès publics (`/api/auth/**`, `/v3/api-docs/**`, `/actuator/health`).
- **Protection par rôles applicatifs (`@PreAuthorize`)** :
  - `UserController.java` : restreint exclusivement au rôle `ADMIN` (`@PreAuthorize("hasRole('ADMIN')")`).
  - `MLController.java` : restreint au rôle `ADMIN` pour le déclenchement des prédictions d'atelier.
- **Gestionnaire d'erreurs d'autorisation** : Renvoi standardisé du code HTTP `401 Unauthorized` pour les requêtes non authentifiées et `403 Forbidden` pour les requêtes provenant d'un utilisateur sans privilèges (ex. rôle `OPERATEUR`).
- **Tests automatisés de sécurité (`SecurityRbacTest.java`)** : Création et exécution avec succès d'une suite de 6 tests d'intégration JUnit/MockMvc validant les flux d'autorisation (0 échec, 100 % passants).

#### 2. Configuration & Externalisation des Secrets
- **Gabarit d'environnement [`.env.example`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/.env.example)** : Création d'un fichier documentant les variables d'infrastructure (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `SPRING_PORT`, `FASTAPI_PORT`).
- **Suppression des noms d'hôtes en dur** :
  - `backend/src/main/resources/application.yml` : paramétrage dynamique avec support des profils.
  - `etl_pipeline/config.py` : lecture des variables d'environnement avec repli local sécurisé.
  - `ml-service/main.py` : injection dynamique de la chaîne de connexion SQL Server.
- **Centralisation des URLs frontend (`frontend/src/app/config.ts`)** : Unification des appels API via les variables React `REACT_APP_API_URL` et `REACT_APP_ML_URL`, éliminant les URLs codées en dur dans les pages de gestion des stocks, des machines et des utilisateurs.

#### 3. Micro-service Machine Learning & Détection d'Anomalies (FastAPI & Prophet)
- **Détection automatisée des anomalies (Option 1 retenue)** :
  - Implémentation de la méthode `detect_anomalies()` dans `ml-service/models/prophet_model.py` s'appuyant sur les bandes d'incertitude prédictives à 95 % ($\hat{y}_{lower}, \hat{y}_{upper}$).
  - Qualification automatique en trois niveaux d'alerte : `SURCHARGE`, `DEFICIT_MODERE`, et `DEFICIT_CRITIQUE` (fermetures totales).
  - Validation à 100 % sur les 68 jours réels de production nulle de l'historique d'atelier (68/68 jours détectés en déficit critique sans aucun faux négatif).
  - Exposition via le point d'accès REST `POST /detect/anomalies`.
- **Endpoint de supervision de santé (`GET /health`)** : Diagnostic en temps réel de la connectivité SQL Server et de l'état de chargement des 4 modèles (Prophet, Random Forest, ARIMA, Régression Linéaire).
- **Journalisation structurée** : Remplacement des `print()` par le module standard Python `logging`.
- **Métriques industrielles avancées (`ml-service/models/metrics.py`)** : Implémentation des fonctions de calcul `wape()`, `mase()`, et `uncertainty_coverage_95()` conformément aux standards de prévision industrielle.

#### 4. Pipeline ETL (Python 3.10)
- **Horodatage d'exécution détaillé (`etl_pipeline/run_etl.py`)** : Ajout de métriques de durée par étape de traitement (extraction, nettoyage 10 règles, chargement SQL Server).
- **Validation du catalogue maître** : Certification de la sélection des 800 références maîtresses actives issues des familles `PF-PSF`, `Matière`, `Insert`, `Emballage` ayant une consommation active sur 12 mois.

#### 5. Suite de Tests & Reproductibilité
- **Suite de tests automatisés (`tests/run_all_tests.py`)** : 8 tests unitaires indépendants validant en 0,045 s :
  - L'intégrité du catalogue (800 références).
  - La distribution d'inventaire (47 Ruptures, 146 Critiques, 557 Normal, 50 Surstock).
  - Le calcul du plan de réapprovisionnement à 45 jours (193 références, 847 204 unités, 380 393 TND).
  - Les formules d'évaluation MAE, RMSE, MAPE, WAPE (y compris stabilité en présence de zéros).
  - Le comportement du détecteur d'anomalies Prophet (68/68 jours à 0 détectés).
- **Script maître de reproductibilité (`scratch/test_reproduce_report_numbers.py`)** : Validation en 1,64 s de tous les chiffres clés du rapport confrontés aux tables réelles de SQL Server (`dbDWH`).

#### 6. Révision Complète du Rapport (`pfe_v8.docx` & `pfe_v8.pdf`)
- **Préservation de `pfe_v7.docx`** : Le fichier original est conservé intact sans altération. La nouvelle version est compilée sous `pfe_v8.docx` et exportée sous `pfe_v8.pdf` (taille : 4,83 Mo).
- **Section 2.4 & Tableau 2.2** : Actualisation des versions logicielles mesurées (Spring Boot 3.4.5, React 18.0, TypeScript 4.7 [23], Scikit-Learn 1.5.2, Prophet 1.1.6, Power BI Desktop 2.152).
- **Section 3.4 & Tableau 3.5** : Rectification de la note de calcul pondéré (64 221 pcs/j calculés vs 64 890 pcs/j empiriques, delta de +1,04 % expliqué par les chevauchements d'équipes). Clarification de la citation de Kimball [8] pour la modélisation dimensionnelle.
- **Tableaux 3.6 & 3.7** : Qualification formelle de l'échantillon d'audit qualité (51 500 lignes initiales, 32 043 lignes validées, 62,22 % de rétention, 0 % d'anomalies résiduelles).
- **Section 4.5.2 & 4.7** : Harmonisation stricte de la proportion de surstock à **6,25 %** ($50 / 800$). Explicitation du budget d'approvisionnement (380 400 TND / 380 393 TND pour 847 204 unités, coût moyen pondéré de 0,449 TND/u).
- **Clarification des niveaux de granularité (Sec. 4.7 & 6.4.3)** : Distinction entre les **800 références d'articles** du catalogue consolidé (47 ruptures, 146 critiques) et les **6 875 lignes d'inventaire détaillées multi-dépôts** de Power BI (312 ruptures d'emplacements, 1 240 situations critiques).
- **Section 5.4 & 5.5** : Explication du seuil plancher de 12 450 pcs/j en entraînement nominal évitant toute division par zéro en MAPE standard. Intégration des définitions formelles du WAPE et du MASE avec citation de Hyndman & Athanasopoulos [4].
- **Tableau 5.8** : Enrichissement du tableau comparatif des modèles avec les colonnes WAPE (3,8 % pour RF, 4,6 % pour Prophet) et MASE (0,43 pour RF, 0,52 pour Prophet).
- **Nouvelle Section 5.8 (Détection d'anomalies)** : Description détaillée de la détection par bandes d'incertitude Prophet à 95 % et compte-rendu de la validation terrain sur les 68 jours d'arrêt d'atelier (100 % de succès).
- **Section 6.6.2** : Précision que le jeu de test total couvre 120 jours (01/01 au 30/04/2026) et que l'évaluation glissante porte sur 98 jours (23/01 au 30/04/2026) en documentant l'exclusion des 22 premiers jours (7 jours de maintenance usine + 15 jours d'initialisation des variables décalées).
- **Nomenclature unifiée** : Suppression des occurrences sporadiques du mot "Alerte" au profit de la classification quadripartite officielle : Rupture, Critique, Normal, Surstock.
- **Harmonisation des piliers** : Alignement de la description de Nexora en 4 piliers majeurs dans l'Introduction générale, le Résumé et l'Abstract.
- **Nettoyage bibliographique (Norme IEEE)** :
  - Remplacement de l'entrée [23] par B. Cherny, *Programming TypeScript*, O'Reilly, 2019.
  - Remplacement de l'entrée [8] par R. Kimball & M. Ross, *The Data Warehouse Toolkit*, 3e éd., 2013.
  - Intégration et citation active des références [4] (Hyndman), [5] (Géron), [6] (Hastie et al.), [9] (Silver et al.), [13] (Hunter), et [25] (Nakajima). Zéro référence orpheline.
