# Points de Vigilance et Synthèse des Validations — `todo_verify.md` (Version `pfe_v7.docx`)

Ce document récapitule les validations certifiées et les points spécifiques du rapport simplifié **`pfe_v7.docx`** pour la candidate avant le dépôt final et la soutenance de Master.

---

## 1. Rôles Applicatifs et Périmètre d'Accès (Conformité Stricte à 2 Rôles)

* **Rôles opérationnels uniques :** **Administrateur** et **Opérateur**.
* La bipartition est strictement harmonisée dans :
  * La spécification des besoins (Chapitre 2, Section 2.2.1 et 2.3.1).
  * Le Product Backlog (Chapitre 1, Tableau 1.5, US01 à US20).
  * Le modèle de données et la sécurité backend Spring Boot (`User.Role.ADMIN`, `User.Role.OPERATEUR` dans `User.java`).
  * Le portail web React (`export type UserRole = 'ADMIN' | 'OPERATEUR'`).
  * La matrice des services API REST (Chapitre 6, Tableau 6.2).
* **Consigne pour la soutenance :** Présenter uniquement ces deux rôles réels (supervision & administration pour l'Administrateur, saisie & suivi opérationnel pour l'Opérateur).

---

## 2. Développement et Comparaison des Modèles d'IA (Chapitre 5 — Sprint 3)

* **Section 5.6 claire, épurée et pédagogique :**
  * Présentation accessible des 4 modèles prédictifs (Régression Linéaire, ARIMA, Random Forest, Prophet) et du modèle Isolation Forest avec leurs équations directes, sans hyperparamètres ni jargon complexe.
  * Formules des 4 métriques de performance : MAE, RMSE, MAPE et R².
* **Performances réelles vérifiées (Tableau 5.4) :**
  * Horizon 7 jours : Random Forest à 5,9 % MAPE (2 645 pcs/j) | Prophet à 7,3 % MAPE (3 653 pcs/j).
  * Horizon 15 jours : Random Forest à 6,0 % MAPE (2 538 pcs/j) | Prophet à 7,4 % MAPE (3 350 pcs/j).
  * Horizon 30 jours : Random Forest à 6,0 % MAPE (2 467 pcs/j) | Prophet à 6,7 % MAPE (2 982 pcs/j).
* **Synthèse des rôles opérationnels (Section 5.9) :**
  * Random Forest obtient une précision légèrement supérieure sur les données d'atelier.
  * Prophet est déployé en production dans SQL Server (`ml_production_predictions`) pour sa décomposition explicable (tendance de fond, profil hebdomadaire, événements d'atelier) et son intégration directe dans les tableaux de bord Power BI.
* **Allègement complet :**
  * Suppression totale de l'Annexe A (tests de Diebold-Mariano, HAC, p-values, prédiction conforme).
  * Formulation simple : les modèles affichent des « performances proches ».

---

## 3. Module de Gestion des Stocks et Données DWH (Chapitre 4 — Sprint 2)

* **Unité maîtresse :** Les 800 références uniques du catalogue (`DIM_FamArt`).
* **Distribution d'état :**
  * Rupture : 47 références (5,9 %)
  * Critique (< 15 jours) : 146 références (18,2 %)
  * Normal : 557 références (69,6 %)
  * Surstock : 50 références (6,2 %)
* **Plan de réapprovisionnement à 45 jours (Chiffres DWH vérifiés) :**
  * Références à commander : 193 références prioritaires ($47 + 146$).
  * Quantité totale : 847 204 unités.
  * **Budget total prévisionnel : 380 400 TND** (calculé d'après les coûts unitaires réels du DWH : médiane de 0,31 à 0,39 TND, moyenne de 0,45 TND sur les articles critiques).
  * Valeur annuelle consommée du catalogue : **14,31 M TND** (14 311 585 TND).
  * Note méthodologique en 4.5.1 : Les montants de 300 à 350 TND du clustering K-Means représentent la valorisation d'un lot d'inventaire (`Cout` dans `ASTOCKDATE`) et non le coût unitaire par pièce.

---

## 4. Nettoyage Éditorial et Qualité Académique

* **Rapport allégé et accessible :** Suppression des démonstrations mathématiques lourdes et du jargon économétrique.
* **Harmonisation :**
  * « Quatre modèles » utilisé uniformément dans le Résumé, l'Abstract et la Conclusion générale.
  * Formulation neutre et objective sans superlatifs non démontrés.
* **Synchronisation totale :** Table des matières, Table des figures et Liste des tableaux synchronisées au mot près avec les 5 tableaux du Chapitre 5 et les 4 tableaux du Chapitre 6.

---

## 5. Fichiers Disponibles et Vérification Finale

* **Rapport final simplifié :** [pfe_v7.docx](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/Rapport/pfe_v7.docx) et sa copie à la racine du projet [pfe_v7.docx](file:///c:/Users/ayoub/OneDrive/Documents/PFEImen/pfe_v7.docx) (5,26 Mo).
* **Versions antérieures préservées :** `pfe_v4.docx`, `pfe_v5.docx` et `pfe_v6.docx` sont intactes dans le dossier `Rapport/`.
