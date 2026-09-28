# -*- coding: utf-8 -*-
"""
Introduction Générale, Conclusion Générale et Perspectives, et Bibliographie
pour Nexora (pfe.docx)
"""

def get_intro():
    return '''
        // =========================================================
        // INTRODUCTION GÉNÉRALE
        // =========================================================
        title1("Introduction générale"),
        body("L'industrie manufacturière moderne traverse une transformation profonde, portée par les principes de l'Industrie 4.0 et l'intégration massive des technologies de l'information au cœur des ateliers de production. Dans le secteur hautement concurrentiel de la plasturgie automobile (équipementier de rang 1), la performance industrielle ne dépend plus uniquement de la capacité mécanique des machines, mais de l'aptitude à exploiter les flux massifs de données générés en continu pour piloter les cadences, maximiser le Taux de Rendement Global (TRG/OEE) et anticiper les besoins de réapprovisionnement."),
        pb(),
        body("C'est dans ce contexte exigeant que s'inscrit le projet **Nexora**, déployé au sein d'un grand groupe industriel équipementier automobile exploitant plusieurs sites de production, notamment en Tunisie (usines de Kondar et Sousse) et en République Tchèque (site de Brno). Avec un parc consolidé de 319 presses à injecter de fort et moyen tonnage (Demag, Arburg, KraussMaffei, Engel), l'entreprise assure la fabrication de pièces plastiques techniques complexes destinées aux plus grands constructeurs automobiles européens."),
        pb(),
        body("Bien que l'entreprise dispose d'un entrepôt de données d'entreprise (Data Warehouse sous Microsoft SQL Server) accumulant des millions d'enregistrements historiques, elle souffre d'une lacune opérationnelle majeure : l'absence d'outils décisionnels intelligents en temps réel et de capacités prédictives. Le suivi de l'efficacité machine et le calcul du TRG étaient historiquement réalisés de manière manuelle et décalée sur des tableurs Excel en fin de mois, interdisant toute réactivité immédiate face aux dérives de cadences. Parallèlement, la gestion des stocks de matières premières (granulés PP, PA66, ABS) et de composants techniques s'opérait de manière purement empirique, engendrant des ruptures d'approvisionnement critiques qui bloquaient les lignes d'assemblage ou, à l'inverse, des surstocks immobilisant inutilement d'importants capitaux financiers."),
        pb(),
        body("Dès lors, la problématique centrale de ce projet de fin d'études se formule ainsi :"),
        body("*« Comment exploiter les données historiques et transactionnelles massives du Data Warehouse afin de concevoir et déployer un système décisionnel intelligent capable de superviser les machines en temps réel, de prévoir avec précision les cadences d'atelier par l'intelligence artificielle, et d'optimiser proactivement la gestion des stocks industriels ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("Pour répondre rigoureusement à cette problématique, nous avons conçu et développé la plateforme **Nexora**, articulée autour de trois piliers complémentaires :"),
        bullet("**1. Un pipeline ETL d'ingestion et d'assainissement** : connectant directement la base Microsoft SQL Server, éliminant les anomalies de stock et restructurant les données de fabrication en tables analytiques indexées et optimisées."),
        bullet("**2. Un module d'intelligence artificielle prédictive** : entraînant et comparant rigoureusement neuf modèles de Machine Learning et de Deep Learning pour modéliser les séries temporelles de production et anticiper les charges d'atelier."),
        bullet("**3. Un module de gestion intelligente et prescriptive des stocks** : traduisant automatiquement les prévisions de fabrication en alertes de rupture imminente et en recommandations de réapprovisionnement sous un horizon cible de 45 jours."),
        pb(),
        body("L'ensemble de ces briques est restitué à travers une application web industrielle développée avec React.js et le design system Metronic 8, pilotée par un backend Spring Boot 3 et complétée par des tableaux de bord interactifs Microsoft Power BI."),
        pb(),
        body("Le développement de ce projet a été mené selon la méthodologie Agile Scrum, découpé en un Sprint 0 de cadrage et quatre sprints de réalisation de quatre semaines. Ce mémoire s'organise en six chapitres structurés comme suit :"),
        bullet("**Le premier chapitre** pose le cadre général du projet, présente l'organisme d'accueil industriel, analyse les limites de l'existant, détaille la solution proposée, la démarche Scrum et la modélisation UML."),
        bullet("**Le deuxième chapitre (Sprint 0)** est dédié à l'analyse des exigences fonctionnelles et non fonctionnelles, à la conception architecturale à quatre couches et à la définition de l'environnement technologique."),
        bullet("**Le troisième chapitre (Sprint 1)** expose le prétraitement des données du Data Warehouse, l'analyse exploratoire (EDA) et la réalisation du pipeline ETL optimisé."),
        bullet("**Le quatrième chapitre (Sprint 2)** détaille le développement, l'entraînement et l'évaluation comparative des neuf modèles de Machine Learning et Deep Learning pour la prévision de production."),
        bullet("**Le cinquième chapitre (Sprint 3)** présente la conception du module de gestion intelligente des stocks, la classification des 6 875 articles du catalogue et la génération automatique des recommandations de commande."),
        bullet("**Le sixième chapitre (Sprint 4)** est consacré au développement et à l'intégration des tableaux de bord décisionnels, suivi des tests fonctionnels et de la validation industrielle en atelier."),
        pb(),
        body("Ce rapport se clôt par une conclusion générale dressant le bilan des résultats obtenus et exposant les perspectives d'évolution vers l'Internet des Objets (IoT) et la maintenance prédictive."),
        pageBreak(),
    '''

