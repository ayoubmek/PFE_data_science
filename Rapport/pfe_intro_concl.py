# -*- coding: utf-8 -*-
"""
Introduction Générale, Conclusion Générale et Perspectives, et Bibliographie
pour Nexora (pfe.docx)
Style : Simple, académique, professionnel, sans jargon excessif.
"""

def get_intro():
    return '''
        // =========================================================
        // INTRODUCTION GÉNÉRALE
        // =========================================================
        title1("Introduction générale"),
        body("Dans le secteur manufacturier et la plasturgie automobile, l'amélioration de la performance industrielle repose de plus en plus sur l'exploitation des données générées au sein des ateliers. Le suivi des cadences de fabrication, l'évaluation du Taux de Rendement Global (TRG/OEE) et la gestion des approvisionnements constituent des leviers majeurs pour assurer la continuité de la production et maîtriser les coûts d'exploitation."),
        pb(),
        body("Ce projet de fin d'études s'inscrit dans ce cadre au sein d'un équipementier automobile exploitant plusieurs usines en Tunisie (sites de Kondar et Sousse) et en République Tchèque (site de Brno). Avec un parc de 319 presses à injecter de capacités variées, l'entreprise fabrique des pièces plastiques techniques destinées à l'industrie automobile."),
        pb(),
        body("Bien que l'entreprise dispose d'un entrepôt de données (Data Warehouse sous Microsoft SQL Server) regroupant l'historique des opérations, le pilotage quotidien restait en partie manuel. Le calcul du TRG était souvent réalisé a posteriori sur des feuilles de calcul, ce qui limitait la réactivité face aux aléas de production. De même, la gestion des stocks de matières premières et de composants manquait d'outils d'anticipation, provoquant ponctuellement des retards d'approvisionnement ou des stocks dormants."),
        pb(),
        body("La problématique de ce projet peut ainsi se formuler :"),
        body("*« Comment valoriser les données du Data Warehouse pour concevoir un système d'aide à la décision permettant de superviser les machines, de prévoir les cadences de production grâce à l'apprentissage automatique et d'optimiser la gestion des stocks ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("Pour répondre à ce besoin, nous avons développé la solution **Nexora**, structurée autour de trois axes principaux :"),
        bullet("**1. Un pipeline de traitement et d'assainissement des données** : extraction des données brutes, correction des anomalies de stock et chargement dans des tables adaptées à l'analyse."),
        bullet("**2. Un module de prévision par apprentissage automatique** : comparaison de quatre modèles pour estimer les volumes de production futurs et détection d'anomalies sur les cadences."),
        bullet("**3. Un module de gestion prévisionnelle des stocks** : classification des articles du catalogue et calcul des besoins de réapprovisionnement sur un horizon cible de 45 jours."),
        pb(),
        body("Ces fonctionnalités sont accessibles à travers une application web développée avec React.js et un backend Spring Boot, complétée par des tableaux de bord Power BI pour le suivi décisionnel."),
        pb(),
        body("Le projet a été mené selon la méthodologie Agile Scrum, découpé en un Sprint 0 de cadrage et quatre sprints de réalisation. Le présent rapport s'organise en six chapitres :"),
        bullet("**Le premier chapitre** présente le cadre général du projet, l'entreprise d'accueil, l'étude de l'existant, la méthodologie Scrum et la démarche de modélisation."),
        bullet("**Le deuxième chapitre (Sprint 0)** est dédié à l'analyse des besoins fonctionnels et non fonctionnels, à la conception de l'architecture globale et au choix des technologies."),
        bullet("**Le troisième chapitre (Sprint 1)** détaille l'exploration des données, le traitement de la qualité et la réalisation du pipeline ETL alimentant le Data Warehouse."),
        bullet("**Le quatrième chapitre (Sprint 2)** présente la conception du module de gestion des stocks, la classification des articles et le calcul des recommandations de réapprovisionnement."),
        bullet("**Le cinquième chapitre (Sprint 3)** expose le développement, l'entraînement et l'évaluation comparative des modèles de prévision ainsi que la détection d'anomalies."),
        bullet("**Le sixième chapitre (Sprint 4)** décrit la conception des tableaux de bord Power BI, l'intégration des interfaces et les tests de validation du système."),
        pb(),
        body("Le rapport se termine par une conclusion générale résumant les résultats obtenus et proposant des perspectives d'évolution pour le système."),
        pageBreak(),
    '''

