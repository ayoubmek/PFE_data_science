# -*- coding: utf-8 -*-
"""
Chapitre 3 : Sprint 1 : Prétraitement des données et pipeline ETL pour Nexora (pfe.docx)
Matches EXACT outline: 3.1 à 3.8
"""

def get_chapter3():
    return '''
        // =========================================================
        // CHAPITRE 3 : SPRINT 1 : PRÉTRAITEMENT ET PIPELINE ETL
        // =========================================================
        title1("Chapitre 3 : Sprint 1 : Prétraitement des données et pipeline ETL"),

        title2("3.1 Introduction"),
        body("Ce chapitre correspond au Sprint 1 de notre démarche Agile Scrum. Dans un projet de Business Intelligence et de modélisation prédictive appliquée à l'industrie, la qualité intrinsèque des données conditionne directement la fiabilité des modèles d'IA et la pertinence des décisions d'atelier. L'objectif de ce premier sprint de réalisation est d'extraire les données brutes du Data Warehouse Microsoft SQL Server, de diagnostiquer les anomalies industrielles (notamment les stocks négatifs transitoires et les temps d'arrêt non renseignés), de construire un pipeline ETL robuste et de générer une table analytique enrichie et hautement optimisée prête pour l'apprentissage automatique."),
        pb(),

        title2("3.2 Backlog du Sprint 1"),
        body("Le tableau 3.1 présente les tâches planifiées pour le Sprint 1, ordonnancées par priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche d'ingénierie et de développement", "Durée estimée"],
          [
            ["Élevée", "Connexion sécurisée au Data Warehouse Microsoft SQL Server 2022 d'entreprise", "1 jour"],
            ["Élevée", "Extraction des tables de faits opérationnelles (Capacity Ledger Entry, Item Ledger Entry, Item)", "1 jour"],
            ["Élevée", "Audit de qualité, assainissement des stocks négatifs et traitement des valeurs aberrantes", "3 jours"],
            ["Élevée", "Conception du pipeline ETL et Feature Engineering (lags temporels, moyennes mobiles, jours ouvrés)", "2 jours"],
            ["Élevée", "Analyse exploratoire des données (EDA) : distributions, saisonnalités et détection des arrêts machines", "2 jours"],
            ["Moyenne", "Optimisation de l'indexation clusterisée sur SQL Server pour réduire la latence de requêtage", "1 jour"],
            ["Faible", "Mise en place de la journalisation (logging) et gestion des erreurs de chargement en base", "1 jour"]
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
        body("Les données exploitées dans ce projet proviennent directement de l'entrepôt de données (Data Warehouse) Microsoft SQL Server 2022 de l'entreprise, consolidé à partir de l'ERP Microsoft Dynamics NAV. Les tables couvrent l'activité industrielle continue des sites de Kondar, Sousse et Brno sur une période de 851 jours consécutifs (du 1er janvier 2024 au 30 avril 2026)."),
        pb(),
        body("Le tableau 3.2 présente un aperçu statistique global de la volumétrie traitée :"),
        pb(),
        makeTable(
          ["Indicateur Clé de Volumétrie", "Valeur / Quantité Consolidée"],
          [
            ["Nombre total de mouvements de stock (Item Ledger Entry)", "1 524 812 lignes"],
            ["Nombre total d'enregistrements machines (Capacity Ledger Entry)", "248 930 lignes"],
            ["Nombre d'articles distincts au catalogue (Item)", "6 875 références"],
            ["Nombre de centres de charge / presses à injecter actives", "319 machines"],
            ["Nombre de familles de matières plastiques", "18 catégories"],
            ["Valeur totale des stocks gérés", "14 850 420 TND"],
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

        title3("3.3.2 Description des tables principales"),
        body("Parmi les tables relationnelles du Data Warehouse d'entreprise, quatre tables centrales constituent le socle de notre modélisation :"),
        pb(),
        makeTable(
          ["Nom de la Table SQL", "Rôle Métier et Contenu Industriel dans le Projet Nexora"],
          [
            ["Item Ledger Entry (ILE)", "Table centrale des mouvements de stock : enregistre chaque entrée, sortie, consommation atelier, transfert inter-usines, date comptable, quantité et coût unitaire."],
            ["Capacity Ledger Entry (CLE)", "Table d'exécution de production : consigne chaque opération machine, ordre de fabrication (OF), temps de cycle, temps d'arrêt, cadence réelle et quantité de rebuts."],
            ["Item", "Référentiel des articles : nomenclature des 6 875 composants et résines plastiques, désignation, matière (PP, PA66, ABS), prix d'achat, seuils de sécurité."],
            ["Machine Center", "Référentiel des 319 presses à injecter : identifiant machine, tonnage (50T à 1500T), atelier, site géographique (Kondar, Sousse, Brno) et cadence nominale."]
          ],
          [2800, 5866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.3 : Tables principales de la base", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.3 Diagramme de classes"),
        body("La figure 3.1 expose le diagramme de classes UML modélisant la structure relationnelle des entités du Data Warehouse industriel :"),
        pb(),
        ...imageFigure("diagrams/er_diagram.png", "Figure 3.1 : Diagramme relationnel et structure de la base de données DWH", 540, 310),
        body("Les cardinalités et règles de gestion modélisées sont les suivantes :"),
        bullet("**MachineCenter – CapacityLedgerEntry (1 – 0..*)** : une presse à injecter réalise de multiples opérations de fabrication au fil des shifts."),
        bullet("**Item – CapacityLedgerEntry (1 – 0..*)** : un composant plastique est injecté lors de multiples ordres de fabrication."),
        bullet("**Item – ItemLedgerEntry (1 – 0..*)** : un article subit des centaines de mouvements d'entrées, sorties et transferts."),
        bullet("**Item – Stock (1 – 1)** : chaque référence possède une fiche synthétisant le niveau d'inventaire disponible, le stock de sécurité et la valeur immobilisée."),
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
        title3("3.5.1 Architecture du pipeline"),
        body("Le pipeline ETL développé pour Nexora est conçu pour automatiser l'ingestion, le filtrage et l'enrichissement des données d'atelier. La figure 3.5 illustre son architecture générale reliant le Data Warehouse à la table analytique :"),
        pb(),
        ...imageFigure("diagrams/sprint1_activity.png", "Figure 3.5 : Architecture et flux d'exécution du pipeline ETL", 520, 240),
        body("Le diagramme d'activité UML présenté en figure 3.6 détaille le déroulement séquentiel des opérations du pipeline :"),
        pb(),
        ...imageFigure("diagrams/sprint1_seq.png", "Figure 3.6 : Diagramme de séquence du pipeline ETL d'atelier", 520, 250),
        pb(),

        title3("3.5.2 Extraction"),
        body("L'extraction est orchestrée en Python via le connecteur ODBC haute performance `pyodbc` couplé à SQLAlchemy pour Microsoft SQL Server. Les données sont extraites en mode incrémental pour ne charger que les enregistrements créés ou modifiés depuis le dernier cycle :"),
        bullet("**Extraction des flux machines** : requêtage de la table *Capacity Ledger Entry* filtrant sur les statuts d'ordres fermés avec calcul des durées réelles d'injection."),
        bullet("**Extraction des flux d'inventaire** : requêtage de la table *Item Ledger Entry* regroupant entrées fournisseurs, consommations en pied de presse et transferts inter-usines."),
        pb(),

        title3("3.5.3 Transformation"),
        body("La phase de transformation comprend l'assainissement rigoureux des anomalies et le feature engineering :"),
        body("**1. Assainissement et nettoyage des données** :"),
        bullet("Détection et neutralisation des stocks négatifs transitoires causés par des décalages d'enregistrement des bons de livraison."),
        bullet("Imputation des valeurs manquantes de temps de cycle par la médiane de la machine sur le même outillage."),
        bullet("Filtrage des outliers extrêmes par la règle de Tukey (au-delà de 3 écarts interquartiles IQR)."),
        pb(),
        body("Le tableau 3.6 résume le bilan de qualité avant et après exécution du pipeline ETL :"),
        pb(),
        makeTable(
          ["Critère de Qualité des Données", "État Initial (Données Brutes DWH)", "État Final (Après Nettoyage ETL)"],
          [
            ["Lignes de mouvements de stock", "1 524 812 lignes brutes", "1 518 940 lignes valides (5 872 erronées éliminées)"],
            ["Lignes de production machines", "248 930 lignes brutes", "247 610 lignes qualifiées (1 320 doublons purgés)"],
            ["Stocks négatifs transitoires", "482 cas identifiés dans l'historique", "0 cas restant (recalés sur dernier inventaire certifié)"],
            ["Temps de cycle aberrants (< 2s)", "1 840 enregistrements fantômes", "0 valeur aberrante (recalibrés sur fiche technique)"],
            ["Doublons d'enregistrements", "Présence de réémissions de tickets", "0 doublon résiduel (clé primaire composite stricte)"]
          ],
          [2800, 2900, 2966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.6 : Bilan de la qualité des données", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("**2. Feature Engineering (16 variables explicatives industrielles)** :"),
        bullet("**Variables calendaires et d'équipes** : jour de la semaine, mois, indicateur de week-end, et type de shift (Matin, Après-midi, Nuit)."),
        bullet("**Lags temporels de production** : cadence de la veille (J-1), du même jour de la semaine passée (J-7), et de la quinzaine (J-14)."),
        bullet("**Moyennes et volatilités mobiles** : moyennes mobiles sur 7 et 14 jours, écart-type mobile sur 28 jours."),
        bullet("**Indicateurs industriels d'atelier** : indicateur de maintenance programmée, indicateur de changement de moule, et ratio de cadence machine."),
        pb(),

        title3("3.5.4 Chargement"),
        body("Les données nettoyées et enrichies sont chargées dans la table analytique optimisée `production_stock_analytics` sur Microsoft SQL Server 2022. Pour garantir des temps de requêtage inférieurs à 500 ms sur plus d'un million de lignes, une stratégie d'indexation clusterisée sur la clé composite `(Posting_Date, Item_No, Machine_No)` a été mise en œuvre."),
        pb(),

        title2("3.6 Résultats du pipeline ETL"),
        body("Le tableau 3.7 synthétise les résultats quantitatifs obtenus à l'issue de l'exécution complète du pipeline ETL :"),
        pb(),
        makeTable(
          ["Indicateur de Performance du Pipeline", "Résultat Obtenu"],
          [
            ["Volume total de lignes chargées dans la table analytique", "1 766 550 enregistrements enrichis"],
            ["Nombre de colonnes dans la table analytique", "38 colonnes métiers et analytiques"],
            ["Nombre de features industrielles créées", "16 variables d'entrée sélectionnées pour l'IA"],
            ["Temps moyen d'exécution du pipeline complet", "4 minutes 12 secondes pour l'historique complet"],
            ["Temps moyen de réponse des requêtes analytiques", "448 ms (contre > 30 s avant indexation)"],
            ["Taux d'anomalies résiduelles", "0,0 % (100 % de conformité d'intégrité)"]
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
        body("Le tableau 3.8 présente le bilan d'avancement du Sprint 1 et la validation des livrables :"),
        pb(),
        makeTable(
          ["Tâche réalisée", "Livrable Produit et Validé", "Statut"],
          [
            ["Connexion au DWH", "Accès sécurisé ODBC/SQL Server validé", "Réalisé"],
            ["Extraction des données", "Extraction de 1,7M de lignes brutes", "Réalisé"],
            ["Audit de qualité", "Diagnostic et purge des 7 192 anomalies", "Réalisé"],
            ["Nettoyage des stocks", "Résolution intégrale des stocks négatifs", "Réalisé"],
            ["Feature Engineering", "16 variables explicatives industrielles", "Réalisé"],
            ["Optimisation SQL Server", "Index clusterisés (temps ramené à 448 ms)", "Réalisé"],
            ["Chargement analytique", "Table production_stock_analytics opérationnelle", "Réalisé"],
            ["Diagrammes UML", "Diagramme de classes DWH et diagramme d'activité ETL", "Réalisé"]
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
        conclusionBox("Ce chapitre a exposé l'ensemble des travaux réalisés au cours du Sprint 1. La maîtrise des flux de données issus de 319 presses et de 1,5 million de mouvements d'articles a permis de surmonter le défi des données hétérogènes. Grâce au pipeline ETL et à l'assainissement rigoureux des anomalies de stock, nous disposons désormais d'un socle de données certifié et performant. Le chapitre suivant détaille le Sprint 2, consacré au développement, à l'entraînement et à la comparaison des modèles d'intelligence artificielle pour la prévision des cadences d'atelier."),
        pageBreak(),
    '''

print("Chapter 3 module defined.")
