# -*- coding: utf-8 -*-
"""
Master generator script: generate_build_pfe.py
Assembles build_pfe.js and executes it to produce pfe.docx
"""

import os
import sys
import subprocess
import shutil

from pfe_intro_concl import get_intro, get_concl_biblio
from pfe_ch1 import get_chapter1
from pfe_ch2 import get_chapter2
from pfe_ch3 import get_chapter3
from pfe_ch4 import get_chapter4
from pfe_ch5 import get_chapter5
from pfe_ch6 import get_chapter6

def get_preliminaries():
    return '''
    // SECTION 1 : PAGE DE GARDE VIDE (POUR INSERTION LIBRE OU MODÈLE FSM)
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 }
        }
      },
      footers: { default: new Footer({ children: [] }) },
      headers: { default: new Header({ children: [] }) },
      children: [
        new Paragraph({ children: [new TextRun({ text: "" })], spacing: { before: 0, after: 0 } })
      ]
    },

    // SECTION 2 : PAGES PRÉLIMINAIRES (NUMÉROTATION ROMAINE)
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
          pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN }
        }
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Nexora — Rapport de Projet de Fin d'Études", font: FONT, size: 18, color: GRAY }),
                new TextRun({ children: [new Tab()], font: FONT, size: 18 }),
                new TextRun({ text: "Page ", font: FONT, size: 18, color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: GRAY }),
              ],
              alignment: AlignmentType.LEFT,
              tabStops: [{ type: TabStopType.RIGHT, position: 8666 }],
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
            })
          ]
        })
      },
      children: [
        // DÉDICACE
        frontTitle("Dédicace"),
        body("À mes très chers parents,", { align: AlignmentType.CENTER, bold: true }),
        body("Aucun hommage ne saurait exprimer l'immensité de l'amour, des sacrifices et de la bienveillance dont vous ne cessez de m'entourer. Que Dieu vous accorde santé, quiétude et longue vie. Je vous dédie ce travail en témoignage d'une infinie reconnaissance et d'une affection indéfectible.", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("À ma sœur, mon frère,", { align: AlignmentType.CENTER, bold: true }),
        body("Pour votre soutien constant, vos encouragements chaleureux et votre présence réconfortante à chaque étape de mon cursus. Je vous souhaite un avenir resplendissant, couronné de succès et de félicité.", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("À mes chers amis et camarades de promotion,", { align: AlignmentType.CENTER, bold: true }),
        body("Avec qui j'ai partagé les moments de doute, les défis intellectuels et les joies de la réussite. Votre esprit d'équipe et votre fidélité ont rendu ce parcours mémorable.", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("À tous ceux qui me sont chers, merci.", { align: AlignmentType.CENTER, bold: true }),
        pageBreak(),

        // REMERCIEMENTS
        frontTitle("Remerciements"),
        body("Tout d'abord, je remercie Allah le Tout-Puissant de m'avoir accordé la force, la patience et la persévérance nécessaires pour mener à bien ce travail de fin d'études."),
        pb(),
        body("Je tiens à exprimer ma profonde gratitude à mon encadrant universitaire pour ses précieux conseils, sa rigueur scientifique et sa disponibilité exemplaire tout au long de ce projet. Sa clairvoyance et la qualité de ses orientations ont grandement contribué à la structuration et à l'aboutissement de ce mémoire."),
        pb(),
        body("J'adresse également mes plus vifs remerciements à mon encadrant en entreprise pour son encadrement technique rigoureux, son écoute bienveillante et ses retours critiques hautement formateurs. Son accompagnement lors de l'intégration des flux de production et des architectures de données a été déterminant."),
        pb(),
        body("J'exprime toute ma reconnaissance aux membres du jury pour l'honneur qu'ils me font en acceptant d'évaluer ce travail de recherche et d'ingénierie logicielle."),
        pb(),
        body("Je tiens à remercier chaleureusement la Faculté des Sciences de Monastir, ainsi que l'ensemble du corps professoral du Master Data Science, pour la qualité de l'enseignement dispensé durant ces deux années de formation d'excellence."),
        pb(),
        body("Mes remerciements s'étendent enfin aux équipes d'ingénierie et d'atelier des sites industriels de Kondar, Sousse et Brno pour leur accueil et leur collaboration précieuse lors des phases de recueil des besoins et de validation terrain."),
        pageBreak(),

        // RÉSUMÉ FR
        frontTitle("Résumé"),
        body("Dans le secteur concurrentiel de la plasturgie automobile (équipementier Tier-1), la maîtrise des cadences de fabrication et la gestion proactive des approvisionnements de matières premières constituent des leviers déterminants de rentabilité. Face à la dispersion des données d'atelier issues de 319 presses à injecter réparties sur trois sites industriels (Kondar et Sousse en Tunisie, Brno en République Tchèque), ce projet de fin d'études présente la conception et le déploiement de **Nexora**, une plateforme décisionnelle et opérationnelle d'aide au pilotage industriel."),
        pb(),
        body("Alimentée par un entrepôt de données (Data Warehouse) sous Microsoft SQL Server consolidant 32 043 enregistrements validés après assainissement par un pipeline ETL automatisé (schéma en étoile), la solution s'articule autour de trois modules complémentaires : un module prédictif comparant quatre modèles d'apprentissage automatique et de séries temporelles (Régression Linéaire, ARIMA, Random Forest et Prophet), où Random Forest et Prophet atteignent tous deux une précision moyenne satisfaisante (erreurs MAPE d'environ 6 % à 7 %), Random Forest offrant une précision ponctuelle élevée et Prophet assurant le déploiement opérationnel grâce à sa modélisation native des composantes calendaires et son intégration directe dans la base de données ; un module de détection non supervisée des anomalies de cadence par Isolation Forest ; un module de gestion des stocks structuré par une segmentation multicritère Pareto ABC / K-Means et une règle de réapprovisionnement à horizon cible de 45 jours chiffrant l'enveloppe prioritaire pour 193 références en risque à environ 380 400 TND (sur un catalogue totalisant 14,31 M TND de valeur annuelle consommée) ; et une restitution adaptée aux rôles de l'entreprise via des tableaux de bord interactifs Microsoft Power BI pour le management et un portail web opérationnel React / Spring Boot pour les équipes d'atelier."),
        pb(),
        body("La solution a été validée par des scénarios de test fonctionnels et d'intégration, apportant une visibilité structurée sur le Taux de Rendement Global (TRG moyen de 71,4 %) et sécurisant l'approvisionnement des lignes d'assemblage."),
        pb(),
        bold_body("Mots-clés :"),
        body("Système décisionnel, Industrie 4.0, Plasturgie Automobile, Taux de Rendement Global (TRG), Séries Temporelles, Random Forest, Prophet, Isolation Forest, K-Means, Pipeline ETL, Data Warehouse, SQL Server, Power BI, Spring Boot, React.js."),
        pageBreak(),

        // ABSTRACT EN
        frontTitle("Abstract"),
        body("In the highly demanding automotive plastics manufacturing sector (Tier-1 supplier), controlling production throughput and proactively managing raw material replenishment are decisive factors for operational efficiency. Addressing data dispersion across 319 injection moulding machines located across three industrial plants (Kondar and Sousse in Tunisia, Brno in the Czech Republic), this Master's thesis presents the design and deployment of **Nexora**, an intelligent decision-support and operational platform."),
        pb(),
        body("Built upon a Microsoft SQL Server Data Warehouse consolidating 32,043 validated inventory and transaction records structured in a star schema after automated ETL sanitization, the platform integrates three core modules: a forecasting engine evaluating four machine learning and time series models (Linear Regression, ARIMA, Random Forest, and Prophet), in which Random Forest and Prophet both achieve competitive average accuracy (~6% to 7% MAPE), with Random Forest providing high point precision and Prophet deployed in production for its explainability and native handling of industrial calendar effects; an unsupervised anomaly detection module using Isolation Forest; an intelligent inventory management module based on Pareto ABC / K-Means multi-criteria segmentation and a 45-day replenishment formula budgeting 193 critical references at approximately 380,400 TND (out of a catalog accounting for 14.31 M TND in annual consumption); and a dual-interface architecture featuring interactive Microsoft Power BI dashboards for executive monitoring and a reactive React / Spring Boot web portal for shop-floor operators."),
        pb(),
        body("The platform has been validated through functional and integration test scenarios, delivering structured visibility over Overall Equipment Effectiveness (mean OEE of 71.4%) and securing material availability for manufacturing lines."),
        pb(),
        bold_body("Keywords :"),
        body("Decision Support System, Industry 4.0, Automotive Plastics, Overall Equipment Effectiveness (OEE), Time Series Forecasting, Random Forest, Prophet, Isolation Forest, K-Means, ETL Pipeline, Data Warehouse, SQL Server, Power BI, Spring Boot, React.js."),
        pageBreak(),

        // TABLE DES MATIÈRES
        frontTitle("Table des matières"),
        tocLine("Introduction générale", 0, "1"),
        pb(),
        tocLine("1 Contexte et cadre du projet", 0, "3"),
        tocLine("1.1 Introduction", 1, "4"),
        tocLine("1.2 Contexte académique", 1, "4"),
        tocLine("1.3 Présentation de l'organisme d'accueil", 1, "4"),
        tocLine("1.3.1 Présentation de l'entreprise", 2, "4"),
        tocLine("1.3.2 Domaines d'activité et contexte client", 2, "5"),
        tocLine("1.4 Présentation de la plateforme Nexora", 1, "5"),
        tocLine("1.4.1 Présentation générale", 2, "5"),
        tocLine("1.4.2 Fonctionnalités principales", 2, "6"),
        tocLine("1.4.3 Limites de la situation actuelle", 2, "6"),
        tocLine("1.5 Présentation du projet", 1, "7"),
        tocLine("1.5.1 Contexte et problématique", 2, "7"),
        tocLine("1.5.2 Étude de l'existant", 2, "7"),
        tocLine("1.5.3 Solution proposée", 2, "8"),
        tocLine("1.6 Workflow complet du projet", 1, "9"),
        tocLine("1.7 Méthodologie de développement", 1, "10"),
        tocLine("1.7.1 Étude comparative des méthodes", 2, "10"),
        tocLine("1.7.2 Choix méthodologique : Scrum", 2, "11"),
        tocLine("1.7.3 Organisation des rôles Scrum", 2, "12"),
        tocLine("1.7.4 Product Backlog", 2, "12"),
        tocLine("1.7.5 Planification des sprints", 2, "13"),
        tocLine("1.8 Langage de modélisation UML", 1, "14"),
        tocLine("1.9 Conclusion", 1, "14"),
        pb(),
        tocLine("2 Sprint 0 : Analyse des besoins et Conception du Système", 0, "15"),
        tocLine("2.1 Introduction", 1, "16"),
        tocLine("2.2 Spécification des besoins", 1, "16"),
        tocLine("2.2.1 Besoins fonctionnels", 2, "16"),
        tocLine("2.2.2 Besoins non fonctionnels", 2, "17"),
        tocLine("2.3 Analyse des besoins", 1, "17"),
        tocLine("2.3.1 Identification des acteurs", 2, "17"),
        tocLine("2.3.2 Diagramme des cas d'utilisation global", 2, "18"),
        tocLine("2.4 Architecture globale du système", 1, "19"),
        tocLine("2.5 Environnement de travail", 1, "20"),
        tocLine("2.5.1 Environnement matériel", 2, "20"),
        tocLine("2.5.2 Environnement logiciel", 2, "20"),
        tocLine("2.6 Conclusion", 1, "22"),
        pb(),
        tocLine("3 Sprint 1 : Prétraitement des données, assainissement de la qualité et pipeline ETL", 0, "23"),
        tocLine("3.1 Introduction", 1, "24"),
        tocLine("3.2 Backlog du Sprint 1", 1, "24"),
        tocLine("3.3 Présentation des données", 1, "24"),
        tocLine("3.3.1 Source des données", 2, "24"),
        tocLine("3.3.2 Description des tables principales du Data Warehouse", 2, "25"),
        tocLine("3.3.3 Modélisation dimensionnelle", 2, "25"),
        tocLine("3.4 Analyse exploratoire des données (EDA)", 1, "26"),
        tocLine("3.4.1 Analyse statistique de la production", 2, "27"),
        tocLine("3.4.2 Visualisation des séries temporelles", 2, "27"),
        tocLine("3.5 Conception et réalisation du pipeline ETL", 1, "29"),
        tocLine("3.5.1 Architecture du pipeline ETL", 2, "29"),
        tocLine("3.5.2 Extraction des données", 2, "31"),
        tocLine("3.5.3 Transformation et traitement des anomalies", 2, "32"),
        tocLine("3.5.4 Chargement dans le Data Warehouse", 2, "33"),
        tocLine("3.6 Résultats du pipeline ETL", 1, "34"),
        tocLine("3.7 Bilan du Sprint 1", 1, "34"),
        tocLine("3.8 Conclusion", 1, "35"),
        pb(),
        tocLine("4 Sprint 2 : Développement du module de gestion intelligente des stocks", 0, "36"),
        tocLine("4.1 Introduction", 1, "37"),
        tocLine("4.2 Backlog du Sprint 2", 1, "37"),
        tocLine("4.3 Architecture du module de gestion des stocks", 1, "37"),
        tocLine("4.4 Analyse des niveaux de stock et indicateurs de rotation", 1, "38"),
        tocLine("4.5 Classification et segmentation des produits", 1, "39"),
        tocLine("4.5.1 Segmentation multicritère Pareto ABC et Clustering K-Means", 2, "39"),
        tocLine("4.5.2 Classification opérationnelle par niveau de risque", 2, "39"),
        tocLine("4.6 Génération des recommandations et chiffrage budgétaire", 1, "40"),
        tocLine("4.6.1 Algorithme de réapprovisionnement à horizon cible de 45 jours", 2, "40"),
        tocLine("4.6.2 Estimation du budget d'approvisionnement", 2, "40"),
        tocLine("4.6.3 Hiérarchisation des alertes d'atelier", 2, "40"),
        tocLine("4.7 Résultats obtenus", 1, "41"),
        tocLine("4.8 Bilan du Sprint 2", 1, "42"),
        tocLine("4.9 Conclusion", 1, "43"),
        pb(),
        tocLine("5 Sprint 3 : Modélisation prédictive par Intelligence Artificielle", 0, "45"),
        tocLine("5.1 Introduction", 1, "46"),
        tocLine("5.2 Backlog du Sprint 3", 1, "46"),
        tocLine("5.3 Architecture du module de modélisation prédictive", 1, "47"),
        tocLine("5.4 Préparation des données et variables explicatives", 1, "47"),
        tocLine("5.4.1 Variable cible et transformation logarithmique", 2, "47"),
        tocLine("5.4.2 Variables explicatives et facteurs d'événements", 2, "48"),
        tocLine("5.4.3 Découpage chronologique du jeu de données", 2, "48"),
        tocLine("5.5 Métriques d'évaluation de la performance", 1, "49"),
        tocLine("5.6 Développement des modèles d'intelligence artificielle", 1, "50"),
        tocLine("5.6.1 Régression Linéaire Multiple", 2, "50"),
        tocLine("5.6.2 Modèle ARIMA", 2, "51"),
        tocLine("5.6.3 Modèle Random Forest Regressor", 2, "52"),
        tocLine("5.6.4 Modèle Prophet (Meta)", 2, "53"),
        tocLine("5.7 Résultats comparatifs et évaluation multi-horizons", 1, "54"),
        tocLine("5.8 Détection des anomalies par Isolation Forest", 1, "55"),
        tocLine("5.9 Rôles respectifs des modèles dans la plateforme Nexora", 1, "56"),
        tocLine("5.10 Bilan du Sprint 3", 1, "57"),
        tocLine("5.11 Conclusion", 1, "58"),
        pb(),
        tocLine("6 Sprint 4 : Développement du tableau de bord décisionnel et validation", 0, "59"),
        tocLine("6.1 Introduction", 1, "58"),
        tocLine("6.2 Backlog du Sprint 4", 1, "58"),
        tocLine("6.3 Architecture du tableau de bord et intégration applicative", 1, "59"),
        tocLine("6.4 Diagramme de séquence", 1, "60"),
        tocLine("6.5 Conception des rapports décisionnels Power BI", 1, "61"),
        tocLine("6.5.1 Tableau de bord de supervision et TRG", 2, "61"),
        tocLine("6.5.2 Tableau de bord des prévisions de cadence", 2, "61"),
        tocLine("6.5.3 Tableau de bord de gestion des stocks", 2, "62"),
        tocLine("6.6 Présentation des interfaces réalisées", 1, "63"),
        tocLine("6.6.1 Tableau de bord principal", 2, "63"),
        tocLine("6.6.2 Supervision de la production et TRG", 2, "63"),
        tocLine("6.6.3 Prévisions de cadence d'atelier", 2, "64"),
        tocLine("6.6.4 Pilotage des stocks et alertes d'approvisionnement", 2, "65"),
        tocLine("6.6.5 Portail web opérationnel React & Spring Boot", 2, "65"),
        tocLine("6.7 Tests et validation", 1, "66"),
        tocLine("6.7.1 Tests fonctionnels et d'intégration", 2, "66"),
        tocLine("6.7.2 Validation des prévisions d'atelier", 2, "67"),
        tocLine("6.7.3 Validation des règles d'approvisionnement", 2, "67"),
        tocLine("6.8 Bilan du Sprint 4", 1, "68"),
        tocLine("6.9 Conclusion", 1, "68"),
        pb(),
        tocLine("Conclusion générale et perspectives", 0, "69"),
        tocLine("Bibliographie", 0, "72"),
        pageBreak(),

        // TABLE DES FIGURES
        frontTitle("Table des figures"),
        tocLine("Figure 1.1 : Logo de la plateforme Nexora", 1, "6"),
        tocLine("Figure 1.2 : Workflow complet du système décisionnel Nexora", 1, "9"),
        tocLine("Figure 1.3 : Cycle itératif de la méthodologie Agile Scrum", 1, "12"),
        tocLine("Figure 2.1 : Diagramme des cas d'utilisation global de Nexora", 1, "18"),
        tocLine("Figure 2.2 : Architecture globale du système décisionnel en quatre couches", 1, "19"),
        tocLine("Figure 3.1 : Modélisation dimensionnelle en étoile du Data Warehouse Nexora", 1, "26"),
        tocLine("Figure 3.2 : Évolution temporelle de la production globale des 319 presses (2024–2026)", 1, "28"),
        tocLine("Figure 3.3 : Profils de saisonnalité de production par jour de semaine et par mois", 1, "28"),
        tocLine("Figure 3.4 : Heatmap d'activité atelier : cadence selon le mois et le jour de semaine", 1, "29"),
        tocLine("Figure 3.5 : Architecture et flux séquentiel du pipeline ETL", 1, "30"),
        tocLine("Figure 3.6 : Diagramme de séquence du pipeline ETL d'atelier", 1, "31"),
        tocLine("Figure 4.1 : Architecture et flux de traitement du module de gestion des stocks", 1, "37"),
        tocLine("Figure 4.2 : Segmentation multicritère Pareto ABC et Clustering K-Means des stocks", 1, "41"),
        tocLine("Figure 4.3 : Répartition des alertes de rupture et de stock critique par famille de matière", 1, "42"),
        tocLine("Figure 5.1 : Architecture et flux de traitement du module d'IA de Nexora", 1, "47"),
        tocLine("Figure 5.2 : Trajectoire des prédictions Prophet face à la production réelle d'atelier", 1, "52"),
        tocLine("Figure 5.3 : Détection non supervisée des anomalies de cadence par Isolation Forest", 1, "53"),
        tocLine("Figure 6.1 : Architecture globale d'intégration et de déploiement de Nexora", 1, "60"),
        tocLine("Figure 6.2 : Diagramme de séquence des échanges entre l'utilisateur, l'interface et le DWH", 1, "61"),
        tocLine("Figure 6.3 : Vue d'ensemble du tableau de bord décisionnel Power BI Nexora", 1, "64"),
        tocLine("Figure 6.4 : Interface « Supervision de la production et TRG »", 1, "64"),
        tocLine("Figure 6.5 : Répartition des volumes d'injection par famille de pièces", 1, "65"),
        tocLine("Figure 6.6 : Rapport Power BI « Prévision des cadences et charge atelier »", 1, "65"),
        tocLine("Figure 6.7 : Rapport Power BI « Gestion des stocks d'atelier et alertes »", 1, "66"),
        pageBreak(),

        // LISTE DES TABLEAUX
        frontTitle("Liste des tableaux"),
        tocLine("Tableau 1.1 : Fiche d'identité de Maps-IT", 1, "5"),
        tocLine("Tableau 1.2 : Positionnement comparatif des solutions existantes avec Nexora", 1, "9"),
        tocLine("Tableau 1.3 : Comparaison entre approche classique et approche agile", 1, "10"),
        tocLine("Tableau 1.4 : Avantages et inconvénients des méthodologies", 1, "11"),
        tocLine("Tableau 1.5 : Product Backlog priorisé du projet", 1, "13"),
        tocLine("Tableau 1.6 : Planification des sprints du projet", 1, "14"),
        tocLine("Tableau 2.1 : Les besoins non fonctionnels du système", 1, "17"),
        tocLine("Tableau 2.2 : Outils, langages et bibliothèques logiciels utilisés", 1, "21"),
        tocLine("Tableau 3.1 : Priorisation des tâches pour le Sprint 1", 1, "24"),
        tocLine("Tableau 3.2 : Périmètre quantitatif des données industrielles du projet", 1, "25"),
        tocLine("Tableau 3.3 : Tables principales du Data Warehouse en schéma en étoile", 1, "25"),
        tocLine("Tableau 3.4 : Statistiques descriptives de la série journalière de production d'atelier", 1, "27"),
        tocLine("Tableau 3.5 : Impact des événements et variations industrielles sur la cadence", 1, "27"),
        tocLine("Tableau 3.6 : Bilan quantitatif de la qualité des données (Waterfall ETL)", 1, "32"),
        tocLine("Tableau 3.7 : Résultats quantitatifs et techniques du pipeline ETL", 1, "34"),
        tocLine("Tableau 3.8 : Bilan des livrables du Sprint 1", 1, "35"),
        tocLine("Tableau 4.1 : Priorisation des tâches pour le Sprint 2", 1, "37"),
        tocLine("Tableau 4.2 : Classification des produits selon le niveau de couverture disponible", 1, "39"),
        tocLine("Tableau 4.3 : Bilan des livrables du Sprint 2", 1, "42"),
        tocLine("Tableau 5.1 : Priorisation des tâches pour le Sprint 3", 1, "46"),
        tocLine("Tableau 5.2 : Les 14 variables explicatives du modèle de cadence", 1, "48"),
        tocLine("Tableau 5.3 : Découpage chronologique du jeu de données", 1, "49"),
        tocLine("Tableau 5.4 : Avantages et limites : Régression Linéaire", 1, "50"),
        tocLine("Tableau 5.5 : Avantages et limites : Modèle ARIMA", 1, "51"),
        tocLine("Tableau 5.6 : Avantages et limites : Random Forest", 1, "52"),
        tocLine("Tableau 5.7 : Avantages et limites : Prophet", 1, "53"),
        tocLine("Tableau 5.8 : Synthèse des performances prédictives aux horizons 7, 15 et 30 jours", 1, "54"),
        tocLine("Tableau 5.9 : Bilan des livrables du Sprint 3", 1, "57"),
        tocLine("Tableau 6.1 : Priorisation des tâches pour le Sprint 4", 1, "58"),
        tocLine("Tableau 6.2 : Synthèse des services REST de l'application web", 1, "65"),
        tocLine("Tableau 6.3 : Bilan des tests fonctionnels et d'intégration", 1, "66"),
        tocLine("Tableau 6.4 : Bilan des livrables du Sprint 4", 1, "68"),
        pageBreak(),

        // LISTE DES ABRÉVIATIONS
        frontTitle("Liste des abréviations"),
        makeTable(
          ["Abréviation", "Signification en Français", "Définition / Contexte Industriel"],
          [
            ["API", "Application Programming Interface", "Interface de programmation applicative pour l'échange de données inter-services"],
            ["ARIMA", "AutoRegressive Integrated Moving Average", "Modèle statistique autorégressif intégré pour séries temporelles"],
            ["BI", "Business Intelligence", "Informatique décisionnelle pour l'aide au pilotage et au reporting exécutif"],
            ["CV", "Cross-Validation (Validation Croisée)", "Méthode d'évaluation statistique par partitionnement chronologique des données"],
            ["DAX", "Data Analysis Expressions", "Langage de formules et de calculs analytiques utilisé dans Microsoft Power BI"],
            ["DWH", "Data Warehouse", "Entrepôt de données consolidant les flux industriels multi-sites (Tunisie, Rép. Tchèque)"],
            ["ERP", "Enterprise Resource Planning", "Progiciel de gestion intégré de l'entreprise (Microsoft Dynamics NAV)"],
            ["ETL", "Extract, Transform, Load", "Pipeline d'extraction, assainissement, enrichissement et chargement des données"],
            ["IA", "Intelligence Artificielle", "Ensemble des techniques et algorithmes d'apprentissage automatique"],
            ["JWT", "JSON Web Token", "Standard sécurisé pour l'authentification et l'échange de jetons de session"],
            ["KPI", "Key Performance Indicator", "Indicateur clé de performance opérationnelle et industrielle"],
            ["MAE", "Mean Absolute Error", "Erreur absolue moyenne exprimée en nombre réel de pièces par jour"],
            ["MAPE", "Mean Absolute Percentage Error", "Pourcentage moyen d'erreur absolue par rapport au volume réel"],
            ["MES", "Manufacturing Execution System", "Système de pilotage et d'exécution des ateliers de fabrication"],
            ["ML", "Machine Learning", "Apprentissage automatique supervisé et non supervisé"],
            ["OEE", "Overall Equipment Effectiveness", "Équivalent international du Taux de Rendement Global (TRG)"],
            ["RBAC", "Role-Based Access Control", "Contrôle d'accès aux fonctionnalités fondé sur les rôles (Opérateur, Administrateur)"],
            ["REST", "Representational State Transfer", "Style d'architecture logicielle pour les services web distribués"],
            ["RF", "Random Forest Regressor", "Algorithme d'apprentissage supervisé par forêt d'arbres de décision"],
            ["RMSE", "Root Mean Square Error", "Racine carrée de l'erreur quadratique moyenne pénalisant les grands écarts"],
            ["SQL", "Structured Query Language", "Langage de requêtage relationnel (Microsoft SQL Server)"],
            ["TND", "Dinar Tunisien", "Unité monétaire légale pour la valorisation financière des stocks"],
            ["TRG", "Taux de Rendement Global", "Indicateur normé synthétisant Disponibilité, Performance et Qualité machine"],
            ["UML", "Unified Modeling Language", "Langage universel de modélisation visuelle des systèmes logiciels"]
          ],
          [1600, 3600, 3466]
        ),
        pageBreak(),
      ]
    },
    '''

