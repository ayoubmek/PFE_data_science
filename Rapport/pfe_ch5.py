# -*- coding: utf-8 -*-
"""
Chapitre 5 : Sprint 3 : Modélisation prédictive par IA et détection d'anomalies pour Nexora (pfe_v7.docx)
Texte clair, simple et concis pour jury de Master :
- Intro courte et ciblée
- Tableau du backlog (Tableau 5.1) et architecture (Figure 5.1)
- Variable cible (formule log) et variables explicatives (Tableau 5.2)
- Découpage chronologique simple (Tableau 5.3 : Train / Validation / Test)
- Formules des 4 métriques (MAE, RMSE, MAPE, R²)
- Les 5 modèles avec leurs équations simples, sans hyperparamètres
- Tableau unique des résultats (Tableau 5.4 : MAE et MAPE à 7, 15 et 30 jours) + Figure 5.2
- Isolation Forest : un paragraphe + Figure 5.3 (sans tableau de sensibilité)
- Rôles respectifs des modèles en 3-4 phrases concises
- Bilan du sprint (Tableau 5.5) et conclusion
"""

def get_chapter5():
    return '''
        // =========================================================
        // CHAPITRE 5 : SPRINT 3 : MODÉLISATION PRÉDICTIVE ET IA
        // =========================================================
        title1("Chapitre 5 : Sprint 3 : Modélisation prédictive par IA et détection d'anomalies"),

        title2("5.1 Introduction"),
        body("Ce chapitre correspond au Sprint 3 de notre démarche Scrum, consacré au développement du moteur prédictif et analytique de la plateforme **Nexora**. Pour anticiper les charges des ateliers d'injection et prévenir les tensions sur les approvisionnements, quatre algorithmes d'apprentissage automatique ont été développés et comparés : la Régression Linéaire, un modèle autorégressif ARIMA, Random Forest et le modèle Prophet. En complément, l'algorithme non supervisé Isolation Forest est employé pour surveiller le rythme des 319 presses à injecter et détecter les dérives anormales de cadence."),
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
            ["Élevée", "Ingénierie des 14 variables explicatives et calendrier d'atelier", "3 jours"],
            ["Élevée", "Développement des 4 modèles de prévision de séries temporelles", "4 jours"],
            ["Élevée", "Évaluation comparative des performances aux horizons 7, 15 et 30 jours", "3 jours"],
            ["Moyenne", "Configuration d'Isolation Forest pour la surveillance des cadences", "2 jours"],
            ["Faible", "Intégration des prévisions Prophet dans la table ml_production_predictions du DWH", "2 jours"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.1 : Priorisation des tâches pour le Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.3 Architecture du module de modélisation prédictive"),
        body("Le processus de modélisation prédictive suit les cinq étapes illustrées par la figure 5.1 :"),
        pb(),
        ...imageFigure("diagrams/sprint2_activity.png", "Figure 5.1 : Architecture et flux de traitement du module d'IA de Nexora", 520, 240),
        bullet("**1. Extraction des données d'atelier** : lecture de l'historique des déclarations de fabrication depuis la table `Fact_PA` du Data Warehouse (851 jours réels)."),
        bullet("**2. Ingénierie des variables** : calcul des variables explicatives (décalages temporels, moyennes mobiles, variables calendaires et événements industriels)."),
        bullet("**3. Entraînement des modèles** : ajustement des algorithmes sur l'historique de production d'injection plastique."),
        bullet("**4. Évaluation multi-horizons** : mesure des métriques d'erreur sur les horizons de planification de 7, 15 et 30 jours."),
        bullet("**5. Restitution et persistance** : enregistrement des prévisions dans la table `ml_production_predictions` du DWH pour l'affichage Power BI et le portail web."),
        pb(),

        title2("5.4 Préparation des données et variables explicatives"),
        title3("5.4.1 Variable cible et transformation logarithmique"),
        body("La variable cible modélisée est le volume journalier global de pièces conformes produites par l'atelier. Afin de stabiliser la variance face aux fortes variations d'activité, une transformation logarithmique est appliquée :"),
        body("*y_log = log(1 + Cadence_Journalière)*", { align: AlignmentType.CENTER, italics: true }),
        body("Les prédictions générées sont ensuite reconverties dans l'espace physique d'origine pour exprimer directement les erreurs en pièces réelles par jour."),
        pb(),

        title3("5.4.2 Variables explicatives et facteurs d'événements"),
        body("Le tableau 5.2 récapitule les 14 variables explicatives créées pour alimenter les modèles prédictifs :"),
        pb(),
        makeTable(
          ["Catégorie", "Variables générées", "Justification métier et analytique"],
          [
            ["Calendrier (3)", "day_of_week, is_weekend, month", "Capture le profil hebdomadaire (lundi-vendredi en 3x8 vs week-end) et les tendances mensuelles."],
            ["Événements atelier (4)", "is_summer, is_eoq, is_maint, is_ramadan", "Intègre les congés d'août, les pics de fin de trimestre, la maintenance de janvier et le Ramadan."],
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
        body("Les événements d'atelier intègrent notamment les congés estivaux d'août, les accélérations de fin de trimestre, l'arrêt de maintenance annuelle et la période de Ramadan."),
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
        body("La qualité des prévisions est mesurée par quatre indicateurs standards exprimés en unités réelles :"),
        bullet("**MAE (Mean Absolute Error)** : écart absolu moyen entre les cadences observées et prédites, en pièces par jour :\\n*MAE = (1 / n) × Σ |y_i - ŷ_i|*"),
        bullet("**RMSE (Root Mean Squared Error)** : racine carrée de l'erreur quadratique moyenne, sensible aux fortes variations :\\n*RMSE = √((1 / n) × Σ (y_i - ŷ_i)²)*"),
        bullet("**MAPE (Mean Absolute Percentage Error)** : pourcentage d'erreur relatif moyen par rapport au volume réel :\\n*MAPE = (100 / n) × Σ |(y_i - ŷ_i) / y_i|*"),
        bullet("**R² (Coefficient de détermination)** : proportion de la variance de production expliquée par le modèle :\\n*R² = 1 - (Σ (y_i - ŷ_i)² / Σ (y_i - ȳ)²)*"),
        pb(),

        title2("5.6 Développement des modèles d'intelligence artificielle"),
        body("Pour modéliser la cadence de production de l'atelier d'injection plastique et anticiper les charges machines, quatre approches algorithmiques ont été développées, entraînées et comparées :"),
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
        body("Random Forest [7] est un algorithme d'apprentissage automatique supervisé par ensemble (*ensemble learning*). Il construit une forêt de *B* arbres de décision indépendants entraînés sur des sous-échantillons bootstrap du jeu de données (*bagging*) avec sélection aléatoire des variables de découpage (*feature subsampling*). La prédiction finale résulte de la moyenne des prédictions individuelles :"),
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
        body("où *g(t)* modélise la tendance générale non linéaire avec détection automatique des points de rupture (*changepoints*), *s(t)* représente les variations périodiques hebdomadaires via des séries de Fourier, *h(t)* quantifie l'impact des événements d'atelier (fermetures, congés, périodes de maintenance), et *ε_t* est le résidu d'erreur normale."),
        pb(),
        ...makeProsConsTable(
          "5.7",
          "Prophet",
          [
            "Décomposition explicable (tendance, saisonnalité, calendrier).",
            "Génération native d'intervalles d'incertitude prédictifs fiables.",
            "Inférence ultra-rapide adaptée aux requêtes du portail web et Power BI.",
            "Prise en compte native des congés et arrêts programmés d'atelier."
          ],
          [
            "Légèrement moins précis sur les horizons très courts que Random Forest.",
            "Sensible aux ruptures structurelles non identifiées comme points de changement."
          ]
        ),
        pb(),

        title2("5.7 Résultats comparatifs et évaluation multi-horizons"),
        body("Les 4 modèles ont été évalués sur les trois horizons décisionnels de l'usine : 7 jours (court terme), 15 jours (moyen terme) et 30 jours (plan mensuel). Le tableau 5.8 synthétise les résultats obtenus :"),
        pb(),
        makeTable(
          ["Horizon", "Modèle de prévision", "MAE moyenne (pièces/jour)", "MAPE moyenne (%)"],
          [
            ["7 jours", "Random Forest", "2 645 pcs/j", "5,9 %"],
            ["7 jours", "Prophet", "3 653 pcs/j", "7,3 %"],
            ["7 jours", "Régression Linéaire", "3 734 pcs/j", "7,6 %"],
            ["7 jours", "ARIMA", "4 364 pcs/j", "9,0 %"],
            ["15 jours", "Random Forest", "2 538 pcs/j", "6,0 %"],
            ["15 jours", "Prophet", "3 350 pcs/j", "7,4 %"],
            ["15 jours", "Régression Linéaire", "4 413 pcs/j", "9,1 %"],
            ["15 jours", "ARIMA", "5 247 pcs/j", "11,6 %"],
            ["30 jours", "Random Forest", "2 467 pcs/j", "6,0 %"],
            ["30 jours", "Prophet", "2 982 pcs/j", "6,7 %"],
            ["30 jours", "Régression Linéaire", "4 679 pcs/j", "9,8 %"],
            ["30 jours", "ARIMA", "5 321 pcs/j", "11,7 %"]
          ],
          [1800, 3200, 2400, 1266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.8 : Synthèse des performances prédictives aux horizons 7, 15 et 30 jours", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("À l'horizon de 30 jours, Random Forest et Prophet affichent des performances très proches (6,0 % et 6,7 % de MAPE), avec un écart d'erreur moyenne de seulement 515 pièces par jour sur une production journalière globale d'environ 65 000 pièces/jour."),
        pb(),
        body("La figure 5.2 illustre la trajectoire des prévisions Prophet face à la production réelle d'atelier sur une période représentative :"),
        pb(),
        ...imageFigure("image/fig_4_3_prophet_vs_reel.png", "Figure 5.2 : Trajectoire des prédictions Prophet face à la production réelle d'atelier", 540, 240),
        pb(),

        title2("5.8 Détection des anomalies par Isolation Forest"),
        body("Pour surveiller en continu le fonctionnement du parc des 319 presses et détecter précocement les ralentissements anormaux ou les micro-arrêts non déclarés, l'algorithme Isolation Forest analyse conjointement les cadences journalières et les temps de cycle de chaque machine. La figure 5.3 illustre les points de fonctionnement observés et la frontière de détection établie par le modèle :"),
        pb(),
        ...imageFigure("image/fig_4_5_isolation_forest.png", "Figure 5.3 : Détection non supervisée des anomalies de cadence par Isolation Forest", 520, 235),
        pb(),

        title2("5.9 Rôles respectifs des modèles dans la plateforme Nexora"),
        body("L'analyse comparative conduit à une organisation claire entre les deux modèles de tête. Random Forest obtient une précision légèrement supérieure sur l'historique d'atelier (6,0 % d'erreur à 30 jours contre 6,7 % pour Prophet). Toutefois, le modèle Prophet a été retenu pour le déploiement opérationnel en production en raison de sa décomposition transparente (séparant la tendance générale, le rythme hebdomadaire et les arrêts programmés) et de sa grande facilité d'intégration dans l'entrepôt de données SQL Server et les tableaux de bord Power BI. Random Forest demeure utilisé comme modèle de référence pour les analyses hors-ligne et les études approfondies."),
        pb(),

        title2("5.10 Bilan du Sprint 3"),
        body("Le tableau 5.9 récapitule les livrables réalisés au terme du Sprint 3 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Préparation des variables", "14 variables explicatives et calendrier d'atelier", "Réalisé"],
            ["Développement des modèles", "Implémentation des 4 modèles (Régression Linéaire, ARIMA, Random Forest, Prophet)", "Réalisé"],
            ["Évaluation multi-horizons", "Performances mesurées à 7, 15 et 30 jours", "Réalisé"],
            ["Surveillance des cadences", "Détection des anomalies de fonctionnement par Isolation Forest", "Réalisé"],
            ["Déploiement opérationnel", "Intégration des prévisions Prophet dans la table ml_production_predictions", "Réalisé"]
          ],
          [2600, 4866, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.9 : Bilan des livrables du Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.11 Conclusion"),
        conclusionBox("Ce chapitre a présenté le développement et l'évaluation comparative de quatre modèles de séries temporelles et d'un algorithme de détection d'anomalies. Les résultats confirment que Random Forest et Prophet atteignent des performances proches et satisfaisantes à l'horizon de 30 jours (6 % à 7 % de MAPE). Prophet a été retenu pour alimenter les rapports et interfaces de la plateforme en raison de sa décomposition explicable et de son intégration directe dans la base de données. Le chapitre suivant aborde le Sprint 4, consacré à la restitution décisionnelle par Power BI, à l'application web et à la recette fonctionnelle."),
        pageBreak(),
    '''

print("Chapter 5 module defined.")
