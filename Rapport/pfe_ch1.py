# -*- coding: utf-8 -*-
"""
Chapitre 1 : Contexte et cadre du projet pour Nexora (pfe.docx)
Matches EXACT outline: 1.1 à 1.9
"""

def get_chapter1():
    return '''
        // =========================================================
        // CHAPITRE 1 : CONTEXTE ET CADRE DU PROJET
        // =========================================================
        title1("Chapitre 1 : Contexte et cadre du projet"),

        title2("1.1 Introduction"),
        body("Ce premier chapitre pose le cadre général de notre projet de fin d'études. Nous présentons en premier lieu le contexte académique au sein de la Faculté des Sciences de Monastir, puis nous détaillons l'organisme d'accueil industriel, fleuron de la plasturgie automobile opérant en Tunisie et en Europe. Nous analysons ensuite les enjeux opérationnels d'atelier, les limites des pratiques actuelles fondées sur des outils disparates et non prédictifs, et la solution logicielle et analytique **Nexora** développée pour y répondre. Enfin, nous exposons le workflow global du système, la démarche méthodologique Agile Scrum retenue ainsi que le langage de modélisation UML encadrant nos réalisations."),
        pb(),

        title2("1.2 Contexte académique"),
        body("Ce travail s'inscrit dans le cadre du **Master Professionnel en Data Science** dispensé par la Faculté des Sciences de Monastir (FSM) au sein de l'Université de Monastir. Cette formation d'excellence vise à former des spécialistes de haut niveau capables de concevoir des architectures de données complexes, de développer des modèles prédictifs fondés sur l'intelligence artificielle et d'intégrer des solutions décisionnelles au sein de systèmes d'information industriels."),
        pb(),
        body("Ce projet de fin d'études représente une opportunité privilégiée de conjuguer compétences théoriques avancées en apprentissage automatique (Machine Learning, Deep Learning, Séries Temporelles) et impératifs concrets de l'ingénierie logicielle industrielle, en confrontant nos algorithmes à un jeu de données réel de production totalisant plus de 1,5 million d'enregistrements."),
        pb(),

        title2("1.3 Présentation de l'organisme d'accueil"),
        title3("1.3.1 Présentation de l'entreprise"),
        body("L'organisme d'accueil est **Maps-IT**, une société de services informatiques et d'ingénierie logicielle basée à Monastir en Tunisie. Fondée en 2021, Maps-IT accompagne ses clients dans la mise en œuvre de solutions technologiques sur mesure, le développement d'architectures web et cloud, l'intégration de systèmes décisionnels (Business Intelligence) et la valorisation industrielle des données par la Data Science et l'Intelligence Artificielle."),
        pb(),
        body("Le tableau 1.1 synthétise la fiche d'identité de l'entreprise d'accueil :"),
        pb(),
        makeTable(
          ["Champ", "Information"],
          [
            ["Raison sociale", "Maps-IT"],
            ["Date de création", "2021"],
            ["Secteur", "Services informatiques et logiciels"],
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
        body("Maps-IT déploie son expertise autour de plusieurs pôles de compétences complémentaires :"),
        bullet("**Ingénierie logicielle et développement sur mesure** : conception d'applications web, mobiles et de portails métiers performants et sécurisés."),
        bullet("**Business Intelligence et architectures décisionnelles** : conception d'entrepôts de données (Data Warehouse), pipelines d'intégration ETL et modélisation de tableaux de bord de pilotage exécutif."),
        bullet("**Data Science et Intelligence Artificielle** : développement de modèles prédictifs pour les séries temporelles, analyse exploratoire de données volumineuses et optimisation des processus opérationnels."),
        pb(),

        title2("1.4 Présentation de la plateforme Nexora"),
        title3("1.4.1 Présentation générale"),
        body("**Nexora** est une plateforme logicielle et décisionnelle intelligente conçue spécifiquement pour unifier le pilotage des 319 presses à injecter et automatiser la gestion des stocks de production de l'entreprise. Accessible via une interface web réactive sécurisée, Nexora interconnecte le Data Warehouse SQL Server d'entreprise, un moteur d'intelligence artificielle prédictive et des tableaux de bord interactifs."),
        pb(),
        ...imageFigure("logos/logo.png", "Figure 1.2 : Logo de la plateforme Nexora", 220, 90),
        body("La plateforme permet aux responsables d'ateliers, planificateurs de production et gestionnaires de stock de superviser les indicateurs en temps réel, de diagnostiquer instantanément les dérives de fabrication et de planifier les approvisionnements sur la base de prévisions fiabilisées par l'intelligence artificielle."),
        pb(),

        title3("1.4.2 Fonctionnalités principales"),
        body("La plateforme Nexora offre quatre grands ensembles de fonctionnalités métier :"),
        bullet("**Suivi temps réel des machines et calcul automatique du TRG/OEE** : affichage en direct du statut des 319 presses (en marche, arrêtée, réglage, maintenance) et décomposition instantanée du Taux de Rendement Global selon ses trois composantes : Disponibilité, Performance et Qualité."),
        bullet("**Prévision des cadences et des volumes de fabrication** : modélisation temporelle par apprentissage automatique anticipant la charge machine à 7, 15 et 30 jours pour optimiser le planning des équipes de travail."),
        bullet("**Gestion proactive et prescriptive des stocks** : classification automatique des 6 875 articles du catalogue selon leur niveau de risque (Rupture, Critique, Normal, Surstock) et calcul des quantités économiques à réapprovisionner pour maintenir une couverture sécurisée de 45 jours."),
        bullet("**Tableaux de bord analytiques et reporting exécutif** : visualisations interactives haute performance (ApexCharts et Power BI Embedded) permettant des analyses croisées par usine, atelier, machine et famille de matière."),
        pb(),

        title3("1.4.3 Limite actuelle et besoin d'évolution"),
        body("Avant le déploiement de Nexora, l'entreprise s'appuyait sur des processus manuels et des outils cloisonnés qui engendraient des faiblesses opérationnelles critiques :"),
        bullet("**Calcul manuel et décalé du TRG** : les fiches de production remplies à la main par les opérateurs étaient ressaisies sur des tableurs Excel en fin de mois. Ce décalage temporel interdisait toute réaction rapide face aux pannes répétées ou aux micro-arrêts perlés."),
        bullet("**Absence totale d'anticipation des stocks** : la gestion d'inventaire reposait sur des constats visuels hebdomadaires. Les commandes de matières plastiques étaient passées dans l'urgence après constat de pénurie, entraînant des arrêts de presses coûteux et des pénalités de retard client."),
        bullet("**Surstocks coûteux et capital immobilisé** : pour compenser le manque de visibilité, certains planificateurs sur-commandaient des résines techniques coûteuses, immobilisant inutilement des centaines de milliers de dinars de trésorerie."),
        bullet("**Cloisonnement de l'ERP Microsoft Dynamics NAV** : l'accès complexe aux tables SQL Server réservait les données aux administratifs, privant les équipes de terrain d'un outil visuel adapté à leur quotidien."),
        pb(),

        title2("1.5 Présentation du projet"),
        title3("1.5.1 Contexte et problématique"),
        body("Le Data Warehouse d'entreprise accumule depuis des années des millions de lignes d'historique de production : plus de 250 000 enregistrements de temps machines dans la table **Capacity Ledger Entry (CLE)** et plus de 1,5 million de mouvements de pièces dans la table **Item Ledger Entry (ILE)**. Cette mine d'informations demeurait pourtant sous-exploitée pour l'aide à la décision proactive."),
        body("La question centrale qui guide notre démarche est donc :"),
        body("*« Comment transformer les données historiques du Data Warehouse SQL Server en un système décisionnel intelligent capable de calculer le TRG en temps réel, de prédire avec précision les cadences d'atelier par IA et d'automatiser les recommandations de réapprovisionnement des stocks ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),

        title3("1.5.2 Étude de l'existant"),
        body("L'analyse des solutions existantes sur le marché et des pratiques industrielles met en lumière trois approches principales : les progiciels MES industriels lourds (ex. SAP MES, Siemens), les modules standards des ERP d'entreprise (Microsoft Dynamics NAV) et les feuilles de calcul manuelles (Excel). Si chacune répond à des besoins spécifiques, aucune ne combine le calcul du TRG en temps réel, l'inférence prédictive par intelligence artificielle et une ergonomie fluide adaptée aux opérateurs d'atelier."),
        pb(),

        title3("1.5.3 Solution proposée"),
        body("Pour répondre à ces limites, la solution développée, nommée **Nexora**, est un système décisionnel modulaire articulé autour de trois composantes principales :"),
        bullet("**1. Un pipeline ETL robuste et performant** : assurant l'extraction depuis Microsoft SQL Server, le nettoyage des anomalies de stock, le recalage des inventaires et le calcul de 16 variables explicatives industrielles."),
        bullet("**2. Un module d'intelligence artificielle prédictive** : s'appuyant sur l'entraînement de 9 modèles d'IA pour projeter les cadences de fabrication et la charge d'atelier sur des horizons temporels de 7, 15 et 30 jours."),
        bullet("**3. Un module de gestion intelligente des stocks** : classant les 6 875 articles du catalogue et générant des alertes automatiques priorisées pour sécuriser 45 jours de couverture de stock."),
        pb(),
        body("L'ensemble de ces fonctionnalités est intégré au sein d'une interface web réactive développée avec React 18, pilotée par Spring Boot 3 et enrichie de rapports décisionnels Microsoft Power BI."),
        pb(),
        body("Le tableau 1.2 synthétise la comparaison entre les solutions existantes du marché et notre solution Nexora :"),
        pb(),
        makeTable(
          ["Critère d'évaluation", "Progiciels MES Lourds (SAP MES, Siemens)", "ERP Classique (Microsoft NAV)", "Méthodes Tableurs (Excel)", "Notre solution : Nexora"],
          [
            ["Suivi TRG en temps réel",         "✓", "✗", "✗",        "✓"],
            ["Modélisation prédictive IA",       "✗", "✗", "✗",        "✓"],
            ["Tableaux de bord BI intégrés",     "✓", "Limité", "✗",   "✓"],
            ["Connexion directe DWH SQL Server", "✓", "✓", "Instable", "✓"],
            ["Gestion intelligente des stocks",  "✓", "✗", "✗",        "✓"],
            ["Alertes et recommandations IA",    "✗", "✗", "✗",        "✓"],
            ["Ergonomie adaptée atelier",        "✗", "✗", "✗",        "✓"],
            ["Coût maîtrisé & évolutivité",      "✗", "✗", "✓",        "✓"],
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
        body("Le système décisionnel suit un pipeline continu structuré en huit étapes successives, illustré dans la figure 1.3 :"),
        pb(),
        ...imageFigure("diagrams/architecture.png", "Figure 1.3 : Workflow complet du système décisionnel Nexora", 460, 460),
        bullet("**1. Collecte continue** : extraction automatisée des données depuis les tables de faits du Data Warehouse SQL Server (CLE, ILE, Item, Machine Center)."),
        bullet("**2. Nettoyage (ETL)** : détection des stocks négatifs, traitement des valeurs manquantes et filtrage des doublons opérationnels."),
        bullet("**3. Feature Engineering** : création de 16 variables explicatives temporelles (lags de cadences à J-1, J-7, J-14, moyennes mobiles, saisonnalités des constructeurs)."),
        bullet("**4. Split Train/Test** : découpage chronologique strict en 80 % pour l'apprentissage et 20 % pour l'évaluation afin de prévenir tout data leakage."),
        bullet("**5. Entraînement** : apprentissage comparatif des modèles de prévision temporelle (Prophet, Random Forest, ARIMA, Régression Linéaire) et de détection d'anomalies (Isolation Forest)."),
        bullet("**6. Validation & Optimisation** : optimisation des hyperparamètres par validation croisée temporelle TimeSeriesSplit à 5 plis."),
        bullet("**7. Évaluation multi-critères** : calcul rigoureux des métriques MAE, RMSE, MAPE et R² pour chaque modèle testé."),
        bullet("**8. Restitution applicative** : injection des prédictions dans le tableau de bord interactif React.js et les rapports Power BI."),
        pb(),

        title2("1.7 Méthodologie de développement"),
        title3("1.7.1 Étude comparative des méthodes"),
        body("Avant d'engager les développements, nous avons confronté l'approche traditionnelle en cascade (cycle en V) à l'approche Agile afin de retenir le cadre le plus efficient pour un projet couplant recherche en Data Science et génie logiciel :"),
        pb(),
        makeTable(
          ["Critère", "Approche classique", "Approche agile"],
          [
            ["Cycle de vie", "Linéaire et en cascade", "Itératif et incrémental"],
            ["Planification", "Déterministe, besoins figés", "Flexible, ajustements continus"],
            ["Livraisons", "Unique en fin de projet", "Fréquentes à chaque sprint"],
            ["Gestion du changement", "Difficiles à intégrer", "Facilement acceptés"],
            ["Feedback", "En fin de cycle", "Continu et régulier"],
            ["Indicateur de succès", "Respect du plan initial", "Valeur livrée et satisfaction"]
          ],
          [2400, 3100, 3166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.3 : Comparaison entre approche classique et approche agile", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 1.4 récapitule la balance avantages/inconvénients des deux méthodologies :"),
        pb(),
        makeTable(
          ["Méthodologie", "Avantages Principaux", "Inconvénients / Risques Majeurs"],
          [
            ["Approche classique", "• Structure claire et jalons temporels rigides.\\n• Facilité de planification contractuelle initiale.", "• Manque cruel de flexibilité face aux imprévus de données.\\n• Détection très tardive des écarts entre modèle et terrain."],
            ["Approche Agile (Scrum)", "• Forte réactivité face aux réalités des données du DWH.\\n• Démonstration progressive d'incréments exploitables.\\n• Alignement continu avec les ingénieurs d'atelier.", "• Nécessite une disponibilité soutenue du Product Owner.\\n• Risque de dérive si le backlog n'est pas rigoureusement borné."]
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
        body("La réussite d’un projet dépend en grande partie de la méthodologie de développement adoptée, notamment de sa capacité à s’adapter aux évolutions des besoins et à assurer une livraison progressive des fonctionnalités."),
        pb(),
        body("Dans le cadre de ce projet, nous avons choisi la méthodologie Agile Scrum [1, 2], car elle est particulièrement adaptée au développement d’une solution intégrant plusieurs modules, tels que le pipeline ETL, la prévision des ventes, la gestion intelligente des stocks et le tableau de bord décisionnel."),
        pb(),
        body("Cette approche permet de réaliser et de valider progressivement chaque module, tout en facilitant les échanges avec les encadrants et l’intégration des améliorations au fil des sprints."),
        pb(),
        body("Le déroulement de notre projet Scrum suit les étapes suivantes [2] :"),
        body("1. Élaboration du Product Backlog.", { indent: 400 }),
        body("2. Planification des sprints.", { indent: 400 }),
        body("3. Développement et tests des fonctionnalités.", { indent: 400 }),
        body("4. Livraison d’un incrément fonctionnel à la fin de chaque sprint.", { indent: 400 }),
        body("5. Revue du sprint et amélioration continue.", { indent: 400 }),
        pb(),
        body("La figure suivante illustre le cycle de vie de la méthodologie Scrum :"),
        pb(),
        ...imageFigure("scrum-framework-9.29.23.png", "Figure 1.4 : Cycle de la méthodologie Scrum", 520, 320),
        pb(),

        title3("1.7.3 Application de Scrum au projet"),
        body("L'organisation des rôles Scrum a été formalisée comme suit :"),
        bullet("**Product Owner** :                 (encadrant en entreprise), garant de la conformité aux besoins industriels et de la priorisation du Product Backlog."),
        bullet("**Scrum Master** :                 (encadrant universitaire à la FSM), veillant au respect de la démarche scientifique, à la méthodologie et à la levée des blocages théoriques."),
        bullet("**Équipe de Développement** : assurée par l'étudiante ingénieure, en charge de la conception architecturale, de l'ingénierie des données, du développement des modèles d'IA et de l'intégration logicielle."),
        pb(),

        title3("1.7.4 Product Backlog"),
        body("Le Product Backlog répertorie l'ensemble des 20 exigences du système formulées sous forme de User Stories, priorisées et estimées en jours selon les sprints de réalisation :"),
        pb(),
        makeTable(
          ["ID", "Récit Utilisateur (User Story)", "Priorité", "Estimation (jours)", "Sprint Associé"],
          [
            ["US01", "En tant qu'utilisateur, je veux m'authentifier par jeton JWT afin d'accéder aux fonctions autorisées", "Haute", "5 jours", "Sprint 1"],
            ["US02", "En tant qu'administrateur, je veux configurer les rôles RBAC pour restreindre les accès aux API", "Haute", "5 jours", "Sprint 1"],
            ["US03", "En tant qu'administrateur, je veux auditer le DWH afin de cartographier les tables de faits", "Haute", "8 jours", "Sprint 1"],
            ["US04", "En tant qu'administrateur, je veux assainir les données de mouvements de stock afin d'éliminer les anomalies", "Haute", "5 jours", "Sprint 1"],
            ["US05", "En tant que manager, je veux classer les articles selon la méthode ABC de Pareto afin d'optimiser le stockage", "Haute", "8 jours", "Sprint 2"],
            ["US06", "En tant que manager, je veux recevoir des alertes automatiques de rupture critique (< 5 pcs)", "Haute", "5 jours", "Sprint 2"],
            ["US07", "En tant qu'opérateur, je veux enregistrer des entrées/sorties de stock conformes au DWH", "Moyenne", "5 jours", "Sprint 2"],
            ["US08", "En tant que manager, je veux obtenir des recommandations de commande d'approvisionnement", "Haute", "5 jours", "Sprint 2"],
            ["US09", "En tant que manager, je veux adapter les équipes (3x8) selon les besoins d'approvisionnement", "Moyenne", "5 jours", "Sprint 2"],
            ["US10", "En tant que manager, je veux planifier des transferts inter-usines Tunisie-Brno", "Basse", "3 jours", "Sprint 2"],
            ["US11", "En tant que manager, je veux suivre les 319 machines d'atelier en temps réel", "Haute", "8 jours", "Sprint 3"],
            ["US12", "En tant que manager, je veux calculer automatiquement le TRG en direct par centre de charge", "Haute", "8 jours", "Sprint 3"],
            ["US13", "En tant qu'opérateur, je veux déclarer le statut des Ordres de Fabrication", "Moyenne", "5 jours", "Sprint 3"],
            ["US14", "En tant que manager, je veux extraire et agréger l'historique de production afin d'alimenter les modèles d'IA", "Haute", "5 jours", "Sprint 3"],
            ["US15", "En tant que manager, je veux entraîner 4 modèles d'IA (Prophet, RF, ARIMA, Régression) pour fiabiliser les prévisions", "Haute", "8 jours", "Sprint 3"],
            ["US16", "En tant que manager, je veux visualiser les prévisions de cadence à 30 jours et bornes à 95%", "Haute", "5 jours", "Sprint 3"],
            ["US17", "En tant que manager, je veux disposer d'une console avec filtres multi-critères", "Haute", "5 jours", "Sprint 4"],
            ["US18", "En tant que manager, je veux exporter les données filtrées sous format Excel (.xlsx)", "Moyenne", "3 jours", "Sprint 4"],
            ["US19", "En tant que manager, je veux superviser la production globale sur un tableau de bord exécutif Power BI", "Haute", "8 jours", "Sprint 4"],
            ["US20", "En tant que manager, je veux analyser la valorisation et les mouvements de stock sur Power BI", "Haute", "5 jours", "Sprint 4"]
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
        body("Le projet a été articulé en cinq sprints consécutifs de quatre semaines, chacun donnant lieu à un chapitre dédié :"),
        pb(),
        makeTable(
          ["Sprint", "Objectif", "Livrable principal"],
          [
            ["Sprint 0", "Analyse des besoins et conception globale", "Spécifications fonctionnelles et architecture globale"],
            ["Sprint 1", "Analyse, nettoyage des données et pipeline ETL", "Data Warehouse assaini et table analytique consolidée"],
            ["Sprint 2", "Conception du module de gestion des stocks", "Classification ABC, alertes et recommandations d'approvisionnement"],
            ["Sprint 3", "Modélisation prédictive par IA (4 modèles)", "Modèles comparés (Prophet, RF, ARIMA, Régression) et Isolation Forest"],
            ["Sprint 4", "Développement des tableaux de bord et validation", "Rapports Power BI / Web d'atelier et recette fonctionnelle"]
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
        body("Pour modéliser les aspects structurels et comportementaux du système, le langage **UML 2.5 (Unified Modeling Language)** [28] a été utilisé. Étant donné que notre projet est principalement axé sur la Data Science et l'intelligence artificielle appliquée à la plasturgie automobile, nous avons utilisé quatre diagrammes essentiels :"),
        bullet("**Diagramme des cas d'utilisation (Chapitre 2)** : représentation des interactions entre les acteurs d'atelier et les fonctionnalités de la plateforme Nexora."),
        bullet("**Diagramme de classes (Chapitre 2 et 3)** : modélisation de la structure des entités de production et du schéma de données du Data Warehouse SQL Server."),
        bullet("**Diagramme d'activité (Chapitre 3)** : montre les étapes logiques d'ingestion, d'assainissement et de transformation du pipeline ETL."),
        bullet("**Diagramme de séquence (Chapitre 6)** : modélisation dynamique des flux de requêtes entre l'utilisateur, les rapports Power BI et le Data Warehouse SQL Server."),
        pb(),

        title2("1.9 Conclusion"),
        conclusionBox("Ce premier chapitre a établi les fondements du projet Nexora au sein de l'environnement industriel de la plasturgie automobile. L'analyse critique de l'existant a confirmé l'impérieuse nécessité d'un système décisionnel unifié, capable de relier le Data Warehouse à des algorithmes d'IA prédictive et à des tableaux de bord ergonomiques. La démarche Agile Scrum et la modélisation UML fournissent le cadre rigoureux garantissant une réalisation maîtrisée. Le chapitre suivant détaille les résultats du Sprint 0, consacré à la spécification fine des besoins et à la conception architecturale globale."),
        pageBreak(),
    '''

print("Chapter 1 module defined.")
