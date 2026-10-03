# -*- coding: utf-8 -*-
"""
Chapitre 2 : Sprint 0 : Analyse des besoins et Conception du Système pour Nexora (pfe.docx)
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
        body("Ce chapitre correspond au Sprint 0 de notre démarche Scrum. Cette étape initiale a pour objectif de formaliser les exigences du système **Nexora**, d'identifier les différents profils d'utilisateurs et leurs interactions avec la plateforme, de concevoir l'architecture globale en quatre couches et de définir l'environnement technique retenu pour le développement."),
        pb(),

        title2("2.2 Spécification des besoins"),
        body("La spécification des besoins permet de traduire les attentes des équipes d'atelier en fonctionnalités logicielles concrètes. Nous distinguons les besoins fonctionnels, qui précisent les services fournis par le système, des besoins non fonctionnels, qui définissent les critères de qualité technique."),
        pb(),

        title3("2.2.1 Besoins fonctionnels"),
        body("Les fonctionnalités attendues sont organisées selon les principaux profils d'utilisateurs :"),
        bullet("**Le Responsable de Production / Chef d'Atelier** : doit pouvoir visualiser l'état des 319 presses en temps réel, suivre le Taux de Rendement Global (TRG/OEE) global et par machine, analyser les principales causes d'arrêt (changement d'outillage, panne mécanique, attente matière) et consulter les prévisions de cadence à 7, 15 et 30 jours pour faciliter la planification des équipes."),
        bullet("**Le Gestionnaire des Stocks** : doit pouvoir consulter l'état des articles du catalogue, identifier rapidement les produits en situation de rupture ou en stock critique, vérifier la couverture restante en jours et obtenir des propositions de commande calculées pour maintenir un stock de sécurité suffisant."),
        bullet("**L'Opérateur d'Atelier** : doit pouvoir consulter les ordres de fabrication qui lui sont assignés et enregistrer les déclarations de fin de série ainsi que les quantités produites."),
        bullet("**L'Administrateur Système** : doit gérer les comptes utilisateurs, attribuer les droits d'accès aux différentes rubriques et s'assurer du bon fonctionnement des synchronisations de données."),
        bullet("**Le Data Warehouse (Système)** : fournit les données d'historique de stock et de fabrication nécessaires au calcul des indicateurs et à l'apprentissage des modèles."),
        pb(),

        title3("2.2.2 Besoins non fonctionnels"),
        body("Le tableau 2.1 récapitule les exigences non fonctionnelles retenues pour guider la conception de la solution :"),
        pb(),
        makeTable(
          ["Catégorie", "Exigence"],
          [
            ["Performance", "Temps de réponse rapide pour l'affichage du tableau de bord et des prévisions, sans latence perceptible par l'utilisateur."],
            ["Sécurité", "Authentification sécurisée, gestion des accès restreinte aux utilisateurs autorisés et protection des données sensibles."],
            ["Fiabilité", "Utilisation de données correctement nettoyées et de modèles évalués afin de garantir des résultats fiables."],
            ["Maintenabilité", "Code organisé de manière modulaire et documenté pour faciliter les évolutions futures."],
            ["Évolutivité", "Architecture permettant l'intégration de nouveaux modèles ou fonctionnalités sans modification majeure du système."],
            ["Ergonomie", "Interface intuitive et facile à prendre en main, y compris pour un utilisateur non technique."]
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
        body("L'analyse des cas d'utilisation met en évidence les acteurs intervenant sur le système :"),
        bullet("**1. Le Responsable de Production** : consulte la supervision des machines, le TRG et les prévisions de fabrication."),
        bullet("**2. Le Gestionnaire des Stocks** : exploite les indicateurs de rotation, les alertes de pénurie et les suggestions de réapprovisionnement."),
        bullet("**3. L'Opérateur d'Atelier** : déclare les quantités réalisées et signale les arrêts au poste de travail."),
        bullet("**4. L'Administrateur** : configure les utilisateurs, les rôles et supervise les flux techniques."),
        bullet("**5. Le Data Warehouse SQL Server** : assure la persistance des données consolidées et alimente les traitements décisionnels."),
        pb(),

        title3("2.3.2 Diagramme des cas d'utilisation global"),
        body("La figure 2.1 présente le diagramme de cas d'utilisation global, illustrant les interactions entre les acteurs et les grands modules du système :"),
        pb(),
        ...imageFigure("diagrams/global_usecase.png", "Figure 2.1 : Diagramme des cas d'utilisation global", 540, 310),
        body("Les relations d'inclusion illustrent les dépendances logiques : l'affichage des prévisions de fabrication s'appuie sur les données prétraitées par le pipeline ETL, tandis que la génération des alertes de stock découle directement de l'évaluation de la couverture en jours."),
        pb(),

        title2("2.4 Architecture globale du système"),
        body("Pour assurer la clarté et la modularité de la solution, l'architecture globale de Nexora est organisée en **quatre couches**, comme l'illustre la figure 2.2 :"),
        pb(),
        ...imageFigure("diagrams/arch_logique.png", "Figure 2.2 : Architecture globale du système décisionnel en quatre couches", 540, 260),
        bullet("**1. Couche Données (Data Layer)** : composée de l'entrepôt de données Microsoft SQL Server (dbDWH1). Elle centralise les tables de faits et de dimensions issues des opérations d'atelier (mouvements de stocks, cadences réelles, nomenclatures et en-cours)."),
        bullet("**2. Couche Traitement & ETL (Processing Layer)** : regroupe les scripts Python chargés d'extraire les données brutes, de corriger les anomalies (doublons, formats de date, scories de stock) et de structurer les tables analytiques."),
        bullet("**3. Couche Métier & IA (Business & AI Layer)** : intègre les services applicatifs en charge de la logique de calcul du TRG, de la classification des stocks et de l'exécution des modèles d'apprentissage automatique (Régression Linéaire, ARIMA, Random Forest, Prophet, Isolation Forest)."),
        bullet("**4. Couche Présentation (Presentation Layer)** : interface utilisateur web développée avec React.js pour la consultation quotidienne, complétée par des rapports Microsoft Power BI pour les analyses détaillées."),
        pb(),

        title2("2.5 Environnement de travail"),
        title3("2.5.1 Environnement matériel"),
        body("Les phases de préparation des données, d'entraînement des modèles et de développement ont été réalisées sur un ordinateur portable présentant les caractéristiques suivantes :"),
        bullet("**Processeur** : Intel Core i7-12700H (14 cœurs)."),
        bullet("**Mémoire vive (RAM)** : 16 Go DDR4."),
        bullet("**Stockage** : SSD NVMe de 512 Go."),
        bullet("**Système d'exploitation** : Microsoft Windows 11 (64 bits)."),
        pb(),

        title3("2.5.2 Environnement logiciel"),
        body("Le tableau 2.2 présente les principaux outils, langages et bibliothèques utilisés pour la réalisation du projet :"),
        pb(),
        makeTable(
          ["Outil / Technologie", "Version", "Rôle dans le projet"],
          [
            ["Environnement de développement"],
            ["Visual Studio Code", "1.104", "Éditeur de code pour le développement Python, React.js et les scripts ETL."],
            ["IntelliJ IDEA", "2024.1", "Environnement de développement pour le backend Spring Boot."],
            ["Git & GitHub", "2.52", "Gestion de versions et hébergement du code source du projet."],

            ["Base de données"],
            ["Microsoft SQL Server", "2022", "Système de gestion de base de données relationnelle hébergeant le Data Warehouse (dbDWH1)."],
            ["SSMS", "19.3", "Outil d'administration et de gestion des requêtes SQL Server."],

            ["Langages de programmation"],
            ["Python", "3.10", "Traitement des données (ETL), apprentissage automatique et calculs statistiques."],
            ["Java", "17", "Développement du serveur applicatif et des services backend."],
            ["TypeScript / JavaScript", "ES2022", "Développement de l'interface utilisateur web."],

            ["Frameworks et bibliothèques"],
            ["Spring Boot", "3.2", "Framework backend pour la gestion des services métiers et des points d'accès."],
            ["React.js", "18.2", "Bibliothèque frontend pour la création des vues de l'interface utilisateur."],
            ["Pandas & NumPy", "2.1 / 1.26", "Manipulation des données tabulaires et calculs numériques vectorisés."],
            ["Scikit-learn", "1.3", "Prétraitement, modélisation et détection d'anomalies (Isolation Forest)."],
            ["Prophet", "1.1", "Modélisation des séries temporelles pour la prévision de production."],
            ["Statsmodels", "0.14", "Modèle statistique ARIMA et tests de stationnarité."],
            ["Microsoft Power BI", "2024", "Création des rapports décisionnels interactifs pour les équipes d'atelier."]
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
        conclusionBox("Ce chapitre a présenté le Sprint 0 en posant les bases fonctionnelles et architecturales de la solution Nexora. L'analyse des besoins a permis de définir les attentes clés des utilisateurs d'atelier, tandis que l'architecture en quatre couches assure une organisation claire des différents composants. L'environnement technique retenu combine des outils stables et adaptés aux problématiques de Data Science et de développement web. Le chapitre suivant aborde le Sprint 1, consacré au nettoyage des données et à la mise en œuvre du pipeline ETL."),
        pageBreak(),
    '''

print("Chapter 2 module defined.")
