# -*- coding: utf-8 -*-
"""
Chapitre 6 : Sprint 4 : Développement du tableau de bord décisionnel et validation pour Nexora (pfe_v2.docx)
Matches EXACT outline: 6.1 à 6.9
Style : Simple, académique, professionnel, sans jargon excessif.
"""

def get_chapter6():
    return '''
        // =========================================================
        // CHAPITRE 6 : SPRINT 4 : TABLEAUX DE BORD ET VALIDATION
        // =========================================================
        title1("Chapitre 6 : Sprint 4 : Développement du tableau de bord décisionnel et validation"),

        title2("6.1 Introduction"),
        body("Ce chapitre correspond au Sprint 4, dernière phase de réalisation de notre projet. Après avoir mis en place le pipeline ETL (Sprint 1), le module de gestion des stocks (Sprint 2) et les modèles de prévision par IA (Sprint 3), ce sprint a pour objectif d'intégrer l'ensemble de ces briques au sein d'une solution de restitution conviviale et réactive. Les rapports décisionnels développés sous Microsoft Power BI [24], alimentés directement par le Data Warehouse et la table `ml_production_predictions`, permettent à l'administrateur de piloter les indicateurs d'atelier, de suivre les prévisions de cadence et d'analyser les risques de rupture. En complément, un portail web opérationnel en React.js [22] et Spring Boot [17] offre à l'opérateur et à l'administrateur une interface de consultation des inventaires, de suivi de fabrication et de benchmark comparatif des modèles d'IA."),
        pb(),

        title2("6.2 Backlog du Sprint 4"),
        body("Le tableau 6.1 présente les tâches planifiées pour le Sprint 4 avec leur priorité et leur durée estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Connexion de Power BI au Data Warehouse et modélisation du schéma analytique", "1 jour"],
            ["Élevée", "Conception du rapport décisionnel « Supervision du Parc Machines »", "2 jours"],
            ["Élevée", "Conception du rapport décisionnel « Prévision des Cadences par IA »", "2 jours"],
            ["Élevée", "Conception du rapport décisionnel « Gestion des Stocks & Alertes »", "2 jours"],
            ["Élevée", "Développement des API REST du portail web (Spring Boot / FastAPI) et vues React", "3 jours"],
            ["Moyenne", "Écriture des mesures DAX (valorisation de stock, seuils critiques, taux de rotation)", "1 jour"],
            ["Moyenne", "Recette fonctionnelle et évaluation d'utilisabilité auprès des utilisateurs (Administrateurs et Opérateurs)", "2 jours"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.1 : Priorisation des tâches pour le Sprint 4", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.3 Architecture du tableau de bord et intégration applicative"),
        body("La figure 6.1 présente l'architecture globale d'intégration et de déploiement de la solution décisionnelle **Nexora** :"),
        pb(),
        ...imageFigure("diagrams/arch_physique.png", "Figure 6.1 : Architecture globale d'intégration et de déploiement de Nexora", 540, 240),
        bullet("**1. Entrepôt de données SQL Server** : centralise les tables de faits et de dimensions nettoyées (`ASTOCKDATE`, `FACT_CLE`, `MCMachineCenter`) ainsi que les prévisions de cadence (`ml_production_predictions`)."),
        bullet("**2. Backend applicatif d'entreprise (Spring Boot / FastAPI)** : le serveur Spring Boot [17] gère l'authentification sécurisée par jetons JWT, le contrôle d'accès RBAC et les entités métiers, tandis que le micro-service FastAPI [21] sert d'interface d'inférence directe pour les modèles Python."),
        bullet("**3. Rapports décisionnels Microsoft Power BI** : tableaux de bord interactifs connectés en mode DirectQuery ou Import au DWH, exploitant des mesures calculées en DAX pour le management d'atelier."),
        bullet("**4. Portail web réactif React.js** : interface utilisateur dynamique permettant aux équipes d'atelier de consulter les stocks, suivre les alertes critiques et comparer les modèles d'IA sur des données personnalisées."),
        pb(),

        title2("6.4 Diagramme de séquence"),
        body("La figure 6.2 illustre le déroulement des interactions lors de la consultation d'un rapport décisionnel et de l'interrogation des prévisions :"),
        pb(),
        ...imageFigure("diagrams/sprint4_seq.png", "Figure 6.2 : Diagramme de séquence des échanges entre l'utilisateur, l'interface et le DWH", 540, 260),
        body("Lors de l'application d'un filtre temporel ou machine, Power BI interroge les tables de faits consolidées et restitue instantanément les courbes d'évolution ainsi que le fuseau de prévision à 95 %."),
        pb(),

        title2("6.5 Conception des rapports décisionnels Power BI"),
        title3("6.5.1 Tableau de bord de supervision du parc machines"),
        body("Ce rapport offre une supervision complète de l'activité du parc de 319 presses à injecter réparties sur les sites de Kondar, Sousse et Brno :"),
        bullet("**Indicateurs clés d'atelier** : cadences réelles de production par atelier (moyenne globale de 64 890 pièces/jour), volumes déclarés conformes et taux de rebut moyen (1,85 %)."),
        bullet("**Suivi du parc machines** : décompte des presses en production, en maintenance planifiée ou en arrêt pour changement de moule."),
        bullet("**Analyse des causes d'arrêt** : répartition des motifs d'interruption (défaillances hydrauliques, surchauffe de fourreau, rupture de matière première)."),
        pb(),

        title3("6.5.2 Tableau de bord des prévisions de cadence"),
        body("Ce rapport est dédié à l'exploitation des projections de production issues des modèles d'IA :"),
        bullet("**Sélecteur d'horizon de prévision** : sélection ergonomique entre 7 jours (ajustement des équipes), 15 jours (anticipation matière) et 30 jours (plan de charge mensuel)."),
        bullet("**Comparaison réel / prévu** : superposition de la cadence réelle et des prévisions Random Forest et Prophet, complétées par les intervalles d'incertitude à 95 %."),
        bullet("**Indicateurs de fiabilité** : affichage en bandeau des erreurs moyennes MAPE issues de l'évaluation des modèles (environ 6,0 % pour Random Forest et 6,7 % pour Prophet à 30 jours)."),
        pb(),

        title3("6.5.3 Tableau de bord de gestion des stocks"),
        body("Ce rapport permet le pilotage fin des 6 875 lignes d'inventaire détaillées du catalogue d'articles :"),
        bullet("**Synthèse par état de stock** : indicateurs visuels des 312 références en Rupture (Rouge) et 1 240 en Stock Critique (Orange)."),
        bullet("**Filtres multicritères** : sélection par famille de résine (PP, PA66, ABS), atelier d'injection ou classe ABC."),
        bullet("**Plan de commande 45 jours** : tableau exportable indiquant la quantité exacte à commander et le montant budgétaire associé (enveloppe globale de 380 400 TND pour les 193 références prioritaires)."),
        pb(),

        title2("6.6 Présentation des interfaces réalisées"),
        title3("6.6.1 Tableau de bord principal"),
        body("La figure 6.3 illustre la vue d'ensemble décisionnelle Power BI regroupant les indicateurs clés de production et de stock :"),
        pb(),
        ...imageFigure("image/powerbi_3.png", "Figure 6.3 : Vue d'ensemble du tableau de bord décisionnel Power BI Nexora", 540, 260),
        pb(),

        title3("6.6.2 Historique et répartition des stocks d'atelier"),
        body("La figure 6.4 montre l'interface d'historique de stock et d'évolution des valorisations par site de production (Kondar, Sousse, Brno) :"),
        pb(),
        ...imageFigure("image/powerbi_1.png", "Figure 6.4 : Rapport Power BI « Historique d'évolution des stocks par site »", 540, 280),
        body("La figure 6.5 présente la vue globale de l'état des stocks d'atelier, la répartition par famille d'articles et les parts par site industriel :"),
        pb(),
        ...imageFigure("image/powerbi_2.png", "Figure 6.5 : Rapport Power BI « État de stock global et répartition par famille »", 540, 280),
        pb(),

        title3("6.6.3 Prévisions de cadence d'atelier"),
        body("La figure 6.6 présente l'écran de visualisation des cadences prévisionnelles à 30 jours (trajectoires prédictives et cadrage d'incertitude) :"),
        pb(),
        ...imageFigure("image/powerbi_4.png", "Figure 6.6 : Rapport Power BI « Prévision des cadences et charge atelier »", 540, 270),
        pb(),

        title3("6.6.4 Pilotage des stocks et alertes d'approvisionnement"),
        body("La figure 6.7 illustre l'interface dédiée à la surveillance d'inventaire et au suivi des alertes de rupture :"),
        pb(),
        ...imageFigure("image/powerbi_5.png", "Figure 6.7 : Rapport Power BI « Gestion des stocks d'atelier et alertes »", 540, 270),
        pb(),

        title3("6.6.5 Portail web opérationnel React & Spring Boot"),
        body("En complément des tableaux de bord Power BI dédiés au pilotage analytique global, la plateforme comprend une application web moderne développée avec React 18.2 [22] côté client et Spring Boot 3.2 [17] côté serveur. Ce portail offre aux équipes d'atelier et aux gestionnaires une interface fluide et réactive pour consulter les données d'inventaire en temps réel, analyser les stocks par segmentation Pareto ABC, superviser les 319 presses à injecter et exploiter les projections prédictives de cadence sur 30 jours ainsi que le banc d'essai comparatif des modèles d'IA."),
        body("L'architecture des services (API REST) exposés par le serveur applicatif s'articule autour de cinq contrôleurs modulaires :"),
        pb(),
        makeTable(
          ["Module fonctionnel", "Rôle opérationnel", "Profils autorisés"],
          [
            ["Authentification & Sécurité (/api/auth)", "Connexion sécurisée par jeton JWT (durée 24h) et gestion des sessions utilisateurs.", "Opérateur / Administrateur"],
            ["Gestion d'inventaire (/api/stock)", "Consultation des 32 043 lignes d'inventaire ASTOCKDATE, segmentation Pareto ABC et détection des alertes de rupture/surstock.", "Opérateur / Administrateur"],
            ["Supervision atelier & machines (/api/production)", "Suivi des déclarations FACT_CLE, indicateurs de TRS net, cadences d'injection et parc des 319 presses MCMachineCenter.", "Opérateur / Administrateur"],
            ["Inférence IA & Benchmark (/api/ml)", "Génération des prévisions de cadence sur 30 jours, comparaison des métriques du banc d'essai (Random Forest Champion, Prophet) et archivage.", "Opérateur / Administrateur"],
            ["Gestion des comptes (/api/users)", "Administration des habilitations et attribution stricte des rôles ADMIN et OPERATEUR.", "Administrateur"]
          ],
          [2600, 4200, 2466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.2 : Synthèse des services REST de l'application web", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.7 Tests et validation"),
        title3("6.7.1 Tests fonctionnels et d'intégration"),
        body("Afin de valider la conformité de la solution avec les spécifications du système, six scénarios de test d'intégration ont été déroulés :"),
        pb(),
        makeTable(
          ["Cas de test", "Protocole d'exécution", "Résultat constaté", "Statut"],
          [
            ["Connexion DWH DirectQuery", "Interrogation simultanée des tables FACT_CLE et ASTOCKDATE depuis Power BI.", "Temps de réponse fluide (< 1 s), synchronisation immédiate des visuels.", "Validé"],
            ["Mesures d'atelier (DAX)", "Vérification des formules de cadence, valorisation et rotation de stock sur 10 shifts types.", "Conformité stricte avec les déclarations d'atelier validées.", "Validé"],
            ["Projection prédictive 30j", "Génération de la prévision mensuelle d'atelier (horizon 30 jours) avec le modèle Random Forest Champion.", "Courbe continue avec bornes de confiance à 95 % et calcul des totaux mensuels.", "Validé"],
            ["Détection des ruptures", "Filtrage sur les références à stock nul (47 références distinctes) et contrôle de l'indicateur visuel rouge.", "Identification immédiate des références prioritaires avec tri par criticité.", "Validé"],
            ["Chiffrage commande 45j", "Contrôle de la somme budgétaire sur les 193 références prioritaires du catalogue.", "Montant égal aux 380 400 TND calculés dans le module d'approvisionnement.", "Validé"],
            ["Exportation tabulaire", "Export des alertes d'approvisionnement vers un tableur Excel.", "Génération d'un fichier conforme prêt pour transmission aux fournisseurs.", "Validé"]
          ],
          [2000, 3100, 2966, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.3 : Bilan des tests fonctionnels et d'intégration", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("6.7.2 Validation des prévisions d'atelier"),
        body("L'analyse comparée des cadences prédites et observées sur les 98 jours de test confirme la cohérence des prévisions par rapport aux dynamiques de production observées, apportant une visibilité prédictive structurée à l'administrateur et aux opérateurs de l'atelier."),
        pb(),

        title3("6.7.3 Validation des règles d'approvisionnement"),
        body("La simulation sur 45 jours a mis en évidence la suppression des commandes redondantes sur les 50 références en situation de surstock tout en ciblant les besoins d'approvisionnement pour les 193 références prioritaires du catalogue (47 ruptures et 146 critiques pour un budget de 380 400 TND), sécurisant la continuité de l'alimentation des lignes de fabrication."),
        pb(),

        title2("6.8 Bilan du Sprint 4"),
        body("Le tableau 6.4 récapitule les livrables validés à l'issue du Sprint 4 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Modélisation Power BI", "Connexion au Data Warehouse et création des mesures DAX", "Réalisé"],
            ["Rapport Supervision Machines", "Tableau de bord de suivi du parc de 319 presses et TRS net d'atelier", "Réalisé"],
            ["Rapport Prévision IA", "Tableau de bord de prévision des cadences (horizon 30 jours) avec bornes à 95 %", "Réalisé"],
            ["Rapport Gestion des stocks", "Tableau de bord d'analyse d'inventaire, classification ABC et alertes", "Réalisé"],
            ["Portail web opérationnel & Benchmark", "Application React 18 / Spring Boot avec API REST et banc d'essai des 4 modèles d'IA", "Réalisé"],
            ["Recette et validation", "Validation de 6 scénarios de test fonctionnels et d'intégration d'atelier", "Réalisé"]
          ],
          [2600, 4866, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.4 : Bilan des livrables du Sprint 4", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.9 Conclusion"),
        conclusionBox("Ce chapitre a présenté la conception, le déploiement et la validation des interfaces décisionnelles et opérationnelles de la plateforme Nexora lors du Sprint 4. En combinant la richesse analytique de Power BI pour l'administrateur et l'agilité d'un portail web React / Spring Boot pour l'opérateur en atelier, la solution comble le fossé entre la modélisation statistique avancée et les opérations industrielles quotidiennes. La conclusion générale suivante synthétise les résultats majeurs du projet, en discute les limites actuelles et esquisse des perspectives d'évolution prometteuses."),
        pageBreak(),
    '''
