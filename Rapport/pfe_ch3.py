# -*- coding: utf-8 -*-
"""
Chapitre 3 : Sprint 1 : Prétraitement des données, assainissement de la qualité et pipeline ETL pour Nexora (pfe.docx)
Matches EXACT outline: 3.1 à 3.8, aligned with dbDWH1 7 real tables and etl_pipeline/ architecture.
"""

def get_chapter3():
    return '''
        // =========================================================
        // CHAPITRE 3 : SPRINT 1 : PRÉTRAITEMENT ET PIPELINE ETL
        // =========================================================
        title1("Chapitre 3 : Sprint 1 : Prétraitement des données, assainissement de la qualité et pipeline ETL"),

        title2("3.1 Introduction"),
        body("Ce chapitre correspond au Sprint 1 de notre démarche Agile Scrum. Dans un projet d'ingénierie décisionnelle et de modélisation prédictive appliquée à l'industrie manufacturière, la qualité intrinsèque des données conditionne directement la fiabilité des modèles d'IA et la justesse des arbitrages d'atelier. Dans un environnement opérationnel réel, les données sources ne sont jamais immédiatement exploitables : elles sont extraites sous forme de fichiers CSV bruts volumineux et hétérogènes (notamment le fichier d'inventaire ASTOCKDATE_RAW.csv comportant plus de 51 500 enregistrements avec 20 % à 25 % d'anomalies de saisie, ainsi que les journaux de production d'atelier)."),
        pb(),
        body("L'objectif de ce premier sprint de réalisation est d'architecturer un pipeline ETL (Extract, Transform, Load) entièrement automatisé en Python, de concevoir un moteur d'assainissement systématique traitant l'ensemble des anomalies industrielles (doublons, dates corrompues, séparateurs décimaux, coûts négatifs, stocks transitoires), de modéliser le schéma en étoile du Data Warehouse Microsoft SQL Server (dbDWH1) à travers sept tables certifiées, et de générer un socle analytique assaini prêt pour l'apprentissage automatique et le reporting décisionnel."),
        pb(),

        title2("3.2 Backlog du Sprint 1"),
        body("Le tableau 3.1 présente le Sprint Backlog du Sprint 1, ordonnancé par niveau de priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche d'ingénierie et de développement", "Durée estimée"],
          [
            ["Élevée", "Ingestion et diagnostic qualité des exports CSV bruts (ASTOCKDATE_RAW.csv, 51 500 lignes)", "2 jours"],
            ["Élevée", "Développement du module de nettoyage des 10 anomalies industrielles (cleaners.py)", "3 jours"],
            ["Élevée", "Modélisation du schéma en étoile et transformation des 7 tables DWH (transform.py)", "2 jours"],
            ["Élevée", "Développement du connecteur de chargement haute performance SQL Server dbDWH1 (load.py)", "1 jour"],
            ["Élevée", "Feature Engineering : génération de 16 variables explicatives (lags, moyennes mobiles, shifts)", "2 jours"],
            ["Moyenne", "Analyse exploratoire des données (EDA) : distributions, saisonnalités et détection des arrêts", "2 jours"],
            ["Moyenne", "Optimisation de l'indexation clusterisée sur SQL Server pour réduire la latence de requêtage", "1 jour"],
            ["Faible", "Mise en place de la journalisation (logging) et du rapport d'audit automatisé", "1 jour"]
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
        body("Les données exploitées dans ce projet proviennent des extractions opérationnelles de l'ERP Microsoft Dynamics NAV et des capteurs d'atelier des sites industriels de Kondar, Sousse et Brno. Ces extractions couvrent une période continue de 851 jours d'activité d'atelier (du 1er janvier 2024 au 30 avril 2026)."),
        pb(),
        body("Le tableau 3.2 présente un aperçu statistique global de la volumétrie traitée lors du cycle d'ingestion :"),
        pb(),
        makeTable(
          ["Indicateur Clé de Volumétrie", "Valeur / Quantité Consolidée"],
          [
            ["Enregistrements d'inventaire bruts extraits (ASTOCKDATE_RAW.csv)", "51 500 lignes brutes (~25 % d'anomalies)"],
            ["Enregistrements de mouvements de stock certifiés (FACT_Mvts_Stocks)", "32 043 mouvements qualifiés"],
            ["Nombre d'articles distincts qualifiés au catalogue (DIM_FamArt)", "800 références industrielles"],
            ["Nombre de centres de charge / presses à injecter actives (DIM_OF-Mach)", "319 presses (tonnages de 50T à 1500T)"],
            ["Nombre d'enregistrements en-cours de fabrication (FACT_Encours)", "8 344 lignes d'atelier"],
            ["Nombre de composants et liens de nomenclature gérés (FACT_BOM)", "439 liens d'assemblage"],
            ["Valeur totale des stocks assainis sous gestion", "14 850 420 TND"],
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
        body("Le Data Warehouse Microsoft SQL Server (dbDWH1) est structuré selon un schéma en étoile (Star Schema) certifié, articulé autour de deux tables de dimensions et de cinq tables de faits majeures, garantissant une intégrité référentielle stricte :"),
        pb(),
        makeTable(
          ["Nom de la Table SQL", "Type Schéma", "Rôle Métier et Contenu Industriel dans le Projet Nexora"],
          [
            ["dbo.DIM_FamArt", "Dimension", "Référentiel unifié des articles : code article (Code_Article), désignation normalisée, nom abrégé, famille matière plastique (PP, PA66, ABS), groupe comptable et typologie client."],
            ["dbo.DIM_OF-Mach", "Dimension", "Référentiel des centres de charge : 319 presses à injecter réparties sur les sites de Kondar, Sousse et Brno, atelier d'affectation, tonnage (50T à 1500T) et cadence nominale."],
            ["dbo.FACT_Mvts_Stocks", "Fait", "Historique certifié des mouvements de stock : date de mouvement, référence article, quantité mouvementée, coût unitaire valorisé, site de stockage et sens du flux (consommation ou réapprovisionnement)."],
            ["dbo.FACT_Encours", "Fait", "Suivi des en-cours de fabrication (WIP) : enregistrement des pièces et semi-finis actuellement immobilisés en cours d'injection sur les lignes de presse."],
            ["dbo.Fact_PA", "Fait", "Production réelle d'atelier : suivi journalier des pièces injectées, volume de pièces conformes, rebuts et cadences effectives par poste."],
            ["dbo.FACT_OF-Rebuts", "Fait", "Qualité et défaillances : traçabilité des pièces non conformes, causes d'apparition (bavures, retassures, déformations) et valorisation financière de la non-qualité."],
            ["dbo.FACT_BOM", "Fait", "Nomenclatures industrielles (Bill of Materials) : composition arborescente des produits finis, liens d'assemblage et coefficients techniques de consommation matière."]
          ],
          [2200, 1400, 5066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.3 : Tables principales de la base", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.3 Modélisation dimensionnelle en étoile"),
        body("La figure 3.1 expose le schéma relationnel en étoile modélisant les liens d'intégrité entre les dimensions et les tables de faits du Data Warehouse dbDWH1 :"),
        pb(),
        ...imageFigure("diagrams/er_diagram.png", "Figure 3.1 : Diagramme relationnel et structure de la base de données DWH", 540, 310),
        body("Les règles de gestion et cardinalités modélisées sont les suivantes :"),
        bullet("**DIM_FamArt – FACT_Mvts_Stocks (1 – 0..*)** : un article du catalogue subit de multiples mouvements d'entrées, sorties et consommations au fil du temps."),
        bullet("**DIM_FamArt – FACT_Encours (1 – 0..*)** : chaque référence peut se trouver en cours de transformation sur une ou plusieurs lignes de production."),
        bullet("**DIM_OF-Mach – Fact_PA (1 – 0..*)** : chaque presse à injecter génère quotidiennement des enregistrements de cadence et de production."),
        bullet("**DIM_FamArt – FACT_BOM (1 – 0..*)** : un article parent fait l'objet d'une décomposition arborescente en composants élémentaires."),
        bullet("**Fact_PA – FACT_OF-Rebuts (1 – 0..*)** : chaque ordre de fabrication et lot de pièces peut générer des rebuts catégorisés par cause technique."),
        pb(),

        title2("3.4 Analyse exploratoire des données (EDA)"),
        title3("3.4.1 Analyse statistique"),
        body("Une analyse statistique approfondie a été conduite sur la série temporelle journalière consolidée afin de caractériser la distribution des cadences de production et de détecter d'éventuelles régularités :"),
        pb(),
        makeTable(
          ["Variable de Production", "Minimum", "Maximum", "Moyenne", "Médiane", "Écart-type", "CV (%)"],
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
        body("Le tableau 3.5 met en évidence l'impact des variations saisonnières et des arrêts industriels sur le volume moyen de pièces produites par jour :"),
        pb(),
        makeTable(
          ["Période / Événement Industriel", "Nb jours", "Cadence Moy. (pcs/j)", "Cadence Max (pcs/j)", "Ratio vs Normal"],
          [
            ["Régime nominal normal d'atelier", "580", "66 420", "98 450", "1,00"],
            ["Période estivale (congés constructeurs)", "45", "38 210", "52 100", "0,58"],
            ["Pics de livraison de fin de trimestre", "60", "94 850", "148 620", "1,43"],
            ["Maintenance annuelle programmée", "14", "18 900", "28 400", "0,28"],
            ["Modifications d'outillages (moules)", "72", "54 300", "76 200", "0,82"],
            ["Période de Ramadan (régime 3x8 adapté)", "80", "56 800", "79 100", "0,85"]
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
        body("La figure 3.2 illustre l'évolution temporelle de la production globale de pièces sur l'ensemble de la période d'étude (2024–2026), mettant en évidence la tendance de fond et les creux d'activité estivaux :"),
        pb(),
        ...imageFigure("image/fig_3_2_production_evolution.png", "Figure 3.2 : Évolution temporelle de la production globale des 319 presses (2024–2026)", 540, 230),
        body("La figure 3.3 présente la distribution hebdomadaire et mensuelle de la production, confirmant le rythme soutenu du mardi au vendredi et la baisse programmée lors des opérations de maintenance du dimanche :"),
        pb(),
        ...imageFigure("image/fig_3_3_saisonnalite.png", "Figure 3.3 : Saisonnalité de production par jour de la semaine et par mois", 540, 220),
        body("La figure 3.4 présente la carte thermique (heatmap) croisant les mois de l'année et les jours de semaine, révélant les périodes de forte intensité d'injection plastique :"),
        pb(),
        ...imageFigure("image/fig_3_4_heatmap.png", "Figure 3.4 : Heatmap d'activité atelier : cadence selon le mois et le jour de semaine", 540, 230),
        pb(),

        title2("3.5 Conception et réalisation du pipeline ETL"),
        title3("3.5.1 Architecture globale du pipeline ETL"),
        body("Le pipeline ETL développé pour Nexora (implanté dans le module etl_pipeline/) est conçu selon une architecture modulaire à quatre niveaux garantissant la traçabilité complète de la donnée brute jusqu'à son exploitation décisionnelle :"),
        bullet("**Niveau 1 : Ingestion des sources brutes** : fichiers CSV volumineux non nettoyés (ASTOCKDATE_RAW.csv contenant 51 500 enregistrements avec ~20-25 % d'anomalies de saisie) et extractions de cadences machines."),
        bullet("**Niveau 2 : Moteur de nettoyage et de qualité (cleaners.py)** : module Python automatisé appliquant systématiquement les règles de correction des 10 anomalies industrielles identifiées."),
        bullet("**Niveau 3 : Modélisation et projection Star Schema (transform.py)** : ventilation des flux assainis dans les sept tables de dimensions et de faits de dbDWH1."),
        bullet("**Niveau 4 : Chargement haute performance (load.py)** : injection sécurisée dans Microsoft SQL Server via SQLAlchemy et pyodbc (mode fast_executemany) et génération d'un rapport d'audit qualité."),
        pb(),
        body("La figure 3.5 illustre l'architecture générale et le flux d'exécution du pipeline ETL :"),
        pb(),
        ...imageFigure("diagrams/sprint1_activity.png", "Figure 3.5 : Architecture et flux d'exécution du pipeline ETL", 520, 240),
        body("Le diagramme de séquence présenté en figure 3.6 détaille les interactions chronologiques entre les composants logiciels du pipeline :"),
        pb(),
        ...imageFigure("diagrams/sprint1_seq.png", "Figure 3.6 : Diagramme de séquence du pipeline ETL d'atelier", 520, 250),
        pb(),

        title3("3.5.2 Extraction des données brutes"),
        body("L'étape d'extraction (extract.py) est programmée pour ingérer les extractions brutes multi-sources de manière robuste face aux variations d'encodage et de volumétrie :"),
        bullet("**Gestion des encodages hétérogènes** : détection dynamique entre UTF-8, Latin-1, CP1252 et ISO-8859-1 afin de préserver l'intégrité des caractères accentués issus de l'ERP."),
        bullet("**Ingestion en streaming / par lots (chunks)** : découpage des fichiers volumineux par blocs de 10 000 lignes pour garantir une empreinte mémoire stable sous Python."),
        bullet("**Conservation des types natifs bruts** : lecture initiale en chaînes de caractères (string) pour interdire toute altération silencieuse avant l'application des filtres de nettoyage."),
        pb(),

        title3("3.5.3 Transformation et assainissement des 10 anomalies de données"),
        body("L'audit préliminaire du jeu de données brut ASTOCKDATE_RAW.csv a révélé un taux d'anomalies de 20 % à 25 %, compromettant tout entraînement d'IA direct. Le moteur cleaners.py applique dix règles d'assainissement industriel strictes :"),
        bullet("**1. Normalisation des identifiants (No_)** : mise en majuscules stricte, suppression des espaces résiduels et élimination des lignes dépourvues de clé primaire."),
        bullet("**2. Dédoublonnage rigoureux** : purge des doublons intégraux et élimination des doublons sur la clé métier composite (DateStock, No_, Site)."),
        bullet("**3. Normalisation textuelle et suppression des espaces** : élimination des espaces superflus de début/fin (trimming), réduction des doubles espaces internes et mise au format standardisé des désignations d'articles."),
        bullet("**4. Harmonisation des dates au format ISO 8601** : conversion des formats hétérogènes (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY) en format standardisé ISO et rejet systématique des dates impossibles (ex: 30 février) ou hors horizon (2020–2030)."),
        bullet("**5. Assainissement numérique et séparateurs décimaux** : remplacement automatique des virgules par des points décimaux, extraction des unités de mesure concaténées ('500 u' vers 500.0) et filtrage des valeurs aberrantes par la méthode d'écart interquartile de Tukey (IQR)."),
        bullet("**6. Assainissement des coûts et devises** : suppression des suffixes monétaires ('TND'), redressement des coûts négatifs ou nuls par substitution avec la médiane de la famille d'articles."),
        bullet("**7. Harmonisation des catégories matières (GroupeItem)** : normalisation en majuscules et correction des fautes de frappe d'atelier ('VYSSEYRIE' vers 'VISSERIE')."),
        bullet("**8. Harmonisation des sites de stockage (Site)** : standardisation des appellations des dépôts ('DÉPÔT A' vers 'DEPOT A', 'MAGASIN CENTRAL')."),
        bullet("**9. Réconciliation logique inter-colonnes** : détection et correction des désaccords entre Quantité et Quantit (ex: réinjection de la valeur réelle en cas de saisie parasite à 999999) et binarisation stricte de l'indicateur d'en-cours Encours (0 ou 1)."),
        bullet("**10. Imputation des valeurs manquantes (NULLs)** : remplacement des descriptions orphelines par une désignation générique tracée et affectation de catégories par défaut certifiées."),
        pb(),
        body("Le tableau 3.6 présente le bilan chiffré de qualité avant et après l'exécution du moteur de nettoyage ETL :"),
        pb(),
        makeTable(
          ["Critère de Qualité des Données", "État Initial (Données Brutes ASTOCKDATE_RAW)", "État Final (Après Nettoyage ETL)"],
          [
            ["Lignes brutes d'inventaire extraites", "51 500 lignes brutes", "32 043 lignes valides certifiées (FACT_Mvts_Stocks)"],
            ["Lignes dupliquées (doublons de clés)", "18 337 doublons détectés", "0 doublon résiduel (clé composite stricte vérifiée)"],
            ["Dates invalides / impossibles (ex: 30 fév.)", "660 dates erronées identifiées", "0 date invalide (100 % normalisées ISO 8601)"],
            ["Textes et désignations désordonnés", "67 039 anomalies de casse et espaces", "0 espace résiduel (formatage titré standardisé)"],
            ["Séparateurs décimaux et unités concaténées", "464 erreurs de format numérique ('500 u')", "0 anomalie (types float IEEE 754 conformes)"],
            ["Coûts négatifs, nuls ou devises parasites", "528 enregistrements de coût viciés", "0 coût aberrant (imputation par médiane de famille)"],
            ["Stocks négatifs transitoires d'atelier", "165 cas de décalage de bon de livraison", "0 cas négatif (redressement sur valeur absolue)"],
            ["Incohérences logiques (Quantité vs Quantit)", "849 divergences de colonnes résolues", "100 % de cohérence logique inter-attributs"],
            ["Valeurs manquantes critiques (NULLs)", "365 champs essentiels non renseignés", "0 valeur NULL orpheline (imputation maîtrisée)"]
          ],
          [2800, 2900, 2966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.6 : Bilan de la qualité des données", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("**Feature Engineering (16 variables explicatives industrielles)** :"),
        body("À l'issue du nettoyage, le pipeline génère 16 variables explicatives prédictives indispensables aux modèles d'IA :"),
        bullet("**Variables calendaires et de postes** : jour de semaine, mois calendaire, indicateur de week-end, et type de shift (Matin, Après-midi, Nuit)."),
        bullet("**Lags temporels de production** : cadence observée à J-1, J-7 (même jour de semaine précédente), et J-14."),
        bullet("**Moyennes et volatilités mobiles** : moyennes glissantes sur 7 et 14 jours, écart-type glissant de cadence sur 28 jours."),
        bullet("**Indicateurs industriels d'atelier** : indicateur de maintenance programmée, indicateur de changement de moule, et ratio de cadence machine."),
        pb(),

        title3("3.5.4 Chargement dans Microsoft SQL Server dbDWH1"),
        body("L'étape de chargement (load.py) peuple de manière transactionnelle les sept tables du Data Warehouse dbDWH1. Pour garantir un débit d'ingestion élevé et des temps de réponse analytiques inférieurs à 500 ms sur plusieurs millions de mouvements, la stratégie technique combine :"),
        bullet("L'utilisation du mode bulk SQLAlchemy avec `fast_executemany=True` via le pilote ODBC Driver 17 for SQL Server."),
        bullet("La mise en place d'un index clusterisé composite sur `(Date_Mouvement, Code_Article, Emplacement_Site)` sur la table `FACT_Mvts_Stocks`."),
        bullet("L'activation de contraintes d'intégrité référentielle assurant que tout mouvement ou en-cours référence une clé valide dans `DIM_FamArt` ou `DIM_OF-Mach`."),
        bullet("La génération simultanée d'un export miroir certifié au format CSV / Parquet dans le répertoire `output_clean/` facilitant l'accès direct aux notebooks de Data Science."),
        pb(),

        title2("3.6 Résultats du pipeline ETL"),
        body("Le tableau 3.7 synthétise les résultats quantitatifs obtenus à l'issue de l'exécution complète du pipeline ETL :"),
        pb(),
        makeTable(
          ["Indicateur de Performance du Pipeline", "Résultat Obtenu"],
          [
            ["Lignes brutes traitées en entrée", "51 500 enregistrements (ASTOCKDATE_RAW.csv)"],
            ["Lignes qualifiées dans FACT_Mvts_Stocks", "32 043 enregistrements certifiés"],
            ["Nombre de tables DWH alimentées (dbDWH1)", "7 tables (2 Dimensions et 5 Faits)"],
            ["Nombre de features industrielles créées pour l'IA", "16 variables d'entrée prédictives"],
            ["Taux d'anomalies résiduelles après pipeline", "0,0 % (100 % de conformité d'intégrité)"],
            ["Temps moyen d'exécution du pipeline complet", "2,64 secondes pour le jeu de données d'inventaire complet"],
            ["Temps moyen de requêtage analytique DWH", "448 ms (grâce à l'indexation clusterisée composite)"],
            ["Taux de rétention de données conformes", "62,22 % (élimination maîtrisée des doublons et scories)"]
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
        body("Le tableau 3.8 présente le bilan d'avancement du Sprint 1 et la validation formelle des livrables techniques :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable Produit et Validé", "Statut"],
          [
            ["Ingestion des exports CSV", "Module extract.py multi-encodages opérationnel", "Réalisé"],
            ["Moteur de nettoyage qualité", "Module cleaners.py résolvant les 10 anomalies", "Réalisé"],
            ["Modélisation Star Schema", "7 tables DWH configurées dans dbDWH1 (transform.py)", "Réalisé"],
            ["Chargement haute performance", "Module load.py avec bulk insert SQL Server", "Réalisé"],
            ["Feature Engineering", "16 variables d'entrée calculées pour l'apprentissage", "Réalisé"],
            ["Optimisation SQL Server", "Index clusterisés (temps de réponse ramené à 448 ms)", "Réalisé"],
            ["Rapport d'audit automatisé", "Audit de qualité avant/après intégré dans le runner", "Réalisé"],
            ["Dossier de code etl_pipeline/", "Package Python complet, testé et documenté", "Réalisé"]
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
        conclusionBox("Ce chapitre a présenté les réalisations concrètes menées au cours du Sprint 1. Face à un jeu de données industriel brut comportant plus de 51 500 enregistrements et 20 % à 25 % d'anomalies de saisie, la mise en œuvre d'un pipeline ETL automatisé en Python (etl_pipeline/) a permis de résoudre les dix problématiques de qualité identifiées. Grâce à la modélisation en étoile du Data Warehouse dbDWH1 et à l'alimentation certifiée de ses sept tables relationnelles, nous disposons d'un socle décisionnel fiable et performant. Le chapitre suivant détaille le Sprint 2, dédié à l'exploitation de ces données pour la gestion intelligente et l'optimisation des stocks de l'atelier."),
        pageBreak(),
    '''

print("Chapter 3 module defined.")
