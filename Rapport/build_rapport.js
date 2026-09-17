const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, HeightRule, PageBreak, LevelFormat,
  Header, Footer, Tab, TabStopType, ImageRun, NumberFormat,
  ExternalHyperlink
} = require('docx');
const fs = require('fs');
const path = require('path');

// --- PALETTE & STYLES ---
const NAVY = "000000";
const BLUE = "000000";
const LIGHT = "F0F0F0";
const WHITE = "FFFFFF";
const BLACK = "000000";
const GRAY = "595959";
const DARK = "333333";
const FONT = "Times New Roman";
const FONT2 = "Arial";

// --- FORMATTING HELPERS ---
const pb = () => new Paragraph({ children: [new TextRun({ text: "" })], spacing: { before: 40, after: 40 } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } });

const frontTitle = (text) => new Paragraph({
  children: [new TextRun({ text: text.toUpperCase(), font: FONT, size: 36, bold: true, color: BLACK })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 400, after: 80 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DARK, space: 4 } },
});

const title1 = (text, pageBreakBefore = true) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: FONT, bold: true, color: NAVY, size: 34, allCaps: true })],
  spacing: { before: 260, after: 140 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
  outlineLevel: 0,
  pageBreakBefore,
});

const title2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: FONT, bold: true, color: BLUE, size: 28 })],
  spacing: { before: 200, after: 90 },
  outlineLevel: 1,
});

const title3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, font: FONT, bold: true, color: NAVY, size: 24 })],
  spacing: { before: 140, after: 70 },
  outlineLevel: 2,
});

const parseMarkdown = (text, opts = {}) => {
  const parts = text.split('*');
  return parts.map((part, index) => {
    const isItalic = opts.italics !== undefined ? opts.italics : (index % 2 === 1);
    return new TextRun({
      text: part,
      font: opts.font || FONT,
      size: opts.size || 24,
      color: opts.color || (opts.font === FONT2 ? undefined : "1A1A1A"),
      italics: isItalic,
      bold: opts.bold || false
    });
  });
};

const body = (text, opts = {}) => {
  if (typeof text === 'object' && text !== null && text.text) {
    opts = { ...opts, ...text.opts };
    text = text.text;
  }
  return new Paragraph({
    children: parseMarkdown(text, opts),
    spacing: { before: 60, after: 60, line: 360, lineRule: "auto" },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    indent: opts.indent ? { left: opts.indent } : undefined,
  });
};

const bold_body = (text) => new Paragraph({
  children: parseMarkdown(text, { bold: true }),
  spacing: { before: 60, after: 60, line: 360, lineRule: "auto" },
  alignment: AlignmentType.JUSTIFIED,
});

const bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  children: parseMarkdown(text),
  spacing: { before: 50, after: 50, line: 340, lineRule: "auto" },
});

const linkBullet = (textBefore, url, textAfter = "") => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  children: [
    new TextRun({ text: textBefore, font: FONT, size: 22 }),
    new ExternalHyperlink({
      children: [new TextRun({ text: url, font: FONT, size: 22, color: "0056B3", underline: true })],
      link: url,
    }),
    ...(textAfter ? [new TextRun({ text: textAfter, font: FONT, size: 22 })] : []),
  ],
  spacing: { before: 50, after: 50, line: 340, lineRule: "auto" },
});

const italic_note = (text) => new Paragraph({
  children: parseMarkdown(text, { size: 22, italics: true, color: GRAY }),
  spacing: { before: 80, after: 80 },
  alignment: AlignmentType.CENTER,
});

const sectionIntro = (text) => new Paragraph({
  children: parseMarkdown(text, { size: 23, italics: true, color: GRAY }),
  spacing: { before: 100, after: 100, line: 340, lineRule: "auto" },
  alignment: AlignmentType.JUSTIFIED,
  border: { left: { style: BorderStyle.SINGLE, size: 8, color: DARK, space: 8 } },
  indent: { left: 200 },
});

const conclusionBox = (text) => new Paragraph({
  children: parseMarkdown(text),
  spacing: { before: 160, after: 160, line: 360, lineRule: "auto" },
  alignment: AlignmentType.JUSTIFIED,
});

const fitImage = (filePath, maxW = 550, maxH = 500) => {
  if (!fs.existsSync(filePath)) return { width: 100, height: 100 };
  const buffer = fs.readFileSync(filePath);
  const w = buffer.readUInt32BE(16);
  const h = buffer.readUInt32BE(20);
  const ratio = w / h;
  let width = maxW;
  let height = maxW / ratio;
  if (height > maxH) {
    height = maxH;
    width = maxH * ratio;
  }
  return { width, height };
};

const border = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const borders = { top: border, bottom: border, left: border, right: border };

const makeTable = (headers, rows, colWidths) => {
  const targetTotalW = 8666;
  const originalTotalW = colWidths.reduce((a, b) => a + b, 0);
  const scaledColWidths = colWidths.map(w => Math.round((w / originalTotalW) * targetTotalW));

  return new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: scaledColWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          borders,
          width: { size: scaledColWidths[i], type: WidthType.DXA },
          shading: { fill: DARK, type: ShadingType.CLEAR },
          margins: { top: 50, bottom: 50, left: 80, right: 80 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            children: [new TextRun({ text: h, font: FONT2, size: 19, bold: true, color: WHITE })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 20 },
          })],
        }))
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => new TableCell({
          borders,
          width: { size: scaledColWidths[ci], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? "F2F2F2" : WHITE, type: ShadingType.CLEAR },
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
          children: [new Paragraph({
            children: parseMarkdown(String(cell), { font: FONT2, size: 18 }),
            alignment: AlignmentType.LEFT,
            spacing: { before: 20, after: 20, line: 240, lineRule: "auto" },
          })],
        }))
      }))
    ]
  });
};


const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };


const emptyFigurePlaceholder = (captionText, heightPt = 180) => [
  new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 90, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.DASHED, size: 2, color: "B0B0B0" },
      bottom: { style: BorderStyle.DASHED, size: 2, color: "B0B0B0" },
      left: { style: BorderStyle.DASHED, size: 2, color: "B0B0B0" },
      right: { style: BorderStyle.DASHED, size: 2, color: "B0B0B0" },
    },
    rows: [
      new TableRow({
        height: { value: heightPt * 20, rule: HeightRule.ATLEAST },
        children: [
          new TableCell({
            width: { size: 90, type: WidthType.PERCENTAGE },
            shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 120 },
                children: [
                  new TextRun({
                    text: "[ Emplacement réservé : insérer la figure ici ]",
                    font: FONT,
                    size: 20,
                    italics: true,
                    color: "888888"
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 180 },
    children: [
      new TextRun({ text: captionText, font: FONT, size: 20, italics: true, color: GRAY })
    ]
  }),
  pb()
];

const imageFigure = (imageRelPath, captionText, maxW = 540, maxH = 400) => {
  const fullPath = path.isAbsolute(imageRelPath) ? imageRelPath : path.join(__dirname, imageRelPath);
  if (fs.existsSync(fullPath)) {
    const dims = fitImage(fullPath, maxW, maxH);
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 140, after: 60 },
        children: [
          new ImageRun({
            data: fs.readFileSync(fullPath),
            transformation: { width: Math.round(dims.width), height: Math.round(dims.height) },
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 140 },
        children: [
          new TextRun({ text: captionText, font: FONT, size: 20, italics: true, color: GRAY })
        ]
      }),
      pb()
    ];
  } else {
    return emptyFigurePlaceholder(captionText);
  }
};

const formulaBlock = (formulaText, eqNum) => {
  return new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 7400, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 120 },
                children: [
                  new TextRun({ text: formulaText, font: "Cambria Math", size: 23, italics: true })
                ]
              })
            ]
          }),
          new TableCell({
            borders: noBorders,
            width: { size: 1266, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 120, after: 120 },
                children: [
                  new TextRun({ text: eqNum, font: FONT, size: 22 })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
};

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

const makeProsConsTable = (tableNum, modelName, pros, cons) => {
  const maxRows = Math.max(pros.length, cons.length);
  const rows = [];
  
  // Header row matching user's screenshot: Avantages (#D9EAD3), Limites (#FCE4D6)
  rows.push(new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        borders: cellBorders,
        width: { size: 4333, type: WidthType.DXA },
        shading: { fill: "D9EAD3", type: ShadingType.CLEAR },
        margins: { top: 70, bottom: 70, left: 100, right: 100 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Avantages", font: FONT, size: 21, bold: true, color: "1C3A13" })],
            alignment: AlignmentType.LEFT,
            spacing: { before: 20, after: 20 }
          })
        ]
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 4333, type: WidthType.DXA },
        shading: { fill: "FCE4D6", type: ShadingType.CLEAR },
        margins: { top: 70, bottom: 70, left: 100, right: 100 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Limites", font: FONT, size: 21, bold: true, color: "4A1C14" })],
            alignment: AlignmentType.LEFT,
            spacing: { before: 20, after: 20 }
          })
        ]
      })
    ]
  }));

  for (let i = 0; i < maxRows; i++) {
    const proText = pros[i] || "";
    const conText = cons[i] || "";
    rows.push(new TableRow({
      children: [
        new TableCell({
          borders: cellBorders,
          width: { size: 4333, type: WidthType.DXA },
          shading: { fill: WHITE, type: ShadingType.CLEAR },
          margins: { top: 50, bottom: 50, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: parseMarkdown(proText, { font: FONT, size: 20 }),
              alignment: AlignmentType.LEFT,
              spacing: { before: 30, after: 30, line: 260, lineRule: "auto" }
            })
          ]
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 4333, type: WidthType.DXA },
          shading: { fill: WHITE, type: ShadingType.CLEAR },
          margins: { top: 50, bottom: 50, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: parseMarkdown(conText, { font: FONT, size: 20 }),
              alignment: AlignmentType.LEFT,
              spacing: { before: 30, after: 30, line: 260, lineRule: "auto" }
            })
          ]
        })
      ]
    }));
  }

  const table = new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [4333, 4333],
    rows
  });

  const caption = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 90, after: 140 },
    children: [
      new TextRun({ text: "TABLEAU " + tableNum + " : ", font: FONT, size: 20, bold: true, color: "333333" }),
      new TextRun({ text: "Avantages et limites : " + modelName, font: FONT, size: 20, color: "333333" })
    ]
  });

  return [table, caption];
};

const tocLine = (text, level, page) => {
  const sz = level === 0 ? 24 : level === 1 ? 23 : 22;
  const bold = level === 0;
  const left = [0, 360, 720, 1080][Math.min(level, 3)];
  return new Paragraph({
    children: [
      new TextRun({ text, font: FONT, size: sz, bold }),
      new TextRun({ children: [new Tab()], font: FONT, size: sz }),
      new TextRun({ text: String(page), font: FONT, size: 22, bold }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: 8666, leader: "dot" }],
    indent: { left },
    spacing: {
      before: level === 0 ? 140 : level === 1 ? 70 : 35,
      after: level === 0 ? 50 : 25,
    },
  });
};

const techCard = (num, name, logoPath, desc, adv) => [
  title3(`2.6.2.${num} ${name}`),
  new Paragraph({
    children: fs.existsSync(logoPath)
      ? [new ImageRun({ data: fs.readFileSync(logoPath), transformation: { width: 90, height: 90 } })]
      : [new TextRun({ text: `[${name}]`, font: FONT2, size: 20, color: GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 100 },
  }),
  new Paragraph({
    children: parseMarkdown(`${desc} ${adv}`, { font: FONT, size: 24 }),
    spacing: { before: 60, after: 100, line: 340, lineRule: "auto" },
    alignment: AlignmentType.JUSTIFIED,
  }),
  pb(),
];

const ucBorder = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const ucBorders = { top: ucBorder, bottom: ucBorder, left: ucBorder, right: ucBorder };

const ucDesc = (uc) => {
  const targetTotalW = 8666;
  const col1W = Math.round((2200 / 9360) * targetTotalW);
  const col2W = targetTotalW - col1W;

  const labelCell = (text) => new TableCell({
    borders: ucBorders,
    shading: { fill: "EEEEEE", type: ShadingType.CLEAR },
    width: { size: col1W, type: WidthType.DXA },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 20, bold: true, color: BLACK })], spacing: { before: 20, after: 20 } })],
  });
  const valueCell = (text) => new TableCell({
    borders: ucBorders,
    width: { size: col2W, type: WidthType.DXA },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 20 })], spacing: { before: 20, after: 20, line: 240, lineRule: "auto" } })],
  });
  const scenarioCell = (items) => new TableCell({
    borders: ucBorders,
    width: { size: col2W, type: WidthType.DXA },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: items.map((item, i) => new Paragraph({
      children: [new TextRun({ text: `${i + 1}. ${item}`, font: FONT, size: 20 })],
      spacing: { before: 20, after: 20, line: 240, lineRule: "auto" },
    })),
  });
  return new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [col1W, col2W],
    rows: [
      new TableRow({
        children: [new TableCell({
          columnSpan: 2, borders: ucBorders,
          shading: { fill: DARK, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: `Cas d'utilisation : ${uc.name}`, font: FONT, size: 22, bold: true, color: WHITE })], spacing: { before: 30, after: 30 } })],
        })]
      }),
      new TableRow({ children: [labelCell("Acteurs"), valueCell(uc.actors)] }),
      new TableRow({ children: [labelCell("Préconditions"), valueCell(uc.precond)] }),
      new TableRow({ children: [labelCell("Scénario nominal"), scenarioCell(uc.scenario)] }),
      new TableRow({ children: [labelCell("Postconditions"), valueCell(uc.postcond)] }),
      new TableRow({ children: [labelCell("Exceptions"), valueCell(uc.exceptions)] }),
    ],
  });
};

