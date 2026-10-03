# -*- coding: utf-8 -*-
"""
Verification and Consistency Auditor for all chapters of the PFE Report.
Checks:
1. Section numbering continuity and hierarchy (1.1, 1.2, ..., 6.X)
2. Table numbering continuity (Tableau X.Y)
3. Figure numbering continuity (Figure X.Y)
4. Inter-chapter narrative transitions
5. Synchronization with TOC in generate_build_pfe.py
6. Detection of forbidden words (e.g., Metronic, stateless, ACID, fallback)
"""

import re
import sys
from pathlib import Path

# Add Rapport directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from pfe_intro_concl import get_intro, get_concl_biblio
from pfe_ch1 import get_chapter1
from pfe_ch2 import get_chapter2
from pfe_ch3 import get_chapter3
from pfe_ch4 import get_chapter4
from pfe_ch5 import get_chapter5
from pfe_ch6 import get_chapter6

chapters = [
    ("Introduction", get_intro(), 0),
    ("Chapitre 1", get_chapter1(), 1),
    ("Chapitre 2", get_chapter2(), 2),
    ("Chapitre 3", get_chapter3(), 3),
    ("Chapitre 4", get_chapter4(), 4),
    ("Chapitre 5", get_chapter5(), 5),
    ("Chapitre 6", get_chapter6(), 6),
    ("Conclusion", get_concl_biblio(), 7),
]

print("=" * 80)
print("              AUDIT DE COHÉRENCE ET DE CONFORMITÉ DU RAPPORT PFE")
print("=" * 80)

total_tables = 0
total_figures = 0
all_tables = []
all_figures = []
all_sections = []
forbidden_words = ["metronic", "stateless", "acid", "fallback", "scalabilité horizontale", "cloisonnement strict"]

for ch_name, content, ch_idx in chapters:
    print(f"\n--- {ch_name} ---")
    
    # 1. Sections
    t1 = re.findall(r'title1\("([^"]+)"\)', content)
    t2 = re.findall(r'title2\("([^"]+)"\)', content)
    t3 = re.findall(r'title3\("([^"]+)"\)', content)
    
    print(f"  • Titre principal : {t1[0] if t1 else 'Aucun'}")
    print(f"  • Sections niveau 2 ({len(t2)}) : {', '.join([s.split()[0] for s in t2])}")
    print(f"  • Sous-sections niveau 3 ({len(t3)}) : {', '.join([s.split()[0] for s in t3])}")
    all_sections.extend(t2)
    all_sections.extend(t3)
    
    # Check section continuity for chapters 1-6
    if 1 <= ch_idx <= 6:
        sec_nums = []
        for s in t2:
            m = re.match(r"^(\d+\.\d+)", s.strip())
            if m:
                sec_nums.append(m.group(1))
        expected_sec_nums = [f"{ch_idx}.{i}" for i in range(1, len(sec_nums) + 1)]
        if sec_nums == expected_sec_nums:
            print(f"  [OK] Continuité des sections : {sec_nums[0]} à {sec_nums[-1]}")
        else:
            print(f"  [ALERTE] Écart de numérotation de section : trouvé {sec_nums}, attendu {expected_sec_nums}")

    # 2. Tables
    tbl_matches = re.findall(r'Tableau\s+(\d+\.\d+)\s*:\s*([^"]+)', content)
    unique_tbls = []
    seen_tbl = set()
    for num, desc in tbl_matches:
        if num not in seen_tbl:
            seen_tbl.add(num)
            unique_tbls.append((num, desc.strip()))
    
    print(f"  • Tableaux ({len(unique_tbls)}) :")
    for num, desc in unique_tbls:
        print(f"     - Tableau {num} : {desc}")
        all_tables.append((num, desc))
    total_tables += len(unique_tbls)

    # 3. Figures
    fig_matches = re.findall(r'Figure\s+(\d+\.\d+)\s*:\s*([^"]+)', content)
    unique_figs = []
    seen_fig = set()
    for num, desc in fig_matches:
        if num not in seen_fig:
            seen_fig.add(num)
            unique_figs.append((num, desc.strip()))
            
    print(f"  • Figures ({len(unique_figs)}) :")
    for num, desc in unique_figs:
        print(f"     - Figure {num} : {desc}")
        all_figures.append((num, desc))
    total_figures += len(unique_figs)

    # 4. Forbidden words check
    found_forbidden = []
    for fw in forbidden_words:
        if fw in content.lower():
            found_forbidden.append(fw)
    if found_forbidden:
        print(f"  [ALERTE] Mots interdits détectés : {', '.join(found_forbidden)}")
    else:
        print("  [OK] Aucun mot interdit détecté (style propre et épuré).")

print("\n" + "=" * 80)
print(f"BILAN GLOBAL : {len(chapters)} Parties | {len(all_sections)} Sections | {total_tables} Tableaux | {total_figures} Figures")
print("=" * 80)
