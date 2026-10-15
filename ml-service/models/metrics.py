import numpy as np


def compute_eval_metrics(actual, pred):
    actual = np.array(actual, dtype=float)
    pred = np.array(pred, dtype=float)

    mae = float(np.mean(np.abs(actual - pred)))
    rmse = float(np.sqrt(np.mean((actual - pred) ** 2)))

    non_zeros = actual != 0
    if np.any(non_zeros):
        mape = float(np.mean(np.abs((actual[non_zeros] - pred[non_zeros]) / actual[non_zeros])) * 100)
    else:
        mape = 0.0

    ss_res = np.sum((actual - pred) ** 2)
    ss_tot = np.sum((actual - np.mean(actual)) ** 2)
    r2 = float(1.0 - (ss_res / max(1e-6, ss_tot))) if ss_tot > 0 else 0.0
    r2 = max(0.0, min(1.0, r2))

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2),
        "r2": round(r2, 4),
        "wape": compute_wape(actual, pred),
    }


def compute_wape(actual, pred) -> float:
    """
    Weighted Absolute Percentage Error (WAPE = sum(|y - y_hat|) / sum(y) * 100).
    Métrique robuste sans risque de division par zéro lors des arrêts d'atelier.
    """
    actual = np.array(actual, dtype=float)
    pred = np.array(pred, dtype=float)
    sum_actual = np.sum(np.abs(actual))
    if sum_actual == 0:
        return 0.0
    return round(float(np.sum(np.abs(actual - pred)) / sum_actual * 100), 2)


def compute_mase(actual, pred, naive_baseline_series=None) -> float:
    """
    Mean Absolute Scaled Error (MASE = MAE / MAE_naive).
    Compare la précision du modèle à la prévision naïve (t = t-1).
    MASE < 1 indique que le modèle surpasse significativement la référence naïve.
    """
    actual = np.array(actual, dtype=float)
    pred = np.array(pred, dtype=float)
    mae = np.mean(np.abs(actual - pred))
    if naive_baseline_series is not None and len(naive_baseline_series) > 1:
        d = np.mean(np.abs(np.diff(np.array(naive_baseline_series, dtype=float))))
    else:
        d = np.mean(np.abs(np.diff(actual))) if len(actual) > 1 else 1.0
    return round(float(mae / max(1e-6, d)), 3)


def compute_interval_coverage_95(actual, lower_bound, upper_bound) -> float:
    """
    Taux de couverture effectif de l'intervalle de confiance nominal à 95 % :
    Pourcentage des observations réelles situées entre lower_bound et upper_bound.
    """
    actual = np.array(actual, dtype=float)
    lower = np.array(lower_bound, dtype=float)
    upper = np.array(upper_bound, dtype=float)
    in_bounds = (actual >= lower) & (actual <= upper)
    return round(float(np.mean(in_bounds) * 100), 2)


def print_metrics_summary(model_name: str, metrics: dict, cv_scores: list = None):
    print("=" * 65)
    print(f"        EVALUATION DES PERFORMANCES : {model_name.upper()}")
    print("=" * 65)
    print(f"  * MAE  (Erreur Absolue Moyenne)   : {metrics['mae']:>10,.2f}")
    print(f"  * RMSE (Racine Carree de l'EQM)   : {metrics['rmse']:>10,.2f}")
    print(f"  * MAPE (Erreur Pourcentage Moy.)  : {metrics['mape']:>9.2f} %")
    print(f"  * R2   (Coefficient Determination): {metrics['r2']:>10.4f}")
    if cv_scores:
        avg_cv_r2 = np.mean([s["r2"] for s in cv_scores])
        avg_cv_mape = np.mean([s["mape"] for s in cv_scores])
        print("-" * 65)
        print(f"  * Validation Croisee (TimeSeriesSplit, {len(cv_scores)} plis) :")
        print(f"      - CV R2 moyen   : {avg_cv_r2:>10.4f}")
        print(f"      - CV MAPE moyen : {avg_cv_mape:>9.2f} %")
    print("=" * 65 + "\n")
