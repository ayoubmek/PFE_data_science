/**
 * merge_docs.js
 * Remplace la page de garde de rapport_pfe_v33.docx
 * par celle de r.docx, en préservant toutes les images et relations.
 */

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const RAPPORT_IN  = 'rapport_pfe_v76_raw.docx';
const GARDE_IN    = 'r.docx';
const OUTPUT      = 'rapport_pfe_final_nexora_v4.docx';

const R_TMP  = 'r_tmp';
const RP_TMP = 'rapport_tmp';

// ── 1. Extraire les deux docx (déjà fait manuellement, mais on repart propre) ──
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

// ── 2. Lire les XMLs ─────────────────────────────────────────────────────────
let gardeDocXml   = fs.readFileSync(`${R_TMP}/word/document.xml`,  'utf8');

// Replace Title, remove Arkan logo, and put [..........] placeholders
gardeDocXml = gardeDocXml.replace("Developpement d'une plateforme web logistique", "Conception et Développement d’une Plateforme de Suivi de Production et de Gestion des Stocks");
gardeDocXml = gardeDocXml.replace(/<w:drawing>[\s\S]*?rIdArkan[\s\S]*?<\/w:drawing>/g, "");
gardeDocXml = gardeDocXml.replace(/Arkan/g, "[..........]");
gardeDocXml = gardeDocXml.replace("M. Ayoub Hammami", "[..........]");
gardeDocXml = gardeDocXml.replace("Mme Rihab IDOUDI", "[..........]");
gardeDocXml = gardeDocXml.replace("Ayoub Mekni", "Imen");

let rapportDocXml = fs.readFileSync(`${RP_TMP}/word/document.xml`, 'utf8');
let rapportRels   = fs.readFileSync(`${RP_TMP}/word/_rels/document.xml.rels`, 'utf8');

// ── 3. Trouver le max rId dans le rapport ────────────────────────────────────
const rIdNums = [...rapportRels.matchAll(/Id="rId(\d+)"/g)].map(m => parseInt(m[1]));
const maxRId  = Math.max(...rIdNums);
const newId1  = maxRId + 1;   // pour image1.png de r.docx
const newId2  = maxRId + 2;   // pour image2.png de r.docx
const newId3  = maxRId + 3;   // pour arkan_logo.png
console.log(`Max rId existant : ${maxRId}  → nouveaux : rId${newId1}, rId${newId2}, rId${newId3}`);

// ── 4. Copier les images de r.docx dans rapport ──────────────────────────────
const imgDir = `${RP_TMP}/word/media`;
const img1   = `pg_image1.png`;
const img2   = `pg_image2.png`;
const img3   = `pg_image3.png`;
fs.copyFileSync(`${R_TMP}/word/media/image1.png`, `${imgDir}/${img1}`);
fs.copyFileSync(`${R_TMP}/word/media/image2.png`, `${imgDir}/${img2}`);
if (fs.existsSync(`${R_TMP}/word/media/arkan_logo.png`)) {
  fs.copyFileSync(`${R_TMP}/word/media/arkan_logo.png`, `${imgDir}/${img3}`);
  console.log(`Arkan logo copié.`);
}

// ── 5. Ajouter les relations dans rapport/_rels/document.xml.rels ────────────
let newRels = `<Relationship Id="rId${newId1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${img1}"/>` +
              `<Relationship Id="rId${newId2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${img2}"/>`;
if (fs.existsSync(`${R_TMP}/word/media/arkan_logo.png`)) {
  newRels += `<Relationship Id="rId${newId3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${img3}"/>`;
}
rapportRels = rapportRels.replace('</Relationships>', newRels + '</Relationships>');
fs.writeFileSync(`${RP_TMP}/word/_rels/document.xml.rels`, rapportRels, 'utf8');
console.log('Relations mises à jour.');

// ── 6. Extraire le body XML de la page de garde (r.docx) ─────────────────────
const gardeBodyMatch = gardeDocXml.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
if (!gardeBodyMatch) throw new Error('Impossible de trouver <w:body> dans r.docx');
let gardeBody = gardeBodyMatch[1];

// Remapper les rIds des images
gardeBody = gardeBody.replace(/r:id="rId6"/g, `r:id="rId${newId1}"`);
gardeBody = gardeBody.replace(/r:id="rId7"/g, `r:id="rId${newId2}"`);
gardeBody = gardeBody.replace(/r:id="rIdArkan"/g, `r:id="rId${newId3}"`);
// Variante avec r:embed
gardeBody = gardeBody.replace(/r:embed="rId6"/g, `r:embed="rId${newId1}"`);
gardeBody = gardeBody.replace(/r:embed="rId7"/g, `r:embed="rId${newId2}"`);
gardeBody = gardeBody.replace(/r:embed="rIdArkan"/g, `r:embed="rId${newId3}"`);
console.log('rIds remappés.');

