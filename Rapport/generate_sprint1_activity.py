# -*- coding: utf-8 -*-
"""
Générateur du diagramme d'architecture et de flux séquentiel du pipeline ETL (Figure 3.5).
Format horizontal panoramique haute résolution (300 DPI) parfaitement adapté à une page Word A4.
Palette de couleurs professionnelle Nexora (Bleu Marine, Cyan, Indigo, Vert Émeraude).
"""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

def generate_etl_diagram(output_path):
    fig, ax = plt.subplots(figsize=(15.2, 6.8), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')
    ax.set_xlim(0, 15.2)
    ax.set_ylim(0, 6.8)
    ax.axis('off')

    # Palette Nexora
    COLOR_TEXT_MAIN = '#0f172a'
    COLOR_TEXT_MUTED = '#475569'
    COLOR_BORDER = '#cbd5e1'

    STEPS = [
        {
            "num": "PHASE 1",
            "title_line1": "Ingestion des",
            "title_line2": "Données Brutes",
            "sub": "Extractions brutes ERP atelier",
            "color": "#1e3a8a",     # Bleu marine profond
            "accent": "#2563eb",
            "items": [
                ("• Extractions atelier brutes :", True),
                ("   - PRODUCTION_RAW.csv", False),
                ("   - ASTOCKDATE_RAW.csv", False),
                ("• Contrôle structure & encodage", True),
                ("• Typage initial des colonnes", True),
                ("• Pré-audit de complétude", True)
            ]
        },
        {
            "num": "PHASE 2",
            "title_line1": "Assainissement &",
            "title_line2": "Contrôle Qualité",
            "sub": "Moteur des 10 règles qualité",
            "color": "#0369a1",     # Bleu océan
            "accent": "#0284c7",
            "items": [
                ("• Déduplication Date-Article-Site", True),
                ("• Standardisation dates ISO 8601", True),
                ("• Harmonisation décimales", True),
                ("• Régularisation coûts & stocks < 0", True),
                ("• Imputation valeurs manquantes", True),
                ("• Filtrage identifiants invalides", True)
            ]
        },
        {
            "num": "PHASE 3",
            "title_line1": "Structuration",
            "title_line2": "Dimensionnelle",
            "sub": "Modélisation relationnelle étoile",
            "color": "#4338ca",     # Indigo
            "accent": "#4f46e5",
            "items": [
                ("• Génération clés PK / FK", True),
                ("• Dimension MCMachineCenter", True),
                ("• Fait FACT_CLE (TRS & cadence)", True),
                ("• Fait ASTOCKDATE (inventaire)", True),
                ("• Normalisation relationnelle", True),
                ("• Traçabilité des transformations", True)
            ]
        },
        {
            "num": "PHASE 4",
            "title_line1": "Chargement dans le",
            "title_line2": "Data Warehouse",
            "sub": "Entrepôt SQL Server 2022",
            "color": "#047857",     # Vert émeraude profond
            "accent": "#059669",
            "items": [
                ("• Insertion par lots optimisée", True),
                ("• Reconstruction des index", True),
                ("• Vérification intégrité référentielle", True),
                ("• Journalisation de l'exécution", True),
                ("• Rapport d'audit de qualité", True),
                ("• Disponibilité certifiée BI & IA", True)
            ]
        }
    ]

    card_w = 3.32
    card_h = 5.7
    gap = 0.44
    start_x = 0.38
    card_y = 0.55

    for i, step in enumerate(STEPS):
        cx = start_x + i * (card_w + gap)

        # 1. Ombre douce
        shadow = FancyBboxPatch(
            (cx + 0.05, card_y - 0.05), card_w, card_h,
            boxstyle="round,pad=0.02,rounding_size=0.18",
            facecolor='#e2e8f0', edgecolor='none', zorder=1
        )
        ax.add_patch(shadow)

        # 2. Carte principale
        card = FancyBboxPatch(
            (cx, card_y), card_w, card_h,
            boxstyle="round,pad=0.02,rounding_size=0.18",
            facecolor='#ffffff', edgecolor=COLOR_BORDER, linewidth=1.2, zorder=2
        )
        ax.add_patch(card)

        # 3. En-tête
        header_h = 1.65
        header_y = card_y + card_h - header_h
        header = FancyBboxPatch(
            (cx, header_y), card_w, header_h,
            boxstyle="round,pad=0.02,rounding_size=0.18",
            facecolor=step['color'], edgecolor=step['color'], linewidth=1, zorder=3
        )
        ax.add_patch(header)
        rect_mask = patches.Rectangle(
            (cx, header_y), card_w, header_h * 0.4,
            facecolor=step['color'], edgecolor=step['color'], zorder=3
        )
        ax.add_patch(rect_mask)

        # Badge Numéro
        badge = FancyBboxPatch(
            (cx + 0.22, header_y + header_h - 0.38), 1.05, 0.25,
            boxstyle="round,pad=0.02,rounding_size=0.08",
            facecolor='#ffffff', edgecolor='none', zorder=4
        )
        ax.add_patch(badge)
        ax.text(cx + 0.22 + 0.525, header_y + header_h - 0.255, step['num'],
                ha='center', va='center', fontsize=8.8, fontweight='bold',
                color=step['color'], zorder=5, family='sans-serif')

        # Titre (2 lignes)
        ax.text(cx + 0.22, header_y + header_h - 0.68, step['title_line1'],
                ha='left', va='center', fontsize=11, fontweight='bold',
                color='#ffffff', zorder=5, family='sans-serif')
        ax.text(cx + 0.22, header_y + header_h - 0.98, step['title_line2'],
                ha='left', va='center', fontsize=11, fontweight='bold',
                color='#ffffff', zorder=5, family='sans-serif')

        # Sous-titre
        ax.text(cx + 0.22, header_y + header_h - 1.34, step['sub'],
                ha='left', va='center', fontsize=8.5, fontstyle='italic',
                color='#e2e8f0', zorder=5, family='sans-serif')

        # 4. Liste des éléments
        items_y = header_y - 0.38
        for text, is_bold in step['items']:
            font_size = 8.5 if is_bold else 8.0
            font_weight = 'bold' if is_bold else 'normal'
            text_color = COLOR_TEXT_MAIN if is_bold else COLOR_TEXT_MUTED
            indent = 0.22 if is_bold else 0.32

            ax.text(cx + indent, items_y, text,
                    ha='left', va='center', fontsize=font_size,
                    fontweight=font_weight, color=text_color, zorder=4, family='sans-serif')
            items_y -= 0.52

        # 5. Flèche vers étape suivante
        if i < len(STEPS) - 1:
            arrow_x = cx + card_w + 0.05
            arrow_y = card_y + (card_h - header_h) / 2 + 0.2
            ax.annotate(
                "",
                xy=(arrow_x + gap - 0.1, arrow_y),
                xytext=(arrow_x, arrow_y),
                arrowprops=dict(
                    arrowstyle="-|>",
                    color=step['accent'],
                    lw=2.8,
                    mutation_scale=20
                ),
                zorder=6
            )

    plt.tight_layout()
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=300, bbox_inches='tight', pad_inches=0.1)
    plt.close()
    print(f"Diagramme généré avec succès : {output_path}")

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), "diagrams", "sprint1_activity.png")
    generate_etl_diagram(out_file)
