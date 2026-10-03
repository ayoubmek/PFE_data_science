# -*- coding: utf-8 -*-
"""
Chapitre 3 : Sprint 1 : Prétraitement des données, assainissement de la qualité et pipeline ETL pour Nexora (pfe.docx)
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
        body("Ce chapitre correspond au Sprint 1 de notre démarche Agile Scrum. Dans un projet d'analyse de données et d'aide à la décision, la qualité des informations en entrée conditionne la fiabilité des résultats. Dans un contexte industriel réel, les données brutes issues des systèmes d'information comportent fréquemment des anomalies de saisie, des doublons ou des valeurs manquantes. L'objectif de ce premier sprint est donc d'extraire les données brutes, d'identifier les anomalies de qualité, de concevoir un pipeline de nettoyage en Python et de charger les données assainies dans les sept tables du Data Warehouse Microsoft SQL Server (dbDWH1)."),
        pb(),

        title2("3.2 Backlog du Sprint 1"),
        body("Le tableau 3.1 présente les tâches planifiées pour le Sprint 1, ordonnancées par priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Extraction et audit de qualité des fichiers bruts (ex: ASTOCKDATE_RAW.csv, 51 500 lignes)", "2 jours"],
            ["Élevée", "Développement des fonctions de nettoyage pour les 10 anomalies identifiées", "3 jours"],
            ["Élevée", "Structuration des données selon le schéma en étoile du DWH (7 tables)", "2 jours"],
            ["Élevée", "Mise en place du chargement automatisé vers SQL Server dbDWH1", "1 jour"],
            ["Élevée", "Calcul des variables temporelles et statistiques (Feature Engineering)", "2 jours"],
            ["Moyenne", "Analyse exploratoire des séries de production (distributions, saisonnalités)", "2 jours"],
            ["Moyenne", "Création des index adaptés sur les tables de faits SQL Server", "1 jour"],
            ["Faible", "Mise en place de la journalisation et du rapport d'audit automatisé", "1 jour"]
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
        body("Les données utilisées proviennent des extractions opérationnelles de l'ERP de l'entreprise et des relevés de production d'atelier des sites de Kondar, Sousse et Brno. Ces données couvrent une période continue d'activité d'atelier (du 1er janvier 2024 au 30 avril 2026)."),
        pb(),
        body("Le tableau 3.2 donne un aperçu statistique global de la volumétrie traitée :"),
        pb(),
        makeTable(
          ["Indicateur de volumétrie", "Valeur constatée"],
          [
            ["Lignes brutes d'inventaire extraites (ASTOCKDATE_RAW.csv)", "51 500 enregistrements bruts"],
            ["Lignes de mouvements de stock certifiées (FACT_Mvts_Stocks)", "32 043 enregistrements nettoyés"],
            ["Nombre d'articles distincts au catalogue (DIM_FamArt)", "800 références d'atelier"],
            ["Nombre de presses à injecter suivies (DIM_OF-Mach)", "319 machines actives"],
            ["Nombre d'enregistrements en-cours de fabrication (FACT_Encours)", "8 344 lignes d'en-cours"],
            ["Nombre de composants et liens de nomenclature (FACT_BOM)", "439 liens d'assemblage"],
            ["Période d'activité analysée", "851 jours d'atelier (01/01/2024 au 30/04/2026)"]
          ],
          [4500, 4166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.2 : Aperçu statistique général de la base de données DWH", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.2 Description des tables principales du Data Warehouse dbDWH1"),
        body("Le Data Warehouse (dbDWH1) est organisé selon un schéma en étoile articulé autour de deux tables de dimensions et de cinq tables de faits :"),
        pb(),
        makeTable(
          ["Nom de la table", "Type", "Rôle et contenu dans le projet"],
          [
            ["dbo.DIM_FamArt", "Dimension", "Référentiel des articles : code article, désignation, nom abrégé, famille matière, groupe comptable et typologie client."],
            ["dbo.DIM_OF-Mach", "Dimension", "Référentiel des machines : 319 presses à injecter réparties par site (Kondar, Sousse, Brno), tonnage et atelier d'affectation."],
            ["dbo.FACT_Mvts_Stocks", "Fait", "Historique des mouvements de stock : date, référence article, quantité, coût unitaire valorisé et site de stockage."],
            ["dbo.FACT_Encours", "Fait", "Suivi des en-cours de fabrication : pièces et semi-finis actuellement en cours d'injection sur les lignes."],
            ["dbo.Fact_PA", "Fait", "Production réelle de l'atelier : pièces injectées, pièces conformes, rebuts et cadences constatées par jour."],
            ["dbo.FACT_OF-Rebuts", "Fait", "Qualité et défaillances : enregistrement des pièces rebutées avec la cause constatée (bavure, déformation, etc.)."],
            ["dbo.FACT_BOM", "Fait", "Nomenclatures des produits : décomposition des produits finis en sous-composants avec les quantités requises."]
          ],
          [2200, 1400, 5066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.3 : Tables principales de la base", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.3 Modélisation dimensionnelle"),
        body("La figure 3.1 présente le schéma relationnel modélisant les liens entre les dimensions et les tables de faits du Data Warehouse dbDWH1 :"),
        pb(),
        ...imageFigure("diagrams/er_diagram.png", "Figure 3.1 : Diagramme relationnel et structure de la base de données DWH", 540, 310),
        body("Les principales relations sont les suivantes :"),
        bullet("**DIM_FamArt vers FACT_Mvts_Stocks** : chaque article peut faire l'objet de plusieurs mouvements de stock dans le temps."),
        bullet("**DIM_FamArt vers FACT_Encours** : un article peut être en cours de fabrication sur une ou plusieurs lignes de production."),
        bullet("**DIM_OF-Mach vers Fact_PA** : chaque presse génère quotidiennement des enregistrements de production."),
        bullet("**DIM_FamArt vers FACT_BOM** : un article parent est relié à l'ensemble de ses composants nécessaires à la fabrication."),
        bullet("**Fact_PA vers FACT_OF-Rebuts** : les ordres de fabrication consignent les pièces rebutées et leur motif."),
        pb(),

        title2("3.4 Analyse exploratoire des données (EDA)"),
        title3("3.4.1 Analyse statistique"),
        body("Une analyse statistique descriptive a été menée sur les cadences journalières afin d'étudier la distribution de la production :"),
        pb(),
        makeTable(
          ["Variable de production", "Minimum", "Maximum", "Moyenne", "Médiane", "Écart-type", "CV (%)"],
          [
            ["Cadence journalière (pièces/jour)", "12 450", "148 620", "64 890", "63 120", "19 450", "30,0 %"],
            ["Heures d'injection effectives / jour", "420 h", "2 380 h", "1 840 h", "1 890 h", "295 h", "16,0 %"],
            ["Heures d'arrêts machines / jour", "45 h", "890 h", "285 h", "260 h", "115 h", "40,4 %"],
            ["Taux de rebut moyen d'atelier", "0,4 %", "6,8 %", "1,85 %", "1,70 %", "0,65 %", "35,1 %"],
            ["Taux de Rendement Global (TRG/OEE)", "48,2 %", "88,6 %", "71,4 %", "72,1 %", "6,8 %", "9,5 %"]
          ],
          [2400, 1000, 1000, 1100, 1100, 1000, 1066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.4 : Statistiques descriptives de la série journalière de production", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 3.5 met en évidence l'impact de certains événements sur le volume moyen de pièces produites par jour :"),
        pb(),
        makeTable(
          ["Période / Événement", "Nb jours", "Cadence Moy. (pcs/j)", "Cadence Max (pcs/j)", "Ratio vs Normal"],
          [
            ["Activité nominale standard", "580", "66 420", "98 450", "1,00"],
            ["Période estivale (congés constructeurs)", "45", "38 210", "52 100", "0,58"],
            ["Pics de livraison de fin de trimestre", "60", "94 850", "148 620", "1,43"],
            ["Maintenance annuelle programmée", "14", "18 900", "28 400", "0,28"],
            ["Changements d'outillages (moules)", "72", "54 300", "76 200", "0,82"],
            ["Période de Ramadan (horaires adaptés)", "80", "56 800", "79 100", "0,85"]
          ],
          [2600, 1100, 1800, 1800, 1366]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.5 : Impact des événements et variations industrielles sur la cadence", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.4.2 Visualisation des données"),
        body("La figure 3.2 montre l'évolution globale de la production de pièces sur la période étudiée, mettant en évidence les variations saisonnières et les baisses d'activité en période estivale :"),
        pb(),
        ...imageFigure("image/fig_3_2_production_evolution.png", "Figure 3.2 : Évolution temporelle de la production globale des 319 presses (2024–2026)", 540, 230),
        body("La figure 3.3 présente la répartition de la production par jour de la semaine et par mois, illustrant la régularité du rythme en milieu de semaine et la baisse habituelle le week-end :"),
        pb(),
        ...imageFigure("image/fig_3_3_saisonnalite.png", "Figure 3.3 : Saisonnalité de production par jour de la semaine et par mois", 540, 220),
        body("La figure 3.4 montre une carte thermique croisant les mois et les jours de semaine, identifiant les périodes de plus forte charge d'atelier :"),
        pb(),
        ...imageFigure("image/fig_3_4_heatmap.png", "Figure 3.4 : Heatmap d'activité atelier : cadence selon le mois et le jour de semaine", 540, 230),
        pb(),

        title2("3.5 Conception et réalisation du pipeline ETL"),
        title3("3.5.1 Architecture du pipeline ETL"),
        body("Le pipeline de traitement (situé dans le module etl_pipeline/) est conçu pour automatiser l'ingestion, le nettoyage et le chargement des données. Il s'organise selon les étapes suivantes :"),
        bullet("**1. Ingestion des sources brutes** : lecture des fichiers CSV non nettoyés issus des exports ERP et d'atelier."),
        bullet("**2. Nettoyage de la qualité** : application systématique de règles pour corriger les 10 anomalies recensées."),
        bullet("**3. Structuration en schéma en étoile** : projection des enregistrements nettoyés vers les deux dimensions et cinq faits."),
        bullet("**4. Chargement vers la base de données** : écriture dans les tables de SQL Server dbDWH1 et génération d'un rapport de synthèse."),
        pb(),
        body("La figure 3.5 illustre le flux général d'exécution du pipeline ETL :"),
        pb(),
        ...imageFigure("diagrams/sprint1_activity.png", "Figure 3.5 : Architecture et flux d'exécution du pipeline ETL", 520, 240),
        body("Le diagramme de séquence de la figure 3.6 détaille les étapes successives d'extraction, de transformation et de chargement :"),
        pb(),
        ...imageFigure("diagrams/sprint1_seq.png", "Figure 3.6 : Diagramme de séquence du pipeline ETL d'atelier", 520, 250),
        pb(),

        title3("3.5.2 Extraction des données"),
        body("Le module d'extraction lit les fichiers sources bruts en prenant en compte les variations d'encodage (UTF-8, Latin-1) et de structure. La lecture s'effectue sous forme de texte brut afin de préserver l'état initial des données avant d'appliquer les corrections."),
        pb(),

        title3("3.5.3 Transformation et traitement des anomalies"),
        body("L'analyse initiale du fichier brut a révélé environ 20 % à 25 % d'anomalies de saisie. Le module de nettoyage traite dix types d'incohérences courantes :"),
        bullet("**1. Identifiants articles (No_)** : mise en majuscules, suppression des espaces et élimination des lignes sans référence."),
        bullet("**2. Dédoublonnage** : suppression des lignes strictement identiques et des doublons sur la clé métier composite (DateStock, No_, Site)."),
        bullet("**3. Nettoyage du texte** : suppression des espaces superflus de début et fin de chaîne, et réduction des doubles espaces."),
        bullet("**4. Harmonisation des dates** : conversion des dates au format ISO 8601 (YYYY-MM-DD) et rejet des dates non valides (ex: 30 février)."),
        bullet("**5. Formats numériques** : remplacement de la virgule par un point décimal, suppression des unités de mesure dans les champs de quantité ('500 u' vers 500.0) et traitement des valeurs aberrantes."),
        bullet("**6. Coûts unitaires** : suppression des suffixes monétaires ('TND') et remplacement des coûts négatifs ou nuls par la médiane de la famille d'articles."),
        bullet("**7. Catégories d'articles** : harmonisation de la casse et correction des fautes de frappe usuelles."),
        bullet("**8. Sites de stockage** : standardisation des noms de dépôts pour éviter les doublons d'appellation."),
        bullet("**9. Cohérence entre colonnes** : réconciliation des écarts entre les colonnes de quantité et normalisation de l'indicateur d'en-cours (0 ou 1)."),
        bullet("**10. Valeurs manquantes** : attribution de libellés ou de catégories par défaut pour les champs non renseignés."),
        pb(),
        body("Le tableau 3.6 résume le bilan quantitatif des données avant et après exécution du nettoyage :"),
        pb(),
        makeTable(
          ["Critère de qualité", "État initial (Fichier brut)", "État final (Après nettoyage ETL)"],
          [
            ["Lignes d'inventaire traitées", "51 500 lignes brutes", "32 043 lignes valides (FACT_Mvts_Stocks)"],
            ["Lignes dupliquées éliminées", "18 337 doublons détectés", "0 doublon résiduel sur clé composite"],
            ["Dates invalides écartées", "660 dates non conformes", "0 date erronée (100 % au format ISO)"],
            ["Champs textuels nettoyés", "67 039 corrections d'espaces/casse", "Textes uniformisés et lisibles"],
            ["Séparateurs décimaux et unités corrigés", "464 formats numériques corrigés", "0 anomalie (nombres décimaux conformes)"],
            ["Coûts négatifs ou nuls ajustés", "528 valeurs de coût non valides", "0 coût aberrant (imputation par médiane)"],
            ["Stocks négatifs transitoires régularisés", "165 cas constatés", "0 stock négatif résiduel"],
            ["Incohérences logiques résolues", "849 écarts entre colonnes résolus", "Cohérence rétablie entre attributs"],
            ["Champs manquants traités", "365 valeurs non renseignées", "0 champ orphelin (valeurs par défaut attribuées)"]
          ],
          [2800, 2900, 2966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.6 : Bilan de la qualité des données", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("**Préparation des variables (Feature Engineering)** :"),
        body("Après nettoyage, 16 variables explicatives sont calculées pour préparer l'apprentissage des modèles :"),
        bullet("**Variables de calendrier** : jour de la semaine, mois, indicateur de week-end et type d'équipe (matin, après-midi, nuit)."),
        bullet("**Variables de décalage (lags)** : cadences observées à J-1, J-7 et J-14 pour intégrer l'historique récent."),
        bullet("**Moyennes mobiles** : moyennes glissantes sur 7 et 14 jours et volatilité de la production sur 28 jours."),
        bullet("**Indicateurs d'atelier** : suivi des opérations de maintenance et des changements de moule."),
        pb(),

        title3("3.5.4 Chargement dans le Data Warehouse"),
        body("L'étape finale charge les données assainies dans les sept tables du Data Warehouse dbDWH1. Pour optimiser les temps d'accès, des index clusterisés ont été définis sur les colonnes clés (comme la date et la référence article dans FACT_Mvts_Stocks). En complément, un export des tables au format CSV est conservé pour faciliter les analyses directes."),
        pb(),

        title2("3.6 Résultats du pipeline ETL"),
        body("Le tableau 3.7 résume les principaux résultats obtenus à l'issue de l'exécution du pipeline :"),
        pb(),
        makeTable(
          ["Indicateur du pipeline", "Résultat obtenu"],
          [
            ["Lignes brutes traitées en entrée", "51 500 enregistrements"],
            ["Lignes conservées dans FACT_Mvts_Stocks", "32 043 enregistrements nettoyés"],
            ["Tables alimentées dans dbDWH1", "7 tables (2 dimensions et 5 faits)"],
            ["Variables explicatives calculées pour l'IA", "16 variables d'entrée"],
            ["Temps d'exécution du pipeline complet", "Environ 2,6 secondes pour l'inventaire"],
            ["Taux de données valides conservées", "62,2 % (après suppression des doublons et anomalies)"],
            ["Taux d'anomalies résiduelles", "0,0 % (données conformes aux règles définies)"]
          ],
          [5200, 3466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.7 : Résultats du pipeline ETL", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("3.7 Bilan du Sprint 1"),
        body("Le tableau 3.8 présente le bilan des livrables réalisés au cours du Sprint 1 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Extraction des fichiers bruts", "Module d'ingestion multi-formats opérationnel", "Réalisé"],
            ["Nettoyage des données", "Module traitant les 10 anomalies identifiées", "Réalisé"],
            ["Schéma en étoile", "Définition des 7 tables du Data Warehouse dbDWH1", "Réalisé"],
            ["Chargement en base", "Module d'insertion avec gestion des exports", "Réalisé"],
            ["Préparation des variables", "16 variables explicatives créées pour les modèles", "Réalisé"],
            ["Optimisation SQL Server", "Mise en place des index sur les tables de faits", "Réalisé"],
            ["Rapport d'audit", "Génération automatique du bilan avant/après nettoyage", "Réalisé"],
            ["Dossier de code etl_pipeline/", "Scripts organisés, testés et documentés", "Réalisé"]
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
        conclusionBox("Ce chapitre a présenté les travaux du Sprint 1 consacrés à la préparation et au nettoyage des données. À partir d'un fichier brut comportant des anomalies variées, le développement d'un pipeline ETL modulaire a permis de structurer et d'assainir les informations avant leur intégration dans le Data Warehouse dbDWH1. Ces données fiabilisées constituent une base solide pour la suite du projet. Le chapitre suivant aborde le Sprint 2, dédié à la gestion des stocks de l'atelier."),
        pageBreak(),
    '''

print("Chapter 3 module defined.")
