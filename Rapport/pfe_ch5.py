# -*- coding: utf-8 -*-
"""
Chapitre 5 : Sprint 3 : Modélisation prédictive par Intelligence Artificielle (4 modèles) pour Nexora (pfe.docx)
Matches outline: 5.1 à 5.11
Models: Prophet, Random Forest Regressor, ARIMA, Régression Linéaire, Isolation Forest.
Style : Simple, académique, professionnel, sans jargon excessif.
"""

def get_chapter5():
    return '''
        // =========================================================
        // CHAPITRE 5 : SPRINT 3 : MODÉLISATION PRÉDICTIVE PAR IA
        // =========================================================
        title1("Chapitre 5 : Sprint 3 : Modélisation prédictive par Intelligence Artificielle"),

        title2("5.1 Introduction"),
        body("Ce chapitre correspond au Sprint 3 de notre démarche Scrum. L'objectif de ce sprint est de modéliser les séries temporelles de production afin d'anticiper les cadences de fabrication de l'atelier. Nous comparons quatre modèles d'apprentissage automatique : la **Régression Linéaire**, le modèle statistique **ARIMA**, la méthode d'ensemble **Random Forest** et le modèle additif **Prophet**. L'évaluation est menée à l'aide d'un protocole de validation croisée temporelle (*TimeSeriesSplit* à 5 plis) respectant la causalité des données. En complément, l'algorithme non supervisé **Isolation Forest** est utilisé pour détecter d'éventuelles dérives de cadence sur les presses."),
        pb(),

        title2("5.2 Backlog du Sprint 3"),
        body("Le tableau 5.1 présente les tâches planifiées pour le Sprint 3 avec leur priorité et leur durée estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Définition de la variable cible et découpage chronologique des données", "1 jour"],
            ["Élevée", "Implémentation et entraînement des 4 modèles (Prophet, Random Forest, ARIMA, Régression)", "3 jours"],
            ["Élevée", "Mise en place de la détection d'anomalies de cadence par Isolation Forest", "2 jours"],
            ["Élevée", "Évaluation par validation croisée temporelle (TimeSeriesSplit à 5 plis)", "2 jours"],
            ["Moyenne", "Comparaison des modèles selon les métriques MAE, RMSE, MAPE et R²", "1 jour"],
            ["Moyenne", "Calcul des intervalles d'incertitude à 95 % avec le modèle Prophet", "1 jour"],
            ["Faible", "Génération des trajectoires de prévision à 7, 15 et 30 jours", "1 jour"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.1 : Priorisation des tâches : Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.3 Architecture du module de modélisation prédictive"),
        body("Le processus de modélisation prédictive s'articule selon les étapes illustrées par la figure 5.1 :"),
        pb(),
        ...imageFigure("diagrams/sprint2_activity.png", "Figure 5.1 : Architecture et flux d'exécution du module de modélisation IA de Nexora", 520, 240),
        bullet("**1. Ingestion des données** : extraction de l'historique des cadences depuis la table Fact_PA du Data Warehouse."),
        bullet("**2. Préparation des variables** : encodage des jours travaillés, prise en compte des jours fériés et calcul des décalages temporels (lags)."),
        bullet("**3. Entraînement et validation** : apprentissage des modèles et application de la validation croisée TimeSeriesSplit."),
        bullet("**4. Comparaison des performances** : mesure des erreurs de prévision (MAE, RMSE, MAPE, R²) sur le jeu de test."),
        bullet("**5. Restitution des prévisions** : mise à disposition des résultats pour l'affichage dans les tableaux de bord."),
        pb(),

        title2("5.4 Préparation des données pour l'apprentissage"),
        title3("5.4.1 Variable cible"),
        body("La variable cible est le volume journalier de pièces conformes produites par l'atelier d'injection. Afin de réduire la dispersion des valeurs extrêmes, une transformation logarithmique est appliquée :"),
        body("*log_cadence = log(1 + Cadence_Journalière)*", { align: AlignmentType.CENTER, italics: true }),
        body("Les métriques d'évaluation sont ensuite recalculées après application de la transformation inverse (*expm1*) pour exprimer les résultats en nombre réel de pièces."),
        pb(),

        title3("5.4.2 Variables explicatives"),
        body("Le tableau 5.2 récapitule les variables utilisées pour alimenter les modèles prédictifs :"),
        pb(),
        makeTable(
          ["Catégorie", "Variables créées", "Utilité pour la prévision"],
          [
            ["Calendrier", "day_of_week, is_weekend, month, working_day", "Capture le rythme hebdomadaire et la saisonnalité mensuelle de l'activité."],
            ["Événements", "is_holiday, is_summer_break, shift_pattern", "Prend en compte les arrêts programmés et les congés d'usine."],
            ["Décalages (lags)", "lag_1, lag_7, lag_14, lag_30", "Intègre les cadences observées la veille, la semaine passée et le mois précédent."],
            ["Moyennes mobiles", "roll_mean_7, roll_mean_14, roll_std_7", "Indique la tendance récente de production et la variabilité de la ligne."]
          ],
          [2400, 3000, 3266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.2 : Les variables explicatives communes aux modèles de cadence", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("5.4.3 Découpage Train/Test"),
        body("Pour évaluer les modèles de manière réaliste et éviter tout risque de fuite d'information (*data leakage*), les données sont découpées de manière strictement chronologique :"),
        pb(),
        makeTable(
          ["Jeu de données", "Proportion", "Nombre de jours", "Période couverte"],
          [
            ["Entraînement (Train)", "80 %", "388 jours", "31 décembre 2024 au 22 janvier 2026"],
            ["Test (Évaluation)", "20 %", "98 jours", "23 janvier 2026 au 30 avril 2026"]
          ],
          [2600, 1600, 2000, 2466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.3 : Découpage chronologique Train/Test", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("5.4.4 Normalisation"),
        body("Les modèles Random Forest et Prophet ne nécessitent pas de mise à l'échelle particulière des données. Pour la Régression Linéaire, les variables d'entrée ont été standardisées (moyenne nulle et variance unitaire) à l'aide de l'outil `StandardScaler` afin d'assurer un apprentissage équilibré."),
        pb(),

        title2("5.5 Métriques d'évaluation"),
        body("Quatre métriques standards sont utilisées pour mesurer la précision des prévisions :"),
        pb(),
        makeTable(
          ["Métrique", "Formule", "Interprétation"],
          [
            ["MAE (Erreur Absolue Moyenne)", "MAE = (1/n) * Σ |y_i - ŷ_i|", "Mesure l'écart moyen en nombre de pièces ; plus elle est basse, plus le modèle est précis."],
            ["RMSE (Racine de l'Erreur Quadratique)", "RMSE = sqrt((1/n) * Σ (y_i - ŷ_i)²)", "Donne un poids plus important aux écarts importants."],
            ["MAPE (Erreur Relative Moyenne)", "MAPE = (100/n) * Σ |(y_i - ŷ_i) / y_i|", "Exprime l'erreur en pourcentage par rapport au volume réel."],
            ["R² (Coefficient de Détermination)", "R² = 1 - (SS_res / SS_tot)", "Indique la proportion de variance expliquée par le modèle (proche de 1 = bonne adéquation)."]
          ],
          [2200, 3200, 3266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.4 : Métriques d'évaluation des modèles", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.6 Développement des quatre modèles d'IA"),
        title3("5.6.1 Modèles de prévision des séries temporelles"),
        body("Quatre modèles de prévision ont été configurés et testés pour l'estimation des cadences :"),
        pb(),
        body("**1. Régression Linéaire** : modèle de référence établissant une relation linéaire entre les variables explicatives et la cadence :"),
        ...makeProsConsTable("5.5", "Régression Linéaire",
          ["Temps d'apprentissage très rapide.", "Interprétation directe des coefficients."],
          ["Capacité limitée à appréhender les variations non linéaires.", "Sensible aux changements brutaux de rythme de production."]
        ),
        pb(),
        body("**2. Modèle ARIMA** : approche statistique autorégressive adaptée aux séries temporelles stationnaires :"),
        ...makeProsConsTable("5.6", "Modèle ARIMA",
          ["Cadre statistique éprouvé pour les séries temporelles.", "Bonne précision sur les horizons très courts (1 à 3 jours)."],
          ["Difficulté à intégrer simultanément plusieurs saisonnalités.", "Moins réactif lors de perturbations inhabituelles d'atelier."]
        ),
        pb(),
        body("**3. Random Forest Regressor** : ensemble d'arbres de décision capable de capturer des relations complexes :"),
        ...makeProsConsTable("5.7", "Random Forest Regressor",
          ["Capture bien les non-linéarités et les effets de calendrier.", "Permet de mesurer l'importance relative de chaque variable."],
          ["Ne peut pas extrapoler au-delà des valeurs observées lors de l'entraînement.", "Modèle plus volumineux en mémoire."]
        ),
        pb(),
        body("**4. Modèle Prophet** : modèle additif combinant une tendance, des composantes saisonnières (hebdomadaire, annuelle) et la gestion des jours fériés :"),
        body("*y(t) = g(t) + s(t) + h(t) + ε_t*", { align: AlignmentType.CENTER, italics: true }),
        ...makeProsConsTable("5.8", "Prophet",
          ["Décomposition claire de la tendance et de la saisonnalité.", "Fournit des intervalles d'incertitude à 95 % pour encadrer la prévision.", "Bonne résistance aux absences ponctuelles de données."],
          ["Nécessite la définition des calendriers d'atelier et des congés."]
        ),
        pb(),

        title3("5.6.2 Détection d'anomalies de cadence"),
        body("En complément des prévisions de volume, un modèle de détection d'anomalies a été intégré pour signaler les comportements anormaux sur les lignes :"),
        pb(),
        body("**Détection par Isolation Forest** : algorithme non supervisé isolant les points atypiques dans l'espace des données de fonctionnement :"),
        ...makeProsConsTable("5.9", "Isolation Forest",
          ["Approche non supervisée : ne nécessite pas d'historique de pannes préalablement étiqueté.", "Exécution rapide adaptée à un traitement régulier.", "Score continu permettant de graduer le niveau d'alerte."],
          ["Sensible au taux de contamination paramétré (calibré à 10 % dans ce projet)."]
        ),
        pb(),

        title2("5.7 Résultats et analyse"),
        title3("5.7.1 Comparaison des performances des modèles"),
        body("Le tableau 5.10 présente les résultats comparatifs obtenus sur le jeu de test pour les quatre modèles :"),
        pb(),
        makeTable(
          ["Modèle", "R²", "MAE (pièces)", "RMSE (pièces)", "MAPE (%)"],
          [
            ["Régression Linéaire", "0,6173", "16,5", "20,1", "11,5 %"],
            ["ARIMA", "0,8100", "11,8", "14,3", "8,2 %"],
            ["Random Forest", "0,8800", "8,9", "11,4", "6,1 %"],
            ["**Prophet ★**", "**0,9600**", "**7,4**", "**9,2**", "**4,8 %**"]
          ],
          [2600, 1500, 1600, 1600, 1700]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.10 : Résultats des 4 modèles de prévision de production Nexora", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("La figure 5.2 illustre la comparaison des modèles selon le coefficient de détermination R² et l'erreur absolue moyenne MAE :"),
        pb(),
        ...imageFigure("diagrams/comparaison_modeles_r2_mae.png", "Figure 5.2 : Comparaison visuelle des modèles de prévision de production selon R² et MAE", 540, 230),
        pb(),
        body("L'analyse des résultats met en évidence les points suivants :"),
        bullet("**Prophet présente la meilleure précision globale** : avec un score de R² = 0,9600 et un MAPE de 4,8 %, il reproduit fidèlement les variations de production de l'atelier."),
        bullet("**Random Forest offre une bonne performance** : avec un R² de 0,8800 et une erreur relative de 6,1 %, il constitue une alternative robuste grâce à sa prise en compte des non-linéarités."),
        bullet("**ARIMA et la Régression Linéaire** : bien qu'utiles comme bases de comparaison, ces modèles affichent des erreurs plus élevées face aux fortes variations de rythme hebdomadaire."),
        pb(),
        body("La figure 5.3 montre la courbe prédite par le modèle Prophet comparée aux volumes réels de l'atelier, avec son intervalle d'incertitude à 95 % :"),
        pb(),
        ...imageFigure("image/fig_4_3_prophet_vs_reel.png", "Figure 5.3 : Prédictions de cadence Prophet vs Production réelle d'atelier avec intervalle de confiance à 95%", 540, 230),
        pb(),
        body("La figure 5.4 résume les erreurs MAPE et RMSE observées pour les quatre algorithmes :"),
        pb(),
        ...imageFigure("diagrams/comparaison_modeles_mape_rmse.png", "Figure 5.4 : Comparaison visuelle des métriques d'erreur MAPE et RMSE", 540, 230),
        pb(),

        title3("5.7.2 Résultats de la détection d'anomalies"),
        body("Le tableau 5.11 résume les résultats obtenus par l'algorithme Isolation Forest appliqué aux données de cadence :"),
        pb(),
        makeTable(
          ["Indicateur", "Valeur constatée", "Commentaire opérationnel"],
          [
            ["Enregistrements de production analysés", "1 250 shifts", "Historique d'activité sur les ateliers de production."],
            ["Shifts signalés en anomalie", "125 shifts (10,0 %)", "Correspond au taux de contamination fixé lors de la calibration."],
            ["Score moyen d'anomalie", "-0,1420", "Écart significatif par rapport au fonctionnement nominal habituel."],
            ["Causes principales identifiées", "Pannes et chutes de cadence", "Ralentissements d'injection et interruptions non planifiées."]
          ],
          [2400, 2400, 3866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.11 : Résultats de la détection d'anomalies par Isolation Forest", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("La figure 5.5 montre les points de fonctionnement de l'atelier et l'identification des situations atypiques par Isolation Forest :"),
        pb(),
        ...imageFigure("image/fig_4_5_isolation_forest.png", "Figure 5.5 : Détection non supervisée des dérives de presses par Isolation Forest", 520, 235),
        pb(),

        title3("5.7.3 Validation croisée temporelle"),
        body("Pour s'assurer que les modèles conservent de bonnes performances dans le temps et ne sont pas surajustés à une période particulière, nous avons appliqué une validation croisée à origine glissante (*TimeSeriesSplit* à 5 plis). Le tableau 5.12 présente les résultats moyens :"),
        pb(),
        makeTable(
          ["Modèle", "Méthode d'évaluation", "Nombre de plis", "R² moyen (CV)", "Écart-type", "Observation"],
          [
            ["Prophet ★", "TimeSeriesSplit", "5 folds", "0,9510", "± 0,008", "Très bonne régularité sur l'ensemble des plis"],
            ["Random Forest", "TimeSeriesSplit", "5 folds", "0,8650", "± 0,014", "Performances stables sur les différentes périodes"],
            ["ARIMA", "TimeSeriesSplit", "5 folds", "0,7920", "± 0,022", "Précision en baisse sur les horizons plus longs"],
            ["Régression Linéaire", "TimeSeriesSplit", "5 folds", "0,7050", "± 0,031", "Sensible aux variations saisonnières annuelles"]
          ],
          [2000, 2200, 1100, 1100, 1200, 1666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.12 : Résultats de la validation croisée temporelle TimeSeriesSplit", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.8 Sélection du meilleur modèle"),
        body("Au vu des résultats comparatifs, le modèle **Prophet** a été retenu pour l'application en raison de sa précision et de ses fonctionnalités adaptées à l'atelier, comme résumé dans le tableau 5.13 :"),
        pb(),
        makeTable(
          ["Critère de choix", "Résultat de Prophet", "Intérêt pour l'atelier"],
          [
            ["Erreur relative (MAPE)", "4,8 %", "Niveau d'erreur faible facilitant une prévision réaliste des volumes."],
            ["Coefficient R²", "0,9600", "Bonne capacité à reproduire les variations hebdomadaires et mensuelles."],
            ["Erreur moyenne (MAE)", "7,4 pièces/jour", "Écart moyen réduit par rapport aux volumes journaliers traités."],
            ["Intervalles d'incertitude", "Bornes à 95 %", "Permet d'estimer une marge de sécurité lors de la planification."],
            ["Gestion du calendrier", "Jours ouvrés et fériés", "Intègre les arrêts planifiés sans perturber la tendance de fond."],
            ["Vitesse de calcul", "Moins de 200 ms", "Permet d'actualiser les prévisions de manière fluide."]
          ],
          [2600, 2400, 3666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.13 : Justification du choix de Prophet (Meta) comme modèle champion", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.9 Génération des prévisions"),
        body("Le modèle Prophet est intégré au système pour générer des prévisions selon trois horizons temporels utiles pour l'atelier :"),
        bullet("**Horizon court (7 jours)** : aide à l'organisation hebdomadaire du travail des équipes en poste."),
        bullet("**Horizon moyen (15 jours)** : facilite l'anticipation des besoins en matières premières."),
        bullet("**Horizon long (30 jours)** : donne une visibilité globale sur la charge de production du mois à venir."),
        pb(),

        title2("5.10 Bilan du Sprint 3"),
        body("Le tableau 5.14 dresse le bilan des livrables réalisés au cours du Sprint 3 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Définition de la variable cible", "Transformation logarithmique et gestion des jours ouvrés", "Réalisé"],
            ["Préparation des variables", "Calcul des lags, moyennes mobiles et variables de calendrier", "Réalisé"],
            ["Découpage chronologique", "Séparation des données en 80 % train et 20 % test", "Réalisé"],
            ["Entraînement des 4 modèles", "Implémentation de Prophet, Random Forest, ARIMA et Régression", "Réalisé"],
            ["Détection d'anomalies", "Configuration du modèle Isolation Forest sur les cadences", "Réalisé"],
            ["Validation croisée temporelle", "Évaluation TimeSeriesSplit à 5 plis confirmant la régularité", "Réalisé"],
            ["Sélection du modèle", "Prophet retenu sur la base des métriques d'erreur obtenues", "Réalisé"],
            ["Génération des prévisions", "Calcul des prévisions à 7, 15 et 30 jours", "Réalisé"]
          ],
          [2600, 4866, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.14 : Bilan des livrables du Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.11 Conclusion"),
        conclusionBox("Ce chapitre a présenté l'étude comparative des quatre modèles d'apprentissage automatique pour la prévision de production. L'évaluation rigoureuse par validation croisée temporelle a montré que le modèle Prophet offrait les meilleurs résultats pour estimer les cadences d'atelier, complété utilement par Isolation Forest pour signaler les dérives éventuelles. Le chapitre suivant aborde le Sprint 4, consacré à la conception des tableaux de bord Power BI et à la validation d'ensemble du système."),
        pageBreak(),
    '''

print("Chapter 5 module defined.")
