# -*- coding: utf-8 -*-
"""
Chapitre 6 : Sprint 4 : Développement du tableau de bord décisionnel et validation pour Nexora (pfe.docx)
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
        body("Ce chapitre correspond au Sprint 4, dernière étape de réalisation de notre projet. Après avoir mis en place le pipeline ETL (Sprint 1), le module de gestion des stocks (Sprint 2) et les modèles de prévision (Sprint 3), ce sprint a pour objectif d'intégrer ces différents travaux au sein de tableaux de bord décisionnels. Les rapports développés sous Microsoft Power BI et connectés au Data Warehouse dbDWH1 permettent aux équipes d'atelier et aux responsables de suivre les indicateurs de production, de visualiser les prévisions de cadence et de piloter les niveaux de stock."),
        pb(),

        title2("6.2 Backlog du Sprint 4"),
        body("Le tableau 6.1 présente les tâches planifiées pour le Sprint 4 avec leur priorité et leur durée estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Connexion des rapports au Data Warehouse dbDWH1 et modélisation des données", "1 jour"],
            ["Élevée", "Conception du rapport Power BI « Supervision de Production & TRG »", "2 jours"],
            ["Élevée", "Conception du rapport Power BI « Prévision des Cadences par IA »", "2 jours"],
            ["Élevée", "Conception du rapport Power BI « Gestion des Stocks & Alertes »", "2 jours"],
            ["Moyenne", "Écriture des mesures DAX (calcul du TRG, seuils critiques, taux de rotation)", "1 jour"],
            ["Moyenne", "Configuration des filtres par profil d'utilisateur et publication du rapport", "1 jour"],
            ["Faible", "Tests fonctionnels avec les utilisateurs d'atelier et rédaction du guide d'utilisation", "1 jour"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.1 : Priorisation des tâches : Sprint 4", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.3 Architecture du tableau de bord"),
        body("La figure 6.1 présente l'architecture d'intégration de la solution décisionnelle **Nexora** :"),
        pb(),
        ...imageFigure("diagrams/arch_physique.png", "Figure 6.1 : Architecture globale et déploiement du tableau de bord Nexora", 540, 240),
        bullet("**1. Données du Data Warehouse** : tables consolidées de SQL Server (Fact_PA, FACT_Mvts_Stocks, DIM_OF-Mach, DIM_FamArt) alimentées par le pipeline ETL."),
        bullet("**2. Backend applicatif** : serveur Spring Boot assurant les services d'accès et la gestion des utilisateurs."),
        bullet("**3. Service de prévision** : module Python fournissant les prévisions de cadences calculées par le modèle Prophet et la détection d'anomalies."),
        bullet("**4. Rapports Power BI** : tableaux de bord interactifs proposant des visualisations adaptées aux besoins de supervision et de suivi des stocks."),
        pb(),

        title2("6.4 Diagramme de séquence"),
        body("La figure 6.2 illustre le déroulement type des échanges lors de la consultation d'un rapport décisionnel :"),
        pb(),
        ...imageFigure("diagrams/sprint4_seq.png", "Figure 6.2 : Diagramme de séquence : interaction utilisateur, tableau de bord et modèle prédictif", 540, 260),
        body("Lors de la sélection d'un filtre (par exemple une famille d'articles ou une période d'analyse), Power BI interroge les tables du Data Warehouse dbDWH1. Les indicateurs calculés et les courbes de prévision sont automatiquement mis à jour à l'écran."),
        pb(),

        title2("6.5 Développement des interfaces"),
        title3("6.5.1 Tableau de bord de supervision et TRG"),
        body("Ce rapport offre une vue globale sur le parc de 319 presses à injecter réparties sur les différents ateliers :"),
        bullet("**Indicateurs clés d'atelier** : valeur globale du TRG, décomposée en taux de disponibilité, de performance et de qualité."),
        bullet("**État du parc machines** : vue d'ensemble indiquant le nombre de presses en fonctionnement, en arrêt ou en maintenance."),
        bullet("**Suivi des arrêts** : classement des causes principales d'interruption (changement de moule, panne mécanique, réglage)."),
        pb(),

        title3("6.5.2 Tableau de bord des prévisions"),
        body("Ce rapport permet de visualiser les volumes de fabrication projetés par les modèles d'apprentissage :"),
        bullet("**Choix de l'horizon de prévision** : sélection possible à 7 jours (court terme), 15 jours (moyen terme) ou 30 jours (planning mensuel)."),
        bullet("**Comparaison réel / prévu** : superposition de la courbe des cadences réelles et de la trajectoire estimée avec son intervalle d'incertitude à 95 %."),
        bullet("**Détail par période** : tableau récapitulant les volumes journaliers attendus pour faciliter l'ordonnancement."),
        pb(),

        title3("6.5.3 Tableau de bord des stocks"),
        body("Ce rapport est destiné au suivi des 6 875 références d'articles du catalogue :"),
        bullet("**Répartition par statut de stock** : synthèse visuelle du nombre d'articles en Rupture, Stock Critique, Normal ou Surstock."),
        bullet("**Filtres de recherche** : recherche par référence, par famille de matière plastique (PP, PA66, ABS) ou par niveau d'urgence."),
        bullet("**Alertes et recommandations** : affichage des références prioritaires avec indication de la quantité suggérée pour atteindre 45 jours de couverture."),
        bullet("**Export des résultats** : possibilité d'exporter les données filtrées sous format tabulaire (Excel / CSV) pour les échanges avec les fournisseurs."),
        pb(),

        title2("6.6 Présentation des interfaces réalisées"),
        title3("6.6.1 Tableau de bord principal"),
        body("La figure 6.3 montre la vue générale du rapport décisionnel Power BI Nexora, centralisant les indicateurs synthétiques de production et de stock :"),
        pb(),
        ...imageFigure("image/powerbi_3.png", "Figure 6.3 : Vue d'ensemble du tableau de bord décisionnel Power BI Nexora", 540, 260),
        pb(),

        title3("6.6.2 Analyse de la production"),
        body("La figure 6.4 illustre la vue de suivi des machines et du Taux de Rendement Global :"),
        pb(),
        ...imageFigure("image/powerbi_1.png", "Figure 6.4 : Interface « Supervision de la production et TRG »", 540, 280),
        body("La figure 6.5 présente la répartition des pièces produites selon les principales catégories de composants :"),
        pb(),
        ...imageFigure("image/powerbi_2.png", "Figure 6.5 : Répartition des volumes par famille de composants plastiques", 540, 280),
        pb(),

        title3("6.6.3 Prévisions des cadences"),
        body("La figure 6.6 présente l'écran de prévision à 30 jours avec la trajectoire estimée et les bornes d'incertitude :"),
        pb(),
        ...imageFigure("image/powerbi_4.png", "Figure 6.6 : Rapport Power BI « Prévision des cadences et charge atelier »", 540, 270),
        pb(),

        title3("6.6.4 Gestion des stocks d'atelier"),
        body("La figure 6.7 illustre l'interface dédiée au suivi des stocks et aux alertes d'approvisionnement :"),
        pb(),
        ...imageFigure("image/powerbi_5.png", "Figure 6.7 : Rapport Power BI « Gestion des stocks d'atelier »", 540, 270),
        pb(),

        title2("6.7 Tests et validation"),
        title3("6.7.1 Tests fonctionnels"),
        body("Afin de vérifier le bon fonctionnement du système, plusieurs scénarios de tests ont été déroulés :"),
        pb(),
        makeTable(
          ["Fonctionnalité testée", "Protocole de test", "Résultat et statut"],
          [
            ["Connexion au Data Warehouse", "Interrogation des tables Fact_PA et FACT_Mvts_Stocks depuis Power BI.", "Connexion établie, actualisation des visuels fluide. (Validé)"],
            ["Calcul du TRG", "Vérification des formules DAX sur des séries de production types.", "Calcul conforme aux définitions industrielles standard. (Validé)"],
            ["Affichage des prévisions (7j)", "Sélection de l'horizon court terme et contrôle des courbes générées.", "Affichage correct de la trajectoire et de la zone d'incertitude. (Validé)"],
            ["Filtrage des stocks par famille", "Sélection d'une matière (ex: PA66) et vérification des compteurs d'état.", "Mise à jour immédiate des indicateurs de rupture. (Validé)"],
            ["Calcul de la couverture 45j", "Contrôle des quantités suggérées pour les articles critiques.", "Conformité des propositions avec la formule définie. (Validé)"],
            ["Export des données", "Téléchargement d'un tableau d'alerte vers Excel.", "Export réussi avec conservation des colonnes et des formats. (Validé)"]
          ],
          [2600, 3100, 2966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.2 : Résultats des tests fonctionnels", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("6.7.2 Validation des prévisions"),
        body("La comparaison des volumes réels et des prévisions calculées sur la période de test confirme que le modèle reproduit convenablement le rythme hebdomadaire de l'atelier, avec un niveau d'erreur contenu permettant d'aider à la planification."),
        pb(),

        title3("6.7.3 Validation des recommandations de stock"),
        body("L'application des règles de couverture à 45 jours a permis d'identifier clairement les articles nécessitant une commande immédiate, offrant aux approvisionneurs une liste de priorités plus lisible que les vérifications manuelles habituelles."),
        pb(),

        title3("6.7.4 Retours des utilisateurs"),
        body("La présentation des interfaces à des utilisateurs d'atelier a permis de valider la clarté des visualisations et la facilité de navigation entre les différents rapports, confirmant l'utilité des tableaux de bord pour le suivi au quotidien."),
        pb(),

        title2("6.8 Bilan du Sprint 4"),
        body("Le tableau 6.3 résume les livrables réalisés au terme du Sprint 4 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Modélisation Power BI", "Connexion au Data Warehouse dbDWH1 et écriture des mesures DAX", "Réalisé"],
            ["Rapport Production & TRG", "Tableau de bord de suivi du parc machines et du TRG", "Réalisé"],
            ["Rapport Prévisions", "Tableau de bord présentant les estimations de cadence à 7, 15 et 30 jours", "Réalisé"],
            ["Rapport Gestion des stocks", "Tableau de bord d'analyse d'inventaire, de classification et d'alertes", "Réalisé"],
            ["Tests fonctionnels", "Vérification des différents scénarios d'utilisation en atelier", "Réalisé"],
            ["Documentation", "Guide d'utilisation synthétique des rapports", "Réalisé"]
          ],
          [2600, 4866, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.3 : Bilan des livrables du Sprint 4", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.9 Conclusion"),
        conclusionBox("Ce chapitre a présenté la conception et la validation des tableaux de bord décisionnels de la plateforme Nexora. En regroupant au sein de rapports Power BI le suivi des machines, les prévisions de fabrication issues des modèles d'apprentissage et la gestion des stocks du Data Warehouse, la solution apporte un outil pratique d'aide à la décision pour les équipes d'atelier. La conclusion générale suivante dresse le bilan global du projet et présente ses perspectives d'évolution."),
        pageBreak(),
    '''

print("Chapter 6 module defined.")
