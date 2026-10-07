import numpy as np
from sklearn.model_selection import TimeSeriesSplit


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
    }


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
