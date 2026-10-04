import glob

files = glob.glob('Rapport/*.py') + ['Rapport/build_pfe.js']
bad_strings = ['VÉRIFIER', 'VERIF', '272 685 750', '272685750', "Grille d'évaluation d'utilisabilité"]

found = False
for f in files:
    if 'check_clean.py' in f:
        continue
    content = open(f, encoding='utf-8', errors='ignore').read()
    for b in bad_strings:
        if b.lower() in content.lower():
            print(f'FOUND "{b}" in {f}')
            found = True

if not found:
    print("ALL CLEAN: Zero bad strings found across all Rapport files and build_pfe.js!")