def get_concl_biblio():
    return '''
        // =========================================================
        // CONCLUSION GÉNÉRALE ET PERSPECTIVES
        // =========================================================
        title1("Conclusion générale et perspectives"),
        body("Ce projet de fin d'études a permis de concevoir et de développer la plateforme décisionnelle **Nexora**, destinée à soutenir le pilotage de la production et la gestion des stocks dans un atelier d'injection plastique."),
        pb(),
        body("L'objectif initial était de transformer les données opérationnelles issues du Data Warehouse en informations directement exploitables par les équipes d'atelier, afin de remplacer les consolidations manuelles par un suivi automatisé et prédictif."),
        pb(),
        body("L'organisation du travail selon la méthodologie Scrum, découpée en cinq itérations successives, a permis d'avancer de manière structurée :"),
        bullet("**Sprint 0** : identification précise des besoins des utilisateurs et définition d'une architecture modulaire en quatre couches facilitant l'intégration des composants."),
        bullet("**Sprint 1** : développement d'un pipeline ETL en Python permettant d'assainir les données brutes, de résoudre les anomalies d'inventaire et d'alimenter les sept tables du Data Warehouse dbDWH1."),
        bullet("**Sprint 2** : mise en place du module de gestion des stocks assurant la classification des articles selon leur niveau de risque et le calcul des quantités à commander pour sécuriser un horizon de 45 jours."),
        bullet("**Sprint 3** : étude comparative de quatre modèles de prévision (Régression Linéaire, ARIMA, Random Forest et Prophet), complétée par une validation croisée temporelle (TimeSeriesSplit) et un modèle de détection d'anomalies (Isolation Forest). Le modèle Prophet a présenté la meilleure adéquation pour anticiper les volumes de production."),
        bullet("**Sprint 4** : réalisation des tableaux de bord interactifs sous Microsoft Power BI et intégration des vues métiers pour la supervision des cadences et des stocks."),
        pb(),
        body("Sur le plan pratique, la solution apporte des bénéfices concrets pour l'atelier :"),
        bullet("Une visibilité immédiate sur l'état de fonctionnement des machines et le calcul du TRG."),
        bullet("Une anticipation des ruptures potentielles sur les composants critiques grâce à des alertes automatiques."),
        bullet("Une identification claire des articles en surstock permettant d'éviter des commandes inutiles."),
        bullet("Un gain de temps appréciable pour les équipes en automatisant la collecte et la mise en forme des indicateurs."),
        pb(),
        body("Plusieurs perspectives d'évolution peuvent enrichir ce travail à l'avenir :"),
        bullet("**1. Collecte automatisée par capteurs industriels** : connecter directement les automates des presses au système d'information pour récupérer les données de fonctionnement en continu."),
        bullet("**2. Maintenance prévisionnelle** : intégrer des modèles dédiés à l'usure mécanique et au suivi des cycles thermiques pour anticiper les interventions préventives."),
        bullet("**3. Représentation graphique d'atelier** : développer une vue cartographique interactive permettant de visualiser l'état de chaque machine directement sur le plan de l'usine."),
        pb(),
        body("En conclusion, ce travail illustre l'intérêt d'associer l'ingénierie des données et l'apprentissage automatique pour répondre à des problématiques industrielles concrètes, tout en ouvrant la voie à des améliorations continues pour l'entreprise."),
        pageBreak(),

        // =========================================================
        // BIBLIOGRAPHIE ET WEBOGRAPHIE (NORME IEEE)
        // =========================================================
        title1("Bibliographie"),
        body("Les références bibliographiques et sources techniques utilisées pour la réalisation de ce travail sont présentées ci-dessous :"),
        pb(),
        linkBullet("[1] K. Schwaber et J. Sutherland, « The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game », Scrum.org, nov. 2020. ", "https://scrumguides.org", ""),
        bullet("[2] M. Cohn, User Stories Applied: For Agile Software Development. Boston, MA, USA : Addison-Wesley Professional, 2004."),
        bullet("[3] G. E. P. Box, G. M. Jenkins, G. C. Reinsel, et G. M. Ljung, Time Series Analysis: Forecasting and Control, 5e éd. Hoboken, NJ, USA : John Wiley & Sons, 2015."),
        linkBullet("[4] R. J. Hyndman et G. Athanasopoulos, Forecasting: Principles and Practice, 3e éd. Melbourne, Australie : OTexts, 2021. ", "https://otexts.com/fpp3/", ""),
        bullet("[5] A. Géron, Hands-On Machine Learning with Scikit-Learn, Keras and TensorFlow, 2e éd. Sebastopol, CA, USA : O'Reilly Media, 2019."),
        bullet("[6] T. Hastie, R. Tibshirani, et J. Friedman, The Elements of Statistical Learning: Data Mining, Inference, and Prediction, 2e éd. New York, NY, USA : Springer, 2009."),
        bullet("[7] L. Breiman, « Random Forests », Machine Learning, vol. 45, n° 1, p. 5-32, 2001."),
        bullet("[8] F. T. Liu, K. M. Ting, et Z.-H. Zhou, « Isolation Forest », in Proc. of the 8th IEEE International Conference on Data Mining (ICDM), Pise, Italie, 2008, p. 413-422."),
        bullet("[9] J. MacQueen, « Some methods for classification and analysis of multivariate observations », in Proc. of 5th Berkeley Symposium on Mathematical Statistics and Probability, vol. 1, 1967, p. 281-297."),
        bullet("[10] S. Seabold et J. Perktold, « statsmodels: Econometric and statistical modeling with Python », in Proc. of the 9th Python in Science Conference, Austin, TX, USA, 2010, p. 92-96."),
        linkBullet("[11] F. Pedregosa et al., « Scikit-learn: Machine Learning in Python », Journal of Machine Learning Research, vol. 12, p. 2825-2830, 2011. ", "https://scikit-learn.org", ""),
        linkBullet("[12] S. J. Taylor et B. Letham, « Forecasting at scale: The Prophet procedure », The American Statistician, vol. 72, n° 1, p. 37-45, 2018. ", "https://peerj.com/preprints/3190/", ""),
        bullet("[13] J. D. Hunter, « Matplotlib: A 2D graphics environment », Computing in Science & Engineering, vol. 9, n° 3, p. 90-95, 2007."),
        bullet("[14] S. Axsäter, Inventory Control, 3e éd. New York, NY, USA : Springer International Publishing, 2015."),
        bullet("[15] R. G. Brown, Statistical Forecasting for Inventory Control. New York, NY, USA : McGraw-Hill, 1959."),
        linkBullet("[16] Microsoft Corporation, « Microsoft SQL Server 2022 Technical Documentation & Index Architecture », 2024. ", "https://learn.microsoft.com/sql/sql-server/", ""),
        linkBullet("[17] Spring Framework Team, « Spring Boot 3 Reference Documentation », VMware Tanzu, 2024. ", "https://spring.io/projects/spring-boot", ""),
        linkBullet("[18] Python Software Foundation, « Python Documentation, Version 3.10 », 2024. ", "https://docs.python.org/3/", ""),
        linkBullet("[19] W. McKinney, « Data Structures for Statistical Computing in Python (Pandas) », in Proc. of the 9th Python in Science Conf., Austin, TX, USA, 2010, p. 56-61. ", "https://pandas.pydata.org", ""),
        bullet("[20] C. R. Harris et al., « Array programming with NumPy », Nature, vol. 585, p. 357-362, 2020."),
        linkBullet("[21] S. Ramirez, « FastAPI: Modern, Fast Web Framework for Python », 2024. ", "https://fastapi.tiangolo.com", ""),
        linkBullet("[22] Meta Platforms Inc., « React.js 18 Documentation & Concurrent Features », 2024. ", "https://react.dev", ""),
        linkBullet("[23] Microsoft Corporation, « TypeScript Documentation: Typed JavaScript at Any Scale », 2024. ", "https://www.typescriptlang.org", ""),
        linkBullet("[24] Microsoft Corporation, « Microsoft Power BI Guidance Documentation & DAX Reference », 2024. ", "https://learn.microsoft.com/power-bi/", ""),
        bullet("[25] S. Nakajima, Introduction to TPM: Total Productive Maintenance. Cambridge, MA, USA : Productivity Press, 1988."),
        linkBullet("[26] Object Management Group (OMG), « Unified Modeling Language (UML) Specification, Version 2.5.1 », déc. 2017. ", "https://www.omg.org/spec/UML/2.5.1/", "")
    '''

print("Intro and Concl modules defined.")
