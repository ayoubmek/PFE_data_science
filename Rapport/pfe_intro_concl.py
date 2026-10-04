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
        body("Dans le secteur manufacturier et la plasturgie automobile, l'amélioration continue de la performance industrielle repose sur la valorisation méthodique des flux de données générés au sein des usines. Le suivi des cadences de fabrication, l'évaluation du Taux de Rendement Global (TRG/OEE) [25] et la gestion proactive des approvisionnements constituent des leviers déterminants pour garantir la continuité des lignes d'assemblage et maîtriser les coûts de revient."),
        pb(),
        body("Ce projet de fin d'études est mené en collaboration avec la société de services numériques **Maps-IT**, accompagnant un équipementier automobile de rang 1 exploitant trois sites de production d'injection plastique situés en Tunisie (usines de Kondar et Sousse) et en République Tchèque (site de Brno). Avec un parc de 319 presses à injecter de capacités variées produisant en moyenne 64 890 pièces par jour, l'entreprise fabrique des pièces plastiques techniques soumises à des exigences strictes de qualité et de délais de livraison."),
        pb(),
        body("Bien que l'entreprise dispose d'un entrepôt de données (Data Warehouse sous Microsoft SQL Server [16]) centralisant l'historique des opérations, le pilotage quotidien demeurait fragmenté. Le calcul du TRG était souvent réalisé de façon différée sur des feuilles de calcul, ce qui limitait la réactivité opérationnelle face aux aléas de production. Parallèlement, la gestion des stocks de matières premières manquait d'outils d'anticipation, entraînant simultanément des situations de surstock sur certaines références et des risques de rupture critique sur des composants stratégiques."),
        pb(),
        body("La problématique de ce travail s'énonce donc ainsi :"),
        body("*« Comment exploiter les données centralisées du Data Warehouse industriel pour concevoir un système décisionnel automatisé, capable de superviser les machines d'atelier, de modéliser les cadences par apprentissage automatique et d'optimiser les politiques de réapprovisionnement de stock ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("Pour répondre à cette problématique, nous avons conçu et développé la solution **Nexora**, articulée autour de trois axes complémentaires :"),
        bullet("**1. Un pipeline de traitement des données (ETL)** : extraction automatisée des sources brutes, application de 10 règles de nettoyage (dédoublonnage sur clé composite, rejet des dates erronées, redressement des anomalies numériques) et chargement de 32 043 lignes validées dans un schéma en étoile DWH."),
        bullet("**2. Un module de prévision par apprentissage automatique** : évaluation comparative de modèles prédictifs (Régression Linéaire, ARIMA [3], Random Forest [7] et Prophet [12]) sur des horizons de 7, 15 et 30 jours. Les modèles Random Forest et Prophet atteignent tous deux des performances proches et satisfaisantes (erreurs MAPE de l'ordre de 6 % à 7 %), Random Forest offrant une précision ponctuelle légèrement supérieure et Prophet étant retenu pour le déploiement opérationnel grâce à son explicabilité et sa gestion native des saisonnalités industrielles. En complément, l'algorithme Isolation Forest [8] assure la détection précoce des dérives de cadence d'atelier."),
        bullet("**3. Un module de gestion intelligente des stocks** : segmentation multicritère ABC de Pareto et clustering K-Means [9], analyse de la couverture en jours et calcul du plan de réapprovisionnement sur un horizon de 45 jours (évalué à environ 380 400 TND pour les 193 références prioritaires du catalogue) [14, 15]."),
        pb(),
        body("La restitution s'appuie sur une double modalité adaptée aux profils d'utilisateurs : des tableaux de bord interactifs Microsoft Power BI [24] pour le pilotage managérial et une application web développée avec React.js [22], Spring Boot [17] et FastAPI [21] pour les équipes d'atelier."),
        pb(),
        body("Le projet a été mené selon la méthodologie Agile Scrum [1, 2], découpé en un Sprint 0 de cadrage et quatre sprints de réalisation. Le présent rapport s'organise en six chapitres :"),
        bullet("**Le premier chapitre** présente le cadre général du projet, les organismes partenaires, l'étude comparative de l'existant, la méthodologie Scrum et les diagrammes UML [26]."),
        bullet("**Le deuxième chapitre (Sprint 0)** est dédié à l'analyse des besoins fonctionnels et non fonctionnels, à la conception de l'architecture en quatre couches et au choix de l'environnement technique."),
        bullet("**Le troisième chapitre (Sprint 1)** détaille l'exploration des données, le bilan de qualité sous forme de waterfall et la réalisation du pipeline ETL alimentant le DWH."),
        bullet("**Le quatrième chapitre (Sprint 2)** présente la conception du module de gestion des stocks, la double segmentation des articles et le calcul des commandes à horizon 45 jours."),
        bullet("**Le cinquième chapitre (Sprint 3)** expose le protocole d'évaluation des modèles, la comparaison de leurs performances prédictives à court et moyen termes, le choix du modèle opérationnel et la détection d'anomalies de cadence."),
        bullet("**Le sixième chapitre (Sprint 4)** décrit la conception des tableaux de bord Power BI, l'implémentation du portail web opérationnel et les résultats des tests fonctionnels."),
        pb(),
        body("Le rapport se conclut par un bilan général des réalisations, une analyse objective des limites actuelles et la présentation de perspectives d'évolution concrètes."),
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
        bullet("**Sprint 1 (Ingénierie des données & ETL)** : conception d'un pipeline Python assurant le dédoublonnage de 18 337 lignes redondantes et le redressement de 10 types d'anomalies, aboutissant au chargement de 32 043 enregistrements validés dans les tables en étoile du DWH (taux de rétention de 62,22 %)."),
        bullet("**Sprint 2 (Gestion intelligente des stocks)** : segmentation multicritère ABC de Pareto et clustering K-Means ($k=3$) sur le catalogue de 800 références (couvrant 14,31 M TND de valeur annuelle consommée), couplée à une formule de réapprovisionnement à 45 jours qui chiffre l'enveloppe prioritaire des 193 références en risque à environ 380 400 TND."),
        bullet("**Sprint 3 (Modélisation prédictive par IA)** : comparaison de quatre modèles d'apprentissage automatique et de séries temporelles sur des horizons de 7, 15 et 30 jours. Random Forest et Prophet affichent des niveaux de précision comparables et satisfaisants (erreurs MAPE de l'ordre de 6 % à 7 %), Random Forest obtenant les plus faibles écarts moyens et Prophet assurant le déploiement opérationnel grâce à sa robustesse et sa gestion native des composantes calendaires. L'algorithme Isolation Forest permet quant à lui d'identifier automatiquement les baisses anormales de cadence."),
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
        bullet("[23] C. J. Date, An Introduction to Database Systems, 8e éd. Boston, MA, USA : Addison-Wesley, 2003."),
        bullet("[24] A. Ferrari et M. Russo, The Definitive Guide to DAX: Business Intelligence with Microsoft Power BI, SQL Server Analysis Services, and Excel, 2e éd. Redmond, WA, USA : Microsoft Press, 2019."),
        bullet("[25] S. Nakajima, Introduction to TPM: Total Productive Maintenance. Cambridge, MA, USA : Productivity Press, 1988."),
        bullet("[26] G. Booch, J. Rumbaugh, et I. Jacobson, The Unified Modeling Language User Guide, 2e éd. Boston, MA, USA : Addison-Wesley, 2005."),
        pageBreak(),
    '''
