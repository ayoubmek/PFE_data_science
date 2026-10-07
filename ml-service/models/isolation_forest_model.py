import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

models_dir = Path(__file__).resolve().parent
if str(models_dir) not in sys.path:
    sys.path.insert(0, str(models_dir))

from data_loader import load_rebuts_data


class IsolationForestModel:
    def __init__(self, contamination: float = 0.08, n_estimators: int = 100, random_state: int = 42):
        self.contamination = contamination if 0.01 <= contamination <= 0.5 else 0.1
        self.n_estimators = n_estimators
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=self.contamination,
            n_estimators=self.n_estimators,
            random_state=self.random_state,
        )
        self.features_used: List[str] = []
        self.fitted = False

    def fit(self, X: np.ndarray, feature_names: Optional[List[str]] = None):
        self.model.fit(X)
        self.fitted = True
        self.features_used = feature_names or [f"f_{i}" for i in range(X.shape[1])]
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def score_samples(self, X: np.ndarray) -> np.ndarray:
        return self.model.score_samples(X)

    def detect(
        self,
        data: List[Dict[str, Any]],
        feature_columns: Optional[List[str]] = None,
        contamination: Optional[float] = None,
    ) -> Dict[str, Any]:
        if not data:
            raise ValueError("Aucune donnee fournie pour la detection.")

        df = pd.DataFrame(data)
        cols = feature_columns or [c for c in df.columns if df[c].dtype in [np.float64, np.int64, float, int]]
        if not cols:
            raise ValueError("Aucune colonne numerique trouvee pour l'analyse.")

        X = df[cols].fillna(0).values

        if contamination is not None and 0.01 <= contamination <= 0.5:
            model = IsolationForest(
                contamination=contamination,
                n_estimators=self.n_estimators,
                random_state=self.random_state,
            )
        else:
            model = self.model

        preds = model.fit_predict(X)
        scores = model.score_samples(X)

        results = [
            {
                "index": i,
                "is_anomaly": bool(p == -1),
                "anomaly_score": round(float(s), 4),
                "data": data[i],
            }
            for i, (p, s) in enumerate(zip(preds, scores))
        ]

        anomalies = [r for r in results if r["is_anomaly"]]

        return {
            "total_records": len(data),
            "anomalies_detected": len(anomalies),
            "anomaly_rate": round(len(anomalies) / max(1, len(data)) * 100, 1),
            "results": results,
            "model": "IsolationForest",
            "features_used": cols,
        }

    def evaluate(self, X: np.ndarray) -> Dict[str, Any]:
        if not self.fitted:
            self.fit(X)

        preds = self.model.predict(X)
        scores = self.model.score_samples(X)

        is_anomaly = preds == -1
        total = len(X)
        n_anomalies = int(np.sum(is_anomaly))
        n_normal = total - n_anomalies

        avg_normal_score = float(np.mean(scores[~is_anomaly])) if n_normal > 0 else 0.0
        avg_anomaly_score = float(np.mean(scores[is_anomaly])) if n_anomalies > 0 else 0.0
        min_score = float(np.min(scores))
        max_score = float(np.max(scores))

        return {
            "total_records": total,
            "normal_count": n_normal,
            "anomaly_count": n_anomalies,
            "anomaly_rate_pct": round((n_anomalies / total) * 100, 2),
            "contamination_param": self.contamination,
            "avg_normal_score": round(avg_normal_score, 4),
            "avg_anomaly_score": round(avg_anomaly_score, 4),
            "score_separation": round(abs(avg_normal_score - avg_anomaly_score), 4),
            "score_min": round(min_score, 4),
            "score_max": round(max_score, 4),
        }


def print_anomaly_metrics_summary(model_name: str, metrics: Dict[str, Any], features: List[str]):
    print("=" * 70)
    print(f"        EVALUATION DU MODELE : {model_name.upper()}")
    print("=" * 70)
    print(f"  * Variables analysees (Features)   : {', '.join(features)}")
    print(f"  * Seuil de contamination fixe      : {metrics['contamination_param'] * 100:.1f} %")
    print(f"  * Nombre total d'observations      : {metrics['total_records']:,}")
    print(f"  * Enregistrements normaux          : {metrics['normal_count']:,} ({100 - metrics['anomaly_rate_pct']:.1f} %)")
    print(f"  * Anomalies critiques detectees    : {metrics['anomaly_count']:,} ({metrics['anomaly_rate_pct']:.1f} %)")
    print("-" * 70)
    print(f"  * Score moyen (Normal)             : {metrics['avg_normal_score']:>10.4f}  (proche de 0 = nominal)")
    print(f"  * Score moyen (Anomalie)           : {metrics['avg_anomaly_score']:>10.4f}  (negatif = fortement isole)")
    print(f"  * Separation des distributions     : {metrics['score_separation']:>10.4f}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    print("\n--- Lancement du modele : Isolation Forest (Detection d'Anomalies) ---")
    df = load_rebuts_data(limit=1000)
    feature_cols = ["quantite_rebut", "cout_rebut", "nb_of_impactes"]
    X = df[feature_cols].values

    iso_model = IsolationForestModel(contamination=0.08, n_estimators=100, random_state=42)
    iso_model.fit(X, feature_names=feature_cols)

    eval_metrics = iso_model.evaluate(X)
    print_anomaly_metrics_summary(
        model_name="Isolation Forest (Detection d'Anomalies Rebuts/Cadence)",
        metrics=eval_metrics,
        features=feature_cols,
    )

    data_records = df.to_dict("records")
    detection_res = iso_model.detect(data_records, feature_columns=feature_cols)

    anomalies_sorted = sorted(
        [r for r in detection_res["results"] if r["is_anomaly"]],
        key=lambda x: x["anomaly_score"],
    )

    print(f"Echantillon des anomalies les plus critiques detectees (Top {min(5, len(anomalies_sorted))}) :")
    print(f"  {'Date':<12} | {'Rebut (pcs)':<12} | {'Cout (TND)':<12} | {'OFs':<5} | {'Score Iso':<10} | {'Cause'}")
    print("  " + "-" * 75)
    for a in anomalies_sorted[:5]:
        row = a["data"]
        d = row.get("date", "N/A")
        q = row.get("quantite_rebut", 0)
        c = row.get("cout_rebut", 0)
        ofs = row.get("nb_of_impactes", 0)
        cause = str(row.get("cause", "Inconnu")).replace("û", "u").replace("è", "e").replace("é", "e").replace("à", "a")
        score = a["anomaly_score"]
        print(f"  {d:<12} | {q:>11,.0f} | {c:>11,.2f} | {ofs:>5} | {score:>10.4f} | {cause}")
    print()
