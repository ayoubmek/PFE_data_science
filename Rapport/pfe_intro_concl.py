# -*- coding: utf-8 -*-
"""
Introduction Générale, Conclusion Générale et Perspectives, et Bibliographie
pour Nexora (pfe_v3.docx)
Style : Simple, académique, professionnel, sans jargon excessif.
"""

def get_intro():
    return '''
        // =========================================================
        // INTRODUCTION GÉNÉRALE
        // =========================================================
        title1("Introduction générale"),
        body("À l'ère de l'industrie 4.0, la compétitivité et la résilience des entreprises manufacturières reposent sur leur capacité à transformer les flux de données industrielles en leviers décisionnels tangibles. Dans le secteur de la plasturgie automobile, caractérisé par des cadences de production élevées, des exigences strictes de qualité et des flux tendus, la maîtrise conjointe de la cadence de fabrication et des approvisionnements en matières premières constitue un enjeu économique et opérationnel déterminant."),
        pb(),
        body("Ce projet de fin d'études, mené en collaboration avec la société de services numériques **Maps-IT**, s'inscrit dans le cadre de l'accompagnement d'un équipementier automobile international exploitant plusieurs sites industriels en Tunisie et en Europe. Bien que l'entreprise dispose d'un entrepôt de données centralisant l'historique de ses ateliers [16], l'exploitation de ce patrimoine informationnel demeurait fragmentée. Le pilotage opérationnel reposait essentiellement sur des extractions manuelles différées, privant les décideurs d'une visibilité en temps réel. Parallèlement, l'absence d'outils prédictifs rendait la gestion des stocks vulnérable aux aléas, générant conjointement des risques de rupture sur des composants stratégiques et des immobilisations financières en surstock."),
        pb(),
        body("Face à ces constats, la problématique centrale de ce travail s'énonce ainsi :"),
        body("*« Comment valoriser les données massives d'un entrepôt industriel à travers des approches d'apprentissage automatique et d'informatique décisionnelle pour optimiser la supervision de la production, anticiper les cadences d'atelier et sécuriser la gestion des approvisionnements ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("Pour répondre à cette problématique, nous avons conçu et développé la solution **Nexora**, une plateforme décisionnelle intégrant la chaîne complète de valorisation de la donnée :"),
        bullet("**L'ingénierie et l'assainissement des données (ETL)** : conception d'un pipeline automatisé assurant la qualité, l'intégrité et la structuration dimensionnelle des données industrielles multi-sites."),
        bullet("**La modélisation prédictive par Machine Learning** : développement et évaluation comparative de modèles statistiques et d'apprentissage automatique (Régression Linéaire, ARIMA, Random Forest, Prophet) pour anticiper les cadences de fabrication sur un horizon mensuel opérationnel."),
        bullet("**L'aide à la décision et l'optimisation logistique** : segmentation analytique du catalogue d'articles, évaluation dynamique de la couverture de stock et modélisation de plans de réapprovisionnement préventifs [14, 15]."),
        bullet("**La restitution analytique multi-profils** : déploiement de tableaux de bord décisionnels Microsoft Power BI [24] pour le management et d'un portail web réactif (React.js [22], Spring Boot [17], FastAPI [21]) pour les équipes d'atelier."),
        pb(),
        body("Conduit selon la méthodologie Agile Scrum [1, 2], le projet a été structuré autour d'un sprint de cadrage (Sprint 0) et de quatre sprints de réalisation. Le présent mémoire s'organise en six chapitres :"),
        bullet("**Le chapitre 1** introduit le contexte académique et industriel du projet, l'étude comparative de l'existant, la méthodologie Scrum et les démarches de modélisation retenues [26]."),
        bullet("**Le chapitre 2 (Sprint 0)** est dédié à l'analyse des besoins fonctionnels et non fonctionnels, à la conception de l'architecture en quatre couches et au choix de l'environnement technique."),
        bullet("**Le chapitre 3 (Sprint 1)** détaille l'exploration statistique des données (EDA), l'audit qualité et la réalisation du pipeline ETL alimentant le Data Warehouse."),
        bullet("**Le chapitre 4 (Sprint 2)** présente le module de gestion intelligente des stocks, la classification opérationnelle par niveau de couverture et l'estimation des besoins de réapprovisionnement."),
        bullet("**Le chapitre 5 (Sprint 3)** expose la démarche de modélisation prédictive des cadences, l'évaluation comparative des algorithmes d'IA à l'horizon 30 jours et l'analyse explicable des composantes temporelles."),
        bullet("**Le chapitre 6 (Sprint 4)** décrit la conception des tableaux de bord Power BI, l'implémentation du portail web opérationnel et les résultats des tests fonctionnels et d'intégration."),
        pb(),
        body("Enfin, une conclusion générale récapitule les principaux apports de cette étude, en discute les limites méthodologiques et esquisse des perspectives d'évolution pour le secteur industriel."),
        pageBreak(),
    '''

