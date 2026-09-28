# -*- coding: utf-8 -*-
"""
Chapitre 2 : Sprint 0 : Analyse des besoins et Conception du Système pour Nexora (pfe.docx)
Matches EXACT outline: 2.1 à 2.6
"""

def get_chapter2():
    return '''
        // =========================================================
        // CHAPITRE 2 : SPRINT 0 : ANALYSE DES BESOINS ET CONCEPTION
        // =========================================================
        title1("Chapitre 2 : Sprint 0 : Analyse des besoins et Conception du Système"),

        title2("2.1 Introduction"),
        body("Ce chapitre correspond au Sprint 0 de notre démarche Scrum. Étape charnière de tout projet d'ingénierie logicielle d'envergure, le Sprint 0 a pour objectif de formaliser l'ensemble des exigences du système décisionnel **Nexora**, d'analyser les interactions entre les utilisateurs et la plateforme, de concevoir l'architecture technique en quatre couches et d'arrêter la stack logicielle et matérielle mobilisée tout au long du cycle de vie du projet."),
        pb(),

        title2("2.2 Spécification des besoins"),
        body("La spécification méthodique des exigences permet de traduire les objectifs industriels exprimés par la direction de l'usine en fonctionnalités logicielles vérifiables et quantifiables. Nous distinguons les besoins fonctionnels, décrivant les services attendus, des besoins non fonctionnels, fixant les exigences de qualité technique."),
        pb(),

        title3("2.2.1 Besoins fonctionnels"),
        body("Les besoins fonctionnels sont ventilés selon les rôles opérationnels des utilisateurs de la plateforme Nexora :"),
        bullet("**Le Responsable de Production / Chef d'Atelier** : doit pouvoir superviser l'ensemble du parc de 319 presses en temps réel, visualiser instantanément le Taux de Rendement Global (TRG/OEE) global et par machine, consulter la décomposition du TRG (Disponibilité, Performance, Qualité), identifier les causes d'arrêt machine (changement de moule, panne mécanique, réglage thermique), et accéder aux prévisions de cadences à 7, 15 et 30 jours pour équilibrer la charge des équipes en régime 3x8."),
        bullet("**Le Gestionnaire des Stocks et des Approvisionnements** : doit pouvoir analyser en temps réel l'état des 6 875 références d'articles, filtrer les produits par statut de stock (Rupture, Critique, Normal, Surstock), consulter la couverture en jours et le taux de rotation de chaque matière plastique, recevoir des alertes de rupture imminente hiérarchisées par coût d'arrêt évité, et obtenir des recommandations automatisées de réapprovisionnement sous horizon 45 jours avec chiffrage budgétaire."),
        bullet("**L'Opérateur d'Atelier** : doit disposer d'un terminal d'atelier simplifié pour déclarer les débuts et fins d'ordres de fabrication (OF), enregistrer les quantités de pièces conformes et de rebuts, et signaler les événements d'arrêt machine sans perturber le cycle d'injection."),
        bullet("**L'Administrateur Système** : doit administrer les comptes utilisateurs et attribuer les rôles selon la politique de contrôle d'accès RBAC (Role-Based Access Control), paramétrer les seuils de stock de sécurité, superviser l'exécution du pipeline ETL, consulter les journaux d'audit de sécurité et déclencher le réentraînement des modèles d'IA prédictive."),
        bullet("**Le Data Warehouse Microsoft SQL Server (Acteur Système)** : doit alimenter de manière continue et fiable le pipeline ETL en données brutes d'atelier (tables CLE, ILE, Item, Machine Center) et garantir l'intégrité référentielle des données industrielles."),
        pb(),

        title3("2.2.2 Besoins non fonctionnels"),
        body("Les besoins non fonctionnels définissent le niveau d'exigence en termes de performance, de sécurité, de robustesse et d'ergonomie :"),
        pb(),
        makeTable(
          ["Catégorie d'exigence", "Spécification Technique et Critère de Qualité Validé"],
          [
            ["Performance", "Temps de réponse inférieur à 1 seconde pour le chargement des tableaux de bord, et inférieur à 500 ms pour les requêtes analytiques sur les 1,5M de lignes de stock."],
            ["Sécurité", "Authentification stateless sécurisée par jetons JSON Web Tokens (JWT), chiffrement des échanges en HTTPS/TLS, et cloisonnement strict des accès par rôles RBAC."],
            ["Fiabilité et Intégrité", "Disponibilité du système garantie à 99,5 %, intégrité transactionnelle ACID sur la base de données, et mécanisme de repli (fallback) hors-ligne en cas de coupure réseau."],
            ["Maintenabilité", "Architecture modulaire hautement découplée (API REST Spring Boot, microservice FastAPI indépendant), code documenté et versionné sous Git/GitHub."],
            ["Évolutivité / Scalabilité", "Capacité d'absorber l'ajout de nouvelles unités industrielles sans réécriture du socle logiciel, et scalabilité horizontale des microservices sous conteneurs Docker."],
            ["Ergonomie Industrielle", "Interface réactive (design system Metronic 8), navigation intuitive sans formation complexe préalable, visualisations interactives adaptées aux écrans d'atelier."]
          ],
          [2400, 6266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.1 : Les besoins non fonctionnels", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("2.3 Analyse des besoins"),
        title3("2.3.1 Identification des acteurs"),
        body("L'analyse des cas d'utilisation met en relief cinq acteurs principaux interagissant avec la plateforme Nexora :"),
        bullet("**1. Le Responsable de Production** : utilisateur clé des fonctionnalités de supervision d'atelier, d'analyse du TRG et de projection des cadences."),
        bullet("**2. Le Gestionnaire des Stocks** : utilisateur principal du module prescriptif d'inventaire, des alertes de rupture et des préconisations d'approvisionnement."),
        bullet("**3. L'Opérateur d'Atelier** : acteur terrain alimentant les déclarations de fabrication au pied de presse."),
        bullet("**4. L'Administrateur Système** : responsable de la gouvernance, des rôles RBAC et de la maintenance technique."),
        bullet("**5. Le Data Warehouse SQL Server** : acteur non-humain fournissant les données transactionnelles et recevant les résultats consolidés."),
        pb(),

        title3("2.3.2 Diagramme des cas d'utilisation global"),
        body("La figure 2.1 présente le diagramme de cas d'utilisation global, illustrant la cartographie des interactions entre les acteurs et les grands modules applicatifs :"),
        pb(),
        ...imageFigure("diagrams/global_usecase.png", "Figure 2.1 : Diagramme des cas d'utilisation global", 540, 310),
        body("Les relations d'inclusion (« include ») traduisent les dépendances intrinsèques du système : la consultation des prévisions de fabrication inclut obligatoirement l'inférence par le modèle d'IA Prophet, qui repose à son tour sur l'exécution préalable du pipeline ETL. De même, la génération des alertes de stock critique inclut le calcul en temps réel de la couverture en jours à partir des prévisions de consommation."),
        pb(),

        title2("2.4 Architecture globale du système"),
        body("Pour concilier robustesse industrielle, modularité et performance d'analyse en temps réel, l'architecture globale de Nexora est structurée en **quatre couches logicielles découplées**, comme l'illustre la figure 2.2 :"),
        pb(),
        ...imageFigure("diagrams/arch_logique.png", "Figure 2.2 : Architecture globale du système décisionnel en quatre couches", 540, 260),
        bullet("**1. Couche Données (Data Layer)** : constituée de l'entrepôt de données d'entreprise Microsoft SQL Server 2022. Elle centralise les tables opérationnelles de l'ERP Microsoft Dynamics NAV, notamment les 250 000 opérations de la table *Capacity Ledger Entry* et les 1,5 million de mouvements de stock de la table *Item Ledger Entry*."),
        bullet("**2. Couche Traitement & ETL (Processing Layer)** : assure l'extraction continue des flux SQL Server, l'assainissement des anomalies de stocks négatifs, le feature engineering des 16 variables explicatives industrielles et l'alimentation de la table analytique optimisée."),
        bullet("**3. Couche Métier & IA (Business & AI Layer)** : cœur décisionnel combinant le backend Spring Boot 3 (API RESTful, gestion des règles métiers, calcul du TRG et sécurité RBAC) et le microservice de Data Science sous FastAPI en Python 3.10 (chargement des modèles Prophet, Random Forest, ARIMA, Isolation Forest et K-Means)."),
        bullet("**4. Couche Présentation (Presentation Layer)** : interface utilisateur accessible par navigateur web, développée avec React 18 et le design system Metronic 8, enrichie de graphiques dynamiques ApexCharts et de tableaux de bord décisionnels Microsoft Power BI Embedded pour le reporting exécutif."),
        pb(),

        title2("2.5 Environnement de travail"),
        title3("2.5.1 Environnement matériel"),
        body("L'ensemble des phases d'ingénierie des données, d'apprentissage des modèles d'IA et de développement logiciel a été réalisé sur une station de travail disposant des spécifications matérielles suivantes :"),
        bullet("**Processeur** : Intel Core i7-12700H (14 cœurs physiques, 20 threads, jusqu'à 4.70 GHz)."),
        bullet("**Mémoire vive (RAM)** : 16 Go DDR4 cadencée à 3 200 MHz, permettant la manipulation en mémoire vive de DataFrames volumineux."),
        bullet("**Stockage** : SSD NVMe PCIe 4.0 de 512 Go offrant un débit supérieur à 3 500 Mo/s pour les transferts de bases de données."),
        bullet("**Système d'exploitation** : Microsoft Windows 11 Professionnel (64 bits)."),
        pb(),

        title3("2.5.2 Environnement logiciel"),
        body("Le tableau 2.2 détaille la suite logicielle, les frameworks et bibliothèques techniques mobilisés tout au long du projet :"),
        pb(),
        makeTable(
          ["Outil / Technologie", "Version", "Utilisation"],
          [
            ["Environnement de développement"],
            ["Visual Studio Code", "1.104.1", "Éditeur de code utilisé pour le développement Python, React et scripts d'intégration."],
            ["IntelliJ IDEA", "2024.1", "Environnement de développement intégré pour le backend Spring Boot 3 et Java 17."],
            ["Git", "2.52.0", "Système de contrôle de version pour le suivi des modifications."],
            ["GitHub", "—", "Plateforme d'hébergement pour le versionnement collaboratif et la traçabilité."],

            ["SGBD"],
            ["Microsoft SQL Server", "2022", "Système de gestion de base de données relationnelle hébergeant le Data Warehouse (dbDWH)."],
            ["SQL Server Management Studio (SSMS)", "19.3", "Interface d'administration, de profilage et d'optimisation des index clusterisés SQL."],

            ["Langage de programmation"],
            ["Python", "3.10.11", "Langage principal : ETL, modélisation de séries temporelles et microservice API."],
            ["Java (JDK)", "17 LTS", "Socle d'exécution robuste et performant pour le serveur applicatif Spring Boot 3."],
            ["TypeScript / JavaScript", "ES2022", "Développement de l'interface web réactive sous React.js et Metronic 8."],

            ["Frameworks et Bibliothèques Web"],
            ["Spring Boot", "3.2.4", "Framework backend : exposition des API RESTful, Spring Data JPA et sécurité JWT."],
            ["FastAPI", "0.110.0", "Microservice web asynchrone ultra-rapide dédié au service des prédictions d'IA."],
            ["React.js", "18.2.0", "Bibliothèque frontend pour la construction de l'interface web réactive d'atelier."],
            ["Metronic 8", "8.2.0", "Design system et suite de composants UI industriels pour l'application Nexora."],

            ["Bibliothèques Python"],
            ["Pandas", "2.1.0", "Manipulation et analyse des données tabulaires (DataFrame)."],
            ["NumPy", "1.26.0", "Calculs numériques et tableaux multidimensionnels vectorisés."],
            ["PyODBC / SQLAlchemy", "2.0.0", "Connecteur et ORM facilitant les interactions avec la base de données SQL Server."],
            ["Scikit-learn", "1.3.0", "Prétraitement, segmentation K-Means et détection d'anomalies Isolation Forest."],
            ["Prophet (Meta)", "1.1.5", "Modélisation bayésienne des séries temporelles (prévision de production et de stock)."],
            ["Statsmodels", "0.14.0", "Modélisation autorégressive ARIMA, tests de stationnarité (ADF) et décompositions."],
            ["Matplotlib", "3.8.0", "Génération de graphiques analytiques et courbes de prévision."],
            ["Seaborn", "0.13.0", "Visualisations statistiques avancées et matrices de corrélation."],

            ["Modélisation et conception"],
            ["Microsoft Power BI", "2024", "Conception et publication des tableaux de bord décisionnels interactifs pour l'atelier."],
            ["UML (OMG)", "2.5.1", "Langage de modélisation unifié pour l'architecture et la conception du système."]
          ],
          [2500, 1300, 4866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.2 : Outils et technologies utilisés", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("2.6 Conclusion"),
        conclusionBox("Ce chapitre a présenté le Sprint 0, posant les fondations conceptuelles, fonctionnelles et architecturales de la plateforme Nexora. La spécification détaillée des besoins par profil métier a permis de cerner avec précision les services attendus en atelier. L'architecture en quatre couches assure une séparation rigoureuse des responsabilités, garantissant la fluidité des requêtes DWH et l'évolutivité du moteur prédictif. Le choix d'une stack éprouvée (Spring Boot 3, FastAPI, Prophet, React Metronic 8, Power BI) garantit la pérennité de la solution. Le chapitre suivant détaille le Sprint 1, consacré au prétraitement des données du Data Warehouse et à la construction du pipeline ETL."),
        pageBreak(),
    '''

print("Chapter 2 module defined.")