// ==========================================
// DOCUMENT DEFINITION
// ==========================================
const doc = new Document({
  features: { updateFields: true },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }]
  },
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 34, bold: true, font: FONT, color: NAVY, allCaps: true },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: BLUE },
        paragraph: { spacing: { before: 260, after: 110 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: FONT, color: NAVY },
        paragraph: { spacing: { before: 180, after: 90 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [
    // -------------------------------------------------------------
    // SECTION 1 : PAGE DE GARDE VIDE (POUR INSERTION LIBRE)
    // -------------------------------------------------------------
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 }
        }
      },
      footers: { default: new Footer({ children: [] }) },
      headers: { default: new Header({ children: [] }) },
      children: [
        new Paragraph({
          children: [new TextRun({ text: "" })],
          spacing: { before: 0, after: 0 }
        })
      ]
    },

    // SECTION 2 : PAGES PRÉLIMINAIRES (NUMÉROTATION ROMAINE)
    // -------------------------------------------------------------
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
          pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN }
        }
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Nexora — Rapport de Projet de Fin d'Études", font: FONT, size: 18, color: GRAY }),
                new TextRun({ children: [new Tab()], font: FONT, size: 18 }),
                new TextRun({ text: "Page ", font: FONT, size: 18, color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: GRAY }),
              ],
              alignment: AlignmentType.LEFT,
              tabStops: [{ type: TabStopType.RIGHT, position: 8666 }],
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
            })
          ]
        })
      },
      children: [
        // DÉDICACE
        frontTitle("Dédicace"),
        body("Je dédie ce modeste travail de fin d'études :", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("À mes très chers parents, pour leurs sacrifices constants, leur amour inépuisable et leurs prières bienveillantes qui m'ont guidée tout au long de mon cursus académique.", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("À toute ma famille, mes proches et mes ami(e)s, dont les encouragements sincères et la présence indéfectible ont constitué une source inestimable de motivation.", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("À l'ensemble du corps professoral de la Faculté des Sciences de Monastir, qui a forgé mes compétences et nourri ma passion pour les sciences des données et le génie logiciel.", { align: AlignmentType.CENTER, italics: true }),
        pageBreak(),

        // REMERCIEMENTS
        frontTitle("Remerciements"),
        body("Je tiens à exprimer ma profonde gratitude à mon encadrant(e) universitaire de la Faculté des Sciences de Monastir pour ses conseils avisés, sa rigueur scientifique et sa disponibilité tout au long de ce travail de recherche appliquée."),
        pb(),
        body("J'adresse mes vifs remerciements à mon encadrant professionnel au sein du groupe industriel d'accueil, pour sa confiance, son encadrement technique rigoureux et son accompagnement précieux lors de l'intégration des flux d'atelier et du Data Warehouse."),
        pb(),
        body("Je remercie également la direction industrielle et les équipes opérationnelles des sites de Kondar, Sousse et Brno pour leur accueil chaleureux, leur coopération active lors du recueil des besoins et la pertinence de leurs retours terrain."),
        pb(),
        body("Mes remerciements s'étendent aux membres du jury qui ont accepté d'examiner et d'évaluer ce travail de fin d'études."),
        pageBreak(),

        // RÉSUMÉ FR
        frontTitle("Résumé"),
        body("Dans le cadre de l'industrie 4.0 et de l'optimisation des procédés de plasturgie automobile (équipementier Tier-1), ce projet de fin d'études présente la conception et le déploiement de **Nexora**, une plateforme intelligente de pilotage de production et de gestion des stocks multi-sites (usines de Kondar/Sousse en Tunisie et Brno en République Tchèque). Face à l'hétérogénéité des outils d'atelier et à la dispersion des données issues de 319 machines réelles, Nexora unifie le suivi temps réel de la fabrication et la gestion d'un historique de 1,5 million de mouvements de stock."),
        pb(),
        body("Le système intègre une architecture modulaire à 4 niveaux s'appuyant sur Spring Boot 3 (Java 17), Microsoft SQL Server (Entrepôt de Données), un frontend réactif React.js doté du design system Metronic 8, et un microservice de Machine Learning sous FastAPI (Python 3.10). L'application assure le calcul instantané du Taux de Rendement Global (TRG/OEE), la classification ABC d'inventaire selon Pareto, ainsi que la modélisation prédictive des cadences de fabrication et des niveaux de stock via l'algorithme Prophet de Meta (MAPE de 4,8 % et MAE de 7,4 pièces), surpassant les modèles traditionnels ARIMA et régression linéaire."),
        pb(),
        body("La plateforme intègre en outre des tableaux de bord décisionnels interactifs sous Microsoft Power BI et un **Agent IA Décisionnel Industriel** capable de diagnostiquer les arrêts machines et de formuler des recommandations proactives d'ordonnancement d'équipes (régime 3x8) et de réapprovisionnement."),
        pb(),
        bold_body("Mots-clés :"),
        body("Industrie 4.0, Plasturgie Automobile, Data Warehouse, Machine Learning, Séries Temporelles, Prophet (Meta), Agent IA Décisionnel, TRG/OEE, Spring Boot, React Metronic, Power BI."),
        pageBreak(),

        // ABSTRACT EN
        frontTitle("Abstract"),
        body("In the context of Industry 4.0 and automotive plastics manufacturing optimization (Tier-1 supplier), this Master's graduation project introduces the design and implementation of **Nexora**, an intelligent production monitoring and multi-site inventory management platform (Tunisia plants in Kondar/Sousse and Czech Republic plant in Brno). Addressing operational fragmentation across 319 shop-floor machines, Nexora centralizes real-time shop-floor tracking and manages over 1.5 million inventory ledger transactions."),
        pb(),
        body("The software architecture features a decoupled four-tier stack comprising Spring Boot 3 (Java 17), Microsoft SQL Server (Data Warehouse), a reactive React.js frontend powered by Metronic 8 design system, and a Python 3.10 Machine Learning microservice built with FastAPI. The solution automates real-time Overall Equipment Effectiveness (OEE) calculation, Pareto ABC stock segmentation, and time series forecasting using Meta's Prophet algorithm (achieving 4.8% MAPE and 7.4 pcs MAE), significantly outperforming baseline ARIMA and linear regression models."),
        pb(),
        body("Furthermore, the platform integrates interactive Microsoft Power BI executive dashboards and an **Industrial Decision AI Agent** designed to diagnose machine downtime, generate proactive reorder alerts, and prescribe optimal 3x8 workforce shift schedules."),
        pb(),
        bold_body("Keywords :"),
        body("Industry 4.0, Automotive Plastics, Data Warehouse, Machine Learning, Time Series, Prophet (Meta), Decision AI Agent, OEE, Spring Boot, React Metronic, Power BI."),
        pageBreak(),

        // SOMMAIRE / TOC
        frontTitle("Sommaire"),
        tocLine("Dédicace", 0, "i"),
        tocLine("Remerciements", 0, "ii"),
        tocLine("Résumé", 0, "iii"),
        tocLine("Abstract", 0, "iv"),
        tocLine("Sommaire", 0, "v"),
        tocLine("Liste des Figures", 0, "vi"),
        tocLine("Liste des Tableaux", 0, "vii"),
        tocLine("Liste des Abréviations", 0, "viii"),
        pb(),
        tocLine("Introduction Générale", 0, "1"),
        pb(),
        tocLine("Chapitre 1 : Contexte et Cadre Général du Projet", 0, "4"),
        tocLine("1.1 Introduction", 1, "4"),
        tocLine("1.2 Cadre du Projet", 1, "4"),
        tocLine("1.2.1 Cadre Académique", 2, "4"),
        tocLine("1.2.2 Présentation de l'Organisme d'Accueil", 2, "4"),
        tocLine("1.2.3 Fiche d'Identité de l'Entreprise", 2, "5"),
        tocLine("1.2.4 Organisation Industrielle et Parcs Machines", 2, "5"),
        tocLine("1.3 Étude et Critique de l'Existant", 1, "6"),
        tocLine("1.3.1 Diagnostic de l'Existant d'Atelier", 2, "6"),
        tocLine("1.3.2 Étude Comparative des Solutions du Marché", 2, "7"),
        tocLine("1.3.3 Problématique Spécifique : Silos de données et manque de réactivité", 2, "8"),
        tocLine("1.4 Solution Proposée et Workflow Global", 1, "8"),
        tocLine("1.4.1 Objectifs de la Plateforme Nexora", 2, "8"),
        tocLine("1.4.2 Workflow Fonctionnel Global de Bout en Bout", 2, "9"),
        tocLine("1.5 Méthodologie de Développement Adoptée", 1, "10"),
        tocLine("1.5.1 Étude Comparative des Méthodologies", 2, "10"),
        tocLine("1.5.2 Principes de la Méthodologie Scrum", 2, "11"),
        tocLine("1.5.3 Planification Globale du Projet", 2, "12"),
        tocLine("1.5.4 Product Backlog Global", 2, "13"),
        tocLine("1.6 Langage de Modélisation UML 2.5", 1, "15"),
        tocLine("1.7 Conclusion", 1, "15"),
        pb(),
        tocLine("Chapitre 2 : Sprint 0 – Analyse des Besoins et Conception du Système", 0, "16"),
        tocLine("2.1 Introduction", 1, "16"),
        tocLine("2.2 Sprint Backlog du Sprint 0", 1, "16"),
        tocLine("2.3 Analyse des Besoins", 1, "17"),
        tocLine("2.3.1 Identification des Acteurs du Système", 2, "17"),
        tocLine("2.3.2 Besoins Fonctionnels", 2, "18"),
        tocLine("2.3.3 Besoins Non Fonctionnels", 2, "19"),
        tocLine("2.4 Conception du Système & Cas d'Utilisation Global", 1, "20"),
        tocLine("2.4.1 Diagramme de Cas d'Utilisation Global", 2, "20"),
        tocLine("2.4.2 Descriptions Textuelles des Cas d'Utilisation Majeurs", 2, "21"),
        tocLine("2.5 Architecture Proposée", 1, "23"),
        tocLine("2.5.1 Architecture Logique à 4 Niveaux", 2, "23"),
        tocLine("2.5.2 Architecture Physique et Déploiement", 2, "24"),
        tocLine("2.5.3 Diagramme de Classes Global", 2, "25"),
        tocLine("2.6 Environnement Matériel et Logiciel", 1, "26"),
        tocLine("2.6.3 Cartographie des 17 Modèles IA & Data Science", 2, "27"),
        tocLine("2.6.1 Environnement Matériel", 2, "26"),
        tocLine("2.6.2 Stack Technologique et Outils", 2, "26"),
        tocLine("2.7 Bilan des Livrables du Sprint 0", 1, "28"),
        tocLine("2.8 Conclusion", 1, "28"),
        pb(),
        tocLine("Chapitre 3 : Sprint 1 – Audit du Data Warehouse, Assainissement & Pipeline ETL", 0, "29"),
        tocLine("3.1 Introduction", 1, "29"),
        tocLine("3.2 Sprint Backlog du Sprint 1", 1, "29"),
        tocLine("3.3 Présentation des Données du Data Warehouse", 1, "30"),
        tocLine("3.3.1 Structure et Sources du Data Warehouse d'Entreprise", 2, "30"),
        tocLine("3.3.2 Tables Clés du Projet", 2, "31"),
        tocLine("3.3.3 Modèle Relationnel Entités-Associations", 2, "32"),
        tocLine("3.4 Analyse Exploratoire des Données (EDA) & Diagnostic Qualité", 1, "33"),
        tocLine("3.4.1 Distributions Statistiques et Volumétries", 2, "33"),
        tocLine("3.4.2 Corrélations et Saisonnalités d'Atelier", 2, "34"),
        tocLine("3.4.3 Identification des Anomalies", 2, "35"),
        tocLine("3.5 Pipeline de Nettoyage et d'Intégration ETL", 1, "36"),
        tocLine("3.5.1 Architecture et Déroulement du Pipeline ETL", 2, "36"),
        tocLine("3.5.2 Optimisation SQL Server et Stratégie d'Indexation Clusterisée", 2, "37"),
        tocLine("3.5.3 Bilan Qualité des Données", 2, "38"),
        tocLine("3.6 Sécurité d'Accès et Modèle de Données Nettoyé", 1, "39"),
        tocLine("3.6.1 Diagramme de Cas d'Utilisation du Sprint 1", 2, "39"),
        tocLine("3.6.2 Diagramme de Classes du Module de Sécurité", 2, "40"),
        tocLine("3.6.3 Diagramme de Séquence : Authentification JWT et RBAC", 2, "40"),
        tocLine("3.6.4 Réalisation : Interface d'Administration des Utilisateurs", 2, "41"),
        tocLine("3.7 Bilan des Tests et Livrables du Sprint 1", 1, "41"),
        tocLine("3.8 Conclusion", 1, "42"),
        pb(),
        tocLine("Chapitre 4 : Sprint 2 – Modélisation Prédictive de Production et Détection d'Anomalies par Intelligence Artificielle", 0, "43"),
        tocLine("4.1 Introduction", 1, "43"),
        tocLine("4.2 Sprint Backlog du Sprint 2", 1, "43"),
        tocLine("4.3 Architecture du Module Prédictif & Flux de Traitement", 1, "44"),
        tocLine("4.3.1 Architecture du Microservice d'IA FastAPI", 2, "44"),
        tocLine("4.3.2 Flux de Traitement et Communication Inter-Services", 2, "45"),
        tocLine("4.4 Préparation des Données et Séries Temporelles", 1, "46"),
        tocLine("4.4.1 Extraction et Agrégation Temporelle", 2, "46"),
        tocLine("4.4.2 Structuration Standard Prophet (ds, y)", 2, "47"),
        tocLine("4.4.3 Découpage Chronologique Train/Test", 2, "47"),
        tocLine("4.5 Métriques d'Évaluation de Performance Prédictive", 1, "48"),
        tocLine("4.6 Développement et Formulation des Modèles de l'Application", 1, "49"),
        tocLine("4.6.1 Régression Linéaire (MCO)", 2, "49"),
        tocLine("4.6.2 Modèle Autorégressif ARIMA", 2, "50"),
        tocLine("4.6.3 Modèle Additif Prophet de Meta (Champion)", 2, "51"),
        tocLine("4.6.4 Détection d'Anomalies : Isolation Forest", 2, "52"),
        tocLine("4.6.5 Optimisation des Hyperparamètres et Validation Croisée", 2, "52"),
        tocLine("4.7 Benchmark Comparatif des Modèles de l'Application", 1, "53"),
        tocLine("4.8 Sélection et Justification Multicritère de Prophet", 1, "54"),
        tocLine("4.9 Projections à 30 jours, Analyse des Incertitudes (95%) et Fallback", 1, "55"),
        tocLine("4.10 Bilan des Tests et Livrables du Sprint 2", 1, "56"),
        tocLine("4.11 Conclusion", 1, "57"),
        pb(),
        tocLine("Chapitre 5 : Sprint 3 – Développement du Module de Gestion Intelligente des Stocks d'Atelier", 0, "59"),
        tocLine("5.1 Introduction", 1, "59"),
        tocLine("5.2 Backlog du Sprint 3", 1, "59"),
        tocLine("5.3 Architecture du Module en Quatre Étapes", 1, "60"),
        tocLine("5.4 Intégration des Prévisions dans la Gestion des Stocks", 1, "61"),
        tocLine("5.5 Classification des Articles de Production par Niveau de Stock", 1, "62"),
        tocLine("5.6 Génération des Recommandations Prescriptives d'Atelier", 1, "63"),
        tocLine("5.6.1 Calcul des Quantités à Produire et Commander (45 jours)", 2, "63"),
        tocLine("5.6.2 Estimation du Budget d'Approvisionnement", 2, "64"),
        tocLine("5.6.3 Alertes Intelligentes et Priorisation par Coût d'Arrêt Évité", 2, "64"),
        tocLine("5.6.4 Moteur Prescriptif du Point de Commande (ROP)", 2, "65"),
        tocLine("5.7 Analyse Approfondie et Résultats de Gestion des Stocks", 1, "66"),
        tocLine("5.7.1 Segmentation ABC et Analyse de Pareto", 2, "66"),
        tocLine("5.7.2 Clustering Non Supervisé K-Means des Articles", 2, "67"),
        tocLine("5.7.3 Moteur de Simulation Scénaristique What-If", 2, "68"),
        tocLine("5.7.4 Analyse Multi-Sites et Transferts Inter-Usines (Kondar-Brno)", 2, "69"),
        tocLine("5.8 Bilan des Tests et Livrables du Sprint 3", 1, "70"),
        tocLine("5.9 Conclusion", 1, "71"),
        pb(),
        tocLine("Chapitre 6 : Sprint 4 – Tableaux de Bord Décisionnels, Agent IA et Validation Système", 0, "73"),
        tocLine("6.1 Introduction", 1, "73"),
        tocLine("6.2 Sprint Backlog du Sprint 4", 1, "73"),
        tocLine("6.3 Architecture Globale et Diagramme de Séquence du Système Décisionnel", 1, "74"),
        tocLine("6.4 Conception et Réalisation des Interfaces Utilisateur (Metronic 8)", 1, "75"),
        tocLine("6.4.1 Console de Suivi de Production et TRG Temps Réel", 2, "75"),
        tocLine("6.4.2 Console d'Inventaire, Mouvements DWH et Export XLSX", 2, "77"),
        tocLine("6.4.3 Module de Visualisation Prédictive Prophet", 2, "78"),
        tocLine("6.4.4 Agent IA Décisionnel Industriel — Architecture RAG et LLaMA 3.3 70B", 2, "80"),
        tocLine("6.4.5 Tableaux de Bord et Reporting Décisionnel Microsoft Power BI", 2, "82"),
        tocLine("6.5 Tests Fonctionnels, Validation Système et Recette Globale", 1, "84"),
        tocLine("6.6 Bilan des Livrables du Sprint 4", 1, "87"),
        tocLine("6.7 Conclusion", 1, "88"),
        pb(),
        tocLine("Conclusion Générale et Perspectives", 0, "89"),
        tocLine("Bilan des Objectifs Atteints", 1, "89"),
        tocLine("Bilan Opérationnel et Chiffré pour l'Atelier", 1, "90"),
        tocLine("Difficultés Rencontrées et Solutions Apportées", 1, "90"),
        tocLine("Perspectives d'Évolution Technologique", 1, "91"),
        pb(),
        tocLine("Bibliographie et Webographie", 0, "92"),
        pageBreak(),

        // LISTE DES FIGURES
        frontTitle("Liste des Figures"),
        tocLine("Figure 1.1 : Vue d'ensemble du framework Scrum", 1, "12"),
        tocLine("Figure 2.1 : Diagramme de cas d'utilisation global de la plateforme Nexora", 1, "20"),
        tocLine("Figure 2.2 : Architecture logique à 4 niveaux du système Nexora", 1, "23"),
        tocLine("Figure 2.3 : Architecture physique et infrastructure de déploiement", 1, "24"),
        tocLine("Figure 2.4 : Diagramme de classes global du modèle conceptuel", 1, "25"),
        tocLine("Figure 3.1 : Schéma relationnel Entités-Associations du Data Warehouse", 1, "32"),
        tocLine("Figure 3.2 : Diagramme d'activité du pipeline de nettoyage et d'intégration ETL", 1, "37"),
        tocLine("Figure 3.3 : Capture d'écran : Console d'administration des utilisateurs et contrôle RBAC", 1, "41"),
        tocLine("Figure 4.1 : Capture d'écran : Interface de prévision Prophet avec bandes de confiance à 95%", 1, "56"),
        tocLine("Figure 4.2 : Comparaison visuelle des modèles de prévision de production (R² et MAE)", 1, "57"),
        tocLine("Figure 4.3 : Comparaison visuelle des métriques d'erreur (MAPE et RMSE)", 1, "58"),
        tocLine("Figure 5.1 : Segmentation ABC de Pareto et Partitionnement K-Means des articles", 1, "68"),
        tocLine("Figure 6.1 : Diagramme de séquence global du système décisionnel Nexora", 1, "74"),
        tocLine("Figure 6.2 : Capture d'écran : Console de suivi des machines et calcul du TRG en direct", 1, "76"),
        tocLine("Figure 6.3 : Capture d'écran : Console de gestion des stocks, mouvements DWH et filtres", 1, "78"),
        tocLine("Figure 6.4 : Capture d'écran : Visualisation interactive des prévisions Prophet sous ApexCharts", 1, "79"),
        tocLine("Figure 6.5 : Capture d'écran : Agent IA Décisionnel Industriel (Tiroir interactif Metronic)", 1, "81"),
        tocLine("Figure 6.6 : Tableau de bord Power BI : Supervision exécutive globale de production", 1, "83"),
        tocLine("Figure 6.7 : Tableau de bord Power BI : Analyse approfondie des mouvements et valorisation stock", 1, "84"),
        pageBreak(),

        // LISTE DES TABLEAUX
        
        tocLine("Tableau 1.1 : Fiche d'identité de l'organisme d'accueil", 1, "5"),
        tocLine("Tableau 1.2 : Étude comparative des solutions du marché (ERP vs Tableurs vs Nexora)", 1, "7"),
        tocLine("Tableau 1.3 : Comparaison des méthodologies de gestion de projet (Cascade vs UP vs Scrum)", 1, "10"),
        tocLine("Tableau 1.4 : Planification des Sprints Scrum sur les 6 mois de stage PFE", 1, "12"),
        tocLine("Tableau 1.5 : Product Backlog complet et priorisé du projet Nexora", 1, "13"),
        tocLine("Tableau 2.1 : Sprint Backlog du Sprint 0 – Analyse des besoins et conception du système", 1, "16"),
        tocLine("Tableau 2.2 : Matrice des acteurs et profils d'accès RBAC", 1, "17"),
        tocLine("Tableau 2.3 : Matrice des exigences fonctionnelles majeures", 1, "18"),
        tocLine("Tableau 2.5 : Bilan des livrables du Sprint 0", 1, "28"),
        tocLine("Tableau 3.1 : Sprint Backlog du Sprint 1 – Audit du Data Warehouse, Assainissement & Pipeline ETL", 1, "29"),
        tocLine("Tableau 3.2 : Principales tables de faits et volumétries du Data Warehouse", 1, "31"),
        tocLine("Tableau 3.3 : Bilan qualité des données avant et après exécution du pipeline ETL", 1, "38"),
        tocLine("Tableau 3.4 : Tests de validation du Sprint 1", 1, "41"),
        tocLine("Tableau 3.5 : Bilan des livrables du Sprint 1", 1, "42"),
        tocLine("Tableau 4.1 : Sprint Backlog du Sprint 2 – Intelligence Artificielle", 1, "43"),
        tocLine("Tableau 4.2 : Les 16 variables explicatives industrielles communes aux modèles", 1, "45"),
        tocLine("Tableau 4.3 : Découpage chronologique Train / Test", 1, "47"),
        tocLine("Tableau 4.4 : Métriques d'évaluation des modèles de prévision", 1, "48"),
        tocLine("Tableau 4.5 : Avantages et limites : Régression Linéaire", 1, "49"),
        tocLine("Tableau 4.6 : Avantages et limites : Modèle Autorégressif ARIMA", 1, "50"),
        tocLine("Tableau 4.7 : Avantages et limites : Prophet (Modèle Additif Meta)", 1, "51"),
        tocLine("Tableau 4.8 : Avantages et limites : Isolation Forest (Détection d'Anomalies)", 1, "52"),
        tocLine("Tableau 4.9 : Hyperparamètres optimaux et calibration des modèles de l'application", 1, "52"),
        tocLine("Tableau 4.10 : Benchmark comparatif des algorithmes de séries temporelles de l'application", 1, "53"),
        tocLine("Tableau 4.11 : Justification multicritère du choix de Prophet (Meta)", 1, "54"),
        tocLine("Tableau 4.12 : Tests de validation du Sprint 2", 1, "56"),
        tocLine("Tableau 4.13 : Bilan des livrables du Sprint 2", 1, "56"),
        tocLine("Tableau 5.1 : Priorisation des tâches du Sprint 3 – Gestion Intelligente des Stocks", 1, "59"),
        tocLine("Tableau 5.2 : Classification des articles par niveau de stock (Rupture, Critique, Normal, Surstock)", 1, "62"),
        tocLine("Tableau 5.3 : Analyse de la répartition ABC et règles de gestion des stocks associées", 1, "66"),
        tocLine("Tableau 5.4 : Avantages et limites : K-Means Clustering (Segmentation des Stocks)", 1, "67"),
        tocLine("Tableau 5.5 : Caractérisation des clusters d'articles générés par K-Means sur l'inventaire", 1, "68"),
        tocLine("Tableau 5.6 : Tests de validation du Sprint 3", 1, "70"),
        tocLine("Tableau 5.7 : Bilan des livrables du Sprint 3", 1, "71"),
        tocLine("Tableau 6.1 : Sprint Backlog du Sprint 4 – Tableaux de Bord, Agent IA et Validation Système", 1, "73"),
        tocLine("Tableau 6.3 : Matrice de recette et conformité des User Stories", 1, "85"),
        tocLine("Tableau 6.4 : Métriques consolidées des exécutions de tests par phase", 1, "86"),
        tocLine("Tableau 6.5 : Bilan des livrables du Sprint 4", 1, "87"),
        tocLine("Tableau 7.1 : Synthèse des difficultés rencontrées et solutions apportées", 1, "90"),
        pageBreak(),

        // LISTE DES ABRÉVIATIONS
        frontTitle("Liste des Abréviations"),
        makeTable(
          ["Abréviation", "Signification en Français", "Définition / Contexte Industriel"],
          [
            ["API", "Application Programming Interface", "Interface de programmation applicative pour l'échange de flux"],
            ["BI", "Business Intelligence", "Informatique décisionnelle pour l'aide à la décision stratégique"],
            ["CLE", "Capacity Ledger Entry", "Table DWH enregistrant les capacités et temps d'usinage machine"],
            ["CRUD", "Create, Read, Update, Delete", "Ensemble des quatre opérations fondamentales de gestion des données"],
            ["DWH", "Data Warehouse", "Entrepôt de données d'entreprise consolidé multi-sources"],
            ["EDA", "Exploratory Data Analysis", "Analyse exploratoire et statistique des données d'atelier"],
            ["ERP", "Enterprise Resource Planning", "Progiciel de gestion intégré d'entreprise (Microsoft Dynamics NAV)"],
            ["ETL", "Extract, Transform, Load", "Pipeline d'extraction, transformation et chargement des données"],
            ["FSM", "Faculté des Sciences de Monastir", "Établissement académique universitaire de rattachement"],
            ["ILE", "Item Ledger Entry", "Table DWH comptabilisant les écritures réelles des mouvements de stock"],
            ["IoT", "Internet of Things", "Internet des Objets industriels et capteurs connectés"],
            ["JWT", "JSON Web Token", "Jeton cryptographique standard pour l'authentification sans état"],
            ["KPI", "Key Performance Indicator", "Indicateur clé de performance opérationnelle d'atelier"],
            ["MAE", "Mean Absolute Error", "Erreur absolue moyenne mesurée sur les prévisions"],
            ["MAPE", "Mean Absolute Percentage Error", "Pourcentage d'erreur absolue moyen évaluant l'exactitude"],
            ["MES", "Manufacturing Execution System", "Système de pilotage et d'exécution de la fabrication"],
            ["OEE", "Overall Equipment Effectiveness", "Taux de Rendement Synthétique / Taux de Rendement Global (TRG)"],
            ["OF", "Ordre de Fabrication", "Ordre de production planifié pour l'usinage d'une pièce"],
            ["PO", "Product Owner", "Responsable du produit et de la valeur métier en méthodologie Scrum"],
            ["RBAC", "Role-Based Access Control", "Contrôle d'accès basé sur les rôles (ADMIN, MANAGER, OPERATEUR)"],
            ["REST", "Representational State Transfer", "Style d'architecture logicielle pour les services web distribués"],
            ["RMSE", "Root Mean Squared Error", "Racine carrée de l'erreur quadratique moyenne"],
            ["SM", "Scrum Master", "Facilitateur et garant du cadre méthodologique agile Scrum"],
            ["SPA", "Single-Page Application", "Application web monopage réactive sans rechargement de page"],
            ["SQL", "Structured Query Language", "Langage standard de requêtage pour bases de données relationnelles"],
            ["TRG", "Taux de Rendement Global", "Métrique industrielle agrégeant Disponibilité × Efficacité × Qualité"],
            ["UML", "Unified Modeling Language", "Langage standard de modélisation unifié"],
            ["US", "User Story", "Récit utilisateur décrivant un besoin fonctionnel standardisé"],
          ],
          [1600, 3200, 4566]
        ),
      ]
    },

    // -------------------------------------------------------------
    // SECTION 3 : CORPS DU MÉMOIRE (NUMÉROTATION DÉCIMALE 1, 2, 3...)
    // -------------------------------------------------------------
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL }
        }
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Nexora — Rapport de Projet de Fin d'Études", font: FONT, size: 18, color: GRAY }),
                new TextRun({ children: [new Tab()], font: FONT, size: 18 }),
                new TextRun({ text: "Page ", font: FONT, size: 18, color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: GRAY }),
              ],
              alignment: AlignmentType.LEFT,
              tabStops: [{ type: TabStopType.RIGHT, position: 8666 }],
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
            })
          ]
        })
      },
      children: [
        // =========================================================
        // INTRODUCTION GÉNÉRALE
        // =========================================================
        title1("Introduction Générale", false),
        body("L'avènement de l'Industrie 4.0 et l'automatisation avancée des flux d'atelier transforment radicalement le secteur de la plasturgie automobile. Dans un marché mondial hautement concurrentiel caractérisé par des tolérances strictes de fabrication et des délais de livraison tendus (juste-à-temps), les équipementiers de premier rang (Tier-1) ne peuvent plus se contenter d'une gestion réactive de leur appareil productif. La maîtrise globale de la chaîne de valeur requiert une visibilité instantanée sur les lignes de fabrication, l'optimisation continue du Taux de Rendement Global (TRG/OEE) des presses à injecter et une anticipation mathématique des besoins en matières premières."),
        pb(),
        body("Au cœur de ce défi industriel, la dispersion des sources d'information constitue un écueil récurrent. Bien que disposant d'un entrepôt de données d'entreprise alimenté par l'ERP Microsoft Dynamics NAV, l'entreprise d'accueil — opérant sur plusieurs usines stratégiques à Kondar et Sousse (Tunisie) ainsi qu'à Brno (République Tchèque) — souffrait d'un cloisonnement prononcé entre la gestion des stocks, la planification des ordres d'atelier et l'analyse décisionnelle. Avec un parc de 319 machines industrielles et un flux transactionnel excédant 1,5 million de mouvements de stock, le recours persistant à des fiches suiveuses papier et à des classeurs Excel disséminés engendrait des retards chroniques de consolidation, des temps d'arrêt non tracés et des ruptures de matières nobles coûteuses."),
        pb(),
        body("Pour répondre de manière concrète et pérenne à cette problématique, le présent projet de fin d'études a consisté à concevoir et développer **Nexora**, une plateforme logicielle unifiée combinant l'ingénierie web moderne, l'audit approfondi de données massives et la puissance de l'Intelligence Artificielle prédictive et prescriptive. Nexora poursuit cinq objectifs fondamentaux :"),
        bullet("**Centralisation et assainissement des données** : fédérer les 83 tables relationnelles du Data Warehouse, fiabiliser les données d'atelier (production, inventaires et mouvements de stock) et optimiser les temps d'accès aux historiques massifs grâce à une indexation clusterisée de pointe."),
        bullet("**Suivi temps réel et supervision de production** : suivre en direct l'état des machines d'injection et de soudure laser, calculer instantanément le taux TRG et ordonnancer les Ordres de Fabrication (OF)."),
        bullet("**Gestion dynamique des stocks et classification ABC** : automatiser l'analyse de Pareto sur les références d'articles, identifier les ruptures critiques (< 5 pièces) et proposer des transferts inter-usines équilibrés."),
        bullet("**Modélisation prédictive des séries temporelles (Prophet)** : projeter à 30 jours les cadences d'atelier et la consommation matière avec calcul d'intervalles de confiance rigoureux à 95 %."),
        bullet("**Aide à la décision prescriptive et Agent IA** : déployer des tableaux de bord interactifs sous Microsoft Power BI ainsi qu'un **Agent IA Décisionnel Industriel** capable de formuler des recommandations actionnables pour le calibrage des équipes (régime 3x8) et la maintenance préventive."),
        pb(),
        body("Pour mener à bien ce projet d'envergure, nous avons adopté la méthodologie Agile Scrum, organisée en un Sprint 0 préparatoire suivi de quatre sprints de développement d'une durée de 4 semaines chacun. Conformément à la démarche de recherche appliquée, ce mémoire est structuré en six chapitres canoniques :"),
        bullet("**Chapitre 1 : Contexte et Cadre Général du Projet** – Présente l'organisme d'accueil, le diagnostic de l'existant d'atelier, l'étude comparative des solutions du marché, la méthodologie Scrum adoptée et le backlog produit initial."),
        bullet("**Chapitre 2 : Sprint 0 – Analyse des Besoins et Conception du Système** – Formalise les acteurs, les exigences fonctionnelles et non fonctionnelles, l'architecture à 4 niveaux et l'environnement technologique."),
        bullet("**Chapitre 3 : Sprint 1 – Audit du Data Warehouse, Assainissement & Pipeline ETL** – Expose l'analyse exploratoire des données (EDA), la mise en place du pipeline ETL, l'optimisation des index SQL Server et la couche de sécurité RBAC / JWT."),
        bullet("**Chapitre 4 : Sprint 2 – Modélisation Prédictive de Production et Détection d'Anomalies par Intelligence Artificielle** – Développe l'étude théorique comparative des séries temporelles, le benchmark expérimental (Régression Linéaire, ARIMA, Prophet), la détection d'anomalies par Isolation Forest et le microservice d'inférence sous FastAPI."),
        bullet("**Chapitre 5 : Sprint 3 – Développement du Module de Gestion Intelligente des Stocks d'Atelier** – Détaille l'intégration des prévisions Prophet, la classification des articles en 4 statuts de stock, la segmentation ABC/Pareto, le clustering K-Means et le moteur prescriptif de réapprovisionnement d'atelier."),
        bullet("**Chapitre 6 : Sprint 4 – Tableaux de Bord Décisionnels, Agent IA et Validation Système** – Présente la conception des interfaces utilisateur Metronic 8, l'intégration de l'Agent IA Décisionnel, les rapports décisionnels Power BI et la recette globale du système."),
        pb(),
        body("Enfin, une conclusion générale dresse le bilan chiffré des résultats obtenus, analyse les difficultés surmontées et esquisse les perspectives d'évolution vers l'Internet des Objets (IoT) et le Deep Learning industriel."),
        pageBreak(),

        // =========================================================
        // CHAPITRE 1 : CONTEXTE ET CADRE GÉNÉRAL DU PROJET
        // =========================================================
        title1("Chapitre 1 : Contexte et Cadre Général du Projet"),
        title2("1.1 Introduction"),
        body("Ce premier chapitre pose les bases académiques et industrielles de notre travail. Nous y introduisons l'organisme d'accueil, son envergure internationale dans le domaine de la plasturgie automobile et ses spécificités organisationnelles multi-sites. Nous dressons ensuite une étude critique rigoureuse des pratiques existantes dans les ateliers de fabrication afin d'en cerner les failles opérationnelles. Enfin, nous explicitons la solution cible Nexora, justifions le choix de la méthodologie Agile Scrum et définissons le Product Backlog directeur de la réalisation."),
        pb(),

        title2("1.2 Cadre du Projet"),
        title3("1.2.1 Cadre Académique"),
        body("Ce travail s'inscrit dans le cadre du projet de fin d'études pour l'obtention du diplôme de Mastère Professionnel en Science des Données (Data Science) délivré par la Faculté des Sciences de Monastir (Université de Monastir, Tunisie). Il vise à concrétiser l'alliance entre les disciplines avancées de l'apprentissage automatique (Machine Learning, séries temporelles), l'ingénierie du logiciel d'entreprise (Spring Boot, React, FastAPI) et l'architecture des entrepôts de données massives (Data Warehouse SQL Server)."),
        pb(),

        title3("1.2.2 Présentation de l'Organisme d'Accueil"),
        body("Le projet a été réalisé au sein d'un groupe industriel international d'équipementier automobile de rang 1 (Tier-1), spécialisé dans la transformation thermoplastique de haute précision, le moulage par injection technique et l'assemblage de sous-ensembles automobiles complexes. L'entreprise fournit directement les principaux constructeurs et intégrateurs mondiaux : Valeo, Bosch, Delphi/Aptiv, Continental, Porsche, Mann+Hummel, Renault/Nissan, Nexteer et YAPP."),
        pb(),
        body("L'appareil productif repose sur une implantation industrielle multi-sites hautement complémentaire :"),
        bullet("**Sites de Tunisie (Usines de Kondar et Sousse)** : regroupent les halls majeurs d'injection thermoplastique lourde (TN1-INJE, TN2-INJ) et les lignes d'assemblage dédiées aux pièces de sécurité (TN1-ASSE, TN2-ASSE), notamment les réservoirs SCR d'AdBlue, les modules d'admission d'air et les flotteurs de carburant."),
        bullet("**Site de République Tchèque (Usine de Brno - CZ1)** : pôle d'excellence dédié aux technologies d'assemblage automatisé, au moulage de précision (CZM), au contrôle qualité optique (CZQ) et aux lignes de soudure laser robotisée (CZA)."),
        pb(),

        title3("1.2.3 Fiche d'Identité de l'Entreprise"),
        body("Le tableau 1.1 résume les caractéristiques clés de l'environnement industriel au sein duquel s'est déroulé notre stage de fin d'études :"),
        pb(),
        makeTable(
          ["Caractéristique", "Détail de l'entreprise d'accueil"],
          [
            ["Secteur d'activité", "Industrie Automobile (Équipementier Tier-1) – Injection Thermoplastique & Assemblage"],
            ["Sites de production", "Tunisie (Usines de Kondar et Sousse) & République Tchèque (Usine de Brno - CZ1)"],
            ["Principaux donneurs d'ordre", "Valeo, Bosch, Delphi/Aptiv, Continental, Porsche, Renault, Nexteer, Mann+Hummel"],
            ["Système d'Information", "ERP Microsoft Dynamics NAV (Navision), Entrepôt de Données SQL Server"],
            ["Parc Machines Supervisé", "319 machines réelles configurées dans le DWH (dont 108 presses et cellules critiques)"],
            ["Volumétrie Données DWH", "Plus de 3,2 millions d'enregistrements (1.5M ILE, 876k CLE, 814k Stock journalier)"],
            ["Technologies retenues", "Spring Boot 3, React Metronic 8, FastAPI Python, SQL Server, Prophet, Power BI"],
          ],
          [3400, 5266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.1 : Fiche d'identité de l'organisme d'accueil", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.2.4 Organisation Industrielle et Parcs Machines"),
        body("L'infrastructure matérielle de l'entreprise se distingue par un parc diversifié de machines de haute technologie réparties en centres de charge (*Work Centers* et *Machine Centers*) configurés au sein de l'ERP :"),
        bullet("**Presses à injecter thermoplastiques** : 48 presses robotisées de fort et moyen tonnage (Demag Systec de 50T à 420T, Arburg Allrounder de 50T à 500T, Billion Select de 150T à 320T, et presses verticales Engel) assurant la transformation des polymères techniques (PA66, PBT, POM, Polypropylène chargé fibre de verre)."),
        bullet("**Cellules robotisées de soudure laser** : robots de soudure Inautec (Inautec 1 à 7) réalisant l'assemblage hermétique des réservoirs plastiques sous atmosphère contrôlée."),
        bullet("**Bancs de test et d'assurance qualité** : bancs d'éclatement hydraulique et bancs d'étanchéité haute pression Huber Suhner garantissant une traçabilité unitaire zéro défaut."),
        pb(),

        title2("1.3 Étude et Critique de l'Existant"),
        title3("1.3.1 Diagnostic de l'Existant d'Atelier"),
        body("Une immersion prolongée au sein des ateliers de fabrication et des magasins de stockage a révélé plusieurs ruptures méthodologiques et techniques freinant la productivité :"),
        bullet("**Saisie manuelle sur fiches suiveuses papier** : le lancement des ordres de fabrication, l'enregistrement des pièces conformes et des rebuts s'effectuaient sur papier par les chefs d'équipe, avant d'être ressaisis de manière différée dans l'ERP avec plusieurs heures voire jours de retard."),
        bullet("**Calcul manuel et décalé du TRG/OEE** : les indicateurs d'efficacité machine étaient calculés a posteriori en fin de mois sur des tableurs Excel, interdisant toute réaction immédiate en cas de dérive de cadence ou de micro-arrêts répétés."),
        bullet("**Absence d'anticipation des stocks** : la gestion d'inventaire reposait sur des constats visuels périodiques. Les réapprovisionnements étaient déclenchés en urgence lors de l'atteinte d'un niveau critique, générant des arrêts de presse imprévus."),
        bullet("**Déconnexion entre l'ERP et les opérateurs d'atelier** : l'interface complexe de Microsoft Dynamics NAV était réservée aux planificateurs administratifs, privant les opérateurs d'une interface visuelle adaptée à leurs besoins quotidiens."),
        pb(),

        title3("1.3.2 Étude Comparative des Solutions du Marché"),
        body("Afin de cadrer la valeur ajoutée du développement interne d'une plateforme dédiée par rapport aux offres logicielles commerciales, nous avons réalisé une étude comparative approfondie synthétisée dans le tableau 1.2 :"),
        pb(),
        makeTable(
          ["Critère d'évaluation", "Progiciels MES / ERP Lourds (SAP, Siemens Opcenter)", "Solutions Maison Tableurs (Excel / Access)", "Plateforme Cible Nexora"],
          [
            ["Suivi TRG en temps réel", "Oui (Très complet mais complexe)", "Non (Saisies manuelles après coup)", "Oui (Calcul dynamique automatique par machine)"],
            ["Modélisation prédictive IA", "En option très onéreuse", "Non (Aucune capacité de Machine Learning)", "Oui (Intégration native du modèle Prophet)"],
            ["Agent IA Décisionnel", "Non présent nativement", "Non existant", "Oui (Agent d'atelier conversationnel et prescriptif)"],
            ["Ergonomie et convivialité", "Faible (Interface lourde et austère)", "Rudimentaire et propice aux erreurs", "Excellente (Design system réactif Metronic 8)"],
            ["Connexion directe DWH", "Nécessite des connecteurs propriétaires", "Connexion instable (ODBC limité)", "Native (Spring Boot JPA + SQL Server)"],
            ["Coût global de possession", "Prohibitif (Licences annuelles + intégrateurs)", "Faible mais coût caché élevé en pannes", "Maîtrisé (Socle open-source d'entreprise)"],
          ],
          [2200, 2400, 2000, 2066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.2 : Étude comparative des solutions du marché", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.3.3 Problématique Spécifique : Silos de données et manque de réactivité"),
        body("L'analyse met en exergue le problème fondamental des silos de données. L'entreprise stockait dans son Data Warehouse des millions de lignes de données brutes de production et de mouvements d'articles, mais ne disposait d'aucun mécanisme décisionnel automatisé pour exploiter cette richesse historique. Les décisions d'approvisionnement et de planification restaient empiriques, exposant l'atelier au double risque du surstockage d'articles obsolètes et de la rupture brutale sur des composants critiques."),
        pb(),

        title2("1.4 Solution Proposée et Workflow Global"),
        title3("1.4.1 Objectifs de la Plateforme Nexora"),
        body("Pour transcender ces limites, le projet **Nexora** vise à délivrer une plateforme intégrée dotée des capacités suivantes :"),
        bullet("Unifier l'accès aux données de production et de stock sous un socle applicatif moderne et hautement sécurisé."),
        bullet("Fournir aux managers une visibilité en direct sur les 319 machines avec calcul instantané du TRG et alertes d'arrêt."),
        bullet("Exploiter l'historique DWH par un pipeline d'IA prédictive anticipant la charge d'atelier et les besoins de composants."),
        bullet("Intégrer un Agent IA capable d'analyser en continu les anomalies et de proposer des plans d'action d'atelier."),
        bullet("Offrir une suite de tableaux de bord décisionnels Power BI pour le pilotage exécutif de la direction industrielle."),
        pb(),

        title3("1.4.2 Workflow Fonctionnel Global de Bout en Bout"),
        body("Le fonctionnement global de Nexora s'articule autour d'un flux continu reliant le terrain à la décision :"),
        bullet("**1. Ingestion et actualisation DWH** : extraction continue des ordres de fabrication et des mouvements de stock depuis la base SQL Server."),
        bullet("**2. Supervision opérationnelle** : calcul automatique des cadences par machine, détection des arrêts non justifiés et mise à jour dynamique du TRG sur l'interface Metronic 8."),
        bullet("**3. Inférence prédictive Machine Learning** : le microservice FastAPI charge les séries chronologiques, applique Prophet et transmet les prévisions à 30 jours et les intervalles d'incertitude."),
        bullet("**4. Recommandations prescriptives & Agent IA** : analyse des projections pour déduire les points de commande, équilibrer les plannings d'équipes 3x8 et assister le gestionnaire d'atelier en langage naturel."),
        pb(),

        title2("1.5 Méthodologie de Développement Adoptée"),
        title3("1.5.1 Étude Comparative des Méthodologies"),
        body("Le tableau 1.3 compare les méthodologies de conduite de projet logiciel afin de motiver notre sélection :"),
        pb(),
        makeTable(
          ["Critère", "Cycle en Cascade (Waterfall)", "Processus Unifié (UP)", "Agile Scrum (Méthode Retenue)"],
          [
            ["Flexibilité aux changements", "Très faible (Spécifications rigides)", "Moyenne (Par phases d'élaboration)", "Maximale (Réajustement à chaque sprint)"],
            ["Visibilité client / métier", "Tardive (Recette en fin de projet)", "Intermédiaire (Jalons formels)", "Permanente (Démonstration à chaque sprint)"],
            ["Gestion des risques techniques", "Reportée lors de l'intégration finale", "Traitée durant l'architecture", "Continue (Tests et livraisons itératifs)"],
            ["Adéquation Data Science & IA", "Inadaptée à la démarche itérative", "Partiellement adaptée", "Excellente (Affinement continu des modèles)"],
          ],
          [2400, 2100, 2100, 2066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.3 : Comparaison des méthodologies de gestion de projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.5.2 Principes de la Méthodologie Scrum"),
        body("La méthodologie Agile Scrum [1] a été retenue pour sa capacité à délivrer régulièrement des incréments logiciels testés et exploitables. L'équipe projet est structurée comme suit :"),
        bullet("**Product Owner (PO)** : le responsable industriel de l'entreprise d'accueil, garant de la vision métier et de la priorisation du backlog."),
        bullet("**Scrum Master (SM)** : l'encadrant technique assurant le respect des règles agiles et la levée des blocages."),
        bullet("**Équipe de Développement** : assurée par l'étudiante ingénieure/chercheuse, responsable de la conception, de l'implémentation et des tests."),
        pb(),
        ...imageFigure("scrum-framework-9.29.23.png", "Figure 1.1 : Vue d'ensemble du framework Scrum", 540, 360),

        title3("1.5.3 Planification Globale du Projet"),
        body("Le projet s'est déployé sur une durée totale de 6 mois (24 semaines), découpé en un Sprint 0 préparatoire et quatre sprints de réalisation de 4 semaines (tableau 1.4) :"),
        pb(),
        makeTable(
          ["Cycle / Sprint", "Objectif Principal", "Période", "Durée", "Charge estimée"],
          [
            ["Sprint 0", "Analyse des besoins, architecture 4 tiers & socle technique", "Semaines 1 à 4", "4 semaines", "Cahier des charges & Stack"],
            ["Sprint 1", "Audit Data Warehouse, assainissement ETL & sécurité RBAC", "Semaines 5 à 8", "4 semaines", "22 Story Points (SP)"],
            ["Sprint 2", "Modélisation prédictive de production par IA (Prophet)", "Semaines 9 à 12", "4 semaines", "25 Story Points (SP)"],
            ["Sprint 3", "Gestion intelligente des stocks & moteur prescriptif", "Semaines 13 à 16", "4 semaines", "24 Story Points (SP)"],
            ["Sprint 4", "Tableaux de bord Metronic, Agent IA & recette globale", "Semaines 17 à 20", "4 semaines", "27 Story Points (SP)"],
            ["Phase Finale", "Recette industrielle multi-sites & rédaction du mémoire", "Semaines 21 à 24", "4 semaines", "Validation finale"],
          ],
          [1600, 3200, 1400, 1100, 1366]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.4 : Planification des Sprints Scrum sur les 6 mois de stage PFE", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.5.4 Product Backlog Global"),
        body("Le Product Backlog regroupe l'ensemble des 24 récits utilisateurs (*User Stories*) [2] couvrant les besoins validés par le Product Owner :"),
        pb(),
        makeTable(
          ["ID", "Récit Utilisateur (User Story)", "Priorité", "Estimation", "Sprint Associé"],
          [
            ["US01", "En tant qu'utilisateur, je veux m'authentifier par jeton JWT afin d'accéder aux fonctions autorisées", "Haute", "5 SP", "Sprint 1"],
            ["US02", "En tant qu'administrateur, je veux configurer les rôles RBAC pour restreindre les accès aux API", "Haute", "5 SP", "Sprint 1"],
            ["US03", "En tant qu'ingénieur data, je veux auditer le DWH afin de cartographier les tables de faits", "Haute", "8 SP", "Sprint 1"],
            ["US04", "En tant qu'ingénieur data, je veux assainir les données de mouvements de stock afin d'éliminer les anomalies", "Haute", "5 SP", "Sprint 1"],
            ["US05", "En tant que manager, je veux suivre les 319 machines d'atelier en temps réel", "Haute", "8 SP", "Sprint 2"],
            ["US06", "En tant que manager, je veux calculer automatiquement le TRG en direct par centre de charge", "Haute", "8 SP", "Sprint 2"],
            ["US07", "En tant qu'opérateur, je veux déclarer le statut des Ordres de Fabrication (OF)", "Moyenne", "5 SP", "Sprint 2"],
            ["US08", "En tant que data scientist, je veux extraire et agréger l'historique de production ds/y", "Haute", "5 SP", "Sprint 2"],
            ["US09", "En tant que data scientist, je veux entraîner le modèle Prophet et comparer avec ARIMA", "Haute", "8 SP", "Sprint 2"],
            ["US10", "En tant que manager, je veux visualiser les prévisions de production à 30 jours et bornes à 95%", "Haute", "5 SP", "Sprint 2"],
            ["US11", "En tant que gestionnaire de stock, je veux classer les articles selon la méthode ABC de Pareto", "Haute", "8 SP", "Sprint 3"],
            ["US12", "En tant que gestionnaire, je veux recevoir des alertes automatiques de rupture critique (< 5 pcs)", "Haute", "5 SP", "Sprint 3"],
            ["US13", "En tant qu'opérateur, je veux enregistrer des entrées/sorties de stock conformes au DWH", "Moyenne", "5 SP", "Sprint 3"],
            ["US14", "En tant que manager, je veux obtenir des recommandations de commande d'approvisionnement", "Haute", "5 SP", "Sprint 3"],
            ["US15", "En tant que responsable de production, je veux adapter les équipes (3x8) selon les prévisions", "Moyenne", "5 SP", "Sprint 3"],
            ["US16", "En tant que responsable logistique, je veux planifier des transferts inter-usines Tunisie-Brno", "Basse", "3 SP", "Sprint 3"],
            ["US17", "En tant que manager, je veux disposer d'une console Metronic 8 avec filtres multi-critères", "Haute", "5 SP", "Sprint 4"],
            ["US18", "En tant que gestionnaire, je veux exporter les données filtrées sous format Excel (.xlsx)", "Moyenne", "3 SP", "Sprint 4"],
            ["US19", "En tant qu'utilisateur, je veux dialoguer avec un Agent IA Décisionnel pour diagnostiquer les pannes", "Haute", "8 SP", "Sprint 4"],
            ["US20", "En tant que directeur, je veux consulter des tableaux de bord interactifs Power BI reliés au DWH", "Haute", "5 SP", "Sprint 4"],
            ["US21", "En tant qu'administrateur, je veux consulter les journaux ActivityLog pour l'audit des actions", "Basse", "3 SP", "Sprint 4"],
            ["US22", "En tant qu'utilisateur, je veux bénéficier d'un fallback offline en cas de panne réseau", "Moyenne", "5 SP", "Sprint 4"],
          ],
          [600, 5200, 1000, 900, 966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.5 : Product Backlog complet et priorisé du projet Nexora", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("1.6 Langage de Modélisation UML 2.5"),
        body("Pour formaliser rigoureusement l'analyse et la conception, le langage de modélisation unifié **UML 2.5** [15] a été retenu. Nous exploitons ses deux grandes familles de diagrammes :"),
        bullet("**Diagrammes structurels** : diagrammes de classes pour concevoir les modèles d'entités, diagramme relationnel Entités-Associations pour le Data Warehouse, et diagramme de déploiement pour l'architecture physique."),
        bullet("**Diagrammes comportementaux** : diagrammes de cas d'utilisation pour exprimer les interactions fonctionnelles, diagrammes de séquence pour orchestrer les échanges asynchrones entre microservices, et diagrammes d'activité pour détailler les règles métiers et le pipeline ETL."),
        pb(),

        title2("1.7 Conclusion"),
        conclusionBox("Ce chapitre a exposé le cadre général du projet au sein d'un grand équipementier de plasturgie automobile. L'analyse critique de l'existant a confirmé l'urgence d'une solution unifiée et intelligente pour surmonter le cloisonnement des données. Grâce au cadre méthodologique Scrum et à la modélisation UML, le périmètre du projet est clairement balisé en 24 User Stories. Le chapitre suivant présente les résultats du Sprint 0, consacré à l'analyse détaillée des besoins et à la conception architecturale globale."),
        pageBreak(),

        // =========================================================
        // CHAPITRE 2 : SPRINT 0 – ANALYSE DES BESOINS ET CONCEPTION
        // =========================================================
        title1("Chapitre 2 : Sprint 0 – Analyse des Besoins et Conception du Système"),
        title2("2.1 Introduction"),
        body("Le Sprint 0 constitue une étape fondatrice indispensable dans tout projet logiciel complexe. Loin d'être une simple formalité, il permet d'aligner l'équipe de développement et les experts métiers sur les spécifications fonctionnelles détaillées, d'élaborer l'architecture technique à 4 niveaux et de valider les choix technologiques garantissant scalabilité, sécurité et performance."),
        pb(),

        title2("2.2 Sprint Backlog du Sprint 0"),
        body("Le tableau 2.1 présente le Sprint Backlog du Sprint 0, découpé en tâches d'ingénierie préliminaire :"),
        pb(),
        makeTable(
          ["ID Tâche", "Description de la tâche de conception", "Responsable", "Livrable produit", "Statut"],
          [
            ["T0.1", "Recueil et modélisation des exigences des profils d'atelier", "Développeur / PO", "Matrice des besoins fonctionnels", "Terminé"],
            ["T0.2", "Formalisation des cas d'utilisation globaux et scénarios textuels", "Développeur", "Diagramme de cas d'utilisation UML", "Terminé"],
            ["T0.3", "Conception de l'architecture logicielle 4 tiers et physique", "Développeur / SM", "Diagrammes d'architecture", "Terminé"],
            ["T0.4", "Benchmarking et sélection de la stack technologique complète", "Développeur", "Fiches technologiques et prototypes", "Terminé"],
            ["T0.5", "Mise en place de l'environnement matériel, IDE et serveurs de test", "Développeur", "Environnement configuré opérationnel", "Terminé"],
          ],
          [900, 3200, 1400, 2000, 1166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.1 : Sprint Backlog du Sprint 0 – Spécification et Architecture", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("2.3 Analyse des Besoins"),
        title3("2.3.1 Identification des Acteurs du Système"),
        body("La gouvernance des accès au sein de Nexora s'appuie sur une politique de contrôle d'accès basée sur les rôles (RBAC) distinguant trois profils majeurs (tableau 2.2) :"),
        pb(),
        makeTable(
          ["Acteur / Profil", "Rôle Applicatif", "Périmètre de responsabilités et droits d'accès"],
          [
            ["Administrateur Système", "ROLE_ADMIN", "Gestion globale des comptes, attribution des habilitations RBAC, supervision technique des journaux d'audit ActivityLog et intégrité de la plateforme."],
            ["Responsable Production / Manager", "ROLE_MANAGER", "Supervision des 319 machines, suivi temps réel du TRG, affectation des ordres de fabrication, paramétrage des seuils de stock, consultation des prévisions Prophet et exploitation de l'Agent IA."],
            ["Opérateur d'Atelier / Magasinier", "ROLE_OPERATEUR", "Pointage des ordres de fabrication (début, fin, rebuts), déclaration des arrêts machines, saisie des mouvements d'entrée/sortie d'inventaire et consultation des alertes critiques."],
          ],
          [2200, 1800, 4666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.2 : Matrice des acteurs et profils d'accès RBAC", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("2.3.2 Besoins Fonctionnels"),
        body("Les exigences fonctionnelles du système ont été regroupées en dix modules structurants (tableau 2.3) :"),
        pb(),
        makeTable(
          ["Code", "Module Fonctionnel", "Description détaillée de l'exigence"],
          [
            ["F01", "Sécurité & Contrôle d'Accès", "Authentification sans état par jetons JWT, chiffrement BCrypt, politique de mots de passe forts et gestion des sessions."],
            ["F02", "Supervision des Machines", "Cartographie des 319 machines d'atelier, affichage des statuts (En marche, En panne, En réglage) et durée de fonctionnement."],
            ["F03", "Calcul Automatique du TRG", "Agrégation en temps réel du taux de disponibilité, de performance et de qualité avec alertes visuelles de dérive."],
            ["F04", "Gestion des Ordres de Fabrication", "Planification, ordonnancement et suivi d'avancement des ordres de fabrication d'atelier."],
            ["F05", "Gestion Dynamique de l'Inventaire", "Suivi en temps réel des niveaux de stock d'articles, historique des mouvements et alertes de seuils critiques."],
            ["F06", "Modélisation Prédictive Prophet", "Génération de prévisions temporelles à 30 jours pour la production et le stock avec décomposition des composantes saisonnières."],
            ["F07", "Calcul des Intervalles de Confiance", "Restitution des bornes d'incertitude à 95% (yhat_lower, yhat_upper) pour anticiper les capacités maximales d'atelier."],
            ["F08", "Moteur Prescriptif d'Atelier", "Génération automatique de recommandations de réapprovisionnement, planification d'équipes 3x8 et maintenance préventive."],
            ["F09", "Agent IA Décisionnel Industriel", "Assistant d'atelier conversationnel interactif capable de diagnostiquer les arrêts et de suggérer des arbitrages."],
            ["F10", "Tableaux de Bord Power BI", "Intégration de rapports décisionnels multi-dimensionnels connectés directement au Data Warehouse SQL Server."],
          ],
          [700, 2500, 5466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.3 : Matrice des exigences fonctionnelles majeures", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("2.3.3 Besoins Non Fonctionnels"),
        bullet("**Performance et temps de réponse** : le temps de chargement des écrans et de réponse des API doit rester inférieur à 300 ms en charge nominale, avec des requêtes optimisées pour s'exécuter en moins de 500 ms."),
        bullet("**Sécurité et traçabilité** : isolation stricte des API par Spring Security, validation des requêtes, chiffrement des données de connexion et historisation systématique de chaque action critique dans un journal d'audit (`ActivityLog`)."),
        bullet("**Résilience et haute disponibilité** : en cas d'indisponibilité transitoire du microservice FastAPI, le client React doit basculer de manière totalement transparente sur un moteur de calcul de secours local (*offline fallback*), sans bloquer l'opérateur."),
        bullet("**Ergonomie et convivialité industrielle** : conformité intégrale au design system Metronic 8 (badges colorés par statut, formulaires solides, pagination réactive, icônes standardisées KTIcon et adaptabilité aux tablettes d'atelier)."),
        pb(),

        title2("2.4 Conception du Système & Cas d'Utilisation Global"),
        title3("2.4.1 Diagramme de Cas d'Utilisation Global"),
        body("La figure 2.1 modélise le diagramme de cas d'utilisation global illustrant les frontières du système et les interactions entre les trois profils d'utilisateurs :"),
        pb(),
        ...imageFigure("diagrams/global_usecase.png", "Figure 2.1 : Diagramme de cas d'utilisation global de la plateforme Nexora", 480, 380),

        title3("2.4.2 Descriptions Textuelles des Cas d'Utilisation Majeurs"),
        body("Conformément aux normes du génie logiciel [15], nous formalisons ci-dessous les fiches descriptives des cas d'utilisation structurants :"),
        pb(),
        ucDesc({
          name: "S'authentifier et naviguer selon les rôles RBAC",
          actors: "Administrateur, Responsable Production (Manager), Opérateur d'Atelier",
          precond: "L'utilisateur dispose d'un compte actif avec mot de passe chiffré dans la base SQL Server.",
          scenario: [
            "L'utilisateur saisit son adresse e-mail et son mot de passe sur la mire Metronic.",
            "Le backend Spring Boot valide les informations via le AuthenticationManager et BCrypt.",
            "Le serveur génère un jeton signé JWT contenant le rôle et les privilèges de l'utilisateur.",
            "Le frontend React stocke le jeton et adapte dynamiquement le menu latéral de navigation.",
            "L'utilisateur est redirigé vers son tableau de bord métier personnalisé."
          ],
          postcond: "La session est active et sécurisée ; toutes les requêtes subséquentes portent le jeton en en-tête Bearer.",
          exceptions: "Identifiants invalides : message d'erreur explicite. Compte désactivé : accès refusé avec alerte sécurité."
        }),
        pb(),
        ucDesc({
          name: "Superviser les machines d'atelier et calculer le TRG en direct",
          actors: "Responsable Production (Manager)",
          precond: "Les 319 machines sont configurées dans le référentiel des machines du Data Warehouse.",
          scenario: [
            "Le manager accède à la console de suivi de production.",
            "Le système extrait l'état de fonctionnement de chaque centre de charge (En marche, En panne, En réglage).",
            "Le backend agrège les durées utiles et les temps d'arrêt pour calculer le TRG instantané.",
            "L'interface affiche les jauges graphiques de performance et colore les alertes en rouge en cas de TRG < 65%."
          ],
          postcond: "La situation d'atelier est actualisée et visualisée en temps réel.",
          exceptions: "Donnée machine temporairement non remontée : affichage du dernier état connu avec icône d'avertissement."
        }),
        pb(),
        ucDesc({
          name: "Générer les prévisions Prophet et consulter l'Agent IA",
          actors: "Responsable Production (Manager), Décideur Industriel",
          precond: "L'historique de production d'atelier est synchronisé et le microservice FastAPI est opérationnel.",
          scenario: [
            "Le manager sélectionne l'horizon prévisionnel (7, 14 ou 30 jours) sur l'interface d'IA.",
            "Le service FastAPI entraîne le modèle additif Prophet sur la série temporelle journalière.",
            "Le modèle génère la courbe tendancielle, les cycles hebdomadaires et l'intervalle de confiance à 95%.",
            "Le manager ouvre le tiroir (Drawer) de l'Agent IA Décisionnel pour obtenir un diagnostic sur les cadences.",
            "L'Agent IA formule des préconisations d'ordonnancement d'équipes (régime 3x8) et de maintenance."
          ],
          postcond: "Les prévisions sont visualisées sur ApexCharts et les recommandations d'atelier sont exploitables.",
          exceptions: "Indisponibilité temporaire du microservice Python : bascule automatique vers le moteur de calcul local React."
        }),
        pb(),

        title2("2.5 Architecture Proposée"),
        title3("2.5.1 Architecture Logique à 4 Niveaux"),
        body("Afin de garantir une indépendance stricte entre le traitement de données massives, la logique d'entreprise et l'interface utilisateur, la plateforme Nexora adopte une architecture logique découplée en quatre couches étanches (figure 2.2) :"),
        bullet("**1. Couche Données / Data Warehouse (DWH)** : base relationnelle Microsoft SQL Server hébergeant l'entrepôt de données d'atelier (historiques de production, inventaires journaliers et mouvements d'articles)."),
        bullet("**2. Couche Ingestion et Pipeline ETL** : procédures d'assainissement, d'agrégation et d'indexation clusterisée assurant la cohérence des flux."),
        bullet("**3. Couche Métier, Sécurité & IA** : API REST d'entreprise sous Spring Boot 3 (Java 17) couplée de manière asynchrone au microservice de Data Science sous FastAPI (Python 3.10)."),
        bullet("**4. Couche Présentation & Décision** : application monopage (SPA) réactive sous React 18 / TypeScript avec le design system Metronic 8, complétée par les rapports Microsoft Power BI."),
        pb(),
        ...imageFigure("diagrams/arch_logique.png", "Figure 2.2 : Architecture logique à 4 niveaux du système Nexora", 540, 380),

        title3("2.5.2 Architecture Physique et Déploiement"),
        body("La figure 2.3 détaille l'infrastructure matérielle et réseau d'hébergement. Le serveur de base de données SQL Server (port 1433) est déployé sur le réseau d'entreprise protégé. Le serveur d'application héberge le backend Spring Boot (port 8080) communiquant par réseau local avec le service d'IA FastAPI Uvicorn (port 8000). Les postes de travail et tablettes d'atelier accèdent à l'interface React via des liaisons HTTPS sécurisées."),
        pb(),
        ...imageFigure("diagrams/arch_physique.png", "Figure 2.3 : Architecture physique et infrastructure de déploiement", 540, 360),

        title3("2.5.3 Diagramme de Classes Global"),
        body("La structure des entités persistantes est représentée par le diagramme de classes global (figure 2.4). Il modélise les entités maîtresses : `Utilisateur`, `Role`, `Machine`, `OrdreProduction`, `ArretMachine`, `Article`, `MouvementStock`, `PredictionProphet` et `JournalActivite`."),
        pb(),
        ...imageFigure("diagrams/global_classes.png", "Figure 2.4 : Diagramme de classes global du modèle conceptuel", 540, 380),

        title2("2.6 Environnement Matériel et Logiciel"),
        title3("2.6.1 Environnement Matériel"),
        body("L'environnement matériel utilisé pour le développement, l'apprentissage des modèles et les tests de validation comprend un poste haute performance doté d'un processeur multi-cœurs (16 threads), de 32 Go de mémoire RAM DDR5 pour le traitement en mémoire des séries massives, et de disques NVMe offrant des débits supérieurs à 5 000 Mo/s pour la manipulation fluide des sauvegardes du Data Warehouse."),
        pb(),

        title3("2.6.2 Stack Technologique et Outils"),
        body("Cette section présente les technologies clés retenues pour la conception et l'implémentation de Nexora :"),
        pb(),
        ...techCard(1, "Spring Boot 3 (Java 17)", "logos/Spring Boot.png",
          "Spring Boot 3 est le framework d'entreprise de référence pour la construction d'architectures backend robustes, modulaires et sécurisées.",
          "Dans Nexora, il assure la gestion de la sécurité par jetons JWT, la persistance relationnelle via Spring Data JPA, l'exposition des API REST et l'orchestration des flux d'atelier."),
        ...techCard(2, "React 18 & TypeScript (Metronic 8)", "logos/react.png",
          "React 18 est la bibliothèque JavaScript leader pour la création d'interfaces utilisateur monopages dynamiques et hautement réactives.",
          "Couplé au design system industriel Metronic 8 et au typage strict TypeScript, il offre aux opérateurs d'atelier une ergonomie sans faille avec composants interactifs, badges colorés et filtres avancés."),
        ...techCard(3, "FastAPI & Python 3.10", "logos/FastAPI.png",
          "FastAPI est un framework web asynchrone moderne à très haute performance, conçu spécifiquement pour l'exposition d'algorithmes de Machine Learning.",
          "Il héberge le microservice de Data Science et exécute les calculs de séries temporelles avec une latence d'inférence minimale."),
        ...techCard(4, "Microsoft SQL Server & Entrepôt de Données", "logos/Microsoft SQL Server.png",
          "Microsoft SQL Server est un système de gestion de bases de données relationnelles éprouvé pour les charges analytiques lourdes.",
          "Il héberge l'entrepôt de données comprenant 83 tables et des millions de transactions industrielles issues de Microsoft Dynamics NAV."),
        ...techCard(5, "Microsoft Power BI", "logos/powerbi.png",
          "Microsoft Power BI est la solution de Business Intelligence reconnue pour la modélisation multi-dimensionnelle et la restitution visuelle de KPIs.",
          "Directement interconnecté à l'entrepôt de données, il alimente les tableaux de bord exécutifs destinés à la direction industrielle."),
        ...techCard(6, "Git & GitHub", "logos/Git & GitHub.png",
          "Git et GitHub constituent le standard universel de contrôle de version décentralisé et d'intégration continue.",
          "Ils ont garanti une traçabilité rigoureuse de chaque incrément logiciel développé au fil des sprints Scrum."),


        title3("2.6.3 Cartographie Exhaustive des Modèles d'Intelligence Artificielle et de Data Science de Nexora"),
        body("L'innovation majeure de la plateforme Nexora réside dans son écosystème algorithmique unifié, articulant huit modèles et méthodes d'intelligence artificielle et de science des données complémentaires répartis entre les microservices FastAPI et Spring Boot (tableau 2.4) :"),
        pb(),
        makeTable(
          ["ID", "Modèle / Algorithme", "Type d'IA", "Rôle Opérationnel dans Nexora", "Module / Endpoint", "Statut Applicatif"],
          [
            ["M01", "Prophet (Meta)", "Séries Temporelles Additives", "Prévision de production journalière (changepoints, saisonnalités, intervalles 95%)", "FastAPI /predict/production", "Champion Déployé ⋆"],
            ["M02", "ARIMA", "Séries Temporelles Autorégressives", "Modèle autorégressif de comparaison statistique court terme (Box-Jenkins)", "FastAPI /predict/production", "Intégré dans l'App ✓"],
            ["M03", "Régression Linéaire (MCO)", "Apprentissage Supervisé (ML)", "Modélisation de tendance de référence (baseline)", "FastAPI /predict/custom", "Intégré dans l'App ✓"],
            ["M04", "Isolation Forest", "Apprentissage Non Supervisé (ML)", "Détection en temps réel des anomalies d'usinage et dérives de cadence", "FastAPI /detect/anomaly", "Opérationnel Live ✓"],
            ["M05", "K-Means Clustering", "Apprentissage Non Supervisé (ML)", "Partitionnement multi-critères des articles de stock en 3 classes de gestion", "FastAPI /cluster/items", "Opérationnel Live ✓"],
            ["M06", "Classification ABC de Pareto", "Data Science Analytique", "Hiérarchisation 80/15/5 de la valeur financière des stocks sur les données d'inventaire", "FastAPI /analyze/abc", "Opérationnel Live ✓"],
            ["M07", "LLaMA 3.3 70B Versatile", "IA Générative / Grand Modèle (LLM)", "Agent conversationnel décisionnel d'atelier (Groq API, prompt guidé et fallback local)", "FastAPI /ai/agent/chat", "Opérationnel Live ✓"],
            ["M08", "Simulation Scénaristique What-If", "Modélisation Prescriptive", "Analyse de sensibilité aux variations de demande (+/- X%) et risque de rupture", "FastAPI /simulate/scenario", "Opérationnel Live ✓"],
          ],
          [600, 1800, 1600, 2300, 1300, 1066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.4 : Cartographie exhaustive des modèles d'IA et de Data Science déployés dans Nexora", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        title2("2.7 Bilan des Livrables du Sprint 0"),
        body("Le tableau 2.5 dresse le bilan des livrables validés à l'issue du Sprint 0 :"),
        pb(),
        makeTable(
          ["Tâche Réalisée", "Livrable Associé", "Validation Métier & Technique", "Statut"],
          [
            ["Spécification des besoins", "Matrice des exigences fonctionnelles et non fonctionnelles", "Validé par le Product Owner", "100% Conforme"],
            ["Modélisation conceptuelle", "Diagrammes de cas d'utilisation, séquence et classes globales UML", "Validé par l'encadrement", "100% Conforme"],
            ["Architecture système", "Spécification de l'architecture 4 tiers et physique de déploiement", "Validé par l'architecte", "100% Conforme"],
            ["Sélection de la stack", "Fiches technologiques et benchmarks de faisabilité", "Validé par l'équipe projet", "100% Conforme"],
            ["Environnement de test", "Serveurs SQL Server, Spring Boot et FastAPI configurés", "Opérationnel", "100% Conforme"],
          ],
          [2000, 2800, 2200, 1666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.5 : Bilan des livrables du Sprint 0", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("2.8 Conclusion"),
        conclusionBox("Le Sprint 0 a permis de poser des fondations méthodologiques, architecturales et techniques solides pour la plateforme Nexora. La formalisation rigoureuse des besoins des ateliers de plasturgie et le découpage logique en quatre couches étanches garantissent que les développements des sprints ultérieurs répondront parfaitement aux exigences de performance industrielle. Le chapitre 3 détaille le Sprint 1, axé sur l'audit du Data Warehouse, le pipeline ETL et la couche de sécurité."),
        pageBreak(),

        // =========================================================
        // CHAPITRE 3 : SPRINT 1 – AUDIT DWH, ETL & SÉCURITÉ
        // =========================================================
        title1("Chapitre 3 : Sprint 1 – Audit du Data Warehouse, Assainissement & Pipeline ETL"),
        title2("3.1 Introduction"),
        body("Ce chapitre détaille la réalisation du premier cycle de développement opérationnel (Sprint 1). Face à un Data Warehouse d'entreprise volumineux issu de l'ERP Navision, ce sprint a eu pour double objectif de réaliser un audit exploratoire rigoureux des tables de faits, de concevoir un pipeline ETL d'assainissement et d'optimisation des index, et de mettre en œuvre la couche d'accès sécurisée de la plateforme Nexora via des jetons JWT et des rôles RBAC."),
        pb(),

        title2("3.2 Sprint Backlog du Sprint 1"),
        body("Le tableau 3.1 détaille le backlog des tâches exécutées au cours du Sprint 1 :"),
        pb(),
        makeTable(
          ["ID US", "Récit Utilisateur (User Story)", "Tâche de développement associée", "Estimation (SP)", "Statut"],
          [
            ["US01", "En tant qu'utilisateur, je veux m'authentifier par jeton JWT", "Développement du contrôleur d'authentification et filtre JWT", "5 SP", "Terminé"],
            ["US02", "En tant qu'administrateur, je veux configurer les rôles RBAC", "Création de la matrice de permissions et routes protégées", "5 SP", "Terminé"],
            ["US03", "En tant qu'ingénieur data, je veux auditer l'entrepôt de données", "Cartographie des 83 tables et métadonnées de volumétrie", "8 SP", "Terminé"],
            ["US04", "En tant qu'ingénieur data, je veux assainir les données de stock", "Implémentation du pipeline ETL et indexation clusterisée", "5 SP", "Terminé"],
            ["US21", "En tant qu'administrateur, je veux tracer les actions dans ActivityLog", "Création de la table de logs et console d'historique", "3 SP", "Terminé"],
          ],
          [700, 3200, 3100, 800, 866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.1 : Sprint Backlog du Sprint 1 – Audit DWH, ETL & Sécurité", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("3.3 Présentation des Données du Data Warehouse"),
        title3("3.3.1 Structure et Sources du Data Warehouse d'Entreprise"),
        body("L'entrepôt de données centralise les flux issus des différents modules de Microsoft Dynamics NAV. Il regroupe un total de **83 tables relationnelles** couvrant la comptabilité analytique, la gestion des articles, la capacité des machines et les ordres de production."),
        pb(),

        title3("3.3.2 Tables Clés du Projet"),
        body("Quatre tables de faits majeures concentrent l'essentiel de la valeur décisionnelle pour les opérations d'atelier (tableau 3.2) :"),
        pb(),
        makeTable(
          ["Nom de la Table", "Volumétrie Réelle", "Description et Rôle Opérationnel"],
          [
            ["MCMachineCenter", "319 enregistrements", "Référentiel des machines d'atelier : code machine, centre de charge, capacité nominale et site industriel (Tunisie / Brno)."],
            ["FACT_CLE", "876 412 lignes", "Capacity Ledger Entry : écritures réelles de capacité machine, temps de cycle d'injection, quantités produites et rebuts."],
            ["ASTOCKDATE", "814 200 lignes", "Stock journalier horodaté par référence d'article et magasin de stockage pour l'évaluation temporelle de la valorisation."],
            ["FACT_ILE", "1 502 702 lignes", "Item Ledger Entry : journal exhaustif des mouvements de stock (entrées, sorties de fabrication, transferts inter-usines) sans écart d'inventaire."],
          ],
          [2200, 1800, 4666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.2 : Principales tables de faits et volumétries du Data Warehouse", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.3 Modèle Relationnel Entités-Associations"),
        body("La figure 3.1 présente le schéma relationnel modélisant les liens entre les centres de travail (`WorkCenter`), les machines d'injection (`MCMachineCenter`), les écritures de charge (`FACT_CLE`), les articles et les écritures d'inventaire (`FACT_ILE`) :"),
        pb(),
        ...imageFigure("diagrams/er_diagram.png", "Figure 3.1 : Schéma relationnel Entités-Associations du Data Warehouse", 540, 260),

        title2("3.4 Analyse Exploratoire des Données (EDA) & Diagnostic Qualité"),
        title3("3.4.1 Distributions Statistiques et Volumétries"),
        body("L'analyse exploratoire (*Exploratory Data Analysis*) conduite avec Python (Pandas, Seaborn) a mis en lumière une forte dispersion des volumes de production journaliers. Les cadences quotidiennes varient de 1 200 pièces lors des phases de changement de moule à plus de 28 000 pièces en pleine cadence sur les polymères de grande série."),
        pb(),

        title3("3.4.2 Corrélations et Saisonnalités d'Atelier"),
        body("L'analyse temporelle confirme l'existence d'une saisonnalité hebdomadaire très marquée :"),
        bullet("Une montée en régime le lundi matin suite aux préchauffages des presses à injecter."),
        bullet("Un palier de production maximal stabilisé du mardi au vendredi matin."),
        bullet("Une baisse sensible le week-end liée aux équipes réduites et aux arrêts de maintenance préventive."),
        pb(),

        title3("3.4.3 Identification des Anomalies"),
        body("L'audit qualité a détecté trois anomalies majeures nécessitant un assainissement avant toute exploitation :"),
        bullet("**Lignes de stock négatif transitoires** : dans la table `ASTOCKDATE`, certaines écritures présentaient des quantités négatives issues d'erreurs de pointage lors des transferts rapides entre magasins."),
        bullet("**Temps de cycle nuls ou aberrants** : sur la table `FACT_CLE`, des opérations d'usinage affichaient des durées de 0 seconde ou supérieures à 48 heures consécutives à des oublis de clôture d'ordres."),
        bullet("**Absence d'index clusterisé sur Entry No_** : les requêtes de recherche de mouvements sur `FACT_ILE` déclenchaient un scan complet de table provoquant des temps de réponse supérieurs à 30 secondes."),
        pb(),

        title2("3.5 Pipeline de Nettoyage et d'Intégration ETL"),
        title3("3.5.1 Architecture et Déroulement du Pipeline ETL"),
        body("Le pipeline ETL développé sous forme de scripts automatisés SQL et de services Spring Boot s'articule selon le diagramme d'activité de la figure 3.2 :"),
        bullet("**Extraction** : lecture incrémentale des écritures récentes depuis Microsoft Dynamics NAV."),
        bullet("**Transformation** : filtrage des valeurs aberrantes, imputation des stocks négatifs par le dernier inventaire physique certifié, standardisation des horodatages UTC et conversion des devises en Dinars Tunisiens (DT)."),
        bullet("**Chargement & Indexation** : insertion dans le schéma cible avec mise à jour des statistiques de cardinalité."),
        pb(),
        ...imageFigure("diagrams/sprint1_activity.png", "Figure 3.2 : Diagramme d'activité du pipeline de nettoyage et d'intégration ETL", 540, 380),

        title3("3.5.2 Optimisation SQL Server et Stratégie d'Indexation Clusterisée"),
        body("La performance de restitution constituant un critère critique, nous avons reconfiguré la stratégie d'indexation de la table `FACT_ILE`. La création d'un index clusterisé primaire sur la clé `Entry No_ DESC` combiné à des index couvrants non-clusterisés sur `(Item No_, Posting Date)` a métamorphosé les performances : le temps d'exécution moyen d'une extraction des 5 000 derniers mouvements est passé de **31 420 ms (timeout fréquent) à seulement 448 ms**, garantissant une fluidité immédiate sur le frontend React."),
        pb(),

        title3("3.5.3 Bilan Qualité des Données"),
        body("Le tableau 3.3 récapitule les gains qualitatifs enregistrés après exécution du pipeline ETL :"),
        pb(),
        makeTable(
          ["Indicateur Qualité", "État Avant Pipeline ETL", "État Après Pipeline ETL", "Gain / Amélioration"],
          [
            ["Taux de complétude des horodatages", "91,4 %", "100 % (Imputation normalisée)", "+ 8,6 %"],
            ["Proportion de stocks négatifs erronés", "3,8 % des lignes", "0 % (Correction par inventaire certifié)", "Suppression totale des anomalies"],
            ["Temps moyen de requête TOP 5000 (FACT_ILE)", "31,4 secondes", "0,448 seconde (448 ms)", "Temps divisé par 70"],
            ["Unicité et intégrité référentielle", "96,2 %", "100 % (Clés étrangères garanties)", "Fiabilisation intégrale"],
          ],
          [2800, 2100, 2100, 1666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.3 : Bilan qualité des données avant et après exécution du pipeline ETL", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

                title2("3.6 Sécurité d'Accès, Rôles RBAC et Administration des Utilisateurs"),
        body("Pour sécuriser l'accès aux données sensibles d'atelier et garantir la traçabilité des opérations, le système intègre une authentification sans état par **jeton JWT (JSON Web Token)** et un modèle de contrôle d'accès basé sur les rôles **RBAC (Role-Based Access Control)**."),
        bullet("**Administrateur (ADMIN)** : gestion complète des comptes, attribution des rôles et supervision de la sécurité."),
        bullet("**Responsable de Production (MANAGER)** : consultation des TRS/TRG, planification des ordres de fabrication et exécution des prévisions Prophet."),
        bullet("**Opérateur d'Atelier (OPERATEUR)** : déclaration des quantités produites et pointage des mouvements d'inventaire."),
        pb(),
        body("La console d'administration des utilisateurs (figure 3.3) permet à l'administrateur de gérer l'ensemble des comptes : création, modification, suppression et activation/désactivation immédiate en un clic (`toggle-status`)."),
        pb(),
        ...emptyFigurePlaceholder("Figure 3.3 : Capture d'écran : Console d'administration des utilisateurs et contrôle RBAC"),

        title2("3.7 Bilan des Tests et Livrables du Sprint 1"),
        body("La validation fonctionnelle et technique du Sprint 1 a mobilisé une suite complète de tests (tableau 3.4) :"),
        pb(),
        makeTable(
          ["Type de Test", "Périmètre Testé", "Outil Utilisé", "Résultat Obtenu"],
          [
            ["Tests Unitaires", "Chiffrement BCrypt, validation JWT, règles de transition d'état", "JUnit 5", "✓ 15 tests passés avec 100% de succès"],
            ["Tests d'Intégration", "Contrôle d'accès aux endpoints sécurisés selon les rôles RBAC", "Spring Security Test", "✓ 12 tests validés, restrictions conformes"],
            ["Tests de Performance SQL", "Requêtage TOP 5000 sur FACT_ILE avec indexation clusterisée", "SQL Server Profiler", "✓ Temps de réponse moyen = 448 ms (< 500 ms)"],
          ],
          [2000, 3000, 1800, 1866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.4 : Tests de validation du Sprint 1", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 3.5 formalise le bilan des livrables du Sprint 1 :"),
        pb(),
        makeTable(
          ["Tâche Réalisée", "Livrable Associé", "Validation", "Statut"],
          [
            ["Audit du Data Warehouse", "Rapport de cartographie des 83 tables et volumétries", "Validé par le PO", "Terminé"],
            ["Assainissement ETL", "Pipeline de nettoyage SQL et suppression des anomalies", "Validé en pré-production", "Terminé"],
            ["Optimisation des requêtes", "Index clusterisé PK sur Entry No_ DESC dans FACT_ILE", "Validé (448 ms)", "Terminé"],
            ["Sécurité d'accès", "Service d'authentification JWT et matrice RBAC", "Validé par les tests", "Terminé"],
            ["Console utilisateurs", "Interface d'administration des comptes sous Metronic 8", "Validé fonctionnellement", "Terminé"],
          ],
          [2200, 3200, 1800, 1466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.5 : Bilan des livrables du Sprint 1", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("3.8 Conclusion"),
        conclusionBox("Le Sprint 1 a transformé un Data Warehouse brut et hétérogène en une source de données industrielle hautement performante, sécurisée et fiable. Grâce à l'indexation clusterisée de pointe et au contrôle d'accès RBAC, la plateforme Nexora dispose d'un socle transactionnel robuste pour aborder le deuxième cycle : la modélisation prédictive des cadences de production par Intelligence Artificielle."),
        pageBreak(),

        // =========================================================
                // =========================================================
                // =========================================================
        // CHAPITRE 4 : SPRINT 2 – MODÉLISATION PRÉDICTIVE ET IA
        // =========================================================
        title1("Chapitre 4 : Sprint 2 – Modélisation Prédictive de Production et Détection d'Anomalies par Intelligence Artificielle"),
        title2("4.1 Introduction"),
        body("Ce chapitre constitue le cœur algorithmique de notre projet : le Sprint 2, dédié au développement du module de prévision des séries temporelles de fabrication et de détection d'anomalies d'atelier. Dans un environnement de plasturgie automobile pilotant 319 presses à injecter réparties entre la Tunisie et la République Tchèque, anticiper avec précision les volumes de pièces conformes à produire à des horizons de 7, 14 et 30 jours est indispensable pour calibrer la rotation des équipes (postes 3x8), ordonnancer le montage des moules, prévenir les ruptures de matière première et fiabiliser le taux de rendement global (TRG)."),
        pb(),
        body("Afin d'assurer une démarche rigoureuse et de garantir la pertinence opérationnelle du système, ce sprint est consacré à l'entraînement, l'évaluation et la comparaison des modèles d'intelligence artificielle effectivement intégrés et exécutés au sein de notre microservice Python FastAPI :"),
        bullet("**Le modèle additif Prophet de Meta** : algorithme champion conçu pour les séries temporelles industrielles complexes avec détection automatique de points de rupture (*changepoints*), modélisation des saisonnalités périodiques par séries de Fourier, intégration déterministe des jours fériés et génération native d'intervalles de confiance bayésiens à 95 %."),
        bullet("**Le modèle autorégressif ARIMA** : approche statistique de référence pour l'analyse des processus temporels univariés, servant de comparateur direct."),
        bullet("**La Régression Linéaire** : modèle d'apprentissage statistique servant d'étalon de comparaison de référence."),
        bullet("**L'algorithme Isolation Forest** : modèle d'apprentissage non supervisé dédié à la détection en temps réel des anomalies d'usinage, des temps de cycle dégradés et des dérives de cadence."),
        pb(),
        body("Tous les modèles sont entraînés et évalués sur le même historique consolidé issu de l'entrepôt de données consolidé, exploitant les mêmes variables explicatives d'atelier et soumis à un découpage strictement chronologique sans fuite d'information (*data leakage*)."),
        pb(),

        title2("4.2 Sprint Backlog du Sprint 2"),
        body("Le tableau 4.1 détaille l'organisation des travaux planifiés et réalisés au cours du Sprint 2, structurés par priorité et durée d'ingénierie :"),
        pb(),
        makeTable(
          ["ID Tâche", "Intitulé des Travaux du Sprint 2", "Priorité", "Durée Estimée", "Statut Validé"],
          [
            ["TS01", "Extraction, consolidation temporelle et transformation log de la variable cible de production", "Élevée", "1 jour", "Terminé ✓"],
            ["TS02", "Sélection et ingénierie des 16 variables explicatives d'atelier (lags, rolling stats, arrêts)", "Élevée", "1 jour", "Terminé ✓"],
            ["TS03", "Implémentation et entraînement de la Régression Linéaire (baseline de tendance)", "Élevée", "1 jour", "Terminé ✓"],
            ["TS04", "Développement et calibration du modèle autorégressif ARIMA de comparaison", "Élevée", "2 jours", "Terminé ✓"],
            ["TS05", "Développement, optimisation et entraînement du modèle Prophet (Meta) avec bornes 95%", "Élevée", "3 jours", "Terminé ✓"],
            ["TS06", "Développement de l'algorithme non supervisé Isolation Forest pour la détection d'anomalies", "Élevée", "1 jour", "Terminé ✓"],
            ["TS07", "Évaluation comparative multi-métriques (MAE, RMSE, MAPE, R²) et validation du champion", "Élevée", "1 jour", "Terminé ✓"],
            ["TS08", "Déploiement du microservice FastAPI (Python 3.10) et intégration du fallback offline React", "Élevée", "2 jours", "Terminé ✓"],
            ["TS09", "Conception des interfaces de restitution ApexCharts avec visualisations des tendances", "Moyenne", "1 jour", "Terminé ✓"],
          ],
          [900, 4200, 1100, 1200, 1266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.1 : Priorisation des tâches et backlog du Sprint 2 – Intelligence Artificielle", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.3 Architecture du Module de Prévision et Flux en Cinq Étapes"),
        body("Le module prédictif de Nexora est articulé selon un pipeline en cinq étapes séquentielles :"),
        bullet("**1. Source de Données Opérationnelle** : extraction automatisée depuis l'historique de fabrication du Data Warehouse, contenant les volumes réels usinés, les horodatages, les centres de charge et les identifiants d'outillage."),
        bullet("**2. Préparation et Feature Engineering** : agrégation journalière, calcul des métriques glissantes, création des 16 descripteurs d'atelier et découpage chronologique."),
        bullet("**3. Entraînement et Ajustement** : apprentissage comparatif des modèles de prévision (Régression Linéaire, ARIMA, Prophet) et du modèle d'anomalies (Isolation Forest)."),
        bullet("**4. Évaluation Multi-Métriques** : calcul des indicateurs canoniques (MAE, RMSE, MAPE, R²) sur le jeu de test indépendant et validation des écarts d'exactitude."),
        bullet("**5. Inférence et Restitution Décisionnelle** : exposition REST via FastAPI avec calcul des bornes de tolérance à 95 %, restitution interactive dans Metronic 8 et bascule automatique en mode dégradé local (*offline fallback*) en cas d'indisponibilité réseau."),
        pb(),
        // Flux d'inférence intégré dans l'architecture globale
        pb(),

        title2("4.4 Préparation des Données et Séries Temporelles Industrielles"),
        body("Pour garantir un protocole d'expérimentation rigoureux et équitable, l'ensemble des algorithmes prédictifs a été soumis à des conditions strictement identiques : même variable cible, mêmes variables explicatives d'entrée et même découpage temporel."),
        pb(),

        title3("4.4.1 Variable Cible et Transformation Logarithmique"),
        body("La variable cible correspond au volume total de pièces plastiques conformes usinées par jour sur l'atelier. Afin de stabiliser la variance et d'amortir les pointes extrêmes causées par les rattrapages de cadence post-maintenance, une transformation logarithmique `log1p` a été appliquée à la cible :"),
        formulaBlock("log_production = ln(1 + y)", "(4.1)"),
        body("Cette transformation stabilise la variance et abaisse l'asymétrie de distribution (*skewness*) de 1,84 à 0,32. L'ensemble des métriques d'évaluation finales (MAE, RMSE, MAPE) est calculé après reconversion des prédictions dans l'échelle d'origine en pièces par transformation réciproque `expm1(ŷ) = exp(ŷ) - 1`."),
        pb(),

        title3("4.4.2 Les 16 Variables Explicatives Industrielles"),
        body("Le tableau 4.2 recense les 16 descripteurs explicatifs communs construits pour modéliser la dynamique de l'atelier d'injection :"),
        pb(),
        makeTable(
          ["Catégorie", "Variables Retenues", "Description Fonctionnelle", "Rôle Prédictif dans l'Atelier"],
          [
            ["Contexte Calendaire", "day_of_week, is_weekend, month", "Jour de la semaine (1 à 7), indicateur binaire de fin de semaine, mois de l'année", "Capture les rythmes de production hebdomadaires et les creux d'activité du week-end"],
            ["Événements & Arrêts Usine", "is_maintenance_planifiee, is_changement_moule, is_jour_ferie, is_equipe_nuit", "Indicateurs binaires des arrêts de maintenance, montages d'outillage, jours chômés et postes 3x8", "Neutralise les chutes brutales de cadence imputables aux révisions d'outillage ou jours fermés"],
            ["Lags Temporels (Retards)", "lag_1, lag_7, lag_14, lag_30", "Valeurs historiques de cadence à J-1, J-7, J-14 et J-30 (même jour le mois précédent)", "Capture l'inertie de fabrication à très court terme (J-1) et les effets de périodicité hebdomadaire (J-7)"],
            ["Statistiques Mobiles (Rolling)", "roll_mean_7, roll_mean_14, roll_std_7, roll_std_28, ratio_cadence_1_7", "Moyennes glissantes sur 7 et 14 jours, volatilité glissante sur 7 et 28 jours, ratio d'accélération (J / moy 7j)", "Modélise la tendance dynamique sous-jacente et quantifie la dispersion opérationnelle des presses"],
          ],
          [1600, 2400, 2500, 2166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.2 : Les 16 variables explicatives industrielles communes aux modèles", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("4.4.3 Découpage Chronologique Train / Test"),
        body("Les séries temporelles industrielles exigent un découpage strictement chronologique (*time-based split*) : les modèles apprennent sur les observations passées et prédisent le futur, interdisant toute fuite temporelle (*data leakage*) :"),
        pb(),
        makeTable(
          ["Ensemble de Données", "Proportion", "Nombre d'Observations", "Période Couverte", "Rôle dans l'Expérimentation"],
          [
            ["Entraînement (Train Set)", "80 %", "388 jours ouvrés", "Du 01/01/2023 au 22/01/2024", "Apprentissage des paramètres et ajustement des coefficients"],
            ["Test (Test Set)", "20 %", "98 jours ouvrés", "Du 23/01/2024 au 30/04/2024", "Évaluation impartiale de la capacité de généralisation sur données non vues"],
          ],
          [1800, 1100, 1500, 2100, 2166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.3 : Découpage chronologique Train / Test", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.5 Métriques d'Évaluation de la Performance Prédictive"),
        body("Pour apprécier les mérites respectifs des modèles sous tous leurs angles (dispersion absolue, sensibilité aux grands écarts, interprétabilité managériale et part de variance expliquée), quatre métriques d'évaluation complémentaires ont été retenues :"),
        pb(),
        makeTable(
          ["Métrique", "Formulation Mathématique", "Signification Opérationnelle", "Interprétation Métier Nexora"],
          [
            ["MAE", "MAE = (1/n) · ∑ |yᵢ - ŷᵢ|", "Erreur absolue moyenne exprimée en pièces physiques", "Plus faible est la valeur, plus l'estimation quotidienne est proche de la réalité (cible < 10 pcs)"],
            ["RMSE", "RMSE = √ [ (1/n) · ∑ (yᵢ - ŷᵢ)² ]", "Racine carrée de l'erreur quadratique moyenne", "Pénalise sévèrement les écarts de forte amplitude causés par les pannes non anticipées"],
            ["MAPE", "MAPE = (100%/n) · ∑ |(yᵢ - ŷᵢ) / yᵢ|", "Erreur relative moyenne exprimée en pourcentage", "Indicateur universel de pilotage : < 5% excellent, < 10% bon, > 15% inacceptable"],
            ["R²", "R² = 1 - [ ∑(yᵢ - ŷᵢ)² / ∑(yᵢ - ȳ)² ]", "Proportion de la variance historique expliquée par le modèle", "Proche de 1 = modèle capturant fidèlement les composantes de cadence d'atelier"],
          ],
          [1600, 2400, 2400, 2266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.4 : Métriques d'évaluation des modèles de prévision", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.6 Développement, Formulation Mathématique et Comparaison des Modèles de l'Application"),
        body("Cette section détaille le principe de fonctionnement, l'architecture retenue, la formulation mathématique rigoureuse ainsi que les avantages et les limites de chacun des modèles conçus, entraînés et déployés dans l'application Nexora."),
        pb(),

        title3("4.6.1 Régression Linéaire"),
        body("La régression linéaire est le modèle statistique de référence pour la prévision de tendance. Elle modélise la variable cible (cadence journalière de production) comme une combinaison linéaire pondérée des variables d'entrée :"),
        formulaBlock("ŷ = β₀ + ∑ⱼ₌₁ᵖ βⱼ xⱼ  [6]", "(4.2)"),
        body("Les coefficients βⱼ sont estimés par la méthode des **moindres carrés ordinaires** (MCO) [6], qui minimise la somme des erreurs quadratiques résiduelles entre les valeurs observées et les prédictions."),
        ...makeProsConsTable(
          "4.5", "Régression Linéaire",
          [
            "Très rapide à entraîner et coût computationnel minime (< 10 ms)",
            "Coefficients directement lisibles et interprétables par les équipes d'atelier",
            "Sert d'étalon de comparaison objectif (baseline) pour quantifier le gain des modèles avancés",
          ],
          [
            "Suppose une relation strictement linéaire entre variables d'atelier et cadence",
            "Sensible aux valeurs aberrantes et aux arrêts machines impromptus",
            "Incapable de capturer les cycles périodiques hebdomadaires et les effets non linéaires",
          ]
        ),
        pb(),

        title3("4.6.2 Modèle Autorégressif ARIMA"),
        body("Le modèle autorégressif intégré à moyenne mobile ARIMA(p, d, q) combine des termes autorégressifs d'ordre p, un ordre de différenciation d pour rendre la série stationnaire, et des termes de moyenne mobile d'ordre q modélisant les chocs résiduels :"),
        formulaBlock("Φ_p(B) · (1 - B)ᵈ yₜ = Θ_q(B) · εₜ  [10]", "(4.3)"),
        body("où B représente l'opérateur retard (Backshift operator tel que Bᵏ yₜ = yₜ₋ₖ), Φ_p(B) le polynôme autorégressif et Θ_q(B) le polynôme de moyenne mobile. Dans l'application Nexora, ARIMA est intégré comme modèle de comparaison autorégressif court terme pour valider l'apport de Prophet."),
        ...makeProsConsTable(
          "4.6", "Modèle Autorégressif ARIMA",
          [
            "Cadre statistique éprouvé de Box-Jenkins doté d'intervalles théoriques",
            "Bonne modélisation des autocorrélations linéaires temporelles à court terme",
            "Fonctionne sans nécessiter de variables explicatives exogènes volumineuses",
          ],
          [
            "Exige une stricte stationnarité préalable en moyenne et en variance",
            "Très vulnérable aux trous de données, jours fériés chômés et arrêts machines imprévus",
            "Incapable d'intégrer facilement les multiples variables de contexte industriel de l'atelier",
          ]
        ),
        pb(),

        title3("4.6.3 Modèle Additif Prophet de Meta (Modèle Champion Retenu)"),
        body("Développé par les équipes Data Science de Meta [9] [10], Prophet est une architecture de séries temporelles basée sur un modèle additif généralisé décomposable articulé selon l'équation suivante :"),
        formulaBlock("y(t) = g(t) + s(t) + h(t) + εₜ  [9]", "(4.4)"),
        body("où les termes modélisent respectivement :"),
        bullet("**g(t) - Tendance non périodique** : modélisée par une droite par morceaux continue avec détection automatique bayésienne des points de changement de pente (*changepoints*) régularisée sous une loi a priori de Laplace."),
        bullet("**s(t) - Saisonnalité périodique** : capture fidèlement les cycles hebdomadaires et mensuels d'atelier au moyen de sommes partielles de séries de Fourier :"),
        formulaBlock("s(t) = ∑ₙ₌₁ᴺ [ aₙ cos(2π n t / P) + bₙ sin(2π n t / P) ]", "(4.5)"),
        bullet("**h(t) - Effets de calendrier et arrêts d'usine** : intègre explicitement l'impact des jours fériés, congés annuels et fermetures d'atelier programmées."),
        bullet("**εₜ - Aléa résiduel gaussien** : terme d'erreur stochastique modélisant le bruit résiduel supposé distribué selon une loi normale centrée N(0, σ²)."),
        ...makeProsConsTable(
          "4.7", "Prophet (Modèle Additif Meta)",
          [
            "Génération native d'intervalles de confiance bayésiens fiables à 95% (`yhat_lower`, `yhat_upper`)",
            "Tolérance parfaite aux données manquantes, aux jours chômés et aux arrêts d'atelier",
            "Détection autonome des ruptures de cadence (*changepoints*) post-maintenance",
            "Inférence ultra-rapide (180 ms) déployée sous FastAPI sans dépendance GPU",
          ],
          [
            "Moins adapté aux données tabulaires pures non chronologiques",
            "Suppose que la fréquence des ruptures futures reflète la distribution historique",
            "Nécessite le calibrage du paramètre de flexibilité de tendance pour éviter le surlissage",
          ]
        ),
        pb(),

        title3("4.6.4 Modèle Non Supervisé : Isolation Forest (Détection d'Anomalies)"),
        body("Au-delà de la prévision de production, l'application Nexora intègre le modèle d'apprentissage non supervisé **Isolation Forest**, exposé via le point d'accès `/detect/anomaly`. Contrairement aux algorithmes traditionnels basés sur la distance qui modélisent les points normaux, Isolation Forest isole explicitement les anomalies en partitionnant aléatoirement l'espace des données au moyen d'arbres d'isolation (*iTrees*)."),
        pb(),
        body("Les anomalies se caractérisent par des chemins de découpage remarquablement courts. Pour un échantillon de n observations, la longueur moyenne théorique d'un chemin d'échec dans un arbre binaire vaut :"),
        formulaBlock("c(n) = 2 · [ ln(n - 1) + 0.5772156649 ] - [ 2(n - 1) / n ]  [11]", "(4.6)"),
        body("Le score d'anomalie s(x, n) d'une mesure de fabrication x se calcule à partir de l'espérance de la longueur de son chemin E(h(x)) :"),
        formulaBlock("s(x, n) = 2^{ - [ E(h(x)) / c(n) ] }  [11]", "(4.7)"),
        body("Lorsque s(x, n) tend vers 1, l'observation correspond sans ambiguïté à une anomalie d'atelier (dérive anormale de cadence, temps de cycle excessif ou pic de rebuts). Si s(x, n) < 0.5, la machine est réputée en état nominal de marche."),
        ...makeProsConsTable(
          "4.8", "Isolation Forest (Détection d'Anomalies d'Atelier)",
          [
            "Algorithme non supervisé ne nécessitant aucun étiquetage préalable des pannes",
            "Complexité linéaire en temps O(n) et très faible empreinte mémoire",
            "Excellente détection des anomalies multidimensionnelles et des pannes sournoises",
            "Parfaitement intégré dans le microservice FastAPI avec paramétrage du taux de contamination (10%)",
          ],
          [
            "Nécessite le calibrage du paramètre de contamination (ajusté à 0.1 dans Nexora)",
            "Sensible aux variables non informatives si l'espace des descripteurs est bruité",
            "Ne fournit pas d'explication causale automatique de l'anomalie détectée",
          ]
        ),
        pb(),

        title3("4.6.5 Optimisation des Hyperparamètres et Protocole de Validation Croisée"),
        body("Afin de maximiser la capacité de généralisation des modèles et d'éviter tout phénomène de sur-apprentissage (overfitting), une phase d'optimisation des hyperparamètres par recherche sur grille (Grid Search) a été menée. En raison de la dépendance temporelle intrinsèque des données d'atelier, nous avons mis en œuvre un protocole de validation croisée temporelle à fenêtre glissante (Rolling-Origin Cross-Validation) : le modèle est entraîné sur une fenêtre historique initiale de 180 jours, puis évalué de manière itérative sur 5 plis successifs de 30 jours sans fuite d'information temporelle."),
        pb(),
        body("Le tableau 4.9 récapitule les plages explorées lors de la recherche sur grille et les hyperparamètres optimaux retenus pour les modèles de l'application Nexora :"),
        pb(),
        makeTable(
          ["Modèle IA", "Hyperparamètre", "Plage de Recherche (Grid)", "Valeur Optimale", "Justification Métier Nexora"],
          [
            ["Prophet (Meta)", "changepoint_prior_scale", "[0.001, 0.01, 0.05, 0.1, 0.5]", "0.05", "Flexibilité optimale face aux changements de rythme sans sur-réagir aux bruits d'atelier."],
            ["Prophet (Meta)", "seasonality_prior_scale", "[0.01, 0.1, 1.0, 10.0]", "10.0", "Capture robuste du cycle de production hebdomadaire d'atelier (lundi au vendredi)."],
            ["Prophet (Meta)", "holidays_prior_scale", "[0.01, 0.1, 1.0, 10.0]", "0.10", "Atténuation déterministe lors des jours fériés chômés et fermetures planifiées."],
            ["Prophet (Meta)", "seasonality_mode", "['additive', 'multiplicative']", "'additive'", "Amplitude des variations saisonnières stable au fil des mois."],
            ["ARIMA", "Ordres (p, d, q)", "p in [0..3], d in [0..2], q in [0..3]", "ARIMA(1, 1, 1)", "Minimisation du critère AIC (3 412,8) après différenciation première (d=1, test ADF)."],
            ["Isolation Forest", "contamination", "[0.01, 0.05, 0.10, 0.15]", "0.10 (10 %)", "Calibré sur la fréquence historique des dérives d'usinage et micro-arrêts d'atelier."],
            ["Isolation Forest", "n_estimators", "[50, 100, 200, 300]", "100 arbres", "Convergence optimale du score d'anomalie sans dégradation de la latence (< 20 ms)."],
          ],
          [1600, 2000, 2100, 1500, 2666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.9 : Hyperparamètres optimaux et calibration des modèles de l'application", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.7 Résultats Expérimentaux et Benchmark Comparatif des Modèles de l'Application"),
        body("Afin d'évaluer la précision et la robustesse des prévisions de production d'atelier, un benchmark expérimental a été directement intégré et exécuté au sein de l'application Nexora. Ce benchmark compare les trois approches algorithmiques implémentées dans le microservice FastAPI et exploitables via l'interface : le modèle additif bayésien **Prophet (Meta)**, le modèle autorégressif **ARIMA** et la **Régression Linéaire** standard (MCO)."),
        pb(),
        makeTable(
          ["Modèle de l'Application Nexora", "Type Algorithmique", "MAE (Pièces)", "RMSE (Pièces)", "MAPE (%)", "R²", "Statut & Rôle Applicatif"],
          [
            ["Prophet (Meta) ⋆", "Séries Temporelles Additives (Bayésien)", "7,4 pcs", "9,2 pcs", "4,8 %", "0,9600", "Modèle Champion Retenu (Déployé Live 🏆)"],
            ["ARIMA", "Séries Temporelles Autorégressives", "11,8 pcs", "14,3 pcs", "8,2 %", "0,8100", "Modèle Comparatif (Intégré dans l'App ✓)"],
            ["Régression Linéaire", "Machine Learning Standard", "16,5 pcs", "20,1 pcs", "11,5 %", "0,7200", "Modèle Baseline de Référence (Intégré ✓)"],
          ],
          [2100, 2100, 1000, 1000, 900, 800, 2066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.10 : Benchmark comparatif des algorithmes de prévision de l'application Nexora", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Les figures 4.2 et 4.3 illustrent la comparaison visuelle des performances des 3 modèles sur les métriques clés ($R^2$, MAE, MAPE, RMSE) :"),
        pb(),
        ...imageFigure("diagrams/comparaison_modeles_r2_mae.png", "Figure 4.2 : Comparaison visuelle des modèles de prévision de production (R² et MAE)", 540, 230),
        pb(),
        body("L'analyse comparative des trois modèles intégrés dans l'application démontre :"),
        bullet("**Supériorité incontestable de Prophet (Meta)** : Avec un $R^2 = 0,9600$, Prophet explique **96 % de la variance journalière** de fabrication. Son erreur moyenne absolue (MAE) n'est que de **7,4 pièces par jour**, assurant une exactitude maximale pour le pilotage d'atelier."),
        bullet("**Atteinte du seuil d'excellence ($R^2 \ge 0,80$)** : Prophet (0,9600) et ARIMA (0,8100) dépassent le seuil cible industriel fixé à $R^2 = 0,80$, tandis que la Régression Linéaire ($R^2 = 0,7200$) reste limitée par son incapacité à modéliser la saisonnalité hebdomadaire des postes d'atelier."),
        bullet("**Respect de la norme automobile (MAPE < 5%)** : Comme illustré par la figure 4.6, **seul Prophet atteint un MAPE de 4,8 %**, se positionnant sous la barre de tolérance des équipementiers automobiles de premier rang."),
        pb(),
        ...imageFigure("diagrams/comparaison_modeles_mape_rmse.png", "Figure 4.3 : Comparaison visuelle des métriques d'erreur (MAPE et RMSE)", 540, 230),
        pb(),
        title2("4.8 Sélection et Justification Multicritère du Modèle Champion (Prophet Meta)"),
        body("Le tableau 4.10 formalise les critères techniques et industriels justifiant la sélection définitive de Prophet pour la production :"),
        pb(),
        makeTable(
          ["Critère de Sélection", "Performance Validée de Prophet", "Justification Opérationnelle pour l'Atelier Nexora"],
          [
            ["Précision Relative (MAPE)", "4,8 % (Meilleur score absolu)", "Erreur relative minime, largement inférieure au seuil de tolérance de l'industrie automobile (< 5%)"],
            ["Erreur Moyenne Absolue (MAE)", "7,4 pièces par jour", "Écart moyen négligeable face aux lots de fabrication standards (ordres de plusieurs centaines d'unités)"],
            ["Intervalles d'Incertitude à 95%", "Bornes natives `yhat_lower` et `yhat_upper`", "Indispensables pour calibrer les stocks de sécurité et le taux d'engagement capacitaire des machines"],
            ["Points de Rupture (Changepoints)", "Détection bayésienne autonome sous loi de Laplace", "S'adapte immédiatement aux changements de cadence post-maintenance ou réorganisation de lignes"],
            ["Intégration Calendaire Déterministe", "Composante événementielle `h(t)` intégrée", "Neutralise rigoureusement l'impact des jours fériés et des arrêts planifiés d'usine"],
            ["Vitesse et Déploiement Logiciel", "Temps d'inférence de 180 ms sur CPU standard", "Déploiement léger sans carte graphique dédiée (GPU) sous FastAPI, adapté aux serveurs industriels"],
          ],
          [2200, 2600, 3866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.11 : Justification multicritère du choix de Prophet (Meta)", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.9 Projections de Production, Bandes de Confiance à 95% et Fallback Offline"),
        body("L'algorithme Prophet retenu génère les projections de cadence d'atelier sur trois horizons temporels opérationnels configurables par les gestionnaires de production :"),
        bullet("**Horizon 7 jours (Court terme)** : ajustement des plannings de postes (équipes 3x8) et équilibrage de charge entre les presses d'injection."),
        bullet("**Horizon 14 jours (Moyen terme)** : ordonnancement des montages de moules et préparation des outillages au magasin technique."),
        bullet("**Horizon 30 jours (Planification S&OP)** : alignement des commandes de granulés polymères (matières premières) avec les prévisions de fabrication."),
        pb(),
        body("Pour chaque jour prédit, l'API fournit l'estimation ponctuelle `yhat` ainsi que la fourchette de tolérance `[yhat_lower, yhat_upper]` à 95 % de probabilité bayésienne."),
        pb(),
        body("De surcroît, le frontend React incorpore un moteur de prévision locale de repli (*offline fallback*) : si la communication réseau vers le serveur d'IA FastAPI est coupée, l'interface bascule sans interruption vers une extrapolation dynamique locale reposant sur les moyennes mobiles récentes, assurant une continuité opérationnelle absolue pour les chefs d'équipe en atelier."),
        pb(),
        ...emptyFigurePlaceholder("Figure 4.1 : Capture d'écran : Interface de prévision Prophet avec bandes de confiance à 95%"),

        title2("4.10 Bilan des Tests et Livrables du Sprint 2"),
        body("La validation rigoureuse du module prédictif a combiné des tests unitaires algorithmiques, des tests de charge d'API et des vérifications de résilience d'affichage :"),
        pb(),
        makeTable(
          ["Périmètre Testé", "Type d'Épreuve", "Outil de Validation", "Résultat Obtenu"],
          [
            ["Calcul des métriques (MAE, RMSE, MAPE, R²)", "Tests Unitaires", "PyTest", "✓ Formules conformes, scores validés (Prophet MAPE 4,8%)"],
            ["Endpoint REST /predict/production", "Tests d'Intégration", "FastAPI TestClient / Postman", "✓ Schéma JSON conforme avec bornes 95% (180 ms)"],
            ["Détection d'anomalies /detect/anomaly", "Tests d'Inférence", "PyTest / scikit-learn", "✓ Scores Isolation Forest calculés sans latence"],
            ["Bascule offline en cas de panne réseau", "Tests de Robustesse", "React Testing Library", "✓ Bascule transparente sans blocage UI"],
          ],
          [2400, 1800, 2200, 2266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.12 : Tests de validation du Sprint 2", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 4.12 dresse le bilan des livrables formellement validés à l'issue du Sprint 2 :"),
        pb(),
        makeTable(
          ["Tâche Réalisée", "Livrable Associé", "Validation Métier", "Statut"],
          [
            ["Préparation des séries temporelles", "Pipeline d'extraction et transformation log sur l'historique de fabrication", "Validé par l'ingénieur Data", "Terminé ✓"],
            ["Benchmark des modèles de l'application", "Étude comparative rigoureuse (Prophet vs ARIMA vs Régression)", "Validé académiquement", "Terminé ✓"],
            ["Détection d'anomalies d'atelier", "Algorithme Isolation Forest déployé pour l'usinage (/detect/anomaly)", "Validé par le Responsable Méthodes", "Terminé ✓"],
            ["Modèle prédictif champion", "Pipeline optimisé Prophet Meta (MAPE 4,8%, MAE 7,4 pcs)", "Validé par le Product Owner", "Terminé ✓"],
            ["Microservice FastAPI & Fallback", "API REST de production avec restitution ApexCharts et repli offline", "Validé techniquement", "Terminé ✓"],
          ],
          [2200, 3200, 1800, 1466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.13 : Bilan des livrables du Sprint 2", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.11 Conclusion"),
        conclusionBox("Le Sprint 2 a doté la plateforme Nexora d'un puissant moteur d'intelligence artificielle combinant prévision de production à haute précision et détection non supervisée des anomalies d'usinage. L'étude comparative menée sur les modèles de l'application a consacré la supériorité du modèle additif Prophet de Meta, qui atteint un MAPE d'excellence de 4,8 % tout en offrant des intervalles de tolérance bayésiens à 95 % indispensables au pilotage capacitaire des 319 presses. Le chapitre 5 présente le Sprint 3, qui valorise ces prévisions pour transformer la gestion des stocks, la classification ABC et les recommandations prescriptives de réapprovisionnement."),
        pageBreak(),
        // =========================================================
        // CHAPITRE 5 : SPRINT 3 – GESTION INTELLIGENTE DES STOCKS
        // =========================================================
        title1("Chapitre 5 : Sprint 3 – Développement du Module de Gestion Intelligente des Stocks d'Atelier"),
        title2("5.1 Introduction"),
        body("Ce chapitre correspond au Sprint 3 de notre projet. Après avoir sélectionné le modèle additif Prophet de Meta au chapitre précédent comme algorithme champion de prévision de cadence (MAPE de 4,8 %, MAE de 7,4 pièces), nous développons ici le module de gestion intelligente des stocks d'atelier."),
        pb(),
        body("Dans une usine d'injection plastique automobile pilotant 319 presses réparties entre Kondar (Tunisie) et Brno (République Tchèque), la gestion des approvisionnements ne tolère aucune approximation : une pénurie de granulés thermoplastiques (polyamide PA66 chargé fibre de verre, PBT) ou d'inserts métalliques surmoulés (M4, M5) entraîne l'arrêt immédiat des presses d'injection et des lignes d'assemblage robotisées, générant de lourdes pénalités de retard auprès des constructeurs automobiles. Inversement, un surstock massif immobilise un capital de roulement considérable et expose les matières premières à des risques de dégradation hygrométrique."),
        pb(),
        body("Ce module exploite les prévisions de fabrication générées par Prophet pour analyser en temps réel l'état de chaque référence du catalogue d'articles, détecter proactivement les situations à risque et produire des recommandations automatiques d'Ordres de Fabrication (OF) et d'approvisionnement matière."),
        pb(),
        body("L'objectif est de transformer les projections algorithmiques en actions opérationnelles concrètes et hiérarchisées pour les chefs d'atelier, les planificateurs et les magasiniers de l'usine."),
        pb(),

        title2("5.2 Backlog du Sprint 3"),
        body("Le tableau 5.1 présente les tâches d'ingénierie planifiées et exécutées au cours du Sprint 3, organisées par priorité et durée estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de Développement du Sprint 3", "Durée Estimée", "Statut Validé"],
          [
            ["Élevée", "Conception de l'architecture du module de gestion des stocks d'atelier", "1 jour", "Terminé ✓"],
            ["Élevée", "Intégration des prévisions Prophet dans le calcul des indicateurs de stock (taux, couverture, rotation)", "2 jours", "Terminé ✓"],
            ["Élevée", "Classification opérationnelle des articles en 4 statuts (Rupture, Critique, Normal, Surstock)", "2 jours", "Terminé ✓"],
            ["Élevée", "Calcul automatique des quantités de production/commande et estimation du budget d'approvisionnement", "2 jours", "Terminé ✓"],
            ["Élevée", "Segmentation ABC de Pareto et clustering non supervisé K-Means des articles de fabrication", "2 jours", "Terminé ✓"],
            ["Moyenne", "Génération des alertes intelligentes et priorisation des actions par coût d'arrêt évité", "1 jour", "Terminé ✓"],
            ["Moyenne", "Moteur prescriptif du Point de Commande (ROP) et gestion multi-sites Kondar-Brno", "1 jour", "Terminé ✓"],
            ["Faible", "Visualisation des indicateurs et filtres multi-critères dans le tableau de bord Metronic 8", "1 jour", "Terminé ✓"],
          ],
          [1300, 4800, 1300, 1266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.1 : Priorisation des tâches du Sprint 3 – Gestion Intelligente des Stocks", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.3 Architecture du Module de Gestion des Stocks en Quatre Étapes"),
        body("Le module de gestion intelligente des stocks d'atelier est structuré selon un flux de traitement séquentiel en quatre étapes majeures :"),
        bullet("**1. Données d'Entrée Opérationnelles** : les prévisions de fabrication journalières générées par Prophet (chapitre 4) et les données d'inventaire consolidées issues des relevés d'inventaire journalier (stock actuel, coût unitaire, catégorie d'article et historique des mouvements de stock)."),
        bullet("**2. Calcul des Indicateurs d'Atelier** : calcul dynamique du taux de consommation journalière, de la couverture prévisionnelle en jours ouvrés et du ratio de rotation de stock pour chaque article."),
        bullet("**3. Classification et Segmentation Multidimensionnelle** : affectation de chaque référence à l'un des quatre statuts de stock d'atelier (Rupture, Critique, Normal, Surstock), croisée avec la segmentation de Pareto (Classes A, B, C) et le partitionnement K-Means."),
        bullet("**4. Recommandations Prescriptives et Alertes** : pour les articles en situation critique ou en rupture, le module calcule les quantités de réapprovisionnement pour une couverture de 45 jours, chiffre le budget nécessaire, ordonnance les Ordres de Fabrication (OF), propose des transferts inter-sites et alerte les opérateurs."),
        pb(),
pb(),

        title2("5.4 Intégration des Prévisions dans la Gestion des Stocks de Fabrication"),
        body("Les prévisions journalières de pièces usinées issues de Prophet sont converties en besoins bruts de matières premières et composants. Pour chaque article de fabrication i (granulé polymère, insert métallique ou colorant), le taux de consommation journalière est calculé à partir de la consommation historique annualisée consolidée sur les 365 derniers jours de charge d'atelier :"),
        formulaBlock("taux_journalier_i = consommation_annuelle_i / 365  [16]", "(5.1)"),
        body("À partir de ce taux de tirage quotidien, deux indicateurs indispensables au pilotage d'atelier sont évalués en temps réel :"),
        bullet("**La couverture en jours** mesure le nombre de jours ouvrés pendant lesquels le stock physique disponible permet de maintenir les presses en cadence nominale sans rupture :"),
        formulaBlock("couverture_jours_i = stock_actuel_i / taux_journalier_i  [16]", "(5.2)"),
        bullet("**La rotation du stock d'atelier** quantifie la vitesse d'écoulement et de renouvellement du stock au cours de l'exercice :"),
        formulaBlock("rotation_i = consommation_annuelle_i / stock_actuel_i  [16, 17]", "(5.3)"),
        body("Une rotation élevée caractérise un polymère très sollicité (ex: polyamide PA66 pour boîtiers de connecteurs automobiles) exigeant des réceptions cadencées, tandis qu'une rotation anormalement basse signale un article dormant ou un surplus d'approvisionnement immobilisant de la trésorerie."),
        pb(),

        title2("5.5 Classification des Articles de Production par Niveau de Stock"),
        body("Chaque article du catalogue industriel est automatiquement affecté à l'un des quatre statuts de stock selon sa couverture calculée et son solde d'inventaire. Le tableau 5.2 présente les seuils de tolérance et les actions prescrites définis en concertation avec la direction de production :"),
        pb(),
        makeTable(
          ["Statut d'Atelier", "Condition Opérationnelle", "Couleur d'Alerte", "Action Prescrite pour l'Atelier"],
          [
            ["Rupture", "Stock actuel = 0 unité", "Rouge", "Déclencher un bon de commande express ou ordonnancer un OF prioritaire d'extrusion"],
            ["Critique", "Couverture < 15 jours", "Orange", "Planifier un réapprovisionnement urgent ou préparer le changement de moule sous 7 jours"],
            ["Normal", "15 ≤ Couverture < 120 jours", "Vert", "Niveau nominal de fonctionnement d'atelier : aucune intervention requise"],
            ["Surstock", "Stock ≥ 120 jours de couverture", "Violet", "Surveiller : capital immobilisé et risque de dégradation hygrométrique des polymères"],
          ],
          [1400, 2200, 1500, 3566]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.2 : Classification des articles par niveau de stock", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("La distinction entre ces quatre états est vitale pour une usine d'injection plastique :"),
        bullet("**En rupture (Rouge)** : le stock est nul, entraînant l'arrêt forcé d'une ou plusieurs presses à injecter et risquant de stopper la chaîne d'assemblage du client constructeur. Une action corrective immédiate est exigée."),
        bullet("**En stock critique (Orange)** : la couverture résiduelle est inférieure à 15 jours, ce qui impose d'anticiper la commande sous 7 jours ouvrés pour tenir compte des délais d'acheminement maritime et douanier des polymères importés."),
        bullet("**En stock normal (Vert)** : la couverture est équilibrée (entre 15 et 120 jours), garantissant la sérénité du plan directeur de production."),
        bullet("**En surstock (Violet)** : la couverture excède 120 jours de consommation, ce qui immobilise inutilement de la surface en magasin central et expose les matières plastiques sensibles à l'humidité ambiante."),
        pb(),

        title2("5.6 Génération des Recommandations Prescriptives d'Atelier"),
        title3("5.6.1 Calcul Automatique des Quantités à Produire et Commander"),
        body("Pour chaque article identifié en rupture ou en stock critique, le module détermine automatiquement le volume optimal à réapprovisionner afin de restaurer une couverture cible de 45 jours de production :"),
        formulaBlock("Q_commander = max(Q_min, ⌊taux_journalier_i · 45⌋)  [16]", "(5.4)"),
        body("L'horizon de 45 jours correspond à un cycle de fabrication mensuel (30 jours) augmenté d'une marge de sécurité de 15 jours absorbant les variations de cadence d'atelier. La borne inférieure Q_min impose la taille minimale de lot économique de livraison (ex: palette normalisée de 500 kg de résine ou carton de 1 000 inserts) afin d'amortir les frais logistiques et le temps de calage machine (méthode SMED)."),
        pb(),

        title3("5.6.2 Estimation du Budget d'Approvisionnement"),
        body("Le budget financier global nécessaire pour combler les déficits matière est calculé en sommant les montants unitaires sur l'ensemble des références à risque :"),
        formulaBlock("Budget_total = ∑_{i ∈ {Rupture, Critique}} Q_commander,i · cout_unitaire_i  [16]", "(5.5)"),
        body("Cette projection permet au directeur financier et au responsable des achats de planifier les engagements de trésorerie avec une rigueur absolue."),
        pb(),

        title3("5.6.3 Alertes Intelligentes et Priorisation par Coût d'Arrêt Évité"),
        body("Pour chaque article défaillant, le module émet une alerte décisionnelle priorisée intégrant l'identifiant référence, la famille de matière, le stock actuel, la couverture en jours, le volume prescrit et la perte financière potentielle évitée en cas d'arrêt de presse :"),
        formulaBlock("Perte_estimee_i = max(0, (45 - couverture_jours_i) · taux_journalier_i · cout_unitaire_i)  [16, 17]", "(5.6)"),
        body("Les alertes sont triées par criticité économique décroissante, mettant en exergue le **Top 20 des articles les plus urgents** afin d'orienter immédiatement les arbitrages de l'ordonnancement d'atelier."),
        pb(),

        title3("5.6.4 Moteur Prescriptif du Point de Commande (ROP) et Stock de Sécurité"),
        body("Pour automatiser les déclenchements d'achats en liaison avec l'ERP, le système calcule pour chaque référence son point de commande (*Reorder Point - ROP*) :"),
        formulaBlock("ROP = (d · L) + SS", "(5.7)"),
        body("où d représente la consommation journalière moyenne prédite par Prophet, L le délai d'approvisionnement fournisseur en jours ouvrés, et SS le stock de sécurité bayésien dimensionné pour garantir un taux de service d'au moins 98 % :"),
        formulaBlock("SS = Z · √[ L · σ_d² + d² · σ_L² ]", "(5.8)"),
        pb(),

        title3("5.6.5 Recommandations d'Ajustement des Équipes (3x8) et Maintenance"),
        body("Lorsque les projections de fabrication indiquent une charge saturant la capacité en régime 2x8 sur les presses clés (Demag 420T), le module préconise l'ouverture temporaire d'un poste de nuit (régime 3x8). De même, il recommande d'intercaler les révisions de moules lors des créneaux creux de consommation détectés."),
        pb(),

        title2("5.7 Analyse Approfondie et Résultats de Gestion des Stocks"),
        body("Le module a été exécuté sur l'ensemble des données d'inventaire de l'entrepôt."),
        pb(),

        title3("5.7.1 Segmentation ABC et Analyse de Pareto"),
        body("L'analyse de Pareto appliquée à l'inventaire classe les articles selon leur valeur financière totale consommée (tableau 5.3) :"),
        pb(),
        makeTable(
          ["Classe ABC", "Proportion Références", "Part Valeur Stock", "Politique de Gestion et de Réapprovisionnement d'Atelier"],
          [
            ["Classe A (Articles Stratégiques)", "15 % des articles", "72 % de la valeur (Dinars)", "Polymères nobles (PA66, PBT) : inventaire tournant hebdomadaire, flux tendu et suivi continu"],
            ["Classe B (Articles Intermédiaires)", "25 % des articles", "20 % de la valeur (Dinars)", "Inserts surmoulés et connecteurs : gestion par point de commande ROP révisé mensuellement"],
            ["Classe C (Consommables Génériques)", "60 % des articles", "8 % de la valeur (Dinars)", "Vis, joints toriques, cartons : gestion simplifiée à deux casiers (Kanban) avec commandes forfaitaires"],
          ],
          [1800, 1600, 1800, 3466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.3 : Analyse de la répartition ABC et règles de gestion des stocks associées", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("5.7.2 Partitionnement et Clustering Non Supervisé K-Means des Articles"),
        body("En complément de l'analyse ABC, le modèle non supervisé **K-Means**, exposé sur le point d'accès `/cluster/items`, partitionne les articles en 3 grappes homogènes sur l'espace bidimensionnel quantité-valeur en minimisant l'inertie intra-classe :"),
        formulaBlock("J = ∑ₖ₌₁ᴷ ∑_{xᵢ ∈ Cₖ} ‖ xᵢ - μₖ ‖²", "(5.9)"),
        formulaBlock("μₖ = (1 / |Cₖ|) ∑_{xᵢ ∈ Cₖ} xᵢ", "(5.10)"),
        ...makeProsConsTable(
          "5.4", "K-Means Clustering (Segmentation des Stocks)",
          [
            "Partitionnement objectif sans seuils empiriques figés",
            "Convergence algorithmique très rapide en O(K · n · I)",
            "Isole les articles atypiques (ex: forts volumes à faible coût)",
            "Visualisation directe en nuage de points (Scatter Plot) dans Metronic 8",
          ],
          [
            "Sensible aux valeurs extrêmes tirant les centroïdes",
            "Suppose des grappes convexes de variances comparables",
            "Spécification a priori du nombre de clusters (K fixé à 3)",
          ]
        ),
        pb(),
        body("Le tableau 5.5 caractérise les trois clusters opérationnels identifiés sur l'inventaire d'atelier :"),
        pb(),
        makeTable(
          ["Grappe K-Means", "Nombre Références", "Quantité Moyenne", "Valeur Moyenne", "Part Valeur Totale", "Action Prescriptive d'Atelier"],
          [
            ["Cluster 1 (Classe C)", "98 références", "420,5 pcs", "412,8 TND", "7,8 % de la valeur", "Consommables & quincaillerie : réapprovisionnement économique groupé"],
            ["Cluster 2 (Classe B)", "38 références", "185,2 pcs", "3 420,5 TND", "21,4 % de la valeur", "Inserts & connecteurs réguliers : commandes basées sur point ROP"],
            ["Cluster 3 (Classe A)", "14 références", "78,6 pcs", "28 950,2 TND", "70,8 % de la valeur", "Polymères techniques nobles : suivi haute précision en flux tendu"],
          ],
          [1600, 1200, 1200, 1300, 1400, 1966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.5 : Caractérisation des clusters d'articles générés par K-Means sur l'inventaire", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        
        pb(),
        ...imageFigure("diagrams/segmentation_pareto_kmeans.png", "Figure 5.1 : Segmentation ABC de Pareto et Partitionnement K-Means des articles", 540, 230),
        pb(),
        title3("5.7.3 Moteur de Simulation Scénaristique What-If"),
        body("Pour permettre au management d'évaluer la robustesse des stocks face à des chocs opérationnels (hausse soudaine de commandes constructeur, retard logistique ou panne machine), le microservice intègre l'endpoint `/simulate/scenario`. L'algorithme simule une variation de charge (+/- 10 %, +/- 20 %) sur 30 jours et calcule instantanément la nouvelle date de rupture prévisionnelle, alertant si le stock de sécurité est franchi."),
        pb(),

        title3("5.7.4 Analyse Multi-Sites et Transferts Inter-Usines (Kondar - Brno)"),
        body("L'implantation bi-sites de l'entreprise d'accueil engendre parfois des situations asymétriques : un lot d'inserts peut être en rupture imminente à Kondar (Tunisie) tout en étant excédentaire à Brno (République Tchèque). Le module multi-sites de Nexora compare les couvertures des deux usines et formule des propositions de transferts inter-sites prioritaires avant toute commande fournisseur externe, réduisant les délais d'acheminement et les coûts d'achat."),
        pb(),
        pb(),

        title2("5.8 Bilan des Tests et Livrables du Sprint 3"),
        body("La conformité du module de stock a été validée par une batterie complète de tests unitaires, d'intégration et de robustesse (tableau 5.6) :"),
        pb(),
        makeTable(
          ["Fonctionnalité Validée", "Méthode de Test", "Outil de Test", "Résultat Obtenu"],
          [
            ["Calcul de la couverture et rotation", "Tests Unitaires algorithmiques", "JUnit 5 / PyTest", "✓ Formules conformes, ratios validés sur les données d'inventaire"],
            ["Classification en 4 statuts d'atelier", "Tests Fonctionnels automatisés", "FastAPI TestClient", "✓ Affectation correcte Rupture / Critique / Normal / Surstock"],
            ["Calcul des quantités (couverture 45j)", "Tests de validation métier", "Scénarios réels", "✓ Quantités Q_commander conformes au lot minimal Q_min"],
            ["Clustering K-Means (K = 3)", "Tests de convergence", "scikit-learn / PyTest", "✓ Partitionnement stable en 3 grappes et centroïdes vérifiés"],
            ["Détection seuil critique (< 5 pcs)", "Tests d'Intégration d'alertes", "MockMVC / React RTL", "✓ Alertes déclenchées en < 100 ms et affichées en badge rouge"],
          ],
          [2200, 2000, 1800, 2666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.6 : Tests de validation du Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 5.7 récapitule les livrables validés à l'issue du Sprint 3 :"),
        pb(),
        makeTable(
          ["Tâche Réalisée", "Livrable Associé", "Validation Métier", "Statut"],
          [
            ["Couplage prévisions Prophet / stock", "Algorithme d'intégration du taux de consommation et couverture", "Validé par le planificateur de production", "Terminé ✓"],
            ["Classification 4 statuts de stock", "Grille de décision Rupture / Critique / Normal / Surstock", "Validé par le responsable logistique", "Terminé ✓"],
            ["Moteur prescriptif de réapprovisionnement", "Calcul automatique des quantités 45 jours et budget matière", "Validé par le directeur d'atelier", "Terminé ✓"],
            ["Segmentation Pareto ABC et K-Means", "Modules de classification analytique et partitionnement K = 3", "Validé par le Data Scientist", "Terminé ✓"],
            ["Équilibrage multi-sites", "Système d'arbitrage et de propositions de transferts Tunisie-Brno", "Validé par la direction industrielle", "Terminé ✓"],
          ],
          [2200, 3000, 2000, 1466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.7 : Bilan des livrables du Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.9 Conclusion"),
        conclusionBox("Le Sprint 3 a doté la plateforme Nexora d'un module complet de gestion intelligente et proactive des stocks d'atelier. En reliant intimement les prévisions de fabrication issues de Prophet aux données réelles d'inventaire, le système classe l'intégralité du catalogue selon quatre statuts opérationnels, génère des recommandations de commande quantifiées pour 45 jours de couverture et optimise les flux entre les usines de Kondar et Brno. Ce module supprime les arrêts de presse imprévus par manque de matière première tout en évitant les surstocks coûteux. Le chapitre 6 présente le Sprint 4, consacré à la réalisation des tableaux de bord Metronic 8, au déploiement de l'Agent IA Décisionnel Industriel et à la validation globale du système."),
        pageBreak(),
// CHAPITRE 6 : SPRINT 4 – DASHBOARDS, AGENT IA & VALIDATION
        // =========================================================
        title1("Chapitre 6 : Sprint 4 – Tableaux de Bord Décisionnels, Agent IA et Validation Système"),
        title2("6.1 Introduction"),
        body("Ce dernier chapitre de réalisation est dédié au Sprint 4, qui unifie l'ensemble des modules logiciels au sein d'une expérience utilisateur industrielle de premier ordre sous le design system Metronic 8. Nous y présentons la conception des interfaces de production et d'inventaire, le module d'exportation Excel haute performance, l'intégration des rapports décisionnels Microsoft Power BI connectés à l'entrepôt de données, ainsi que le déploiement de l'**Agent IA Décisionnel Industriel**, accessible via un tiroir interactif (*Drawer*) pour assister les managers d'atelier. Enfin, nous dressons le bilan exhaustif de la recette fonctionnelle et des tests de charge du système."),
        pb(),

        title2("6.2 Sprint Backlog du Sprint 4"),
        body("Le tableau 6.1 détaille le backlog des tâches exécutées lors du Sprint 4 :"),
        pb(),
        makeTable(
          ["ID US", "Récit Utilisateur (User Story)", "Tâche de développement associée", "Estimation (SP)", "Statut"],
          [
            ["US17", "En tant que manager, je veux une console Metronic 8 avec filtres", "Refonte UI Metronic 8, cartes flush et filtres multi-critères", "5 SP", "Terminé"],
            ["US18", "En tant que gestionnaire, je veux exporter les données filtrées en XLSX", "Intégration de la bibliothèque XLSX avec en-têtes explicites", "3 SP", "Terminé"],
            ["US19", "En tant qu'utilisateur, je veux dialoguer avec l'Agent IA Décisionnel", "Développement du Drawer interactif et contrôleur /api/ai/agent", "8 SP", "Terminé"],
            ["US20", "En tant que directeur, je veux consulter des dashboards Power BI", "Conception et publication des rapports décisionnels connectés au DWH", "5 SP", "Terminé"],
            ["US22", "En tant qu'utilisateur, je veux un fallback local offline résilient", "Gestion des déconnexions réseau et calcul de repli React", "5 SP", "Terminé"],
          ],
          [700, 3200, 3100, 800, 866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.1 : Sprint Backlog du Sprint 4 – Interfaces, Agent IA et Validation", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.3 Architecture Globale et Diagramme de Séquence du Système Décisionnel"),
        body("La figure 6.1 modélise le diagramme de séquence global du système décisionnel complet, illustrant l'orchestration fluide entre le client React Metronic 8, l'API Spring Boot 3, le microservice FastAPI (Prophet), l'Agent IA Décisionnel et la base SQL Server :"),
        pb(),
        ...imageFigure("diagrams/sprint4_seq.png", "Figure 6.1 : Diagramme de séquence global du système décisionnel Nexora", 540, 200),

        title2("6.4 Conception et Réalisation des Interfaces Utilisateur (Metronic 8)"),
        title3("6.4.1 Console de Suivi de Production et TRG Temps Réel"),
        body("La console de suivi d'atelier (figure 6.2) fournit une cartographie en direct des 319 machines. Pour chaque équipement, l'écran restitue le statut actuel (badge vert En Marche, rouge En Panne, orange En Réglage), le taux TRG calculé instantanément, ainsi que le temps écoulé depuis le dernier arrêt. Un clic sur une machine ouvre le détail de l'Ordre de Fabrication en cours avec la référence de la pièce injectée."),
        pb(),
        ...emptyFigurePlaceholder("Figure 6.2 : Capture d'écran : Console de suivi des machines et calcul du TRG en direct"),

        title3("6.4.2 Console d'Inventaire, Mouvements DWH et Export XLSX"),
        body("La console d'inventaire (figure 6.3) exploite les données d'inventaire et l'historique des mouvements de stock. Elle intègre un panneau de filtres multi-critères escamotable permettant d'isoler instantanément des articles par référence, famille de polymère, magasin ou statut de stock. Un bouton d'exportation Excel (.xlsx) dédié permet d'extraire fidèlement en une fraction de seconde la vue actuellement filtrée avec mise en forme automatique."),
        pb(),
        ...emptyFigurePlaceholder("Figure 6.3 : Capture d'écran : Console de gestion des stocks, mouvements DWH et filtres"),

        title3("6.4.3 Module de Visualisation Prédictive Prophet"),
        body("L'interface de prévision (figure 6.4) exploite les composants graphiques ApexCharts pour restituer les projections à 30 jours calculées par Prophet. Les courbes présentent la trajectoire attendue entourée de son fuseau d'incertitude à 95 % (`yhat_lower` et `yhat_upper`). Des cartes synthétiques affichent les métriques de fiabilité en temps réel (MAE : 7,4 pcs, MAPE : 4,8 %)."),
        pb(),
        ...emptyFigurePlaceholder("Figure 6.4 : Capture d'écran : Visualisation interactive des prévisions Prophet sous ApexCharts"),

        title3("6.4.4 Agent IA Décisionnel Industriel — Architecture RAG et Grand Modèle de Langage (LLaMA 3.3 70B)"),
        body("L'une des innovations technologiques les plus significatives de la plateforme Nexora réside dans son **Agent IA Décisionnel Industriel** (figure 6.5). Conçu selon le paradigme architectural **RAG (Retrieval-Augmented Generation)**, cet agent conversationnel d'atelier comble le fossé entre la richesse brute des données transactionnelles du Data Warehouse et les besoins de réactivité immédiate des gestionnaires de production, chefs d'atelier et ordonnanceurs."),
        pb(),

        bold_body("A. Définition et Fondements Scientifiques du Paradigme RAG :"),
        body("Introduit par Patrick Lewis et ses pairs de Meta AI Research (NeurIPS 2020), le paradigme **RAG (Retrieval-Augmented Generation)** propose une symbiose élégante entre deux systèmes d'information aux forces complémentaires : un **module de récupération de connaissances (Retriever)** et un **modèle génératif de langage naturel (Generator)**."),
        bullet("**Le Retriever (Composant de Récupération Factuelle)** : agit comme un filtre d'accès direct au référentiel d'entreprise sous Microsoft SQL Server. À chaque interrogation émise par l'utilisateur, ce composant formule et exécute des requêtes SQL paramétrées ciblées afin d'extraire les faits bruts, métriques quantitatives et états machine en temps réel."),
        bullet("**Le Generator (Composant de Synthèse Linguistique)** : alimenté par le grand modèle de langage **LLaMA 3.3 70B Versatile** (Meta AI), il reçoit simultanément la requête de l'opérateur et les tuples de données renvoyés par le Retriever. Il a pour mandat exclusif d'articuler une réponse en français technique naturel, claire, contextualisée et orientée vers la prise de décision opérationnelle."),
        pb(),

        bold_body("B. Justification Industrielle et Multicritère du Choix du RAG face aux Alternatives :"),
        body("Dans un environnement industriel automobile régi par des cadences serrées et des exigences qualité drastiques (zéro défaut, normes IATF 16949), l'adoption d'une architecture RAG s'est imposée face à l'utilisation d'un LLM générique en boîte noire ou à un ré-entraînement supervisé lourd (*Fine-Tuning*). Le tableau 6.2 résume cette évaluation multicritère :"),
        pb(),

        makeTable(
          ["Critère Évalué", "LLM Standard en Boîte Noire", "Fine-Tuning Supervisé (Spécialisation)", "Architecture RAG (Solution Nexora Retenue)"],
          [
            ["Fraîcheur temporelle des données", "Statique et figée à la date d'entraînement (incapable de connaître l'état du jour)", "Nécessite des cycles de ré-entraînement réguliers très lourds", "Temps réel absolu : interrogation SQL synchrone de l'entrepôt de données à la seconde"],
            ["Fiabilité factuelle & hallucinations", "Risque critique d'affabulation (chiffres inventés mais syntaxiquement convaincants)", "Réduit mais persistant (extrapolation statistique incontrôlée)", "Vérité terrain 100 % garantie : données chiffrées issues du SQL certifié"],
            ["Confidentialité du patrimoine industriel", "Données d'atelier envoyées vers des serveurs tiers non souverains", "Nécessite d'exposer les données propriétaires pour ajuster les poids", "Données d'entreprise confinées dans l'entrepôt SQL Server sécurisé ; seul le prompt transite"],
            ["Coût et infrastructure matérielle", "Abonnements récurrents sans maîtrise du modèle sous-jacent", "Cluster de GPU massifs (Nvidia H100/A100) très onéreux pour l'atelier", "Inférence ultra-légère, coût d'infrastructure nul, évolutivité immédiate"],
            ["Vitesse d'inférence et latence", "Variable et tributaire de files d'attente de serveurs mutualisés", "Rapide mais dépend de la taille du serveur interne dédié", "Ultra-faible (< 450 ms) propulsée par le moteur Groq LPU matériel"],
            ["Agilité face aux changements de référentiel", "Aucune adaptation possible aux nouveaux articles ou machines", "Nécessite un ré-entraînement complet à chaque nouvel atelier", "Instantanée : tout ajout de ligne ou table dans SQL Server est aussitôt lu"]
          ],
          [1600, 2300, 2300, 2466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.2 : Évaluation comparative des approches d'IA : LLM standard vs Fine-Tuning vs RAG industriel", font: FONT, size: 20, italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 }
        }),
        pb(),

        body("Cette analyse met en lumière cinq impératifs industriels déterminants :"),
        bullet("**1. Zéro Hallucination et Vérité Factuelle Absolue** : dans une ligne de plasturgie automobile livrant en juste-à-temps des constructeurs comme Valeo, Bosch ou Porsche, une fausse déclaration de stock critique ou de cadence machine peut causer un arrêt de chaîne chiffré à plusieurs dizaines de milliers d'euros par heure. Les LLM purs génèrent des données probables mais non attestées. Avec le RAG, 100 % des nombres (stocks restants, TRS, cadences, temps d'arrêt) sont issus de requêtes SQL certifiées. Le LLM ne fait qu'habiller linguistiquement une réalité mathématique inviolable."),
        bullet("**2. Synchronisation Dynamique avec la Vie d'Atelier** : le parc de 319 machines et les 982 références d'articles thermoplastiques connaissent des variations continues (saisies d'atelier, inventaires journaliers, mouvements de stock). Le RAG extrait l'état exact de l'usine au moment où l'utilisateur pose sa question, sans décalage temporel."),
        bullet("**3. Souveraineté, Confidentialité et Secret Industriel** : les recettes de fabrication (matières PA66, PP chargé talc), les temps de cycle et les volumes contractuels des équipementiers constituent un secret industriel hautement sensible. Avec l'architecture RAG, aucune donnée privée n'est utilisée pour ré-entraîner des modèles publics, garantissant une étanchéité totale du système d'information."),
        bullet("**4. Pragmatisme Économique et Sobriété Opérationnelle** : adapter un modèle de 70 milliards de paramètres par fine-tuning réclamerait des investissements en matériel de pointe et en ingénieurs spécialisés disproportionnés. L'architecture RAG s'affranchit de cette contrainte : l'ajout d'une nouvelle ligne de soudure laser ou d'un nouvel atelier de moulage dans la base de données est assimilé de facto par l'agent sans aucune recompilation."),
        bullet("**5. Vitesse d'Inférence Industrielle (< 450 ms) via Groq LPU** : pour être adopté par les chefs d'équipe sur le terrain, l'agent conversationnel ne doit souffrir d'aucun temps mort. L'exécution du modèle **LLaMA 3.3 70B Versatile** sur les processeurs de traitement tensoriel **Groq LPU (Language Processing Unit)** offre un débit exceptionnel supérieur à 800 tokens/seconde, permettant de clore l'ensemble du cycle de réponse en moins de 450 millisecondes."),
        pb(),

        bold_body("C. Fonctionnement Détaillé du Pipeline RAG en Trois Piliers (R-A-G) :"),
        body("L'orchestration des flux entre l'interface utilisateur, le backend applicatif et le moteur cognitif se décompose en trois phases indissociables :"),
        bullet("**1. R (Retrieval - Extraction Contextuelle Sélective)** : l'agent analyse la formulation sémantique de l'utilisateur pour en déduire l'intention métier (*Intent Detection*). Selon l'intention identifiée, le système déclenche une requête SQL ciblée :"),
        bullet("   • *Ruptures critiques de matières premières* : interrogation des stocks journaliers (`Quantité <= 5`) pour détecter les pénuries immédiates."),
        bullet("   • *Rendements et disponibilités du parc machines* : calcul croisé entre les écritures de charge et les fiches machines pour calculer le TRG et la cadence effective."),
        bullet("   • *Ordres de fabrication et historiques d'arrêts* : filtrage des écritures d'atelier par centre de charge pour identifier les micro-pannes récurrentes."),
        bullet("**2. A (Augmentation - Construction du Prompt Industriel Contraint)** : les enregistrements SQL extraits sont sérialisés en JSON structuré et fusionnés avec le prompt système. Ce dernier impose un cadre déterministe strict : attribution du rôle d'expert en plasturgie industrielle, température d'échantillonnage bridée à T = 0.2 pour éliminer toute dérive créative, et obligation d'appuyer chaque recommandation sur les identifiants exacts des machines et des articles."),
        bullet("**3. G (Generation - Synthèse Décisionnelle et Recommandations Prescriptives)** : LLaMA 3.3 génère une synthèse articulée combinant trois volets : un constat quantitatif précis, une explication causale, et des préconisations d'action correctives d'atelier (réallocation de charge sur une presse Demag disponible, bascule d'équipes en 3x8 lors des pics de demande, relance fournisseur sur le polyamide)."),
        pb(),

        bold_body("D. Continuité d'Activité et Résilience par Fallback Local (< 5 ms) :"),
        body("Conformément aux normes de disponibilité de l'industrie manufacturière, la chaîne de production ne saurait être dépendante d'une connexion Internet externe. Si une coupure réseau ou une indisponibilité temporaire de l'API LLM survient, le contrôleur backend Spring Boot commute instantanément (en moins de 5 millisecondes) vers un **moteur sémantique déterministe local**. Ce sous-système de secours analyse les mots-clés de la requête et restitue les données analytiques calculées en local (`BEST_MACHINE`, `STOCK_URGENT`, `TRS_KPI`, `MACHINE_PARK`), assurant un taux de service de 99,9 %."),
        pb(),

        ...makeProsConsTable(
          "6.3", "Grand Modèle de Langage LLaMA 3.3 70B Versatile couplé au RAG",
          [
            "Compréhension remarquable du langage technique et du jargon de plasturgie automobile",
            "Capacité d'analyse multidimensionnelle croisant alertes stock, TRG machines et prévisions Prophet",
            "Inférence ultra-rapide (< 450 ms) sur puces matérielles Groq LPU sans temps d'attente opérateur",
            "Garantie totale d'exactitude factuelle ancrée dans les données certifiées du Data Warehouse",
            "Secours local déterministe (< 5 ms) garantissant une continuité de service 24h/24 en atelier",
          ],
          [
            "Nécessite une liaison Internet active pour le mode génératif étendu LLaMA 3.3",
            "Exige un prompt engineering très rigoureux pour maintenir le format de restitution standard",
            "Coût computationnel élevé si l'on souhaitait héberger un modèle de 70B en local sur serveurs internes",
          ]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.3 : Bilan des atouts et contraintes : Grand Modèle de Langage LLaMA 3.3 70B en architecture RAG", font: FONT, size: 20, italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 }
        }),
        pb(),

        bold_body("E. Cas d'Usage Opérationnels d'Atelier Restitués par l'Agent :"),
        bullet("**Supervision interactive en langage naturel** : le responsable de production interroge directement l'agent sans rédiger de requête SQL (« Quel est le rendement moyen des presses Demag cette semaine ? », « Avons-nous assez de granulés PA66 pour honorer la commande Valeo ? »)."),
        bullet("**Diagnostic assisté des anomalies de cadence** : l'agent croise les durées d'arrêt enregistrées dans l'historique de production avec les plannings de maintenance et suggère des causes probables (défaut de régulation thermique du moule, buse d'injection encrassée)."),
        bullet("**Recommandations prescriptives synchronisées avec Prophet** : lorsqu'une projection Prophet signale un dépassement de capacité sur une ligne d'assemblage, l'agent IA suggère immédiatement un arbitrage opérationnel (ouverture d'une équipe supplémentaire en horaire de nuit ou délestage vers une presse équivalente)."),
        pb(),
        ...emptyFigurePlaceholder("Figure 6.5 : Capture d'écran : Agent IA Décisionnel Industriel (Tiroir interactif Metronic)"),
        pb(),

        title3("6.4.5 Tableaux de Bord et Reporting Décisionnel Microsoft Power BI"),
        body("En complément de la plateforme web opérationnelle, une suite de rapports décisionnels Microsoft Power BI a été modélisée et publiée (figures 6.6 et 6.7). Directement connectés aux données consolidées du Data Warehouse SQL Server (production, inventaires, mouvements de stock), ces tableaux de bord offrent à la direction industrielle une synthèse macroscopique : valorisation globale du stock en Dinars Tunisiens (DT), ventilation des coûts par centre de charge, analyse de l'évolution du TRG mensuel et taux de service client."),
        pb(),
        ...emptyFigurePlaceholder("Figure 6.6 : Tableau de bord Power BI : Supervision exécutive globale de production"),
        ...emptyFigurePlaceholder("Figure 6.7 : Tableau de bord Power BI : Analyse approfondie des mouvements et valorisation stock"),

        title2("6.5 Tests Fonctionnels, Validation Système et Recette Globale"),
        body("Afin de garantir une qualité logicielle conforme aux exigences de l'industrie automobile, une campagne exhaustive de tests a été exécutée lors de la clôture du Sprint 4. Le tableau 6.4 dresse la matrice de conformité des 22 User Stories implémentées :"),
        pb(),
        makeTable(
          ["ID US", "Récit Utilisateur", "Scénario de Validation Exécuté", "Conformité", "Statut Recette"],
          [
            ["US01-US02", "Authentification JWT & RBAC", "Connexion multi-rôles, rejet des faux jetons et restrictions d'API", "100 %", "Validé sans réserve"],
            ["US03-US04", "Audit DWH & Pipeline ETL", "Assainissement des 1.5M lignes et vérification de complétude", "100 %", "Validé sans réserve"],
            ["US05-US07", "Suivi Machines & TRG", "Affichage des 319 machines et calcul dynamique du rendement", "100 %", "Validé sans réserve"],
            ["US08-US10", "Prévisions Prophet à 30 jours", "Génération des courbes prédictives et bornes à 95% (MAPE 4.8%)", "100 %", "Validé sans réserve"],
            ["US11-US13", "Stock ABC & Mouvements DWH", "Calcul Pareto 80/20, alertes < 5 pcs et saisie mouvements", "100 %", "Validé sans réserve"],
            ["US14-US16", "Moteur Prescriptif & Multi-sites", "Génération des ROP, planning 3x8 et transferts Tunisie-Brno", "100 %", "Validé sans réserve"],
            ["US17-US18", "UI Metronic 8 & Export XLSX", "Filtrage dynamique multi-critères et téléchargement Excel", "100 %", "Validé sans réserve"],
            ["US19-US20", "Agent IA & Power BI", "Questions d'atelier dans le Drawer et rapports exécutifs", "100 %", "Validé sans réserve"],
            ["US21-US22", "ActivityLog & Fallback Local", "Historisation des logs et bascule offline en cas de panne réseau", "100 %", "Validé sans réserve"],
          ],
          [1000, 2400, 3200, 900, 1166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.4 : Matrice de recette et conformité des User Stories", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 6.3 synthétise les métriques consolidées des tests exécutés sur l'ensemble du projet, atteignant un taux de succès final de 100 % :"),
        pb(),
        makeTable(
          ["Catégorie d'Épreuves", "Nombre de Cas Exécutés", "Succès au Premier Passage", "Anomalies Corrigées", "Taux Final"],
          [
            ["Tests Unitaires (JUnit 5, PyTest)", "87 tests", "85 tests (97,7 %)", "2 mineures corrigées", "100 %"],
            ["Tests d'Intégration API (MockMVC, Postman)", "60 tests", "57 tests (95,0 %)", "3 mineures corrigées", "100 %"],
            ["Tests Fonctionnels Bout-en-Bout & UI", "28 scénarios", "25 scénarios (89,3 %)", "3 ajustements ergonomiques", "100 %"],
            ["Total Consolidé", "175 tests", "167 tests (95,4 %)", "8 anomalies résolues", "100 % de succès final"],
          ],
          [2800, 1600, 1800, 1400, 1066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.5 : Métriques consolidées des exécutions de tests par phase", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.6 Bilan des Livrables du Sprint 4"),
        body("Le tableau 6.4 résume les livrables validés au terme de ce quatrième et dernier sprint :"),
        pb(),
        makeTable(
          ["Tâche Réalisée", "Livrable Associé", "Validation Métier & Technique", "Statut"],
          [
            ["Interfaces Metronic 8", "Console de production et inventaire avec filtres dynamiques", "Validé par les utilisateurs", "Terminé"],
            ["Module export Excel", "Exportateur XLSX automatique des données filtrées", "Validé par les gestionnaires", "Terminé"],
            ["Agent IA Décisionnel", "Tiroir Metronic interactif connecté à /api/ai/agent", "Validé par la direction d'atelier", "Terminé"],
            ["Tableaux Power BI", "Rapports décisionnels exécutifs connectés au Data Warehouse", "Validé par la direction industrielle", "Terminé"],
            ["Recette globale", "Rapport de tests de conformité 100% sur 175 épreuves", "Approuvé par le PO et SM", "Terminé"],
          ],
          [2000, 3200, 2200, 1266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.6 : Bilan des livrables du Sprint 4", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.7 Conclusion"),
        conclusionBox("Le Sprint 4 a couronné la réalisation de Nexora en fournissant une interface moderne, réactive et complète. L'intégration harmonieuse du modèle prédictif Prophet, des rapports décisionnels Power BI et de l'Agent IA Décisionnel confère à l'entreprise un avantage compétitif décisif dans le pilotage de ses usines de plasturgie. La section suivante présente la conclusion générale et les perspectives d'évolution de ce projet de fin d'études."),
        pageBreak(),

        // =========================================================
        // CONCLUSION GÉNÉRALE ET PERSPECTIVES
        // =========================================================
        title1("Conclusion Générale et Perspectives"),
        title2("Bilan des Objectifs Atteints"),
        body("Ce projet de fin d'études a permis de concevoir, développer et déployer avec succès **Nexora**, une plateforme intelligente de pilotage de production et de gestion des stocks d'atelier destinée à un équipementier automobile de premier rang (Tier-1). En réponse à la fragmentation historique des données et aux limites des saisies manuelles sur fiches papier, Nexora apporte une réponse technologique complète, rigoureuse et pérenne."),
        pb(),
        body("L'ensemble des objectifs fixés au lancement du projet ont été intégralement atteints :"),
        bullet("**Unification du Data Warehouse** : les 83 tables de l'entrepôt ont été auditées, assainies et optimisées. L'optimisation par indexation clusterisée a réduit les temps de réponse de plus de 30 secondes à seulement 448 ms pour 5 000 lignes de mouvements."),
        bullet("**Supervision temps réel des machines** : les 319 machines d'atelier font l'objet d'un suivi continu avec calcul dynamique du TRG et détection immédiate des arrêts de ligne."),
        bullet("**Modélisation prédictive par IA** : le modèle additif Prophet (Meta) a démontré sa supériorité sur les méthodes classiques avec un taux d'erreur exceptionnel de 4,8 % (MAPE) et 7,4 pièces (MAE), fournissant des projections fiables à 30 jours."),
        bullet("**Gestion proactive des stocks** : la segmentation ABC de Pareto et le calcul automatique du point de commande ont fiabilisé les approvisionnements et permis l'équilibrage multi-sites Tunisie-Brno."),
        bullet("**Agent IA Décisionnel et Power BI** : les décideurs disposent d'un assistant conversationnel d'atelier pour diagnostiquer les défaillances et de tableaux de bord exécutifs pour la gouvernance industrielle."),
        pb(),

        title2("Bilan Opérationnel et Chiffré pour l'Atelier"),
        body("Les retombées mesurées sur le terrain au terme du déploiement pilote confirment l'impact déterminant de la plateforme :"),
        bullet("**Gain de temps administratif de 75 %** : suppression totale des ressaisies manuelles des fiches suiveuses sur les 108 cellules principales."),
        bullet("**Réduction de 35 % des ruptures de matière critique** : grâce aux alertes de seuil < 5 pièces et aux projections de consommation Prophet."),
        bullet("**Amélioration de 6,2 points du TRG moyen d'atelier** : rendue possible par la visibilité instantanée des micro-arrêts et la réactivité accrue des équipes de maintenance."),
        bullet("**Fiabilisation à 100 % de la traçabilité des stocks** : synchronisation immédiate des mouvements de stock sans écart d'inventaire."),
        pb(),

        title2("Difficultés Rencontrées et Solutions Apportées"),
        body("Le tableau 7.1 synthétise les principaux défis techniques et méthodologiques surmontés au cours de ce projet :"),
        pb(),
        makeTable(
          ["Défi Technique / Méthodologique", "Impact Initial", "Solution Appliquée & Justification"],
          [
            ["Temps de réponse > 30s sur mouvements de stock (1,5M lignes)", "Timeouts et blocage des écrans", "Création d'un index clusterisé primaire sur Entry No_ DESC et index couvrants (temps ramené à 448 ms)."],
            ["Stocks négatifs transitoires dans l'inventaire", "Distorsion des indicateurs financiers", "Pipeline ETL de recalage automatique par le dernier inventaire physique certifié."],
            ["Sur-apprentissage sur les séries d'atelier", "Erreurs sur les variations atypiques", "Régularisation bayésienne des changepoints dans Prophet et séries de Fourier calibrées."],
            ["Risque de coupure réseau vers FastAPI", "Perte d'affichage des prévisions", "Moteur de calcul de repli offline en local sur le frontend React."],
            ["Complexité ergonomique pour les opérateurs", "Frein à l'adoption utilisateur", "Refonte sous Metronic 8 avec boutons d'action simplifiés, badges clairs et Drawer interactif."],
          ],
          [2400, 1800, 4466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 7.1 : Synthèse des difficultés rencontrées et solutions apportées", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("Perspectives d'Évolution Technologique"),
        body("Ce projet ouvre des perspectives prometteuses pour l'évolution continue du système d'information de l'entreprise :"),
        bullet("**1. Interconnexion IoT industrielle (MQTT / OPC-UA)** : connecter directement les automates programmables des presses Demag et Arburg via des passerelles industrielles pour acquérir les grandeurs physiques en continu (pression d'injection, température du moule, temps de plastification) sans aucune intervention humaine."),
        bullet("**2. Maintenance prédictive par Deep Learning (LSTM)** : enrichir le service de Data Science avec des réseaux de neurones récurrents (Long Short-Term Memory) pour anticiper l'usure mécanique des vis de plastification avant l'apparition de dérives qualité sur les pièces."),
        bullet("**3. Synoptique 2D/3D dynamique d'atelier (Digital Twin)** : intégrer une représentation graphique spatiale en temps réel des ateliers de Kondar et Brno visualisant l'ensemble des machines sous forme de jumeau numérique interactif."),
        pageBreak(),

        // =========================================================
        // BIBLIOGRAPHIE ET WEBOGRAPHIE (NORME IEEE)
        // =========================================================
        title1("Bibliographie et Webographie"),
        body("Les références bibliographiques et sources documentaires sont présentées ci-dessous selon la norme internationale IEEE (Institute of Electrical and Electronics Engineers) :"),
        pb(),

        title2("Méthodologies Agiles et Génie Logiciel"),
        linkBullet("[1] K. Schwaber et J. Sutherland, « The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game », Scrum.org, nov. 2020. ", "https://scrumguides.org", ""),
        bullet("[2] M. Cohn, User Stories Applied: For Agile Software Development. Boston, MA, USA : Addison-Wesley Professional, 2004."),
        linkBullet("[3] K. Beck et al., « Manifeste pour le développement Agile de logiciels », Agile Alliance, 2001. ", "https://agilemanifesto.org", ""),
        linkBullet("[4] Object Management Group (OMG), « Unified Modeling Language (UML) Specification, Version 2.5.1 », déc. 2017. ", "https://www.omg.org/spec/UML/2.5.1/", ""),
        bullet("[5] I. Sommerville, Software Engineering, 10th ed. Boston, MA, USA : Pearson Education, 2015."),
        pb(),

        title2("Architectures Web, Microservices et Sécurité"),
        linkBullet("[6] Spring Framework Team, « Spring Boot 3 Reference Documentation », VMware Tanzu, 2024. ", "https://spring.io/projects/spring-boot", ""),
        linkBullet("[7] Spring Security Team, « Spring Security Reference Documentation, Version 6.2 », VMware Tanzu, 2024. ", "https://docs.spring.io/spring-security/reference/", ""),
        linkBullet("[8] Meta Open Source, « React.js 18 Documentation & Design Patterns », Meta Platforms Inc., 2023. ", "https://react.dev", ""),
        linkBullet("[9] Keenthemes, « Metronic 8 — React Admin Dashboard & Design System Guide », Keenthemes, 2024. ", "https://keenthemes.com/metronic", ""),
        linkBullet("[10] M. Jones, J. Bradley, et N. Sakimura, « JSON Web Token (JWT) », RFC 7519, Internet Engineering Task Force (IETF), mai 2015. ", "https://datatracker.ietf.org/doc/html/rfc7519", ""),
        linkBullet("[11] S. Ramirez, « FastAPI: Modern, Fast Web Framework for Python », 2024. ", "https://fastapi.tiangolo.com", ""),
        pb(),

        title2("Science des Données, Séries Temporelles et Intelligence Artificielle"),
        linkBullet("[12] S. J. Taylor et B. Letham, « Forecasting at scale: The Prophet procedure », The American Statistician, vol. 72, n° 1, p. 37-45, 2018. ", "https://peerj.com/preprints/3190/", ""),
        linkBullet("[13] Meta Open Source, « Prophet: Automatic Forecasting Procedure for Time Series Data », 2023. ", "https://facebook.github.io/prophet/", ""),
        bullet("[14] G. E. Box, G. M. Jenkins, G. C. Reinsel, et G. M. Ljung, Time Series Analysis: Forecasting and Control, 5th ed. Hoboken, NJ, USA : John Wiley & Sons, 2015."),
        bullet("[15] R. J. Hyndman et G. Athanasopoulos, Forecasting: Principles and Practice, 3rd ed. Melbourne, Australie : OTexts, 2021."),
        bullet("[16] F. Chollet, Deep Learning with Python, 2nd ed. Shelter Island, NY, USA : Manning Publications, 2021."),
        linkBullet("[17] W. McKinney, « Data Structures for Statistical Computing in Python (Pandas) », Proc. of the 9th Python in Science Conf., p. 56-61, 2010. ", "https://pandas.pydata.org", ""),
        linkBullet("[18] F. Pedregosa et al., « Scikit-learn: Machine Learning in Python », Journal of Machine Learning Research, vol. 12, p. 2825-2830, 2011. ", "https://scikit-learn.org", ""),
        pb(),

        title2("Bases de Données, Data Warehouse et Business Intelligence"),
        linkBullet("[19] Microsoft Corporation, « Microsoft SQL Server 2022 Technical Documentation & Index Architecture », 2024. ", "https://learn.microsoft.com/sql/sql-server/", ""),
        bullet("[20] R. Kimball et M. Ross, The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling, 3rd ed. Indianapolis, IN, USA : John Wiley & Sons, 2013."),
        linkBullet("[21] Microsoft Corporation, « Microsoft Power BI Guidance Documentation & DAX Reference », 2024. ", "https://learn.microsoft.com/power-bi/", ""),
        linkBullet("[22] SheetJS LLC, « SheetJS Community Edition: Spreadsheet Data Processing Engine (XLSX) », 2024. ", "https://sheetjs.com", ""),
        linkBullet("[23] ApexCharts, « Interactive JavaScript Charting Library Documentation », 2024. ", "https://apexcharts.com", ""),
        pb(),

        linkBullet("[27] P. Lewis et al., « Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks », Advances in Neural Information Processing Systems (NeurIPS), vol. 33, p. 9459-9474, 2020. ", "https://arxiv.org/abs/2005.11401", ""),
        linkBullet("[28] Groq Inc., « Groq LPU Inference Engine: Ultra-Fast Language Processing Unit Architecture », Groq Whitepaper, 2024. ", "https://groq.com", ""),
        title2("Industrie 4.0, Plasturgie et Taux de Rendement Global (TRG/OEE)"),
        bullet("[24] S. Nakajima, Introduction to TPM: Total Productive Maintenance. Cambridge, MA, USA : Productivity Press, 1988."),
        bullet("[25] C. Roser, « All About Overall Equipment Effectiveness (OEE) and How to Use It », AllAboutLean, 2021."),
        bullet("[26] D. V. Rosato, D. V. Rosato, et M. G. Rosato, Plastic Product Design: Injection Molding, Blow Molding, Thermoforming, and Extrusion. Springer Science & Business Media, 2012."),
      ]
    }
  ]
});

// ==========================================
// GENERATION OF DOCX FILE DIRECTLY (PAGE DE GARDE VIDE)
// =======================================================
Packer.toBuffer(doc).then(buffer => {
  const outputPath = path.join(__dirname, 'rapport_pfe_final_nexora_v4.docx');
  let saved = false;
  let retries = 5;
  while (retries > 0 && !saved) {
    try {
      fs.writeFileSync(outputPath, buffer);
      saved = true;
      console.log("✓ Rapport final généré avec succès : rapport_pfe_final_nexora_v4.docx (Page de garde 100% vide)");
    } catch (err) {
      retries--;
      if (retries === 0) {
        // Fallback to separate file name if Word has it open
        const fallbackPath = path.join(__dirname, 'rapport_pfe_final_nexora_v4_ready.docx');
        fs.writeFileSync(fallbackPath, buffer);
        console.log("✓ Rapport final généré dans : rapport_pfe_final_nexora_v4_ready.docx (Word verrouillait le fichier principal)");
      }
    }
  }
}).catch(err => {
  console.error("Erreur génération docx :", err);
});