def get_concl_biblio():
    return '''
        // =========================================================
        // CONCLUSION GÉNÉRALE ET PERSPECTIVES
        // =========================================================
        title1("Conclusion générale et perspectives"),
        body("Ce projet de fin d'études a permis de concevoir, développer et valider la plateforme d'aide à la décision **Nexora**, destinée à moderniser le pilotage de la production et la gestion logistique d'un parc de 319 presses à injecter réparties sur trois sites industriels."),
        pb(),
        body("L'objectif fondamental était de valoriser l'entrepôt de données opérationnel pour substituer aux calculs manuels et réactifs un système automatisé, prédictif et ergonomique."),
        pb(),
        body("L'adoption de la démarche itérative Agile Scrum a permis de rythmer le projet autour de jalons concrets et mesurables :"),
        bullet("**Sprint 0 (Cadrage & Architecture)** : formalisation des besoins des deux acteurs d'atelier (Opérateur et Administrateur), modélisation des cas d'utilisation UML et conception de l'architecture découplée en quatre couches."),
        bullet("**Sprint 1 (Ingénierie des données & ETL)** : conception d'un pipeline Python assurant le dédoublonnage des lignes redondantes et le redressement des anomalies qualité, aboutissant au chargement des enregistrements validés dans les tables en étoile du Data Warehouse."),
        bullet("**Sprint 2 (Gestion intelligente des stocks)** : classification opérationnelle des stocks par niveau de couverture et de criticité (Rupture, Critique, Alerte, Normal) sur le catalogue de références, couplée à une formule de réapprovisionnement à 45 jours qui chiffre l'enveloppe prioritaire des références en risque."),
        bullet("**Sprint 3 (Modélisation prédictive par IA)** : comparaison de quatre modèles d'apprentissage automatique et de séries temporelles à l'horizon opérationnel de 30 jours. Random Forest et Prophet affichent des niveaux de précision comparables et satisfaisants (erreurs MAPE de l'ordre de 6 % à 7 %), Random Forest obtenant les plus faibles écarts moyens et Prophet assurant le déploiement opérationnel grâce à sa robustesse et sa gestion native des composantes calendaires."),
        bullet("**Sprint 4 (Restitution & Validation)** : réalisation de tableaux de bord décisionnels Power BI pour le suivi managérial et d'un portail web opérationnel React / Spring Boot pour les équipes d'atelier, validés avec succès par des scénarios de test fonctionnels et d'intégration."),
        pb(),
        body("En dépit de ces résultats concluants, notre solution comporte certaines **limites méthodologiques et techniques** qu'il convient de souligner avec rigueur académique :"),
        bullet("**Périmètre temporel d'observation** : l'historique disponible s'étend sur 851 jours (janvier 2024 à avril 2026), ce qui représente un recul précieux mais reste restreint pour appréhender les cycles économiques pluriannuels du secteur automobile."),
        bullet("**Agrégation macroscopique de la prévision** : les modèles actuels prévoient la cadence globale au niveau de l'atelier ; ils ne modélisent pas encore individuellement le comportement de chacune des 319 presses ou de chaque moule spécifique."),
        bullet("**Dépendance aux saisies manuelles résiduelles** : la précision de la détection des motifs de rebus ou des causes d'arrêt demeure tributaire de la rigueur de saisie des opérateurs d'atelier dans le système transactionnel d'origine."),
        pb(),
        body("Ces constats ouvrent la voie à plusieurs **perspectives d'évolution industrielle** à court et moyen termes :"),
        bullet("**1. Modélisation hiérarchique par machine et famille de matière** : développer des modèles de séries temporelles hiérarchiques réconciliées (par site, atelier, presse et moule) afin de descendre au niveau de granularité le plus fin pour l'ordonnancement d'atelier."),
        bullet("**2. Intégration bidirectionnelle avec le moteur MRP de l'ERP** : injecter automatiquement les recommandations de commande de stock calculées par Nexora dans le module d'achats de l'ERP pour générer des demandes d'achat pré-remplies."),
        bullet("**3. Industrialisation MLOps et réentraînement continu** : mettre en œuvre un pipeline MLOps automatisé (avec MLflow ou Airflow) détectant la dérive des données (*data drift*) et déclenchant le réapprentissage périodique des modèles prédictifs."),
        bullet("**4. Système d'alerte multicanal automatisé** : déployer un service d'alertes par courrier électronique et notifications push Web/SMS à destination de l'administrateur et des opérateurs dès qu'une couverture de référence descend sous le seuil critique des 15 jours."),
        pb(),
        body("En conclusion, ce projet de fin d'études démontre avec succès comment la convergence de l'ingénierie des données, de l'apprentissage automatique et du développement logiciel moderne peut apporter une réponse concrète, quantifiable et durable aux défis de la performance industrielle."),
        pageBreak(),

        // =========================================================
        // BIBLIOGRAPHIE ET WEBOGRAPHIE (NORME IEEE)
        // =========================================================
        title1("Bibliographie"),
        body("Les références bibliographiques et sources techniques mobilisées dans le cadre de ce projet sont référencées ci-dessous conformément à la norme IEEE :"),
        pb(),
        linkBullet("[1] K. Schwaber et J. Sutherland, « The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game », Scrum.org, nov. 2020. ", "https://scrumguides.org", ""),
        bullet("[2] M. Cohn, User Stories Applied: For Agile Software Development. Boston, MA, USA : Addison-Wesley Professional, 2004."),
        bullet("[3] G. E. P. Box, G. M. Jenkins, G. C. Reinsel, et G. M. Ljung, Time Series Analysis: Forecasting and Control, 5e éd. Hoboken, NJ, USA : John Wiley & Sons, 2015."),
        linkBullet("[4] R. J. Hyndman et G. Athanasopoulos, Forecasting: Principles and Practice, 3e éd. Melbourne, Australie : OTexts, 2021. ", "https://otexts.com/fpp3/", ""),
        bullet("[5] A. Géron, Hands-On Machine Learning with Scikit-Learn, Keras and TensorFlow, 2e éd. Sebastopol, CA, USA : O'Reilly Media, 2019."),
        bullet("[6] T. Hastie, R. Tibshirani, et J. Friedman, The Elements of Statistical Learning: Data Mining, Inference, and Prediction, 2e éd. New York, NY, USA : Springer, 2009."),
        bullet("[7] L. Breiman, « Random Forests », Machine Learning, vol. 45, n° 1, p. 5-32, 2001."),
        bullet("[8] C. M. Bishop, Pattern Recognition and Machine Learning. New York, NY, USA : Springer, 2006."),
        bullet("[9] E. A. Silver, D. F. Pyke, et R. Peterson, Inventory Management and Production Planning and Scheduling, 3e éd. New York, NY, USA : John Wiley & Sons, 1998."),
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
        bullet("[23] C. J. Date, An Introduction to Database Systems, 8e éd. Boston, MA, USA : Addison-Wesley, 2003."),
        bullet("[24] A. Ferrari et M. Russo, The Definitive Guide to DAX: Business Intelligence with Microsoft Power BI, SQL Server Analysis Services, and Excel, 2e éd. Redmond, WA, USA : Microsoft Press, 2019."),
        bullet("[25] S. Nakajima, Introduction to TPM: Total Productive Maintenance. Cambridge, MA, USA : Productivity Press, 1988."),
        bullet("[26] G. Booch, J. Rumbaugh, et I. Jacobson, The Unified Modeling Language User Guide, 2e éd. Boston, MA, USA : Addison-Wesley, 2005."),
        pageBreak(),
    '''
