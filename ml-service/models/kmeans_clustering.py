import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

models_dir = Path(__file__).resolve().parent
if str(models_dir) not in sys.path:
    sys.path.insert(0, str(models_dir))

from data_loader import load_stock_items


class KMeansClusteringModel:
    def __init__(self, n_clusters: int = 3, random_state: int = 42):
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.model = KMeans(n_clusters=self.n_clusters, random_state=self.random_state, n_init=10)
        self.cluster_centers_orig_: Optional[np.ndarray] = None
        self.labels_: Optional[np.ndarray] = None
        self.inertia_: float = 0.0
        self.silhouette_: float = 0.0

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        X_scaled = self.scaler.fit_transform(X)
        self.labels_ = self.model.fit_predict(X_scaled)
        self.inertia_ = float(self.model.inertia_)
        self.cluster_centers_orig_ = self.scaler.inverse_transform(self.model.cluster_centers_)

        if len(X) > 1:
            sample_size = min(len(X), 3000)
            if sample_size < len(X):
                rng = np.random.default_rng(self.random_state)
                idx = rng.choice(len(X), size=sample_size, replace=False)
                self.silhouette_ = float(silhouette_score(X_scaled[idx], self.labels_[idx]))
            else:
                self.silhouette_ = float(silhouette_score(X_scaled, self.labels_))
        else:
            self.silhouette_ = 0.0

        return self.labels_

    def evaluate(self, X: np.ndarray) -> Dict[str, Any]:
        if self.labels_ is None:
            self.fit_predict(X)

        cluster_counts = {int(c): int(np.sum(self.labels_ == c)) for c in range(self.n_clusters)}
        return {
            "n_clusters": self.n_clusters,
            "inertia": round(self.inertia_, 2),
            "silhouette_score": round(self.silhouette_, 4),
            "cluster_distribution": cluster_counts,
            "centroids": self.cluster_centers_orig_.tolist() if self.cluster_centers_orig_ is not None else [],
        }

    @staticmethod
    def analyze_pareto_abc(df: pd.DataFrame) -> Dict[str, Any]:
        df_work = df.copy()
        if "valeur" not in df_work.columns:
            if "quantite" in df_work.columns and "cout" in df_work.columns:
                df_work["valeur"] = (df_work["quantite"] * df_work["cout"]).round(2)
            else:
                raise ValueError("Colonnes 'quantite' et 'cout' requises pour le calcul de la valeur.")

        df_work = df_work[df_work["valeur"] > 0].copy()
        if df_work.empty:
            raise ValueError("Aucune donnee de stock avec valeur positive.")

        df_work = df_work.sort_values("valeur", ascending=False).reset_index(drop=True)
        total_val = float(df_work["valeur"].sum())
        df_work["cum_pct"] = (df_work["valeur"].cumsum() / total_val * 100).round(2)

        def get_class(pct: float) -> str:
            if pct <= 80.0:
                return "A"
            elif pct <= 95.0:
                return "B"
            return "C"

        df_work["classe"] = df_work["cum_pct"].apply(get_class)

        classes_summary = []
        for cl in ["A", "B", "C"]:
            sub = df_work[df_work["classe"] == cl]
            nb = len(sub)
            val = float(sub["valeur"].sum())
            classes_summary.append({
                "classe": cl,
                "nb_articles": nb,
                "pct_articles": round((nb / len(df_work)) * 100, 1),
                "valeur_totale": round(val, 2),
                "pct_valeur": round((val / total_val) * 100, 1),
            })

        display_cols = [c for c in ["reference", "designation", "categorie", "quantite", "cout", "valeur", "classe"] if c in df_work.columns]
        top10 = df_work.head(10)[display_cols].to_dict("records")

        cat_dist = []
        if "categorie" in df_work.columns:
            cat_dist = (
                df_work.groupby(["categorie", "classe"])["valeur"]
                .sum()
                .reset_index()
                .to_dict("records")
            )

        return {
            "total_articles": len(df_work),
            "total_valeur": round(total_val, 2),
            "classes": classes_summary,
            "top_articles": top10,
            "category_distribution": cat_dist,
        }

    def cluster_stock_df(self, df: pd.DataFrame) -> Dict[str, Any]:
        df_work = df.copy()
        if "valeur" not in df_work.columns:
            df_work["valeur"] = (df_work["quantite"] * df_work["cout"]).round(2)

        df_work = df_work[df_work["valeur"] >= 0].copy()
        features = df_work[["quantite", "valeur"]].fillna(0).values

        labels = self.fit_predict(features)
        df_work["cluster"] = labels

        centroids = self.cluster_centers_orig_
        order = centroids[:, 1].argsort()

        label_map = {
            order[0]: "Classe C - Faible valeur",
            order[1]: "Classe B - Valeur moyenne",
            order[2]: "Classe A - Haute valeur",
        }
        color_map = {order[0]: "#64748b", order[1]: "#0ea5e9", order[2]: "#f59e0b"}

        clusters_out = []
        for c in range(3):
            sub = df_work[df_work["cluster"] == c]
            cols = [col for col in ["reference", "designation", "quantite", "valeur"] if col in sub.columns]
            top_items = sub.nlargest(5, "valeur")[cols].to_dict("records") if not sub.empty else []

            clusters_out.append({
                "id": c,
                "label": label_map.get(c, f"Cluster {c}"),
                "color": color_map.get(c, "#64748b"),
                "count": len(sub),
                "avg_quantite": round(float(sub["quantite"].mean()), 1) if not sub.empty else 0.0,
                "avg_valeur": round(float(sub["valeur"].mean()), 2) if not sub.empty else 0.0,
                "total_valeur": round(float(sub["valeur"].sum()), 2) if not sub.empty else 0.0,
                "top_items": top_items,
            })

        scatter_cols = [c for c in ["reference", "quantite", "valeur", "cluster"] if c in df_work.columns]
        scatter = df_work[scatter_cols].head(120).copy()
        scatter["label"] = scatter["cluster"].map(label_map)
        scatter["color"] = scatter["cluster"].map(color_map)

        return {
            "n_clusters": 3,
            "total_items": len(df_work),
            "clusters": clusters_out,
            "scatter": scatter.to_dict("records"),
        }

    @staticmethod
    def cluster_custom(data: List[Dict[str, Any]], features: List[str], n_clusters: int = 3) -> Dict[str, Any]:
        if not data or len(data) < n_clusters:
            raise ValueError("Donnees insuffisantes pour former des clusters.")

        df = pd.DataFrame(data)
        if not features or any(f not in df.columns for f in features):
            raise ValueError("Colonnes de variables introuvables dans les donnees.")

        X = df[features].apply(pd.to_numeric, errors="coerce").fillna(0).values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        k = max(2, min(n_clusters, 6))
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X_scaled)
        df["cluster"] = labels

        centroids = scaler.inverse_transform(kmeans.cluster_centers_)
        clusters_info = []
        colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

        for c in range(k):
            sub = df[df["cluster"] == c]
            clusters_info.append({
                "id": int(c),
                "label": f"Cluster {c + 1}",
                "color": colors[c % len(colors)],
                "count": int(len(sub)),
                "percentage": float(round(len(sub) / len(df) * 100, 1)),
                "centroid": {str(features[fi]): float(round(centroids[c, fi], 2)) for fi in range(len(features))},
            })

        scatter = []
        for i, row in df.head(150).iterrows():
            pt = {}
            for col in df.columns:
                if col == "cluster":
                    continue
                v = row[col]
                pt[str(col)] = v.item() if hasattr(v, "item") else v
            pt["cluster"] = int(labels[i])
            pt["x"] = float(X[i, 0]) if len(features) > 0 else 0.0
            pt["y"] = float(X[i, 1]) if len(features) > 1 else (float(X[i, 0]) if len(features) > 0 else 0.0)
            scatter.append(pt)

        return {
            "total_records": int(len(df)),
            "n_clusters": int(k),
            "clusters": clusters_info,
            "scatter": scatter,
            "features": [str(f) for f in features],
        }


