# -*- coding: utf-8 -*-
"""
Generate Figure 1.3: Workflow complet du système décisionnel Nexora
Style: Circular modern infographic perfectly matching the user's reference image
"""
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Circle, Wedge, Polygon, Rectangle, PathPatch
from matplotlib.path import Path

def generate_diagram(output_path):
    fig, ax = plt.subplots(figsize=(10.5, 10.5), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')
    ax.set_xlim(-5.8, 5.8)
    ax.set_ylim(-5.8, 5.8)
    ax.set_aspect('equal')
    ax.axis('off')

    # Palette
    TITLE_BLUE = '#16325c'
    CYAN_ARROW = '#009fe3'
    CYAN_DARK = '#0284c7'
    CYAN_LIGHT = '#38bdf8'
    BG_CIRCLE = '#f0f9ff'
    BORDER_CIRCLE = '#0284c7'
    BORDER_INNER = '#7dd3fc'
    GRAY_TEXT = '#526173'
    GRAY_LINE = '#94a3b8'
    RED_ACCENT = '#ef4444'

    # Helper: draw 4-pointed sparkle star
    def draw_sparkle(x, y, s=0.07, color=CYAN_ARROW):
        p = Path([
            (x, y - s),
            (x + s*0.22, y - s*0.22),
            (x + s, y),
            (x + s*0.22, y + s*0.22),
            (x, y + s),
            (x - s*0.22, y + s*0.22),
            (x - s, y),
            (x - s*0.22, y - s*0.22),
            (x, y - s)
        ], [Path.MOVETO] + [Path.LINETO]*7 + [Path.CLOSEPOLY])
        patch = PathPatch(p, facecolor='none', edgecolor=color, lw=1.2, zorder=6)
        ax.add_patch(patch)

    # -------------------------------------------------------------
    # 1. CENTER HUB: TITLE & CENTRAL DECISION TREE
    # -------------------------------------------------------------
    ax.text(0, 0.95, "WORKFLOW DU SYSTÈME", ha='center', va='center',
            fontsize=15, fontweight='bold', color=TITLE_BLUE, family='sans-serif')
    ax.text(0, 0.58, "DÉCISIONNEL NEXORA", ha='center', va='center',
            fontsize=15, fontweight='bold', color=TITLE_BLUE, family='sans-serif')

    # Central Decision Tree (like in reference center)
    tree_lines = [
        ((0, 0.05), (-0.50, -0.35)),
        ((0, 0.05), (0.50, -0.35)),
        ((-0.50, -0.35), (-0.80, -0.85)),
        ((-0.50, -0.35), (-0.20, -0.85)),
        ((0.50, -0.35), (0.20, -0.85)),
        ((0.50, -0.35), (0.80, -0.85)),
    ]
    for p1, p2 in tree_lines:
        ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=CYAN_ARROW, lw=2.2, zorder=2)

    # Tree nodes
    ax.add_patch(Circle((0, 0.05), 0.14, facecolor=CYAN_ARROW, edgecolor=TITLE_BLUE, lw=1.4, zorder=3))
    for pos in [(-0.50, -0.35), (0.50, -0.35)]:
        ax.add_patch(Circle(pos, 0.12, facecolor=CYAN_LIGHT, edgecolor=TITLE_BLUE, lw=1.2, zorder=3))
    for pos in [(-0.80, -0.85), (-0.20, -0.85), (0.20, -0.85), (0.80, -0.85)]:
        ax.add_patch(Circle(pos, 0.09, facecolor='#ffffff', edgecolor=CYAN_ARROW, lw=1.4, zorder=3))

    # -------------------------------------------------------------
    # 2. WORKFLOW STAGES (Positions on circle radius R=3.75)
    # -------------------------------------------------------------
    R = 3.75
    node_r = 0.58
    angles_deg = [90, 45, 0, 315, 270, 225, 180, 135]

    stages = [
        {
            "id": 1,
            "title": "DÉFINITION STRATÉGIQUE",
            "desc": "Cadrage métier & KPI TRG",
            "icon": "strategy"
        },
        {
            "id": 2,
            "title": "COLLECTE DES DONNÉES",
            "desc": "DWH SQL Server (CLE/ILE)",
            "icon": "database"
        },
        {
            "id": 3,
            "title": "PRÉTRAITEMENT & ETL",
            "desc": "Nettoyage & recalage stocks",
            "icon": "funnel"
        },
        {
            "id": 4,
            "title": "FEATURE ENGINEERING",
            "desc": "16 variables & lags temporels",
            "icon": "modeling"
        },
        {
            "id": 5,
            "title": "ENTRAÎNEMENT & MODÈLES",
            "desc": "Prophet, RF, ARIMA, IsoForest",
            "icon": "training"
        },
        {
            "id": 6,
            "title": "OPTIMISATION & TUNING",
            "desc": "TimeSeriesSplit à 5 plis",
            "icon": "optimization"
        },
        {
            "id": 7,
            "title": "DÉPLOIEMENT APPLICATIF",
            "desc": "Microservice FastAPI REST",
            "icon": "deployment"
        },
        {
            "id": 8,
            "title": "SUPERVISION DES PERFORMANCES",
            "desc": "Tableaux de bord React & PBI",
            "icon": "monitoring"
        }
    ]

    coords = []
    for deg in angles_deg:
        rad = np.radians(deg)
        x = R * np.cos(rad)
        y = R * np.sin(rad)
        coords.append((x, y))

    # -------------------------------------------------------------
    # 3. DRAW ELEGANT CURVED ARROWS ON THE OUTER PERIMETER
    # -------------------------------------------------------------
    # In reference image, arrows connect the circles on the outer track
    R_arrow = R + 0.05
    for i in range(8):
        # Clockwise: angle decreases
        a_start = angles_deg[i] - 15
        a_end = angles_deg[(i + 1) % 8] + 15
        if a_end > a_start:
            a_end -= 360

        theta = np.linspace(np.radians(a_start), np.radians(a_end), 40)
        arc_x = R_arrow * np.cos(theta)
        arc_y = R_arrow * np.sin(theta)

        # Draw shaft
        ax.plot(arc_x, arc_y, color=CYAN_ARROW, lw=3.0, solid_capstyle='round', zorder=2)

        # Arrowhead at end
        tip_x, tip_y = arc_x[-1], arc_y[-1]
        tangent_rad = theta[-1] - np.pi/2
        dx = np.cos(tangent_rad)
        dy = np.sin(tangent_rad)

        arrow_len = 0.22
        arrow_w = 0.12
        p_tip = np.array([tip_x, tip_y])
        p_base = p_tip - arrow_len * np.array([dx, dy])
        p_perp = np.array([-dy, dx])
        p_left = p_base + arrow_w * p_perp
        p_right = p_base - arrow_w * p_perp

        arrow_poly = Polygon([p_tip, p_left, p_right], closed=True, facecolor=CYAN_ARROW, edgecolor='none', zorder=3)
        ax.add_patch(arrow_poly)

    # Feedback loop: vertical arrow from stage 8 (SUPERVISION) straight down to stage 6 (OPTIMISATION)
    # Positioned at x = -2.1 (in clear space)
    ax.plot([-2.0, -2.0], [2.1, -1.8], color=CYAN_ARROW, lw=3.0, solid_capstyle='round', zorder=2)
    # Arrow tip pointing down at -1.8
    tip_fb = np.array([-2.0, -1.8])
    base_fb = tip_fb - 0.22 * np.array([0, -1])
    left_fb = base_fb + 0.12 * np.array([-1, 0])
    right_fb = base_fb - 0.12 * np.array([-1, 0])
    ax.add_patch(Polygon([tip_fb, left_fb, right_fb], closed=True, facecolor=CYAN_ARROW, edgecolor='none', zorder=3))

    # -------------------------------------------------------------
    # 4. DRAW NODES (CIRCLES + ICONS + LABELS)
    # -------------------------------------------------------------
    for i, (stage, (cx, cy)) in enumerate(zip(stages, coords)):
        # Circle badge
        c_bg = Circle((cx, cy), node_r, facecolor=BG_CIRCLE, edgecolor=BORDER_CIRCLE, lw=2.4, zorder=4)
        ax.add_patch(c_bg)
        c_ring = Circle((cx, cy), node_r - 0.065, facecolor='none', edgecolor=BORDER_INNER, lw=1.0, ls=':', zorder=4)
        ax.add_patch(c_ring)

        # Sparkles next to each node
        draw_sparkle(cx - node_r * 0.95, cy + node_r * 0.85, s=0.07)
        draw_sparkle(cx - node_r * 0.75, cy + node_r * 1.10, s=0.045)
        draw_sparkle(cx + node_r * 0.90, cy - node_r * 0.80, s=0.055)

        icon = stage["icon"]

        # -----------------------------
        # DRAW SPECIFIC VECTORS
        # -----------------------------
        if icon == "strategy":
            # Chess knight with checkered pedestal
            for col_i in range(3):
                for row_i in range(2):
                    sq_x = cx - 0.22 + col_i * 0.15
                    sq_y = cy - 0.28 + row_i * 0.11
                    f_col = CYAN_LIGHT if (col_i + row_i) % 2 == 0 else '#ffffff'
                    ax.add_patch(Rectangle((sq_x, sq_y), 0.15, 0.11, facecolor=f_col, edgecolor=GRAY_LINE, lw=0.8, zorder=5))
            ax.add_patch(Rectangle((cx - 0.18, cy - 0.06), 0.36, 0.07, facecolor=CYAN_DARK, edgecolor=TITLE_BLUE, lw=1.1, zorder=5))
            knight_pts = [
                (cx - 0.09, cy + 0.01),
                (cx - 0.14, cy + 0.14),
                (cx - 0.05, cy + 0.27),
                (cx + 0.11, cy + 0.22),
                (cx + 0.15, cy + 0.09),
                (cx + 0.05, cy + 0.04),
                (cx + 0.11, cy + 0.01),
                (cx - 0.09, cy + 0.01)
            ]
            ax.add_patch(Polygon(knight_pts, facecolor='#ffffff', edgecolor=TITLE_BLUE, lw=1.3, zorder=5))
            ax.plot([cx + 0.02], [cy + 0.16], 'o', color=TITLE_BLUE, ms=2.2, zorder=6)

        elif icon == "database":
            # 3 Stacked database cylinders with side wires
            for dy, col in zip([0.16, -0.01, -0.18], [CYAN_LIGHT, '#ffffff', CYAN_DARK]):
                ax.add_patch(patches.Ellipse((cx, cy + dy), 0.52, 0.16, facecolor=col, edgecolor=TITLE_BLUE, lw=1.1, zorder=5))
                ax.plot([cx - 0.26, cx - 0.26], [cy + dy - 0.07, cy + dy], color=TITLE_BLUE, lw=1.1, zorder=5)
                ax.plot([cx + 0.26, cx + 0.26], [cy + dy - 0.07, cy + dy], color=TITLE_BLUE, lw=1.1, zorder=5)
            ax.plot([cx - 0.35, cx - 0.26], [cy, cy], color=CYAN_ARROW, lw=1.4, zorder=5)
            ax.plot([cx + 0.26, cx + 0.35], [cy, cy], color=CYAN_ARROW, lw=1.4, zorder=5)
            ax.add_patch(Circle((cx - 0.35, cy), 0.035, facecolor=TITLE_BLUE, zorder=6))
            ax.add_patch(Circle((cx + 0.35, cy), 0.035, facecolor=TITLE_BLUE, zorder=6))

        elif icon == "funnel":
            # Data Funnel with cubes entering
            ax.add_patch(Rectangle((cx - 0.16, cy + 0.20), 0.11, 0.11, facecolor=CYAN_LIGHT, edgecolor=TITLE_BLUE, lw=0.9, zorder=5))
            ax.add_patch(Rectangle((cx - 0.03, cy + 0.23), 0.11, 0.11, facecolor='#ffffff', edgecolor=TITLE_BLUE, lw=0.9, zorder=5))
            ax.add_patch(Rectangle((cx + 0.07, cy + 0.18), 0.11, 0.11, facecolor=CYAN_DARK, edgecolor=TITLE_BLUE, lw=0.9, zorder=5))
            ax.add_patch(Circle((cx + 0.24, cy + 0.10), 0.065, facecolor='#ffffff', edgecolor=TITLE_BLUE, lw=1.1, zorder=5))
            ax.add_patch(Polygon([(cx - 0.24, cy + 0.13), (cx + 0.24, cy + 0.13),
                                  (cx + 0.06, cy - 0.11), (cx - 0.06, cy - 0.11)],
                                 facecolor='#ffffff', edgecolor=TITLE_BLUE, lw=1.3, zorder=5))
            ax.add_patch(Rectangle((cx - 0.045, cy - 0.25), 0.09, 0.14, facecolor=CYAN_LIGHT, edgecolor=TITLE_BLUE, lw=1.1, zorder=5))

        elif icon == "modeling":
            # Schema grid over cylinder base
            for r in range(2):
                for c in range(3):
                    bx = cx - 0.20 + c * 0.14
                    by = cy + 0.16 - r * 0.13
                    b_col = CYAN_LIGHT if (r + c) % 2 == 0 else '#ffffff'
                    ax.add_patch(Rectangle((bx, by), 0.11, 0.09, facecolor=b_col, edgecolor=TITLE_BLUE, lw=0.9, zorder=5))
            ax.add_patch(patches.Ellipse((cx, cy - 0.16), 0.40, 0.14, facecolor=CYAN_DARK, edgecolor=TITLE_BLUE, lw=1.1, zorder=5))
            ax.plot([cx, cx], [cy - 0.04, cy - 0.16], color=TITLE_BLUE, lw=1.4, zorder=5)

        elif icon == "training":
            # Neural network
            cols_x = [cx - 0.22, cx, cx + 0.22]
            layer_y = [cy + 0.18, cy, cy - 0.18]
            for y1 in layer_y:
                for y2 in layer_y:
                    ax.plot([cols_x[0], cols_x[1]], [y1, y2], color=GRAY_LINE, lw=0.8, zorder=4)
                    ax.plot([cols_x[1], cols_x[2]], [y1, y2], color=GRAY_LINE, lw=0.8, zorder=4)
            for x_pos in cols_x:
                for y_pos in layer_y:
                    n_col = '#ffffff' if x_pos == cx else CYAN_LIGHT
                    ax.add_patch(Circle((x_pos, y_pos), 0.06, facecolor=n_col, edgecolor=TITLE_BLUE, lw=1.1, zorder=5))

        elif icon == "optimization":
            # Speedometer with red needle and wrench
            ax.add_patch(Wedge((cx, cy - 0.02), 0.28, 0, 180, width=0.08, facecolor='#ffffff', edgecolor=TITLE_BLUE, lw=1.1, zorder=5))
            for t_deg in [30, 60, 90, 120, 150]:
                trad = np.radians(t_deg)
                ax.plot([cx + 0.21*np.cos(trad), cx + 0.26*np.cos(trad)],
                        [cy - 0.02 + 0.21*np.sin(trad), cy - 0.02 + 0.26*np.sin(trad)],
                        color=TITLE_BLUE, lw=1.1, zorder=5)
            ax.add_patch(Circle((cx, cy - 0.02), 0.045, facecolor=TITLE_BLUE, zorder=6))
            n_rad = np.radians(135)
            ax.plot([cx, cx + 0.22 * np.cos(n_rad)], [cy - 0.02, cy - 0.02 + 0.22 * np.sin(n_rad)],
                    color=RED_ACCENT, lw=2.0, zorder=6)
            ax.add_patch(Rectangle((cx - 0.20, cy - 0.22), 0.40, 0.07, facecolor=CYAN_LIGHT, edgecolor=TITLE_BLUE, lw=0.9, zorder=5))
            ax.add_patch(Circle((cx - 0.20, cy - 0.185), 0.055, facecolor='#ffffff', edgecolor=TITLE_BLUE, lw=1, zorder=5))
            ax.add_patch(Circle((cx + 0.20, cy - 0.185), 0.055, facecolor='#ffffff', edgecolor=TITLE_BLUE, lw=1, zorder=5))

        elif icon == "deployment":
            # AI Microprocessor
            ax.add_patch(Rectangle((cx - 0.16, cy - 0.16), 0.32, 0.32, facecolor=CYAN_LIGHT, edgecolor=TITLE_BLUE, lw=1.3, zorder=5))
            for p in [-0.08, 0.0, 0.08]:
                ax.plot([cx + p, cx + p], [cy + 0.16, cy + 0.23], color=TITLE_BLUE, lw=1.4, zorder=4)
                ax.plot([cx + p, cx + p], [cy - 0.16, cy - 0.23], color=TITLE_BLUE, lw=1.4, zorder=4)
                ax.plot([cx - 0.16, cx - 0.23], [cy + p, cy + p], color=TITLE_BLUE, lw=1.4, zorder=4)
                ax.plot([cx + 0.16, cx + 0.23], [cy + p, cy + p], color=TITLE_BLUE, lw=1.4, zorder=4)
            ax.add_patch(Circle((cx, cy), 0.10, facecolor='#ffffff', edgecolor=CYAN_DARK, lw=1.1, zorder=6))

        elif icon == "monitoring":
            # Bar chart with Gaussian bell curve
            b_heights = [0.16, 0.32, 0.44, 0.29, 0.14]
            for bi, bh in enumerate(b_heights):
                bx = cx - 0.22 + bi * 0.09
                b_col = CYAN_DARK if bi == 2 else CYAN_LIGHT
                ax.add_patch(Rectangle((bx, cy - 0.22), 0.075, bh, facecolor=b_col, edgecolor=TITLE_BLUE, lw=0.9, zorder=5))
            x_curve = np.linspace(cx - 0.25, cx + 0.25, 30)
            y_curve = cy - 0.22 + 0.48 * np.exp(-((x_curve - cx) / 0.16)**2)
            ax.plot(x_curve, y_curve, color=TITLE_BLUE, lw=1.5, zorder=6)

        # ---------------------------------------------------------
        # LABELS: Centered directly below/above the circle
        # ---------------------------------------------------------
        deg = angles_deg[i]
        
        # Position label inside radius so arrows never touch it
        # For top (90 deg): place above circle
        # For bottom (270 deg): place below circle
        # For others: place directly below the circle, well within boundaries
        if deg == 90:
            ax.text(cx, cy - node_r - 0.12, stage["title"], ha='center', va='top',
                    fontsize=8.8, fontweight='black', color=TITLE_BLUE, family='sans-serif')
            ax.text(cx, cy - node_r - 0.31, stage["desc"], ha='center', va='top',
                    fontsize=7.5, fontweight='bold', color=GRAY_TEXT, family='sans-serif')
        elif deg == 270:
            ax.text(cx, cy - node_r - 0.12, stage["title"], ha='center', va='top',
                    fontsize=8.8, fontweight='black', color=TITLE_BLUE, family='sans-serif')
            ax.text(cx, cy - node_r - 0.31, stage["desc"], ha='center', va='top',
                    fontsize=7.5, fontweight='bold', color=GRAY_TEXT, family='sans-serif')
        elif deg in [45, 315]:
            ax.text(cx, cy - node_r - 0.12, stage["title"], ha='center', va='top',
                    fontsize=8.8, fontweight='black', color=TITLE_BLUE, family='sans-serif')
            ax.text(cx, cy - node_r - 0.31, stage["desc"], ha='center', va='top',
                    fontsize=7.5, fontweight='bold', color=GRAY_TEXT, family='sans-serif')
        elif deg in [135, 225]:
            ax.text(cx, cy - node_r - 0.12, stage["title"], ha='center', va='top',
                    fontsize=8.8, fontweight='black', color=TITLE_BLUE, family='sans-serif')
            ax.text(cx, cy - node_r - 0.31, stage["desc"], ha='center', va='top',
                    fontsize=7.5, fontweight='bold', color=GRAY_TEXT, family='sans-serif')
        elif deg == 0:
            ax.text(cx, cy - node_r - 0.12, stage["title"], ha='center', va='top',
                    fontsize=8.8, fontweight='black', color=TITLE_BLUE, family='sans-serif')
            ax.text(cx, cy - node_r - 0.31, stage["desc"], ha='center', va='top',
                    fontsize=7.5, fontweight='bold', color=GRAY_TEXT, family='sans-serif')
        elif deg == 180:
            ax.text(cx, cy - node_r - 0.12, stage["title"], ha='center', va='top',
                    fontsize=8.8, fontweight='black', color=TITLE_BLUE, family='sans-serif')
            ax.text(cx, cy - node_r - 0.31, stage["desc"], ha='center', va='top',
                    fontsize=7.5, fontweight='bold', color=GRAY_TEXT, family='sans-serif')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', pad_inches=0.10)
    plt.close()
    print("Clean professional workflow diagram generated at:", output_path)

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), 'diagrams', 'architecture.png')
    generate_diagram(out_file)
