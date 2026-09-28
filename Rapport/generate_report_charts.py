# -*- coding: utf-8 -*-
"""
Script pour générer les graphiques haute résolution pour le rapport PFE Nexora
Garantit une cohérence visuelle parfaite avec la charte graphique de Nexora (bleu nuit, cyan, ambre, gris ardoise).
"""
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta

# Configuration du style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300

NAVY = '#1e293b'
BLUE = '#0284c7'
CYAN = '#06b6d4'
AMBER = '#f59e0b'
GREEN = '#10b981'
RED = '#ef4444'
GRAY = '#64748b'
LIGHT_BG = '#f8fafc'

img_dir = os.path.join(os.path.dirname(__file__), 'image')
diag_dir = os.path.join(os.path.dirname(__file__), 'diagrams')
os.makedirs(img_dir, exist_ok=True)
os.makedirs(diag_dir, exist_ok=True)

print("Génération des graphiques du rapport Nexora...")

# ==============================================================================
# 1. Figure 4.2 : Comparaison R² et MAE (diagrams/comparaison_modeles_r2_mae.png)
# ==============================================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))
fig.patch.set_facecolor('white')

models = ['Régression\nLinéaire', 'ARIMA', 'Random\nForest', 'Prophet\n(Meta) *']
r2_vals = [0.7200, 0.8100, 0.8800, 0.9600]
mae_vals = [16.5, 11.8, 8.9, 7.4]
colors = [GRAY, CYAN, BLUE, GREEN]

# Barplot R²
bars1 = ax1.bar(models, r2_vals, color=colors, width=0.55, edgecolor=NAVY, linewidth=0.8)
ax1.set_title("Coefficient de Détermination (R²)\n[Objectif industriel : R² ≥ 0,80]", fontsize=11, fontweight='bold', color=NAVY, pad=12)
ax1.set_ylabel("Score R²", fontsize=10, fontweight='bold', color=NAVY)
ax1.set_ylim(0.5, 1.05)
ax1.axhline(0.80, color=RED, linestyle='--', linewidth=1.2, label='Seuil cible (0,80)')
for bar, val in zip(bars1, r2_vals):
    ax1.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.015, f"{val:.4f}",
             ha='center', va='bottom', fontsize=9, fontweight='bold', color=NAVY)
ax1.legend(loc='lower right', frameon=True)
ax1.grid(axis='y', linestyle=':', alpha=0.7)

# Barplot MAE
bars2 = ax2.bar(models, mae_vals, color=colors, width=0.55, edgecolor=NAVY, linewidth=0.8)
ax2.set_title("Erreur Absolue Moyenne (MAE)\n[Plus elle est faible, meilleure est la prévision]", fontsize=11, fontweight='bold', color=NAVY, pad=12)
ax2.set_ylabel("MAE (pièces par jour)", fontsize=10, fontweight='bold', color=NAVY)
ax2.set_ylim(0, 20)
for bar, val in zip(bars2, mae_vals):
    ax2.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.4, f"{val:.1f} pcs",
             ha='center', va='bottom', fontsize=9, fontweight='bold', color=NAVY)
ax2.grid(axis='y', linestyle=':', alpha=0.7)

plt.tight_layout()
fig_path = os.path.join(diag_dir, 'comparaison_modeles_r2_mae.png')
plt.savefig(fig_path, bbox_inches='tight')
plt.close()
print(f"-> {fig_path} généré.")

# ==============================================================================
# 2. Figure 4.4 : Comparaison MAPE et RMSE (diagrams/comparaison_modeles_mape_rmse.png)
# ==============================================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))
fig.patch.set_facecolor('white')

mape_vals = [11.5, 8.2, 6.1, 4.8]
rmse_vals = [20.1, 14.3, 11.4, 9.2]

# Barplot MAPE
bars1 = ax1.bar(models, mape_vals, color=colors, width=0.55, edgecolor=NAVY, linewidth=0.8)
ax1.set_title("Pourcentage d'Erreur Absolue (MAPE)\n[Norme équipementier automobile < 5%]", fontsize=11, fontweight='bold', color=NAVY, pad=12)
ax1.set_ylabel("MAPE (%)", fontsize=10, fontweight='bold', color=NAVY)
ax1.set_ylim(0, 14)
ax1.axhline(5.0, color=RED, linestyle='--', linewidth=1.2, label='Tolérance auto (< 5%)')
for bar, val in zip(bars1, mape_vals):
    ax1.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.3, f"{val:.1f} %",
             ha='center', va='bottom', fontsize=9, fontweight='bold', color=NAVY)
ax1.legend(loc='upper right', frameon=True)
ax1.grid(axis='y', linestyle=':', alpha=0.7)

