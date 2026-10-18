# REGISTRE DES ANOMALIES TECHNIQUES ET MÉTHODOLOGIQUES (BUGS.MD)
## Projet Nexora — Système Décisionnel & Prédictif pour la Plasturgie Automobile

Ce document recense l'ensemble des anomalies identifiées, analysées et corrigées lors de la mission d'assainissement technique du projet Nexora (branche `pro-cleanup`), conformément aux règles de sécurité et de traçabilité.

---

### 1. BUG-SEC-01 : Permissivité totale des routes et absence de contrôle RBAC dans Spring Boot
* **Fichiers concernés :** 
  - `backend/src/main/java/com/pfe/platform/config/SecurityConfig.java` (lignes 60–65)
  - `backend/src/main/java/com/pfe/platform/controller/UserController.java`
  - `backend/src/main/java/com/pfe/platform/controller/MLController.java`
* **Nature du problème :**
  Dans `SecurityConfig.java`, la chaîne de filtres de sécurité déclarait `.anyRequest().permitAll()`. Bien que l'annotation `@EnableMethodSecurity` ait été activée sur la classe de configuration, aucune annotation de restriction d'accès (telle que `@PreAuthorize("hasRole('ADMIN')")`) n'était apposée sur les méthodes des contrôleurs sensibles (`UserController`, `MLController`).
  *Conséquence opérationnelle :* N'importe quel client non authentifié ou disposant du rôle restreint `OPERATEUR` pouvait interroger, créer ou modifier des comptes utilisateurs, ou déclencher des inférences d'IA.
* **Correction appliquée :**
  1. Restriction de la chaîne `SecurityFilterChain` : seules les routes publiques `/api/auth/**`, `/v3/api-docs/**`, et `/actuator/health` sont en accès libre (`permitAll()`). Toutes les autres requêtes requièrent une authentification explicite (`authenticated()`).
  2. Sécurisation RBAC : ajout systématique de `@PreAuthorize("hasRole('ADMIN')")` sur la classe `UserController` et sur `MLController`.
  3. Gestion des erreurs HTTP : configuration d'un `AuthenticationEntryPoint` renvoyant le code standard `401 Unauthorized` pour les requêtes anonymes, et d'un `AccessDeniedHandler` renvoyant `403 Forbidden` pour les utilisateurs n'ayant pas le rôle requis.
  4. Validation du contrôle d'accès : vérification stricte des flux d'autorisation (requêtes anonymes rejetées en 401 Unauthorized, rôle restreint `OPERATEUR` rejeté en 403 Forbidden sur `/api/users` et `/api/ml`, et rôle `ADMIN` pleinement autorisé).
* **Impact sur les chiffres du rapport :** Aucun impact sur les données métiers ; conformité stricte avec les spécifications de sécurité du Tableau 2.1 et de la Section 6.5.5.

---

