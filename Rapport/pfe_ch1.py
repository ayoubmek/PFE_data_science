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
        body("L'organisme d'accueil est un groupe industriel international de premier plan, équipementier automobile de rang 1 (Tier-1) spécialisé dans la plasturgie technique et l'injection plastique de haute précision. Fondé pour répondre aux standards de qualité les plus rigoureux de l'industrie automobile mondiale, le groupe opère à travers plusieurs unités de production modernes situées en Tunisie (usines de Kondar et Sousse) et au cœur de l'Europe centrale en République Tchèque (site industriel de Brno)."),
        pb(),
        ...imageFigure("image/logo.png", "Figure 1.1 : Logo de l'entreprise industrielle d'accueil", 240, 100),
        body("Le parc industriel consolidé de l'entreprise compte **319 presses à injecter automatisées**, de tonnages variés (de 50 à 1 500 tonnes), issues des constructeurs d'équipements industriels les plus réputés : Demag, Arburg, KraussMaffei et Engel. Ces machines fonctionnent selon un régime continu en trois-huit (3x8), assurant la production quotidienne de plusieurs centaines de milliers de sous-ensembles plastiques."),
        pb(),
        body("Le tableau 1.1 synthétise la fiche d'identité de l'entreprise d'accueil :"),
        pb(),
        makeTable(
          ["Champ", "Information / Détails de l'Entreprise"],
          [
            ["Raison sociale", "Équipementier Automobile International — Division Plasturgie Technique"],
            ["Secteur d'activité", "Industrie Automobile Tier-1 / Injection Plastique de Précision"],
            ["Sites de production", "Kondar (Tunisie), Sousse (Tunisie), Brno (République Tchèque)"],
            ["Parc machines", "319 presses à injecter (Demag, Arburg, KraussMaffei, Engel)"],
            ["Système ERP / DWH", "Microsoft Dynamics NAV & Microsoft SQL Server Enterprise"],
            ["Clients principaux", "Grands constructeurs automobiles européens (Stellantis, Renault, VAG)"],
            ["Normes et certifications", "IATF 16949, ISO 9001, ISO 14001, ISO 45001"],
            ["Effectif global", "Plus de 2 500 collaborateurs à l'échelle internationale"]
          ],
          [2800, 5866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.1 : Fiche d'identité de l'entreprise industrielle d'accueil", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.3.2 Domaines d'activité"),
        body("L'entreprise conçoit, développe et industrialise des composants plastiques injectés à forte valeur ajoutée technologique pour l'automobile :"),
        bullet("**Connectique et boîtiers sous-capot moteur** : pièces techniques résistantes aux hautes températures, aux vibrations sévères et aux hydrocarbures (matières PA66, PBT renforcées de fibres de verre)."),
        bullet("**Pièces d'aspect et d'habillage intérieur** : planches de bord, grilles de ventilation, consoles centrales et panneaux de porte nécessitant une finition esthétique irréprochable sans défaut d'aspect (matières ABS, PP, PC-ABS)."),
        bullet("**Modules mécatroniques et éclairage** : supports de capteurs d'aide à la conduite (ADAS), optiques de phares et boîtiers électroniques embarqués."),
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
        body("Afin de justifier le développement d'une plateforme dédiée, nous avons réalisé une étude comparative approfondie des solutions du marché face aux besoins de l'entreprise :"),
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
            new TextRun({ text: "TABLEAU 1.2 : ", font: FONT, size: 20, bold: true, color: "333333" }),
            new TextRun({ text: "Comparaison des solutions existantes avec notre système", font: FONT, size: 20, italics: true, color: GRAY })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.5.3 Solution proposée"),
        body("La solution développée, baptisée **Nexora**, est un système décisionnel modulaire articulé autour de trois composantes principales :"),
        bullet("**1. Un pipeline ETL robuste et performant** : assurant l'extraction depuis Microsoft SQL Server, le nettoyage des anomalies de stock, le recalage des inventaires et le calcul de 16 variables explicatives industrielles."),
        bullet("**2. Un module d'intelligence artificielle prédictive** : s'appuyant sur l'entraînement de 9 modèles d'IA pour projeter les cadences de fabrication et la charge d'atelier sur des horizons temporels de 7, 15 et 30 jours."),
        bullet("**3. Un module de gestion intelligente des stocks** : classant les 6 875 articles du catalogue et générant des alertes automatiques priorisées pour sécuriser 45 jours de couverture de stock."),
        pb(),
        body("L'ensemble de ces fonctionnalités est intégré au sein d'une interface web réactive développée avec React 18, stylisée par le design system Metronic 8, pilotée par Spring Boot 3 et enrichie de rapports décisionnels Microsoft Power BI."),
        pb(),

        title2("1.6 Workflow complet du projet"),
        body("Le système décisionnel suit un pipeline continu structuré en huit étapes successives, illustré dans la figure 1.3 :"),
        pb(),
        ...imageFigure("diagrams/architecture.png", "Figure 1.3 : Workflow complet du système décisionnel Nexora", 540, 240),
        bullet("**1. Collecte continue** : extraction automatisée des données depuis les tables de faits du Data Warehouse SQL Server (CLE, ILE, Item, Machine Center)."),
        bullet("**2. Nettoyage (ETL)** : détection des stocks négatifs, traitement des valeurs manquantes et filtrage des doublons opérationnels."),
        bullet("**3. Feature Engineering** : création de 16 variables explicatives temporelles (lags de cadences à J-1, J-7, J-14, moyennes mobiles, saisonnalités des constructeurs)."),
        bullet("**4. Split Train/Test** : découpage chronologique strict en 80 % pour l'apprentissage et 20 % pour l'évaluation afin de prévenir tout data leakage."),
        bullet("**5. Entraînement** : apprentissage comparatif des modèles de prévision temporelle (Prophet, Random Forest, ARIMA, Régression Linéaire) et de détection d'anomalies (Isolation Forest)."),
        bullet("**6. Validation & Optimisation** : optimisation des hyperparamètres par validation croisée temporelle TimeSeriesSplit à 5 plis."),
        bullet("**7. Évaluation multi-critères** : calcul rigoureux des métriques MAE, RMSE, MAPE et R² pour chaque modèle testé."),
        bullet("**8. Restitution applicative** : injection des prédictions dans le tableau de bord interactif React Metronic et les rapports Power BI."),
        pb(),

        title2("1.7 Méthodologie de développement"),
        title3("1.7.1 Étude comparative des méthodes"),
        body("Avant d'engager les développements, nous avons confronté l'approche traditionnelle en cascade (cycle en V) à l'approche Agile afin de retenir le cadre le plus efficient pour un projet couplant recherche en Data Science et génie logiciel :"),
        pb(),
        makeTable(
          ["Critère de comparaison", "Approche classique (Cycle en V)", "Approche Agile (Scrum)"],
          [
            ["Cycle de vie", "Linéaire, séquentiel et prédictif", "Itératif, incrémental et adaptatif"],
            ["Spécification des besoins", "Exhaustive et figée dès le départ", "Évolutive par User Stories priorisées"],
            ["Livraisons logicielles", "Unique à la fin du projet", "Fréquentes et testables à chaque sprint"],
            ["Gestion du changement", "Difficile et coûteuse après validation", "Intégrée naturellement au rythme des sprints"],
            ["Implication des utilisateurs", "Limitée aux recettes initiales et finales", "Continue avec feedback à chaque fin de sprint"],
            ["Mesure du succès", "Conformité stricte au cahier des charges initial", "Valeur métier opérationnelle livrée en atelier"]
          ],
          [2600, 3000, 3066]
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
        body("La méthodologie Agile Scrum [1, 2] a été adoptée. Sa flexibilité itérative convient parfaitement aux projets de Data Science où les expérimentations algorithmiques nécessitent des boucles d'ajustement rapides et régulières :"),
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
        body("Le Product Backlog répertorie l'ensemble des 20 exigences du système formulées sous forme de User Stories, priorisées et estimées en Story Points (SP) selon les sprints de réalisation :"),
        pb(),
        makeTable(
          ["ID", "Récit Utilisateur (User Story)", "Priorité", "Estimation", "Sprint Associé"],
          [
            ["US01", "En tant qu'utilisateur, je veux m'authentifier par jeton JWT afin d'accéder aux fonctions autorisées", "Haute", "5 SP", "Sprint 1"],
            ["US02", "En tant qu'administrateur, je veux configurer les rôles RBAC pour restreindre les accès aux API", "Haute", "5 SP", "Sprint 1"],
            ["US03", "En tant qu'administrateur, je veux auditer le DWH afin de cartographier les tables de faits", "Haute", "8 SP", "Sprint 1"],
            ["US04", "En tant qu'administrateur, je veux assainir les données de mouvements de stock afin d'éliminer les anomalies", "Haute", "5 SP", "Sprint 1"],
            ["US05", "En tant que manager, je veux suivre les 319 machines d'atelier en temps réel", "Haute", "8 SP", "Sprint 2"],
            ["US06", "En tant que manager, je veux calculer automatiquement le TRG en direct par centre de charge", "Haute", "8 SP", "Sprint 2"],
            ["US07", "En tant qu'opérateur, je veux déclarer le statut des Ordres de Fabrication", "Moyenne", "5 SP", "Sprint 2"],
            ["US08", "En tant que manager, je veux extraire et agréger l'historique de production afin d'alimenter les modèles d'IA", "Haute", "5 SP", "Sprint 2"],
            ["US09", "En tant que manager, je veux entraîner le modèle Prophet et comparer avec ARIMA pour fiabiliser les prévisions", "Haute", "8 SP", "Sprint 2"],
            ["US10", "En tant que manager, je veux visualiser les prévisions de production à 30 jours et bornes à 95%", "Haute", "5 SP", "Sprint 2"],
            ["US11", "En tant que manager, je veux classer les articles selon la méthode ABC de Pareto afin d'optimiser le stockage", "Haute", "8 SP", "Sprint 3"],
            ["US12", "En tant que manager, je veux recevoir des alertes automatiques de rupture critique (< 5 pcs)", "Haute", "5 SP", "Sprint 3"],
            ["US13", "En tant qu'opérateur, je veux enregistrer des entrées/sorties de stock conformes au DWH", "Moyenne", "5 SP", "Sprint 3"],
            ["US14", "En tant que manager, je veux obtenir des recommandations de commande d'approvisionnement", "Haute", "5 SP", "Sprint 3"],
            ["US15", "En tant que manager, je veux adapter les équipes (3x8) selon les prévisions de cadence", "Moyenne", "5 SP", "Sprint 3"],
            ["US16", "En tant que manager, je veux planifier des transferts inter-usines Tunisie-Brno", "Basse", "3 SP", "Sprint 3"],
            ["US17", "En tant que manager, je veux disposer d'une console avec filtres multi-critères", "Haute", "5 SP", "Sprint 4"],
            ["US18", "En tant que manager, je veux exporter les données filtrées sous format Excel (.xlsx)", "Moyenne", "3 SP", "Sprint 4"],
            ["US19", "En tant que manager, je veux superviser la production globale sur un tableau de bord exécutif Power BI", "Haute", "8 SP", "Sprint 4"],
            ["US20", "En tant que manager, je veux analyser la valorisation et les mouvements de stock sur Power BI", "Haute", "5 SP", "Sprint 4"]
          ],
          [700, 5300, 1000, 1000, 1000]
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
            ["Sprint 0", "Analyse des besoins et conception", "Spécifications et architecture globale"],
            ["Sprint 1", "Prétraitement des données et ETL", "Data Warehouse SQL Server et tables de faits"],
            ["Sprint 2", "Prévision des cadences par IA", "Modèle Prophet sélectionné"],
            ["Sprint 3", "Gestion intelligente des stocks", "Module de classification et recommandations"],
            ["Sprint 4", "Dashboard et validation", "Tableaux de bord Power BI connectés au DWH"]
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
