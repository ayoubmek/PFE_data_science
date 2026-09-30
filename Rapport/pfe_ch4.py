# -*- coding: utf-8 -*-
"""
Chapitre 4 : Sprint 2 : Développement du module de gestion intelligente des stocks pour Nexora (pfe.docx)
Matches outline: 4.1 à 4.9
"""

def get_chapter4():
    return '''
        // =========================================================
        // CHAPITRE 4 : SPRINT 2 : GESTION INTELLIGENTE DES STOCKS
        // =========================================================
        title1("Chapitre 4 : Sprint 2 : Développement du module de gestion intelligente des stocks"),

        title2("4.1 Introduction"),
        body("Ce chapitre correspond au Sprint 2 de notre démarche Agile Scrum. La maîtrise rigoureuse des stocks de matières premières (résines thermoplastiques, polymères techniques) et de composants injectés constitue un enjeu stratégique vital pour la rentabilité et la continuité d'exploitation d'un équipementier automobile Tier-1. L'objectif de ce sprint est de concevoir et d'implémenter le module de **gestion intelligente et proactive des stocks** de la plateforme Nexora. En exploitant l'état d'inventaire et les flux physiques consolidés issus du Data Warehouse Microsoft SQL Server (table Item Ledger Entry), ce module évalue en temps réel le niveau de risque des 6 875 références d'articles, diagnostique instantanément les pénuries et génère automatiquement des préconisations de réapprovisionnement chiffrées pour sécuriser la continuité de fabrication."),
        pb(),

        title2("4.2 Backlog du Sprint 2"),
        body("Le tableau 4.1 récapitule les tâches ordonnancées pour le Sprint 2 avec leur priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche d'Ingénierie de Gestion des Stocks", "Durée estimée"],
          [
            ["Élevée", "Conception de l'architecture fonctionnelle en 4 étapes du module de stock", "1 jour"],
            ["Élevée", "Calcul automatisé des consommations moyennes, de la couverture d'atelier et de la rotation", "2 jours"],
            ["Élevée", "Classification catégorielle des 6 875 articles (Rupture, Critique, Normal, Surstock)", "2 jours"],
            ["Élevée", "Modélisation de l'algorithme de calcul des quantités économiques pour une couverture de 45 jours", "2 jours"],
            ["Moyenne", "Moteur d'alertes prédictives priorisées par coût d'arrêt de ligne évité", "1 jour"],
            ["Faible", "Intégration des visualisations d'inventaire et export CSV/XLSX dans l'application", "1 jour"]
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
        body("Le module de gestion intelligente des stocks opère selon un processus séquentiel en quatre étapes majeures, illustré par la figure 4.1 :"),
        pb(),
        ...imageFigure("diagrams/sprint3_activity.png", "Figure 4.1 : Architecture et flux d'exécution du module de gestion des stocks", 520, 240),
        bullet("**1. Données d'entrée** : ingestion continue des stocks physiques actuels et des mouvements historiques issus de la table *Item Ledger Entry* du Data Warehouse."),
        bullet("**2. Calcul des métriques d'inventaire** : calcul dynamique du taux de consommation journalier moyen, de la couverture en jours et du coefficient de rotation."),
        bullet("**3. Classification multi-niveaux** : catégorisation instantanée de chaque article dans un état d'inventaire normé."),
        bullet("**4. Moteur prescriptif** : dimensionnement automatique des commandes à passer, évaluation du budget d'approvisionnement et déclenchement d'alertes d'atelier."),
        pb(),

        title2("4.4 Analyse des niveaux de stock et de rotation"),
        body("Pour traduire les flux physiques d'atelier en indicateurs opérationnels pour chacun des 6 875 composants et polymères du catalogue, nous calculons pour chaque article *i* le taux de consommation journalier moyen sur la base de l'historique d'atelier consolidé :"),
        body("*taux_journalier_i = Consommation_Annuelle_i / 365*", { align: AlignmentType.CENTER, italics: true }),
        body("À partir de ce taux de consommation, deux indicateurs clés sont recalculés en continu pour chaque référence :"),
        bullet("**La couverture en jours** : durée résiduelle d'autonomie de l'atelier sans réapprovisionnement :\\n*couverture_jours_i = stock_actuel_i / taux_journalier_i*"),
        bullet("**Le coefficient de rotation du stock** : indicateur d'intensité d'écoulement matière :\\n*rotation_i = Consommation_Annuelle_i / stock_actuel_i*"),
        body("Une rotation élevée caractérise un composant à flux tendu hautement sensible, tandis qu'une rotation anormalement basse signale un article dormant risquant l'obsolescence technique et immobilisant du capital."),
        pb(),

        title2("4.5 Classification des produits"),
        body("Chaque référence du catalogue est classée selon des règles strictes définies conjointement avec la direction logistique de l'usine :"),
        pb(),
        makeTable(
          ["Statut du Stock", "Règle de Gestion et Condition Métier", "Couleur", "Action Opérationnelle Requise"],
          [
            ["Rupture de Stock", "Stock physique = 0 unité (presse à l'arrêt)", "Rouge", "Déclenchement immédiat d'une commande d'urgence."],
            ["Stock Critique", "Couverture disponible < 15 jours de fabrication", "Orange", "Lancement d'un bon de commande prioritaire sous 7 jours."],
            ["Stock Normal", "15 jours ≤ Couverture < 120 jours", "Vert", "Niveau nominal de sécurité ; aucune action requise."],
            ["Surstock", "Couverture ≥ 120 jours (capital immobilisé)", "Violet", "Gel temporaire des commandes et rééquilibrage inter-usines."]
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
        body("Pour tout article identifié en état de Rupture ou de Stock Critique, le module calcule automatiquement la quantité optimale à commander afin de rétablir une **couverture cible sécurisée de 45 jours** (couvrant le délai moyen d'approvisionnement fournisseur de 30 jours augmenté d'un stock tampon de sécurité de 15 jours) :"),
        body("*Q_commander_i = max(Q_min_conditionnement, floor(taux_journalier_i * 45) - stock_actuel_i)*", { align: AlignmentType.CENTER, italics: true }),
        body("Un seuil minimal de commande respectant les unités logistiques de livraison (sacs de granulés de 25 kg, fûts ou palettes complètes) est automatiquement imposé pour préserver la rentabilité des coûts de transport."),
        pb(),

        title3("4.6.2 Estimation du budget"),
        body("Le budget d'approvisionnement global recommandé est calculé en valorisant chaque quantité préconisée par son coût d'achat unitaire :"),
        body("*Budget_Total = Σ (Q_commander_i * Prix_Achat_Unitaire_i)* pour tous les articles en Rupture ou Critique", { align: AlignmentType.CENTER, italics: true }),
        body("Ce chiffrage instantané permet aux acheteurs et à la direction financière d'anticiper les décaissements de trésorerie sur les quatre semaines à venir."),
        pb(),

        title3("4.6.3 Alertes intelligentes"),
        body("Afin de guider les approvisionneurs d'atelier submergés par le volume d'articles, le système génère des alertes prescriptives priorisées par le **coût financier d'arrêt de ligne évité** :"),
        body("*Perte_Estimée_i = max(0, (45 - couverture_jours_i) * taux_journalier_i * Coût_Horaire_Arrêt)*", { align: AlignmentType.CENTER, italics: true }),
        body("Le système extrait et met en exergue dans le tableau de bord le top 20 des urgences absolues nécessitant une décision immédiate du responsable logistique."),
        pb(),

        title2("4.7 Résultats obtenus"),
        body("L'analyse menée sur l'ensemble des 6 875 articles du catalogue d'entreprise révèle la répartition visuelle présentée en figure 4.2 :"),
        pb(),
        ...imageFigure("diagrams/segmentation_pareto_kmeans.png", "Figure 4.2 : Segmentation multicritère Pareto ABC et Clustering des stocks", 540, 250),
        body("Sur les 6 875 articles :"),
        bullet("**Stock Normal** : 4 920 articles (71,6 %) sont à un niveau de couverture sain."),
        bullet("**Rupture de Stock** : 312 articles (4,5 %) sont en rupture complète."),
        bullet("**Stock Critique** : 1 240 articles (18,0 %) présentent moins de 15 jours d'autonomie."),
        bullet("**Surstock** : 403 articles (5,9 %) immobilisent inutilement du fonds de roulement."),
        pb(),
        body("La figure 4.3 illustre la concentration des articles en rupture et en stock critique selon les familles de matières plastiques :"),
        pb(),
        ...imageFigure("image/fig_5_3_ruptures_stocks.png", "Figure 4.3 : Synthèse des alertes d'atelier par catégorie d'articles", 520, 230),
        body("Les familles techniques les plus exposées au risque de pénurie sont les résines polyamide PA66 renforcées, les connecteurs étanches sous-capot et les colorants maîtres, en raison de délais fournisseurs atteignant jusqu'à six semaines."),
        body("Le budget total de réapprovisionnement recommandé pour sécuriser l'ensemble du catalogue s'élève à **2 418 650 TND**."),
        pb(),

        title2("4.8 Bilan du Sprint 2"),
        body("Le tableau 4.3 récapitule les livrables validés au terme du Sprint 2 :"),
        pb(),
        makeTable(
          ["Tâche réalisée", "Livrable Produit et Validé", "Statut"],
          [
            ["Architecture du module", "Schéma fonctionnel en 4 étapes de gestion des stocks", "Réalisé"],
            ["Calcul des indicateurs", "Moteur dynamique de calcul du taux, de la couverture et rotation", "Réalisé"],
            ["Classification catalogue", "Répartition des 6 875 articles en 4 statuts d'inventaire", "Réalisé"],
            ["Dimensionnement des commandes", "Formule de réapprovisionnement sur horizon 45 jours", "Réalisé"],
            ["Chiffrage budgétaire", "Estimation du budget global (2 418 650 TND)", "Réalisé"],
            ["Moteur d'alertes", "Top 20 des articles critiques priorisés par risque financier", "Réalisé"],
            ["Export des recommandations", "Génération de rapports exportables en CSV et Excel (.xlsx)", "Réalisé"]
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
        conclusionBox("Ce chapitre a présenté le module de gestion intelligente et prédictive des stocks d'atelier développé durant le Sprint 2. En exploitant les données consolidées du Data Warehouse, Nexora transforme une information brute en décisions de réapprovisionnement hiérarchisées et chiffrées. Ce passage d'une gestion réactive à un pilotage proactif permet d'éradiquer les ruptures de matières critiques tout en assainissant les surstocks dormants. Le chapitre suivant aborde le Sprint 3, consacré au développement et à l'entraînement des modèles d'intelligence artificielle pour la prévision de production."),
        pageBreak(),
    '''

print("Chapter 4 module defined.")
