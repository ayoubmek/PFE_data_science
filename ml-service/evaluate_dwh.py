"""
Recalcule depuis dbDWH (lecture seule) les chiffres à reporter dans le mémoire :
étude comparative des 4 modèles sur ML_BACKTEST_ORIGINS périodes de test (justifie le choix de ML_MODEL),
prévision du modèle retenu, détection d'anomalies, classification des stocks.

Usage : python ml-service/evaluate_dwh.py [--horizon 30] [--out resultats_dwh.json]
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import config
from main import _anomaly_report, _compute_forecast_bundle
from models import load_production_series, stock
from models.evaluation import MODEL_NAMES, rolling_origin_backtest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--horizon", type=int, default=30)
    parser.add_argument("--out", default="resultats_dwh.json")
    args = parser.parse_args()

    bundle = _compute_forecast_bundle(args.horizon)
    # Étude comparative : les 4 modèles sur les mêmes périodes de test que le modèle de l'application
    study = rolling_origin_backtest(load_production_series(), args.horizon, config.ML_BACKTEST_ORIGINS)
    study.pop("_residuals"); study.pop("_pooled")
    ranking = sorted(study["metrics"], key=lambda k: study["metrics"][k]["wape"])
    anomalies = _anomaly_report(load_production_series())
    articles = stock.load_article_status()

    result = {
        "production": {k: bundle[k] for k in ("data_source", "history_start", "history_end", "history_days",
                                              "zero_days_in_history", "excluded_unconsolidated_days",
                                              "outlier_treatment", "capacity")},
        "etude_comparative": {"periodes": [(f["test_start"], f["test_end"]) for f in study["folds"]],
                               "metrics": study["metrics"], "classement": [MODEL_NAMES[k] for k in ranking]},
        "modele_application": MODEL_NAMES[config.ML_MODEL],
        "metrics_modele_application": bundle["metrics"],
        "anomalies": {k: v for k, v in anomalies.items() if k != "anomalies"},
        "stock": {
            "date_stock": str(articles["date_stock"].iloc[0]),
            "nb_articles_suivis": int(len(articles)),
            "valeur_stock_tnd": round(float(articles["valeur"].sum()), 2),
            "statuts": stock.status_counts(articles),
            "reapprovisionnement": stock.replenishment_summary(articles),
            "regles": {
                "fenetre_consommation_jours": config.STOCK_CONSO_WINDOW_DAYS,
                "fenetre_rupture_jours": config.STOCK_RUPTURE_RECENT_DAYS,
                "seuil_critique_jours": config.STOCK_CRITIQUE_DAYS,
                "seuil_surstock_jours": config.STOCK_SURSTOCK_DAYS,
                "couverture_cible_jours": config.STOCK_COVERAGE_TARGET_DAYS,
            },
        },
    }
    Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2, default=str), encoding="utf-8")

    print(f"Historique : {bundle['history_start']} -> {bundle['history_end']} ({bundle['history_days']} jours)")
    print(f"Étude comparative : {study['n_origins']} périodes x {study['horizon']} jours "
          f"({study['folds'][0]['test_start']} -> {study['folds'][-1]['test_end']})")
    print(f"{'Modèle':45s} {'MAE':>10s} {'RMSE':>10s} {'MAPE%':>7s} {'WAPE%':>7s} {'MASE':>6s} {'R2':>7s}")
    for k in ranking:
        m = study["metrics"][k]
        print(f"{m['name']:45s} {m['mae']:>10,.0f} {m['rmse']:>10,.0f} {m['mape']:>7.2f} {m['wape']:>7.2f} "
              f"{m['mase']:>6.3f} {m['r2']:>7.3f}")
    print(f"Modèle de l'application (ML_MODEL) : {MODEL_NAMES[config.ML_MODEL]}")
    print(f"Stock : {result['stock']['statuts']} — plan {result['stock']['reapprovisionnement']}")
    print(f"Résultats complets : {Path(args.out).resolve()}")


if __name__ == "__main__":
    main()
