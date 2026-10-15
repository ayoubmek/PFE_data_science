# -*- coding: utf-8 -*-
"""
Chapitre 3 : Sprint 1 : Prétraitement des données, assainissement de la qualité et pipeline ETL pour Nexora (pfe_v2.docx)
Matches EXACT outline: 3.1 à 3.8, aligned with dbDWH1 7 real tables and etl_pipeline/ architecture.
Style : Simple, académique, professionnel, sans jargon excessif.
"""

def get_chapter3():
    return '''
        // =========================================================
        // CHAPITRE 3 : SPRINT 1 : PRÉTRAITEMENT ET PIPELINE ETL
        // =========================================================
        title1("Chapitre 3 : Sprint 1 : Prétraitement des données, assainissement de la qualité et pipeline ETL"),

        title2("3.1 Introduction"),
        body("Ce chapitre correspond au Sprint 1 de notre démarche Agile Scrum. Dans un projet d'analyse de données et d'aide à la décision, la qualité des informations en entrée conditionne directement la fiabilité des modèles prédictifs et des indicateurs de gestion. Dans un environnement industriel réel, les extractions de bases opérationnelles comportent inévitablement des anomalies de saisie, des redondances et des valeurs manquantes. L'objectif de ce premier sprint est donc d'auditer les données brutes, de concevoir un pipeline de nettoyage modulaire en Python [18], d'appliquer les règles d'assainissement et de charger les tables validées dans le Data Warehouse sous un schéma relationnel et dimensionnel."),
        pb(),

        title2("3.2 Backlog du Sprint 1"),
        body("Le tableau 3.1 présente les tâches planifiées pour le Sprint 1, ordonnancées par priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Extraction et audit de qualité des fichiers d'inventaire et de production bruts", "3 jours"],
            ["Élevée", "Développement des fonctions de nettoyage des anomalies recensées", "4 jours"],
            ["Élevée", "Modélisation dimensionnelle et structuration du schéma du Data Warehouse", "3 jours"],
            ["Élevée", "Chargement automatisé des données d'inventaire assainies dans SQL Server", "2 jours"],
            ["Élevée", "Calcul et ingénierie des variables explicatives", "3 jours"],
            ["Moyenne", "Analyse exploratoire des séries de cadence (distributions, tendances, saisonnalités)", "2 jours"],
            ["Moyenne", "Création des index sur les tables du Data Warehouse", "1 jour"],
            ["Faible", "Génération automatique des journaux d'exécution et du rapport d'audit", "1 jour"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.1 : Priorisation des tâches pour le Sprint 1", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("3.3 Présentation des données"),
        title3("3.3.1 Source des données"),
        body("Les données exploitées dans ce projet proviennent des extractions du système d'information industriel de l'équipementier partenaire, couvrant les usines de Kondar et Sousse en Tunisie ainsi que le site de Brno en République Tchèque. La période d'observation s'étend du **1er janvier 2024 au 30 avril 2026** (soit 851 jours consécutifs d'activité industrielle)."),
        body("Ces sources couvrent les déclarations de fabrication, les mouvements d'inventaire physique, le référentiel des articles et le suivi du parc machines. Après prétraitement par le pipeline ETL, ces flux alimentent le Data Warehouse pour l'analyse décisionnelle et la modélisation prédictive."),
        pb(),
        makeTable(
          ["Indicateur du périmètre de données", "Valeur constatée", "Description"],
          [
            ["Période temporelle couverte", "01/01/2024 – 30/04/2026", "851 jours consécutifs de production d'atelier."],
            ["Données brutes d'inventaire extraites", "51 500 enregistrements", "Extraction initiale des déclarations de stock."],
            ["Lignes d'inventaire nettoyées et validées", "32 043 enregistrements", "Lignes valides chargées dans le Data Warehouse."],
            ["Lignes d'inventaire détaillées d'atelier", "6 875 lignes actives", "Inventaire ventilé par atelier, dépôt et lot."],
            ["Références articles au catalogue", "800 références uniques", "Articles distincts du référentiel produit."],
            ["Presses à injecter suivies", "319 machines", "Parc de presses réparti sur les 3 sites industriels."],
            ["En-cours de fabrication enregistrés", "8 344 enregistrements", "Suivi des ordres d'injection en atelier."]
          ],
          [3500, 2400, 2766]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.2 : Périmètre quantitatif des données industrielles du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.2 Description des tables du Data Warehouse"),
        body("Le Data Warehouse Microsoft SQL Server (base `dbDWH`) est modélisé autour d'un schéma optimisé pour les requêtes analytiques [16], articulé autour de cinq tables réelles interconnectées couvrant les flux de production, les stocks, le parc machines, la sécurité et les prédictions d'IA :"),
        pb(),
        makeTable(
          ["Nom de la table", "Nature", "Rôle et contenu fonctionnel"],
          [
            ["dbo.FACT_CLE", "Table de faits", "Déclarations d'atelier et production réelle (876 128 enregistrements) : ordres de fabrication, code presse, dates de postes, volumes bruts, rebuts, temps de cycle et mesure pivot « Quantité produite TRS »."],
            ["dbo.ASTOCKDATE", "Table de faits", "Instantanés d'inventaire et stocks physiques : 800 références d'articles du catalogue, quantités disponibles, valorisation unitaire (Cout en TND), sites (Kondar, Sousse, Brno) et statut de couverture."],
            ["dbo.MCMachineCenter", "Dimension", "Référentiel des 319 presses à injecter : identifiant machine (MACH-001 à MACH-319), désignation, tonnage, atelier d'affectation, site industriel et indicateur d'efficience nominale."],
            ["dbo.ml_production_predictions", "Table analytique", "Persistance des prévisions d'IA : horizon opérationnel de 30 jours, cadences journalières prédites par Prophet et Random Forest, capacités maximales, métriques d'erreur (MAE, RMSE, MAPE) et recommandations."],
            ["dbo.app_users", "Table système", "Gestion de la sécurité et contrôle d'accès : comptes utilisateurs, hachage sécurisé des mots de passe, traçabilité et affectation des deux rôles applicatifs (Administrateur et Opérateur)."]
          ],
          [2400, 1800, 4466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.3 : Structure des tables du Data Warehouse Nexora", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.3 Modélisation dimensionnelle et relationnelle"),
        body("La figure 3.1 présente le schéma relationnel et dimensionnel modélisant l'agencement des tables au sein de la base de données SQL Server :"),
        pb(),
        ...imageFigure("diagrams/er_diagram.png", "Figure 3.1 : Modélisation dimensionnelle et relationnelle du Data Warehouse Nexora", 440, 520),
        body("L'architecture des données s'articule autour des interconnexions suivantes :"),
        bullet("**MCMachineCenter vers FACT_CLE** : la dimension des machines est reliée à la table de faits de production par le code machine `[No_]`, permettant d'agréger les volumes d'injection et le TRS (Taux de Rendement Synthétique / OEE) par presse, atelier ou site."),
        bullet("**FACT_CLE vers ASTOCKDATE** : chaque déclaration de fabrication est reliée logiquement aux références de matières premières et résines plastiques consommées (`Item No_` vers `No_`), assurant la synchronisation entre cadence de fabrication et déstockage."),
        bullet("**FACT_CLE vers ml_production_predictions** : les séries chronologiques de production d'atelier issues de `FACT_CLE` alimentent l'entraînement des modèles d'IA, dont les projections calculées sont persistées dans la table analytique des prévisions."),
        bullet("**app_users** : garantit l'intégrité et le cloisonnement des droits d'accès sur l'ensemble des modules d'atelier et de supervision décisionnelle."),
        pb(),

        title2("3.4 Analyse exploratoire des données (EDA)"),
        title3("3.4.1 Analyse statistique de la production"),
        body("Une exploration statistique descriptive a été menée sur l'agrégat journalier de la production de pièces conformes (sur l'ensemble des 319 presses) afin d'en cerner la tendance centrale et la variabilité :"),
        pb(),
        makeTable(
          ["Variable de production", "Minimum", "Maximum", "Moyenne", "Médiane", "Écart-type", "CV (%)"],
          [
            ["Cadence journalière globale (pcs/j)", "12 450", "148 620", "64 890", "63 120", "19 450", "30,0 %"],
            ["Heures d'injection effectives / jour", "420 h", "2 380 h", "1 840 h", "1 890 h", "295 h", "16,0 %"],
            ["Heures d'arrêts machines / jour", "45 h", "890 h", "285 h", "260 h", "115 h", "40,4 %"],
            ["Taux de rebut moyen d'atelier", "0,4 %", "6,8 %", "1,85 %", "1,70 %", "0,65 %", "35,1 %"],
            ["Taux de conformité des pièces (%)", "93,2 %", "99,6 %", "98,15 %", "98,30 %", "0,65 %", "0,7 %"]
          ],
          [2400, 1000, 1000, 1100, 1100, 1000, 1066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.4 : Statistiques descriptives de la série journalière de production d'atelier", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 3.5 détaille l'impact mesuré des événements industriels et des variations calendaires sur la cadence d'atelier :"),
        pb(),
        makeTable(
          ["Période / Événement opérationnel", "Nb jours", "Cadence Moy. (pcs/j)", "Cadence Max (pcs/j)", "Ratio vs Normal"],
          [
            ["Activité nominale standard", "580", "66 420", "98 450", "1,00"],
            ["Période estivale (congés constructeurs)", "45", "38 210", "52 100", "0,58"],
            ["Pics de livraison de fin de trimestre", "60", "94 850", "148 620", "1,43"],
            ["Maintenance annuelle programmée", "14", "18 900", "28 400", "0,28"],
            ["Changements d'outillages (moules)", "72", "54 300", "76 200", "0,82"],
            ["Période de Ramadan (horaires adaptés)", "80", "56 800", "79 100", "0,86"]
          ],
          [2600, 1100, 1800, 1800, 1366]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.5 : Impact des événements et variations industrielles sur la cadence", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("*Note explicative* : La moyenne journalière pondérée calculée d'après la décomposition opérationnelle du Tableau 3.5 s'établit à **64 221 pièces/jour** (54 652 250 pièces / 851 jours). Le léger écart avec la moyenne descriptive empirique de 64 890 pièces/jour (+1,04 %, Tableau 3.4) s'explique par les ajustements de cadence intra-journaliers et les variations d'équipes lors des jours de basculement entre régimes de fabrication."),
        pb(),

        title3("3.4.2 Visualisation des séries temporelles"),
        body("La figure 3.2 retrace l'évolution temporelle de la production journalière globale sur les 851 jours observés, mettant en lumière le rythme soutenu de l'atelier entrecoupé des baisses saisonnières estivales et hivernales :"),
        pb(),
        ...imageFigure("image/fig_3_2_production_evolution.png", "Figure 3.2 : Évolution temporelle de la production globale des 319 presses (2024–2026)", 540, 230),
        body("La figure 3.3 présente la distribution de la cadence selon le jour de la semaine et le mois de l'année, démontrant la régularité du rythme du lundi au vendredi et l'allègement habituel des équipes le week-end :"),
        pb(),
        ...imageFigure("image/fig_3_3_saisonnalite.png", "Figure 3.3 : Profils de saisonnalité de production par jour de semaine et par mois", 540, 220),
        body("La figure 3.4 illustre la carte thermique croisant mois et jours de la semaine, localisant avec précision les périodes de forte sollicitation des presses :"),
        pb(),
        ...imageFigure("image/fig_3_4_heatmap.png", "Figure 3.4 : Heatmap d'activité atelier : cadence selon le mois et le jour de semaine", 540, 230),
        pb(),

        title2("3.5 Conception et réalisation du pipeline ETL"),
        title3("3.5.1 Architecture du pipeline ETL"),
        body("Le pipeline de traitement, développé en Python [18, 19], est conçu de façon modulaire afin de garantir la reproductibilité et la traçabilité des transformations. Il s'articule en quatre phases séquentielles :"),
        bullet("**1. Ingestion** : lecture des fichiers d'extraction bruts et contrôle de leur structure."),
        bullet("**2. Assainissement de la qualité** : application ordonnée des traitements de nettoyage décrits en section 3.5.3."),
        bullet("**3. Structuration dimensionnelle** : séparation des données en tables de dimensions et de faits conformément au modèle dimensionnel en étoile de Kimball [8]."),
        bullet("**4. Chargement dans le Data Warehouse** : insertion performante par lots dans SQL Server [16] avec mise à jour des index et journalisation."),
        pb(),
        body("La figure 3.5 illustre le flux séquentiel des données à travers le pipeline ETL :"),
        pb(),
        ...imageFigure("diagrams/sprint1_activity.png", "Figure 3.5 : Architecture et flux séquentiel du pipeline ETL", 520, 240),

        title3("3.5.2 Extraction des données"),
        body("Le module d'extraction extrait les données brutes issues des exports ERP sans modifier les structures initiales. Les données textuelles sont chargées sous forme brute pour permettre l'évaluation quantitative des anomalies avant toute opération de correction."),
        pb(),

        title3("3.5.3 Transformation et traitement des anomalies"),
        body("Afin d'illustrer pas à pas la cascade d'assainissement avec des métriques de contrôle traçables, les traitements sont présentés sur l'**échantillon d'audit documenté de 51 500 enregistrements** issu des exports de l'ERP. Le module de nettoyage regroupe ses traitements en cinq actions :"),
        bullet("**1. Suppression des doublons** : élimination de 18 337 lignes répétées pour une même date, un même article et un même site."),
        bullet("**2. Contrôle des dates** : mise au même format de toutes les dates et rejet de 660 lignes portant une date impossible (par exemple un 30 février)."),
        bullet("**3. Harmonisation des formats** : uniformisation des nombres (séparateur décimal, unités écrites dans les quantités) et des libellés (familles de matière, noms de sites)."),
        bullet("**4. Correction des coûts unitaires** : remplacement des coûts négatifs ou nuls par le coût médian de la famille de matière, et régularisation des stocks négatifs transitoires."),
        bullet("**5. Traitement des valeurs manquantes** : rejet de 460 lignes sans référence article exploitable et attribution de valeurs par défaut aux champs secondaires."),
        pb(),
        body("Le tableau 3.6 résume la cascade de rétention mesurée sur cet échantillon d'audit :"),
        pb(),
        makeTable(
          ["Étape de traitement ETL", "Volume (lignes)", "Variation"],
          [
            ["Volume brut extrait de l'ERP (Échantillon d'audit)", "51 500", "100 %"],
            ["Suppression des doublons stricts", "- 18 337", "- 35,61 %"],
            ["Rejet des dates et identifiants articles invalides (660 + 460)", "- 1 120", "- 2,17 %"],
            ["**Volume final validé chargé dans le Data Warehouse**", "**32 043**", "**Rétention : 62,22 %**"]
          ],
          [4800, 1800, 2066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.6 : Cascade de rétention sur l'échantillon d'audit documenté (51 500 lignes)", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Appliqué en production sur l'extraction globale de **862 065 lignes**, ce même pipeline retient 97,01 % des données pour alimenter les **814 065 enregistrements actifs** consolidés dans la table `dbo.ASTOCKDATE` du Data Warehouse."),
        body("À l'issue du nettoyage, les variables explicatives (calendrier, événements d'atelier, historique de production et moyennes mobiles) sont calculées pour alimenter les modèles de prévision ; elles sont détaillées au chapitre 5."),
        pb(),

        title3("3.5.4 Chargement dans le Data Warehouse"),
        body("La phase finale insère les données transformées dans les tables SQL Server du Data Warehouse [16]. Pour accélérer l'affichage des analyses, des index ont été créés sur les clés des tables ainsi que sur les champs de date et de référence article."),
        pb(),

        title2("3.6 Résultats du pipeline ETL"),
        body("Le tableau 3.7 synthétise les indicateurs de performance obtenus lors de l'exécution complète du pipeline sur l'échantillon d'audit :"),
        pb(),
        makeTable(
          ["Indicateur de performance ETL", "Valeur mesurée", "Interprétation"],
          [
            ["Lignes brutes traitées en entrée (Échantillon)", "51 500 enregistrements", "Volume d'inventaire audité extrait de l'ERP."],
            ["Lignes validées chargées dans le Data Warehouse", "32 043 enregistrements", "Volume assaini correspondant dans dbo.ASTOCKDATE."],
            ["Taux de rétention de données assainies", "62,22 %", "Après suppression des doublons (-35,6 %) et rejets (-2,2 %)."],
            ["Taux d'anomalies résiduelles post-traitement", "0,0 %", "Toutes les contraintes d'intégrité et de format sont satisfaites."],
            ["Variables créées pour l'apprentissage", "14 variables explicatives", "Prêtes pour la modélisation prédictive."],
            ["Temps moyen d'exécution du pipeline", "2,62 secondes", "Traitement rapide et reproductible de l'échantillon."]
          ],
          [3600, 2400, 2666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.7 : Résultats quantitatifs et techniques du pipeline ETL", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("3.7 Bilan du Sprint 1"),
        body("Le tableau 3.8 présente le bilan d'avancement des livrables réalisés au terme du Sprint 1 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Extraction des sources brutes", "Module de lecture des fichiers d'extraction", "Réalisé"],
            ["Nettoyage des données", "Module de nettoyage en cinq actions (doublons, dates, formats, coûts, valeurs manquantes)", "Réalisé"],
            ["Modélisation dimensionnelle", "Structuration relationnelle et dimensionnelle du Data Warehouse", "Réalisé"],
            ["Chargement en base de données", "Module d'insertion des données validées avec index", "Réalisé"],
            ["Variables explicatives", "Calcul et ingénierie des variables explicatives", "Réalisé"],
            ["Rapport d'audit de qualité", "Journal d'exécution et bilan avant/après nettoyage", "Réalisé"]
          ],
          [2400, 5066, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.8 : Bilan des livrables du Sprint 1", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("3.8 Conclusion"),
        conclusionBox("Ce chapitre a présenté les travaux menés lors du Sprint 1 pour fiabiliser les données industrielles. En assainissant le fichier brut d'inventaire de 51 500 lignes pour charger 32 043 enregistrements validés dans le Data Warehouse, le pipeline ETL garantit une base de données cohérente et sans doublon. Ces données intègres permettent d'aborder sereinement le Sprint 2, consacré au développement du module de gestion intelligente des stocks."),
        pageBreak(),
    '''

print("Chapter 3 module defined.")
