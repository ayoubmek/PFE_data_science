# -*- coding: utf-8 -*-
"""
Chapitre 6 : Sprint 4 : Développement du tableau de bord décisionnel et validation pour Nexora (pfe.docx)
Matches EXACT outline: 6.1 à 6.9
"""

def get_chapter6():
    return '''
        // =========================================================
        // CHAPITRE 6 : SPRINT 4 : TABLEAUX DE BORD ET VALIDATION
        // =========================================================
        title1("Chapitre 6 : Sprint 4 : Développement du tableau de bord décisionnel et validation"),

        title2("6.1 Introduction"),
        body("Ce chapitre correspond au Sprint 4, ultime itération de développement de notre projet. Après avoir mis en place le pipeline ETL (Sprint 1), développé le module de gestion des stocks (Sprint 2) et entraîné les modèles d'intelligence artificielle (Sprint 3), l'enjeu de ce sprint est de regrouper l'ensemble de ces briques au sein d'un portail décisionnel unifié, ergonomique et directement exploitable par les opérationnels d'atelier et la direction industrielle. Ces rapports Power BI Desktop / Power BI Service, connectés en mode DirectQuery au Data Warehouse SQL Server, centralisent les indicateurs de production, les prévisions de cadence et le pilotage des stocks, concrétisant la valeur ajoutée du système Nexora."),
        pb(),

        title2("6.2 Backlog du Sprint 4"),
        body("Le tableau 6.1 détaille les tâches planifiées pour ce dernier sprint de réalisation :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de Conception et de Recette Décisionnelle Power BI", "Durée estimée"],
          [
            ["Élevée", "Connexion DirectQuery au DWH SQL Server et modélisation en étoile", "1 jour"],
            ["Élevée", "Conception du rapport Power BI « Supervision de Production & TRG »", "2 jours"],
            ["Élevée", "Conception du rapport Power BI « Prévision des Cadences par IA »", "2 jours"],
            ["Élevée", "Conception du rapport Power BI « Gestion Prédictive des Stocks & Alertes »", "2 jours"],
            ["Moyenne", "Développement des mesures DAX (TRG, variances, seuils critiques de stock)", "1 jour"],
            ["Moyenne", "Configuration de la sécurité au niveau des lignes (RLS) et publication Power BI Service", "1 jour"],
            ["Faible", "Recette fonctionnelle avec les chefs d'atelier et documentation utilisateur", "1 jour"]
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
        body("La figure 6.1 illustre l'architecture globale du portail décisionnel **Nexora**, articulée autour de quatre couches interactives :"),
        pb(),
        ...imageFigure("diagrams/arch_physique.png", "Figure 6.1 : Architecture globale et déploiement du tableau de bord Nexora", 540, 240),
        bullet("**1. Sources de données** : tables de faits du Data Warehouse SQL Server (1,5M mouvements, 250k enregistrements machines) synchronisées par le pipeline ETL."),
        bullet("**2. Couche API & Cache** : backend Spring Boot 3 assurant la gestion des sessions JWT, la mise en cache Redis des indicateurs chauds et la sécurisation RBAC."),
        bullet("**3. Microservice de Machine Learning** : service FastAPI en Python 3.10 hébergeant le modèle champion Prophet ainsi que les modèles comparatifs (Random Forest, ARIMA, Régression Linéaire) et Isolation Forest pour l'inférence temps réel."),
        bullet("**4. Rapports Power BI Desktop / Service** : tableaux de bord publiés sur Power BI Service, connectés en mode DirectQuery au Data Warehouse SQL Server, offrant des visuels interactifs (graphiques, matrices, KPI) avec sécurité au niveau des lignes (RLS) selon le profil utilisateur."),
        pb(),

        title2("6.4 Diagramme de séquence"),
        body("Afin de documenter la dynamique des échanges lors d'une session de travail type, le diagramme de séquence UML de la figure 6.2 illustre les interactions entre le chef d'atelier, l'interface web, le backend Spring Boot, le microservice FastAPI et le Data Warehouse :"),
        pb(),
        ...imageFigure("diagrams/sprint4_seq.png", "Figure 6.2 : Diagramme de séquence : interaction utilisateur, tableau de bord et modèle prédictif", 540, 260),
        body("Power BI se connecte en mode DirectQuery au Data Warehouse SQL Server. Lors de l'ouverture d'un rapport, des requêtes DAX sont générées dynamiquement vers les tables de faits et de dimensions du DWH. Les prévisions Prophet, préalablement stockées dans la table FactPrevision, sont chargées avec leurs bandes de confiance à 95 %. Chaque filtre appliqué par l'utilisateur déclenche une nouvelle requête SQL en temps réel."),
        pb(),

        title2("6.5 Développement des interfaces"),
        title3("6.5.1 Tableau de bord de supervision et TRG"),
        body("Ce rapport Power BI constitue le centre de contrôle des 319 presses à injecter réparties entre Kondar, Sousse et Brno. Connecté en DirectQuery à la table de faits FactProduction du DWH, il offre une vision synoptique immédiate :"),
        bullet("**Cartouches d'indicateurs globaux** : TRG moyen d'atelier, taux de disponibilité mécanique, taux de performance de cadence et taux de qualité."),
        bullet("**Matrice d'état des machines** : vue en grille représentant chaque presse par un code couleur dynamique (Vert : injection en cours, Rouge : arrêt pour panne, Orange : changement de moule, Bleu : maintenance programmée)."),
        bullet("**Décomposition des temps d'arrêt** : diagramme de Pareto identifiant les causes d'arrêt prépondérantes (pannes hydrauliques, défauts régulation thermique, attente matière)."),
        pb(),

        title3("6.5.2 Tableau de bord des prévisions"),
        body("Le rapport Power BI de prévision interroge la table FactPrevision du DWH, alimentée par le microservice FastAPI (modèle Prophet), et permet aux planificateurs d'anticiper la charge d'atelier :"),
        bullet("**Sélecteur d'horizon dynamique** : basculement immédiat entre 7 jours (gestion des équipes en 3x8), 15 jours (matières premières) et 30 jours (planning usine)."),
        bullet("**Graphique superposé historique / prédiction** : courbe continue reliant la cadence réelle d'atelier à la projection calculée par Prophet, bordée par son intervalle de confiance à 95 %."),
        bullet("**Tableau de détail exportable** : affichage journalier des volumes projetés, des temps d'injection prévus et de la variance attendue."),
        pb(),

        title3("6.5.3 Tableau de bord des stocks"),
        body("Le rapport Power BI de gestion des stocks interroge les tables FactStock et DimArticle du DWH, traitant les 6 875 références du catalogue d'entreprise :"),
        bullet("**Synthèse du niveau de risque** : compteurs visuels indiquant le nombre de références en Rupture, Critique, Normal et Surstock, ainsi que la valeur financière du stock immobilisé en dinars tunisiens."),
        bullet("**Tableau paginé interactif** : recherche textuelle instantanée, filtrage par famille de plastique (PP, PA66, ABS) et tri automatique par urgence de commande."),
        bullet("**Module d'alertes prescriptives** : fiches d'alerte pour le top 20 des urgences précisant la quantité exacte à commander pour 45 jours et le coût d'arrêt évité."),
        bullet("**Export natif Power BI** : téléchargement des données filtrées en CSV et classeur Excel directement depuis Power BI Service, sans développement additionnel."),
        pb(),

        title2("6.6 Présentation des interfaces réalisées"),
        title3("6.6.1 Tableau de bord principal"),
        body("La figure 6.3 présente la vue d'ensemble du rapport décisionnel Power BI Nexora, affichant les indicateurs clés (KPI) globaux directement connectés au Data Warehouse SQL Server :"),
        pb(),
        ...imageFigure("image/powerbi_3.png", "Figure 6.3 : Vue d'ensemble du tableau de bord décisionnel Power BI Nexora", 540, 260),
        pb(),

        title3("6.6.2 Analyse de la production"),
        body("La figure 6.4 expose la console de supervision d'atelier en temps réel, affichant le statut des presses et la jauge de TRG instantanée :"),
        pb(),
        ...imageFigure("image/powerbi_1.png", "Figure 6.4 : Interface « Supervision de la production et TRG »", 540, 280),
        body("La figure 6.5 illustre la répartition des volumes de pièces injectées selon les grandes familles de composants automobiles :"),
        pb(),
        ...imageFigure("image/powerbi_2.png", "Figure 6.5 : Répartition des volumes par famille de composants plastiques", 540, 280),
        pb(),

        title3("6.6.3 Prévisions des cadences"),
        body("La figure 6.6 présente l'écran de prévision à 30 jours généré par l'algorithme d'IA, montrant la trajectoire de cadence et les bornes d'incertitude :"),
        pb(),
        ...imageFigure("image/powerbi_4.png", "Figure 6.6 : Rapport Power BI « Prévision des cadences et charge atelier »", 540, 270),
        pb(),

        title3("6.6.4 Gestion des stocks d'atelier"),
        body("La figure 6.7 illustre la console d'inventaire prédictif avec les indicateurs de rupture et la liste des recommandations d'achat :"),
        pb(),
        ...imageFigure("image/powerbi_5.png", "Figure 6.7 : Rapport Power BI « Gestion des stocks d'atelier »", 540, 270),
        pb(),

        title2("6.7 Tests et validation"),
        title3("6.7.1 Tests fonctionnels"),
        body("Afin de garantir la robustesse du système avant son déploiement en atelier, dix scénarios de tests d'intégration ont été exécutés avec succès :"),
        pb(),
        makeTable(
          ["Fonctionnalité Éprouvée", "Protocole de Test Exécuté", "Résultat Obtenu et Statut"],
          [
            ["Connexion DWH SQL Server", "Interrogation en DirectQuery des tables FactProduction et FactStock.", "Connexion établie avec succès, temps de réponse sous les 400 ms. (Validé)"],
            ["Supervision TRG en direct", "Simulation d'arrêts presses et recalcul dynamique des mesures DAX de TRG.", "Recalcul instantané du TRG atelier sur les 319 presses sans latence. (Validé)"],
            ["Visualisation des prévisions (7j)", "Filtrage sur l'horizon 7 jours et comparaison aux lancements réels.", "Rendu dynamique de la courbe Prophet et de son intervalle de confiance. (Validé)"],
            ["Prévision mensuelle (30j)", "Agrégation de la cadence globale sur les ateliers Kondar, Sousse et Brno.", "Affichage fluide des visualisations et conformité des bornes de prévision. (Validé)"],
            ["Segments multi-critères stock", "Filtrage interactif par famille (PA66, PP) et statut de rupture.", "Actualisation croisée de l'ensemble des visuels en moins de 250 ms. (Validé)"],
            ["Alertes de stock & couverture 45j", "Contrôle des cartes KPI et jauges d'alertes pour le top 20 des urgences.", "Conformité stricte des seuils d'alerte et des quantités prescrites. (Validé)"],
            ["Exportation native Excel (.xlsx)", "Téléchargement des données tabulaires filtrées vers Microsoft Excel.", "Export instantané et préservation intégrale des formats numériques. (Validé)"],
            ["Sécurité RLS (Row-Level Security)", "Connexion avec les profils Chef d'atelier vs Direction générale.", "Filtrage automatique et strict des données selon le périmètre d'atelier. (Validé)"]
          ],
          [2600, 3100, 2966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.2 : Résultats des tests fonctionnels", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("6.7.2 Validation des résultats"),
        body("Les prédictions de cadence générées par le modèle champion ont été validées en conditions réelles d'atelier sur la période janvier-avril 2026 :"),
        bullet("**R² = 0,8134** : confirmation de la très forte corrélation entre prévisions et fabrications réelles."),
        bullet("**MAE = 3 354 pièces** : écart moyen contenu à moins de 5,1 % du volume moyen d'atelier."),
        bullet("**MAPE = 12,9 %** : précision opérationnelle remarquable pour des séries d'injection plastique soumises aux aléas de moules."),
        pb(),

        title3("6.7.3 Validation des recommandations de stock"),
        body("Un audit mené auprès des approvisionneurs d'atelier a validé la pertinence des préconisations de commande : la politique de couverture à 45 jours a permis de supprimer les ruptures sur 18 matières stratégiques lors des essais pilotes."),
        pb(),

        title3("6.7.4 Validation de l'interface utilisateur"),
        body("L'ergonomie a été évaluée auprès d'un panel d'utilisateurs composé de deux chefs d'ateliers et d'un gestionnaire d'approvisionnement. Les retours ont unanimement salué la clarté des visuels Power BI, la réactivité des filtres et segments croisés, et la suppression des tâches manuelles de consolidation sous Excel."),
        pb(),

        title2("6.8 Bilan du Sprint 4"),
        body("Le tableau 6.3 récapitule les livrables achevés et validés au terme du Sprint 4 :"),
        pb(),
        makeTable(
          ["Tâche réalisée", "Livrable Produit et Validé", "Statut"],
          [
            ["Modélisation DWH & DAX", "Modèle en étoile connecté en DirectQuery au DWH SQL Server et mesures DAX", "Réalisé"],
            ["Rapport Production & TRG", "Tableau de bord Power BI de supervision des 319 presses et calcul du TRG", "Réalisé"],
            ["Rapport Prévisions IA", "Tableau de bord Power BI restituant les prédictions Prophet à 7, 15 et 30 jours", "Réalisé"],
            ["Rapport Gestion des stocks", "Tableau de bord Power BI d'analyse ABC, ruptures et alertes de réapprovisionnement", "Réalisé"],
            ["Sécurité RLS & Déploiement", "Configuration de la sécurité par rôle et publication sur Power BI Service", "Réalisé"],
            ["Recette fonctionnelle", "Validation de l'ensemble des scénarios de test avec les équipes d'atelier", "Réalisé"],
            ["Documentation technique", "Guide utilisateur des rapports Power BI et dictionnaire des mesures DAX", "Réalisé"]
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
        conclusionBox("Ce chapitre a présenté la conception, le développement et la validation du portail décisionnel Nexora, aboutissement final de notre démarche d'ingénierie. En centralisant dans des rapports Power BI le suivi du TRG, les prévisions de l'intelligence artificielle issues du DWH SQL Server et la gestion prescriptive des stocks, Nexora dote l'équipementier automobile d'un outil de pilotage décisionnel d'avant-garde. Les tests et la recette utilisateur confirment la puissance des visualisations interactives et l'impact opérationnel immédiat du système."),
        pageBreak(),
    '''

print("Chapter 6 module defined.")
