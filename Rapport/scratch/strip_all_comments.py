import os, re, zipfile
import xml.etree.ElementTree as ET
def strip_js_java_comments(code):
    def replacer(match):
        s = match.group(0)
        if s.startswith('/'):
            return "" 
        else:
            return s 
    pattern = re.compile(
        r'//.*?$|/\*.*?\*/|\'(?:\\.|[^\\\'])*\'|"(?:\\.|[^\\"])*"|`(?:\\.|[^\\`])*`',
        re.DOTALL | re.MULTILINE
    )
    cleaned = []
    for line in code.splitlines():
        new_line = pattern.sub(replacer, line)
        cleaned.append(new_line)
    full_cleaned = "\n".join(cleaned)
    block_pattern = re.compile(
        r'/\*.*?\*/|\'(?:\\.|[^\\\'])*\'|"(?:\\.|[^\\"])*"|`(?:\\.|[^\\`])*`',
        re.DOTALL
    )
    full_cleaned = block_pattern.sub(replacer, full_cleaned)
    final_lines = []
    for line in full_cleaned.splitlines():
        if line.strip() != "":
            final_lines.append(line)
        elif line == "":
            final_lines.append("") 
    return "\n".join(final_lines)
def strip_python_comments(code):
    def replacer(match):
        s = match.group(0)
        if s.startswith('#'):
            return ""
        elif s.startswith('"""') or s.startswith("'''"):
            return ""
        else:
            return s
    pattern = re.compile(
        r'#.*?$|"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'|\'(?:\\.|[^\\\'])*\'|"(?:\\.|[^\\"])*"',
        re.DOTALL | re.MULTILINE
    )
    cleaned = pattern.sub(replacer, code)
    lines = [l for l in cleaned.splitlines() if l.strip() != ""]
    return "\n".join(lines)
def process_file(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            code = f.read()
    except Exception:
        return
    if ext in ['.java', '.ts', '.tsx', '.js', '.jsx', '.css', '.scss']:
        cleaned = strip_js_java_comments(code)
    elif ext == '.py':
        cleaned = strip_python_comments(code)
    else:
        return
    if cleaned != code:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(cleaned)
        print(f"Cleaned comments in: {filepath}")
target_dirs = [
    r'c:\Users\ayoub\OneDrive\Documents\PFEImen\backend\src',
    r'c:\Users\ayoub\OneDrive\Documents\PFEImen\frontend\src',
    r'c:\Users\ayoub\OneDrive\Documents\PFEImen\ml-service',
    r'c:\Users\ayoub\OneDrive\Documents\PFEImen\Rapport'
]
for d in target_dirs:
    if not os.path.exists(d):
        continue
    for root, subdirs, files in os.walk(d):
        if 'node_modules' in root or 'target' in root or '__pycache__' in root or 'build' in root or 'dist' in root:
            continue
        for file in files:
            filepath = os.path.join(root, file)
            process_file(filepath)
print("Source code comments stripped successfully!")