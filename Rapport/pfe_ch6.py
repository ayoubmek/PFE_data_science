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
        body("Ce chapitre correspond au Sprint 4, dernière phase de réalisation de notre projet. Après avoir mis en place le pipeline ETL (Sprint 1), le module de gestion des stocks (Sprint 2) et les modèles de prévision par IA (Sprint 3), ce sprint a pour objectif d'intégrer l'ensemble de ces briques au sein d'une solution de restitution conviviale et réactive. Les rapports décisionnels développés sous Microsoft Power BI [24], alimentés directement par le Data Warehouse et la table `ml_production_predictions`, permettent à l'administrateur de piloter les indicateurs d'atelier, de suivre les prévisions de cadence et d'analyser les risques de rupture. En complément, un portail web opérationnel en React.js [22] et Spring Boot [17] offre à l'opérateur d'atelier une interface de saisie et de consultation des mouvements d'inventaire."),
        pb(),

        title2("6.2 Backlog du Sprint 4"),
        body("Le tableau 6.1 présente les tâches planifiées pour le Sprint 4 avec leur priorité et leur durée estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Connexion de Power BI au Data Warehouse et modélisation du schéma analytique", "1 jour"],
            ["Élevée", "Conception du rapport décisionnel « Supervision de Production & TRG »", "2 jours"],
            ["Élevée", "Conception du rapport décisionnel « Prévision des Cadences par IA »", "2 jours"],
            ["Élevée", "Conception du rapport décisionnel « Gestion des Stocks & Alertes »", "2 jours"],
            ["Élevée", "Développement des API REST du portail web (Spring Boot / FastAPI) et vues React", "3 jours"],
            ["Moyenne", "Écriture des mesures DAX (calcul du TRG, seuils critiques, taux de rotation)", "1 jour"],
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
        bullet("**1. Entrepôt de données SQL Server** : centralise les tables de faits et de dimensions nettoyées ainsi que les prévisions issues de l'apprentissage automatique (`ml_production_predictions`)."),
        bullet("**2. Backend applicatif d'entreprise (Spring Boot / FastAPI)** : le serveur Spring Boot [17] gère l'authentification sécurisée par jetons JWT, le contrôle d'accès RBAC et les entités métiers, tandis que le micro-service FastAPI [21] sert d'interface d'inférence directe pour les modèles Python."),
        bullet("**3. Rapports décisionnels Microsoft Power BI** : tableaux de bord interactifs connectés en mode DirectQuery ou Import au DWH, exploitant des mesures calculées en DAX pour le management d'atelier."),
        bullet("**4. Portail web réactif React.js** : interface utilisateur dynamique permettant aux opérateurs de renseigner les réceptions et consommations de matière."),
        pb(),

        title2("6.4 Diagramme de séquence"),
        body("La figure 6.2 illustre le déroulement des interactions lors de la consultation d'un rapport décisionnel et de l'interrogation des prévisions :"),
        pb(),
        ...imageFigure("diagrams/sprint4_seq.png", "Figure 6.2 : Diagramme de séquence des échanges entre l'utilisateur, l'interface et le DWH", 540, 260),
        body("Lors de l'application d'un filtre temporel ou machine, Power BI interroge les tables de faits consolidées et restitue instantanément les courbes d'évolution ainsi que le fuseau de prévision à 95 %."),
        pb(),

        title2("6.5 Conception des rapports décisionnels Power BI"),
        title3("6.5.1 Tableau de bord de supervision et TRG"),
        body("Ce rapport offre une supervision complète du parc de 319 presses à injecter réparties sur les sites de Kondar, Sousse et Brno :"),
        bullet("**Indicateurs clés d'atelier** : valeur consolidée du TRG d'atelier (moyenne observée de 71,4 % [25]), décomposée en taux de disponibilité (88,2 %), de performance (84,5 %) et de qualité (95,8 %)."),
        bullet("**Suivi du parc machines** : décompte des presses en production, en maintenance planifiée ou en arrêt pour changement de moule."),
        bullet("**Analyse des causes d'arrêt** : diagramme de Pareto des motifs d'interruption (défaillances hydrauliques, surchauffe de fourreau, manque matière)."),
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

        title3("6.6.2 Supervision de la production et TRG"),
        body("La figure 6.4 montre l'interface de pilotage du parc machines et d'analyse des composantes du TRG :"),
        pb(),
        ...imageFigure("image/powerbi_1.png", "Figure 6.4 : Interface « Supervision de la production et TRG »", 540, 280),
        body("La figure 6.5 présente la répartition des volumes fabriqués par grande famille de composants plastiques automobiles :"),
        pb(),
        ...imageFigure("image/powerbi_2.png", "Figure 6.5 : Répartition des volumes d'injection par famille de pièces", 540, 280),
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
        body("En complément des tableaux de bord Power BI dédiés à l'administrateur, la plateforme comprend une application web développée avec React 18.2 [22] côté client et Spring Boot 3.2 [17] côté serveur. Ce portail offre à l'opérateur d'atelier une interface fluide pour consulter les données opérationnelles et enregistrer les mouvements de stock."),
        body("L'architecture des services (API REST) exposés par le serveur applicatif s'articule autour de quatre domaines principaux :"),
        pb(),
        makeTable(
          ["Module fonctionnel", "Rôle opérationnel", "Profils autorisés"],
          [
            ["Authentification & Rôles (/api/auth)", "Connexion sécurisée par jeton JWT et contrôle d'accès selon le profil.", "Opérateur / Administrateur"],
            ["Gestion des stocks (/api/stock)", "Consultation des niveaux d'inventaire, alertes de couverture et saisie des mouvements de matière.", "Opérateur / Administrateur"],
            ["Parc machines (/api/machines)", "Suivi de l'état opérationnel des 319 presses à injecter et historique des indicateurs de production.", "Opérateur / Administrateur"],
            ["Prévisions de production (/api/predictions)", "Consultation des cadences prévues par les modèles d'IA pour le pilotage d'atelier.", "Administrateur"]
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
            ["Connexion DWH DirectQuery", "Interrogation simultanée des tables FACT_PA et FACT_Mvts_Stocks depuis Power BI.", "Temps de réponse fluide, synchronisation immédiate des visuels.", "Validé"],
            ["Calcul du TRG (DAX)", "Vérification des formules de disponibilité, performance et qualité sur 10 shifts types.", "Conformité stricte avec les déclarations d'atelier validées.", "Validé"],
            ["Sélection multi-horizons", "Bascule entre les horizons de prévision 7j, 15j et 30j sur l'interface graphique.", "Mise à jour instantanée des courbes et des bornes d'incertitude à 95 %.", "Validé"],
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
            ["Rapport Supervision & TRG", "Tableau de bord de suivi du parc machines et décomposition du TRG", "Réalisé"],
            ["Rapport Prévision IA", "Tableau de bord multi-horizons (7, 15, 30 jours) avec bornes à 95 %", "Réalisé"],
            ["Rapport Gestion des stocks", "Tableau de bord d'analyse d'inventaire, classification ABC et alertes", "Réalisé"],
            ["Portail web opérationnel", "Application React 18 / Spring Boot avec API REST documentées", "Réalisé"],
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