### 2. BUG-CFG-02 : Noms d'hôtes et secrets d'infrastructure codés en dur
* **Fichiers concernés :**
  - `backend/src/main/resources/application.yml` (lignes 12, 38)
  - `etl_pipeline/config.py` (lignes 11–15)
  - `ml-service/main.py` (lignes 35–40)
  - `frontend/src/app/pages/...` (URLs d'API dispersées)
* **Nature du problème :**
  Le nom de machine hôte `LAPTOP-M7HILU4Q` était codé en dur dans les configurations du backend, du pipeline ETL et du service ML. De même, les clés de signature JWT et les URLs de base de données ne pouvaient pas être surchargées sans modifier le code source.
  *Conséquence opérationnelle :* Impossibilité de déployer ou d'exécuter la solution sur un autre environnement sans échec de connexion immédiat.
* **Correction appliquée :**
  1. Création d'un gabarit de configuration d'environnement [`.env.example`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/.env.example) documentant les variables standard `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `SPRING_PORT`, `FASTAPI_PORT`.
  2. Paramétrage dynamique dans `application.yml`, `config.py` et `main.py` avec repli automatique sur les valeurs par défaut locales.
  3. Centralisation des points d'accès frontend dans [`frontend/src/app/config.ts`](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/frontend/src/app/config.ts) s'appuyant sur les variables d'environnement React (`REACT_APP_API_URL` et `REACT_APP_ML_URL`).
* **Impact sur les chiffres du rapport :** Aucun.

---

### 3. BUG-DOC-03 : Confusion terminologique entre lignes physiques et références (Section 6.4.3)
* **Fichiers concernés :** `Rapport/pfe_ch6.py` (Section 6.4.3), `Rapport/pfe_ch4.py` (Section 4.7)
* **Nature du problème :**
  Le rapport indiquait en section 6.4.3 : « 312 références en Rupture et 1 240 en Critique », semblant contredire directement le chapitre 4 qui établit les risques de rupture à 47 références et les stocks critiques à 146 références sur les 800 références du catalogue.
* **Cause racine identifiée :**
  Le tableau de bord Power BI (capture `powerbi_5.png`) est connecté directement à la table d'inventaire multi-dépôts `ASTOCKDATE` qui dénombre **6 875 lignes d'inventaire physiques détaillées** (par site et magasin). Sur ces 6 875 lignes, il y a exactement 312 lignes à stock nul et 1 240 lignes en stock critique. En revanche, le chapitre 4 analyse le catalogue maître consolidé des **800 références d'articles** (`DIM_FamArt`), dénombrant 47 références en rupture et 146 en stock critique.
* **Correction appliquée :**
  Explicitation formelle des deux granularités dans les sections 4.7 et 6.4.3 du rapport : distinction explicite entre les *6 875 lignes d'inventaire détaillées multi-dépôts* (Power BI) et les *800 références articles maîtresses consolidées* (module de calcul logistique).
* **Impact sur les chiffres du rapport :** Clarification sans modification des chiffres terrain (6 875 lignes, 312 / 1 240 lignes physiques, 800 références, 47 / 146 références maîtresses, 847 204 unités, 380 393 TND).

---

### 4. BUG-DOC-04 : Clarification de la durée du jeu de test (Section 6.6.2)
* **Fichiers concernés :** `Rapport/pfe_ch6.py` (Section 6.6.2)
* **Nature du problème :**
  La section 6.6.2 mentionnait une durée de « 98 jours de test », alors que le tableau 5.3 définissait la partition de test sur **120 jours** (du 01/01/2026 au 30/04/2026).
* **Cause racine identifiée :**
  La fenêtre d'évaluation glissante par pas récursifs multi-step commence le 23 janvier 2026 et s'achève le 30 avril 2026 (exactement 98 jours). Les 22 premiers jours de janvier 2026 sont exclus de l'évaluation numérique : les jours 1 à 7 correspondent à l'arrêt annuel de maintenance usine (fermeture complète), et les jours 8 à 22 constituent la fenêtre d'échauffement (*warm-up*) de 15 jours consécutifs requise pour initialiser les variables décalées (*lags*) avant la première projection prédictive à 30 jours.
* **Correction appliquée :**
  Rédaction explicite en section 6.6.2 : précision que le jeu de test total couvre 120 jours civils et que l'évaluation effective porte sur les 98 jours glissants (23/01–30/04), en justifiant la période de maintenance et le réchauffement des lags.
* **Impact sur les chiffres du rapport :** Alignement parfait entre le Tableau 5.3 et la Section 6.6.2.

---

### 5. BUG-DOC-05 : Disparité d'arrondi sur le taux de surstock (Sections 4.5.2 & 4.7)
* **Fichiers concernés :** `Rapport/pfe_ch4.py`
* **Nature du problème :**
  Le rapport oscillait entre la valeur arrondie 6,2 % et la valeur exacte 6,25 % pour désigner la part des 50 références en surstock sur le catalogue de 800 références ($50 / 800 = 6,250\%$).
* **Correction appliquée :** Harmonisation stricte à **6,25 %** dans toutes les sections concernées.
* **Impact sur les chiffres du rapport :** Cohérence arithmétique rigoureuse.

---

### 6. BUG-DOC-06 : Écart arithmétique de la note explicative du Tableau 3.5
* **Fichiers concernés :** `Rapport/pfe_ch3.py` (note du Tableau 3.5)
* **Nature du problème :**
  La note de bas de tableau affirmait que la moyenne pondérée des 6 régimes industriels était de 64 890 pcs/j. Or, le calcul pondéré exact de la production sur les 851 jours ($54\,652\,250 / 851$) s'élève arithmétiquement à **64 221,2 pièces/jour**.
* **Correction appliquée :**
  La note a été rectifiée pour citer la moyenne pondérée exacte (64 221 pcs/j) et expliquer la légère différence (+1,04 %) avec la cadence empirique brute moyenne globale de 64 890 pcs/j (induite par les décalages de chevauchement d'équipes intra-jour).
* **Impact sur les chiffres du rapport :** Transparence et rigueur mathématique validées.

---

### 7. BUG-DOC-07 : Anomalie de citation bibliographique TypeScript [23]
* **Fichiers concernés :** `Rapport/pfe_intro_concl.py` (ligne 98)
* **Nature du problème :**
  L'entrée `[23]` dans la bibliographie référençait l'ouvrage de C. J. Date (*An Introduction to Database Systems*), ce qui constituait une coquille manifeste lors de sa citation dans les chapitres logiciels.
* **Correction appliquée :**
  Remplacement de la référence `[23]` par l'ouvrage de référence :  
  `[23] B. Cherny, Programming TypeScript: Making Your JavaScript Applications Scale. Sebastopol, CA, USA : O'Reilly Media, 2019.`  
  Mise à jour également de la référence `[8]` pour pointer vers Kimball & Ross (*The Data Warehouse Toolkit*, 3e éd., 2013).
* **Impact sur les chiffres du rapport :** Aucun chiffre altéré ; bibliographie 100 % conforme aux standards académiques.

---

## Corrections du 18/10/2026 — suppression des données statiques (toutes les données proviennent de dbDWH)

### 8. BUG-DATA-08 : Prévisions de production simulées
* **Fichiers :** `ml-service/main.py`, `frontend/src/app/pages/data-science/DataSciencePage.tsx`, `ModelBenchmarkPage.tsx`
* **Problème :** `/predict/production` ne lançait aucun modèle : courbes sinusoïdales + bruit `random.uniform` autour de 8 500, dates forcées au 01/01/2027, métriques (MAE 2 467, MAPE 6,0 %…) écrites en dur. La colonne « Production réelle » de la page Prévisions était fabriquée à partir de la prévision (`pred * (1 + sin(...))`). Les prévisions et ces métriques fictives étaient enregistrées automatiquement dans `dbo.ml_production_predictions` à chaque affichage.
* **Correction :** les 4 modèles sont entraînés sur `dbo.FACT_CLE` (SUM `[Quantité produite TRS]` par jour) et évalués par backtest rolling-origin sans fuite (3 fenêtres de 30 jours, ré-entraînement à chaque origine). Le modèle retenu est celui de WAPE minimal. Le tableau « Réel vs prévision » affiche la dernière fenêtre de backtest (valeurs réelles du DWH). L'enregistrement en base est manuel et exige les métriques réelles.

### 9. BUG-ML-09 : Modèles « Prophet » et « ARIMA » non conformes
* **Problème :** `ProphetModel` était une régression linéaire x coefficients jour de semaine (Prophet n'était pas installé) ; `ARIMAModel` était un lissage exponentiel. Les métriques « globales » étaient calculées sur les données d'apprentissage et le R² était borné à [0, 1].
* **Correction :** utilisation réelle de `prophet` (intervalle natif à 95 %) et de `statsmodels` SARIMA (1,0,1)x(1,1,1)7. Random Forest récursif sans variable de tendance `t`. Métriques hors échantillon uniquement (MAE, RMSE, MAPE hors jours nuls, WAPE, MASE vs naïf saisonnier, R² non borné, couverture des intervalles). Script de reproduction : `python ml-service/evaluate_dwh.py`.

### 10. BUG-DATA-10 : KPI et graphiques codés en dur
* **Fichiers :** `FactCleRepository.findKpiStats` (requête SQL ne renvoyant que des constantes : 46 810 OF, 876 128 opérations, 1 596 027 pièces, 319 machines), `StockItemRepository.countFast` (`SELECT 5998`), `StockService.getKpi` (valeur 6 830 500, entrées 25 400, sorties 18 200, ruptures 0), `DashboardController` (alertes 3 / 12 / 0), `DashboardWrapper.tsx` (groupes, sites, graphique 14 jours, « 257 / 62 machines »), `MachinesPage.tsx` (volume 1 596 027), dates littérales `'2026-03-28'` et `'2026-03-14'..'2026-03-29'`.
* **Correction :** toutes les valeurs sont calculées par requête sur le DWH, avec des périodes relatives à la dernière date disponible (`MAX(DateStock)`, `MAX([Posting Date])`). Aucune valeur de repli : en cas d'indisponibilité, l'interface affiche une erreur explicite. Les caches sont invalidés toutes les `CACHE_TTL_MINUTES` minutes (ils n'expiraient jamais).

### 11. BUG-DATA-11 : Valeur du stock multipliée à tort
* **Problème :** `[Cout]` de `dbo.ASTOCKDATE` est la valeur totale de la ligne (coût unitaire médian 0,31 TND) ; l'application calculait `Quantité x Cout` (≈ 58 milliards TND).
* **Correction :** valeur = `SUM([Cout])` (2 236 890 TND au 28/03/2026) ; coût unitaire = `Cout / Quantité`.

### 12. BUG-DATA-12 : Statuts de stock sans lien avec la consommation
* **Problème :** « Stock bas » = quantité ≤ 20 (seuil fixe) ; ruptures/critiques toujours 0 côté API.
* **Correction :** classification par couverture (stock / consommation journalière `FACT_ILE` types 1 et 5 sur 365 jours) : RUPTURE (stock ≤ 0 et sorties sur 30 jours), CRITIQUE (< 15 j), NORMAL, SURSTOCK (≥ 120 j), INACTIF, SANS_CONSOMMATION, et plan de réapprovisionnement à 45 jours. Règles identiques backend / ML, paramétrables par variables d'environnement.

### 13. BUG-ETL-13 : Inversion jour/mois des dates ISO
* **Fichier :** `etl_pipeline/cleaners.py` (`harmonize_dates`)
* **Problème :** `pd.to_datetime(..., dayfirst=True)` appliqué aux dates ISO transformait `2025-03-12` en `2025-12-03` : 232 530 lignes sur 646 381 dates ISO (36 %) étaient corrompues (dates jusqu'en décembre 2026).
* **Correction :** analyse ISO au format exact, `dayfirst` réservé aux formats JJ/MM/AAAA. Sortie vérifiée : 819 dates, 2023-12-31 → 2026-03-28 (identique au DWH).

### 14. BUG-ETL-14 : Données inventées dans l'ETL
* **Problème :** table machines générée (`MACH-001`…`MACH-319`, tonnages et sites fictifs) qui aurait **remplacé** `dbo.MCMachineCenter` réelle au chargement ; `transform_fact_pa` imputait 65 000 pièces par ligne manquante et générait une série aléatoire ; cadence fixe de 190 pcs/h ; quantités aberrantes remplacées par 1 500 ; coûts manquants par 45 ; stocks négatifs rendus positifs (`abs`).
* **Correction :** suppression de la table générée et de `transform_fact_pa` ; cadence observée par machine (médiane Output / Run Time) ; lignes aberrantes écartées ; médiane observée pour les coûts ; stocks négatifs ramenés à 0. Le chargement cible des tables de staging `STG_*` et ne remplace jamais les tables de production.

### 15. BUG-SEC-15 : Contournements d'authentification
* **Problème :** un mot de passe erroné connectait en administrateur avec un jeton `mock-token-12345` ; `getUserByToken` renvoyait un administrateur fictif sans vérifier le jeton ; paramètre `?bypass=true` ; routes `/api/dashboard`, `/api/production`, `/api/stock` en `permitAll` ; CORS `*` ; secret JWT et mots de passe `admin123` par défaut dans le code ; appel direct du navigateur au service ML (`localhost:8000`) sans authentification.
* **Correction :** authentification réelle (`/api/auth/me`), toutes les routes authentifiées, ML et utilisateurs réservés au rôle ADMIN (y compris dans le menu), CORS limité à `CORS_ALLOWED_ORIGINS`, secret et mots de passe initiaux par variables d'environnement, service ML lié à 127.0.0.1 et protégé par `ML_API_KEY`.

### 16. BUG-DATA-16 : Anomalies de données du DWH identifiées (non modifiées dans le DWH)
* `dbo.FACT_CLE`, 2025-06-03 : déclarations dupliquées jusqu'à 78 fois (même OF / machine / opération / équipe, `Entry No_` différents) → 3 175 519 pièces, 14 fois la moyenne. Plafonnées (Tukey Q3 + 3·IQR) dans les données d'apprentissage uniquement.
* `dbo.FACT_CLE`, 27–29/03/2026 : `[Quantité produite TRS]` non consolidée (0 alors que l'Output déclaré est de 149 117 et 328 881). Ces derniers jours sont exclus de l'apprentissage et signalés dans l'API.
* `dbo.ml_production_predictions` contient 1 803 lignes enregistrées avec les métriques fictives (MAE 2 467, RMSE 3 196, MAPE 6,0 %) : à purger par l'administrateur.

### Impact sur le mémoire
Les chiffres du Chapitre 4 (800 références, 47 / 146 / 557 / 50, 380 393 TND) proviennent de `scratch/stock_model_800_clean.csv` (articles fictifs « ART-xxxx ») et les métriques du Chapitre 5 (MAPE 6,0 % / 6,7 %) de `scratch/rigorous_evaluation_leak_free.py`, qui **génère une série synthétique** (base 66 420 + bruit gaussien). Ils doivent être remplacés par les valeurs calculées sur le DWH (`python ml-service/evaluate_dwh.py`).
