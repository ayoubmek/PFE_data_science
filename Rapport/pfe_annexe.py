# -*- coding: utf-8 -*-
"""
Annexe A : Détails méthodologiques et analyses statistiques approfondies (pfe_v7.docx)
Adaptée : Évaluation rigoureuse centrée sur l'horizon opérationnel de 30 jours.
"""

def get_annexe():
    return '''
        // =========================================================
        // ANNEXE A : ANALYSES STATISTIQUES APPROFONDIES
        // =========================================================
        title1("Annexe A : Détails méthodologiques et analyses statistiques approfondies"),

        title2("A.1 Protocole expérimental et prévention des fuites temporelles (Data Leakage)"),
        body("Dans l'évaluation de modèles tabulaires appliqués à des séries temporelles (comme Random Forest), un risque courant réside dans l'utilisation de valeurs observées futures pour alimenter les variables explicatives retardées (lags) au cours de la période de test (*one-step-ahead teacher forcing*). Ce procédé introduit un biais d'anticipation qui fausse l'estimation des performances réelles en production."),
        body("Pour écarter tout risque de fuite d'information, deux principes stricts ont été mis en œuvre dans ce projet :"),
        bullet("**1. Simulation récursive multi-pas (Multi-Step Recursive Forecasting)** : pour l'horizon de 30 jours, les valeurs prédites aux pas $t+1, t+2, \\\\dots$ sont réinjectées dynamiquement comme entrées décalées pour les pas suivants, sans jamais recourir aux données observées au-delà de la date d'origine."),
        bullet("**2. Estimation étanche des facteurs d'événements** : les coefficients d'impact des événements calendaires d'atelier (congés d'été : 0,635, pic de fin de trimestre : 1,361, maintenance de janvier : 0,383, Ramadan : 0,874) sont appris exclusivement sur la tranche d'apprentissage précédant chaque date de coupure."),
        pb(),

        title2("A.2 Résultats complets à l'horizon 30 jours sur 6 origines glissantes"),
        body("Le tableau A.1 détaille les moyennes et écarts-types des quatre métriques (MAE, RMSE, MAPE, R²) obtenus sur les 6 fenêtres de test glissantes en 2026 à l'horizon de 30 jours :"),
        pb(),

        makeTable(
          ["Modèle de prévision", "MAE (pièces/jour)", "RMSE (pièces/jour)", "MAPE (%)", "Score R²"],
          [
            ["Random Forest (Récursif)", "2 467,4 ± 206,8", "3 195,9 ± 266,8", "6,0 ± 0,6 %", "0,9798 ± 0,0037"],
            ["Prophet (Ajusté)",         "2 982,4 ± 768,8", "3 897,3 ± 1 029,1", "6,7 ± 1,0 %", "0,9707 ± 0,0097"],
            ["Random Forest (Direct)",   "2 797,9 ± 236,1", "3 581,5 ± 285,7", "6,8 ± 1,3 %", "0,9743 ± 0,0063"],
            ["Régression Linéaire",      "4 678,9 ± 936,1", "6 097,5 ± 1 226,2", "9,8 ± 1,3 %", "0,9271 ± 0,0231"],
            ["ARIMA",                    "5 320,8 ± 2 785,2", "6 147,9 ± 2 870,3", "11,7 ± 5,6 %", "0,9082 ± 0,0821"]
          ],
          [2800, 1800, 1800, 1400, 1666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau A.1 : Performances détaillées à l'horizon 30 jours (Moyenne ± Écart-type)", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("A.3 Test formel de Diebold-Mariano avec variance HAC"),
        body("Le test statistique de Diebold-Mariano (avec correction de Harvey-Leybourne-Newbold pour petits échantillons) évalue l'hypothèse nulle d'égalité des performances prédictives entre Random Forest et Prophet. Le chevauchement partiel des fenêtres d'évaluation glissante introduit une autocorrélation entre erreurs de prévision consécutives. La variance du différentiel de perte est donc corrigée par un estimateur HAC (*Heteroskedasticity and Autocorrelation Consistent*) utilisant un noyau de Bartlett jusqu'au retard $h-1$ (Tableau A.2) :"),
        pb(),
        makeTable(
          ["Horizon évalué", "Différence moyenne MAE (RF - Prophet)", "Statistique DM HAC (HLN)", "p-value HAC", "Test t apparié (df = 5)", "Conclusion (seuil α = 5 %)"],
          [
            ["Horizon 30 jours", "-515,0 pièces/jour", "-1,318", "p = 0,1891", "t = -1,783 (p = 0,1347)", "Différence non statistiquement significative"]
          ],
          [1600, 1800, 1400, 1200, 1600, 1866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau A.2 : Test de significativité statistique de Diebold-Mariano à 30 jours", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("À l'horizon de 30 jours, la p-value est supérieure à 0,05 (p = 0,1891). L'écart ponctuel observé entre Random Forest et Prophet ne permet donc pas de rejeter l'hypothèse nulle d'égalité des performances prédictives, confirmant qu'aucune différence significative n'est détectée."),
        pb(),

        title2("A.4 Analyse des intervalles d'incertitude : Prophet et Prédiction Conforme"),
        body("Pour quantifier l'incertitude des prévisions, deux méthodologies ont été comparées : les intervalles paramétriques natifs de Prophet et les intervalles non paramétriques issus de la prédiction conforme (*Conformal Prediction*) [28] appliquée à Random Forest."),
        body("La marge conforme au niveau de confiance nominal de 95 % est calibrée sur les résidus absolus de la partition de validation 2025 selon la formule :"),
        body("*q_0.95 = Quantile_0.95 (|y_vrai - y_pred|)* = ± 7 540 pièces/jour", { align: AlignmentType.CENTER, italics: true }),
        body("Cette marge d'incertitude assure une couverture statistique théorique robuste sans dépendre d'hypothèses distributionnelles fortes."),
        body("Le tableau A.3 compare côte à côte la couverture empirique réelle et la largeur moyenne du fuseau obtenu à l'horizon 30 jours :"),
        pb(),
        makeTable(
          ["Horizon évalué", "Prophet : Couverture empirique (Nominal 95 %)", "Prophet : Largeur moyenne du fuseau", "RF + Conformal : Couverture empirique (Nominal 95 %)", "RF + Conformal : Largeur moyenne du fuseau"],
          [
            ["Horizon 30 jours", "100,0 % (sur-conservateur)", "42 122 pièces/jour", "97,8 % (calibré)", "15 080 pièces/jour"]
          ],
          [1600, 2000, 1800, 2000, 1766]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau A.3 : Comparaison de la qualité des intervalles d'incertitude à 30 jours", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Cette comparaison montre que la prédiction conforme génère des fuseaux plus informatifs (environ 2,8 fois plus resserrés) tout en respectant la couverture cible de 95 %. Ce résultat confirme que le choix de Prophet pour le déploiement en production repose sur sa structure explicative et sa facilité de mise en œuvre."),
        pageBreak(),
    '''

print("Annexe module defined.")
