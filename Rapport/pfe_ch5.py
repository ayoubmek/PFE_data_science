# -*- coding: utf-8 -*-
"""
Chapitre 5 : Sprint 3 : Modélisation prédictive par IA pour Nexora (pfe_v7.docx)
Texte clair, simple et concis pour jury de Master :
- Intro courte et ciblée
- Tableau du backlog (Tableau 5.1) et architecture (Figure 5.1)
- Variable cible (formule log) et variables explicatives (Tableau 5.2)
- Découpage chronologique simple (Tableau 5.3 : Train / Validation / Test)
- Formules des 4 métriques (MAE, RMSE, MAPE, R²)
- Les 5 modèles avec leurs équations simples, sans hyperparamètres
- Tableau unique des résultats (Tableau 5.8 : MAE, RMSE, MAPE et R² à 30 jours) + Figure 5.2
- Analyse explicable des composantes et robustesse
- Rôles respectifs des modèles en 3-4 phrases concises
- Bilan du sprint (Tableau 5.5) et conclusion
"""

def get_chapter5():
    return '''
        // =========================================================
        // CHAPITRE 5 : SPRINT 3 : MODÉLISATION PRÉDICTIVE ET IA
        // =========================================================
        title1("Chapitre 5 : Sprint 3 : Modélisation prédictive par Intelligence Artificielle"),

        title2("5.1 Introduction"),
        body("Ce chapitre correspond au Sprint 3 de notre démarche Scrum, consacré au développement du moteur prédictif et analytique de la plateforme **Nexora**. Pour anticiper les charges des ateliers d'injection et prévenir les tensions sur les approvisionnements, quatre algorithmes d'apprentissage automatique ont été développés et comparés : la Régression Linéaire, un modèle autorégressif ARIMA, Random Forest et le modèle Prophet."),
        pb(),
        body("L'analyse comparative met en évidence que Random Forest et Prophet affichent tous deux des performances proches et satisfaisantes (erreur relative moyenne de 6 % à 7 % de MAPE). Dans l'application opérationnelle, le modèle **Prophet** a été retenu pour le déploiement en production en raison de sa décomposition explicite (tendance de fond, profil hebdomadaire et événements d'atelier) et de sa facilité d'intégration dans l'entrepôt de données SQL Server (table `ml_production_predictions`)."),
        pb(),

        title2("5.2 Backlog du Sprint 3"),
        body("Le tableau 5.1 présente les tâches planifiées pour le Sprint 3 avec leur priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Définition de la variable cible et transformation logarithmique", "2 jours"],
            ["Élevée", "Ingénierie des variables explicatives et calendrier d'atelier", "3 jours"],
            ["Élevée", "Développement des modèles de prévision de séries temporelles", "4 jours"],
            ["Élevée", "Évaluation comparative des performances des modèles à l'horizon 30 jours", "3 jours"],
            ["Moyenne", "Analyse d'explicabilité et décomposition des composantes saisonnières", "2 jours"],
            ["Faible", "Intégration des prévisions Prophet dans la table ml_production_predictions du Data Warehouse", "2 jours"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.1 : Priorisation des tâches pour le Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.3 Démarche méthodologique de modélisation prédictive"),
        body("Le processus de modélisation prédictive des cadences de production d'atelier s'articule autour de cinq étapes méthodologiques :"),
        bullet("**1. Extraction des données d'atelier** : lecture de l'historique des déclarations de fabrication depuis la table `FACT_CLE` du Data Warehouse (851 jours réels)."),
        bullet("**2. Ingénierie des variables** : calcul des variables explicatives (décalages temporels, moyennes mobiles, variables calendaires et événements industriels)."),
        bullet("**3. Entraînement des modèles** : ajustement des algorithmes sur l'historique de production d'injection plastique."),
        bullet("**4. Évaluation des performances** : mesure des métriques d'erreur (MAE, RMSE, MAPE, R²) sur l'horizon de planification de 30 jours."),
        bullet("**5. Restitution et persistance** : enregistrement des prévisions dans la table `ml_production_predictions` du Data Warehouse pour l'affichage Power BI et le portail web."),
        pb(),

        title2("5.4 Préparation des données et variables explicatives"),
        title3("5.4.1 Variable cible et transformation logarithmique"),
        body("La variable cible modélisée est le volume journalier global de pièces conformes produites par l'atelier. Afin de stabiliser la variance face aux fortes variations d'activité, une transformation logarithmique est appliquée :"),
        body("*y_log = log(1 + Cadence_Journalière)*", { align: AlignmentType.CENTER, italics: true }),
        body("Les prédictions générées sont ensuite reconverties dans l'espace physique d'origine pour exprimer directement les erreurs en pièces réelles par jour. Lors de la phase d'apprentissage sur données actives, un seuil technique plancher de 12 450 pièces/jour (correspondant au minimum opérationnel en équipe réduite documenté au Tableau 3.4) garantit la stabilité numérique et évite tout artefact de division par zéro dans le calcul des métriques relatives standards."),
        pb(),

        title3("5.4.2 Variables explicatives et facteurs d'événements"),
        body("Le tableau 5.2 récapitule les 14 variables explicatives créées pour alimenter les modèles prédictifs :"),
        pb(),
        makeTable(
          ["Catégorie", "Variables générées", "Justification métier et analytique"],
          [
            ["Calendrier (3)", "day_of_week, is_weekend, month", "Capture le profil hebdomadaire (lundi-vendredi en 3x8 vs week-end) et les tendances mensuelles."],
            ["Événements atelier (4)", "is_summer, is_eoq, is_maint, is_ramadan", "Intègre les congés d'août, les pics de fin de trimestre, la maintenance de janvier [25] et le Ramadan."],
            ["Décalages / Lags (4)", "lag_1, lag_7, lag_14, lag_30", "Modélise la dépendance temporelle aux pas J-1, J-7, J-14 et J-30."],
            ["Moyennes mobiles (3)", "roll_mean_7, roll_mean_14, roll_std_7", "Indique la tendance lourde récente et la variabilité de la production d'atelier."]
          ],
          [2400, 3000, 3266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.2 : Les 14 variables explicatives du modèle de cadence", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Les événements d'atelier intègrent notamment les congés estivaux d'août, les accélérations de fin de trimestre, l'arrêt de maintenance annuelle [25] et la période de Ramadan."),
        pb(),

        title3("5.4.3 Découpage chronologique du jeu de données"),
        body("Le découpage est chronologique : le jeu de test est postérieur à l'apprentissage (Tableau 5.3) :"),
        pb(),
        makeTable(
          ["Partition", "Période couverte", "Nombre de jours", "Rôle méthodologique"],
          [
            ["Entraînement (Train)", "01/01/2024 – 31/08/2025", "609 jours", "Ajustement des modèles de prévision."],
            ["Validation", "01/09/2025 – 31/12/2025", "122 jours", "Sélection et comparaison des approches."],
            ["Test d'évaluation", "01/01/2026 – 30/04/2026", "120 jours", "Mesure des performances sur données futures."]
          ],
          [2400, 2400, 1600, 2266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.3 : Découpage chronologique du jeu de données", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.5 Métriques d'évaluation de la performance"),
        body("La qualité des prévisions est mesurée par un ensemble rigoureux d'indicateurs d'erreur recommandés en prévision industrielle [4] :"),
        bullet("**MAE (Mean Absolute Error)** : écart absolu moyen entre cadences réelles et prédites, en pièces/jour :\\n*MAE = (1 / n) × Σ |y_i - ŷ_i|*"),
        bullet("**RMSE (Root Mean Squared Error)** : racine de l'erreur quadratique moyenne, pénalisant fortement les grands écarts :\\n*RMSE = √((1 / n) × Σ (y_i - ŷ_i)²)*"),
        bullet("**MAPE (Mean Absolute Percentage Error)** : pourcentage d'erreur relatif moyen sur production normale :\\n*MAPE = (100 / n) × Σ |(y_i - ŷ_i) / y_i|*"),
        bullet("**WAPE (Weighted Absolute Percentage Error)** : erreur relative pondérée par le volume total, non sensible aux zéros [4] :\\n*WAPE = (Σ |y_i - ŷ_i| / Σ y_i) × 100*"),
        bullet("**MASE (Mean Absolute Scaled Error)** : ratio de l'erreur du modèle par rapport à une prévision naïve à un pas [4] (MASE < 1 indique une supériorité nette) :\\n*MASE = MAE / ((1 / (T-1)) × Σ |y_t - y_{t-1}|)*"),
        bullet("**R² (Coefficient de détermination)** : proportion de la variance de cadence expliquée par le modèle :\\n*R² = 1 - (Σ (y_i - ŷ_i)² / Σ (y_i - ȳ)²)*"),
        pb(),

        title2("5.6 Développement des modèles d'intelligence artificielle"),
        body("Pour modéliser la cadence de production de l'atelier d'injection plastique et anticiper les charges machines, quatre approches algorithmiques [5] ont été développées, entraînées et comparées :"),
        pb(),

        title3("5.6.1 Régression Linéaire Multiple"),
        body("La régression linéaire multiple sert de modèle statistique de référence (baseline). Elle postule une relation linéaire directe entre les 14 variables explicatives (calendaires, retardées et d'atelier) et le logarithme de la cadence journalière :"),
        body("*y = β_0 + Σ (β_j × X_j) + ε*", { align: AlignmentType.CENTER, italics: true }),
        body("où *β_0* représente la constante, *β_j* les coefficients de régression associés à chaque variable explicative *X_j*, et *ε* le terme d'erreur résiduelle."),
        pb(),
        ...makeProsConsTable(
          "5.4",
          "Régression Linéaire",
          [
            "Temps d'apprentissage et d'inférence quasi-instantanés.",
            "Interprétabilité directe des coefficients de pondération.",
            "Faible consommation de ressources de calcul."
          ],
          [
            "Incapacité structurelle à modéliser les non-linéarités complexes d'atelier.",
            "Sensible à l'accumulation d'erreurs en projection récursive multi-pas.",
            "Sensibilité à la colinéarité des variables explicatives."
          ]
        ),
        pb(),

        title3("5.6.2 Modèle ARIMA (AutoRegressive Integrated Moving Average)"),
        body("Le modèle ARIMA [3] constitue la méthode statistique univariée de référence pour les séries temporelles. Il combine la dépendance linéaire aux valeurs passées de la série (partie autorégressive AR d'ordre *p*), une différenciation d'ordre *d* pour assurer la stationnarité, et l'influence des chocs aléatoires passés (partie moyenne mobile MA d'ordre *q*) :"),
        body("*y'_t = c + Σ (ϕ_i × y'_{t-i}) + Σ (θ_j × ε_{t-j}) + ε_t*", { align: AlignmentType.CENTER, italics: true }),
        body("où *y'_t* est la série différenciée *d* fois, *ϕ_i* les paramètres autorégressifs, *θ_j* les paramètres de moyenne mobile, et *ε_t* un bruit blanc gaussien."),
        pb(),
        ...makeProsConsTable(
          "5.5",
          "Modèle ARIMA",
          [
            "Fondement théorique robuste pour les processus stochastiques stationnaires.",
            "Bonne réactivité sur les profils cycliques réguliers.",
            "Paramétrisation formelle et rigoureuse (p, d, q)."
          ],
          [
            "Difficulté à intégrer simultanément plusieurs cycles saisonniers sans réajustement permanent.",
            "Sensible aux ruptures calendaires abruptes et arrêts de production non programmés.",
            "Ne prend pas en compte nativement les variables exogènes d'atelier."
          ]
        ),
        pb(),

        title3("5.6.3 Modèle Random Forest Regressor"),
        body("Random Forest [6], [7] est un algorithme d'apprentissage automatique supervisé par ensemble (*ensemble learning*). Il construit une forêt de *B* arbres de décision indépendants entraînés sur des sous-échantillons bootstrap du jeu de données (*bagging*) avec sélection aléatoire des variables de découpage (*feature subsampling*). La prédiction finale résulte de la moyenne des prédictions individuelles :"),
        body("*ŷ = (1 / B) × Σ T_b(x)*", { align: AlignmentType.CENTER, italics: true }),
        body("Cette approche par agrégation réduit considérablement la variance sans dégrader le biais, permettant de capturer les interactions non linéaires complexes propres aux cadences d'atelier."),
        pb(),
        ...makeProsConsTable(
          "5.6",
          "Random Forest",
          [
            "Capte les relations non-linéaires complexes",
            "Robuste aux valeurs aberrantes (outliers)",
            "Faible risque de surapprentissage grâce au bagging"
          ],
          [
            "Modèle boîte noire (interprétabilité réduite)",
            "Temps de calcul et empreinte mémoire plus élevés",
            "Ne peut pas extrapoler au-delà des valeurs observées"
          ]
        ),
        pb(),

        title3("5.6.4 Modèle Prophet (Meta)"),
        body("Développé par Meta, Prophet [12] est un modèle additif modulaire conçu pour les séries temporelles industrielles présentant de fortes saisonnalités et des variations calendaires. La cadence journalière est décomposée selon quatre composantes structurelles :"),
        body("*y(t) = g(t) + s(t) + h(t) + ε_t*", { align: AlignmentType.CENTER, italics: true }),
        body("où *g(t)* modélise la tendance générale non linéaire avec détection automatique des points de rupture (*changepoints*), *s(t)* représente les variations périodiques hebdomadaires via des séries de Fourier, *h(t)* quantifie l'impact des événements d'atelier (fermetures, congés, périodes de maintenance [25]), et *ε_t* est le résidu d'erreur normale."),
        pb(),
        ...makeProsConsTable(
          "5.7",
          "Prophet",
          [
            "Décomposition explicable (tendance, saisonnalité, calendrier).",
            "Génération native d'intervalles d'incertitude prédictifs fiables à 95 %.",
            "Inférence ultra-rapide adaptée aux requêtes du portail web et Power BI.",
            "Prise en compte native des congés et arrêts programmés d'atelier."
          ],
          [
            "Légèrement moins précis sur les horizons très courts que Random Forest.",
            "Sensible aux ruptures structurelles non identifiées comme points de changement."
          ]
        ),
        pb(),

        title2("5.7 Résultats comparatifs et évaluation des modèles à l'horizon 30 jours"),
        body("Les quatre modèles ont été évalués sur l'horizon de prévision opérationnel de l'usine fixé à 30 jours (correspondant au cycle mensuel de planification de charge). Le tableau 5.8 synthétise les performances comparatives obtenues, enrichies des métriques WAPE et MASE [4] :"),
        pb(),
        makeTable(
          ["Modèle de prévision", "MAE (pcs/j)", "RMSE (pcs/j)", "MAPE (%)", "WAPE (%)", "MASE", "Score R²"],
          [
            ["Random Forest", "2 467", "3 196", "6,0 %", "3,8 %", "0,43", "0,9798"],
            ["Prophet (Déployé)", "2 982", "3 897", "6,7 %", "4,6 %", "0,52", "0,9707"],
            ["Régression Linéaire", "4 679", "6 098", "9,8 %", "7,2 %", "0,82", "0,9271"],
            ["ARIMA", "5 321", "6 148", "11,7 %", "8,2 %", "0,93", "0,9082"]
          ],
          [1800, 1300, 1300, 1100, 1100, 1000, 1066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.8 : Synthèse des performances comparatives des modèles à l'horizon 30 jours", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("À l'horizon de 30 jours, Random Forest et Prophet affichent des performances remarquables et très proches (6,0 % et 6,7 % de MAPE, avec des WAPE respectifs de 3,8 % et 4,6 %). Avec des ratios MASE de 0,43 et 0,52 (très largement inférieurs au seuil de 1,0), les deux modèles démontrent un pouvoir prédictif plus de deux fois supérieur à celui d'une prévision naïve standard [4]."),
        pb(),
        body("La figure 5.1 illustre la trajectoire des prévisions Prophet face à la production réelle d'atelier générée avec Matplotlib [13] sur une période représentative :"),
        pb(),
        ...imageFigure("image/fig_4_3_prophet_vs_reel.png", "Figure 5.1 : Trajectoire des prédictions Prophet face à la production réelle d'atelier", 540, 240),
        pb(),
        body("Sur la figure 5.1, les creux périodiques réguliers correspondent fidèlement aux week-ends (dimanches à équipes allégées ou fermetures) ainsi qu'aux arrêts planifiés de maintenance [25]. Ces variations structurelles sont parfaitement captées et anticipées par la décomposition saisonnière hebdomadaire de Prophet."),
        pb(),

        title2("5.8 Détection automatisée des anomalies de cadence par intervalle d'incertitude"),
        body("Conformément aux exigences de réactivité industrielle du cahier des charges, la plateforme Nexora intègre un module de détection d'anomalies de fabrication en temps quasi-réel. Afin de garantir une parfaite robustesse statistique sans introduire d'algorithme boîte noire additionnel, le système exploite directement les bandes d'incertitude bayésiennes à 95 % générées nativement par le modèle Prophet retenu en production :"),
        body("*Anomalie(t) = VRAI  si  y(t) < ŷ_lower(t)  ou  y(t) > ŷ_upper(t)*", { align: AlignmentType.CENTER, italics: true }),
        body("où *[ŷ_lower(t), ŷ_upper(t)]* délimite l'intervalle de confiance prédictif à 95 %. Dès qu'une valeur réelle franchit l'une de ces bornes, une alerte est qualifiée selon sa typologie :"),
        bullet("**Déficit critique (`DEFICIT_CRITIQUE`)** : arrêt total d'usine ou effondrement brutal de cadence ($y_t = 0$), déclenchant une alerte d'urgence pour le responsable de production."),
        bullet("**Déficit modéré (`DEFICIT_MODERE`)** : cadence anormalement basse ($y_t < ŷ_{lower}$ avec $y_t > 0$), signalant un goulot d'étranglement ou des micro-arrêts machines non déclarés."),
        bullet("**Surcharge atypique (`SURCHARGE`)** : production anormalement élevée ($y_t > ŷ_{upper}$), indiquant un rattrapage de cadence ou une fin de commande urgente."),
        pb(),
        body("**Validation opérationnelle sur l'historique d'atelier :** Sur les 851 jours réels de l'historique d'injection, l'atelier recense exactement **68 jours de fermeture totale** (production nulle $y_t = 0$, correspondant aux chômages techniques, fermetures annuelles et dimanches d'arrêt complet). Soumis à cette partition de référence, l'algorithme de détection Prophet isole avec succès **68 jours sur 68 (100,0 % de détection)** hors de l'intervalle d'incertitude, tous catégorisés sans exception en `DEFICIT_CRITIQUE`. Aucun faux négatif n'est constaté sur les événements d'arrêt d'atelier."),
        pb(),
        body("Ce mécanisme de surveillance est directement opérationnel au sein du micro-service Python (`ml-service/models/prophet_model.py`) via l'API REST `POST /detect/anomalies`, permettant au portail web et aux tableaux de bord de notifier instantanément les gestionnaires d'atelier."),
        pb(),

        title2("5.9 Analyse explicable des composantes et robustesse"),
        body("Au-delà de la performance brute en termes d'erreurs résiduelles, la fiabilité industrielle d'un moteur prédictif repose sur sa transparence et son explicabilité. La décomposition additive offerte par Prophet permet d'isoler explicitement la tendance de fond à long terme, la modulation hebdomadaire liée aux roulements des équipes d'atelier, ainsi que les creux de production correspondant aux jours de maintenance programmée et aux jours fériés. Cette interprétabilité facilite l'appropriation des prévisions par les chefs d'atelier et sécurise la planification opérationnelle face aux fluctuations réelles de cadence."),
        pb(),

        title2("5.10 Rôles respectifs des modèles dans la plateforme Nexora"),
        body("L'analyse comparative conduit à une organisation claire entre les deux modèles de tête. Random Forest obtient une précision légèrement supérieure sur l'historique d'atelier (6,0 % d'erreur à 30 jours contre 6,7 % pour Prophet). Toutefois, le modèle Prophet a été retenu pour le déploiement opérationnel en production en raison de sa décomposition transparente (séparant la tendance générale, le rythme hebdomadaire et les arrêts programmés), de sa génération native d'intervalles pour la détection d'anomalies, et de sa grande facilité d'intégration dans l'entrepôt de données SQL Server et les tableaux de bord Power BI. Random Forest demeure utilisé comme modèle de référence pour les analyses hors-ligne et les études approfondies."),
        pb(),

        title2("5.11 Bilan du Sprint 3"),
        body("Le tableau 5.9 récapitule les livrables réalisés au terme du Sprint 3 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Préparation des variables", "Ingénierie des variables explicatives et calendrier d'atelier", "Réalisé"],
            ["Développement des modèles", "Implémentation des modèles de prévision temporelle", "Réalisé"],
            ["Évaluation des performances", "Performances comparatives validées à 30 jours (WAPE, MASE)", "Réalisé"],
            ["Détection d'anomalies", "Module de détection Prophet 95 % validé à 100 % sur arrêts", "Réalisé"],
            ["Explicabilité des modèles", "Décomposition explicable des composantes et analyse de robustesse", "Réalisé"],
            ["Déploiement opérationnel", "Intégration des prévisions Prophet dans le Data Warehouse", "Réalisé"]
          ],
          [2400, 5066, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.9 : Bilan des livrables du Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.12 Conclusion"),
        conclusionBox("Ce chapitre a présenté le développement, l'évaluation comparative de quatre modèles de séries temporelles et le déploiement du module de détection d'anomalies. Les résultats confirment que Random Forest et Prophet atteignent des performances très proches et d'excellente qualité à l'horizon de 30 jours (6 % à 7 % de MAPE, WAPE inférieur à 5 % et MASE aux environs de 0,5). Prophet a été retenu pour alimenter le Data Warehouse et surveiller les ruptures de cadence grâce à ses bandes d'incertitude à 95 % (validées à 100 % sur les 68 jours d'arrêt d'atelier). Le chapitre suivant aborde le Sprint 4, consacré à la restitution décisionnelle par Power BI, à l'application web et à la recette fonctionnelle."),
        pageBreak(),
    '''

print("Chapter 5 module defined.")

