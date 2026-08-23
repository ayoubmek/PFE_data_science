import zipfile
import re
with zipfile.ZipFile('scratch/test_out.docx', 'r') as zip_ref:
    document_xml = zip_ref.read('word/document.xml').decode('utf-8')
    print("Found w:pgNumType tags:")
    for m in re.finditer(r'<w:pgNumType[^>]*>', document_xml):
        print(m.group(0))
    print("\nFound w:sectPr tags and their children:")
    for m in re.finditer(r'<w:sectPr>.*?</w:sectPr>', document_xml):
        sect_pr = m.group(0)
        pg_num = re.search(r'<w:pgNumType[^>]*>', sect_pr)
        if pg_num:
            print(f"sectPr contains: {pg_num.group(0)}")
        else:
            print("sectPr contains no pgNumType")