def print_clustering_summary(metrics: Dict[str, Any], abc_res: Dict[str, Any]):
    print("=" * 72)
    print("        EVALUATION DU CLUSTERING K-MEANS & SEGMENTATION PARETO ABC")
    print("=" * 72)
    print(f"  * Nombre de clusters (k)           : {metrics['n_clusters']}")
    print(f"  * Score de Silhouette              : {metrics['silhouette_score']:>10.4f}  (> 0.5 = clusters bien separes)")
    print(f"  * Inertie intra-cluster (WSS)      : {metrics['inertia']:>14,.2f}")
    print("-" * 72)
    print("  DISTRIBUTION DES CLUSTERS K-MEANS :")
    for c_id, count in metrics["cluster_distribution"].items():
        print(f"    - Cluster {c_id} : {count:>6,} articles")
    print("-" * 72)
    print("  ANALYSE PARETO ABC (VALEUR DE STOCK) :")
    print(f"    Total articles : {abc_res['total_articles']:,} | Valeur totale : {abc_res['total_valeur']:,.2f} TND/DH")
    print(f"    {'Classe':<8} | {'Nb Articles':<12} | {'% Articles':<12} | {'Valeur (TND)':<15} | {'% Valeur'}")
    print("    " + "-" * 62)
    for cl in abc_res["classes"]:
        print(f"    Classe {cl['classe']:<2} | {cl['nb_articles']:>11,} | {cl['pct_articles']:>10.1f} % | {cl['valeur_totale']:>14,.2f} | {cl['pct_valeur']:>7.1f} %")
    print("=" * 72 + "\n")


if __name__ == "__main__":
    print("\n--- Lancement du modele : K-Means Clustering & Pareto ABC ---")
    df = load_stock_items(limit=3000)
    print(f"Donnees de stock chargees : {len(df):,} references.")

    km_model = KMeansClusteringModel(n_clusters=3, random_state=42)
    X = df[["quantite", "valeur"]].fillna(0).values
    km_model.fit_predict(X)

    eval_res = km_model.evaluate(X)
    abc_res = KMeansClusteringModel.analyze_pareto_abc(df)

    print_clustering_summary(eval_res, abc_res)

    print("Top 5 Articles Strategiques (Classe A - Forte Valeur) :")
    print(f"  {'Reference':<15} | {'Designation':<25} | {'Quantite':<10} | {'Valeur (TND)':<14}")
    print("  " + "-" * 70)
    for art in abc_res["top_articles"][:5]:
        ref = str(art.get("reference", "N/A"))[:14]
        des = str(art.get("designation", "Article"))[:24]
        q = art.get("quantite", 0)
        v = art.get("valeur", 0)
        print(f"  {ref:<15} | {des:<25} | {q:>9,.0f} | {v:>13,.2f}")
    print()
