# -*- coding: utf-8 -*-
"""
Chapitre 1 : Contexte et cadre du projet pour Nexora (pfe_v2.docx)
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
        body("Ce premier chapitre présente le cadre général de notre projet de fin d'études. Nous décrivons d'abord le contexte académique au sein de la Faculté des Sciences de Monastir, puis la collaboration entre l'organisme d'accueil, la société de services numériques **Maps-IT**, et l'équipementier industriel partenaire spécialisé dans la plasturgie automobile. Nous analysons ensuite les problématiques opérationnelles rencontrées dans les ateliers d'injection plastique, les limites des outils existants et la solution **Nexora** conçue pour y répondre. Enfin, nous présentons la démarche méthodologique Agile Scrum et les diagrammes UML utilisés pour encadrer le développement du système."),
        pb(),

        title2("1.2 Contexte académique"),
        body("Ce projet est réalisé dans le cadre du **Master Professionnel en Data Science** de la Faculté des Sciences de Monastir (FSM), rattachée à l'Université de Monastir. Cette formation d'excellence prépare les étudiants à l'ingénierie des données massives, au développement d'algorithmes d'apprentissage automatique et à l'intégration de solutions logicielles d'aide à la décision."),
        pb(),
        body("Ce travail de fin d'études permet d'appliquer les compétences acquises en science des données à un environnement industriel complexe, en exploitant des données réelles issues d'un parc de 319 presses à injecter réparties sur plusieurs sites de production."),
        pb(),

        title2("1.3 Présentation de l'organisme d'accueil"),
        title3("1.3.1 Présentation de l'entreprise"),
        body("Le projet a été développé en collaboration avec **Maps-IT**, une société de services informatiques et d'ingénierie logicielle située à Monastir en Tunisie. Fondée en 2021, Maps-IT accompagne les entreprises industrielles et de services dans la mise en œuvre de solutions numériques sur mesure, le développement d'applications métiers, la conception d'architectures décisionnelles et la valorisation des données par la Data Science."),
        pb(),
        body("Le tableau 1.1 présente la fiche d'identité de l'entreprise d'accueil :"),
        pb(),
        makeTable(
          ["Champ", "Information"],
          [
            ["Raison sociale", "Maps-IT"],
            ["Date de création", "2021"],
            ["Secteur d'activité", "Services informatiques, ingénierie logicielle et Data Science"],
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

        title3("1.3.2 Domaines d'activité et contexte client"),
        body("Maps-IT intervient principalement dans trois domaines complémentaires :"),
        bullet("**Développement logiciel sur mesure** : conception d'applications web et de micro-services modulaires adaptés aux processus métiers."),
        bullet("**Business Intelligence et ingénierie des données** : conception d'entrepôts de données (DWH), mise en place de flux ETL fiabilisés et modélisation dimensionnelle."),
        bullet("**Data Science et Intelligence Artificielle** : exploration de séries temporelles, modélisation prédictive et algorithmes d'optimisation opérationnelle."),
        pb(),
        body("Dans le cadre de ce projet, Maps-IT intervient auprès d'un **équipementier automobile de rang 1** disposant de sites de production en Tunisie (usines de Kondar et Sousse) et en République Tchèque (site de Brno). Cet industriel produit des pièces plastiques techniques injectées sous fortes contraintes de cadence et de qualité."),
        pb(),

        title2("1.4 Présentation de la plateforme Nexora"),
        title3("1.4.1 Présentation générale"),
        body("**Nexora** est une solution logicielle d'aide à la décision conçue pour faciliter le suivi des ateliers d'injection plastique et la gestion proactive des approvisionnements de stock. Elle s'appuie sur les données centralisées dans le Data Warehouse pour proposer des indicateurs de fonctionnement mis à jour régulièrement par shift, des prévisions de cadence de production par apprentissage automatique et des recommandations quantifiées de réapprovisionnement."),
        pb(),
        ...imageFigure("logos/logo.png", "Figure 1.1 : Logo de la plateforme Nexora", 220, 90),
        body("La solution s'adresse aux équipes industrielles selon deux profils d'utilisateurs clairement délimités : les **Administrateurs** (supervision des presses, pilotage du TRG, gestion des approvisionnements et des modèles) et les **Opérateurs** (saisie des mouvements de matière et consultation des stocks d'atelier)."),
        pb(),

        title3("1.4.2 Fonctionnalités principales"),
        body("La plateforme Nexora s'articule autour de quatre fonctionnalités majeures :"),
        bullet("**Supervision des machines et du TRG/OEE** : suivi de l'état des 319 presses de l'atelier et calcul des trois composantes normalisées du Taux de Rendement Global selon la démarche TPM [25] (Taux de Disponibilité, Taux de Performance, Taux de Qualité)."),
        bullet("**Prévision des volumes de fabrication** : estimation des cadences futures à court et moyen termes (horizons de 7, 15 et 30 jours) pour guider l'ordonnancement des équipes et des matières."),
        bullet("**Gestion prévisionnelle des stocks** : segmentation multicritère des articles du catalogue (méthode ABC et classification par niveau de risque) et calcul des réapprovisionnements nécessaires pour sécuriser une couverture cible de 45 jours."),
        bullet("**Restitution décisionnelle interactive** : tableaux de bord Power BI permettant de filtrer les indicateurs par usine, atelier, presse ou famille de matière plastique, complétés par une interface web opérationnelle."),
        pb(),

        title3("1.4.3 Limites de la situation actuelle"),
        body("Avant la conception de Nexora, le pilotage industriel présentait plusieurs contraintes méthodologiques et opérationnelles :"),
        bullet("**Calcul manuel et différé du TRG** : les feuilles d'enregistrement remplies par les opérateurs étaient consolidées mensuellement sur tableur, empêchant une détection rapide des micro-arrêts ou des baisses anormales de cadence."),
        bullet("**Gestion réactive des réapprovisionnements** : les commandes de granulés polymères étaient fréquemment déclenchées en réaction à une alerte visuelle de pénurie en atelier, générant des risques de rupture ou de surcoûts logistiques d'urgence."),
        bullet("**Présence conjointe de ruptures et de surstocks** : l'absence d'outils analytiques entraînait une sur-couverture sur certaines références à faible rotation (immobilisation de trésorerie), tandis que des références critiques tombaient en rupture."),
        bullet("**Fragmentation des sources d'information** : les données de production, d'en-cours et d'inventaire étaient dispersées dans l'ERP, rendant leur croisement complexe pour les décideurs."),
        pb(),

        title2("1.5 Présentation du projet"),
        title3("1.5.1 Contexte et problématique"),
        body("L'entreprise partenaire dispose d'un Data Warehouse (DWH) conservant l'historique complet des déclarations de production, des nomenclatures (BOM) et des mouvements d'inventaire. Toutefois, ces données massives demeuraient sous-exploitées pour anticiper les charges futures et guider la chaîne logistique."),
        body("La problématique centrale du projet se formule ainsi :"),
        body("*« Comment valoriser les données centralisées du Data Warehouse industriel pour concevoir un système décisionnel automatisé, capable de superviser le rendement des presses, de modéliser les cadences par apprentissage automatique et d'optimiser les politiques de réapprovisionnement de stock ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),

        title3("1.5.2 Étude de l'existant"),
        body("En milieu industriel, trois approches coexistent couramment : les feuilles de calcul bureautiques (Excel), les modules de base des progiciels de gestion intégrée (ERP) et les solutions spécialisées de suivi d'atelier (Manufacturing Execution Systems - MES). Les tableurs, bien que flexibles, s'avèrent vulnérables aux erreurs de saisie et inadaptés aux volumes volumineux. Les ERP fournissent un cadre transactionnel rigide mais peu analytique, tandis que les progiciels MES représentent un investissement très lourd et n'intègrent pas nativement d'algorithmes d'apprentissage statistique pour la prévision de séries temporelles."),
        pb(),

        title3("1.5.3 Solution proposée"),
        body("Pour concilier agilité décisionnelle, rigueur méthodologique et intégration fluide, la solution **Nexora** combine trois piliers techniques complémentaires :"),
        bullet("**1. Un pipeline de traitement des données (ETL)** : extraction automatisée des sources brutes, nettoyage (doublons, dates erronées, formats, coûts et valeurs manquantes) et chargement dans un Data Warehouse en schéma en étoile."),
        bullet("**2. Un module de prévision par apprentissage automatique** : comparaison de quatre modèles de séries temporelles sous protocole multi-horizons (Régression Linéaire, ARIMA, Random Forest, Prophet) sur une cadence d'atelier d'environ 65 000 pièces/jour. Random Forest et Prophet atteignent une précision comparable (erreur moyenne de 6 % à 7 % de MAPE). Prophet a été retenu pour le déploiement opérationnel dans l'application en raison de sa décomposition explicable (tendance, saisonnalité hebdomadaire et arrêts d'atelier) et de sa simplicité d'intégration, complété par Isolation Forest pour la détection des anomalies."),
        bullet("**3. Un module de gestion intelligente des stocks** : segmentation multicritère ABC / K-Means, classification selon la couverture disponible et calcul du plan de réapprovisionnement pour sécuriser 45 jours d'activité sur le catalogue de 800 références distinctes (budget prévisionnel estimé à environ 380 400 TND)."),
        pb(),
        body("L'architecture de restitution associe des tableaux de bord interactifs Microsoft Power BI pour le management décisionnel et une application web (React.js / Spring Boot / FastAPI) pour la saisie et la consultation opérationnelle."),
        pb(),
        body("Le tableau 1.2 résume le positionnement comparatif des solutions existantes vis-à-vis de Nexora :"),
        pb(),
        makeTable(
          ["Critère d'évaluation", "Progiciels MES standards", "ERP transactionnel", "Tableurs (Excel)", "Solution Nexora"],
          [
            ["Suivi du TRG d'atelier",           "Avancé", "Non natif", "Manuel / Différé", "Automatisé par shift"],
            ["Prévisions de cadence par IA",     "Non proposé", "Non proposé", "Non proposé", "Intégré (Prophet)"],
            ["Tableaux de bord interactifs",     "Configurable", "Limité", "Statique", "Interactif (Power BI)"],
            ["Intégration directe au DWH",       "Complexe", "Natif", "Instable", "Directe (Schéma en étoile)"],
            ["Segmentation ABC et des stocks",   "Partiel", "Standard", "Manuel", "Multicritère (ABC + K-Means)"],
            ["Recommandations d'approvisionnement", "Sur règles fixes", "Sur seuils statiques", "Manuel", "Horizon cible 45 jours (800 réf.)"],
            ["Facilité d'appropriation atelier", "Moyenne", "Complexe", "Accessible", "Interface adaptée"],
            ["Agilité et coût de déploiement",   "Investissement élevé", "Coût élevé", "Faible", "Modulaire et maîtrisé"]
          ],
          [2400, 1800, 1600, 1400, 1466]
        ),
        new Paragraph({
          children: [
            new TextRun({ text: "Tableau 1.2 : Positionnement comparatif des solutions existantes avec Nexora", font: FONT, size: 20, italics: true, color: GRAY })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("1.6 Workflow complet du projet"),
        body("Le traitement des données et la restitution des résultats suivent un enchaînement méthodique en huit étapes, illustré par la figure 1.2 :"),
        pb(),
        ...imageFigure("diagrams/architecture.png", "Figure 1.2 : Workflow complet du système décisionnel Nexora", 460, 460),
        bullet("**1. Ingestion des données brutes** : extraction des données d'inventaire et de production issues du système d'information industriel."),
        bullet("**2. Nettoyage des données (ETL)** : suppression des doublons, rejet des dates invalides et correction des incohérences de stock."),
        bullet("**3. Calcul des variables explicatives** : 14 variables (calendrier, événements d'atelier, historique de production et moyennes mobiles)."),
        bullet("**4. Découpage chronologique** : apprentissage (janvier 2024 – août 2025), validation (septembre – décembre 2025) et test (janvier – avril 2026)."),
        bullet("**5. Entraînement des modèles** : Régression Linéaire, ARIMA, Random Forest et Prophet, complétés par Isolation Forest pour la détection d'anomalies."),
        bullet("**6. Évaluation sur la période de test de 2026** : les modèles sont évalués sur des données de 2026 qui n'ont pas servi à l'apprentissage."),
        bullet("**7. Mesure des performances** : calcul des erreurs de prévision (MAE, RMSE, MAPE, R²) en pièces par jour aux horizons de 7, 15 et 30 jours."),
        bullet("**8. Restitution utilisateur** : tableaux de bord Power BI et application web."),
        pb(),

        title2("1.7 Méthodologie de développement"),
        title3("1.7.1 Étude comparative des méthodes"),
        body("Avant d'entamer les développements, nous avons comparé la méthode classique en cascade et la démarche Agile (tableau 1.3) :"),
        pb(),
        makeTable(
          ["Critère", "Approche classique (Cascade)", "Approche Agile (Scrum)"],
          [
            ["Cycle de développement", "Linéaire et séquentiel", "Itératif, par incréments réguliers"],
            ["Planification", "Figée au démarrage", "Ajustable selon l'avancement réel"],
            ["Livrables", "Livraison globale en fin de projet", "Incrément fonctionnel à chaque sprint"],
            ["Prise en compte des retours", "Tardive, en phase de recette", "Continue, à chaque fin d'itération"],
            ["Principale limite", "Peu flexible face aux anomalies de données", "Exige une disponibilité régulière des encadrants"]
          ],
          [2400, 3100, 3166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.3 : Comparaison entre approche classique et approche agile", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 1.4 récapitule les avantages et limites des deux méthodologies :"),
        pb(),
        makeTable(
          ["Méthodologie", "Avantages principaux", "Inconvénients principaux"],
          [
            ["Approche classique", "• Cadre et jalons contractuels nettement fixés.\\n• Simplicité de contractualisation initiale.", "• Faible flexibilité face aux anomalies de données.\\n• Risque de décalage avec les attentes d'atelier."],
            ["Approche Agile (Scrum)", "• Adaptabilité forte aux spécificités des séries réelles.\\n• Validation progressive et mesurable de chaque module.\\n• Rétroactions régulières avec les encadrants.", "• Exige une disponibilité continue des parties prenantes.\\n• Nécessite une discipline stricte sur la tenue du backlog."]
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
        body("Nous avons sélectionné le framework Agile Scrum [1, 2], particulièrement approprié aux projets décisionnels et de science des données combinant plusieurs briques interdépendantes (ETL, algorithmes prédictifs, règles logistiques et restitution visuelle)."),
        pb(),
        body("Ce cadre itératif favorise l'ajustement continu des modèles en fonction de la qualité observée des données et permet de valider chaque composant logiciel auprès des encadrants."),
        pb(),
        body("La figure 1.3 illustre le cycle de déroulement de la méthodologie Scrum appliquée à notre projet :"),
        pb(),
        ...imageFigure("scrum-framework-9.29.23.png", "Figure 1.3 : Cycle itératif de la méthodologie Agile Scrum", 520, 320),
        pb(),

        title3("1.7.3 Organisation des rôles Scrum"),
        body("Pour concilier la rigueur académique d'un travail de Master et les exigences industrielles de l'atelier, les rôles Scrum ont été répartis de la manière suivante :"),
        bullet("**Product Owner (PO)** : assumé par l'encadrant professionnel au sein de Maps-IT en lien avec l'équipe de l'usine partenaire. Il exprime les besoins fonctionnels, priorise les récits utilisateurs du backlog et valide les incréments à chaque revue de sprint."),
        bullet("**Scrum Master (SM)** : assuré par l'encadrant académique à la Faculté des Sciences de Monastir. Il veille au respect du cadre méthodologique Agile, garantit la rigueur scientifique des protocoles de validation et aide à lever les blocages conceptuels."),
        bullet("**Équipe de Développement (Development Team)** : incarnée par l'étudiante chercheuse, responsable de la conception technique, du développement du pipeline ETL, de l'expérimentation des algorithmes d'apprentissage et de la réalisation des interfaces."),
        pb(),

        title3("1.7.4 Product Backlog"),
        body("Le Product Backlog (tableau 1.5) regroupe les récits utilisateurs (User Stories) formalisant les exigences du système, priorisés et estimés pour chaque sprint de développement, et répartis entre les deux rôles de la plateforme (**l'Administrateur** et **l'Opérateur**) :"),
        pb(),
        makeTable(
          ["ID", "Récit Utilisateur (User Story)", "Priorité", "Estimation", "Sprint Associé"],
          [
            ["US01", "En tant qu'administrateur, je veux auditer la qualité des données brutes d'inventaire afin d'éliminer les doublons et anomalies", "Haute", "3 jours", "Sprint 1"],
            ["US02", "En tant qu'administrateur, je veux exécuter un pipeline ETL en Python pour assainir et charger les données dans le DWH", "Haute", "4 jours", "Sprint 1"],
            ["US03", "En tant qu'administrateur, je veux structurer le schéma dimensionnel en étoile pour interconnecter faits et dimensions", "Haute", "3 jours", "Sprint 1"],
            ["US04", "En tant qu'administrateur, je veux charger les 32 043 enregistrements validés et indexer les tables dans SQL Server", "Haute", "2 jours", "Sprint 1"],
            ["US05", "En tant qu'administrateur, je veux générer 14 variables temporelles et d'événements industriels pour alimenter les prévisions", "Haute", "3 jours", "Sprint 1"],
            ["US06", "En tant qu'administrateur, je veux segmenter les 800 références d'articles selon la méthode Pareto ABC (72/20/8)", "Haute", "3 jours", "Sprint 2"],
            ["US07", "En tant qu'administrateur, je veux classifier les références par clustering K-Means en 3 groupes de gestion logistique", "Moyenne", "3 jours", "Sprint 2"],
            ["US08", "En tant qu'opérateur, je veux consulter la couverture en jours et le stock disponible de chaque référence d'atelier", "Haute", "2 jours", "Sprint 2"],
            ["US09", "En tant qu'opérateur, je veux recevoir des alertes visuelles immédiates en cas de rupture ou de stock critique sur une référence", "Haute", "2 jours", "Sprint 2"],
            ["US10", "En tant qu'administrateur, je veux calculer les quantités de réapprovisionnement requises pour sécuriser un horizon de 45 jours", "Haute", "3 jours", "Sprint 2"],
            ["US11", "En tant qu'administrateur, je veux chiffrer le budget global des approvisionnements prioritaires (environ 380 400 TND)", "Moyenne", "2 jours", "Sprint 2"],
            ["US12", "En tant qu'administrateur, je veux configurer le partitionnement chronologique des données (entraînement, validation, test)", "Haute", "2 jours", "Sprint 3"],
            ["US13", "En tant qu'administrateur, je veux comparer les performances des modèles d'IA et sélectionner le modèle déployé en production", "Haute", "4 jours", "Sprint 3"],
            ["US14", "En tant qu'administrateur, je veux évaluer les modèles selon les différents horizons de prévision (7, 15 et 30 jours)", "Haute", "3 jours", "Sprint 3"],
            ["US15", "En tant qu'administrateur, je veux générer les prévisions de cadence de production aux horizons de 7, 15 et 30 jours", "Haute", "3 jours", "Sprint 3"],
            ["US16", "En tant qu'administrateur, je veux détecter les dérives de cadence machine via Isolation Forest pour la maintenance", "Haute", "3 jours", "Sprint 3"],
            ["US17", "En tant qu'opérateur ou administrateur, je veux m'authentifier de manière sécurisée (JWT) et accéder aux fonctionnalités de mon rôle", "Haute", "3 jours", "Sprint 4"],
            ["US18", "En tant qu'administrateur, je veux superviser le TRG et le statut avec mise à jour périodique des 319 presses sur un rapport Power BI", "Haute", "4 jours", "Sprint 4"],
            ["US19", "En tant qu'administrateur, je veux analyser les prévisions de cadence et les alertes d'approvisionnement sur Power BI", "Haute", "4 jours", "Sprint 4"],
            ["US20", "En tant qu'opérateur, je veux enregistrer les mouvements d'inventaire et les déclarations de rebuts via l'interface web", "Moyenne", "3 jours", "Sprint 4"]
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
        body("Le projet s'est déroulé sur une période de 13 semaines articulée en un sprint de cadrage initial (Sprint 0) et quatre sprints de développement d'une durée de 2 à 3 semaines chacun (tableau 1.6) :"),
        pb(),
        makeTable(
          ["Sprint", "Objectif principal", "Livrables clés validés"],
          [
            ["Sprint 0", "Cadrage des besoins et architecture globale", "Spécifications fonctionnelles, cas d'utilisation UML et architecture 4 couches."],
            ["Sprint 1", "Qualité des données et pipeline ETL", "Pipeline Python de nettoyage, schéma en étoile DWH (7 tables) et 32 043 lignes chargées."],
            ["Sprint 2", "Gestion intelligente des stocks", "Segmentation ABC / K-Means, seuils d'alerte, calcul du plan 45 jours et budget."],
            ["Sprint 3", "Modélisation prédictive par IA", "Entraînement des 4 modèles, sélection du modèle opérationnel et Isolation Forest."],
            ["Sprint 4", "Restitution décisionnelle et validation", "Tableaux de bord Power BI, portail web opérationnel, mesures DAX et recette fonctionnelle."]
          ],
          [1800, 3400, 3866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.6 : Planification des sprints du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("1.8 Langage de modélisation UML"),
        body("Pour modéliser la structure et le comportement du système avec rigueur et clarté, nous mobilisons le langage de modélisation standard **UML (Unified Modeling Language)** [26]. Trois types de représentations graphiques sont principalement employés dans ce rapport :"),
        bullet("**Diagrammes de cas d'utilisation (Chapitres 2 et 4)** : représentation des services offerts aux deux acteurs du système (Opérateur et Administrateur), avec identification des relations d'inclusion d'authentification."),
        bullet("**Diagrammes d'activité (Chapitres 3, 4 et 5)** : description des flux séquentiels d'exécution au sein du pipeline ETL, des règles de calcul de stock et du processus d'apprentissage automatique."),
        bullet("**Diagrammes de séquence (Chapitres 3 et 6)** : illustration de la dynamique temporelle des échanges entre les interfaces utilisateurs, les services applicatifs et le Data Warehouse."),
        pb(),

        title2("1.9 Conclusion"),
        conclusionBox("Ce premier chapitre a posé les fondations du projet Nexora. Après avoir situé le cadre académique et la collaboration entre Maps-IT et l'équipementier automobile, nous avons formalisé la problématique du pilotage d'atelier et présenté l'organisation itérative Scrum adoptée. Le chapitre suivant détaille les résultats du Sprint 0, consacré à la spécification des besoins et à la conception de l'architecture globale en quatre couches."),
        pageBreak(),
    '''

print("Chapter 1 module defined.")

