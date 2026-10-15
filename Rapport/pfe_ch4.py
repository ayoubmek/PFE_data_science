# -*- coding: utf-8 -*-
"""
Chapitre 4 : Sprint 2 : Développement du module de gestion intelligente des stocks pour Nexora (pfe_v5.docx)
Matches outline: 4.1 à 4.9
Style : Simple, académique, professionnel, sans jargon excessif.
Unité unique : 800 références distinctes du catalogue (DIM_FamArt).
"""

def get_chapter4():
    return '''
        // =========================================================
        // CHAPITRE 4 : SPRINT 2 : GESTION INTELLIGENTE DES STOCKS
        // =========================================================
        title1("Chapitre 4 : Sprint 2 : Développement du module de gestion intelligente des stocks"),

        title2("4.1 Introduction"),
        body("Ce chapitre correspond au Sprint 2 de notre démarche Scrum. Dans un atelier de plasturgie automobile, la gestion proactive des stocks de matières premières (résines thermoplastiques telles que PP, PA66 ou ABS) et de sous-composants est déterminante pour prévenir les arrêts inopinés de presses tout en limitant l'immobilisation financière liée aux surstocks. L'objectif de ce sprint est de concevoir le module de **gestion intelligente des stocks** de la plateforme Nexora. En s'appuyant sur les données assainies issues du Data Warehouse, ce module segmente le catalogue d'articles, analyse la couverture restante, génère des alertes visuelles hiérarchisées et calcule les réapprovisionnements optimaux pour sécuriser un horizon de 45 jours d'activité sur le référentiel des 800 articles [14, 15]."),
        pb(),

        title2("4.2 Backlog du Sprint 2"),
        body("Le tableau 4.1 récapitule les tâches planifiées pour le Sprint 2 avec leur priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Définition des flux logistiques et architecture du module de gestion des stocks", "1 jour"],
            ["Élevée", "Calcul des taux de consommation journaliers, de la couverture en jours et des rotations", "2 jours"],
            ["Élevée", "Classification des références selon les niveaux d'autonomie et de risque", "3 jours"],
            ["Élevée", "Mise en place de la classification par niveau de risque (Rupture, Critique, Normal, Surstock)", "2 jours"],
            ["Élevée", "Développement de l'algorithme de calcul des commandes d'approvisionnement", "3 jours"],
            ["Moyenne", "Chiffrage budgétaire global des approvisionnements prioritaires", "2 jours"],
            ["Moyenne", "Hiérarchisation des alertes d'atelier et intégration des fonctions d'exportation", "2 jours"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.1 : Priorisation des tâches pour le Sprint 2", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.3 Architecture fonctionnelle du module de gestion des stocks"),
        body("Le fonctionnement du module repose sur un enchaînement méthodique en quatre phases logistiques :"),
        bullet("**1. Ingestion des données d'inventaire** : lecture des stocks physiques disponibles et des valorisations d'inventaire depuis la table `ASTOCKDATE` du Data Warehouse."),
        bullet("**2. Calcul des indicateurs logistiques** : calcul du taux de consommation journalier, de l'autonomie restante en jours de production et de la vitesse de rotation."),
        bullet("**3. Classification opérationnelle des articles** : segmentation dynamique des 800 références du catalogue selon leur niveau d'autonomie et de criticité (Rupture, Critique, Normal, Surstock), permettant un ciblage précis des urgences logistiques."),
        bullet("**4. Recommandations et budgétisation** : proposition de quantités de commande pour sécuriser un horizon de 45 jours calculées à partir du taux de consommation validé, calcul de l'enveloppe budgétaire et émission d'alertes."),
        pb(),

        title2("4.4 Analyse des niveaux de stock et indicateurs de rotation"),
        body("Pour évaluer la situation de chaque référence du catalogue, nous calculons son taux de consommation journalier historique à partir de l'activité annuelle de l'atelier :"),
        body("*Taux_Journalier_Historique_i = Consommation_Annuelle_i / 365*", { align: AlignmentType.CENTER, italics: true }),
        body("Deux indicateurs fondamentaux de gestion industrielle [14] sont systématiquement suivis pour chaque référence :"),
        bullet("**La couverture disponible en jours** : durée d'autonomie estimée de la production en l'absence de toute nouvelle livraison :\\n*Couverture_Jours_i = Stock_Actuel_i / Taux_Journalier_i*"),
        bullet("**Le coefficient de rotation du stock** : fréquence de renouvellement complet de l'inventaire au cours de l'exercice :\\n*Rotation_i = Consommation_Annuelle_i / Stock_Actuel_i*"),
        body("Une rotation élevée caractérise un article consommé rapidement exigeant des flux logistiques tendus, alors qu'une rotation anormalement basse signale une référence dormante engendrant des frais d'entreposage superflus."),
        pb(),

        title2("4.5 Classification opérationnelle et analyse de criticité des stocks"),
        title3("4.5.1 Typologie des statuts de stock et seuils d'autonomie"),
        body("Dans une logique industrielle réactive et pragmatique, la plateforme Nexora privilégie une classification opérationnelle directement articulée aux contraintes de fabrication. Plutôt que de reposer sur des segmentations théoriques déconnectées des urgences terrain, chaque référence des **800 articles du catalogue unique** (`DIM_FamArt`) est évaluée en continu selon son autonomie restante en jours de production. Cette approche permet de catégoriser l'ensemble du référentiel en quatre états opérationnels distincts, établis en concertation avec les responsables logistiques et la direction d'atelier [9, 14] :"),
        pb(),
        makeTable(
          ["Statut du stock", "Condition appliquée", "Indicateur visuel", "Action opérationnelle recommandée"],
          [
            ["Rupture de Stock", "Stock physique = 0 unité", "Rouge", "Commande d'extrême urgence et réordonnancement pour éviter l'arrêt machine."],
            ["Stock Critique", "Stock > 0 et Couverture < 15 jours", "Orange", "Déclenchement d'un réapprovisionnement prioritaire sous 48 heures."],
            ["Stock Normal", "15 jours ≤ Couverture < 120 jours", "Vert", "Niveau nominal équilibré ; aucune commande immédiate requise."],
            ["Surstock", "Couverture ≥ 120 jours", "Violet", "Gel des commandes futures pour limiter l'immobilisation de trésorerie."]
          ],
          [2000, 3200, 1100, 2366]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.2 : Classification des produits selon le niveau de couverture disponible", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("4.5.2 Répartition du catalogue et analyse de criticité"),
        body("L'application de cette grille d'analyse sur l'inventaire consolidé du Data Warehouse fournit une cartographie précise de l'état des stocks d'atelier :"),
        bullet("**Articles en situation nominale (Stock Normal)** : représentent la majorité du catalogue avec **557 références (69,6 %)**. Leur couverture assure le fonctionnement régulier des presses sans intervention logistique immédiate."),
        bullet("**Articles sous tension prioritaire (Rupture et Stock Critique)** : regroupent **193 références au total (24,1 % du catalogue)**. Parmi elles, **47 références (5,9 %)** sont en rupture totale (stock nul sur site) et menacent directement la continuité des plannings d'injection, tandis que **146 références (18,2 %)** présentent une autonomie critique inférieure à 15 jours nécessitant une commande immédiate."),
        bullet("**Articles excédentaires (Surstock)** : concernent **50 références (6,3 %)** dont la couverture excède 120 jours de consommation. Pour ces articles, l'émission de nouvelles commandes est bloquée pour réduire les coûts de possession et d'immobilisation de trésorerie."),
        pb(),

        title2("4.6 Génération des recommandations et chiffrage budgétaire"),
        title3("4.6.1 Algorithme de réapprovisionnement à horizon cible de 45 jours"),
        body("Pour les références en situation de Rupture ou de Stock Critique, le système calcule la quantité exacte requise pour rétablir une **couverture de sécurité de 45 jours** (couvrant un délai moyen d'approvisionnement fournisseur de 30 jours augmenté d'un stock de sécurité de 15 jours) :"),
        body("*Q_commander_i = max(Q_min_conditionnement, ⌈Taux_Journalier_i × 45⌉ - Stock_Actuel_i)*", { align: AlignmentType.CENTER, italics: true }),
        body("avec :"),
        body("*Taux_Journalier_i = Consommation_Annuelle_i / 365*", { align: AlignmentType.CENTER, italics: true }),
        body("Cette formulation, directement issue du moteur logistique du système, s'appuie sur la consommation annuelle validée dans le Data Warehouse. Elle garantit un réapprovisionnement proportionné aux cadences réelles sans introduire d'instabilité artificielle liée aux incertitudes prévisionnelles. L'intégration d'une pondération dynamique par les prévisions d'apprentissage automatique constitue une perspective d'évolution modulaire."),
        pb(),

        title3("4.6.2 Estimation du budget d'approvisionnement"),
        body("Le montant financier prévisionnel des réapprovisionnements est obtenu en valorisant les quantités suggérées par le coût unitaire d'achat réel enregistré dans le Data Warehouse :"),
        body("*Budget_Total = Σ (Q_commander_i × Prix_Unitaire_i)* pour l'ensemble des références i ∈ (Rupture ∪ Critique)", { align: AlignmentType.CENTER, italics: true }),
        body("Cette métrique offre à l'administrateur une visibilité consolidée sur les engagements de trésorerie nécessaires à la continuité de la production."),
        pb(),

        title3("4.6.3 Hiérarchisation des alertes d'atelier"),
        body("Les alertes sont classées par ordre décroissant de criticité en combinant le statut opérationnel de stock, le niveau d'autonomie restante et les délais fournisseurs, assurant que l'administrateur et l'opérateur d'atelier traitent en priorité les matières indispensables au maintien des lignes d'injection."),
        pb(),

        title2("4.7 Résultats obtenus"),
        body("L'analyse de l'état des stocks est conduite sur l'unité maîtresse du référentiel produit : **les 800 références distinctes du catalogue (`DIM_FamArt`)**."),
        pb(),
        body("Sur ces 800 références d'articles, la distribution opérationnelle des stocks issue du Data Warehouse s'établit ainsi :"),
        bullet("**Stock Normal** : 557 références (69,6 %) disposent d'un niveau d'autonomie équilibré compris entre 15 et 120 jours."),
        bullet("**Rupture de Stock** : 47 références (5,9 %) ont un stock physique nul et requièrent une relance immédiate."),
        bullet("**Stock Critique** : 146 références (18,2 %) présentent une autonomie strictement inférieure à 15 jours."),
        bullet("**Surstock** : 50 références (6,2 %) dépassent 120 jours de couverture."),
        pb(),
        body("La figure 4.1 illustre la répartition opérationnelle des références du catalogue selon les quatre statuts de criticité :"),
        pb(),
        ...imageFigure("diagrams/repartition_stocks_statut.png", "Figure 4.1 : Répartition des références du catalogue par statut opérationnel de stock", 540, 250),
        pb(),
        body("La figure 4.2 présente la synthèse des articles en alerte regroupés par grande famille de matières plastiques :"),
        pb(),
        ...imageFigure("image/fig_5_3_ruptures_stocks.png", "Figure 4.2 : Répartition des alertes de rupture et de stock critique par famille de matière", 520, 230),
        pb(),
        body("Au total, le plan de réapprovisionnement à 45 jours concerne **193 références distinctes** (47 en rupture et 146 critiques, soit 24,1 % du catalogue). La quantité globale à commander s'élève à **847 204 unités**, pour un **budget total prévisionnel estimé à environ 380 400 TND** (380 393 TND). Ce budget est calculé directement d'après les coûts unitaires réels constatés dans le Data Warehouse (coût moyen de 0,45 TND par unité sur les références concernées)."),
        pb(),

        title2("4.8 Bilan du Sprint 2"),
        body("Le tableau 4.3 dresse le bilan des livrables réalisés au terme du Sprint 2 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Architecture du module", "Schéma fonctionnel des flux et indicateurs de gestion des stocks", "Réalisé"],
            ["Calcul des indicateurs", "Calcul automatisé des taux journaliers, de la couverture et des rotations", "Réalisé"],
            ["Classification opérationnelle", "Répartition des références du catalogue en états de criticité", "Réalisé"],
            ["Classification par statut", "Hiérarchisation visuelle selon les statuts opérationnels de stock", "Réalisé"],
            ["Algorithme de réapprovisionnement", "Formule de calcul des besoins basée sur la consommation d'atelier", "Réalisé"],
            ["Chiffrage budgétaire", "Calcul de l'enveloppe budgétaire des approvisionnements prioritaires", "Réalisé"],
            ["Alertes et exports", "Vues d'alertes priorisées et exportation tabulaire pour les achats", "Réalisé"]
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
        conclusionBox("Ce chapitre a détaillé le développement du module de gestion intelligente des stocks lors du Sprint 2. En associant une classification opérationnelle en quatre niveaux de criticité selon l'autonomie réelle et une formule de réapprovisionnement sur 45 jours basée sur la consommation d'atelier validée, la plateforme Nexora remplace les pratiques manuelles par un pilotage dynamique et préventif unifié sur les 800 références du catalogue. Le chapitre suivant aborde le Sprint 3, consacré à la modélisation prédictive par Intelligence Artificielle et aux prévisions de cadence."),
        pageBreak(),
    '''

print("Chapter 4 module defined.")