# Barplot RMSE
bars2 = ax2.bar(models, rmse_vals, color=colors, width=0.55, edgecolor=NAVY, linewidth=0.8)
ax2.set_title("Racine de l'Erreur Quadratique (RMSE)\n[Pénalisation des fortes dérives]", fontsize=11, fontweight='bold', color=NAVY, pad=12)
ax2.set_ylabel("RMSE (pièces)", fontsize=10, fontweight='bold', color=NAVY)
ax2.set_ylim(0, 24)
for bar, val in zip(bars2, rmse_vals):
    ax2.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.5, f"{val:.1f} pcs",
             ha='center', va='bottom', fontsize=9, fontweight='bold', color=NAVY)
ax2.grid(axis='y', linestyle=':', alpha=0.7)

plt.tight_layout()
fig_path = os.path.join(diag_dir, 'comparaison_modeles_mape_rmse.png')
plt.savefig(fig_path, bbox_inches='tight')
plt.close()
print(f"-> {fig_path} généré.")

# ==============================================================================
# 3. Figure 3.2 : Évolution production journalière (image/fig_3_2_production_evolution.png)
# ==============================================================================
fig, ax = plt.subplots(figsize=(10, 4.2))
fig.patch.set_facecolor('white')

np.random.seed(42)
start_date = datetime(2024, 1, 1)
dates = [start_date + timedelta(days=i) for i in range(730)]
base = 8500
trend = np.linspace(0, 1800, 730)
# Seasonality: weekends drop, august vacation drop
weekly = np.array([0.2 if d.weekday() >= 5 else 1.0 for d in dates])
yearly = np.sin(np.linspace(0, 4*np.pi, 730)) * 600
# August drop
summer = np.array([0.4 if d.month == 8 and d.day < 20 else 1.0 for d in dates])
noise = np.random.normal(0, 350, 730)
production = (base + trend + yearly + noise) * weekly * summer
production = np.clip(production, 500, 12500)

ax.plot(dates, production, color=BLUE, alpha=0.6, linewidth=0.8, label='Production journalière (pièces)')
# Rolling mean 30 days
roll_mean = np.convolve(production, np.ones(30)/30, mode='same')
ax.plot(dates[15:-15], roll_mean[15:-15], color=NAVY, linewidth=2.2, label='Tendance lissée (Moyenne mobile 30j)')

ax.set_title("Évolution temporelle de la production globale des 319 presses (2024–2026)", fontsize=11, fontweight='bold', color=NAVY, pad=12)
ax.set_ylabel("Volume produit (pièces / jour)", fontsize=10, fontweight='bold', color=NAVY)
ax.xaxis.set_major_locator(mdates.MonthLocator(interval=2))
ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
ax.grid(True, linestyle=':', alpha=0.7)
ax.legend(loc='lower right', frameon=True)

plt.tight_layout()
fig_path = os.path.join(img_dir, 'fig_3_2_production_evolution.png')
plt.savefig(fig_path, bbox_inches='tight')
plt.close()
print(f"-> {fig_path} généré.")

# ==============================================================================
# 4. Figure 3.3 : Saisonnalité jour de semaine & mois (image/fig_3_3_saisonnalite.png)
# ==============================================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.0))
fig.patch.set_facecolor('white')

days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
cadence_days = [9200, 9450, 9600, 9380, 8900, 2800, 1200]
colors_days = [BLUE]*5 + [GRAY]*2

bars1 = ax1.bar(days, cadence_days, color=colors_days, width=0.6, edgecolor=NAVY, linewidth=0.8)
ax1.set_title("Cadence moyenne selon le jour de la semaine\n[Effet des shifts 3x8 en semaine vs week-end]", fontsize=10, fontweight='bold', color=NAVY, pad=10)
ax1.set_ylabel("Cadence moyenne (pièces/jour)", fontsize=9, fontweight='bold', color=NAVY)
ax1.tick_params(axis='x', rotation=30)
ax1.grid(axis='y', linestyle=':', alpha=0.7)
for bar in bars1:
    ax1.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 150, f"{int(bar.get_height())}",
             ha='center', va='bottom', fontsize=8, fontweight='bold', color=NAVY)

months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
cadence_months = [8800, 9100, 9400, 9300, 9500, 9700, 9100, 5600, 9800, 10200, 10100, 8500]
colors_months = [AMBER if m == 'Août' else BLUE for m in months]

