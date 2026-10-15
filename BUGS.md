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
  4. Couverture par tests automatisés : création de la suite `SecurityRbacTest.java` (6 tests unitaires MockMvc validant 401 pour anonyme, 403 pour rôle `OPERATEUR` et 200 pour rôle `ADMIN`).
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
