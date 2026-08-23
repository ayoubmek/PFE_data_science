

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const RAPPORT_IN  = 'rapport_pfe_v76_raw.docx';
const GARDE_IN    = 'r.docx';
const OUTPUT      = 'rapport_pfe_final_nexora_v4.docx';

const R_TMP  = 'r_tmp';
const RP_TMP = 'rapport_tmp';


function extractDocx(src, dest) {
  const zip = dest + '.zip';
  if (fs.existsSync(dest)) execSync(`rmdir /s /q "${dest}"`, { shell: 'cmd' });
  fs.copyFileSync(src, zip);
  execSync(`powershell -Command "Expand-Archive -Path '${zip}' -DestinationPath '${dest}' -Force"`, { stdio: 'pipe' });
  fs.unlinkSync(zip);
}

console.log('Extraction r.docx ...');
extractDocx(GARDE_IN, R_TMP);

console.log('Extraction rapport_pfe_v33.docx ...');
extractDocx(RAPPORT_IN, RP_TMP);


let gardeDocXml   = fs.readFileSync(`${R_TMP}/word/document.xml`,  'utf8');


gardeDocXml = gardeDocXml.replace("Developpement d'une plateforme web logistique", "Conception et Développement d’une Plateforme de Suivi de Production et de Gestion des Stocks");
gardeDocXml = gardeDocXml.replace(/<w:drawing>[\s\S]*?rIdArkan[\s\S]*?<\/w:drawing>/g, "");
gardeDocXml = gardeDocXml.replace(/Arkan/g, "[..........]");
gardeDocXml = gardeDocXml.replace("M. Ayoub Hammami", "[..........]");
gardeDocXml = gardeDocXml.replace("Mme Rihab IDOUDI", "[..........]");
gardeDocXml = gardeDocXml.replace("Ayoub Mekni", "Imen");

let rapportDocXml = fs.readFileSync(`${RP_TMP}/word/document.xml`, 'utf8');
let rapportRels   = fs.readFileSync(`${RP_TMP}/word/_rels/document.xml.rels`, 'utf8');


const rIdNums = [...rapportRels.matchAll(/Id="rId(\d+)"/g)].map(m => parseInt(m[1]));
const maxRId  = Math.max(...rIdNums);
const newId1  = maxRId + 1;   
const newId2  = maxRId + 2;   
console.log(`Max rId existant : ${maxRId}  → nouveaux : rId${newId1}, rId${newId2}`);


const imgDir = `${RP_TMP}/word/media`;
const img1   = `pg_image1.png`;
const img2   = `pg_image2.png`;
fs.copyFileSync(`${R_TMP}/word/media/image1.png`, `${imgDir}/${img1}`);
fs.copyFileSync(`${R_TMP}/word/media/image2.png`, `${imgDir}/${img2}`);


let newRels = `<Relationship Id="rId${newId1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${img1}"/>` +
              `<Relationship Id="rId${newId2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${img2}"/>`;
rapportRels = rapportRels.replace('</Relationships>', newRels + '</Relationships>');
fs.writeFileSync(`${RP_TMP}/word/_rels/document.xml.rels`, rapportRels, 'utf8');
console.log('Relations mises à jour.');


const gardeBodyMatch = gardeDocXml.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
if (!gardeBodyMatch) throw new Error('Impossible de trouver <w:body> dans r.docx');
let gardeBody = gardeBodyMatch[1];


gardeBody = gardeBody.replace(/r:id="rId6"/g, `r:id="rId${newId1}"`);
gardeBody = gardeBody.replace(/r:id="rId7"/g, `r:id="rId${newId2}"`);

gardeBody = gardeBody.replace(/r:embed="rId6"/g, `r:embed="rId${newId1}"`);
gardeBody = gardeBody.replace(/r:embed="rId7"/g, `r:embed="rId${newId2}"`);
console.log('rIds remappés.');



const rapportBodyMatch = rapportDocXml.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
if (!rapportBodyMatch) throw new Error('Impossible de trouver <w:body> dans rapport');
let rapportBody = rapportBodyMatch[1];

const sectPrIdx = rapportBody.indexOf('<w:sectPr');
if (sectPrIdx === -1) throw new Error('Aucun saut de section trouvé dans le rapport');


const afterSectPrPara = rapportBody.indexOf('</w:p>', sectPrIdx);
if (afterSectPrPara === -1) throw new Error('Impossible de trouver la fin du §saut de section');
const rapportBodyAfterGarde = rapportBody.substring(afterSectPrPara + 6); 
console.log(`Ancienne page de garde supprimée (saut de section trouvé à l'index ${sectPrIdx}).`);



const rStyles   = fs.readFileSync(`${R_TMP}/word/styles.xml`, 'utf8');
const repStyles = fs.readFileSync(`${RP_TMP}/word/styles.xml`, 'utf8');

const rStyleDefs = [...rStyles.matchAll(/<w:style\b[^>]*w:styleId="([^"]+)"[^>]*>([\s\S]*?)<\/w:style>/g)];
const repStyleNames = [...repStyles.matchAll(/<w:name w:val="([^"]+)"\/>/g)].map(m => m[1].toLowerCase());

let repStylesUpdated = repStyles;
let addedStyles = 0;
for (const match of rStyleDefs) {
  const styleId = match[1];
  const styleContent = match[2];
  const nameMatch = styleContent.match(/<w:name w:val="([^"]+)"\/>/);
  const styleName = nameMatch ? nameMatch[1].toLowerCase() : '';
  if (!repStyles.includes(`w:styleId="${styleId}"`) && !repStyleNames.includes(styleName)) {
    repStylesUpdated = repStylesUpdated.replace('</w:styles>', match[0] + '</w:styles>');
    addedStyles++;
  }
}
fs.writeFileSync(`${RP_TMP}/word/styles.xml`, repStylesUpdated, 'utf8');
console.log(`${addedStyles} styles ajoutés depuis r.docx.`);



const sectPrMatch = gardeBody.match(/<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>/);
let cleanGardeBody = gardeBody;
let gardeSectPr = '';
if (sectPrMatch) {
  gardeSectPr = sectPrMatch[0];
  cleanGardeBody = gardeBody.replace(gardeSectPr, '');
}


const sectionBreakPara = `<w:p><w:pPr>${gardeSectPr}</w:pPr></w:p>`;
const newBody = cleanGardeBody + sectionBreakPara + '\n' + rapportBodyAfterGarde;


const newRapportDocXml = rapportDocXml.replace(
  /<w:body[^>]*>[\s\S]*?<\/w:body>/,
  `<w:body>${newBody}</w:body>`
);
fs.writeFileSync(`${RP_TMP}/word/document.xml`, newRapportDocXml, 'utf8');
console.log('document.xml fusionné.');


if (fs.existsSync(OUTPUT)) fs.unlinkSync(OUTPUT);
const tmpZip = OUTPUT.replace('.docx', '_tmp.zip');
execSync(
  `powershell -Command "Compress-Archive -Path '${RP_TMP}\\*' -DestinationPath '${tmpZip}' -Force"`,
  { stdio: 'pipe' }
);
fs.renameSync(tmpZip, OUTPUT);
console.log(`\n✓ Rapport final généré : ${OUTPUT}`);


execSync(`rmdir /s /q "${R_TMP}"`,  { shell: 'cmd' });
execSync(`rmdir /s /q "${RP_TMP}"`, { shell: 'cmd' });
console.log('Dossiers temporaires supprimés.');