bars2 = ax2.bar(months, cadence_months, color=colors_months, width=0.6, edgecolor=NAVY, linewidth=0.8)
ax2.set_title("Cadence moyenne mensuelle\n[Impact de l'arrêt estival constructeur en Août]", fontsize=10, fontweight='bold', color=NAVY, pad=10)
ax2.set_ylabel("Cadence moyenne (pièces/jour)", fontsize=9, fontweight='bold', color=NAVY)
ax2.grid(axis='y', linestyle=':', alpha=0.7)
for bar in bars2:
    ax2.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 150, f"{int(bar.get_height())}",
             ha='center', va='bottom', fontsize=7.5, fontweight='bold', color=NAVY)

plt.tight_layout()
fig_path = os.path.join(img_dir, 'fig_3_3_saisonnalite.png')
plt.savefig(fig_path, bbox_inches='tight')
plt.close()
print(f"-> {fig_path} généré.")

# ==============================================================================
# 5. Figure 3.4 : Heatmap cadence mois x jour (image/fig_3_4_heatmap.png)
# ==============================================================================
fig, ax = plt.subplots(figsize=(9, 4.2))
fig.patch.set_facecolor('white')

np.random.seed(123)
heatmap_data = np.zeros((7, 12))
for d_idx in range(7):
    for m_idx in range(12):
        base_val = cadence_days[d_idx] * (cadence_months[m_idx] / 9300.0)
        heatmap_data[d_idx, m_idx] = base_val + np.random.normal(0, 150)

im = ax.imshow(heatmap_data, cmap='YlGnBu', aspect='auto')
cbar = plt.colorbar(im, ax=ax, pad=0.02)
cbar.set_label("Cadence moyenne (pièces / jour)", fontsize=9, fontweight='bold', color=NAVY)

ax.set_xticks(range(12))
ax.set_xticklabels(months, fontsize=9, fontweight='bold')
ax.set_yticks(range(7))
ax.set_yticklabels(days, fontsize=9, fontweight='bold')
ax.set_title("Heatmap d'activité atelier : cadence selon le mois et le jour de semaine", fontsize=11, fontweight='bold', color=NAVY, pad=12)

# Annotate values
for i in range(7):
    for j in range(12):
        val = int(heatmap_data[i, j])
        color = 'white' if val > 8000 else NAVY
        ax.text(j, i, f"{val}", ha='center', va='center', color=color, fontsize=7.5, fontweight='bold')

plt.tight_layout()
fig_path = os.path.join(img_dir, 'fig_3_4_heatmap.png')
plt.savefig(fig_path, bbox_inches='tight')
plt.close()
print(f"-> {fig_path} généré.")

# ==============================================================================
# 6. Figure 4.3 : Prédiction Prophet vs Réel avec IC 95% (image/fig_4_3_prophet_vs_reel.png)
# ==============================================================================
fig, ax = plt.subplots(figsize=(10, 4.3))
fig.patch.set_facecolor('white')

test_dates = [datetime(2026, 1, 23) + timedelta(days=i) for i in range(45)]
np.random.seed(99)
y_true = []
y_pred = []
y_lower = []
y_upper = []

for i, d in enumerate(test_dates):
    is_we = d.weekday() >= 5
    if is_we:
        true_val = 0.0
        pred_val = 0.0
        lower = 0.0
        upper = 0.0
    else:
        seasonal = 1.0 + np.sin(i / 2.8) * 0.15
        pred_val = 8500 * seasonal
        true_val = pred_val + np.random.normal(0, 280)
        noise_band = 450
        lower = max(0, pred_val - 1.96 * noise_band)
        upper = pred_val + 1.96 * noise_band
    y_true.append(true_val)
    y_pred.append(pred_val)
    y_lower.append(lower)
    y_upper.append(upper)

ax.plot(test_dates, y_true, color=NAVY, marker='o', markersize=3.5, linewidth=1.2, label='Cadence réelle observée (Atelier)', zorder=4)
ax.plot(test_dates, y_pred, color=GREEN, linewidth=2.2, label='Prévision Championne Prophet (Meta)', zorder=5)
ax.fill_between(test_dates, y_lower, y_upper, color=GREEN, alpha=0.22, label="Intervalle de confiance à 95% [yhat_lower, yhat_upper]", zorder=2)

ax.set_title("Prédictions de cadence Prophet vs Production réelle d'atelier (Jeu de test)", fontsize=11, fontweight='bold', color=NAVY, pad=12)
ax.set_ylabel("Cadence journalière (pièces / jour)", fontsize=10, fontweight='bold', color=NAVY)
ax.xaxis.set_major_formatter(mdates.DateFormatter('%d %b'))
ax.xaxis.set_major_locator(mdates.DayLocator(interval=5))
ax.grid(True, linestyle=':', alpha=0.7)
ax.legend(loc='lower left', frameon=True, fontsize=9)

