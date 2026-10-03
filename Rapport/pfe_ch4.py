# -*- coding: utf-8 -*-
"""
Chapitre 4 : Sprint 2 : Développement du module de gestion intelligente des stocks pour Nexora (pfe.docx)
Matches outline: 4.1 à 4.9
Style : Simple, académique, professionnel, sans jargon excessif.
"""

def get_chapter4():
    return '''
        // =========================================================
        // CHAPITRE 4 : SPRINT 2 : GESTION INTELLIGENTE DES STOCKS
        // =========================================================
        title1("Chapitre 4 : Sprint 2 : Développement du module de gestion intelligente des stocks"),

        title2("4.1 Introduction"),
        body("Ce chapitre correspond au Sprint 2 de notre démarche Scrum. Dans un atelier d'injection plastique, la gestion rigoureuse des stocks de matières premières (résines techniques) et de composants est essentielle pour éviter les arrêts de ligne tout en maîtrisant les coûts de stockage. L'objectif de ce sprint est de concevoir le module de **gestion des stocks** de la plateforme Nexora. En exploitant les données assainies de la table FACT_Mvts_Stocks du Data Warehouse dbDWH1, ce module évalue l'état de chaque référence du catalogue, identifie les situations de pénurie ou de surstock, et propose des recommandations de commande adaptées pour maintenir un stock de sécurité suffisant."),
        pb(),

        title2("4.2 Backlog du Sprint 2"),
        body("Le tableau 4.1 récapitule les tâches planifiées pour le Sprint 2 avec leur priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Définition du schéma fonctionnel du module de gestion des stocks", "1 jour"],
            ["Élevée", "Calcul des taux de consommation journaliers, de la couverture et de la rotation", "2 jours"],
            ["Élevée", "Mise en place des règles de classification des articles (Rupture, Critique, Normal, Surstock)", "2 jours"],
            ["Élevée", "Développement de l'algorithme de calcul des commandes pour une couverture de 45 jours", "2 jours"],
            ["Moyenne", "Mise en place des alertes d'atelier priorisées par niveau de risque", "1 jour"],
            ["Faible", "Intégration des vues de synthèse d'inventaire et des fonctions d'export", "1 jour"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.1 : Priorisation des tâches : Sprint 2", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.3 Architecture du module de gestion des stocks"),
        body("Le fonctionnement du module repose sur un enchaînement en quatre étapes, illustré par la figure 4.1 :"),
        pb(),
        ...imageFigure("diagrams/sprint3_activity.png", "Figure 4.1 : Architecture et flux d'exécution du module de gestion des stocks", 520, 240),
        bullet("**1. Données d'entrée** : lecture des stocks actuels et de l'historique des mouvements depuis la table FACT_Mvts_Stocks du Data Warehouse."),
        bullet("**2. Calcul des indicateurs** : évaluation du taux de consommation moyen par jour, de la couverture restante en jours et du taux de rotation."),
        bullet("**3. Classification des articles** : affectation de chaque référence à un niveau d'état de stock prédéfini."),
        bullet("**4. Recommandations et alertes** : calcul des quantités à commander, estimation du coût global et génération d'alertes pour les articles prioritaires."),
        pb(),

        title2("4.4 Analyse des niveaux de stock et de rotation"),
        body("Pour suivre l'état de chaque article du catalogue, nous calculons d'abord son taux de consommation journalier moyen à partir de l'historique de l'atelier :"),
        body("*taux_journalier_i = Consommation_Annuelle_i / 365*", { align: AlignmentType.CENTER, italics: true }),
        body("À partir de ce taux, deux indicateurs principaux sont suivis :"),
        bullet("**La couverture en jours** : durée d'autonomie estimée de l'atelier sans nouvelle livraison :\\n*couverture_jours_i = stock_actuel_i / taux_journalier_i*"),
        bullet("**Le coefficient de rotation** : fréquence de renouvellement du stock au cours de l'année :\\n*rotation_i = Consommation_Annuelle_i / stock_actuel_i*"),
        body("Une rotation élevée correspond à un article consommé rapidement nécessitant une vigilance accrue, tandis qu'une rotation très faible signale un produit peu utilisé risquant de s'accumuler inutilement."),
        pb(),

        title2("4.5 Classification des produits"),
        body("Chaque article du catalogue est classé selon son niveau de couverture disponible, conformément aux règles définies avec les équipes logistiques :"),
        pb(),
        makeTable(
          ["Statut du stock", "Condition appliquée", "Indicateur visuel", "Action recommandée"],
          [
            ["Rupture de Stock", "Stock disponible = 0 unité", "Rouge", "Commande urgente requise pour éviter l'arrêt machine."],
            ["Stock Critique", "Couverture < 15 jours de production", "Orange", "Lancement d'une commande prioritaire sous quelques jours."],
            ["Stock Normal", "15 jours ≤ Couverture < 120 jours", "Vert", "Niveau satisfaisant ; aucune commande immédiate nécessaire."],
            ["Surstock", "Couverture ≥ 120 jours", "Violet", "Report des prochaines commandes pour limiter l'immobilisation."]
          ],
          [2000, 3200, 1100, 2366]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.2 : Classification des produits par niveau de stock", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.6 Génération des recommandations"),
        title3("4.6.1 Calcul des quantités à commander"),
        body("Pour les articles en rupture ou en stock critique, le système évalue la quantité nécessaire pour rétablir une **couverture de sécurité de 45 jours** (couvrant un délai moyen de livraison de 30 jours et une marge de sécurité de 15 jours) :"),
        body("*Q_commander_i = max(Q_min_conditionnement, floor(taux_journalier_i * 45) - stock_actuel_i)*", { align: AlignmentType.CENTER, italics: true }),
        body("Un seuil minimal de commande est pris en compte pour respecter les unités usuelles de livraison (sacs de granulés, cartons ou palettes)."),
        pb(),

        title3("4.6.2 Estimation du budget"),
        body("Le montant prévisionnel des commandes est obtenu en multipliant les quantités suggérées par le coût unitaire de chaque référence :"),
        body("*Budget_Total = Σ (Q_commander_i * Prix_Unitaire_i)* pour les articles nécessitant un réapprovisionnement", { align: AlignmentType.CENTER, italics: true }),
        body("Cette estimation aide les responsables à anticiper les dépenses d'approvisionnement à court terme."),
        pb(),

        title3("4.6.3 Alertes prioritaires"),
        body("Pour faciliter la prise de décision, les alertes sont hiérarchisées selon l'impact potentiel d'une rupture sur la ligne de production. Le système met ainsi en avant les références les plus urgentes à traiter pour l'approvisionneur."),
        pb(),

        title2("4.7 Résultats obtenus"),
        body("L'analyse appliquée aux 6 875 articles du catalogue montre la répartition illustrée par la figure 4.2 :"),
        pb(),
        ...imageFigure("diagrams/segmentation_pareto_kmeans.png", "Figure 4.2 : Segmentation multicritère Pareto ABC et Clustering des stocks", 540, 250),
        body("Sur l'ensemble des références analysées :"),
        bullet("**Stock Normal** : 4 920 articles (71,6 %) présentent une couverture équilibrée."),
        bullet("**Rupture de Stock** : 312 articles (4,5 %) sont actuellement épuisés."),
        bullet("**Stock Critique** : 1 240 articles (18,0 %) disposent de moins de 15 jours d'autonomie."),
        bullet("**Surstock** : 403 articles (5,9 %) ont une couverture supérieure à 120 jours."),
        pb(),
        body("La figure 4.3 montre la répartition des articles en alerte selon les principales familles de matières :"),
        pb(),
        ...imageFigure("image/fig_5_3_ruptures_stocks.png", "Figure 4.3 : Synthèse des alertes d'atelier par catégorie d'articles", 520, 230),
        body("Le budget total estimé pour reconstituer les stocks des articles prioritaires sur un horizon de 45 jours s'élève à **2 418 650 TND**."),
        pb(),

        title2("4.8 Bilan du Sprint 2"),
        body("Le tableau 4.3 résume les livrables réalisés au cours du Sprint 2 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Architecture du module", "Schéma des étapes de traitement des stocks", "Réalisé"],
            ["Calcul des indicateurs", "Calcul automatique du taux de consommation, de la couverture et rotation", "Réalisé"],
            ["Classification des articles", "Répartition des références selon les 4 statuts de stock", "Réalisé"],
            ["Calcul des commandes", "Formule de réapprovisionnement pour une couverture de 45 jours", "Réalisé"],
            ["Chiffrage budgétaire", "Estimation du montant global des approvisionnements", "Réalisé"],
            ["Alertes d'atelier", "Identification des articles les plus urgents à commander", "Réalisé"],
            ["Exports de données", "Possibilité d'exporter les recommandations sous format tabulaire", "Réalisé"]
          ],
          [2600, 4866, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.3 : Bilan des livrables du Sprint 2", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.9 Conclusion"),
        conclusionBox("Ce chapitre a décrit le module de gestion des stocks développé lors du Sprint 2. En exploitant les données fiabilisées du Data Warehouse, la solution permet de passer d'une gestion réactive à un suivi plus régulier et prévisionnel, en identifiant rapidement les références à réapprovisionner et les situations de surstock. Le chapitre suivant aborde le Sprint 3, consacré à la modélisation prédictive des cadences de production par apprentissage automatique."),
        pageBreak(),
    '''

print("Chapter 4 module defined.")
