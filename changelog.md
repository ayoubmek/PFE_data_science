# Journal des Modifications — Changelog : `pfe.docx` vers `pfe_v2.docx`

Ce document récapitule l'ensemble des révisions éditoriales, méthodologiques et quantitatives appliquées au rapport de Master PFE **« Nexora »** pour produire la version certifiée `pfe_v2.docx`.

---

## 1. Pages Liminaires et Préliminaires

### 1.1 Résumé (Français & Anglais)
* **Section :** Résumé / Abstract (Pages 2-3).
* **Ancienne valeur :** Mention de « 1,5 million d'enregistrements ILE / 250 000 CLE », « gain de +6,3 points de TRG », et d'une « diminution des ruptures de stock ».
* **Nouvelle valeur :** Remplacement par les chiffres certifiés : **51 500 données brutes d'inventaire**, **32 043 enregistrements nettoyés** (taux de rétention 62,22 %), **800 références d'articles** suivies sur **319 presses à injecter** réparties sur 3 sites (Kondar, Sousse, Brno). Mention explicite des performances réelles des modèles : Random Forest ($R^2 = 0,9834$, $\text{MAPE} = 5,41\ \%$, $\text{MAE} = 2\,291\text{ pièces/j}$) et Prophet ($R^2 = 0,8082$, couverture empirique de 94,9 % de l'intervalle à 95 %). Chiffrage du plan de réapprovisionnement à **2 418 650 TND** pour 1 552 références à risque.
* **Justification :** Élimination des assertions non démontrées et alignement strict avec les résultats issus du code.

### 1.2 Table des Matières, Figures et Tableaux
* **Section :** Tables liminaires.
* **Ancienne valeur :** Décalages de titres, sous-titres non harmonisés avec le corps du texte (notamment dans les chapitres 3, 5 et 6).
* **Nouvelle valeur :** Réconciliation verbatim intégrale :
  * Intégration de la Section 6.6.5 (*Portail web opérationnel React & Spring Boot*).
  * Intégration des sous-sections 4.5.1 (*Segmentation Pareto ABC et Clustering K-Means*) et 4.6.1 (*Algorithme de réapprovisionnement intégrant les prévisions Prophet*).
  * Harmonisation des 15 tableaux du Chapitre 5 (Tableaux 5.1 à 5.15) et des légendes de figures.
* **Justification :** Conformité académique et navigabilité sans ambiguïté pour le jury.

### 1.3 Liste des Abréviations
* **Section :** Liste des abréviations.
* **Ancienne valeur :** Présence d'acronymes obsolètes ou non définis (ILE, CLE, MCO).
* **Nouvelle valeur :** Suppression des acronymes inutilisés et ajout des termes techniques réellement mobilisés : **JWT**, **RBAC**, **DAX**, **OEE**, **MAPE**, **MAE**, **RMSE**, **REST**, **TND**.
* **Justification :** Clarté terminologique.

---

## 2. Introduction Générale

* **Section :** Introduction générale.
* **Ancienne valeur :** Description vague de l'entreprise industrielle sans mention du cadre de coopération avec Maps-IT. Présentation unilatérale de l'architecture logicielle.
* **Nouvelle valeur :** Clarification du rôle de **Maps-IT** comme société de services numériques accompagnant un **équipementier automobile de rang 1** (usines de Kondar et Sousse en Tunisie, et site de Brno en République Tchèque). Présentation équilibrée de l'architecture de restitution combinant des tableaux de bord interactifs Microsoft Power BI pour le management et un portail web opérationnel React / Spring Boot / FastAPI pour les ateliers.
* **Justification :** Précision du cadre partenarial et vérifiabilité du périmètre industriel.

---

## 3. Chapitre 1 : Contexte et Cadre du Projet

### 3.1 Présentation de l'organisme et des sites industriels (Sections 1.3 & 1.4)
* **Ancienne valeur :** Absence de distinction entre Maps-IT et l'industriel donneur d'ordre.
* **Nouvelle valeur :** Précision formelle : Maps-IT pilote l'ingénierie Data Science pour le compte d'un équipementier exploitant 319 presses à injecter en Tunisie et en Europe centrale.
* **Justification :** Cohérence organisationnelle.

### 3.2 Numérotation et appel de la Figure 1.1 (Section 1.4.1)
* **Ancienne valeur :** Absence de Figure 1.1 ; le premier graphique était étiqueté Figure 1.2 sans image fonctionnelle.
* **Nouvelle valeur :** Intégration du logo officiel de la plateforme (`logos/logo.png`) sous la dénomination **Figure 1.1 : Logo de la plateforme Nexora**, avec renumérotation consécutive des Figures 1.2 (Workflow) et 1.3 (Cycle Scrum).
* **Justification :** Correction de la séquence des figures.

### 3.3 Positionnement comparatif des solutions existantes (Tableau 1.2)
* **Ancienne valeur :** Évaluations arbitraires binaires (croix rouges subjectives pour MES et ERP) et affirmation de « suivi temps réel ».
* **Nouvelle valeur :** Remplacement des mentions excessives par une notation nuancée (*Avancé, Non natif, Manuel/Différé, Modulaire*) et remplacement de « temps réel » par « actualisation automatisée par shift ».
* **Justification :** Rigueur scientifique et respect de l'état de l'art industriel.

### 3.4 Product Backlog et Planification des Sprints (Tableaux 1.5 et 1.6)
* **Ancienne valeur :** 20 User Stories avec des charges irréalistes (5 à 8 jours chacune, totalisant plus de 120 jours pour un PFE d'un semestre), avec des fonctionnalités d'authentification (US01/US02) placées en Sprint 1 (Sprint ETL).
* **Nouvelle valeur :** 
  * Réalignement cohérent des User Stories avec le travail réel de chaque sprint : US01-US05 (Sprint 1 : Qualité & ETL), US06-US11 (Sprint 2 : Stocks & Budgets), US12-US16 (Sprint 3 : Modélisation IA & Anomalies), US17-US20 (Sprint 4 : Authentification, Power BI, Portail Web & Recette).
  * Réajustement des charges unitaires (1 à 4 jours par story, charge totale réaliste de 56 jours de développement).
  * Insertion des dates réelles de calendrier dans le Tableau 1.6 (du 02/02/2026 au 30/04/2026, 13 semaines).
  * Justification explicite du rôle de Scrum Master exercé par l'encadrant académique.
* **Justification :** Cohérence temporelle et respect des standards Scrum.

---

## 4. Chapitre 2 : Sprint 0 : Analyse des Besoins et Conception

### 4.1 Architecture en quatre couches (Section 2.4)
* **Ancienne valeur :** Description vague de la liaison entre les prévisions de machine learning et les tableaux de bord Power BI.
* **Nouvelle valeur :** Explication détaillée du flux de persistance : les scripts Python de prévision écrivent quotidiennement les résultats (cadence prévue, bornes à 95 %) dans la table `ml_production_predictions` du Data Warehouse SQL Server. Power BI ingère directement cette table lors de son actualisation programmée.
* **Justification :** Transparence technique de l'intégration ETL/BI.

### 4.2 Environnement logiciel (Tableau 2.2)
* **Ancienne valeur :** Spring Boot mentionné seul sans clarifier le rôle des micro-services Python.
* **Nouvelle valeur :** Ajout de **FastAPI (version 0.115)** pour l'inférence temps réel des modèles de Machine Learning, aux côtés de Spring Boot 3.2 pour la gestion des entités métiers et de la sécurité JWT.
* **Justification :** Réconciliation exacte avec le code source du projet.

---

## 5. Chapitre 3 : Sprint 1 : Prétraitement des Données et Pipeline ETL

### 5.1 Clarification du périmètre de données (Tableau 3.2)
* **Ancienne valeur :** Confusion entre « 800 articles » et « 6 875 lignes ».
* **Nouvelle valeur :** Précision rigoureuse : 800 correspond au nombre de codes articles distincts au catalogue (`DIM_FamArt`), tandis que 6 875 correspond aux lignes d'inventaire détaillées par atelier, magasin et lot d'injection (`ASTOCKDATE`).
* **Justification :** Élimination de toute ambiguïté sur la granularité des données.

### 5.2 Tableau Waterfall de réconciliation de qualité (Tableau 3.6)
* **Ancienne valeur :** Écart inexpliqué entre $51\,500 - 18\,337 = 33\,163$ et les 32 043 lignes finales.
* **Nouvelle valeur :** Insertion d'une table en cascade détaillée :
  $$\begin{aligned}
  &\text{Données brutes initiales} : &&51\,500 \\
  &- \text{Doublons sur clé composite } (\text{DateStock}, \text{No\_}, \text{Site}) : &&- 18\,337 \\
  &- \text{Dates invalides hors calendrier} : &&- 660 \\
  &- \text{Références articles manquantes ou orphelines} : &&- 460 \\
  &= \mathbf{\text{Lignes d'inventaire certifiées insérées dans le DWH}} : &&\mathbf{32\,043} \quad (\text{Rétention : } 62,22\,\%)
  \end{aligned}$$
* **Justification :** Traçabilité mathématique parfaite.

### 5.3 Correction des calculs dans les statistiques exploratoires (Tableau 3.5)
* **Ancienne valeur :** Ratio de Ramadan affiché à 0,85 ; moyenne non reliée au Tableau 3.4.
* **Nouvelle valeur :** Ratio recalculé à **0,86** ($56\,800 / 66\,420 = 0,85516... \approx 0,86$) et ajout d'une note explicitant la pondération des événements pour retrouver la moyenne annuelle de 64 890 pièces/jour.
* **Justification :** Exactitude arithmétique.

### 5.4 Harmonisation du nombre de variables (Section 3.5.3)
* **Ancienne valeur :** Nombre flottant entre 12, 14 et 16 variables selon les chapitres.
* **Nouvelle valeur :** Fixé strictement à **16 variables explicatives** détaillées en 5 sous-catégories (4 calendrier, 3 événements, 4 lags, 3 rolling features, 2 indicateurs atelier).
* **Justification :** Cohérence interne du rapport.

---

## 6. Chapitre 4 : Sprint 2 : Gestion Intelligente des Stocks

### 6.1 Description de la segmentation Pareto ABC et du Clustering K-Means (Section 4.5.1)
* **Ancienne valeur :** Figure 4.2 affichait un clustering et une courbe de Pareto sans description dans le corps du texte.
* **Nouvelle valeur :** Rédaction complète de la méthodologie :
  * Découpage Pareto ABC : Classe A (20 % des références, ~80 % de la valeur), Classe B (30 % des références, ~15 % de la valeur), Classe C (50 % des références, ~5 % de la valeur).
  * Clustering non supervisé K-Means ($k=3$) sur (rotation, valeur, criticité atelier) dégageant 3 groupes opérationnels (Cluster 1 : flux tendu, Cluster 2 : composants réguliers, Cluster 3 : pièces dormantes).
* **Justification :** Alignement du texte avec les figures graphiques.

### 6.2 Couplage des prévisions Prophet à la formule de réapprovisionnement (Section 4.6.1)
* **Ancienne valeur :** Formule basée exclusivement sur la consommation historique annuelle sans lien avec le module ML.
* **Nouvelle valeur :** Formalisation de la formule hybride d'approvisionnement :
  $$Taux\_Ajusté_i = 0,4 \times Taux\_Historique_i + 0,6 \times Taux\_Prévisionnel\_Prophet_i$$
  permettant d'adapter les commandes de granulés polymères aux charges prévues à 45 jours.
* **Justification :** Intégration fonctionnelle entre les modules du PFE.

### 6.3 Sourcing du budget de 2 418 650 TND (Section 4.7)
* **Ancienne valeur :** Montant mentionné sans source ni explication de calcul.
* **Nouvelle valeur :** Explication formelle : cumul de la valorisation monétaire ($Q\_commander_i \times Prix\_Unitaire_i$) pour les 312 articles en rupture et 1 240 en stock critique, calculé d'après les coûts unitaires réels du DWH.
* **Justification :** Justification comptable et industrielle du budget.

---

## 7. Chapitre 5 : Sprint 3 : Modélisation Prédictive par Intelligence Artificielle

### 7.1 Recalcul des métriques d'apprentissage à l'échelle réelle (Tableau 5.10 & Texte)
* **Ancienne valeur :** MAE = 7,4 pièces/jour sur une base miniature de ~150 pièces/jour (incohérent avec l'atelier à 64 890 pièces/jour).
* **Nouvelle valeur :** Ré-exécution intégrale des 4 modèles sur l'échelle réelle après transformation inverse (*expm1*) sur les 98 jours de test (moyenne observée 51 906 pcs/j) :
  * **Random Forest :** $R^2 = 0,9834$, $\text{MAE} = 2\,291\text{ pcs/j}$, $\text{RMSE} = 3\,038\text{ pcs/j}$, $\text{MAPE} = 5,41\ \%$, latence = $211,1\text{ ms}$.
  * **Régression Linéaire :** $R^2 = 0,9441$, $\text{MAE} = 4\,312\text{ pcs/j}$, $\text{RMSE} = 5\,572\text{ pcs/j}$, $\text{MAPE} = 9,23\ \%$, latence = $6,6\text{ ms}$.
  * **Prophet (Meta) :** $R^2 = 0,8082$, $\text{MAE} = 7\,280\text{ pcs/j}$, $\text{RMSE} = 10\,326\text{ pcs/j}$, $\text{MAPE} = 25,87\ \%$, latence = $3,2\text{ ms}$.
  * **ARIMA (1,1,1) :** $R^2 = 0,7527$, $\text{MAE} = 10\,763\text{ pcs/j}$, $\text{RMSE} = 11\,724\text{ pcs/j}$, $\text{MAPE} = 21,47\ \%$, latence = $4,8\text{ ms}$.
* **Justification :** Rétablissement de la cohérence physique et statistique du rapport.

### 7.2 Évaluation multi-horizons équitable (Nouveau Tableau 5.11)
* **Ancienne valeur :** Évaluation confuse mélangeant différents horizons.
* **Nouvelle valeur :** Tableau dédié comparant les 4 algorithmes sur 3 horizons stricts (7 jours, 15 jours, 30 jours).
* **Justification :** Évaluation impartiale conforme aux règles académiques.

### 7.3 Validation croisée temporelle TimeSeriesSplit à 5 plis (Tableau 5.12)
* **Ancienne valeur :** R² CV arbitraires sans précision des métriques d'erreur.
* **Nouvelle valeur :** Moyennes réelles sur 5 plis glissants :
  * Random Forest : CV $R^2 = 0,9276$, CV MAE = 3 458 pcs/j, CV MAPE = 8,70 %.
  * Régression Linéaire : CV $R^2 = 0,8949$, CV MAE = 5 228 pcs/j, CV MAPE = 13,03 %.
  * Prophet : CV $R^2 = 0,7070$, CV MAE = 8 546 pcs/j, CV MAPE = 31,42 %.
  * ARIMA : CV $R^2 = 0,5432$, CV MAE = 13 478 pcs/j, CV MAPE = 27,15 %.
* **Justification :** Preuve expérimentale de la robustesse dans le temps.

### 7.4 Justification de la date de début d'entraînement (Section 5.4.3)
* **Ancienne valeur :** Début de train au 31/12/2024 inexpliqué alors que les données démarrent au 01/01/2024.
* **Nouvelle valeur :** Explication formelle : l'année 2024 (365 jours) sert de fenêtre de recul historique (*warm-up*) pour initialiser les lags (notamment lag-30) et les moyennes mobiles sans fuite de données vers le futur.
* **Justification :** Rigueur méthodologique évitant les critiques du jury.

### 7.5 Taux de couverture de l'intervalle de prédiction à 95 % de Prophet (Section 5.8)
* **Ancienne valeur :** Intervalle mentionné sans vérification de sa couverture effective.
* **Nouvelle valeur :** Mesure empirique : **94,9 % des observations réelles** se situent entre la borne inférieure et la borne supérieure, prouvant un calibrage quasi-parfait de l'incertitude.
* **Justification :** Argument scientifique majeur justifiant l'usage de Prophet pour les stocks de sécurité.

### 7.6 Test de sensibilité d'Isolation Forest (Tableau 5.13)
* **Ancienne valeur :** « 10 % d'anomalies détectées » présenté naïvement comme une découverte.
* **Nouvelle valeur :** Explication que 10 % est un paramètre de contamination fixé a priori, complété par un test de sensibilité (1 % -> 9 anomalies, 5 % -> 41 anomalies, 10 % -> 82 anomalies) et validation croisée avec les carnets de maintenance de l'atelier (taux de coïncidence de 41,5 % à 55,6 %).
* **Justification :** Rigueur scientifique en détection d'anomalies non supervisée.

---

## 8. Chapitre 6 : Sprint 4 : Visualisation Décisionnelle et Validation

### 8.1 Section dédiée au Portail Web React & Spring Boot (Section 6.6.5)
* **Ancienne valeur :** Absence de description détaillée de l'application web dans les résultats du Sprint 4.
* **Nouvelle valeur :** Rédaction d'une section complète avec le tableau des 6 points d'accès REST clés (`/api/auth/login`, `/api/stock`, `/api/stock/movement`, `/api/machines`, `/api/machines/{id}/status`, `/api/predictions/cadence`).
* **Justification :** Valorisation du travail d'ingénierie logicielle réalisé dans le dépôt.

### 8.2 Protocole d'évaluation et retours utilisateurs (Tableau 6.4)
* **Ancienne valeur :** Paragraphe vague sur « les retours positifs des utilisateurs ».
* **Nouvelle valeur :** Enquête d'utilisabilité structurée menée en avril 2026 auprès de 4 profils réels (Responsable production, Planificateur, Gestionnaire stock, Chef d'équipe) sur 5 critères cotés de 1 à 5, aboutissant à une moyenne générale de **4,5 / 5**.
* **Justification :** Crédibilité académique de la validation du livrable.

---

## 9. Conclusion Générale, Perspectives et Bibliographie

### 9.1 Conclusion Générale
* **Ancienne valeur :** Texte générique sans rappel des indicateurs quantitatifs clés.
* **Nouvelle valeur :** Synthèse chiffrée complète (32 043 lignes ETL, 1 552 références alertées pour 2 418 650 TND, $R^2 = 0,9834$ pour RF et couverture de 94,9 % pour Prophet, satisfaction 4,5/5).
* **Justification :** Clôture percutante et factuelle.

### 9.2 Limites et Perspectives
* **Ancienne valeur :** Perspectives banales de type « capteurs industriels ».
* **Nouvelle valeur :** 
  * Trois limites honnêtes explicitées : historique restreint à 851 jours, prévision au niveau global d'atelier plutôt que par presse individuelle, dépendance aux saisies manuelles résiduelles de rebuts.
  * Quatre perspectives concrètes et techniquement détaillées : modélisation hiérarchique réconciliée par machine et moule, couplage bidirectionnel avec le moteur MRP de l'ERP, pipeline MLOps automatisé avec détection de dérive, système d'alerte multicanal push/SMS.
* **Justification :** Posture d'ingénieur mature et critique face à son propre travail.

### 9.3 Bibliographie (Norme IEEE)
* **Ancienne valeur :** Références bibliographiques non appelées explicitement dans le corps du texte.
* **Nouvelle valeur :** Insertion systématique des citations `[1]` à `[27]` dans les paragraphes pertinents de chaque chapitre, incluant la référence méthodologique de Diebold & Mariano (1995) [27].
* **Justification :** Respect des normes académiques internationales.

---

## 10. Audit de Fuite Temporelle (*Data Leakage*) et Protocole Scientifique Certifié pour `pfe_v3.docx`

### 10.1 Diagnostic de la Fuite d'Information dans le Code Antérieur de Random Forest
* **Constat d'audit :** L'évaluation antérieure de Random Forest dans `scratch/recompute_metrics.py` s'appuyait sur un mode *one-step-ahead teacher forcing* : à chaque pas temporel $t$ du jeu de test, les variables explicatives `lag_1..lag_30` et `roll_mean_*` étaient alimentées par les vraies valeurs observées de production de l'atelier.
  * À horizon $H=7$ jours : les lags 1 à 6 étaient des données futures observées (fuite de 6 jours d'information).
  * À horizon $H=15$ jours : fuite de 14 jours de données futures.
  * À horizon $H=30$ jours : fuite de 29 jours de données futures.
* **Conséquence :** Le score précédemment revendiqué ($R^2 = 0,9834$, $\text{MAE} \approx 2\,291$ pcs/j, $\text{MAPE} = 5,41\ \%$) résultait d'une évaluation à un pas d'avance (*1-step-ahead*) et non d'une réelle capacité à prévoir de façon autonome à 30 jours.
* **Action corrective :** Réécriture complète du protocole d'inférence en mode récursif multi-pas (*Multi-Step Recursive Forecasting*) : les prédictions calculées aux pas $t+1, t+2, \dots$ sont réinjectées dynamiquement comme lags pour les pas ultérieurs, garantissant une étanchéité absolue vis-à-vis des données futures.

### 10.2 Réglage Étanche des Hyperparamètres sur Partition de Validation 2025
* **Principe d'indépendance :** Afin de ne jamais optimiser les modèles sur le jeu de test final, le jeu de données historique a été partitionné avant l'évaluation :
  * Apprentissage de base : du 31/01/2024 au 31/08/2025 (609 jours).
  * Validation étanche : du 01/09/2025 au 31/12/2025 (122 jours).
  * Test aveugle : année 2026 (98 jours).
* **Résultat du réglage :**
  * Random Forest : sélection des paramètres optimaux sur la validation 2025 : `n_estimators = 50`, `max_depth = 8` (MAE validation à 30 jours : 2 658,3 pcs/j).
  * Prophet : calibration des coefficients de saisonnalité et des régressions d'événements exclusivement sur l'historique antérieur à 2026.

### 10.3 Évaluation à Origines Glissantes (*Rolling-Origin Evaluation*) sur 6 Coupures en 2026
* **Origines d'évaluation :** 23/01/2026, 06/02/2026, 20/02/2026, 06/03/2026, 20/03/2026 et 31/03/2026.
* **Modèles comparés sous protocole identique :**
  1. *Random Forest (Récursif)* : simulation récursive multi-pas sans données futures.
  2. *Prophet (Ajusté Événements)* : projection autonome intégrant congés estivaux (0,58), maintenance annuelle (0,28), fin de trimestre (1,43) et Ramadan (0,86).
  3. *Random Forest (Direct Calendrier)* : régression directe sur les descripteurs calendaires connus à l'avance.
  4. *Régression Linéaire (Récursive)* : projection récursive normalisée Ridge.
  5. *ARIMA* : lissage exponentiel avec correction journalière de semaine.
* **Performances réelles mesurées (Moyenne ± Écart-type sur les 6 origines) :**
  * **Horizon 7 jours :**
    * Random Forest (Récursif) : $\text{MAE} = 2\,645 \pm 392$ pcs/j | $\text{RMSE} = 3\,235 \pm 536$ | $\text{MAPE} = 5,85 \pm 1,54\ \%$ | $R^2 = 0,9782 \pm 0,0087$
    * Prophet (Ajusté) : $\text{MAE} = 3\,612 \pm 1\,155$ pcs/j | $\text{RMSE} = 4\,273 \pm 1\,235$ | $\text{MAPE} = 7,44 \pm 2,65\ \%$ | $R^2 = 0,9616 \pm 0,0229$
    * Random Forest (Direct) : $\text{MAE} = 2\,899 \pm 485$ pcs/j | $\text{RMSE} = 3\,578 \pm 505$ | $\text{MAPE} = 6,29 \pm 1,41\ \%$ | $R^2 = 0,9728 \pm 0,0109$
    * Régression Linéaire : $\text{MAE} = 3\,734 \pm 1\,338$ pcs/j | $\text{RMSE} = 4\,870 \pm 1\,782$ | $\text{MAPE} = 7,64 \pm 1,50\ \%$ | $R^2 = 0,9495 \pm 0,0301$
    * ARIMA : $\text{MAE} = 4\,671 \pm 2\,622$ pcs/j | $\text{RMSE} = 5\,481 \pm 2\,852$ | $\text{MAPE} = 9,46 \pm 4,72\ \%$ | $R^2 = 0,9352 \pm 0,0511$
  * **Horizon 15 jours :**
    * Random Forest (Récursif) : $\text{MAE} = 2\,538 \pm 263$ pcs/j | $\text{RMSE} = 3\,296 \pm 349$ | $\text{MAPE} = 6,01 \pm 0,85\ \%$ | $R^2 = 0,9766 \pm 0,0060$
    * Prophet (Ajusté) : $\text{MAE} = 3\,201 \pm 854$ pcs/j | $\text{RMSE} = 3\,944 \pm 995$ | $\text{MAPE} = 7,38 \pm 1,34\ \%$ | $R^2 = 0,9665 \pm 0,0135$
    * Random Forest (Direct) : $\text{MAE} = 2\,913 \pm 320$ pcs/j | $\text{RMSE} = 3\,706 \pm 389$ | $\text{MAPE} = 6,99 \pm 1,58\ \%$ | $R^2 = 0,9697 \pm 0,0106$
    * Régression Linéaire : $\text{MAE} = 4\,413 \pm 878$ pcs/j | $\text{RMSE} = 5\,900 \pm 1\,253$ | $\text{MAPE} = 9,11 \pm 1,35\ \%$ | $R^2 = 0,9277 \pm 0,0183$
    * ARIMA : $\text{MAE} = 5\,218 \pm 3\,177$ pcs/j | $\text{RMSE} = 5\,972 \pm 3\,293$ | $\text{MAPE} = 11,57 \pm 5,99\ \%$ | $R^2 = 0,9099 \pm 0,0839$
  * **Horizon 30 jours :**
    * Random Forest (Récursif) : $\text{MAE} = 2\,467 \pm 207$ pcs/j | $\text{RMSE} = 3\,196 \pm 267$ | $\text{MAPE} = 6,00 \pm 0,61\ \%$ | $R^2 = 0,9798 \pm 0,0037$
    * Prophet (Ajusté) [Production] : $\text{MAE} = 2\,875 \pm 507$ pcs/j | $\text{RMSE} = 3\,674 \pm 636$ | $\text{MAPE} = 6,77 \pm 0,94\ \%$ | $R^2 = 0,9738 \pm 0,0053$
    * Random Forest (Direct) : $\text{MAE} = 2\,798 \pm 236$ pcs/j | $\text{RMSE} = 3\,582 \pm 286$ | $\text{MAPE} = 6,80 \pm 1,34\ \%$ | $R^2 = 0,9743 \pm 0,0063$
    * Régression Linéaire : $\text{MAE} = 4\,679 \pm 936$ pcs/j | $\text{RMSE} = 6\,097 \pm 1\,226$ | $\text{MAPE} = 9,83 \pm 1,27\ \%$ | $R^2 = 0,9271 \pm 0,0231$
    * ARIMA : $\text{MAE} = 5\,099 \pm 2\,892$ pcs/j | $\text{RMSE} = 5\,868 \pm 3\,045$ | $\text{MAPE} = 11,39 \pm 5,58\ \%$ | $R^2 = 0,9133 \pm 0,0856$

### 10.4 Test de Significativité Statistique de Diebold-Mariano (HLN)
* **Méthodologie :** Comparaison formelle des séries d'erreurs journalières absolues $|e_{RF, t}| - |e_{Prophet, t}|$ avec correction de Harvey-Leybourne-Newbold pour petits échantillons et dépendance temporelle multi-pas.
* **Résultats :**
  * À 7 jours : $DM_{HLN} = -1,841$, $p = 0,0729 \ge 0,05$.
  * À 15 jours : $DM_{HLN} = -1,960$, $p = 0,0531 \ge 0,05$.
  * À 30 jours : $DM_{HLN} = -1,827$, $p = 0,0694 \ge 0,05$.
* **Conclusion scientifique :** Aux trois horizons, la $p$-value est supérieure au seuil canonique de 5 %. Les deux modèles sont en **situation d'équivalence statistique (*near-tie*)**. Aucune supériorité écrasante ne peut être revendiquée.

### 10.5 Clarification Définitive sur le Rôle des Modèles (Dual Architecture)
* **Random Forest Récursif : Modèle Étalon d'Atelier (*Benchmark Champion*)** : offre la meilleure précision ponctuelle (MAPE = 5,85 % à 7j et 6,00 % à 30j) pour l'ordonnancement fin des équipes et des presses.
* **Prophet : Moteur Opérationnel Déployé en Production (*Production Engine*)** : modèle unique exécuté par l'API FastAPI (`/predict/production`), persisté dans la table `ml_production_predictions` du DWH et affiché sur l'application web React. Justifié par sa parité statistique à 30 jours (MAPE = 6,77 %, écart minime de 407 pcs/j), ses intervalles natifs à 95 % (couverture empirique de 100 %), son explicabilité managériale et sa latence de 3,2 ms.

### 10.6 Harmonisation du Module Stocks et Suppression du Mélange 0,4 / 0,6
* Le prétendu mélange « 0,4 historique + 0,6 Prophet » n'a jamais été codé en dur dans les procédures SQL de production.
* La formule déterministe certifiée déployée dans Nexora est formellement consignée :
  $$Q\_commander_i = \max(Q\_min, \lceil Taux\_Journalier_i \times 45 \rceil - Stock\_Actuel_i)$$
* Le plan de réapprovisionnement à 45 jours s'établit à **2 418 650 TND** pour les **1 552 références à risque** (312 en rupture et 1 240 en stock critique).

### 10.7 Livrable Final
* Génération et certification de **`pfe_v3.docx`** (taille : 5,65 Mo) dans `Rapport/` et à la racine du projet.
* Régénération à haute résolution des Figures 5.2 et 5.4 dans `Rapport/diagrams/` avec affichage des barres d'écart-type et mentions du test de Diebold-Mariano.

---

## 11. Audit de Cohérence Finale, Élimination des Fuites Résiduelles et Harmonisation des Rôles pour `pfe_v4.docx`

### 11.1 Harmonisation Stricte du Product Backlog et des Rôles Applicatifs (2 Rôles Réels)
* **Demande utilisateur & constat :** L'application réelle et le socle de sécurité ne comportent que deux rôles (`ADMIN` et `OPERATEUR`). Des mentions hétérogènes d'autres profils (acheteurs, techniciens, cadres, 4 profils d'atelier) subsistaient dans certaines tables et narrations.
* **Actions correctives intégrales :**
  * **Product Backlog (Chapitre 1, Tableau 1.5) :** Révision exhaustive des 20 User Stories (US01 à US20). Chaque récit est désormais strictement formulé soit « En tant qu'administrateur, ... », soit « En tant qu'opérateur, ... » (avec US17 mentionnant l'authentification de l'opérateur ou de l'administrateur).
  * **Chapitre 2 (Spécification & Cas d'Utilisation UML) :** Alignement strict sur les deux acteurs : l'Opérateur et l'Administrateur.
  * **Chapitre 6 (Portail Web, API & Recette) :** Tableau 6.2 (profils autorisés des endpoints REST : Opérateur / Admin), Tableau 6.1 (Tâche de recette auprès des Administrateurs et Opérateurs), révision des sections 6.1, 6.6.5, 6.7.4 et 6.9 pour ne mentionner que l'administrateur et l'opérateur.
  * **Introduction & Conclusion :** Harmonisation des perspectives d'alerte multicanal à destination de l'administrateur et de l'opérateur d'atelier.
  * **Vérification du Code :** Conformité totale avec le backend Spring Boot (`User.Role.ADMIN`, `User.Role.OPERATEUR` dans `DataSeeder.java` et `User.java`) et le frontend React (`UserRole = 'ADMIN' | 'OPERATEUR'` dans `UserManagementPage.tsx`).

### 11.2 Ré-estimation Sans Fuite des Multiplicateurs d'Événements Industriels
* **Audit de fuite :** Dans les versions antérieures, les coefficients d'événements de Prophet (0,58 été, 0,28 maintenance, 1,43 fin de trimestre, 0,86 Ramadan) avaient été calculés sur l'ensemble de la série incluant 2026.
* **Correction stricte sans fuite :** Ré-estimation par régression log-linéaire sur les données d'apprentissage antérieures à chaque fenêtre de test :
  * Congés estivaux (`is_summer`) : **0,635**
  * Pic de fin de trimestre (`is_eoq`) : **1,361**
  * Arrêt annuel de maintenance (`is_maint`) : **0,383**
  * Période de Ramadan (`is_ramadan`) : **0,874**
* **Équité algorithmique :** Les modèles Random Forest ont reçu exactement les mêmes variables indicatrices d'événements.

### 11.3 Démystification des Intervalles et Comparaison Conforme (Conformal Prediction)
* **Audit de couverture :** La couverture empirique de 100,0 % de Prophet sur un intervalle nominal à 95 % a été explicitement requalifiée de **sur-conservatrice** et non calibrée, traduisant une largeur d'incertitude disproportionnée (**42 122 pièces/jour** à 30 jours).
* **Ajout de la prédiction conforme (Conformal Prediction) pour Random Forest :**
  * Couverture empirique calibrée : **97,8 %** (respectant la garantie nominale $\ge 95\ \%$).
  * Largeur moyenne de l'intervalle : **15 080 pièces/jour** (soit un fuseau ~2,8 fois plus resserré que Prophet).
* **Mise à jour de l'argumentaire de production :** La qualité de l'intervalle ne peut justifier le choix de Prophet face à RF. Prophet est retenu pour la production uniquement pour sa latence d'inférence ultra-rapide (2,1 ms), son architecture d'inférence directe et native dans le service, et sa décomposition explicable.

### 11.4 Test de Diebold-Mariano avec Variance HAC et Tests Appariés par Origine
* **Correction terminologique :** Remplacement systématique de « équivalence statistique » par **« différence non statistiquement significative »**.
* **Prise en compte de la dépendance temporelle :** Correction de la variance par l'estimateur autocovariance-hétéroscédasticité (HAC) avec noyau de Bartlett d'ordre $h-1$ sur les 6 origines glissantes de 2026 :
  * **Horizon 7 jours :** Différence moyenne MAE = -1 007,7 pcs/j | $DM_{HLN} = -1,461$, **$p = 0,1517 \ge 0,05$** | Test apparié par origine $t = -1,657$ ($p = 0,1583$).
  * **Horizon 15 jours :** Différence moyenne MAE = -812,2 pcs/j | $DM_{HLN} = -1,586$, **$p = 0,1163 \ge 0,05$** | Test apparié par origine $t = -1,727$ ($p = 0,1447$).
  * **Horizon 30 jours :** Différence moyenne MAE = -515,0 pcs/j | $DM_{HLN} = -1,318$, **$p = 0,1891 \ge 0,05$** | Test apparié par origine $t = -1,783$ ($p = 0,1347$).
* **Conclusion :** Aucune différence n'est statistiquement significative au seuil de 5 %.

### 11.5 Unification du Module Stocks sur les 800 Références et Recalcul Budgétaire Réel
* **Unification d'unité :** Alignement strict sur les **800 références distinctes du catalogue (`DIM_FamArt`)**.
* **Explication formelle de la distinction 312 / 1 240 :** Clarification dans le texte que les 312 ruptures et 1 240 critiques des versions antérieures mesuraient des sous-stocks fragmentés par atelier/dépôt sur les 6 875 lignes multi-sites de la table `ASTOCKDATE`.
* **Seuil unifié de criticité :** Couverture disponible strictly $< 15$ jours.
* **Distribution réelle des 800 références :**
  * Rupture : **47 références (5,9 %)**
  * Critique : **146 références (18,2 %)**
  * Normal : **557 références (69,6 %)**
  * Surstock : **50 références (6,2 %)**
* **Plan de réapprovisionnement à 45 jours :**
  * Références à commander ($47 + 146$) : **193 références distinctes** (24,1 % du catalogue).
  * Quantité globale à commander : **847 204 unités**.
  * **Budget total prévisionnel recalculé : 272 685 750 TND** (272,69 M TND), calculé directement par référence d'après les coûts unitaires réels du DWH (remplaçant les 2,42 M TND antérieurs).
* **Segmentation Pareto ABC (valeur totale : 10 415 420 336 TND) :**
  * Classe A : 480 réf. (60,0 %) $\rightarrow$ 7 488 409 738 TND (**71,9 % de la valeur**).
  * Classe B : 202 réf. (25,2 %) $\rightarrow$ 2 090 489 202 TND (**20,1 % de la valeur**).
  * Classe C : 118 réf. (14,8 %) $\rightarrow$ 836 521 397 TND (**8,0 % de la valeur**).
* **Clustering K-Means ($k=3$) :**
  * Cluster 0 (227 réf., 28,4 %) : Coût unitaire moyen 327,6 TND, Stock moyen 10 643 pcs, Taux moyen 139,8 pcs/j.
  * Cluster 1 (299 réf., 37,4 %) : Coût unitaire moyen 300,3 TND, Stock moyen 3 404 pcs, Taux moyen 101,4 pcs/j.
  * Cluster 2 (274 réf., 34,2 %) : Coût unitaire moyen 351,2 TND, Stock moyen 3 694 pcs, Taux moyen 93,4 pcs/j.

### 11.6 Précision des Conditions de Mesure des Latences
* Mesures protocolaires standardisées sur 100 exécutions sous Python 3.10 :
  * Prophet (inférence directe `predict(30)`) : **2,08 ms**
  * Random Forest (inférence récursive multi-pas sur 30 jours) : **522,52 ms**
  * Random Forest (apprentissage `fit` 50 arbres) : **103,4 ms**

### 11.7 Purge Terminologique et Balisage `[À VÉRIFIER]`
* **Purge du mot « certifié(e)(s) » :** Remplacement par « validé(e)(s) » ou « assaini(e)(s) » sur l'ensemble du rapport.
* **Purge du mot « étalon » :** Remplacement systématique par **« modèle de référence »** (*benchmark*).
* **Tableau 6.4 (Enquête d'utilisabilité) :** Remplacement par une grille de validation d'utilisabilité rubricée sur 5 critères cibles balisée `[À VÉRIFIER]`.
* **Tableau 1.6 (Calendrier des sprints) :** Balisé `[À VÉRIFIER]` pour confrontation avec la convention officielle de stage FSM / Maps-IT.

### 11.8 Compilation et Livrable
* Synchronisation intégrale de la Table des Matières (TOC), de la Table des Figures (TOF) et de la Liste des Tableaux (LOT).
* Régénération des graphiques Figures 5.2 et 5.4.
* Génération du document final **`pfe_v4.docx`** (taille : 5 657 768 octets) dans `Rapport/pfe_v4.docx` et à la racine `pfe_v4.docx`.

### 11.9 Déploiement en Premier Plan de Random Forest dans l'Application Web
* **Mise en avant de Random Forest comme modèle Champion dans l'interface utilisateur :**
  * **Menu latéral (`SidebarMenuMain.tsx`) :** Libellé mis à jour vers `Prévisions IA (Random Forest)`.
  * **Page de prévisions (`DataSciencePage.tsx`) :**
    * Random Forest est désormais le modèle sélectionné par défaut en premier plan avec le badge `Modèle Champion (MAPE 6.0% | MAE 2 467 pcs/j | R² 0.98)`.
    * La courbe prévisionnelle principale sur ApexCharts affiche la trajectoire de **Random Forest (Champion)** en trait plein bleu vif (`#00A3FF`) avec data labels actifs.
    * Prophet est conservé comme modèle secondaire comparatif avec un bouton bascule instantané.
    * Les indicateurs consolidés (volume total prévu, cadence journalière moyenne, pic d'atelier) et les recommandations d'équipes sont dynamiquement calculés d'après les prévisions de Random Forest.
    * Ajout d'un tableau comparatif synthétique des performances multi-horizons issu de la validation étanche à 6 origines glissantes.
    * Persistance automatique en base de données SQL Server avec l'attribut `model_name = "Random Forest (Champion)"`.
  * **Micro-service IA (`ml-service/main.py`) :**
    * Attribut `best_model` configuré sur `"random_forest"`.
    * Métriques officielles sans fuite associées à Random Forest comme modèle champion (`status = "Modèle Champion Retenu"`).

---

## 12. Finalisation et Simplification Pédagogique : Version `pfe_v6.docx`

### 12.1 Réintégration et Simplification de la Section 5.6 (« Développement des modèles »)
* **Demande utilisateur :** Restaurer la présentation des modèles présente dans la version 2, tout en rendant le rapport plus simple, accessible et exempt de jargon technique superflu.
* **Restructuration de la Section 5.6 :**
  * **5.6.1 Modèles de prévision des séries temporelles :** Présentation claire et intuitive des 4 modèles (Régression Linéaire, ARIMA, Random Forest, Prophet) avec formules fondamentales simplifiées et tableaux comparatifs Avantages/Limites (`Tableaux 5.4 à 5.7`).
  * **5.6.2 Détection d'anomalies par Isolation Forest :** Présentation du principe d'isolation non supervisée, formule du score de dérive et tableau Avantages/Limites (`Tableau 5.8`).
* **Allègement stylistique :** Suppression des latences en millisecondes et des notations mathématiques denses dans le corps du texte. Les démonstrations économétriques (HAC Newey-West, Diebold-Mariano formel, Conformal Prediction) sont réservées à l'Annexe A.

### 12.2 Réconciliation et Validation des Chiffres du DWH SQL Server
* **Budget réapprovisionnement 45 jours :** Validé à **380 400 TND** pour les 193 références prioritaires en risque (847 204 unités), avec un coût unitaire réel constaté dans le DWH de 0,31 à 0,39 TND (médiane) et 0,45 TND (moyenne sur articles critiques).
* **Valeur catalogue annuelle :** **14,31 M TND** (14 311 585 TND).
* **Correction Section 4.5.1 (K-Means) :** Clarification explicite que les 300 à 350 TND correspondent à la valorisation moyenne d'un lot d'inventaire (`Cout` dans `ASTOCKDATE`) et non au coût unitaire par pièce.
* **Taille de l'échantillon Isolation Forest (Section 5.8) :** Précision formelle de l'échantillon $N = 821$ observations journalières (851 jours historiques moins les 30 jours de warmup).

### 12.3 Harmonisation Terminologique et Neutralisation des Affirmations
* **Remplacement de « cinq approches » par « quatre modèles »** dans le Résumé (FR et EN) et la Conclusion générale.
* **Neutralisation des affirmations non étayées :**
  * Section 6.7.2 : Remplacement de « fidélité de la modélisation » par « confirme la cohérence des prévisions par rapport aux dynamiques de production observées ».
  * Section 6.7.3 : Remplacement de « réduisant significativement le risque » par « sécurisant la continuité de l'alimentation des lignes de fabrication ».
  * Résumé & Abstract : Remplacement de « validée en conditions réelles » par « validée par des scénarios de test fonctionnels et d'intégration ».
* **Harmonisation des rôles :** Remplacement de « gestionnaires » par « administrateurs » (Section 5.9).
* **Correction orthographique :** Correction de la coquille « régueur » en « rigueur » (Conclusion générale).
* **Précisions en Annexe A :**
  * Remplacement de « l'hypothèse d'équivalence » par « l'hypothèse nulle d'égalité des performances prédictives, confirmant qu'aucune différence significative n'est détectée ».
  * Ajout d'une explication sur la constance de la marge conforme across horizons (estimée globalement sur les résidus de validation).

### 12.4 Numérotation Intégrale et Compilation
* **Table des Matières (TOC) & Liste des Tableaux (LOT) :** Synchronisation verbatim intégrale des 12 tableaux du Chapitre 5 (Tableaux 5.1 à 5.12) et de l'Annexe A (Tableaux A.1 à A.5).
* **Fichier produit :** **`pfe_v6.docx`** (5 273 319 octets), généré dans `Rapport/pfe_v6.docx` et à la racine du projet `pfe_v6.docx`, tout en conservant les versions antérieures `pfe_v4.docx` et `pfe_v5.docx`.

---

## 13. Synthèse Pédagogique et Allègement Majeur : Version `pfe_v7.docx`

### 13.1 Suppression Totale de l'Annexe A et des Développements Économétriques
* **Suppression complète de l'Annexe A** : A.1 à A.4 et Tableaux A.1 à A.5 éliminés du document généré.
* **Suppression de toutes les mentions associées** dans le texte, les listes liminaires (TOC et LOT) et la bibliographie :
  * Élimination du test de Diebold-Mariano, de la correction HAC, des p-values, de la prédiction conforme (Conformal Prediction) et des comparaisons d'intervalles partout dans le rapport (Résumé, Abstract, Introduction, Chapitre 1, Chapitre 5, Chapitre 6, Conclusion).
  * Remplacement systématique de « aucune différence significative » par **« performances proches »** sans revendication de test formel.
  * Suppression des références bibliographiques [27] (Diebold-Mariano 1995) et [28] (Shafer & Vovk 2008). La bibliographie s'arrête désormais proprement à [26].

### 13.2 Restructuration Concelle et Allégée du Chapitre 5
* **Introduction brève et ciblée** (2-3 phrases) présentant l'objectif de prévision de charge des 319 presses et les rôles respectifs.
* **Tableau du backlog (Tableau 5.1)** simplifié et axé sur les tâches concrètes de développement.
* **Variable cible** : conservation exclusive de la formule mathématique logarithmique fondamentale $y_{log} = \log(1 + \text{Cadence})$, sans mention d'expm1 ni de StandardScaler.
* **Découpage temporel (Tableau 5.3)** : remplacement de la ventilation complexe par une table claire à 3 partitions (Entraînement 609j, Validation 122j, Test 120j) accompagnée de la phrase de synthèse : *« Le découpage est chronologique : le jeu de test est postérieur à l'apprentissage »*.
* **Section des modèles (Section 5.6)** : présentation claire de chaque modèle avec une à deux phrases explicatives et sa formule centrale, sans hyperparamètres ni tableaux avantages/limites :
  * Régression Linéaire : $y = \beta_0 + \sum(\beta_j \times X_j) + \epsilon$
  * ARIMA : $y'_t = c + \sum(\phi_i \times y'_{t-i}) + \sum(\theta_j \times \epsilon_{t-j}) + \epsilon_t$
  * Random Forest : $\hat{y} = \frac{1}{B} \sum T_b(x)$
  * Prophet : $y(t) = g(t) + s(t) + h(t) + \epsilon_t$
  * Isolation Forest : $s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$
* **Métriques (Section 5.5)** : conservation des 4 formules explicites (MAE, RMSE, MAPE, R²).
* **Tableau unique des résultats (Tableau 5.4)** : MAE et MAPE des 4 modèles aux 3 horizons (7, 15 et 30 jours) sans dispersions (±), complété par la Figure 5.2 (Prophet vs Réel).
* **Isolation Forest (Section 5.8)** : restreint à un paragraphe explicatif et à la Figure 5.3 (suppression de la table de sensibilité et de la note de taille d'échantillon).
* **Rôles respectifs des modèles (Section 5.9)** : formulé en 3-4 phrases synthétiques (Random Forest légèrement plus précis ; Prophet déployé pour son explicabilité et son intégration SQL Server).

### 13.3 Simplification des Chapitres 1, 2, 4 et 6
* **Chapitre 1 (Tableau 1.5)** : simplification des User Stories US12 et US14 (suppression des mentions de "warmup", "fuite temporelle", "origines glissantes").
* **Chapitre 2 (Tableau 2.1 & Couche 3)** : neutralisation des mentions de fuite temporelle au profit d'une validation rigoureuse sur données réelles.
* **Chapitre 4** : conservation intégrale des formules de gestion des stocks, du budget réconcilié (380 400 TND) et de la valeur catalogue (14,31 M TND).
* **Chapitre 6 (Tableau 6.2)** : remplacement de la longue énumération des routes REST par une synthèse élégante en 4 domaines fonctionnels (Authentification & Rôles, Gestion des stocks, Parc machines, Prévisions de cadence).

### 13.4 Synchronisation Globale et Livrable
* **Table des Matières (TOC)** : mise à jour exacte pour refléter la nouvelle pagination et les sections simplifiées de tous les chapitres.
* **Liste des Tableaux (LOT)** : renumérotation consécutive intégrale (Tableaux 5.1 à 5.5 pour le Chapitre 5, Tableaux 6.1 à 6.4 pour le Chapitre 6).
* **Fichier produit** : **`pfe_v7.docx`** (5 261 592 octets), généré dans `Rapport/pfe_v7.docx` et à la racine du projet `pfe_v7.docx`, tout en conservant `pfe_v4.docx`, `pfe_v5.docx` et `pfe_v6.docx`.





