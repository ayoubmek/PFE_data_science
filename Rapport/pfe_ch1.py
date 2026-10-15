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
        body("Ce premier chapitre présente le cadre général de notre projet de fin d'études. Nous décrivons d'abord le contexte académique au sein de la Faculté des Sciences de Monastir, puis la collaboration entre l'organisme d'accueil, la société de services numériques **Maps-IT**, et l'équipementier industriel partenaire spécialisé dans la plasturgie automobile. Nous analysons ensuite les problématiques opérationnelles rencontrées dans les ateliers d'injection plastique, les limites des outils existants et la solution **Nexora** conçue pour y répondre. Enfin, nous présentons la démarche méthodologique Agile Scrum et les démarches de modélisation retenues pour encadrer le développement du système."),
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

        title3("1.3.2 Domaines d'activité et contexte client"),
        body("Maps-IT intervient principalement dans trois domaines complémentaires :"),
        bullet("**Développement logiciel sur mesure** : conception d'applications web et de micro-services modulaires adaptés aux processus métiers."),
        bullet("**Business Intelligence et ingénierie des données** : conception de Data Warehouse, mise en place de flux ETL fiabilisés et modélisation dimensionnelle."),
        bullet("**Data Science et Intelligence Artificielle** : exploration de séries temporelles, modélisation prédictive et algorithmes d'optimisation opérationnelle."),
        pb(),
        body("Dans le cadre de ce projet, Maps-IT intervient auprès d'un **équipementier automobile de rang 1** disposant de sites de production en Tunisie (usines de Kondar et Sousse) et en République Tchèque (site de Brno). Cet industriel produit des pièces plastiques techniques injectées sous fortes contraintes de cadence et de qualité."),
        pb(),

        title2("1.4 Présentation de la plateforme Nexora"),
        title3("1.4.1 Présentation générale"),
        body("**Nexora** est une solution logicielle d'aide à la décision conçue pour faciliter le suivi des ateliers d'injection plastique et la gestion proactive des approvisionnements de stock. Elle s'appuie sur les données centralisées dans le Data Warehouse pour proposer des indicateurs de fonctionnement mis à jour régulièrement par shift, des prévisions de cadence de production par apprentissage automatique et des recommandations quantifiées de réapprovisionnement."),
        pb(),
        ...imageFigure("logos/logo.png", "Figure 1.1 : Logo de la plateforme Nexora", 220, 90),
        body("La solution s'adresse aux équipes industrielles selon deux profils d'utilisateurs clairement délimités : les **Administrateurs** (supervision des presses, pilotage des flux, gestion des approvisionnements et des modèles) et les **Opérateurs** (consultation des stocks d'atelier, filtrage des alertes de rupture et suivi des indicateurs de production)."),
        pb(),

        title3("1.4.2 Fonctionnalités principales"),
        body("La plateforme Nexora s'articule autour de quatre fonctionnalités majeures :"),
        bullet("**Supervision du parc machines** : suivi opérationnel de l'état des 319 presses à injecter réparties sur les trois sites (Kondar, Sousse, Brno) et consolidation des indicateurs de production par shift."),
        bullet("**Prévision des volumes de fabrication** : estimation des cadences de production à l'horizon opérationnel de 30 jours pour guider l'ordonnancement des équipes et des approvisionnements matières."),
        bullet("**Gestion prévisionnelle des stocks** : classification opérationnelle des références du catalogue par niveau de criticité (Rupture, Critique, Normal, Surstock) et calcul des réapprovisionnements nécessaires pour sécuriser une couverture cible de 45 jours."),
        bullet("**Restitution décisionnelle interactive** : tableaux de bord Power BI permettant de filtrer les indicateurs par usine, atelier, presse ou famille de matière plastique, complétés par une interface web opérationnelle."),
        pb(),

        title3("1.4.3 Limites de la situation actuelle"),
        body("Avant la conception de Nexora, le pilotage industriel présentait plusieurs contraintes méthodologiques et opérationnelles :"),
        bullet("**Suivi manuel et différé de l'activité** : les feuilles d'enregistrement remplies par les opérateurs étaient consolidées mensuellement sur tableur, empêchant une détection rapide des ralentissements ou des baisses anormales de cadence."),
        bullet("**Gestion réactive des réapprovisionnements** : les commandes de granulés polymères étaient fréquemment déclenchées en réaction à une alerte visuelle de pénurie en atelier, générant des risques de rupture ou de surcoûts logistiques d'urgence."),
        bullet("**Présence conjointe de ruptures et de surstocks** : l'absence d'outils analytiques entraînait une sur-couverture sur certaines références à faible rotation (immobilisation de trésorerie), tandis que des références critiques tombaient en rupture."),
        bullet("**Fragmentation des sources d'information** : les données de production, d'en-cours et d'inventaire étaient dispersées dans l'ERP, rendant leur croisement complexe pour les décideurs."),
        pb(),

        title2("1.5 Présentation du projet"),
        title3("1.5.1 Contexte et problématique"),
        body("L'entreprise partenaire dispose d'un Data Warehouse conservant l'historique complet des déclarations de production et des instantanés d'inventaire. Toutefois, ces données massives demeuraient sous-exploitées pour anticiper les charges futures et guider la chaîne logistique."),
        body("La problématique centrale du projet se formule ainsi :"),
        body("*« Comment valoriser les données centralisées du Data Warehouse industriel pour concevoir un système décisionnel automatisé, capable de superviser l'activité des presses, de modéliser les cadences par apprentissage automatique et d'optimiser les politiques de réapprovisionnement de stock ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),

        title3("1.5.2 Étude de l'existant"),
        body("En milieu industriel, trois approches coexistent couramment : les feuilles de calcul bureautiques (Excel), les modules de base des progiciels de gestion intégrée (ERP) et les solutions spécialisées de suivi d'atelier (Manufacturing Execution Systems - MES). Les tableurs, bien que flexibles, s'avèrent vulnérables aux erreurs de saisie et inadaptés aux volumes volumineux. Les ERP fournissent un cadre transactionnel rigide mais peu analytique, tandis que les progiciels MES représentent un investissement très lourd et n'intègrent pas nativement d'algorithmes d'apprentissage statistique pour la prévision de séries temporelles."),
        pb(),

        title3("1.5.3 Solution proposée"),
        body("Pour concilier agilité décisionnelle, rigueur méthodologique et intégration opérationnelle fluide, la solution **Nexora** s'articule autour de trois piliers complémentaires :"),
        bullet("**1. L'ingénierie et l'intégration des données** : un pipeline automatisé de collecte et d'assainissement des données industrielles garantissant l'intégrité des informations avant leur consolidation dans un entrepôt de données relationnel structuré."),
        bullet("**2. La modélisation prédictive et la surveillance des cadences** : un moteur analytique exploitant des modèles d'apprentissage automatique pour anticiper les volumes de production, détecter les dérives anormales de rythme et sécuriser la planification d'atelier."),
        bullet("**3. La gestion préventive des approvisionnements** : un module décisionnel associant segmentation multicritère du catalogue et calcul dynamique des réapprovisionnements nécessaires pour prévenir les ruptures critiques tout en évitant les surstocks immobilisants."),
        pb(),
        body("L'architecture de restitution associe des tableaux de bord interactifs Microsoft Power BI pour le management décisionnel et une application web (React.js / Spring Boot / FastAPI) pour la saisie et la consultation opérationnelle."),
        pb(),
        body("Le tableau 1.1 résume le positionnement comparatif des solutions existantes vis-à-vis de Nexora :"),
        pb(),
        makeTable(
          ["Critère d'évaluation", "Progiciels MES standards", "ERP transactionnel", "Tableurs (Excel)", "Solution Nexora"],
          [
            ["Supervision des cadences atelier", "Avancé", "Non natif", "Manuel / Différé", "Automatisé par shift"],
            ["Prévisions de cadence par IA",     "Non proposé", "Non proposé", "Non proposé", "Intégré (Prophet)"],
            ["Tableaux de bord interactifs",     "Configurable", "Limité", "Statique", "Interactif (Power BI)"],
            ["Intégration directe au Data Warehouse", "Complexe", "Natif", "Instable", "Directe (Schéma relationnel)"],
            ["Gestion et criticité des stocks",  "Partiel", "Standard", "Manuel", "Par autonomie (Rupture/Critique/Alerte)"],
            ["Recommandations d'approvisionnement", "Sur règles fixes", "Sur seuils statiques", "Manuel", "Calcul de couverture dynamique"],
            ["Facilité d'appropriation atelier", "Moyenne", "Complexe", "Accessible", "Interface adaptée"],
            ["Agilité et coût de déploiement",   "Investissement élevé", "Coût élevé", "Faible", "Modulaire et maîtrisé"]
          ],
          [2400, 1800, 1600, 1400, 1466]
        ),
        new Paragraph({
          children: [
            new TextRun({ text: "Tableau 1.1 : Positionnement comparatif des solutions existantes avec Nexora", font: FONT, size: 20, italics: true, color: GRAY })
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
        bullet("**3. Calcul des variables explicatives** : ingénierie des variables prédictives (calendrier, événements d'atelier, historique de production et moyennes mobiles)."),
        bullet("**4. Découpage chronologique** : apprentissage (janvier 2024 – août 2025), validation (septembre – décembre 2025) et test (janvier – avril 2026)."),
        bullet("**5. Entraînement des modèles** : Régression Linéaire, ARIMA, Random Forest et Prophet sous validation croisée temporelle."),
        bullet("**6. Évaluation sur la période de test de 2026** : les modèles sont évalués sur des données de 2026 qui n'ont pas servi à l'apprentissage."),
        bullet("**7. Mesure des performances** : calcul des erreurs de prévision (MAE, RMSE, MAPE, R²) en pièces par jour à l'horizon opérationnel de 30 jours."),
        bullet("**8. Restitution utilisateur** : tableaux de bord Power BI et application web."),
        pb(),

        title2("1.7 Méthodologie de développement"),
        title3("1.7.1 Étude comparative des méthodes"),
        body("Avant d'entamer les développements, nous avons comparé la méthode classique en cascade et la démarche Agile (tableau 1.2) :"),
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
          children: [new TextRun({ text: "Tableau 1.2 : Comparaison entre approche classique et approche agile", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 1.3 récapitule les avantages et limites des deux méthodologies :"),
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
          children: [new TextRun({ text: "Tableau 1.3 : Avantages et inconvénients des méthodologies", font: FONT, size: 20, italics: true, color: GRAY })],
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
        body("Le Product Backlog (tableau 1.4) regroupe les récits utilisateurs (User Stories) formalisant les exigences du système, priorisés et estimés pour chaque sprint de développement, et répartis entre les deux rôles de la plateforme (**l'Administrateur** et **l'Opérateur**) :"),
        pb(),
        makeTable(
          ["ID", "Récit Utilisateur (User Story)", "Priorité", "Estimation", "Sprint Associé"],
          [
            ["US01", "En tant qu'administrateur, je veux auditer la qualité des données brutes d'inventaire afin d'éliminer les doublons et anomalies", "Haute", "3 jours", "Sprint 1"],
            ["US02", "En tant qu'administrateur, je veux exécuter un pipeline ETL en Python pour assainir et charger les données dans le Data Warehouse", "Haute", "4 jours", "Sprint 1"],
            ["US03", "En tant qu'administrateur, je veux structurer le schéma dimensionnel en étoile pour interconnecter faits et dimensions", "Haute", "3 jours", "Sprint 1"],
            ["US04", "En tant qu'administrateur, je veux charger les données d'inventaire assainies et indexer les tables dans SQL Server", "Haute", "2 jours", "Sprint 1"],
            ["US05", "En tant qu'administrateur, je veux générer les variables temporelles, retardées et d'événements industriels pour alimenter les prévisions", "Haute", "3 jours", "Sprint 1"],
            ["US06", "En tant qu'administrateur, je veux classifier les références d'articles selon leur niveau d'autonomie et de risque opérationnel", "Haute", "3 jours", "Sprint 2"],
            ["US07", "En tant qu'administrateur, je veux analyser la répartition des stocks par famille de matières et détecter les besoins d'atelier", "Moyenne", "3 jours", "Sprint 2"],
            ["US08", "En tant qu'opérateur, je veux consulter la couverture en jours et le stock disponible de chaque référence d'atelier", "Haute", "2 jours", "Sprint 2"],
            ["US09", "En tant qu'opérateur, je veux recevoir des alertes visuelles immédiates en cas de rupture ou de stock critique sur une référence", "Haute", "2 jours", "Sprint 2"],
            ["US10", "En tant qu'administrateur, je veux calculer les quantités de réapprovisionnement requises pour sécuriser l'horizon cible de couverture", "Haute", "3 jours", "Sprint 2"],
            ["US11", "En tant qu'administrateur, je veux chiffrer l'enveloppe budgétaire globale des réapprovisionnements prioritaires", "Moyenne", "2 jours", "Sprint 2"],
            ["US12", "En tant qu'administrateur, je veux configurer le partitionnement chronologique des données (entraînement, validation, test)", "Haute", "2 jours", "Sprint 3"],
            ["US13", "En tant qu'administrateur, je veux comparer les performances des modèles d'IA et sélectionner le modèle déployé en production", "Haute", "4 jours", "Sprint 3"],
            ["US14", "En tant qu'administrateur, je veux évaluer les modèles selon les différents horizons de prévision court et moyen termes", "Haute", "3 jours", "Sprint 3"],
            ["US15", "En tant qu'administrateur, je veux générer les prévisions de cadence de production selon les horizons de planification", "Haute", "3 jours", "Sprint 3"],
            ["US16", "En tant qu'administrateur, je veux analyser l'explicabilité et les bornes d'incertitude des prévisions", "Haute", "3 jours", "Sprint 3"],
            ["US17", "En tant qu'opérateur ou administrateur, je veux m'authentifier de manière sécurisée (JWT) et accéder aux fonctionnalités de mon rôle", "Haute", "3 jours", "Sprint 4"],
            ["US18", "En tant qu'administrateur, je veux superviser le statut et les cadences de production du parc de presses sur un rapport Power BI", "Haute", "4 jours", "Sprint 4"],
            ["US19", "En tant qu'administrateur, je veux analyser les prévisions de cadence et les alertes d'approvisionnement sur Power BI", "Haute", "4 jours", "Sprint 4"],
            ["US20", "En tant qu'opérateur, je veux consulter l'état des stocks d'atelier, filtrer les alertes par site et exporter les données d'inventaire", "Moyenne", "3 jours", "Sprint 4"]
          ],
          [700, 4966, 1000, 1100, 900]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.4 : Product Backlog priorisé du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.7.5 Planification des sprints"),
        body("Le projet s'est déroulé sur une période de 13 semaines articulée en un sprint de cadrage initial (Sprint 0) et quatre sprints de développement d'une durée de 2 à 3 semaines chacun (tableau 1.5) :"),
        pb(),
        makeTable(
          ["Sprint", "Objectif principal", "Livrables clés validés"],
          [
            ["Sprint 0", "Cadrage des besoins et architecture globale", "Spécifications fonctionnelles, cas d'utilisation UML et architecture logicielle."],
            ["Sprint 1", "Qualité des données et pipeline ETL", "Pipeline Python de nettoyage, structuration dimensionnelle du Data Warehouse et chargement des données validées."],
            ["Sprint 2", "Gestion intelligente des stocks", "Classification par niveau de criticité, seuils d'alerte, règles de réapprovisionnement et estimation budgétaire."],
            ["Sprint 3", "Modélisation prédictive par IA", "Entraînement et comparaison des modèles d'apprentissage automatique, sélection du modèle de production et validation temporelle."],
            ["Sprint 4", "Restitution décisionnelle et validation", "Tableaux de bord Power BI, portail web opérationnel, mesures d'atelier et recette fonctionnelle."]
          ],
          [1800, 3400, 3866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.5 : Planification des sprints du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("1.8 Langage et démarche de modélisation"),
        body("Pour modéliser la structure et le comportement du système avec rigueur et clarté, nous mobilisons le langage standard **UML (Unified Modeling Language)** [26] pour le cadrage fonctionnel, complété par les représentations de flux propres aux projets de Data Science. Trois types de représentations graphiques sont principalement employés dans ce rapport :"),
        bullet("**Diagramme de cas d'utilisation global (Chapitre 2)** : formalisation synthétique des services offerts aux deux acteurs du système (Opérateur d'atelier et Administrateur), avec identification des relations d'inclusion d'authentification."),
        bullet("**Modélisation dimensionnelle et relationnelle (Chapitre 3)** : schéma conceptuel et relationnel de l'entrepôt de données (Data Warehouse) articulant la table de faits d'atelier et les dimensions associées."),
        bullet("**Cartographies d'architecture et flux de données (Chapitres 2, 3 et 6)** : description modulaire des couches du système décisionnel, du pipeline séquentiel ETL et de l'intégration globale de la plateforme."),
        pb(),

        title2("1.9 Conclusion"),
        conclusionBox("Ce premier chapitre a posé les fondations du projet Nexora. Après avoir situé le cadre académique et la collaboration entre Maps-IT et l'équipementier automobile, nous avons formalisé la problématique du pilotage d'atelier et présenté l'organisation itérative Scrum adoptée. Le chapitre suivant détaille les résultats du Sprint 0, consacré à la spécification des besoins et à la conception de l'architecture globale en quatre couches."),
        pageBreak(),
    '''

print("Chapter 1 module defined.")