// ── 7. Retirer l'ancienne page de garde du rapport ───────────────────────────
// La page de garde correspond à la première section. On cherche le premier <w:sectPr>
const rapportBodyMatch = rapportDocXml.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
if (!rapportBodyMatch) throw new Error('Impossible de trouver <w:body> dans rapport');
let rapportBody = rapportBodyMatch[1];

const sectPrIdx = rapportBody.indexOf('<w:sectPr');
if (sectPrIdx === -1) throw new Error('Aucun saut de section trouvé dans le rapport');

// Trouver la fin du paragraphe contenant ce premier saut de section
const afterSectPrPara = rapportBody.indexOf('</w:p>', sectPrIdx);
if (afterSectPrPara === -1) throw new Error('Impossible de trouver la fin du §saut de section');
const rapportBodyAfterGarde = rapportBody.substring(afterSectPrPara + 6); // +6 pour "</w:p>"
console.log(`Ancienne page de garde supprimée (saut de section trouvé à l'index ${sectPrIdx}).`);

// ── 8. Ajouter les styles de r.docx dans le rapport (fusion simple) ──────────
// On copie les styles si le rapport n'en a pas déjà
const rStyles   = fs.readFileSync(`${R_TMP}/word/styles.xml`, 'utf8');
const repStyles = fs.readFileSync(`${RP_TMP}/word/styles.xml`, 'utf8');
// Extraire les styles de r.docx et les fusionner si absents par ID et par NOM (sensible à la casse/insensible)
const rStyleDefs = [...rStyles.matchAll(/<w:style\b[^>]*w:styleId="([^"]+)"[^>]*>([\s\S]*?)<\/w:style>/g)];
const repStyleNames = [...repStyles.matchAll(/<w:name w:val="([^"]+)"\/>/g)].map(m => m[1].toLowerCase());

let repStylesUpdated = repStyles;
let addedStyles = 0;
for (const match of rStyleDefs) {
  const styleId = match[1];
  const styleContent = match[2];
  
  // Extraire le nom du style
  const nameMatch = styleContent.match(/<w:name w:val="([^"]+)"\/>/);
  const styleName = nameMatch ? nameMatch[1].toLowerCase() : '';
  
  // Ne copier que si l'ID ET le nom ne sont pas déjà présents dans le rapport
  if (!repStyles.includes(`w:styleId="${styleId}"`) && !repStyleNames.includes(styleName)) {
    repStylesUpdated = repStylesUpdated.replace('</w:styles>', match[0] + '</w:styles>');
    addedStyles++;
  }
}
fs.writeFileSync(`${RP_TMP}/word/styles.xml`, repStylesUpdated, 'utf8');
console.log(`${addedStyles} styles ajoutés depuis r.docx.`);

// ── 9. Construire le nouveau body ────────────────────────────────────────────
// Extraire le <w:sectPr> de gardeBody pour en faire un saut de section correct au niveau paragraphe
const sectPrMatch = gardeBody.match(/<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>/);
let cleanGardeBody = gardeBody;
let gardeSectPr = '';
if (sectPrMatch) {
  gardeSectPr = sectPrMatch[0];
  cleanGardeBody = gardeBody.replace(gardeSectPr, '');
}

// saut de section "page suivante" (next page section break)
const sectionBreakPara = `<w:p><w:pPr>${gardeSectPr}</w:pPr></w:p>`;
const newBody = cleanGardeBody + sectionBreakPara + '\n' + rapportBodyAfterGarde;

// Remplacer le body dans le XML du rapport
const newRapportDocXml = rapportDocXml.replace(
  /<w:body[^>]*>[\s\S]*?<\/w:body>/,
  `<w:body>${newBody}</w:body>`
);
fs.writeFileSync(`${RP_TMP}/word/document.xml`, newRapportDocXml, 'utf8');
console.log('document.xml fusionné.');

// ── 10. Repackager en rapport_pfe_v34.docx ───────────────────────────────────
if (fs.existsSync(OUTPUT)) fs.unlinkSync(OUTPUT);
const tmpZip = OUTPUT.replace('.docx', '_tmp.zip');
execSync(
  `powershell -Command "Compress-Archive -Path '${RP_TMP}\\*' -DestinationPath '${tmpZip}' -Force"`,
  { stdio: 'pipe' }
);
fs.renameSync(tmpZip, OUTPUT);
console.log(`\n✓ Rapport final généré : ${OUTPUT}`);

// ── 11. Nettoyage ────────────────────────────────────────────────────────────
execSync(`rmdir /s /q "${R_TMP}"`,  { shell: 'cmd' });
execSync(`rmdir /s /q "${RP_TMP}"`, { shell: 'cmd' });
console.log('Dossiers temporaires supprimés.');
