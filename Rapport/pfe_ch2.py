# -*- coding: utf-8 -*-
"""
Chapitre 2 : Sprint 0 : Analyse des besoins et Conception du Système pour Nexora (pfe_v2.docx)
Matches EXACT outline: 2.1 à 2.6
Style : Simple, académique, professionnel, sans jargon excessif.
"""

def get_chapter2():
    return '''
        // =========================================================
        // CHAPITRE 2 : SPRINT 0 : ANALYSE DES BESOINS ET CONCEPTION
        // =========================================================
        title1("Chapitre 2 : Sprint 0 : Analyse des besoins et Conception du Système"),

        title2("2.1 Introduction"),
        body("Ce chapitre correspond au Sprint 0 de notre démarche Scrum. Cette étape de cadrage initial a pour objectif de formaliser les exigences du système **Nexora**, d'identifier les profils d'utilisateurs et leurs interactions avec la plateforme, de concevoir l'architecture globale en quatre couches et de définir l'environnement technique retenu pour le développement."),
        pb(),

        title2("2.2 Spécification des besoins"),
        body("La spécification des besoins permet de traduire les attentes des équipes d'atelier en fonctionnalités logicielles concrètes. Nous distinguons les besoins fonctionnels, qui précisent les services fournis par le système, des besoins non fonctionnels, qui définissent les critères de qualité technique et de performance."),
        pb(),

        title3("2.2.1 Besoins fonctionnels"),
        body("Les fonctionnalités attendues sont organisées selon les deux profils d'utilisateurs du système :"),
        bullet("**L'Opérateur** : acteur d'atelier habilité à saisir les mouvements d'inventaire réels (entrées, sorties de matière, rebuts d'injection) et à consulter le statut des lignes de production."),
        bullet("**L'Administrateur** : superviseur d'atelier et responsable logistique. Il assure le pilotage opérationnel (supervision des 319 presses, planification des ordres de fabrication, suivi des composantes du TRG, consultation des prévisions d'IA à 7/15/30 jours) ainsi que l'administration technique (gestion des comptes et contrôle d'accès RBAC)."),
        pb(),

        title3("2.2.2 Besoins non fonctionnels"),
        body("Le tableau 2.1 récapitule les exigences non fonctionnelles retenues pour guider la conception de la solution :"),
        pb(),
        makeTable(
          ["Catégorie", "Exigence", "Critère de vérification"],
          [
            ["Performance", "Temps de réponse interactif inférieur à 2 secondes pour l'affichage des tableaux de bord et requêtes analytiques.", "Mesures de temps de réponse et fluidité des affichages."],
            ["Sécurité", "Authentification sécurisée par jetons JWT, gestion des rôles (RBAC) et traçabilité des accès.", "Contrôle des permissions Opérateur / Admin."],
            ["Fiabilité", "Données d'entrée assainies par le pipeline ETL et modèles de prévision rigoureusement validés.", "Zéro doublon résiduel dans le DWH et cohérence des résultats."],
            ["Maintenabilité", "Architecture modulaire découplée en 4 couches avec séparation nette entre ETL, modélisation et restitution.", "Code versionné et documenté."],
            ["Évolutivité", "Capacité d'intégrer ultérieurement des modèles de prévision par presse ou des capteurs IoT sans refonte.", "Schéma dimensionnel normalisé."],
            ["Ergonomie", "Tableaux de bord visuels intuitifs et interface web réactive adaptée aux postes d'atelier.", "Navigation fluide et lisibilité opérationnelle."]
          ],
          [2200, 4200, 2266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.1 : Les besoins non fonctionnels du système", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("2.3 Analyse des besoins"),
        title3("2.3.1 Identification des acteurs"),
        body("L'analyse des cas d'utilisation met en évidence deux acteurs intervenant sur la plateforme Nexora :"),
        bullet("**1. L'Opérateur** : acteur opérationnel en atelier, responsable de la saisie des mouvements de stock et du suivi d'avancement des ordres de fabrication."),
        bullet("**2. L'Administrateur** : acteur de gestion et de supervision, assurant le pilotage d'atelier (supervision des presses, consultation du TRG et des prévisions IA, gestion des alertes d'approvisionnement) ainsi que l'administration des accès."),
        pb(),

        title3("2.3.2 Diagramme des cas d'utilisation global"),
        body("La figure 2.1 présente le diagramme de cas d'utilisation global de la plateforme Nexora, illustrant les interactions entre les deux acteurs et les modules applicatifs :"),
        pb(),
        ...imageFigure("diagrams/global_usecase.png", "Figure 2.1 : Diagramme des cas d'utilisation global de Nexora", 500, 500),
        body("L'ensemble des cas d'utilisation intègre systématiquement la relation d'inclusion <<include>> avec l'opération « S'authentifier », garantissant un contrôle d'accès conforme aux privilèges de chaque acteur."),
        pb(),

        title2("2.4 Architecture globale du système"),
        body("Pour assurer la robustesse, la modularité et l'évolutivité de la solution, l'architecture globale de Nexora est structurée en **quatre couches logiques**, comme l'illustre la figure 2.2 :"),
        pb(),
        ...imageFigure("diagrams/arch_logique.png", "Figure 2.2 : Architecture globale du système décisionnel en quatre couches", 540, 260),
        bullet("**1. Couche Données (Data Layer)** : articulée autour de Microsoft SQL Server 2022 [16], elle héberge le Data Warehouse (DWH) modélisé en schéma en étoile (tables de dimensions pour les articles et presses, tables de faits pour la production, les stocks et les rebuts)."),
        bullet("**2. Couche Traitement & ETL (Processing Layer)** : développée en Python 3.10 [18] avec Pandas [19] et NumPy [20], elle orchestre l'ingestion automatisée, le dédoublonnage, la correction des 10 anomalies recensées et l'alimentation des tables analytiques."),
        bullet("**3. Couche Métier & IA (Business & AI Layer)** : regroupe les services d'apprentissage automatique (Régression Linéaire, ARIMA, Random Forest, Prophet [12] déployé en production pour les prévisions de cadence, et Isolation Forest [8] pour la détection d'anomalies) ainsi que le moteur logistique de calcul des couvertures de stock. Les prévisions générées sont automatiquement écrites dans la table `ml_production_predictions` du DWH. Cette couche intègre également un micro-service FastAPI [21] pour l'inférence et un serveur d'entreprise Spring Boot [17] pour la gestion des entités métiers et des utilisateurs."),
        bullet("**4. Couche Restitution & Présentation (Presentation Layer)** : propose une double modalité d'accès adaptée aux profils : d'une part, des tableaux de bord décisionnels interactifs sous Microsoft Power BI [24] connectés directement au DWH pour le pilotage stratégique ; d'autre part, un portail web réactif en React.js [22] et TypeScript [23] pour les saisies et consultations d'atelier."),
        pb(),

        title2("2.5 Environnement de travail"),
        title3("2.5.1 Environnement matériel"),
        body("Les phases de préparation des données, d'entraînement des modèles et de développement ont été réalisées sur une station de travail présentant les caractéristiques suivantes :"),
        bullet("**Processeur** : Intel Core i7-12700H (14 cœurs, 20 threads, fréquence de base 2,30 GHz jusqu'à 4,70 GHz en mode Turbo)."),
        bullet("**Mémoire vive (RAM)** : 16 Go DDR4 (3200 MHz)."),
        bullet("**Stockage** : Disque SSD NVMe PCIe 4.0 de 512 Go (débit de lecture séquentielle > 3 500 Mo/s)."),
        bullet("**Système d'exploitation** : Microsoft Windows 11 Professionnel (64 bits)."),
        pb(),

        title3("2.5.2 Environnement logiciel"),
        body("Le tableau 2.2 présente l'ensemble des outils, langages, bibliothèques et frameworks mobilisés pour la conception et l'implémentation de Nexora :"),
        pb(),
        makeTable(
          ["Catégorie", "Technologie / Outil", "Version", "Rôle et usage dans le projet"],
          [
            ["Développement", "Visual Studio Code", "1.104", "Éditeur principal pour les scripts Python ETL/ML et le code frontend React."],
            ["Développement", "IntelliJ IDEA", "2024.1", "Environnement de développement dédié au serveur backend Spring Boot."],
            ["Gestion de version", "Git & GitHub", "2.52", "Gestion des versions du code source et traçabilité des livrables."],

            ["Stockage de données", "Microsoft SQL Server", "2022", "Système de gestion de base de données relationnelle hébergeant le Data Warehouse [16]."],
            ["Stockage de données", "SQL Server Management Studio", "19.3", "Administration des bases, exécution des requêtes SQL et optimisation des index."],

            ["Langages", "Python", "3.10", "Langage principal pour le pipeline ETL, l'ingénierie des variables et les modèles d'IA [18]."],
            ["Langages", "Java", "17 (LTS)", "Langage orienté objet pour les services backend Spring Boot."],
            ["Langages", "TypeScript / JavaScript", "5.2 / ES2022", "Développement typé du frontend web React [23]."],

            ["Services & Backend", "Spring Boot", "3.2", "Framework backend assurant la sécurité JWT, le modèle de données JPA et les API REST [17]."],
            ["Services & Backend", "FastAPI", "0.115", "Micro-service Python asynchrone pour l'inférence des modèles ML avec mise à jour périodique [21]."],

            ["Frontend Web", "React.js", "18.2", "Bibliothèque d'interfaces graphiques composables pour le portail atelier [22]."],

            ["Data Science & ML", "Pandas & NumPy", "2.1 / 1.26", "Manipulation des séries tabulaires et calculs vectorisés [19, 20]."],
            ["Data Science & ML", "Prophet", "1.1", "Modèle déployé en production (prévisions de cadence et stocks, décomposition saisonnière) [12]."],
            ["Data Science & ML", "Scikit-Learn", "1.3", "Normalisation, Random Forest (benchmark récursif), Régression et Isolation Forest [11]."],
            ["Data Science & ML", "Statsmodels", "0.14", "Modèle statistique ARIMA et tests de stationnarité (ADF) [10]."],

            ["Business Intelligence", "Microsoft Power BI Desktop", "2024", "Conception des rapports décisionnels interactifs et modélisation DAX [24]."]
          ],
          [2000, 2400, 1200, 3066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.2 : Outils, langages et bibliothèques logiciels utilisés", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("2.6 Conclusion"),
        conclusionBox("Ce chapitre a formalisé le cadre fonctionnel et technique du système Nexora issu du Sprint 0. Nous avons identifié les exigences des deux acteurs d'atelier, établi l'architecture modulaire en quatre couches et sélectionné un écosystème technologique robuste combinant SQL Server, Python, Spring Boot, FastAPI, React et Power BI. Le chapitre suivant aborde le Sprint 1, dédié au nettoyage des données et au développement du pipeline ETL."),
        pageBreak(),
    '''

print("Chapter 2 module defined.")
