import re, os
filepath = r'c:\Users\ayoub\OneDrive\Documents\PFEImen\Rapport\build_rapport.js'
os.system(f'git checkout "{filepath}"')
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('de l\'entreprise Arkan', 'de l\'entreprise [..........]')
content = content.replace('l\'entreprise Arkan', 'l\'entreprise [..........]')
content = content.replace('entre Arkan, les transporteurs et Magento', 'entre l\'atelier, la gestion de stock et le Data Warehouse')
content = content.replace('vers Magento', 'vers le Data Warehouse SQL Server')
old_uc_marker = 'const UC_DATA = {'
if old_uc_marker in content:
    new_uc_data = 
    content = re.sub(r'const UC_DATA = \{[\s\S]*?\n\};\n', new_uc_data + '\n', content)
content = content.replace('niveaux **High / Medium / Low**', 'niveaux de priorité **Haute / Moyenne / Basse**')
content = content.replace('niveaux High / Medium / Low', 'niveaux Haute / Moyenne / Basse')
content = content.replace('"User Story"', '"Récit Utilisateur (User Story)"')
content = content.replace('"High"', '"Haute"')
content = content.replace('"Medium"', '"Moyenne"')
content = content.replace('"Low"', '"Basse"')
old_abstract = 
new_exec = 
content = content.replace(old_abstract, new_exec)
content = content.replace('tocLine("Abstract", 0, "iv")', 'tocLine("Résumé Exécutif", 0, "iv")')
if 'frontTitle("Dédicace")' not in content:
    dedicace_block = 
    content = content.replace('// ══════════════════════════════════════════════════\n        // REMERCIEMENTS', dedicace_block + '// ══════════════════════════════════════════════════\n        // REMERCIEMENTS')
    old_toc_lines = 
    new_toc_lines = 
    content = content.replace(old_toc_lines, new_toc_lines)
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Clean all completed with escaped quotes!')