def assemble_file():
    out_file = os.path.join(os.path.dirname(__file__), "build_pfe.js")
    print(f"Generating {out_file}...")

    with open(out_file, "w", encoding="utf-8") as f:
        # Header & helpers
        f.write('''const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, HeightRule, PageBreak, LevelFormat,
  Header, Footer, Tab, TabStopType, ImageRun, NumberFormat,
  ExternalHyperlink
} = require('docx');
const fs = require('fs');
const path = require('path');

// --- PALETTE & STYLES ---
const NAVY = "000000";
const BLUE = "000000";
const LIGHT = "F0F0F0";
const WHITE = "FFFFFF";
const BLACK = "000000";
const GRAY = "595959";
const DARK = "333333";
const FONT = "Times New Roman";
const FONT2 = "Arial";

// --- FORMATTING HELPERS ---
const pb = () => new Paragraph({ children: [new TextRun({ text: "" })], spacing: { before: 40, after: 40 } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } });

const frontTitle = (text) => new Paragraph({
  children: [new TextRun({ text: text.toUpperCase(), font: FONT, size: 36, bold: true, color: BLACK })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 360, after: 80 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DARK, space: 4 } },
});

const title1 = (text, pageBreakBefore = true) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: FONT, bold: true, color: NAVY, size: 34, allCaps: true })],
  spacing: { before: 260, after: 140 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
  outlineLevel: 0,
  pageBreakBefore,
});

const title2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: FONT, bold: true, color: BLUE, size: 28 })],
  spacing: { before: 200, after: 90 },
  outlineLevel: 1,
});

const title3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, font: FONT, bold: true, color: NAVY, size: 24 })],
  spacing: { before: 140, after: 70 },
  outlineLevel: 2,
});

const parseMarkdown = (text, opts = {}) => {
  const parts = text.split('*');
  return parts.map((part, index) => {
    const isItalic = opts.italics !== undefined ? opts.italics : (index % 2 === 1);
    return new TextRun({
      text: part,
      font: opts.font || FONT,
      size: opts.size || 24,
      color: opts.color || (opts.font === FONT2 ? undefined : "1A1A1A"),
      italics: isItalic,
      bold: opts.bold || false
    });
  });
};

const body = (text, opts = {}) => {
  if (typeof text === 'object' && text !== null && text.text) {
    opts = { ...opts, ...text.opts };
    text = text.text;
  }
  return new Paragraph({
    children: parseMarkdown(text, opts),
    spacing: { before: 60, after: 60, line: 360, lineRule: "auto" },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    indent: opts.indent ? { left: opts.indent } : undefined,
  });
};

const bold_body = (text) => new Paragraph({
  children: parseMarkdown(text, { bold: true }),
  spacing: { before: 60, after: 60, line: 360, lineRule: "auto" },
  alignment: AlignmentType.JUSTIFIED,
});

const bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  children: parseMarkdown(text),
  spacing: { before: 50, after: 50, line: 340, lineRule: "auto" },
});

const linkBullet = (textBefore, url, textAfter = "") => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  children: [
    new TextRun({ text: textBefore, font: FONT, size: 22 }),
    new ExternalHyperlink({
      children: [new TextRun({ text: url, font: FONT, size: 22, color: "0056B3", underline: true })],
      link: url,
    }),
    ...(textAfter ? [new TextRun({ text: textAfter, font: FONT, size: 22 })] : []),
  ],
  spacing: { before: 50, after: 50, line: 340, lineRule: "auto" },
});

const conclusionBox = (text) => new Paragraph({
  children: parseMarkdown(text),
  spacing: { before: 140, after: 140, line: 360, lineRule: "auto" },
  alignment: AlignmentType.JUSTIFIED,
});

const border = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const borders = { top: border, bottom: border, left: border, right: border };

const makeTable = (headers, rows, colWidths) => {
  const targetTotalW = 8666;
  const originalTotalW = colWidths.reduce((a, b) => a + b, 0);
  const scaledColWidths = colWidths.map(w => Math.round((w / originalTotalW) * targetTotalW));

  return new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: scaledColWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          borders,
          width: { size: scaledColWidths[i], type: WidthType.DXA },
          shading: { fill: DARK, type: ShadingType.CLEAR },
          margins: { top: 50, bottom: 50, left: 80, right: 80 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            children: [new TextRun({ text: h, font: FONT2, size: 19, bold: true, color: WHITE })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 20 },
          })],
        }))
      }),
      ...rows.map((row, ri) => {
        if (row.length === 1) {
          const sectionTitle = String(row[0]);
          return new TableRow({
            children: [
              new TableCell({
                borders,
                columnSpan: headers.length,
                width: { size: targetTotalW, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 50, bottom: 50, left: 80, right: 80 },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({
                  children: [new TextRun({ text: sectionTitle, font: FONT2, size: 19, bold: true, color: "000000" })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 30, after: 30 },
                })],
              })
            ]
          });
        }
        const isChampion = row.some(c => String(c).includes('★'));
        return new TableRow({
          children: row.map((cell, ci) => {
            const cellStr = String(cell);
            const isLong = cellStr.length > 35;
            return new TableCell({
              borders,
              width: { size: scaledColWidths[ci], type: WidthType.DXA },
              shading: { fill: isChampion ? "E2F0D9" : (ri % 2 === 0 ? "F9FBFD" : WHITE), type: ShadingType.CLEAR },
              margins: { top: 40, bottom: 40, left: 80, right: 80 },
              children: [new Paragraph({
                children: parseMarkdown(cellStr, { font: FONT2, size: 18 }),
                alignment: (ci === 0 || isLong) ? AlignmentType.LEFT : AlignmentType.CENTER,
                spacing: { before: 20, after: 20, line: 240, lineRule: "auto" },
              })],
            });
          })
        });
      })
    ]
  });
};

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

const makeProsConsTable = (tableNum, modelName, pros, cons) => {
  const maxRows = Math.max(pros.length, cons.length);
  const rows = [];
  rows.push(new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        borders: cellBorders,
        width: { size: 4333, type: WidthType.DXA },
        shading: { fill: "D9EAD3", type: ShadingType.CLEAR },
        margins: { top: 70, bottom: 70, left: 100, right: 100 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Avantages", font: FONT, size: 21, bold: true, color: "1C3A13" })],
            alignment: AlignmentType.LEFT,
            spacing: { before: 20, after: 20 }
          })
        ]
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 4333, type: WidthType.DXA },
        shading: { fill: "FCE4D6", type: ShadingType.CLEAR },
        margins: { top: 70, bottom: 70, left: 100, right: 100 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Limites", font: FONT, size: 21, bold: true, color: "4A1C14" })],
            alignment: AlignmentType.LEFT,
            spacing: { before: 20, after: 20 }
          })
        ]
      })
    ]
  }));

  for (let i = 0; i < maxRows; i++) {
    const proText = pros[i] || "";
    const conText = cons[i] || "";
    rows.push(new TableRow({
      children: [
        new TableCell({
          borders: cellBorders,
          width: { size: 4333, type: WidthType.DXA },
          shading: { fill: WHITE, type: ShadingType.CLEAR },
          margins: { top: 50, bottom: 50, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: parseMarkdown(proText, { font: FONT, size: 20 }),
              alignment: AlignmentType.LEFT,
              spacing: { before: 30, after: 30, line: 260, lineRule: "auto" }
            })
          ]
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 4333, type: WidthType.DXA },
          shading: { fill: WHITE, type: ShadingType.CLEAR },
          margins: { top: 50, bottom: 50, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: parseMarkdown(conText, { font: FONT, size: 20 }),
              alignment: AlignmentType.LEFT,
              spacing: { before: 30, after: 30, line: 260, lineRule: "auto" }
            })
          ]
        })
      ]
    }));
  }

  const table = new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [4333, 4333],
    rows
  });

  const caption = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 90, after: 140 },
    children: [
      new TextRun({ text: "TABLEAU " + tableNum + " : ", font: FONT, size: 20, bold: true, color: "333333" }),
      new TextRun({ text: "Avantages et limites : " + modelName, font: FONT, size: 20, color: "333333" })
    ]
  });

  return [table, caption];
};

const emptyFigurePlaceholder = (captionText, heightPt = 160) => [
  new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 90, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.DASHED, size: 2, color: "B0B0B0" },
      bottom: { style: BorderStyle.DASHED, size: 2, color: "B0B0B0" },
      left: { style: BorderStyle.DASHED, size: 2, color: "B0B0B0" },
      right: { style: BorderStyle.DASHED, size: 2, color: "B0B0B0" },
    },
    rows: [
      new TableRow({
        height: { value: heightPt * 20, rule: HeightRule.ATLEAST },
        children: [
          new TableCell({
            width: { size: 90, type: WidthType.PERCENTAGE },
            shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 120 },
                children: [
                  new TextRun({
                    text: "[ Emplacement réservé : insérer la figure ici ]",
                    font: FONT,
                    size: 20,
                    italics: true,
                    color: "888888"
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 180 },
    children: [
      new TextRun({ text: captionText, font: FONT, size: 20, italics: true, color: GRAY })
    ]
  }),
  pb()
];

const imageFigure = (imageRelPath, captionText, maxW = 540, maxH = 380) => {
  const fullPath = path.isAbsolute(imageRelPath) ? imageRelPath : path.join(__dirname, imageRelPath);
  if (fs.existsSync(fullPath)) {
    try {
      const buffer = fs.readFileSync(fullPath);
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 140, after: 60 },
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width: maxW, height: maxH },
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 140 },
          children: [
            new TextRun({ text: captionText, font: FONT, size: 20, italics: true, color: GRAY })
          ]
        }),
        pb()
      ];
    } catch(e) {
      return emptyFigurePlaceholder(captionText);
    }
  } else {
    return emptyFigurePlaceholder(captionText);
  }
};

const tocLine = (text, level, page) => {
  const sz = level === 0 ? 24 : level === 1 ? 23 : 22;
  const bold = level === 0;
  const left = [0, 360, 720, 1080][Math.min(level, 3)];
  return new Paragraph({
    children: [
      new TextRun({ text, font: FONT, size: sz, bold }),
      new TextRun({ children: [new Tab()], font: FONT, size: sz }),
      new TextRun({ text: String(page), font: FONT, size: 22, bold }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: 8666, leader: "dot" }],
    indent: { left },
    spacing: {
      before: level === 0 ? 140 : level === 1 ? 70 : 35,
      after: level === 0 ? 50 : 25,
    },
  });
};
''')

        # Document start
        f.write('''
const doc = new Document({
  features: { updateFields: true },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }]
  },
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 34, bold: true, font: FONT, color: NAVY, allCaps: true },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: BLUE },
        paragraph: { spacing: { before: 260, after: 110 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: FONT, color: NAVY },
        paragraph: { spacing: { before: 180, after: 90 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [
''')

        # Preliminaries
        f.write(get_preliminaries())

        # Section 3: Corps du rapport
        f.write('''
    // SECTION 3 : CORPS DU RAPPORT (NUMÉROTATION ARABE 1..N)
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Nexora — Système Décisionnel Intelligent & Pilotage de Production", font: FONT, size: 18, italics: true, color: GRAY }),
                new TextRun({ children: [new Tab()], font: FONT, size: 18 }),
                new TextRun({ text: "FSM Master Data Science", font: FONT, size: 18, color: GRAY })
              ],
              alignment: AlignmentType.LEFT,
              tabStops: [{ type: TabStopType.RIGHT, position: 8666 }],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Faculté des Sciences de Monastir", font: FONT, size: 18, color: GRAY }),
                new TextRun({ children: [new Tab()], font: FONT, size: 18 }),
                new TextRun({ text: "Page ", font: FONT, size: 18, color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: GRAY }),
              ],
              alignment: AlignmentType.LEFT,
              tabStops: [{ type: TabStopType.RIGHT, position: 8666 }],
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
            })
          ]
        })
      },
      children: [
''')

        # Chapters
        f.write(get_intro())
        f.write(get_chapter1())
        f.write(get_chapter2())
        f.write(get_chapter3())
        f.write(get_chapter4())
        f.write(get_chapter5())
        f.write(get_chapter6())
        f.write(get_concl_biblio())

        # Close document & output Packer
        f.write('''
      ]
    }
  ]
});

// GENERATION OF DOCX FILE DIRECTLY
Packer.toBuffer(doc).then(buffer => {
  const outputPath = path.join(__dirname, 'pfe_v7.docx');
  let savedPath = outputPath;
  try {
    fs.writeFileSync(outputPath, buffer);
    console.log("✓ Rapport PFE v7 généré avec succès : " + outputPath);
  } catch(e) {
    if (e.code === 'EBUSY') {
      savedPath = path.join(__dirname, 'pfe_v7_mis_a_jour.docx');
      fs.writeFileSync(savedPath, buffer);
      console.log("[ATTENTION] pfe_v7.docx est ouvert dans Word. Version a jour enregistree sous : " + savedPath);
    } else {
      throw e;
    }
  }

  // Copy to root workspace
  const rootPath = path.join(__dirname, '..', 'pfe_v7.docx');
  try {
    fs.writeFileSync(rootPath, buffer);
    console.log("✓ Copie sauvegardee a la racine : " + rootPath);
  } catch(e) {
    if (e.code === 'EBUSY') {
      const rootFallback = path.join(__dirname, '..', 'pfe_v7_mis_a_jour.docx');
      try {
        fs.writeFileSync(rootFallback, buffer);
        console.log("[ATTENTION] pfe_v7.docx racine est ouvert dans Word. Version a jour enregistree sous : " + rootFallback);
      } catch(e2) {}
    }
  }
}).catch(err => {
  console.error("Erreur generation pfe_v7.docx :", err);
});
''')

    print("build_pfe.js generated successfully.")

if __name__ == "__main__":
    assemble_file()
    print("Compiling pfe.docx via node build_pfe.js...")
    res = subprocess.run(["node", "build_pfe.js"], cwd=os.path.dirname(os.path.abspath(__file__)), capture_output=True, text=True, encoding='utf-8', errors='replace')
    if res.stdout:
        print(res.stdout.encode('ascii', errors='replace').decode())
    if res.stderr:
        print(res.stderr.encode('ascii', errors='replace').decode())
