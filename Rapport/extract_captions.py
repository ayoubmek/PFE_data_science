import re

files = [
    ('Ch1', 'Rapport/pfe_ch1.py'),
    ('Ch2', 'Rapport/pfe_ch2.py'),
    ('Ch3', 'Rapport/pfe_ch3.py'),
    ('Ch4', 'Rapport/pfe_ch4.py'),
    ('Ch5', 'Rapport/pfe_ch5.py'),
    ('Ch6', 'Rapport/pfe_ch6.py'),
    ('Annexe', 'Rapport/pfe_annexe.py')
]

for ch, path in files:
    content = open(path, encoding='utf-8').read()
    print('=== ' + ch + ' ===')
    tables = re.findall(r'text:\s*"((?:Tableau|Table)\s+[^"]+)"', content)
    for t in tables:
        print('  TABLE: ' + t)
    figures = re.findall(r'"(Figure\s+[^"]+)"', content)
    for f in figures:
        print('  FIG:   ' + f)