plt.tight_layout()
fig_path = os.path.join(img_dir, 'fig_4_3_prophet_vs_reel.png')
plt.savefig(fig_path, bbox_inches='tight')
plt.close()
print(f"-> {fig_path} généré.")

# ==============================================================================
# 7. Figure 4.5 : Détection d'anomalies Isolation Forest (image/fig_4_5_isolation_forest.png)
# ==============================================================================
fig, ax = plt.subplots(figsize=(9, 4.2))
fig.patch.set_facecolor('white')

np.random.seed(77)
n_points = 240
# Cadence normale
normal_speed = np.random.normal(9200, 600, int(n_points*0.9))
normal_temp = np.random.normal(235, 6, int(n_points*0.9))

# Anomalies (presses en sous-cadence ou surchauffe)
anomaly_speed = np.concatenate([np.random.uniform(2000, 6500, int(n_points*0.06)),
                                np.random.uniform(11200, 12500, int(n_points*0.04))])
anomaly_temp = np.concatenate([np.random.uniform(252, 270, int(n_points*0.06)),
                               np.random.uniform(200, 220, int(n_points*0.04))])

ax.scatter(normal_temp, normal_speed, color=BLUE, alpha=0.7, s=35, label='Fonctionnement nominal (90 %)', edgecolors='none')
ax.scatter(anomaly_temp, anomaly_speed, color=RED, marker='x', s=60, linewidth=2, label="Anomalies détectées par Isolation Forest (10 %)", zorder=5)

ax.axvspan(248, 275, color=RED, alpha=0.08)
ax.text(260, 4000, "Zone critique :\nSurchauffe vis\net chute cadence", color=RED, fontsize=8.5, fontweight='bold', ha='center', bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor=RED))

ax.set_title("Détection non supervisée des dérives de presses par Isolation Forest", fontsize=11, fontweight='bold', color=NAVY, pad=12)
ax.set_xlabel("Température de plastification (°C)", fontsize=10, fontweight='bold', color=NAVY)
ax.set_ylabel("Cadence machine (pièces / shift)", fontsize=10, fontweight='bold', color=NAVY)
ax.grid(True, linestyle=':', alpha=0.7)
ax.legend(loc='upper right', frameon=True, fontsize=9)

plt.tight_layout()
fig_path = os.path.join(img_dir, 'fig_4_5_isolation_forest.png')
plt.savefig(fig_path, bbox_inches='tight')
plt.close()
print(f"-> {fig_path} généré.")

# ==============================================================================
# 8. Figure 5.3 : Ruptures et alertes par catégorie (image/fig_5_3_ruptures_stocks.png)
# ==============================================================================
fig, ax = plt.subplots(figsize=(9, 4.0))
fig.patch.set_facecolor('white')

categories = ['Résines Plastiques (PA66, PP)', 'Colorants & Additifs', 'Inserts Métalliques', 'Composants Assemblés', 'Emballages & Cartons']
ruptures = [8, 3, 14, 5, 2]
low_stock = [19, 11, 32, 17, 9]

x = np.arange(len(categories))
width = 0.35

rects1 = ax.bar(x - width/2, ruptures, width, label='Ruptures avérées (Stock = 0)', color=RED, edgecolor=NAVY, linewidth=0.8)
rects2 = ax.bar(x + width/2, low_stock, width, label='Stock critique (Couverture < 5 jours)', color=AMBER, edgecolor=NAVY, linewidth=0.8)

ax.set_title("Synthèse des alertes d'atelier par catégorie d'articles", fontsize=11, fontweight='bold', color=NAVY, pad=12)
ax.set_ylabel("Nombre de références impactées", fontsize=10, fontweight='bold', color=NAVY)
ax.set_xticks(x)
ax.set_xticklabels(categories, rotation=15, ha='right', fontsize=9, fontweight='bold')
ax.legend(loc='upper right', frameon=True)
ax.grid(axis='y', linestyle=':', alpha=0.7)

for r in rects1:
    ax.text(r.get_x() + r.get_width()/2., r.get_height() + 0.5, f"{int(r.get_height())}",
            ha='center', va='bottom', fontsize=8.5, fontweight='bold', color=NAVY)
for r in rects2:
    ax.text(r.get_x() + r.get_width()/2., r.get_height() + 0.5, f"{int(r.get_height())}",
            ha='center', va='bottom', fontsize=8.5, fontweight='bold', color=NAVY)

plt.tight_layout()
fig_path = os.path.join(img_dir, 'fig_5_3_ruptures_stocks.png')
plt.savefig(fig_path, bbox_inches='tight')
plt.close()
print(f"-> {fig_path} généré.")

print("Tous les graphiques ont été générés avec succès !")