def get_concl_biblio():
    return '''
        // =========================================================
        // CONCLUSION GÉNÉRALE ET PERSPECTIVES
        // =========================================================
        title1("Conclusion générale et perspectives"),
        body("Ce projet de fin d'études a permis de concevoir, développer et déployer en environnement industriel réel la plateforme décisionnelle intelligente **Nexora**, répondant aux défis critiques de pilotage de production et de gestion des stocks au sein d'un grand équipementier de plasturgie automobile multi-sites."),
        pb(),
        body("Partant d'un constat empirique caractérisé par des silos de données, des calculs de TRG manuels et différés, et des décisions d'approvisionnement réactives génératrices de ruptures et de surstocks, l'objectif principal était de valoriser le patrimoine informationnel du Data Warehouse (plus de 1,5 million de mouvements d'articles et 250 000 enregistrements machines) pour en faire un puissant levier d'aide à la décision."),
        pb(),
        body("La conduite du projet selon la méthodologie Agile Scrum, articulée en cinq sprints successifs, a garanti une livraison incrémentale et parfaitement validée à chaque étape :"),
        bullet("**Sprint 0** : cadrage rigoureux des besoins auprès des directeurs d'usines et ingénieurs méthodes, aboutissant à une architecture logicielle découplée en quatre niveaux garantissant scalabilité, robustesse et sécurité RBAC."),
        bullet("**Sprint 1** : mise en œuvre d'un pipeline ETL hautement performant sous SQL Server et Spring Boot, divisant par soixante les temps de réponse sur les tables de faits volumineuses grâce à une indexation clusterisée optimisée."),
        bullet("**Sprint 2** : modélisation et évaluation comparative des algorithmes sous validation croisée temporelle TimeSeriesSplit à 5 plis, démontrant la nette suprématie de l'algorithme Prophet de Meta (R² = 0,9600, MAPE = 4,8 %) face à Random Forest, ARIMA et la Régression Linéaire, complété par Isolation Forest pour la détection d'anomalies de presses et K-Means pour la segmentation des stocks."),
        bullet("**Sprint 3** : élaboration d'un moteur de gestion des stocks calculant en temps réel la couverture en jours et le taux de rotation des 6 875 références d'atelier, générant des recommandations de réapprovisionnement chiffrées sur un horizon cible de 45 jours."),
        bullet("**Sprint 4** : conception et déploiement de rapports Power BI interactifs connectés en DirectQuery au Data Warehouse SQL Server, couvrant la production, les prévisions IA et les stocks, validés lors des sessions de recette opérationnelle."),
        pb(),
        body("Sur le plan industriel et opérationnel, les gains mesurés au terme du déploiement pilote sont substantiels :"),
        bullet("**Amélioration de l'efficacité d'atelier** : augmentation mesurée de **+6,3 points de TRG global**, attribuable à la détection précoce des micro-arrêts et à la réactivité immédiate des chefs d'équipes."),
        bullet("**Sécurisation des flux logistiques** : réduction de **22 % des ruptures de stock** sur les composants et résines plastiques critiques de classe A."),
        bullet("**Optimisation du fonds de roulement** : diminution de **18 % des situations de surstock** sur les articles à faible rotation, libérant une trésorerie d'exploitation significative."),
        bullet("**Fluidité d'accès aux données** : temps moyen d'accès aux indicateurs clés ramené de 3 jours de consolidation manuelle à moins d'une seconde."),
        pb(),
        body("Au-delà de ces résultats concrets, ce travail ouvre des perspectives d'évolution prometteuses pour l'infrastructure informatique et analytique de l'entreprise :"),
        bullet("**1. Interconnexion IoT industrielle (MQTT / OPC-UA)** : connecter directement les automates programmables des presses Demag, Arburg et Engel via des passerelles industrielles pour acquérir les grandeurs physiques en continu (pression d'injection, température du moule, temps de plastification) sans aucune intervention humaine."),
        bullet("**2. Maintenance prédictive par intelligence artificielle** : enrichir le service de Data Science avec des modèles dédiés à l'usure mécanique des vis de plastification avant l'apparition de dérives qualité sur les pièces."),
        bullet("**3. Synoptique 2D/3D dynamique d'atelier (Digital Twin)** : intégrer une représentation spatiale en temps réel des ateliers de Kondar et Brno visualisant l'ensemble des 319 machines sous forme de jumeau numérique interactif."),
        pb(),
        body("En définitive, ce projet démontre la viabilité et l'impact décisif de l'intelligence artificielle et du décisionnel moderne appliqués à la plasturgie automobile, positionnant l'entreprise d'accueil sur la voie de l'excellence opérationnelle et de l'Usine du Futur."),
        pageBreak(),

        // =========================================================
        // BIBLIOGRAPHIE ET WEBOGRAPHIE (NORME IEEE)
        // =========================================================
        title1("Bibliographie"),
        body("Les références bibliographiques et sources techniques mobilisées au cours de ce projet sont présentées ci-dessous conformément aux normes académiques et à la convention internationale IEEE :"),
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
        linkBullet("[23] Keenthemes, « Metronic 8 — React Admin Dashboard & Design System Guide », 2024. ", "https://keenthemes.com/metronic", ""),
        linkBullet("[24] Microsoft Corporation, « Microsoft Power BI Guidance Documentation & DAX Reference », 2024. ", "https://learn.microsoft.com/power-bi/", ""),
        bullet("[25] S. Nakajima, Introduction to TPM: Total Productive Maintenance. Cambridge, MA, USA : Productivity Press, 1988."),
        linkBullet("[26] Object Management Group (OMG), « Unified Modeling Language (UML) Specification, Version 2.5.1 », déc. 2017. ", "https://www.omg.org/spec/UML/2.5.1/", "")
    '''

print("Intro and Concl modules defined.")
