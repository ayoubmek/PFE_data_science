# -*- coding: utf-8 -*-
"""
Chapitre 1 : Contexte et cadre du projet pour Nexora (pfe.docx)
Matches EXACT outline: 1.1 à 1.9
Style : Simple, académique, professionnel, sans jargon excessif.
"""

def get_chapter1():
    return '''
        // =========================================================
        // CHAPITRE 1 : CONTEXTE ET CADRE DU PROJET
        // =========================================================
        title1("Chapitre 1 : Contexte et cadre du projet"),

        title2("1.1 Introduction"),
        body("Ce premier chapitre présente le cadre général de notre projet de fin d'études. Nous décrivons d'abord le contexte académique au sein de la Faculté des Sciences de Monastir, puis l'entreprise d'accueil, spécialisée dans les services numériques et l'ingénierie logicielle. Nous analysons ensuite les problématiques industrielles rencontrées dans les ateliers de plasturgie automobile, les limites des outils actuels et la solution **Nexora** conçue pour y répondre. Enfin, nous présentons la démarche méthodologique Agile Scrum et les diagrammes UML utilisés pour encadrer le développement."),
        pb(),

        title2("1.2 Contexte académique"),
        body("Ce projet est réalisé dans le cadre du **Master Professionnel en Data Science** de la Faculté des Sciences de Monastir (FSM), rattachée à l'Université de Monastir. Cette formation prépare les étudiants à l'analyse de données complexes, au développement de modèles prédictifs et à l'intégration de solutions logicielles d'aide à la décision."),
        pb(),
        body("Ce travail de fin d'études permet d'appliquer les compétences acquises en apprentissage automatique et en ingénierie des données à des données industrielles réelles issues d'un parc de presses à injecter."),
        pb(),

        title2("1.3 Présentation de l'organisme d'accueil"),
        title3("1.3.1 Présentation de l'entreprise"),
        body("Le projet a été développé en collaboration avec **Maps-IT**, une société de services informatiques et d'ingénierie logicielle située à Monastir en Tunisie. Fondée en 2021, Maps-IT accompagne ses clients dans la mise en place de solutions logicielles sur mesure, le développement d'applications web, l'intégration de systèmes décisionnels et la valorisation des données par la Data Science."),
        pb(),
        body("Le tableau 1.1 présente la fiche d'identité de l'entreprise :"),
        pb(),
        makeTable(
          ["Champ", "Information"],
          [
            ["Raison sociale", "Maps-IT"],
            ["Date de création", "2021"],
            ["Secteur d'activité", "Services informatiques et ingénierie logicielle"],
            ["Localisation", "Monastir, Tunisie"],
            ["Contact", "mapsit.info@gmail.com"],
            ["Site web", "https://maps-it.com"]
          ],
          [3000, 5666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.1 : Fiche d'identité de Maps-IT", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.3.2 Domaines d'activité"),
        body("Maps-IT intervient principalement dans trois domaines complémentaires :"),
        bullet("**Développement logiciel sur mesure** : conception d'applications web et mobiles adaptées aux besoins spécifiques des clients."),
        bullet("**Business Intelligence et gestion des données** : conception d'entrepôts de données, mise en place de flux ETL et création de tableaux de bord de suivi."),
        bullet("**Data Science et Intelligence Artificielle** : exploration de données, modélisation prédictive et optimisation des processus opérationnels."),
        pb(),

        title2("1.4 Présentation de la plateforme Nexora"),
        title3("1.4.1 Présentation générale"),
        body("**Nexora** est une solution logicielle d'aide à la décision conçue pour faciliter le suivi des ateliers de production et la gestion des stocks. Elle s'appuie sur les données centralisées dans le Data Warehouse de l'entreprise pour proposer des indicateurs de fonctionnement en temps réel, des prévisions de cadence et des recommandations de réapprovisionnement."),
        pb(),
        ...imageFigure("logos/logo.png", "Figure 1.2 : Logo de la plateforme Nexora", 220, 90),
        body("La solution s'adresse aux responsables d'atelier, aux planificateurs de production et aux gestionnaires de stock, en leur fournissant une interface simple et claire pour piloter leurs activités au quotidien."),
        pb(),

        title3("1.4.2 Fonctionnalités principales"),
        body("La plateforme Nexora s'articule autour de quatre fonctionnalités majeures :"),
        bullet("**Suivi des machines et du TRG/OEE** : visualisation de l'état des presses de l'atelier et calcul des trois composantes du Taux de Rendement Global (Disponibilité, Performance, Qualité)."),
        bullet("**Prévision des volumes de fabrication** : estimation des cadences de production futures à 7, 15 et 30 jours pour aider à l'organisation du travail en équipe."),
        bullet("**Gestion prévisionnelle des stocks** : classification des articles du catalogue selon leur niveau d'inventaire et proposition de quantités à commander pour sécuriser un horizon de 45 jours."),
        bullet("**Tableaux de bord interactifs** : rapports Power BI permettant de filtrer les indicateurs par atelier, machine ou famille de matière."),
        pb(),

        title3("1.4.3 Limites de la situation actuelle"),
        body("Avant la mise en place de Nexora, le suivi de production présentait plusieurs contraintes :"),
        bullet("**Calcul manuel du TRG** : les fiches de production remplies à la main étaient compilées en fin de mois sur tableur, limitant la réactivité en cas de panne ou de baisse de cadence."),
        bullet("**Gestion réactive des approvisionnements** : les commandes de matières premières étaient souvent passées après constat d'une pénurie, créant des risques d'arrêt de ligne."),
        bullet("**Présence de surstocks** : pour se prémunir des ruptures, certaines références étaient commandées en trop grande quantité, immobilisant de la trésorerie."),
        bullet("**Accès complexe aux données de l'ERP** : les informations opérationnelles étaient difficiles à consulter rapidement par les équipes sur le terrain."),
        pb(),

        title2("1.5 Présentation du projet"),
        title3("1.5.1 Contexte et problématique"),
        body("L'entreprise dispose d'un Data Warehouse (dbDWH1) conservant l'historique des opérations de fabrication (tables FACT_Mvts_Stocks, Fact_PA, DIM_OF-Mach, DIM_FamArt). Cependant, ces données étaient peu exploitées pour anticiper les besoins futurs."),
        body("La problématique centrale du projet est donc :"),
        body("*« Comment exploiter les données de l'entrepôt pour construire un outil d'aide à la décision capable de suivre la production, de prévoir les cadences par apprentissage automatique et de guider les réapprovisionnements de stock ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),

        title3("1.5.2 Étude de l'existant"),
        body("En milieu industriel, trois approches sont couramment utilisées : les feuilles de calcul Excel, les modules de base des ERP et les progiciels MES spécialisés. Si les tableurs sont simples mais manuels, les solutions logicielles lourdes sont souvent complexes à paramétrer et n'intègrent pas toujours de modèles prédictifs adaptés aux besoins de l'atelier."),
        pb(),

        title3("1.5.3 Solution proposée"),
        body("Pour répondre à ces besoins de manière adaptée, la solution **Nexora** combine trois composantes :"),
        bullet("**1. Un pipeline de traitement des données (ETL)** : ingestion, nettoyage des anomalies d'inventaire et structuration des données dans les 7 tables du Data Warehouse dbDWH1."),
        bullet("**2. Un module de prévision par apprentissage automatique** : comparaison de quatre modèles (Régression Linéaire, ARIMA, Random Forest, Prophet) pour prévoir les cadences, complété par Isolation Forest pour la détection d'anomalies."),
        bullet("**3. Un module de gestion des stocks** : suivi du niveau de risque des articles et calcul des quantités à commander sur un horizon de 45 jours."),
        pb(),
        body("L'ensemble est intégré dans une application web avec React.js et Spring Boot, et complété par des rapports interactifs sous Microsoft Power BI."),
        pb(),
        body("Le tableau 1.2 résume la comparaison entre les solutions existantes et la solution Nexora :"),
        pb(),
        makeTable(
          ["Critère d'évaluation", "Progiciels MES standards", "ERP classique", "Feuilles de calcul (Excel)", "Solution Nexora"],
          [
            ["Suivi du TRG en continu",         "✓", "✗", "✗",        "✓"],
            ["Prévisions de cadence par IA",     "✗", "✗", "✗",        "✓"],
            ["Tableaux de bord décisionnels",    "✓", "Limité", "✗",   "✓"],
            ["Lien direct avec le Data Warehouse", "✓", "✓", "Instable", "✓"],
            ["Classification et suivi des stocks", "✓", "✗", "✗",      "✓"],
            ["Recommandations d'approvisionnement", "✗", "✗", "✗",      "✓"],
            ["Facilité d'utilisation en atelier", "✗", "✗", "✗",       "✓"],
            ["Coût et modularité",               "✗", "✗", "✓",        "✓"],
          ],
          [2400, 1800, 1600, 1400, 1466]
        ),
        new Paragraph({
          children: [
            new TextRun({ text: "Tableau 1.2 : Comparaison des solutions existantes avec notre système", font: FONT, size: 20, italics: true, color: GRAY })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("1.6 Workflow complet du projet"),
        body("Le traitement des données et la restitution des résultats suivent un enchaînement en huit étapes, illustré dans la figure 1.3 :"),
        pb(),
        ...imageFigure("diagrams/architecture.png", "Figure 1.3 : Workflow complet du système décisionnel Nexora", 460, 460),
        bullet("**1. Ingestion des données** : lecture des fichiers d'extraction bruts et des données opérationnelles."),
        bullet("**2. Nettoyage (ETL)** : détection des doublons, correction des formats de date et assainissement des stocks négatifs."),
        bullet("**3. Préparation des variables** : calcul de 16 variables temporelles et statistiques (moyennes mobiles, lags, indicateurs de calendrier)."),
        bullet("**4. Découpage chronologique** : séparation des données en 80 % pour l'entraînement et 20 % pour le test afin d'évaluer les modèles de manière réaliste."),
        bullet("**5. Entraînement des modèles** : apprentissage des quatre modèles de prévision et du modèle de détection d'anomalies."),
        bullet("**6. Validation croisée** : évaluation par TimeSeriesSplit à 5 plis pour vérifier la stabilité temporelle."),
        bullet("**7. Évaluation des résultats** : calcul des indicateurs de performance (MAE, RMSE, MAPE, R²)."),
        bullet("**8. Restitution utilisateur** : affichage des prévisions et des indicateurs dans l'application web et les rapports Power BI."),
        pb(),

        title2("1.7 Méthodologie de développement"),
        title3("1.7.1 Étude comparative des méthodes"),
        body("Avant d'entamer le développement, nous avons comparé l'approche classique en cascade et l'approche Agile afin de choisir la méthode la plus appropriée :"),
        pb(),
        makeTable(
          ["Critère", "Approche classique (Cascade)", "Approche Agile (Scrum)"],
          [
            ["Cycle de développement", "Linéaire et séquentiel", "Itératif et par incréments"],
            ["Planification", "Fixée au départ", "Adaptable selon l'avancement"],
            ["Livraisons", "Unique à la fin du projet", "Régulières à la fin de chaque sprint"],
            ["Prise en compte des retours", "Tardive en fin de cycle", "Continue à chaque itération"],
            ["Gestion des imprévus", "Peu flexible", "Facilement intégrable"]
          ],
          [2400, 3100, 3166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.3 : Comparaison entre approche classique et approche agile", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 1.4 résume les avantages et inconvénients des deux méthodes :"),
        pb(),
        makeTable(
          ["Méthodologie", "Avantages principaux", "Inconvénients principaux"],
          [
            ["Approche classique", "• Cadre et étapes bien définis au départ.\\n• Facilité de planification contractuelle.", "• Faible flexibilité en cas d'anomalies sur les données.\\n• Validation tardive par les utilisateurs finaux."],
            ["Approche Agile (Scrum)", "• Adaptabilité aux spécificités des données réelles.\\n• Validation progressive des modules développés.\\n• Échanges réguliers avec les encadrants.", "• Nécessite un suivi continu du Product Owner.\\n• Exige une gestion rigoureuse des priorités du backlog."]
          ],
          [2200, 3200, 3266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.4 : Avantages et inconvénients des méthodologies", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.7.2 Choix méthodologique : Scrum"),
        body("Nous avons retenu la méthodologie Agile Scrum [1, 2] car elle convient particulièrement aux projets intégrant plusieurs composants distincts (traitement des données, modélisation prédictive, gestion des stocks et interface décisionnelle)."),
        pb(),
        body("Cette démarche permet de tester et d'ajuster chaque composant au fil des itérations, tout en intégrant régulièrement les retours des encadrants."),
        pb(),
        body("Le déroulement de notre projet suit les étapes classiques de Scrum :"),
        body("1. Élaboration du Product Backlog.", { indent: 400 }),
        body("2. Planification des sprints.", { indent: 400 }),
        body("3. Développement et test des fonctionnalités.", { indent: 400 }),
        body("4. Validation d'un incrément à chaque fin d'itération.", { indent: 400 }),
        body("5. Revue et ajustement continu.", { indent: 400 }),
        pb(),
        body("La figure suivante illustre le cycle de fonctionnement de la méthodologie Scrum :"),
        pb(),
        ...imageFigure("scrum-framework-9.29.23.png", "Figure 1.4 : Cycle de la méthodologie Scrum", 520, 320),
        pb(),

        title3("1.7.3 Organisation des rôles Scrum"),
        body("Les rôles au sein de l'équipe ont été définis comme suit :"),
        bullet("**Product Owner** : encadrant en entreprise, veillant à la cohérence avec les besoins du terrain et à la priorisation des fonctionnalités."),
        bullet("**Scrum Master** : encadrant universitaire à la FSM, garant de la rigueur méthodologique et du bon déroulement académique du travail."),
        bullet("**Équipe de Développement** : assurée par l'étudiante, en charge de la conception, de la préparation des données, de l'apprentissage des modèles et du développement applicatif."),
        pb(),

        title3("1.7.4 Product Backlog"),
        body("Le Product Backlog regroupe les 20 exigences formulées sous forme de User Stories, réparties par sprint et priorisées :"),
        pb(),
        makeTable(
          ["ID", "Récit Utilisateur (User Story)", "Priorité", "Estimation (jours)", "Sprint Associé"],
          [
            ["US01", "En tant qu'utilisateur, je veux m'authentifier afin d'accéder aux fonctionnalités autorisées", "Haute", "5 jours", "Sprint 1"],
            ["US02", "En tant qu'administrateur, je veux gérer les rôles pour restreindre les accès aux données", "Haute", "5 jours", "Sprint 1"],
            ["US03", "En tant qu'administrateur, je veux auditer le DWH afin de cartographier les tables de production", "Haute", "8 jours", "Sprint 1"],
            ["US04", "En tant qu'administrateur, je veux nettoyer les données de stock pour éliminer les anomalies", "Haute", "5 jours", "Sprint 1"],
            ["US05", "En tant que responsable, je veux classer les articles selon la méthode ABC pour prioriser les stocks", "Haute", "8 jours", "Sprint 2"],
            ["US06", "En tant que responsable, je veux recevoir des alertes en cas de stock critique", "Haute", "5 jours", "Sprint 2"],
            ["US07", "En tant qu'opérateur, je veux consulter les mouvements de stock enregistrés", "Moyenne", "5 jours", "Sprint 2"],
            ["US08", "En tant que responsable, je veux obtenir des recommandations pour le réapprovisionnement", "Haute", "5 jours", "Sprint 2"],
            ["US09", "En tant que responsable, je veux estimer les besoins en matières selon les plannings", "Moyenne", "5 jours", "Sprint 2"],
            ["US10", "En tant que responsable, je veux suivre les transferts d'articles entre les dépôts", "Basse", "3 jours", "Sprint 2"],
            ["US11", "En tant que responsable, je veux visualiser l'état des 319 machines de l'atelier", "Haute", "8 jours", "Sprint 3"],
            ["US12", "En tant que responsable, je veux consulter le calcul du TRG par machine et par atelier", "Haute", "8 jours", "Sprint 3"],
            ["US13", "En tant qu'opérateur, je veux suivre l'avancement des ordres de fabrication", "Moyenne", "5 jours", "Sprint 3"],
            ["US14", "En tant que responsable, je veux extraire l'historique de production pour entraîner les modèles", "Haute", "5 jours", "Sprint 3"],
            ["US15", "En tant que responsable, je veux évaluer 4 modèles d'apprentissage pour prévoir les volumes", "Haute", "8 jours", "Sprint 3"],
            ["US16", "En tant que responsable, je veux visualiser les prévisions de cadence à 30 jours", "Haute", "5 jours", "Sprint 3"],
            ["US17", "En tant qu'utilisateur, je veux pouvoir filtrer les indicateurs par atelier et par date", "Haute", "5 jours", "Sprint 4"],
            ["US18", "En tant qu'utilisateur, je veux exporter les résultats d'inventaire sous format Excel", "Moyenne", "3 jours", "Sprint 4"],
            ["US19", "En tant que responsable, je veux consulter un tableau de bord global de production sur Power BI", "Haute", "8 jours", "Sprint 4"],
            ["US20", "En tant que responsable, je veux analyser l'état des stocks sur un rapport Power BI dédié", "Haute", "5 jours", "Sprint 4"]
          ],
          [700, 4966, 1000, 1100, 900]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.5 : Product Backlog priorisé du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.7.5 Planification des sprints"),
        body("Le projet a été organisé en cinq sprints successifs, chacun correspondant à un objectif de réalisation précis :"),
        pb(),
        makeTable(
          ["Sprint", "Objectif principal", "Livrable produit"],
          [
            ["Sprint 0", "Analyse des besoins et conception générale", "Spécifications fonctionnelles et architecture du système"],
            ["Sprint 1", "Prétraitement des données et pipeline ETL", "Données assainies et chargement des 7 tables du DWH dbDWH1"],
            ["Sprint 2", "Module de gestion intelligente des stocks", "Classification ABC, alertes et recommandations de commande"],
            ["Sprint 3", "Modélisation prédictive des cadences (4 modèles)", "Modèles de prévision comparés et détection d'anomalies"],
            ["Sprint 4", "Tableaux de bord décisionnels et validation", "Rapports Power BI, intégration web et tests fonctionnels"]
          ],
          [2000, 3500, 3500]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.6 : Planification des sprints du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("1.8 Langage de modélisation UML"),
        body("Pour modéliser la structure et le comportement du système, nous avons utilisé le langage **UML (Unified Modeling Language)** [26]. Quatre types de diagrammes ont été principalement mobilisés :"),
        bullet("**Diagramme de cas d'utilisation (Chapitre 2)** : illustration des fonctionnalités offertes aux différents profils d'utilisateurs."),
        bullet("**Diagramme de classes (Chapitres 2 et 3)** : représentation de la structure des données et des entités de production."),
        bullet("**Diagramme d'activité (Chapitre 3)** : description des étapes de traitement et de nettoyage au sein du pipeline ETL."),
        bullet("**Diagramme de séquence (Chapitre 6)** : représentation des échanges de messages lors de la consultation des rapports décisionnels."),
        pb(),

        title2("1.9 Conclusion"),
        conclusionBox("Ce premier chapitre a posé le cadre du projet Nexora. Après avoir situé le travail au sein de l'entreprise d'accueil et analysé les contraintes actuelles de l'atelier, nous avons précisé la démarche méthodologique Scrum adoptée pour planifier les développements. Le chapitre suivant présente les résultats du Sprint 0, consacré à la spécification des besoins et à la conception de l'architecture générale du système."),
        pageBreak(),
    '''

print("Chapter 1 module defined.")
