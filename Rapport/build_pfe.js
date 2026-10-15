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
  spacing: { before: 360, after: 80 },
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

const conclusionBox = (text) => new Paragraph({
  children: parseMarkdown(text),
  spacing: { before: 140, after: 140, line: 360, lineRule: "auto" },
  alignment: AlignmentType.JUSTIFIED,
});

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
      ...rows.map((row, ri) => {
        if (row.length === 1) {
          const sectionTitle = String(row[0]);
          return new TableRow({
            children: [
              new TableCell({
                borders,
                columnSpan: headers.length,
                width: { size: targetTotalW, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 50, bottom: 50, left: 80, right: 80 },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({
                  children: [new TextRun({ text: sectionTitle, font: FONT2, size: 19, bold: true, color: "000000" })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 30, after: 30 },
                })],
              })
            ]
          });
        }
        const isChampion = row.some(c => String(c).includes('★'));
        return new TableRow({
          children: row.map((cell, ci) => {
            const cellStr = String(cell);
            const isLong = cellStr.length > 35;
            return new TableCell({
              borders,
              width: { size: scaledColWidths[ci], type: WidthType.DXA },
              shading: { fill: isChampion ? "E2F0D9" : (ri % 2 === 0 ? "F9FBFD" : WHITE), type: ShadingType.CLEAR },
              margins: { top: 40, bottom: 40, left: 80, right: 80 },
              children: [new Paragraph({
                children: parseMarkdown(cellStr, { font: FONT2, size: 18 }),
                alignment: (ci === 0 || isLong) ? AlignmentType.LEFT : AlignmentType.CENTER,
                spacing: { before: 20, after: 20, line: 240, lineRule: "auto" },
              })],
            });
          })
        });
      })
    ]
  });
};

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

const makeProsConsTable = (tableNum, modelName, pros, cons) => {
  const maxRows = Math.max(pros.length, cons.length);
  const rows = [];
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

const emptyFigurePlaceholder = (captionText, heightPt = 160) => [
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

function getImageDimensions(buffer) {
  try {
    if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xFF) break;
        const marker = buffer[offset + 1];
        if (marker === 0xC0 || marker === 0xC2) {
          return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
        }
        offset += 2 + buffer.readUInt16BE(offset + 2);
      }
    }
  } catch (e) {}
  return null;
}

const imageFigure = (imageRelPath, captionText, maxW = 540, maxH = 380) => {
  const fullPath = path.isAbsolute(imageRelPath) ? imageRelPath : path.join(__dirname, imageRelPath);
  if (fs.existsSync(fullPath)) {
    try {
      const buffer = fs.readFileSync(fullPath);
      let targetW = maxW;
      let targetH = maxH;
      const dims = getImageDimensions(buffer);
      if (dims && dims.width > 0 && dims.height > 0) {
        const scale = Math.min(maxW / dims.width, maxH / dims.height);
        targetW = Math.round(dims.width * scale);
        targetH = Math.round(dims.height * scale);
      }
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 140, after: 60 },
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width: targetW, height: targetH },
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
    } catch(e) {
      return emptyFigurePlaceholder(captionText);
    }
  } else {
    return emptyFigurePlaceholder(captionText);
  }
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

    // SECTION 1 : PAGE DE GARDE VIDE (POUR INSERTION LIBRE OU MODÈLE FSM)
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
        new Paragraph({ children: [new TextRun({ text: "" })], spacing: { before: 0, after: 0 } })
      ]
    },

    // SECTION 2 : PAGES PRÉLIMINAIRES (NUMÉROTATION ROMAINE)
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
        body("À mes très chers parents,", { align: AlignmentType.CENTER, bold: true }),
        body("Aucun hommage ne saurait exprimer l'immensité de l'amour, des sacrifices et de la bienveillance dont vous ne cessez de m'entourer. Que Dieu vous accorde santé, quiétude et longue vie. Je vous dédie ce travail en témoignage d'une infinie reconnaissance et d'une affection indéfectible.", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("À ma sœur, mon frère,", { align: AlignmentType.CENTER, bold: true }),
        body("Pour votre soutien constant, vos encouragements chaleureux et votre présence réconfortante à chaque étape de mon cursus. Je vous souhaite un avenir resplendissant, couronné de succès et de félicité.", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("À mes chers amis et camarades de promotion,", { align: AlignmentType.CENTER, bold: true }),
        body("Avec qui j'ai partagé les moments de doute, les défis intellectuels et les joies de la réussite. Votre esprit d'équipe et votre fidélité ont rendu ce parcours mémorable.", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("À tous ceux qui me sont chers, merci.", { align: AlignmentType.CENTER, bold: true }),
        pageBreak(),

        // REMERCIEMENTS
        frontTitle("Remerciements"),
        body("Tout d'abord, je remercie Allah le Tout-Puissant de m'avoir accordé la force, la patience et la persévérance nécessaires pour mener à bien ce travail de fin d'études."),
        pb(),
        body("Je tiens à exprimer ma profonde gratitude à mon encadrant universitaire pour ses précieux conseils, sa rigueur scientifique et sa disponibilité exemplaire tout au long de ce projet. Sa clairvoyance et la qualité de ses orientations ont grandement contribué à la structuration et à l'aboutissement de ce mémoire."),
        pb(),
        body("J'adresse également mes plus vifs remerciements à mon encadrant en entreprise pour son encadrement technique rigoureux, son écoute bienveillante et ses retours critiques hautement formateurs. Son accompagnement lors de l'intégration des flux de production et des architectures de données a été déterminant."),
        pb(),
        body("J'exprime toute ma reconnaissance aux membres du jury pour l'honneur qu'ils me font en acceptant d'évaluer ce travail de recherche et d'ingénierie logicielle."),
        pb(),
        body("Je tiens à remercier chaleureusement la Faculté des Sciences de Monastir, ainsi que l'ensemble du corps professoral du Master Data Science, pour la qualité de l'enseignement dispensé durant ces deux années de formation d'excellence."),
        pb(),
        body("Mes remerciements s'étendent enfin aux équipes d'ingénierie et d'atelier des sites industriels de Kondar, Sousse et Brno pour leur accueil et leur collaboration précieuse lors des phases de recueil des besoins et de validation terrain."),
        pageBreak(),

        // RÉSUMÉ FR
        frontTitle("Résumé"),
        body("Dans le secteur de la plasturgie automobile, l’optimisation de la production et la gestion des approvisionnements constituent des enjeux majeurs pour améliorer la performance industrielle et assurer la continuité des activités. Face à la dispersion des données de production issues de plusieurs sites industriels, ce projet de fin d’études porte sur la conception et le déploiement de Nexora, une plateforme intégrée d’aide à la décision destinée au pilotage des activités industrielles."),
        pb(),
        body("La solution repose sur un entrepôt de données centralisé et un processus automatisé de collecte et de transformation des données. Elle s'articule autour de quatre piliers majeurs : l'ingénierie et l'assainissement automatisé des données d'atelier (ETL et Data Warehouse), le suivi des performances de production à travers des indicateurs industriels en temps réel, la modélisation prédictive des cadences journalières couplée à la détection proactive des anomalies de fabrication, ainsi que l’optimisation intelligente de la gestion des stocks et la planification préventive des réapprovisionnements à 45 jours."),
        pb(),
        body("La plateforme exploite des méthodes d’apprentissage automatique pour anticiper les volumes de production et identifier les éventuelles dérives, tout en proposant une approche structurée de la gestion des stocks afin de limiter les risques de rupture. Les résultats sont présentés à travers des tableaux de bord interactifs et une interface web permettant de faciliter le suivi des indicateurs et la prise de décision."),
        pb(),
        body("Développée à l’aide de technologies de Business Intelligence, de traitement des données et de développement web, Nexora contribue à centraliser l’information, à améliorer la visibilité sur les opérations industrielles et à renforcer l’anticipation des besoins de production et d’approvisionnement."),
        pb(),
        body("**Mots-clés :** Système décisionnel, Business Intelligence, Data Science, Plasturgie automobile, Performance industrielle, Prévision de production, Détection d’anomalies, Gestion des stocks, ETL, Data Warehouse, SQL Server, Power BI, React, Spring Boot."),
        pageBreak(),

        // ABSTRACT EN
        frontTitle("Abstract"),
        body("In the automotive plastics manufacturing sector, production monitoring and raw material management are essential to improving industrial performance and ensuring operational continuity. This Master's thesis focuses on the design and implementation of Nexora, an integrated decision-support platform developed to improve production management and inventory planning across multiple industrial sites."),
        pb(),
        body("The platform relies on a centralized data warehouse and an automated Extract, Transform, Load (ETL) process to consolidate and prepare production data. It integrates four main pillars: automated data engineering and quality cleaning (ETL and Data Warehouse), production performance monitoring through industrial indicators, predictive modeling of daily workshop throughput coupled with proactive manufacturing anomaly detection, and intelligent inventory management with 45-day preventive replenishment planning."),
        pb(),
        body("Machine learning techniques are used to anticipate production volumes and identify potential manufacturing deviations. In parallel, the inventory management module helps prioritize replenishment needs and reduce the risk of stock shortages. The results are presented through interactive Microsoft Power BI dashboards and a web application developed using React and Spring Boot, providing users with accessible information to support operational and strategic decision-making."),
        pb(),
        body("By combining Business Intelligence, data analytics, and web technologies, Nexora contributes to improving data visibility, production planning, and inventory management, while strengthening the integration of data-driven insights into daily industrial operations."),
        pb(),
        body("**Keywords:** Decision Support System, Business Intelligence, Data Science, Automotive Plastics Manufacturing, Industrial Performance, Production Forecasting, Anomaly Detection, Inventory Management, ETL, Data Warehouse, SQL Server, Power BI, React, Spring Boot."),
        pageBreak(),

        // TABLE DES MATIÈRES
        frontTitle("Table des matières"),
        tocLine("Introduction générale", 0, "1"),
        pb(),
        tocLine("1 Contexte et cadre du projet", 0, "3"),
        tocLine("1.1 Introduction", 1, "4"),
        tocLine("1.2 Contexte académique", 1, "4"),
        tocLine("1.3 Présentation de l'organisme d'accueil", 1, "4"),
        tocLine("1.3.1 Présentation de l'entreprise", 2, "4"),
        tocLine("1.3.2 Domaines d'activité et contexte client", 2, "5"),
        tocLine("1.4 Présentation de la plateforme Nexora", 1, "5"),
        tocLine("1.4.1 Présentation générale", 2, "5"),
        tocLine("1.4.2 Fonctionnalités principales", 2, "6"),
        tocLine("1.4.3 Limites de la situation actuelle", 2, "6"),
        tocLine("1.5 Présentation du projet", 1, "7"),
        tocLine("1.5.1 Contexte et problématique", 2, "7"),
        tocLine("1.5.2 Étude de l'existant", 2, "7"),
        tocLine("1.5.3 Solution proposée", 2, "8"),
        tocLine("1.6 Workflow complet du projet", 1, "9"),
        tocLine("1.7 Méthodologie de développement", 1, "10"),
        tocLine("1.7.1 Étude comparative des méthodes", 2, "10"),
        tocLine("1.7.2 Choix méthodologique : Scrum", 2, "11"),
        tocLine("1.7.3 Organisation des rôles Scrum", 2, "12"),
        tocLine("1.7.4 Product Backlog", 2, "12"),
        tocLine("1.7.5 Planification des sprints", 2, "13"),
        tocLine("1.8 Langage et démarche de modélisation", 1, "14"),
        tocLine("1.9 Conclusion", 1, "14"),
        pb(),
        tocLine("2 Sprint 0 : Analyse des besoins et Conception du Système", 0, "15"),
        tocLine("2.1 Introduction", 1, "16"),
        tocLine("2.2 Spécification des besoins", 1, "16"),
        tocLine("2.2.1 Besoins fonctionnels", 2, "16"),
        tocLine("2.2.2 Besoins non fonctionnels", 2, "17"),
        tocLine("2.3 Analyse des besoins", 1, "17"),
        tocLine("2.3.1 Identification des acteurs", 2, "17"),
        tocLine("2.3.2 Diagramme des cas d'utilisation global", 2, "18"),
        tocLine("2.4 Architecture globale du système", 1, "19"),
        tocLine("2.5 Environnement de travail", 1, "20"),
        tocLine("2.5.1 Environnement matériel", 2, "20"),
        tocLine("2.5.2 Environnement logiciel", 2, "20"),
        tocLine("2.6 Conclusion", 1, "22"),
        pb(),
        tocLine("3 Sprint 1 : Prétraitement des données, assainissement de la qualité et pipeline ETL", 0, "23"),
        tocLine("3.1 Introduction", 1, "24"),
        tocLine("3.2 Backlog du Sprint 1", 1, "24"),
        tocLine("3.3 Présentation des données", 1, "24"),
        tocLine("3.3.1 Source des données", 2, "24"),
        tocLine("3.3.2 Description des tables principales du Data Warehouse", 2, "25"),
        tocLine("3.3.3 Modélisation dimensionnelle", 2, "25"),
        tocLine("3.4 Analyse exploratoire des données (EDA)", 1, "26"),
        tocLine("3.4.1 Analyse statistique de la production", 2, "27"),
        tocLine("3.4.2 Visualisation des séries temporelles", 2, "27"),
        tocLine("3.5 Conception et réalisation du pipeline ETL", 1, "29"),
        tocLine("3.5.1 Architecture du pipeline ETL", 2, "29"),
        tocLine("3.5.2 Extraction des données", 2, "31"),
        tocLine("3.5.3 Transformation et traitement des anomalies", 2, "32"),
        tocLine("3.5.4 Chargement dans le Data Warehouse", 2, "33"),
        tocLine("3.6 Résultats du pipeline ETL", 1, "34"),
        tocLine("3.7 Bilan du Sprint 1", 1, "34"),
        tocLine("3.8 Conclusion", 1, "35"),
        pb(),
        tocLine("4 Sprint 2 : Développement du module de gestion intelligente des stocks", 0, "36"),
        tocLine("4.1 Introduction", 1, "37"),
        tocLine("4.2 Backlog du Sprint 2", 1, "37"),
        tocLine("4.3 Architecture du module de gestion des stocks", 1, "37"),
        tocLine("4.4 Analyse des niveaux de stock et indicateurs de rotation", 1, "38"),
        tocLine("4.5 Classification opérationnelle et analyse de criticité des stocks", 1, "39"),
        tocLine("4.5.1 Typologie des statuts de stock et seuils d'autonomie", 2, "39"),
        tocLine("4.5.2 Répartition du catalogue et analyse de criticité", 2, "39"),
        tocLine("4.6 Génération des recommandations et chiffrage budgétaire", 1, "40"),
        tocLine("4.6.1 Algorithme de réapprovisionnement à horizon cible de 45 jours", 2, "40"),
        tocLine("4.6.2 Estimation du budget d'approvisionnement", 2, "40"),
        tocLine("4.6.3 Hiérarchisation des alertes d'atelier", 2, "40"),
        tocLine("4.7 Résultats obtenus", 1, "41"),
        tocLine("4.8 Bilan du Sprint 2", 1, "42"),
        tocLine("4.9 Conclusion", 1, "43"),
        pb(),
        tocLine("5 Sprint 3 : Modélisation prédictive par Intelligence Artificielle", 0, "45"),
        tocLine("5.1 Introduction", 1, "46"),
        tocLine("5.2 Backlog du Sprint 3", 1, "46"),
        tocLine("5.3 Architecture du module de modélisation prédictive", 1, "47"),
        tocLine("5.4 Préparation des données et variables explicatives", 1, "47"),
        tocLine("5.4.1 Variable cible et transformation logarithmique", 2, "47"),
        tocLine("5.4.2 Variables explicatives et facteurs d'événements", 2, "48"),
        tocLine("5.4.3 Découpage chronologique du jeu de données", 2, "48"),
        tocLine("5.5 Métriques d'évaluation de la performance", 1, "49"),
        tocLine("5.6 Développement des modèles d'intelligence artificielle", 1, "50"),
        tocLine("5.6.1 Régression Linéaire Multiple", 2, "50"),
        tocLine("5.6.2 Modèle ARIMA", 2, "51"),
        tocLine("5.6.3 Modèle Random Forest Regressor", 2, "52"),
        tocLine("5.6.4 Modèle Prophet (Meta)", 2, "53"),
        tocLine("5.7 Résultats comparatifs et évaluation des modèles à l'horizon 30 jours", 1, "54"),
        tocLine("5.8 Détection automatisée des anomalies de cadence par intervalle d'incertitude", 1, "55"),
        tocLine("5.9 Analyse explicable des composantes et robustesse", 1, "56"),
        tocLine("5.10 Rôles respectifs des modèles dans la plateforme Nexora", 1, "56"),
        tocLine("5.11 Bilan du Sprint 3", 1, "57"),
        tocLine("5.12 Conclusion", 1, "58"),
        pb(),
        tocLine("6 Sprint 4 : Développement du tableau de bord décisionnel et validation", 0, "59"),
        tocLine("6.1 Introduction", 1, "58"),
        tocLine("6.2 Backlog du Sprint 4", 1, "58"),
        tocLine("6.3 Architecture du tableau de bord et intégration applicative", 1, "59"),
        tocLine("6.4 Conception des rapports décisionnels Power BI", 1, "60"),
        tocLine("6.4.1 Tableau de bord de supervision du parc machines", 2, "60"),
        tocLine("6.4.2 Tableau de bord des prévisions de cadence", 2, "61"),
        tocLine("6.4.3 Tableau de bord de gestion des stocks", 2, "61"),
        tocLine("6.5 Présentation des interfaces réalisées", 1, "62"),
        tocLine("6.5.1 Tableau de bord principal", 2, "62"),
        tocLine("6.5.2 Historique et répartition des stocks d'atelier", 2, "63"),
        tocLine("6.5.3 Prévisions de cadence d'atelier", 2, "63"),
        tocLine("6.5.4 Pilotage des stocks et alertes d'approvisionnement", 2, "64"),
        tocLine("6.5.5 Portail web opérationnel React & Spring Boot", 2, "65"),
        tocLine("6.6 Tests et validation", 1, "66"),
        tocLine("6.6.1 Tests fonctionnels et d'intégration", 2, "66"),
        tocLine("6.6.2 Validation des prévisions d'atelier", 2, "67"),
        tocLine("6.6.3 Validation des règles d'approvisionnement", 2, "67"),
        tocLine("6.7 Bilan du Sprint 4", 1, "68"),
        tocLine("6.8 Conclusion", 1, "68"),
        pb(),
        tocLine("Conclusion générale et perspectives", 0, "69"),
        tocLine("Bibliographie", 0, "72"),
        pageBreak(),

        // TABLE DES FIGURES
        frontTitle("Table des figures"),
        tocLine("Figure 1.1 : Logo de la plateforme Nexora", 1, "6"),
        tocLine("Figure 1.2 : Workflow complet du système décisionnel Nexora", 1, "9"),
        tocLine("Figure 1.3 : Cycle itératif de la méthodologie Agile Scrum", 1, "12"),
        tocLine("Figure 2.1 : Diagramme des cas d'utilisation global de Nexora", 1, "18"),
        tocLine("Figure 2.2 : Architecture globale du système décisionnel en quatre couches", 1, "19"),
        tocLine("Figure 3.1 : Modélisation dimensionnelle et relationnelle du Data Warehouse Nexora", 1, "26"),
        tocLine("Figure 3.2 : Évolution temporelle de la production globale des 319 presses (2024–2026)", 1, "28"),
        tocLine("Figure 3.3 : Profils de saisonnalité de production par jour de semaine et par mois", 1, "28"),
        tocLine("Figure 3.4 : Heatmap d'activité atelier : cadence selon le mois et le jour de semaine", 1, "29"),
        tocLine("Figure 3.5 : Architecture et flux séquentiel du pipeline ETL", 1, "30"),
        tocLine("Figure 4.1 : Répartition des références du catalogue par statut opérationnel de stock", 1, "41"),
        tocLine("Figure 4.2 : Répartition des alertes de rupture et de stock critique par famille de matière", 1, "42"),
        tocLine("Figure 5.1 : Trajectoire des prédictions Prophet face à la production réelle d'atelier", 1, "52"),
        tocLine("Figure 6.1 : Architecture globale d'intégration et de déploiement de Nexora", 1, "60"),
        tocLine("Figure 6.2 : Vue d'ensemble du tableau de bord décisionnel Power BI Nexora", 1, "62"),
        tocLine("Figure 6.3 : Rapport Power BI « Historique d'évolution des stocks par site »", 1, "63"),
        tocLine("Figure 6.4 : Rapport Power BI « État de stock global et répartition par famille »", 1, "63"),
        tocLine("Figure 6.5 : Rapport Power BI « Prévision des cadences et charge atelier »", 1, "64"),
        tocLine("Figure 6.6 : Rapport Power BI « Gestion des stocks d'atelier et alertes »", 1, "64"),
        pageBreak(),

        // LISTE DES TABLEAUX
        frontTitle("Liste des tableaux"),
        tocLine("Tableau 1.1 : Positionnement comparatif des solutions existantes avec Nexora", 1, "9"),
        tocLine("Tableau 1.2 : Comparaison entre approche classique et approche agile", 1, "10"),
        tocLine("Tableau 1.3 : Avantages et inconvénients des méthodologies", 1, "11"),
        tocLine("Tableau 1.4 : Product Backlog priorisé du projet", 1, "13"),
        tocLine("Tableau 1.5 : Planification des sprints du projet", 1, "14"),
        tocLine("Tableau 2.1 : Les besoins non fonctionnels du système", 1, "17"),
        tocLine("Tableau 2.2 : Outils, langages et bibliothèques logiciels utilisés", 1, "21"),
        tocLine("Tableau 3.1 : Priorisation des tâches pour le Sprint 1", 1, "24"),
        tocLine("Tableau 3.2 : Périmètre quantitatif des données industrielles du projet", 1, "25"),
        tocLine("Tableau 3.3 : Structure des tables du Data Warehouse Nexora", 1, "25"),
        tocLine("Tableau 3.4 : Statistiques descriptives de la série journalière de production d'atelier", 1, "27"),
        tocLine("Tableau 3.5 : Impact des événements et variations industrielles sur la cadence", 1, "27"),
        tocLine("Tableau 3.6 : Bilan quantitatif de la qualité des données (Waterfall ETL)", 1, "32"),
        tocLine("Tableau 3.7 : Résultats quantitatifs et techniques du pipeline ETL", 1, "34"),
        tocLine("Tableau 3.8 : Bilan des livrables du Sprint 1", 1, "35"),
        tocLine("Tableau 4.1 : Priorisation des tâches pour le Sprint 2", 1, "37"),
        tocLine("Tableau 4.2 : Classification des produits selon le niveau de couverture disponible", 1, "39"),
        tocLine("Tableau 4.3 : Bilan des livrables du Sprint 2", 1, "42"),
        tocLine("Tableau 5.1 : Priorisation des tâches pour le Sprint 3", 1, "46"),
        tocLine("Tableau 5.2 : Les 14 variables explicatives du modèle de cadence", 1, "48"),
        tocLine("Tableau 5.3 : Découpage chronologique du jeu de données", 1, "49"),
        tocLine("Tableau 5.4 : Avantages et limites : Régression Linéaire", 1, "50"),
        tocLine("Tableau 5.5 : Avantages et limites : Modèle ARIMA", 1, "51"),
        tocLine("Tableau 5.6 : Avantages et limites : Random Forest", 1, "52"),
        tocLine("Tableau 5.7 : Avantages et limites : Prophet", 1, "53"),
        tocLine("Tableau 5.8 : Synthèse des performances comparatives des modèles à l'horizon 30 jours", 1, "54"),
        tocLine("Tableau 5.9 : Bilan des livrables du Sprint 3", 1, "57"),
        tocLine("Tableau 6.1 : Priorisation des tâches pour le Sprint 4", 1, "58"),
        tocLine("Tableau 6.2 : Synthèse des services REST de l'application web", 1, "65"),
        tocLine("Tableau 6.3 : Bilan des tests fonctionnels et d'intégration", 1, "66"),
        tocLine("Tableau 6.4 : Bilan des livrables du Sprint 4", 1, "68"),
        pageBreak(),

        // LISTE DES ABRÉVIATIONS
        frontTitle("Liste des abréviations"),
        makeTable(
          ["Abréviation", "Signification en Français", "Définition / Contexte Industriel"],
          [
            ["API", "Application Programming Interface", "Interface de programmation applicative pour l'échange de données inter-services"],
            ["ARIMA", "AutoRegressive Integrated Moving Average", "Modèle statistique autorégressif intégré pour séries temporelles"],
            ["BI", "Business Intelligence", "Informatique décisionnelle pour l'aide au pilotage et au reporting exécutif"],
            ["CV", "Cross-Validation (Validation Croisée)", "Méthode d'évaluation statistique par partitionnement chronologique des données"],
            ["DAX", "Data Analysis Expressions", "Langage de formules et de calculs analytiques utilisé dans Microsoft Power BI"],
            ["DWH", "Data Warehouse", "Entrepôt de données consolidant les flux industriels multi-sites (Tunisie, Rép. Tchèque)"],
            ["ERP", "Enterprise Resource Planning", "Progiciel de gestion intégré de l'entreprise (Microsoft Dynamics NAV)"],
            ["ETL", "Extract, Transform, Load", "Pipeline d'extraction, assainissement, enrichissement et chargement des données"],
            ["IA", "Intelligence Artificielle", "Ensemble des techniques et algorithmes d'apprentissage automatique"],
            ["JWT", "JSON Web Token", "Standard sécurisé pour l'authentification et l'échange de jetons de session"],
            ["KPI", "Key Performance Indicator", "Indicateur clé de performance opérationnelle et industrielle"],
            ["MAE", "Mean Absolute Error", "Erreur absolue moyenne exprimée en nombre réel de pièces par jour"],
            ["MAPE", "Mean Absolute Percentage Error", "Pourcentage moyen d'erreur absolue par rapport au volume réel"],
            ["MES", "Manufacturing Execution System", "Système de pilotage et d'exécution des ateliers de fabrication"],
            ["ML", "Machine Learning", "Apprentissage automatique supervisé et non supervisé"],
            ["OEE", "Overall Equipment Effectiveness", "Indicateur international d'efficience globale des équipements de production (équivalent anglo-saxon du TRS)"],
            ["RBAC", "Role-Based Access Control", "Contrôle d'accès aux fonctionnalités fondé sur les rôles (Opérateur, Administrateur)"],
            ["REST", "Representational State Transfer", "Style d'architecture logicielle pour les services web distribués"],
            ["RF", "Random Forest Regressor", "Algorithme d'apprentissage supervisé par forêt d'arbres de décision"],
            ["RMSE", "Root Mean Square Error", "Racine carrée de l'erreur quadratique moyenne pénalisant les grands écarts"],
            ["SQL", "Structured Query Language", "Langage de requêtage relationnel (Microsoft SQL Server)"],
            ["TND", "Dinar Tunisien", "Unité monétaire légale pour la valorisation financière des stocks"],
            ["TRG", "Taux de Rendement Global", "Rapport du temps utile de fabrication sur le temps d'ouverture d'atelier"],
            ["TRS", "Taux de Rendement Synthétique", "Indicateur composite de performance combinant disponibilité, cadence et qualité (équivalent de l'OEE)"],
            ["UML", "Unified Modeling Language", "Langage universel de modélisation visuelle des systèmes logiciels"]
          ],
          [1600, 3600, 3466]
        ),
        pageBreak(),
      ]
    },
    
    // SECTION 3 : CORPS DU RAPPORT (NUMÉROTATION ARABE 1..N)
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Nexora — Système Décisionnel Intelligent & Pilotage de Production", font: FONT, size: 18, italics: true, color: GRAY }),
                new TextRun({ children: [new Tab()], font: FONT, size: 18 }),
                new TextRun({ text: "FSM Master Data Science", font: FONT, size: 18, color: GRAY })
              ],
              alignment: AlignmentType.LEFT,
              tabStops: [{ type: TabStopType.RIGHT, position: 8666 }],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Faculté des Sciences de Monastir", font: FONT, size: 18, color: GRAY }),
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
        title1("Introduction générale"),
        body("À l'ère de l'industrie 4.0, la compétitivité et la résilience des entreprises manufacturières reposent sur leur capacité à transformer les flux de données industrielles en leviers décisionnels tangibles. Dans le secteur de la plasturgie automobile, caractérisé par des cadences de production élevées, des exigences strictes de qualité et des flux tendus, la maîtrise conjointe de la cadence de fabrication et des approvisionnements en matières premières constitue un enjeu économique et opérationnel déterminant."),
        pb(),
        body("Ce projet de fin d'études, mené en collaboration avec la société de services numériques **Maps-IT**, s'inscrit dans le cadre de l'accompagnement d'un équipementier automobile international exploitant plusieurs sites industriels en Tunisie et en Europe. Bien que l'entreprise dispose d'un entrepôt de données centralisant l'historique de ses ateliers [16], l'exploitation de ce patrimoine informationnel demeurait fragmentée. Le pilotage opérationnel reposait essentiellement sur des extractions manuelles différées, privant les décideurs d'une visibilité en temps réel. Parallèlement, l'absence d'outils prédictifs rendait la gestion des stocks vulnérable aux aléas, générant conjointement des risques de rupture sur des composants stratégiques et des immobilisations financières en surstock."),
        pb(),
        body("Face à ces constats, la problématique centrale de ce travail s'énonce ainsi :"),
        body("*« Comment valoriser les données massives d'un entrepôt industriel à travers des approches d'apprentissage automatique et d'informatique décisionnelle pour optimiser la supervision de la production, anticiper les cadences d'atelier et sécuriser la gestion des approvisionnements ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("Pour répondre à cette problématique, nous avons conçu et développé la solution **Nexora**, une plateforme décisionnelle intégrant la chaîne complète de valorisation de la donnée :"),
        bullet("**L'ingénierie et l'assainissement des données (ETL)** : conception d'un pipeline automatisé assurant la qualité, l'intégrité et la structuration dimensionnelle des données industrielles multi-sites."),
        bullet("**La modélisation prédictive par Machine Learning** : développement et évaluation comparative de modèles statistiques et d'apprentissage automatique (Régression Linéaire, ARIMA, Random Forest, Prophet) pour anticiper les cadences de fabrication sur un horizon mensuel opérationnel."),
        bullet("**L'aide à la décision et l'optimisation logistique** : segmentation analytique du catalogue d'articles, évaluation dynamique de la couverture de stock et modélisation de plans de réapprovisionnement préventifs [14, 15]."),
        bullet("**La restitution analytique multi-profils** : déploiement de tableaux de bord décisionnels Microsoft Power BI [24] pour le management et d'un portail web réactif (React.js [22], Spring Boot [17], FastAPI [21]) pour les équipes d'atelier."),
        pb(),
        body("Conduit selon la méthodologie Agile Scrum [1, 2], le projet a été structuré autour d'un sprint de cadrage (Sprint 0) et de quatre sprints de réalisation. Le présent mémoire s'organise en six chapitres :"),
        bullet("**Le chapitre 1** introduit le contexte académique et industriel du projet, l'étude comparative de l'existant, la méthodologie Scrum et les démarches de modélisation retenues [26]."),
        bullet("**Le chapitre 2 (Sprint 0)** est dédié à l'analyse des besoins fonctionnels et non fonctionnels, à la conception de l'architecture en quatre couches et au choix de l'environnement technique."),
        bullet("**Le chapitre 3 (Sprint 1)** détaille l'exploration statistique des données (EDA), l'audit qualité et la réalisation du pipeline ETL alimentant le Data Warehouse."),
        bullet("**Le chapitre 4 (Sprint 2)** présente le module de gestion intelligente des stocks, la classification opérationnelle par niveau de couverture et l'estimation des besoins de réapprovisionnement."),
        bullet("**Le chapitre 5 (Sprint 3)** expose la démarche de modélisation prédictive des cadences, l'évaluation comparative des algorithmes d'IA à l'horizon 30 jours et l'analyse explicable des composantes temporelles."),
        bullet("**Le chapitre 6 (Sprint 4)** décrit la conception des tableaux de bord Power BI, l'implémentation du portail web opérationnel et les résultats des tests fonctionnels et d'intégration."),
        pb(),
        body("Enfin, une conclusion générale récapitule les principaux apports de cette étude, en discute les limites méthodologiques et esquisse des perspectives d'évolution pour le secteur industriel."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 1 : CONTEXTE ET CADRE DU PROJET
        // =========================================================
        title1("Chapitre 1 : Contexte et cadre du projet"),

        title2("1.1 Introduction"),
        body("Ce premier chapitre présente le cadre général de notre projet de fin d'études. Nous décrivons d'abord le contexte académique au sein de la Faculté des Sciences de Monastir, puis la collaboration entre l'organisme d'accueil, la société de services numériques **Maps-IT**, et l'équipementier industriel partenaire spécialisé dans la plasturgie automobile. Nous analysons ensuite les problématiques opérationnelles rencontrées dans les ateliers d'injection plastique, les limites des outils existants et la solution **Nexora** conçue pour y répondre. Enfin, nous présentons la démarche méthodologique Agile Scrum et les démarches de modélisation retenues pour encadrer le développement du système."),
        pb(),

        title2("1.2 Contexte académique"),
        body("Ce projet est réalisé dans le cadre du **Master Professionnel en Data Science** de la Faculté des Sciences de Monastir (FSM), rattachée à l'Université de Monastir. Cette formation d'excellence prépare les étudiants à l'ingénierie des données massives, au développement d'algorithmes d'apprentissage automatique et à l'intégration de solutions logicielles d'aide à la décision."),
        pb(),
        body("Ce travail de fin d'études permet d'appliquer les compétences acquises en science des données à un environnement industriel complexe, en exploitant des données réelles issues d'un parc de 319 presses à injecter réparties sur plusieurs sites de production."),
        pb(),

        title2("1.3 Présentation de l'organisme d'accueil"),
        title3("1.3.1 Présentation de l'entreprise"),
        body("Le projet a été développé en collaboration avec **Maps-IT**, une société de services informatiques et d'ingénierie logicielle située à Monastir en Tunisie. Fondée en 2021, Maps-IT accompagne les entreprises industrielles et de services dans la mise en œuvre de solutions numériques sur mesure, le développement d'applications métiers, la conception d'architectures décisionnelles et la valorisation des données par la Data Science."),
        pb(),

        title3("1.3.2 Domaines d'activité et contexte client"),
        body("Maps-IT intervient principalement dans trois domaines complémentaires :"),
        bullet("**Développement logiciel sur mesure** : conception d'applications web et de micro-services modulaires adaptés aux processus métiers."),
        bullet("**Business Intelligence et ingénierie des données** : conception de Data Warehouse, mise en place de flux ETL fiabilisés et modélisation dimensionnelle."),
        bullet("**Data Science et Intelligence Artificielle** : exploration de séries temporelles, modélisation prédictive et algorithmes d'optimisation opérationnelle."),
        pb(),
        body("Dans le cadre de ce projet, Maps-IT intervient auprès d'un **équipementier automobile de rang 1** disposant de sites de production en Tunisie (usines de Kondar et Sousse) et en République Tchèque (site de Brno). Cet industriel produit des pièces plastiques techniques injectées sous fortes contraintes de cadence et de qualité."),
        pb(),

        title2("1.4 Présentation de la plateforme Nexora"),
        title3("1.4.1 Présentation générale"),
        body("**Nexora** est une solution logicielle d'aide à la décision conçue pour faciliter le suivi des ateliers d'injection plastique et la gestion proactive des approvisionnements de stock. Elle s'appuie sur les données centralisées dans le Data Warehouse pour proposer des indicateurs de fonctionnement mis à jour régulièrement par shift, des prévisions de cadence de production par apprentissage automatique et des recommandations quantifiées de réapprovisionnement."),
        pb(),
        ...imageFigure("logos/logo.png", "Figure 1.1 : Logo de la plateforme Nexora", 220, 90),
        body("La solution s'adresse aux équipes industrielles selon deux profils d'utilisateurs clairement délimités : les **Administrateurs** (supervision des presses, pilotage des flux, gestion des approvisionnements et des modèles) et les **Opérateurs** (consultation des stocks d'atelier, filtrage des alertes de rupture et suivi des indicateurs de production)."),
        pb(),

        title3("1.4.2 Fonctionnalités principales"),
        body("La plateforme Nexora s'articule autour de quatre fonctionnalités majeures :"),
        bullet("**Supervision du parc machines** : suivi opérationnel de l'état des 319 presses à injecter réparties sur les trois sites (Kondar, Sousse, Brno) et consolidation des indicateurs de production par shift."),
        bullet("**Prévision des volumes de fabrication** : estimation des cadences de production à l'horizon opérationnel de 30 jours pour guider l'ordonnancement des équipes et des approvisionnements matières."),
        bullet("**Gestion prévisionnelle des stocks** : classification opérationnelle des références du catalogue par niveau de criticité (Rupture, Critique, Normal, Surstock) et calcul des réapprovisionnements nécessaires pour sécuriser une couverture cible de 45 jours."),
        bullet("**Restitution décisionnelle interactive** : tableaux de bord Power BI permettant de filtrer les indicateurs par usine, atelier, presse ou famille de matière plastique, complétés par une interface web opérationnelle."),
        pb(),

        title3("1.4.3 Limites de la situation actuelle"),
        body("Avant la conception de Nexora, le pilotage industriel présentait plusieurs contraintes méthodologiques et opérationnelles :"),
        bullet("**Suivi manuel et différé de l'activité** : les feuilles d'enregistrement remplies par les opérateurs étaient consolidées mensuellement sur tableur, empêchant une détection rapide des ralentissements ou des baisses anormales de cadence."),
        bullet("**Gestion réactive des réapprovisionnements** : les commandes de granulés polymères étaient fréquemment déclenchées en réaction à une alerte visuelle de pénurie en atelier, générant des risques de rupture ou de surcoûts logistiques d'urgence."),
        bullet("**Présence conjointe de ruptures et de surstocks** : l'absence d'outils analytiques entraînait une sur-couverture sur certaines références à faible rotation (immobilisation de trésorerie), tandis que des références critiques tombaient en rupture."),
        bullet("**Fragmentation des sources d'information** : les données de production, d'en-cours et d'inventaire étaient dispersées dans l'ERP, rendant leur croisement complexe pour les décideurs."),
        pb(),

        title2("1.5 Présentation du projet"),
        title3("1.5.1 Contexte et problématique"),
        body("L'entreprise partenaire dispose d'un Data Warehouse conservant l'historique complet des déclarations de production et des instantanés d'inventaire. Toutefois, ces données massives demeuraient sous-exploitées pour anticiper les charges futures et guider la chaîne logistique."),
        body("La problématique centrale du projet se formule ainsi :"),
        body("*« Comment valoriser les données centralisées du Data Warehouse industriel pour concevoir un système décisionnel automatisé, capable de superviser l'activité des presses, de modéliser les cadences par apprentissage automatique et d'optimiser les politiques de réapprovisionnement de stock ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),

        title3("1.5.2 Étude de l'existant"),
        body("En milieu industriel, trois approches coexistent couramment : les feuilles de calcul bureautiques (Excel), les modules de base des progiciels de gestion intégrée (ERP) et les solutions spécialisées de suivi d'atelier (Manufacturing Execution Systems - MES). Les tableurs, bien que flexibles, s'avèrent vulnérables aux erreurs de saisie et inadaptés aux volumes volumineux. Les ERP fournissent un cadre transactionnel rigide mais peu analytique, tandis que les progiciels MES représentent un investissement très lourd et n'intègrent pas nativement d'algorithmes d'apprentissage statistique pour la prévision de séries temporelles."),
        pb(),

        title3("1.5.3 Solution proposée"),
        body("Pour concilier agilité décisionnelle, rigueur méthodologique et intégration opérationnelle fluide, la solution **Nexora** s'articule autour de trois piliers complémentaires :"),
        bullet("**1. L'ingénierie et l'intégration des données** : un pipeline automatisé de collecte et d'assainissement des données industrielles garantissant l'intégrité des informations avant leur consolidation dans un entrepôt de données relationnel structuré."),
        bullet("**2. La modélisation prédictive et la surveillance des cadences** : un moteur analytique exploitant des modèles d'apprentissage automatique pour anticiper les volumes de production, détecter les dérives anormales de rythme et sécuriser la planification d'atelier."),
        bullet("**3. La gestion préventive des approvisionnements** : un module décisionnel associant segmentation multicritère du catalogue et calcul dynamique des réapprovisionnements nécessaires pour prévenir les ruptures critiques tout en évitant les surstocks immobilisants."),
        pb(),
        body("L'architecture de restitution associe des tableaux de bord interactifs Microsoft Power BI pour le management décisionnel et une application web (React.js / Spring Boot / FastAPI) pour la saisie et la consultation opérationnelle."),
        pb(),
        body("Le tableau 1.1 résume le positionnement comparatif des solutions existantes vis-à-vis de Nexora :"),
        pb(),
        makeTable(
          ["Critère d'évaluation", "Progiciels MES standards", "ERP transactionnel", "Tableurs (Excel)", "Solution Nexora"],
          [
            ["Supervision des cadences atelier", "Avancé", "Non natif", "Manuel / Différé", "Automatisé par shift"],
            ["Prévisions de cadence par IA",     "Non proposé", "Non proposé", "Non proposé", "Intégré (Prophet)"],
            ["Tableaux de bord interactifs",     "Configurable", "Limité", "Statique", "Interactif (Power BI)"],
            ["Intégration directe au Data Warehouse", "Complexe", "Natif", "Instable", "Directe (Schéma relationnel)"],
            ["Gestion et criticité des stocks",  "Partiel", "Standard", "Manuel", "Par autonomie (Rupture/Critique/Alerte)"],
            ["Recommandations d'approvisionnement", "Sur règles fixes", "Sur seuils statiques", "Manuel", "Calcul de couverture dynamique"],
            ["Facilité d'appropriation atelier", "Moyenne", "Complexe", "Accessible", "Interface adaptée"],
            ["Agilité et coût de déploiement",   "Investissement élevé", "Coût élevé", "Faible", "Modulaire et maîtrisé"]
          ],
          [2400, 1800, 1600, 1400, 1466]
        ),
        new Paragraph({
          children: [
            new TextRun({ text: "Tableau 1.1 : Positionnement comparatif des solutions existantes avec Nexora", font: FONT, size: 20, italics: true, color: GRAY })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("1.6 Workflow complet du projet"),
        body("Le traitement des données et la restitution des résultats suivent un enchaînement méthodique en huit étapes, illustré par la figure 1.2 :"),
        pb(),
        ...imageFigure("diagrams/architecture.png", "Figure 1.2 : Workflow complet du système décisionnel Nexora", 460, 460),
        bullet("**1. Ingestion des données brutes** : extraction des données d'inventaire et de production issues du système d'information industriel."),
        bullet("**2. Nettoyage des données (ETL)** : suppression des doublons, rejet des dates invalides et correction des incohérences de stock."),
        bullet("**3. Calcul des variables explicatives** : ingénierie des variables prédictives (calendrier, événements d'atelier, historique de production et moyennes mobiles)."),
        bullet("**4. Découpage chronologique** : apprentissage (janvier 2024 – août 2025), validation (septembre – décembre 2025) et test (janvier – avril 2026)."),
        bullet("**5. Entraînement des modèles** : Régression Linéaire, ARIMA, Random Forest et Prophet sous validation croisée temporelle."),
        bullet("**6. Évaluation sur la période de test de 2026** : les modèles sont évalués sur des données de 2026 qui n'ont pas servi à l'apprentissage."),
        bullet("**7. Mesure des performances** : calcul des erreurs de prévision (MAE, RMSE, MAPE, R²) en pièces par jour à l'horizon opérationnel de 30 jours."),
        bullet("**8. Restitution utilisateur** : tableaux de bord Power BI et application web."),
        pb(),

        title2("1.7 Méthodologie de développement"),
        title3("1.7.1 Étude comparative des méthodes"),
        body("Avant d'entamer les développements, nous avons comparé la méthode classique en cascade et la démarche Agile (tableau 1.2) :"),
        pb(),
        makeTable(
          ["Critère", "Approche classique (Cascade)", "Approche Agile (Scrum)"],
          [
            ["Cycle de développement", "Linéaire et séquentiel", "Itératif, par incréments réguliers"],
            ["Planification", "Figée au démarrage", "Ajustable selon l'avancement réel"],
            ["Livrables", "Livraison globale en fin de projet", "Incrément fonctionnel à chaque sprint"],
            ["Prise en compte des retours", "Tardive, en phase de recette", "Continue, à chaque fin d'itération"],
            ["Principale limite", "Peu flexible face aux anomalies de données", "Exige une disponibilité régulière des encadrants"]
          ],
          [2400, 3100, 3166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.2 : Comparaison entre approche classique et approche agile", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 1.3 récapitule les avantages et limites des deux méthodologies :"),
        pb(),
        makeTable(
          ["Méthodologie", "Avantages principaux", "Inconvénients principaux"],
          [
            ["Approche classique", "• Cadre et jalons contractuels nettement fixés.\n• Simplicité de contractualisation initiale.", "• Faible flexibilité face aux anomalies de données.\n• Risque de décalage avec les attentes d'atelier."],
            ["Approche Agile (Scrum)", "• Adaptabilité forte aux spécificités des séries réelles.\n• Validation progressive et mesurable de chaque module.\n• Rétroactions régulières avec les encadrants.", "• Exige une disponibilité continue des parties prenantes.\n• Nécessite une discipline stricte sur la tenue du backlog."]
          ],
          [2200, 3200, 3266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.3 : Avantages et inconvénients des méthodologies", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.7.2 Choix méthodologique : Scrum"),
        body("Nous avons sélectionné le framework Agile Scrum [1, 2], particulièrement approprié aux projets décisionnels et de science des données combinant plusieurs briques interdépendantes (ETL, algorithmes prédictifs, règles logistiques et restitution visuelle)."),
        pb(),
        body("Ce cadre itératif favorise l'ajustement continu des modèles en fonction de la qualité observée des données et permet de valider chaque composant logiciel auprès des encadrants."),
        pb(),
        body("La figure 1.3 illustre le cycle de déroulement de la méthodologie Scrum appliquée à notre projet :"),
        pb(),
        ...imageFigure("scrum-framework-9.29.23.png", "Figure 1.3 : Cycle itératif de la méthodologie Agile Scrum", 520, 320),
        pb(),

        title3("1.7.3 Organisation des rôles Scrum"),
        body("Pour concilier la rigueur académique d'un travail de Master et les exigences industrielles de l'atelier, les rôles Scrum ont été répartis de la manière suivante :"),
        bullet("**Product Owner (PO)** : assumé par l'encadrant professionnel au sein de Maps-IT en lien avec l'équipe de l'usine partenaire. Il exprime les besoins fonctionnels, priorise les récits utilisateurs du backlog et valide les incréments à chaque revue de sprint."),
        bullet("**Scrum Master (SM)** : assuré par l'encadrant académique à la Faculté des Sciences de Monastir. Il veille au respect du cadre méthodologique Agile, garantit la rigueur scientifique des protocoles de validation et aide à lever les blocages conceptuels."),
        bullet("**Équipe de Développement (Development Team)** : incarnée par l'étudiante chercheuse, responsable de la conception technique, du développement du pipeline ETL, de l'expérimentation des algorithmes d'apprentissage et de la réalisation des interfaces."),
        pb(),

        title3("1.7.4 Product Backlog"),
        body("Le Product Backlog (tableau 1.4) regroupe les récits utilisateurs (User Stories) formalisant les exigences du système, priorisés et estimés pour chaque sprint de développement, et répartis entre les deux rôles de la plateforme (**l'Administrateur** et **l'Opérateur**) :"),
        pb(),
        makeTable(
          ["ID", "Récit Utilisateur (User Story)", "Priorité", "Estimation", "Sprint Associé"],
          [
            ["US01", "En tant qu'administrateur, je veux auditer la qualité des données brutes d'inventaire afin d'éliminer les doublons et anomalies", "Haute", "3 jours", "Sprint 1"],
            ["US02", "En tant qu'administrateur, je veux exécuter un pipeline ETL en Python pour assainir et charger les données dans le Data Warehouse", "Haute", "4 jours", "Sprint 1"],
            ["US03", "En tant qu'administrateur, je veux structurer le schéma dimensionnel en étoile pour interconnecter faits et dimensions", "Haute", "3 jours", "Sprint 1"],
            ["US04", "En tant qu'administrateur, je veux charger les données d'inventaire assainies et indexer les tables dans SQL Server", "Haute", "2 jours", "Sprint 1"],
            ["US05", "En tant qu'administrateur, je veux générer les variables temporelles, retardées et d'événements industriels pour alimenter les prévisions", "Haute", "3 jours", "Sprint 1"],
            ["US06", "En tant qu'administrateur, je veux classifier les références d'articles selon leur niveau d'autonomie et de risque opérationnel", "Haute", "3 jours", "Sprint 2"],
            ["US07", "En tant qu'administrateur, je veux analyser la répartition des stocks par famille de matières et détecter les besoins d'atelier", "Moyenne", "3 jours", "Sprint 2"],
            ["US08", "En tant qu'opérateur, je veux consulter la couverture en jours et le stock disponible de chaque référence d'atelier", "Haute", "2 jours", "Sprint 2"],
            ["US09", "En tant qu'opérateur, je veux recevoir des alertes visuelles immédiates en cas de rupture ou de stock critique sur une référence", "Haute", "2 jours", "Sprint 2"],
            ["US10", "En tant qu'administrateur, je veux calculer les quantités de réapprovisionnement requises pour sécuriser l'horizon cible de couverture", "Haute", "3 jours", "Sprint 2"],
            ["US11", "En tant qu'administrateur, je veux chiffrer l'enveloppe budgétaire globale des réapprovisionnements prioritaires", "Moyenne", "2 jours", "Sprint 2"],
            ["US12", "En tant qu'administrateur, je veux configurer le partitionnement chronologique des données (entraînement, validation, test)", "Haute", "2 jours", "Sprint 3"],
            ["US13", "En tant qu'administrateur, je veux comparer les performances des modèles d'IA et sélectionner le modèle déployé en production", "Haute", "4 jours", "Sprint 3"],
            ["US14", "En tant qu'administrateur, je veux évaluer les modèles selon les différents horizons de prévision court et moyen termes", "Haute", "3 jours", "Sprint 3"],
            ["US15", "En tant qu'administrateur, je veux générer les prévisions de cadence de production selon les horizons de planification", "Haute", "3 jours", "Sprint 3"],
            ["US16", "En tant qu'administrateur, je veux analyser l'explicabilité et les bornes d'incertitude des prévisions", "Haute", "3 jours", "Sprint 3"],
            ["US17", "En tant qu'opérateur ou administrateur, je veux m'authentifier de manière sécurisée (JWT) et accéder aux fonctionnalités de mon rôle", "Haute", "3 jours", "Sprint 4"],
            ["US18", "En tant qu'administrateur, je veux superviser le statut et les cadences de production du parc de presses sur un rapport Power BI", "Haute", "4 jours", "Sprint 4"],
            ["US19", "En tant qu'administrateur, je veux analyser les prévisions de cadence et les alertes d'approvisionnement sur Power BI", "Haute", "4 jours", "Sprint 4"],
            ["US20", "En tant qu'opérateur, je veux consulter l'état des stocks d'atelier, filtrer les alertes par site et exporter les données d'inventaire", "Moyenne", "3 jours", "Sprint 4"]
          ],
          [700, 4966, 1000, 1100, 900]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.4 : Product Backlog priorisé du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.7.5 Planification des sprints"),
        body("Le projet s'est déroulé sur une période de 13 semaines articulée en un sprint de cadrage initial (Sprint 0) et quatre sprints de développement d'une durée de 2 à 3 semaines chacun (tableau 1.5) :"),
        pb(),
        makeTable(
          ["Sprint", "Objectif principal", "Livrables clés validés"],
          [
            ["Sprint 0", "Cadrage des besoins et architecture globale", "Spécifications fonctionnelles, cas d'utilisation UML et architecture logicielle."],
            ["Sprint 1", "Qualité des données et pipeline ETL", "Pipeline Python de nettoyage, structuration dimensionnelle du Data Warehouse et chargement des données validées."],
            ["Sprint 2", "Gestion intelligente des stocks", "Classification par niveau de criticité, seuils d'alerte, règles de réapprovisionnement et estimation budgétaire."],
            ["Sprint 3", "Modélisation prédictive par IA", "Entraînement et comparaison des modèles d'apprentissage automatique, sélection du modèle de production et validation temporelle."],
            ["Sprint 4", "Restitution décisionnelle et validation", "Tableaux de bord Power BI, portail web opérationnel, mesures d'atelier et recette fonctionnelle."]
          ],
          [1800, 3400, 3866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.5 : Planification des sprints du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("1.8 Langage et démarche de modélisation"),
        body("Pour modéliser la structure et le comportement du système avec rigueur et clarté, nous mobilisons le langage standard **UML (Unified Modeling Language)** [26] pour le cadrage fonctionnel, complété par les représentations de flux propres aux projets de Data Science. Trois types de représentations graphiques sont principalement employés dans ce rapport :"),
        bullet("**Diagramme de cas d'utilisation global (Chapitre 2)** : formalisation synthétique des services offerts aux deux acteurs du système (Opérateur d'atelier et Administrateur), avec identification des relations d'inclusion d'authentification."),
        bullet("**Modélisation dimensionnelle et relationnelle (Chapitre 3)** : schéma conceptuel et relationnel de l'entrepôt de données (Data Warehouse) articulant la table de faits d'atelier et les dimensions associées."),
        bullet("**Cartographies d'architecture et flux de données (Chapitres 2, 3 et 6)** : description modulaire des couches du système décisionnel, du pipeline séquentiel ETL et de l'intégration globale de la plateforme."),
        pb(),

        title2("1.9 Conclusion"),
        conclusionBox("Ce premier chapitre a posé les fondations du projet Nexora. Après avoir situé le cadre académique et la collaboration entre Maps-IT et l'équipementier automobile, nous avons formalisé la problématique du pilotage d'atelier et présenté l'organisation itérative Scrum adoptée. Le chapitre suivant détaille les résultats du Sprint 0, consacré à la spécification des besoins et à la conception de l'architecture globale en quatre couches."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 2 : SPRINT 0 : ANALYSE DES BESOINS ET CONCEPTION
        // =========================================================
        title1("Chapitre 2 : Sprint 0 : Analyse des besoins et Conception du Système"),

        title2("2.1 Introduction"),
        body("Ce chapitre correspond au Sprint 0 de notre démarche Scrum. Cette étape de cadrage initial a pour objectif de formaliser les exigences du système **Nexora**, d'identifier les profils d'utilisateurs et leurs interactions avec la plateforme, de concevoir l'architecture globale en quatre couches et de définir l'environnement technique retenu pour le développement."),
        pb(),

        title2("2.2 Spécification des besoins"),
        body("La spécification des besoins permet de traduire les attentes des équipes d'atelier en fonctionnalités logicielles concrètes. Nous distinguons les besoins fonctionnels, qui précisent les services fournis par le système, des besoins non fonctionnels, qui définissent les critères de qualité technique et de performance."),
        pb(),

        title3("2.2.1 Besoins fonctionnels"),
        body("Les fonctionnalités attendues sont organisées selon les deux profils d'utilisateurs du système :"),
        bullet("**L'Opérateur** : acteur d'atelier habilité à consulter l'état des stocks réels, filtrer les alertes de criticité par site et suivre les indicateurs de fabrication des presses."),
        bullet("**L'Administrateur** : superviseur d'atelier et responsable logistique. Il assure le pilotage opérationnel (supervision du parc machines, planification des ordres de fabrication, suivi des cadences d'atelier, consultation des prévisions d'IA à 30 jours) ainsi que l'administration technique (gestion des comptes et contrôle d'accès RBAC)."),
        pb(),

        title3("2.2.2 Besoins non fonctionnels"),
        body("Le tableau 2.1 récapitule les exigences non fonctionnelles retenues pour guider la conception de la solution :"),
        pb(),
        makeTable(
          ["Catégorie", "Exigence", "Critère de vérification"],
          [
            ["Performance", "Temps de réponse interactif inférieur à 2 secondes pour l'affichage des tableaux de bord et requêtes analytiques.", "Mesures de temps de réponse et fluidité des affichages."],
            ["Sécurité", "Authentification sécurisée par jetons JWT, gestion des rôles (RBAC) et traçabilité des accès.", "Contrôle des permissions Opérateur / Admin."],
            ["Fiabilité", "Données d'entrée assainies par le pipeline ETL et modèles de prévision rigoureusement validés.", "Zéro doublon résiduel dans le Data Warehouse et cohérence des résultats."],
            ["Maintenabilité", "Architecture modulaire découplée en 4 couches avec séparation nette entre ETL, modélisation et restitution.", "Code versionné et documenté."],
            ["Évolutivité", "Capacité d'intégrer ultérieurement des modèles de prévision par presse ou des capteurs IoT sans refonte.", "Schéma dimensionnel normalisé."],
            ["Ergonomie", "Tableaux de bord visuels intuitifs et interface web réactive adaptée aux postes d'atelier.", "Navigation fluide et lisibilité opérationnelle."]
          ],
          [2200, 4200, 2266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.1 : Les besoins non fonctionnels du système", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("2.3 Analyse des besoins"),
        title3("2.3.1 Identification des acteurs"),
        body("L'analyse des cas d'utilisation met en évidence deux acteurs intervenant sur la plateforme Nexora :"),
        bullet("**1. L'Opérateur** : acteur opérationnel en atelier, responsable du suivi des stocks d'atelier, du filtrage des alertes de couverture et de la consultation d'avancement des ordres de fabrication."),
        bullet("**2. L'Administrateur** : acteur de gestion et de supervision, assurant le pilotage d'atelier (supervision des presses, consultation des cadences et des prévisions IA, gestion des alertes d'approvisionnement) ainsi que l'administration des accès."),
        pb(),

        title3("2.3.2 Diagramme des cas d'utilisation global"),
        body("La figure 2.1 présente le diagramme de cas d'utilisation global de la plateforme Nexora, illustrant les interactions entre les deux acteurs et les modules applicatifs :"),
        pb(),
        ...imageFigure("diagrams/global_usecase.png", "Figure 2.1 : Diagramme des cas d'utilisation global de Nexora", 500, 500),
        body("L'ensemble des cas d'utilisation intègre systématiquement la relation d'inclusion <<include>> avec l'opération « S'authentifier », garantissant un contrôle d'accès conforme aux privilèges de chaque acteur."),
        pb(),

        title2("2.4 Architecture globale du système"),
        body("Pour assurer la robustesse, la modularité et l'évolutivité de la solution, l'architecture globale de Nexora est structurée en **quatre couches logiques**, comme l'illustre la figure 2.2 :"),
        pb(),
        ...imageFigure("diagrams/arch_logique.png", "Figure 2.2 : Architecture globale du système décisionnel en quatre couches", 540, 260),
        bullet("**1. Couche Données (Data Layer)** : articulée autour de Microsoft SQL Server 2022 [16], elle héberge le Data Warehouse centralisant les référentiels du parc machines, les historiques de fabrication et de cadence d'atelier, les états d'inventaire des stocks, les projections prédictives d'IA ainsi que la gestion de la sécurité et des droits d'accès."),
        bullet("**2. Couche Traitement & ETL (Processing Layer)** : développée en Python 3.10 [18] avec Pandas [19] et NumPy [20], elle orchestre l'ingestion automatisée, le dédoublonnage, le traitement des anomalies qualité et la structuration des données en schéma dimensionnel."),
        bullet("**3. Couche Métier & IA (Business & AI Layer)** : regroupe les services d'apprentissage automatique (Régression Linéaire, ARIMA, Random Forest, Prophet [12] déployé en production pour les prévisions de cadence) ainsi que le moteur logistique de calcul des couvertures de stock. Les projections sont automatiquement persistées dans le Data Warehouse. Cette couche intègre également un micro-service FastAPI [21] pour l'inférence des modèles et un serveur d'entreprise Spring Boot [17] pour la gestion des règles métiers et du contrôle d'accès (RBAC)."),
        bullet("**4. Couche Restitution & Présentation (Presentation Layer)** : propose une double modalité d'accès adaptée aux profils d'utilisateurs : d'une part, des tableaux de bord décisionnels interactifs sous Microsoft Power BI [24] connectés directement au Data Warehouse pour le pilotage managérial ; d'autre part, un portail web réactif en React.js [22] et TypeScript [23] pour la supervision opérationnelle et les consultations d'atelier."),
        pb(),

        title2("2.5 Environnement de travail"),
        title3("2.5.1 Environnement matériel"),
        body("Les phases de préparation des données, d'entraînement des modèles et de développement ont été réalisées sur une station de travail présentant les caractéristiques suivantes :"),
        bullet("**Processeur** : Intel Core i7."),
        bullet("**Mémoire vive (RAM)** : 16 Go."),
        bullet("**Stockage** : Disque SSD de 512 Go."),
        bullet("**Système d'exploitation** : Microsoft Windows 11 (64 bits)."),
        pb(),

        title3("2.5.2 Environnement logiciel"),
        body("Le tableau 2.2 présente l'ensemble des outils, langages, bibliothèques et frameworks mobilisés pour la conception et l'implémentation de Nexora :"),
        pb(),
        makeTable(
          ["Catégorie", "Technologie / Outil", "Version", "Rôle et usage dans le projet"],
          [
            ["Développement", "Visual Studio Code", "1.104", "Éditeur principal pour les scripts Python ETL/ML et le code frontend React."],
            ["Développement", "IntelliJ IDEA", "2024.1", "Environnement de développement dédié au serveur backend Spring Boot."],
            ["Gestion de version", "Git & GitHub", "2.52", "Gestion des versions du code source et traçabilité des livrables."],

            ["Stockage de données", "Microsoft SQL Server", "2022", "Système de gestion de base de données relationnelle hébergeant le Data Warehouse [16]."],
            ["Stockage de données", "SQL Server Management Studio", "19.3", "Administration des bases, exécution des requêtes SQL et optimisation des index."],

            ["Langages", "Python", "3.10", "Langage principal pour le pipeline ETL, l'ingénierie des variables et les modèles d'IA [18]."],
            ["Langages", "Java", "17 (LTS)", "Langage orienté objet pour les services backend Spring Boot."],
            ["Langages", "TypeScript / JavaScript", "4.7 / ES2022", "Développement typé du frontend web React [23]."],

            ["Services & Backend", "Spring Boot", "3.4.5", "Framework backend assurant la sécurité JWT, le modèle de données JPA et les API REST [17]."],
            ["Services & Backend", "FastAPI", "0.115.5", "Micro-service Python asynchrone pour l'inférence des modèles ML avec mise à jour périodique [21]."],

            ["Frontend Web", "React.js", "18.0", "Bibliothèque d'interfaces graphiques composables pour le portail atelier [22]."],

            ["Data Science & ML", "Pandas & NumPy", "2.1 / 1.26", "Manipulation des séries tabulaires et calculs vectorisés [19, 20]."],
            ["Data Science & ML", "Prophet", "1.1.6", "Modèle déployé en production (prévisions de cadence et stocks, décomposition saisonnière) [12]."],
            ["Data Science & ML", "Scikit-Learn", "1.5.2", "Normalisation, Random Forest (benchmark récursif), Régression Linéaire et métriques [11]."],
            ["Data Science & ML", "Statsmodels", "0.14", "Modèle statistique ARIMA et tests de stationnarité (ADF) [10]."],

            ["Business Intelligence", "Microsoft Power BI Desktop", "2.152", "Conception des rapports décisionnels interactifs et modélisation DAX [24]."]
          ],
          [2000, 2400, 1200, 3066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.2 : Outils, langages et bibliothèques logiciels utilisés", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("2.6 Conclusion"),
        conclusionBox("Ce chapitre a formalisé le cadre fonctionnel et technique du système Nexora issu du Sprint 0. Nous avons identifié les exigences des deux acteurs d'atelier, établi l'architecture modulaire en quatre couches et sélectionné un écosystème technologique robuste combinant SQL Server, Python, Spring Boot, FastAPI, React et Power BI. Le chapitre suivant aborde le Sprint 1, dédié au nettoyage des données et au développement du pipeline ETL."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 3 : SPRINT 1 : PRÉTRAITEMENT ET PIPELINE ETL
        // =========================================================
        title1("Chapitre 3 : Sprint 1 : Prétraitement des données, assainissement de la qualité et pipeline ETL"),

        title2("3.1 Introduction"),
        body("Ce chapitre correspond au Sprint 1 de notre démarche Agile Scrum. Dans un projet d'analyse de données et d'aide à la décision, la qualité des informations en entrée conditionne directement la fiabilité des modèles prédictifs et des indicateurs de gestion. Dans un environnement industriel réel, les extractions de bases opérationnelles comportent inévitablement des anomalies de saisie, des redondances et des valeurs manquantes. L'objectif de ce premier sprint est donc d'auditer les données brutes, de concevoir un pipeline de nettoyage modulaire en Python [18], d'appliquer les règles d'assainissement et de charger les tables validées dans le Data Warehouse sous un schéma relationnel et dimensionnel."),
        pb(),

        title2("3.2 Backlog du Sprint 1"),
        body("Le tableau 3.1 présente les tâches planifiées pour le Sprint 1, ordonnancées par priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Extraction et audit de qualité des fichiers d'inventaire et de production bruts", "3 jours"],
            ["Élevée", "Développement des fonctions de nettoyage des anomalies recensées", "4 jours"],
            ["Élevée", "Modélisation dimensionnelle et structuration du schéma du Data Warehouse", "3 jours"],
            ["Élevée", "Chargement automatisé des données d'inventaire assainies dans SQL Server", "2 jours"],
            ["Élevée", "Calcul et ingénierie des variables explicatives", "3 jours"],
            ["Moyenne", "Analyse exploratoire des séries de cadence (distributions, tendances, saisonnalités)", "2 jours"],
            ["Moyenne", "Création des index sur les tables du Data Warehouse", "1 jour"],
            ["Faible", "Génération automatique des journaux d'exécution et du rapport d'audit", "1 jour"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.1 : Priorisation des tâches pour le Sprint 1", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("3.3 Présentation des données"),
        title3("3.3.1 Source des données"),
        body("Les données exploitées dans ce projet proviennent des extractions du système d'information industriel de l'équipementier partenaire, couvrant les usines de Kondar et Sousse en Tunisie ainsi que le site de Brno en République Tchèque. La période d'observation s'étend du **1er janvier 2024 au 30 avril 2026** (soit 851 jours consécutifs d'activité industrielle)."),
        body("Ces sources couvrent les déclarations de fabrication, les mouvements d'inventaire physique, le référentiel des articles et le suivi du parc machines. Après prétraitement par le pipeline ETL, ces flux alimentent le Data Warehouse pour l'analyse décisionnelle et la modélisation prédictive."),
        pb(),
        makeTable(
          ["Indicateur du périmètre de données", "Valeur constatée", "Description"],
          [
            ["Période temporelle couverte", "01/01/2024 – 30/04/2026", "851 jours consécutifs de production d'atelier."],
            ["Données brutes d'inventaire extraites", "51 500 enregistrements", "Extraction initiale des déclarations de stock."],
            ["Lignes d'inventaire nettoyées et validées", "32 043 enregistrements", "Lignes valides chargées dans le Data Warehouse."],
            ["Lignes d'inventaire détaillées d'atelier", "6 875 lignes actives", "Inventaire ventilé par atelier, dépôt et lot."],
            ["Références articles au catalogue", "800 références uniques", "Articles distincts du référentiel produit."],
            ["Presses à injecter suivies", "319 machines", "Parc de presses réparti sur les 3 sites industriels."],
            ["En-cours de fabrication enregistrés", "8 344 enregistrements", "Suivi des ordres d'injection en atelier."]
          ],
          [3500, 2400, 2766]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.2 : Périmètre quantitatif des données industrielles du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.2 Description des tables du Data Warehouse"),
        body("Le Data Warehouse Microsoft SQL Server (base `dbDWH`) est modélisé autour d'un schéma optimisé pour les requêtes analytiques [16], articulé autour de cinq tables réelles interconnectées couvrant les flux de production, les stocks, le parc machines, la sécurité et les prédictions d'IA :"),
        pb(),
        makeTable(
          ["Nom de la table", "Nature", "Rôle et contenu fonctionnel"],
          [
            ["dbo.FACT_CLE", "Table de faits", "Déclarations d'atelier et production réelle (876 128 enregistrements) : ordres de fabrication, code presse, dates de postes, volumes bruts, rebuts, temps de cycle et mesure pivot « Quantité produite TRS »."],
            ["dbo.ASTOCKDATE", "Table de faits", "Instantanés d'inventaire et stocks physiques : 800 références d'articles du catalogue, quantités disponibles, valorisation unitaire (Cout en TND), sites (Kondar, Sousse, Brno) et statut de couverture."],
            ["dbo.MCMachineCenter", "Dimension", "Référentiel des 319 presses à injecter : identifiant machine (MACH-001 à MACH-319), désignation, tonnage, atelier d'affectation, site industriel et indicateur d'efficience nominale."],
            ["dbo.ml_production_predictions", "Table analytique", "Persistance des prévisions d'IA : horizon opérationnel de 30 jours, cadences journalières prédites par Prophet et Random Forest, capacités maximales, métriques d'erreur (MAE, RMSE, MAPE) et recommandations."],
            ["dbo.app_users", "Table système", "Gestion de la sécurité et contrôle d'accès : comptes utilisateurs, hachage sécurisé des mots de passe, traçabilité et affectation des deux rôles applicatifs (Administrateur et Opérateur)."]
          ],
          [2400, 1800, 4466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.3 : Structure des tables du Data Warehouse Nexora", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.3 Modélisation dimensionnelle et relationnelle"),
        body("La figure 3.1 présente le schéma relationnel et dimensionnel modélisant l'agencement des tables au sein de la base de données SQL Server :"),
        pb(),
        ...imageFigure("diagrams/er_diagram.png", "Figure 3.1 : Modélisation dimensionnelle et relationnelle du Data Warehouse Nexora", 440, 520),
        body("L'architecture des données s'articule autour des interconnexions suivantes :"),
        bullet("**MCMachineCenter vers FACT_CLE** : la dimension des machines est reliée à la table de faits de production par le code machine `[No_]`, permettant d'agréger les volumes d'injection et le TRS (Taux de Rendement Synthétique / OEE) par presse, atelier ou site."),
        bullet("**FACT_CLE vers ASTOCKDATE** : chaque déclaration de fabrication est reliée logiquement aux références de matières premières et résines plastiques consommées (`Item No_` vers `No_`), assurant la synchronisation entre cadence de fabrication et déstockage."),
        bullet("**FACT_CLE vers ml_production_predictions** : les séries chronologiques de production d'atelier issues de `FACT_CLE` alimentent l'entraînement des modèles d'IA, dont les projections calculées sont persistées dans la table analytique des prévisions."),
        bullet("**app_users** : garantit l'intégrité et le cloisonnement des droits d'accès sur l'ensemble des modules d'atelier et de supervision décisionnelle."),
        pb(),

        title2("3.4 Analyse exploratoire des données (EDA)"),
        title3("3.4.1 Analyse statistique de la production"),
        body("Une exploration statistique descriptive a été menée sur l'agrégat journalier de la production de pièces conformes (sur l'ensemble des 319 presses) afin d'en cerner la tendance centrale et la variabilité :"),
        pb(),
        makeTable(
          ["Variable de production", "Minimum", "Maximum", "Moyenne", "Médiane", "Écart-type", "CV (%)"],
          [
            ["Cadence journalière globale (pcs/j)", "12 450", "148 620", "64 890", "63 120", "19 450", "30,0 %"],
            ["Heures d'injection effectives / jour", "420 h", "2 380 h", "1 840 h", "1 890 h", "295 h", "16,0 %"],
            ["Heures d'arrêts machines / jour", "45 h", "890 h", "285 h", "260 h", "115 h", "40,4 %"],
            ["Taux de rebut moyen d'atelier", "0,4 %", "6,8 %", "1,85 %", "1,70 %", "0,65 %", "35,1 %"],
            ["Taux de conformité des pièces (%)", "93,2 %", "99,6 %", "98,15 %", "98,30 %", "0,65 %", "0,7 %"]
          ],
          [2400, 1000, 1000, 1100, 1100, 1000, 1066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.4 : Statistiques descriptives de la série journalière de production d'atelier", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 3.5 détaille l'impact mesuré des événements industriels et des variations calendaires sur la cadence d'atelier :"),
        pb(),
        makeTable(
          ["Période / Événement opérationnel", "Nb jours", "Cadence Moy. (pcs/j)", "Cadence Max (pcs/j)", "Ratio vs Normal"],
          [
            ["Activité nominale standard", "580", "66 420", "98 450", "1,00"],
            ["Période estivale (congés constructeurs)", "45", "38 210", "52 100", "0,58"],
            ["Pics de livraison de fin de trimestre", "60", "94 850", "148 620", "1,43"],
            ["Maintenance annuelle programmée", "14", "18 900", "28 400", "0,28"],
            ["Changements d'outillages (moules)", "72", "54 300", "76 200", "0,82"],
            ["Période de Ramadan (horaires adaptés)", "80", "56 800", "79 100", "0,86"]
          ],
          [2600, 1100, 1800, 1800, 1366]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.5 : Impact des événements et variations industrielles sur la cadence", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("*Note explicative* : La moyenne journalière pondérée calculée d'après la décomposition opérationnelle du Tableau 3.5 s'établit à **64 221 pièces/jour** (54 652 250 pièces / 851 jours). Le léger écart avec la moyenne descriptive empirique de 64 890 pièces/jour (+1,04 %, Tableau 3.4) s'explique par les ajustements de cadence intra-journaliers et les variations d'équipes lors des jours de basculement entre régimes de fabrication."),
        pb(),

        title3("3.4.2 Visualisation des séries temporelles"),
        body("La figure 3.2 retrace l'évolution temporelle de la production journalière globale sur les 851 jours observés, mettant en lumière le rythme soutenu de l'atelier entrecoupé des baisses saisonnières estivales et hivernales :"),
        pb(),
        ...imageFigure("image/fig_3_2_production_evolution.png", "Figure 3.2 : Évolution temporelle de la production globale des 319 presses (2024–2026)", 540, 230),
        body("La figure 3.3 présente la distribution de la cadence selon le jour de la semaine et le mois de l'année, démontrant la régularité du rythme du lundi au vendredi et l'allègement habituel des équipes le week-end :"),
        pb(),
        ...imageFigure("image/fig_3_3_saisonnalite.png", "Figure 3.3 : Profils de saisonnalité de production par jour de semaine et par mois", 540, 220),
        body("La figure 3.4 illustre la carte thermique croisant mois et jours de la semaine, localisant avec précision les périodes de forte sollicitation des presses :"),
        pb(),
        ...imageFigure("image/fig_3_4_heatmap.png", "Figure 3.4 : Heatmap d'activité atelier : cadence selon le mois et le jour de semaine", 540, 230),
        pb(),

        title2("3.5 Conception et réalisation du pipeline ETL"),
        title3("3.5.1 Architecture du pipeline ETL"),
        body("Le pipeline de traitement, développé en Python [18, 19], est conçu de façon modulaire afin de garantir la reproductibilité et la traçabilité des transformations. Il s'articule en quatre phases séquentielles :"),
        bullet("**1. Ingestion** : lecture des fichiers d'extraction bruts et contrôle de leur structure."),
        bullet("**2. Assainissement de la qualité** : application ordonnée des traitements de nettoyage décrits en section 3.5.3."),
        bullet("**3. Structuration dimensionnelle** : séparation des données en tables de dimensions et de faits conformément au modèle dimensionnel en étoile de Kimball [8]."),
        bullet("**4. Chargement dans le Data Warehouse** : insertion performante par lots dans SQL Server [16] avec mise à jour des index et journalisation."),
        pb(),
        body("La figure 3.5 illustre le flux séquentiel des données à travers le pipeline ETL :"),
        pb(),
        ...imageFigure("diagrams/sprint1_activity.png", "Figure 3.5 : Architecture et flux séquentiel du pipeline ETL", 520, 240),

        title3("3.5.2 Extraction des données"),
        body("Le module d'extraction extrait les données brutes issues des exports ERP sans modifier les structures initiales. Les données textuelles sont chargées sous forme brute pour permettre l'évaluation quantitative des anomalies avant toute opération de correction."),
        pb(),

        title3("3.5.3 Transformation et traitement des anomalies"),
        body("Afin d'illustrer pas à pas la cascade d'assainissement avec des métriques de contrôle traçables, les traitements sont présentés sur l'**échantillon d'audit documenté de 51 500 enregistrements** issu des exports de l'ERP. Le module de nettoyage regroupe ses traitements en cinq actions :"),
        bullet("**1. Suppression des doublons** : élimination de 18 337 lignes répétées pour une même date, un même article et un même site."),
        bullet("**2. Contrôle des dates** : mise au même format de toutes les dates et rejet de 660 lignes portant une date impossible (par exemple un 30 février)."),
        bullet("**3. Harmonisation des formats** : uniformisation des nombres (séparateur décimal, unités écrites dans les quantités) et des libellés (familles de matière, noms de sites)."),
        bullet("**4. Correction des coûts unitaires** : remplacement des coûts négatifs ou nuls par le coût médian de la famille de matière, et régularisation des stocks négatifs transitoires."),
        bullet("**5. Traitement des valeurs manquantes** : rejet de 460 lignes sans référence article exploitable et attribution de valeurs par défaut aux champs secondaires."),
        pb(),
        body("Le tableau 3.6 résume la cascade de rétention mesurée sur cet échantillon d'audit :"),
        pb(),
        makeTable(
          ["Étape de traitement ETL", "Volume (lignes)", "Variation"],
          [
            ["Volume brut extrait de l'ERP (Échantillon d'audit)", "51 500", "100 %"],
            ["Suppression des doublons stricts", "- 18 337", "- 35,61 %"],
            ["Rejet des dates et identifiants articles invalides (660 + 460)", "- 1 120", "- 2,17 %"],
            ["**Volume final validé chargé dans le Data Warehouse**", "**32 043**", "**Rétention : 62,22 %**"]
          ],
          [4800, 1800, 2066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.6 : Cascade de rétention sur l'échantillon d'audit documenté (51 500 lignes)", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Appliqué en production sur l'extraction globale de **862 065 lignes**, ce même pipeline retient 97,01 % des données pour alimenter les **814 065 enregistrements actifs** consolidés dans la table `dbo.ASTOCKDATE` du Data Warehouse."),
        body("À l'issue du nettoyage, les variables explicatives (calendrier, événements d'atelier, historique de production et moyennes mobiles) sont calculées pour alimenter les modèles de prévision ; elles sont détaillées au chapitre 5."),
        pb(),

        title3("3.5.4 Chargement dans le Data Warehouse"),
        body("La phase finale insère les données transformées dans les tables SQL Server du Data Warehouse [16]. Pour accélérer l'affichage des analyses, des index ont été créés sur les clés des tables ainsi que sur les champs de date et de référence article."),
        pb(),

        title2("3.6 Résultats du pipeline ETL"),
        body("Le tableau 3.7 synthétise les indicateurs de performance obtenus lors de l'exécution complète du pipeline sur l'échantillon d'audit :"),
        pb(),
        makeTable(
          ["Indicateur de performance ETL", "Valeur mesurée", "Interprétation"],
          [
            ["Lignes brutes traitées en entrée (Échantillon)", "51 500 enregistrements", "Volume d'inventaire audité extrait de l'ERP."],
            ["Lignes validées chargées dans le Data Warehouse", "32 043 enregistrements", "Volume assaini correspondant dans dbo.ASTOCKDATE."],
            ["Taux de rétention de données assainies", "62,22 %", "Après suppression des doublons (-35,6 %) et rejets (-2,2 %)."],
            ["Taux d'anomalies résiduelles post-traitement", "0,0 %", "Toutes les contraintes d'intégrité et de format sont satisfaites."],
            ["Variables créées pour l'apprentissage", "14 variables explicatives", "Prêtes pour la modélisation prédictive."],
            ["Temps moyen d'exécution du pipeline", "2,62 secondes", "Traitement rapide et reproductible de l'échantillon."]
          ],
          [3600, 2400, 2666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.7 : Résultats quantitatifs et techniques du pipeline ETL", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("3.7 Bilan du Sprint 1"),
        body("Le tableau 3.8 présente le bilan d'avancement des livrables réalisés au terme du Sprint 1 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Extraction des sources brutes", "Module de lecture des fichiers d'extraction", "Réalisé"],
            ["Nettoyage des données", "Module de nettoyage en cinq actions (doublons, dates, formats, coûts, valeurs manquantes)", "Réalisé"],
            ["Modélisation dimensionnelle", "Structuration relationnelle et dimensionnelle du Data Warehouse", "Réalisé"],
            ["Chargement en base de données", "Module d'insertion des données validées avec index", "Réalisé"],
            ["Variables explicatives", "Calcul et ingénierie des variables explicatives", "Réalisé"],
            ["Rapport d'audit de qualité", "Journal d'exécution et bilan avant/après nettoyage", "Réalisé"]
          ],
          [2400, 5066, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.8 : Bilan des livrables du Sprint 1", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("3.8 Conclusion"),
        conclusionBox("Ce chapitre a présenté les travaux menés lors du Sprint 1 pour fiabiliser les données industrielles. En assainissant le fichier brut d'inventaire de 51 500 lignes pour charger 32 043 enregistrements validés dans le Data Warehouse, le pipeline ETL garantit une base de données cohérente et sans doublon. Ces données intègres permettent d'aborder sereinement le Sprint 2, consacré au développement du module de gestion intelligente des stocks."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 4 : SPRINT 2 : GESTION INTELLIGENTE DES STOCKS
        // =========================================================
        title1("Chapitre 4 : Sprint 2 : Développement du module de gestion intelligente des stocks"),

        title2("4.1 Introduction"),
        body("Ce chapitre correspond au Sprint 2 de notre démarche Scrum. Dans un atelier de plasturgie automobile, la gestion proactive des stocks de matières premières (résines thermoplastiques telles que PP, PA66 ou ABS) et de sous-composants est déterminante pour prévenir les arrêts inopinés de presses tout en limitant l'immobilisation financière liée aux surstocks. L'objectif de ce sprint est de concevoir le module de **gestion intelligente des stocks** de la plateforme Nexora. En s'appuyant sur les données assainies issues du Data Warehouse, ce module segmente le catalogue d'articles, analyse la couverture restante, génère des alertes visuelles hiérarchisées et calcule les réapprovisionnements optimaux pour sécuriser un horizon de 45 jours d'activité sur le référentiel des 800 articles [14, 15]."),
        pb(),

        title2("4.2 Backlog du Sprint 2"),
        body("Le tableau 4.1 récapitule les tâches planifiées pour le Sprint 2 avec leur priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Définition des flux logistiques et architecture du module de gestion des stocks", "1 jour"],
            ["Élevée", "Calcul des taux de consommation journaliers, de la couverture en jours et des rotations", "2 jours"],
            ["Élevée", "Classification des références selon les niveaux d'autonomie et de risque", "3 jours"],
            ["Élevée", "Mise en place de la classification par niveau de risque (Rupture, Critique, Normal, Surstock)", "2 jours"],
            ["Élevée", "Développement de l'algorithme de calcul des commandes d'approvisionnement", "3 jours"],
            ["Moyenne", "Chiffrage budgétaire global des approvisionnements prioritaires", "2 jours"],
            ["Moyenne", "Hiérarchisation des alertes d'atelier et intégration des fonctions d'exportation", "2 jours"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.1 : Priorisation des tâches pour le Sprint 2", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.3 Architecture fonctionnelle du module de gestion des stocks"),
        body("Le fonctionnement du module repose sur un enchaînement méthodique en quatre phases logistiques :"),
        bullet("**1. Ingestion des données d'inventaire** : lecture des stocks physiques disponibles et des valorisations d'inventaire depuis la table `ASTOCKDATE` du Data Warehouse."),
        bullet("**2. Calcul des indicateurs logistiques** : calcul du taux de consommation journalier, de l'autonomie restante en jours de production et de la vitesse de rotation."),
        bullet("**3. Classification opérationnelle des articles** : segmentation dynamique des 800 références du catalogue selon leur niveau d'autonomie et de criticité (Rupture, Critique, Normal, Surstock), permettant un ciblage précis des urgences logistiques."),
        bullet("**4. Recommandations et budgétisation** : proposition de quantités de commande pour sécuriser un horizon de 45 jours calculées à partir du taux de consommation validé, calcul de l'enveloppe budgétaire et émission d'alertes."),
        pb(),

        title2("4.4 Analyse des niveaux de stock et indicateurs de rotation"),
        body("Pour évaluer la situation de chaque référence du catalogue, nous calculons son taux de consommation journalier historique à partir de l'activité annuelle de l'atelier :"),
        body("*Taux_Journalier_Historique_i = Consommation_Annuelle_i / 365*", { align: AlignmentType.CENTER, italics: true }),
        body("Deux indicateurs fondamentaux de gestion industrielle [14] sont systématiquement suivis pour chaque référence :"),
        bullet("**La couverture disponible en jours** : durée d'autonomie estimée de la production en l'absence de toute nouvelle livraison :\n*Couverture_Jours_i = Stock_Actuel_i / Taux_Journalier_i*"),
        bullet("**Le coefficient de rotation du stock** : fréquence de renouvellement complet de l'inventaire au cours de l'exercice :\n*Rotation_i = Consommation_Annuelle_i / Stock_Actuel_i*"),
        body("Une rotation élevée caractérise un article consommé rapidement exigeant des flux logistiques tendus, alors qu'une rotation anormalement basse signale une référence dormante engendrant des frais d'entreposage superflus."),
        pb(),

        title2("4.5 Classification opérationnelle et analyse de criticité des stocks"),
        title3("4.5.1 Typologie des statuts de stock et seuils d'autonomie"),
        body("Dans une logique industrielle réactive et pragmatique, la plateforme Nexora privilégie une classification opérationnelle directement articulée aux contraintes de fabrication. Plutôt que de reposer sur des segmentations théoriques déconnectées des urgences terrain, chaque référence des **800 articles du catalogue unique** (`DIM_FamArt`) est évaluée en continu selon son autonomie restante en jours de production. Cette approche permet de catégoriser l'ensemble du référentiel en quatre états opérationnels distincts, établis en concertation avec les responsables logistiques et la direction d'atelier [9, 14] :"),
        pb(),
        makeTable(
          ["Statut du stock", "Condition appliquée", "Indicateur visuel", "Action opérationnelle recommandée"],
          [
            ["Rupture de Stock", "Stock physique = 0 unité", "Rouge", "Commande d'extrême urgence et réordonnancement pour éviter l'arrêt machine."],
            ["Stock Critique", "Stock > 0 et Couverture < 15 jours", "Orange", "Déclenchement d'un réapprovisionnement prioritaire sous 48 heures."],
            ["Stock Normal", "15 jours ≤ Couverture < 120 jours", "Vert", "Niveau nominal équilibré ; aucune commande immédiate requise."],
            ["Surstock", "Couverture ≥ 120 jours", "Violet", "Gel des commandes futures pour limiter l'immobilisation de trésorerie."]
          ],
          [2000, 3200, 1100, 2366]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.2 : Classification des produits selon le niveau de couverture disponible", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("4.5.2 Répartition du catalogue et analyse de criticité"),
        body("L'application de cette grille d'analyse sur l'inventaire consolidé du Data Warehouse fournit une cartographie précise de l'état des stocks d'atelier :"),
        bullet("**Articles en situation nominale (Stock Normal)** : représentent la majorité du catalogue avec **557 références (69,6 %)**. Leur couverture assure le fonctionnement régulier des presses sans intervention logistique immédiate."),
        bullet("**Articles sous tension prioritaire (Rupture et Stock Critique)** : regroupent **193 références au total (24,1 % du catalogue)**. Parmi elles, **47 références (5,9 %)** sont en rupture totale (stock nul sur site) et menacent directement la continuité des plannings d'injection, tandis que **146 références (18,2 %)** présentent une autonomie critique inférieure à 15 jours nécessitant une commande immédiate."),
        bullet("**Articles excédentaires (Surstock)** : concernent **50 références (6,3 %)** dont la couverture excède 120 jours de consommation. Pour ces articles, l'émission de nouvelles commandes est bloquée pour réduire les coûts de possession et d'immobilisation de trésorerie."),
        pb(),

        title2("4.6 Génération des recommandations et chiffrage budgétaire"),
        title3("4.6.1 Algorithme de réapprovisionnement à horizon cible de 45 jours"),
        body("Pour les références en situation de Rupture ou de Stock Critique, le système calcule la quantité exacte requise pour rétablir une **couverture de sécurité de 45 jours** (couvrant un délai moyen d'approvisionnement fournisseur de 30 jours augmenté d'un stock de sécurité de 15 jours) :"),
        body("*Q_commander_i = max(Q_min_conditionnement, ⌈Taux_Journalier_i × 45⌉ - Stock_Actuel_i)*", { align: AlignmentType.CENTER, italics: true }),
        body("avec :"),
        body("*Taux_Journalier_i = Consommation_Annuelle_i / 365*", { align: AlignmentType.CENTER, italics: true }),
        body("Cette formulation, directement issue du moteur logistique du système, s'appuie sur la consommation annuelle validée dans le Data Warehouse. Elle garantit un réapprovisionnement proportionné aux cadences réelles sans introduire d'instabilité artificielle liée aux incertitudes prévisionnelles. L'intégration d'une pondération dynamique par les prévisions d'apprentissage automatique constitue une perspective d'évolution modulaire."),
        pb(),

        title3("4.6.2 Estimation du budget d'approvisionnement"),
        body("Le montant financier prévisionnel des réapprovisionnements est obtenu en valorisant les quantités suggérées par le coût unitaire d'achat réel enregistré dans le Data Warehouse :"),
        body("*Budget_Total = Σ (Q_commander_i × Prix_Unitaire_i)* pour l'ensemble des références i ∈ (Rupture ∪ Critique)", { align: AlignmentType.CENTER, italics: true }),
        body("Cette métrique offre à l'administrateur une visibilité consolidée sur les engagements de trésorerie nécessaires à la continuité de la production."),
        pb(),

        title3("4.6.3 Hiérarchisation des alertes d'atelier"),
        body("Les alertes sont classées par ordre décroissant de criticité en combinant le statut opérationnel de stock, le niveau d'autonomie restante et les délais fournisseurs, assurant que l'administrateur et l'opérateur d'atelier traitent en priorité les matières indispensables au maintien des lignes d'injection."),
        pb(),

        title2("4.7 Résultats obtenus"),
        body("L'analyse de l'état des stocks est conduite sur l'unité maîtresse du référentiel produit : **les 800 références distinctes du catalogue (`DIM_FamArt`)**."),
        pb(),
        body("Sur ces 800 références d'articles, la distribution opérationnelle des stocks issue du Data Warehouse s'établit ainsi :"),
        bullet("**Stock Normal** : 557 références (69,6 %) disposent d'un niveau d'autonomie équilibré compris entre 15 et 120 jours."),
        bullet("**Rupture de Stock** : 47 références (5,9 %) ont un stock physique nul et requièrent une relance immédiate."),
        bullet("**Stock Critique** : 146 références (18,2 %) présentent une autonomie strictement inférieure à 15 jours."),
        bullet("**Surstock** : 50 références (6,2 %) dépassent 120 jours de couverture."),
        pb(),
        body("La figure 4.1 illustre la répartition opérationnelle des références du catalogue selon les quatre statuts de criticité :"),
        pb(),
        ...imageFigure("diagrams/repartition_stocks_statut.png", "Figure 4.1 : Répartition des références du catalogue par statut opérationnel de stock", 540, 250),
        pb(),
        body("La figure 4.2 présente la synthèse des articles en alerte regroupés par grande famille de matières plastiques :"),
        pb(),
        ...imageFigure("image/fig_5_3_ruptures_stocks.png", "Figure 4.2 : Répartition des alertes de rupture et de stock critique par famille de matière", 520, 230),
        pb(),
        body("Au total, le plan de réapprovisionnement à 45 jours concerne **193 références distinctes** (47 en rupture et 146 critiques, soit 24,1 % du catalogue). La quantité globale à commander s'élève à **847 204 unités**, pour un **budget total prévisionnel estimé à environ 380 400 TND** (380 393 TND). Ce budget est calculé directement d'après les coûts unitaires réels constatés dans le Data Warehouse (coût moyen pondéré de 0,449 TND par unité sur les références concernées)."),
        pb(),
        body("*Précision méthodologique sur les granularités d'analyse* : Il convient de distinguer le niveau catalogue maître consolidé (les **800 références d'articles** du référentiel `DIM_FamArt`, analysées ci-dessus avec 47 ruptures et 146 critiques) du niveau d'inventaire physique détaillé par dépôt et site (les **6 875 lignes de stock** visibles sur le tableau de bord Power BI en section 6.4.3, dénombrant 312 ruptures d'emplacements et 1 240 situations critiques réparties sur les trois usines)."),
        pb(),

        title2("4.8 Bilan du Sprint 2"),
        body("Le tableau 4.3 dresse le bilan des livrables réalisés au terme du Sprint 2 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Architecture du module", "Schéma fonctionnel des flux et indicateurs de gestion des stocks", "Réalisé"],
            ["Calcul des indicateurs", "Calcul automatisé des taux journaliers, de la couverture et des rotations", "Réalisé"],
            ["Classification opérationnelle", "Répartition des références du catalogue en états de criticité", "Réalisé"],
            ["Classification par statut", "Hiérarchisation visuelle selon les statuts opérationnels de stock", "Réalisé"],
            ["Algorithme de réapprovisionnement", "Formule de calcul des besoins basée sur la consommation d'atelier", "Réalisé"],
            ["Chiffrage budgétaire", "Calcul de l'enveloppe budgétaire des approvisionnements prioritaires", "Réalisé"],
            ["Alertes et exports", "Vues d'alertes priorisées et exportation tabulaire pour les achats", "Réalisé"]
          ],
          [2600, 4866, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.3 : Bilan des livrables du Sprint 2", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.9 Conclusion"),
        conclusionBox("Ce chapitre a détaillé le développement du module de gestion intelligente des stocks lors du Sprint 2. En associant une classification opérationnelle en quatre niveaux de criticité selon l'autonomie réelle et une formule de réapprovisionnement sur 45 jours basée sur la consommation d'atelier validée, la plateforme Nexora remplace les pratiques manuelles par un pilotage dynamique et préventif unifié sur les 800 références du catalogue. Le chapitre suivant aborde le Sprint 3, consacré à la modélisation prédictive par Intelligence Artificielle et aux prévisions de cadence."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 5 : SPRINT 3 : MODÉLISATION PRÉDICTIVE ET IA
        // =========================================================
        title1("Chapitre 5 : Sprint 3 : Modélisation prédictive par Intelligence Artificielle"),

        title2("5.1 Introduction"),
        body("Ce chapitre correspond au Sprint 3 de notre démarche Scrum, consacré au développement du moteur prédictif et analytique de la plateforme **Nexora**. Pour anticiper les charges des ateliers d'injection et prévenir les tensions sur les approvisionnements, quatre algorithmes d'apprentissage automatique ont été développés et comparés : la Régression Linéaire, un modèle autorégressif ARIMA, Random Forest et le modèle Prophet."),
        pb(),
        body("L'analyse comparative met en évidence que Random Forest et Prophet affichent tous deux des performances proches et satisfaisantes (erreur relative moyenne de 6 % à 7 % de MAPE). Dans l'application opérationnelle, le modèle **Prophet** a été retenu pour le déploiement en production en raison de sa décomposition explicite (tendance de fond, profil hebdomadaire et événements d'atelier) et de sa facilité d'intégration dans l'entrepôt de données SQL Server (table `ml_production_predictions`)."),
        pb(),

        title2("5.2 Backlog du Sprint 3"),
        body("Le tableau 5.1 présente les tâches planifiées pour le Sprint 3 avec leur priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Définition de la variable cible et transformation logarithmique", "2 jours"],
            ["Élevée", "Ingénierie des variables explicatives et calendrier d'atelier", "3 jours"],
            ["Élevée", "Développement des modèles de prévision de séries temporelles", "4 jours"],
            ["Élevée", "Évaluation comparative des performances des modèles à l'horizon 30 jours", "3 jours"],
            ["Moyenne", "Analyse d'explicabilité et décomposition des composantes saisonnières", "2 jours"],
            ["Faible", "Intégration des prévisions Prophet dans la table ml_production_predictions du Data Warehouse", "2 jours"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.1 : Priorisation des tâches pour le Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.3 Démarche méthodologique de modélisation prédictive"),
        body("Le processus de modélisation prédictive des cadences de production d'atelier s'articule autour de cinq étapes méthodologiques :"),
        bullet("**1. Extraction des données d'atelier** : lecture de l'historique des déclarations de fabrication depuis la table `FACT_CLE` du Data Warehouse (851 jours réels)."),
        bullet("**2. Ingénierie des variables** : calcul des variables explicatives (décalages temporels, moyennes mobiles, variables calendaires et événements industriels)."),
        bullet("**3. Entraînement des modèles** : ajustement des algorithmes sur l'historique de production d'injection plastique."),
        bullet("**4. Évaluation des performances** : mesure des métriques d'erreur (MAE, RMSE, MAPE, R²) sur l'horizon de planification de 30 jours."),
        bullet("**5. Restitution et persistance** : enregistrement des prévisions dans la table `ml_production_predictions` du Data Warehouse pour l'affichage Power BI et le portail web."),
        pb(),

        title2("5.4 Préparation des données et variables explicatives"),
        title3("5.4.1 Variable cible et transformation logarithmique"),
        body("La variable cible modélisée est le volume journalier global de pièces conformes produites par l'atelier. Afin de stabiliser la variance face aux fortes variations d'activité, une transformation logarithmique est appliquée :"),
        body("*y_log = log(1 + Cadence_Journalière)*", { align: AlignmentType.CENTER, italics: true }),
        body("Les prédictions générées sont ensuite reconverties dans l'espace physique d'origine pour exprimer directement les erreurs en pièces réelles par jour. Lors de la phase d'apprentissage sur données actives, un seuil technique plancher de 12 450 pièces/jour (correspondant au minimum opérationnel en équipe réduite documenté au Tableau 3.4) garantit la stabilité numérique et évite tout artefact de division par zéro dans le calcul des métriques relatives standards."),
        pb(),

        title3("5.4.2 Variables explicatives et facteurs d'événements"),
        body("Le tableau 5.2 récapitule les 14 variables explicatives créées pour alimenter les modèles prédictifs :"),
        pb(),
        makeTable(
          ["Catégorie", "Variables générées", "Justification métier et analytique"],
          [
            ["Calendrier (3)", "day_of_week, is_weekend, month", "Capture le profil hebdomadaire (lundi-vendredi en 3x8 vs week-end) et les tendances mensuelles."],
            ["Événements atelier (4)", "is_summer, is_eoq, is_maint, is_ramadan", "Intègre les congés d'août, les pics de fin de trimestre, la maintenance de janvier [25] et le Ramadan."],
            ["Décalages / Lags (4)", "lag_1, lag_7, lag_14, lag_30", "Modélise la dépendance temporelle aux pas J-1, J-7, J-14 et J-30."],
            ["Moyennes mobiles (3)", "roll_mean_7, roll_mean_14, roll_std_7", "Indique la tendance lourde récente et la variabilité de la production d'atelier."]
          ],
          [2400, 3000, 3266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.2 : Les 14 variables explicatives du modèle de cadence", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Les événements d'atelier intègrent notamment les congés estivaux d'août, les accélérations de fin de trimestre, l'arrêt de maintenance annuelle [25] et la période de Ramadan."),
        pb(),

        title3("5.4.3 Découpage chronologique du jeu de données"),
        body("Le découpage est chronologique : le jeu de test est postérieur à l'apprentissage (Tableau 5.3) :"),
        pb(),
        makeTable(
          ["Partition", "Période couverte", "Nombre de jours", "Rôle méthodologique"],
          [
            ["Entraînement (Train)", "01/01/2024 – 31/08/2025", "609 jours", "Ajustement des modèles de prévision."],
            ["Validation", "01/09/2025 – 31/12/2025", "122 jours", "Sélection et comparaison des approches."],
            ["Test d'évaluation", "01/01/2026 – 30/04/2026", "120 jours", "Mesure des performances sur données futures."]
          ],
          [2400, 2400, 1600, 2266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.3 : Découpage chronologique du jeu de données", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.5 Métriques d'évaluation de la performance"),
        body("La qualité des prévisions est mesurée par un ensemble rigoureux d'indicateurs d'erreur recommandés en prévision industrielle [4] :"),
        bullet("**MAE (Mean Absolute Error)** : écart absolu moyen entre cadences réelles et prédites, en pièces/jour :\n*MAE = (1 / n) × Σ |y_i - ŷ_i|*"),
        bullet("**RMSE (Root Mean Squared Error)** : racine de l'erreur quadratique moyenne, pénalisant fortement les grands écarts :\n*RMSE = √((1 / n) × Σ (y_i - ŷ_i)²)*"),
        bullet("**MAPE (Mean Absolute Percentage Error)** : pourcentage d'erreur relatif moyen sur production normale :\n*MAPE = (100 / n) × Σ |(y_i - ŷ_i) / y_i|*"),
        bullet("**WAPE (Weighted Absolute Percentage Error)** : erreur relative pondérée par le volume total, non sensible aux zéros [4] :\n*WAPE = (Σ |y_i - ŷ_i| / Σ y_i) × 100*"),
        bullet("**MASE (Mean Absolute Scaled Error)** : ratio de l'erreur du modèle par rapport à une prévision naïve à un pas [4] (MASE < 1 indique une supériorité nette) :\n*MASE = MAE / ((1 / (T-1)) × Σ |y_t - y_{t-1}|)*"),
        bullet("**R² (Coefficient de détermination)** : proportion de la variance de cadence expliquée par le modèle :\n*R² = 1 - (Σ (y_i - ŷ_i)² / Σ (y_i - ȳ)²)*"),
        pb(),

        title2("5.6 Développement des modèles d'intelligence artificielle"),
        body("Pour modéliser la cadence de production de l'atelier d'injection plastique et anticiper les charges machines, quatre approches algorithmiques [5] ont été développées, entraînées et comparées :"),
        pb(),

        title3("5.6.1 Régression Linéaire Multiple"),
        body("La régression linéaire multiple sert de modèle statistique de référence (baseline). Elle postule une relation linéaire directe entre les 14 variables explicatives (calendaires, retardées et d'atelier) et le logarithme de la cadence journalière :"),
        body("*y = β_0 + Σ (β_j × X_j) + ε*", { align: AlignmentType.CENTER, italics: true }),
        body("où *β_0* représente la constante, *β_j* les coefficients de régression associés à chaque variable explicative *X_j*, et *ε* le terme d'erreur résiduelle."),
        pb(),
        ...makeProsConsTable(
          "5.4",
          "Régression Linéaire",
          [
            "Temps d'apprentissage et d'inférence quasi-instantanés.",
            "Interprétabilité directe des coefficients de pondération.",
            "Faible consommation de ressources de calcul."
          ],
          [
            "Incapacité structurelle à modéliser les non-linéarités complexes d'atelier.",
            "Sensible à l'accumulation d'erreurs en projection récursive multi-pas.",
            "Sensibilité à la colinéarité des variables explicatives."
          ]
        ),
        pb(),

        title3("5.6.2 Modèle ARIMA (AutoRegressive Integrated Moving Average)"),
        body("Le modèle ARIMA [3] constitue la méthode statistique univariée de référence pour les séries temporelles. Il combine la dépendance linéaire aux valeurs passées de la série (partie autorégressive AR d'ordre *p*), une différenciation d'ordre *d* pour assurer la stationnarité, et l'influence des chocs aléatoires passés (partie moyenne mobile MA d'ordre *q*) :"),
        body("*y'_t = c + Σ (ϕ_i × y'_{t-i}) + Σ (θ_j × ε_{t-j}) + ε_t*", { align: AlignmentType.CENTER, italics: true }),
        body("où *y'_t* est la série différenciée *d* fois, *ϕ_i* les paramètres autorégressifs, *θ_j* les paramètres de moyenne mobile, et *ε_t* un bruit blanc gaussien."),
        pb(),
        ...makeProsConsTable(
          "5.5",
          "Modèle ARIMA",
          [
            "Fondement théorique robuste pour les processus stochastiques stationnaires.",
            "Bonne réactivité sur les profils cycliques réguliers.",
            "Paramétrisation formelle et rigoureuse (p, d, q)."
          ],
          [
            "Difficulté à intégrer simultanément plusieurs cycles saisonniers sans réajustement permanent.",
            "Sensible aux ruptures calendaires abruptes et arrêts de production non programmés.",
            "Ne prend pas en compte nativement les variables exogènes d'atelier."
          ]
        ),
        pb(),

        title3("5.6.3 Modèle Random Forest Regressor"),
        body("Random Forest [6], [7] est un algorithme d'apprentissage automatique supervisé par ensemble (*ensemble learning*). Il construit une forêt de *B* arbres de décision indépendants entraînés sur des sous-échantillons bootstrap du jeu de données (*bagging*) avec sélection aléatoire des variables de découpage (*feature subsampling*). La prédiction finale résulte de la moyenne des prédictions individuelles :"),
        body("*ŷ = (1 / B) × Σ T_b(x)*", { align: AlignmentType.CENTER, italics: true }),
        body("Cette approche par agrégation réduit considérablement la variance sans dégrader le biais, permettant de capturer les interactions non linéaires complexes propres aux cadences d'atelier."),
        pb(),
        ...makeProsConsTable(
          "5.6",
          "Random Forest",
          [
            "Capte les relations non-linéaires complexes",
            "Robuste aux valeurs aberrantes (outliers)",
            "Faible risque de surapprentissage grâce au bagging"
          ],
          [
            "Modèle boîte noire (interprétabilité réduite)",
            "Temps de calcul et empreinte mémoire plus élevés",
            "Ne peut pas extrapoler au-delà des valeurs observées"
          ]
        ),
        pb(),

        title3("5.6.4 Modèle Prophet (Meta)"),
        body("Développé par Meta, Prophet [12] est un modèle additif modulaire conçu pour les séries temporelles industrielles présentant de fortes saisonnalités et des variations calendaires. La cadence journalière est décomposée selon quatre composantes structurelles :"),
        body("*y(t) = g(t) + s(t) + h(t) + ε_t*", { align: AlignmentType.CENTER, italics: true }),
        body("où *g(t)* modélise la tendance générale non linéaire avec détection automatique des points de rupture (*changepoints*), *s(t)* représente les variations périodiques hebdomadaires via des séries de Fourier, *h(t)* quantifie l'impact des événements d'atelier (fermetures, congés, périodes de maintenance [25]), et *ε_t* est le résidu d'erreur normale."),
        pb(),
        ...makeProsConsTable(
          "5.7",
          "Prophet",
          [
            "Décomposition explicable (tendance, saisonnalité, calendrier).",
            "Génération native d'intervalles d'incertitude prédictifs fiables à 95 %.",
            "Inférence ultra-rapide adaptée aux requêtes du portail web et Power BI.",
            "Prise en compte native des congés et arrêts programmés d'atelier."
          ],
          [
            "Légèrement moins précis sur les horizons très courts que Random Forest.",
            "Sensible aux ruptures structurelles non identifiées comme points de changement."
          ]
        ),
        pb(),

        title2("5.7 Résultats comparatifs et évaluation des modèles à l'horizon 30 jours"),
        body("Les quatre modèles ont été évalués sur l'horizon de prévision opérationnel de l'usine fixé à 30 jours (correspondant au cycle mensuel de planification de charge). Le tableau 5.8 synthétise les performances comparatives obtenues, enrichies des métriques WAPE et MASE [4] :"),
        pb(),
        makeTable(
          ["Modèle de prévision", "MAE (pcs/j)", "RMSE (pcs/j)", "MAPE (%)", "WAPE (%)", "MASE", "Score R²"],
          [
            ["Random Forest", "2 467", "3 196", "6,0 %", "3,8 %", "0,43", "0,9798"],
            ["Prophet (Déployé)", "2 982", "3 897", "6,7 %", "4,6 %", "0,52", "0,9707"],
            ["Régression Linéaire", "4 679", "6 098", "9,8 %", "7,2 %", "0,82", "0,9271"],
            ["ARIMA", "5 321", "6 148", "11,7 %", "8,2 %", "0,93", "0,9082"]
          ],
          [1800, 1300, 1300, 1100, 1100, 1000, 1066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.8 : Synthèse des performances comparatives des modèles à l'horizon 30 jours", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("À l'horizon de 30 jours, Random Forest et Prophet affichent des performances remarquables et très proches (6,0 % et 6,7 % de MAPE, avec des WAPE respectifs de 3,8 % et 4,6 %). Avec des ratios MASE de 0,43 et 0,52 (très largement inférieurs au seuil de 1,0), les deux modèles démontrent un pouvoir prédictif plus de deux fois supérieur à celui d'une prévision naïve standard [4]."),
        pb(),
        body("La figure 5.1 illustre la trajectoire des prévisions Prophet face à la production réelle d'atelier générée avec Matplotlib [13] sur une période représentative :"),
        pb(),
        ...imageFigure("image/fig_4_3_prophet_vs_reel.png", "Figure 5.1 : Trajectoire des prédictions Prophet face à la production réelle d'atelier", 540, 240),
        pb(),
        body("Sur la figure 5.1, les creux périodiques réguliers correspondent fidèlement aux week-ends (dimanches à équipes allégées ou fermetures) ainsi qu'aux arrêts planifiés de maintenance [25]. Ces variations structurelles sont parfaitement captées et anticipées par la décomposition saisonnière hebdomadaire de Prophet."),
        pb(),

        title2("5.8 Détection automatisée des anomalies de cadence par intervalle d'incertitude"),
        body("Conformément aux exigences de réactivité industrielle du cahier des charges, la plateforme Nexora intègre un module de détection d'anomalies de fabrication en temps quasi-réel. Afin de garantir une parfaite robustesse statistique sans introduire d'algorithme boîte noire additionnel, le système exploite directement les bandes d'incertitude bayésiennes à 95 % générées nativement par le modèle Prophet retenu en production :"),
        body("*Anomalie(t) = VRAI  si  y(t) < ŷ_lower(t)  ou  y(t) > ŷ_upper(t)*", { align: AlignmentType.CENTER, italics: true }),
        body("où *[ŷ_lower(t), ŷ_upper(t)]* délimite l'intervalle de confiance prédictif à 95 %. Dès qu'une valeur réelle franchit l'une de ces bornes, une alerte est qualifiée selon sa typologie :"),
        bullet("**Déficit critique (`DEFICIT_CRITIQUE`)** : arrêt total d'usine ou effondrement brutal de cadence ($y_t = 0$), déclenchant une alerte d'urgence pour le responsable de production."),
        bullet("**Déficit modéré (`DEFICIT_MODERE`)** : cadence anormalement basse ($y_t < ŷ_{lower}$ avec $y_t > 0$), signalant un goulot d'étranglement ou des micro-arrêts machines non déclarés."),
        bullet("**Surcharge atypique (`SURCHARGE`)** : production anormalement élevée ($y_t > ŷ_{upper}$), indiquant un rattrapage de cadence ou une fin de commande urgente."),
        pb(),
        body("**Validation opérationnelle sur l'historique d'atelier :** Sur les 851 jours réels de l'historique d'injection, l'atelier recense exactement **68 jours de fermeture totale** (production nulle $y_t = 0$, correspondant aux chômages techniques, fermetures annuelles et dimanches d'arrêt complet). Soumis à cette partition de référence, l'algorithme de détection Prophet isole avec succès **68 jours sur 68 (100,0 % de détection)** hors de l'intervalle d'incertitude, tous catégorisés sans exception en `DEFICIT_CRITIQUE`. Aucun faux négatif n'est constaté sur les événements d'arrêt d'atelier."),
        pb(),
        body("Ce mécanisme de surveillance est directement opérationnel au sein du micro-service Python (`ml-service/models/prophet_model.py`) via l'API REST `POST /detect/anomalies`, permettant au portail web et aux tableaux de bord de notifier instantanément les gestionnaires d'atelier."),
        pb(),

        title2("5.9 Analyse explicable des composantes et robustesse"),
        body("Au-delà de la performance brute en termes d'erreurs résiduelles, la fiabilité industrielle d'un moteur prédictif repose sur sa transparence et son explicabilité. La décomposition additive offerte par Prophet permet d'isoler explicitement la tendance de fond à long terme, la modulation hebdomadaire liée aux roulements des équipes d'atelier, ainsi que les creux de production correspondant aux jours de maintenance programmée et aux jours fériés. Cette interprétabilité facilite l'appropriation des prévisions par les chefs d'atelier et sécurise la planification opérationnelle face aux fluctuations réelles de cadence."),
        pb(),

        title2("5.10 Rôles respectifs des modèles dans la plateforme Nexora"),
        body("L'analyse comparative conduit à une organisation claire entre les deux modèles de tête. Random Forest obtient une précision légèrement supérieure sur l'historique d'atelier (6,0 % d'erreur à 30 jours contre 6,7 % pour Prophet). Toutefois, le modèle Prophet a été retenu pour le déploiement opérationnel en production en raison de sa décomposition transparente (séparant la tendance générale, le rythme hebdomadaire et les arrêts programmés), de sa génération native d'intervalles pour la détection d'anomalies, et de sa grande facilité d'intégration dans l'entrepôt de données SQL Server et les tableaux de bord Power BI. Random Forest demeure utilisé comme modèle de référence pour les analyses hors-ligne et les études approfondies."),
        pb(),

        title2("5.11 Bilan du Sprint 3"),
        body("Le tableau 5.9 récapitule les livrables réalisés au terme du Sprint 3 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Préparation des variables", "Ingénierie des variables explicatives et calendrier d'atelier", "Réalisé"],
            ["Développement des modèles", "Implémentation des modèles de prévision temporelle", "Réalisé"],
            ["Évaluation des performances", "Performances comparatives validées à 30 jours (WAPE, MASE)", "Réalisé"],
            ["Détection d'anomalies", "Module de détection Prophet 95 % validé à 100 % sur arrêts", "Réalisé"],
            ["Explicabilité des modèles", "Décomposition explicable des composantes et analyse de robustesse", "Réalisé"],
            ["Déploiement opérationnel", "Intégration des prévisions Prophet dans le Data Warehouse", "Réalisé"]
          ],
          [2400, 5066, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.9 : Bilan des livrables du Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.12 Conclusion"),
        conclusionBox("Ce chapitre a présenté le développement, l'évaluation comparative de quatre modèles de séries temporelles et le déploiement du module de détection d'anomalies. Les résultats confirment que Random Forest et Prophet atteignent des performances très proches et d'excellente qualité à l'horizon de 30 jours (6 % à 7 % de MAPE, WAPE inférieur à 5 % et MASE aux environs de 0,5). Prophet a été retenu pour alimenter le Data Warehouse et surveiller les ruptures de cadence grâce à ses bandes d'incertitude à 95 % (validées à 100 % sur les 68 jours d'arrêt d'atelier). Le chapitre suivant aborde le Sprint 4, consacré à la restitution décisionnelle par Power BI, à l'application web et à la recette fonctionnelle."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 6 : SPRINT 4 : TABLEAUX DE BORD ET VALIDATION
        // =========================================================
        title1("Chapitre 6 : Sprint 4 : Développement du tableau de bord décisionnel et validation"),

        title2("6.1 Introduction"),
        body("Ce chapitre correspond au Sprint 4, dernière phase de réalisation de notre projet. Après avoir mis en place le pipeline ETL (Sprint 1), le module de gestion des stocks (Sprint 2) et les modèles de prévision par IA (Sprint 3), ce sprint a pour objectif d'intégrer l'ensemble de ces briques au sein d'une solution de restitution conviviale et réactive. Les rapports décisionnels développés sous Microsoft Power BI [24], alimentés directement par le Data Warehouse et la table `ml_production_predictions`, permettent à l'administrateur de piloter les indicateurs d'atelier, de suivre les prévisions de cadence et d'analyser les risques de rupture. En complément, un portail web opérationnel en React.js [22] et Spring Boot [17] offre à l'opérateur d'atelier une interface réactive de consultation des stocks, de filtrage des alertes de rupture et de suivi en temps réel des cadences de production."),
        pb(),

        title2("6.2 Backlog du Sprint 4"),
        body("Le tableau 6.1 présente les tâches planifiées pour le Sprint 4 avec leur priorité et leur durée estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Connexion de Power BI au Data Warehouse et modélisation du schéma analytique", "1 jour"],
            ["Élevée", "Conception du rapport décisionnel « Supervision du Parc Machines »", "2 jours"],
            ["Élevée", "Conception du rapport décisionnel « Prévision des Cadences par IA »", "2 jours"],
            ["Élevée", "Conception du rapport décisionnel « Gestion des Stocks & Alertes »", "2 jours"],
            ["Élevée", "Développement des API REST du portail web (Spring Boot / FastAPI) et vues React", "3 jours"],
            ["Moyenne", "Écriture des mesures DAX (valorisation de stock, seuils critiques, taux de rotation)", "1 jour"],
            ["Moyenne", "Recette fonctionnelle et évaluation d'utilisabilité auprès des utilisateurs (Administrateurs et Opérateurs)", "2 jours"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.1 : Priorisation des tâches pour le Sprint 4", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.3 Architecture du tableau de bord et intégration applicative"),
        body("La figure 6.1 présente l'architecture globale d'intégration et de déploiement de la solution décisionnelle Nexora :"),
        pb(),
        ...imageFigure("diagrams/arch_physique.png", "Figure 6.1 : Architecture globale d'intégration et de déploiement de Nexora", 540, 240),
        bullet("**1. Entrepôt de données SQL Server** : centralise les tables de faits et de dimensions nettoyées ainsi que les prévisions issues de l'apprentissage automatique (`ml_production_predictions`)."),
        bullet("**2. Backend applicatif d'entreprise (Spring Boot / FastAPI)** : le serveur Spring Boot [17] gère l'authentification sécurisée par jetons JWT, le contrôle d'accès RBAC et les entités métiers, tandis que le micro-service FastAPI [21] sert d'interface d'inférence directe pour les modèles Python."),
        bullet("**3. Rapports décisionnels Microsoft Power BI** : tableaux de bord interactifs connectés en mode DirectQuery ou Import au Data Warehouse, exploitant des mesures calculées en DAX pour le management d'atelier."),
        bullet("**4. Portail web réactif React.js** : interface utilisateur dynamique permettant aux opérateurs de consulter les inventaires en temps réel, d'analyser les indicateurs de production et d'exporter les alertes de réapprovisionnement."),
        pb(),

        title2("6.4 Conception des rapports décisionnels Power BI"),
        title3("6.4.1 Tableau de bord de supervision du parc machines"),
        body("Ce rapport offre une supervision complète de l'activité du parc de 319 presses à injecter réparties sur les sites de Kondar, Sousse et Brno :"),
        bullet("**Indicateurs clés d'atelier** : cadences réelles de production par atelier (moyenne globale de 64 890 pièces/jour), volumes déclarés conformes et taux de rebut moyen (1,85 %)."),
        bullet("**Suivi du parc machines** : décompte des presses en production, en maintenance planifiée ou en arrêt pour changement de moule."),
        bullet("**Analyse des causes d'arrêt** : répartition des motifs d'interruption (défaillances hydrauliques, surchauffe de fourreau, rupture de matière première)."),
        pb(),

        title3("6.4.2 Tableau de bord des prévisions de cadence"),
        body("Ce rapport est dédié à l'exploitation des projections de production issues des modèles d'IA :"),
        bullet("**Visualisation des cadences prévisionnelles** : affichage de la trajectoire prédictive sur l'horizon opérationnel de 30 jours pour guider l'ordonnancement mensuel."),
        bullet("**Comparaison réel / prévu** : superposition de la cadence réelle et des prévisions Random Forest et Prophet, complétées par les intervalles d'incertitude à 95 %."),
        bullet("**Indicateurs de fiabilité** : affichage en bandeau des erreurs moyennes MAPE issues de l'évaluation des modèles (environ 6,0 % pour Random Forest et 6,7 % pour Prophet à 30 jours)."),
        pb(),

        title3("6.4.3 Tableau de bord de gestion des stocks"),
        body("Ce rapport permet le pilotage fin des **6 875 lignes d'inventaire physiques détaillées** réparties sur les différents magasins et ateliers des trois sites :"),
        bullet("**Synthèse par état de stock** : indicateurs visuels des **312 lignes d'inventaire en rupture** physique (Rouge) et **1 240 lignes en stock critique** (Orange) sur les 6 875 lignes suivies. En consolidation au niveau du catalogue maître d'articles (les 800 références d'articles analysées au chapitre 4), cette granularité correspond exactement aux **47 références d'articles en rupture globale** et **146 références en stock critique**."),
        bullet("**Filtres multicritères** : sélection par famille de résine (PP, PA66, ABS), atelier d'injection ou niveau de criticité de stock."),
        bullet("**Plan de commande 45 jours** : tableau exportable indiquant la quantité nette à commander (847 204 unités) et le montant budgétaire associé (enveloppe globale de 380 400 TND / 380 393 TND pour les 193 références prioritaires)."),
        pb(),

        title2("6.5 Présentation des interfaces réalisées"),
        title3("6.5.1 Tableau de bord principal"),
        body("La figure 6.2 illustre la vue d'ensemble décisionnelle Power BI regroupant les indicateurs clés de production et de stock :"),
        pb(),
        ...imageFigure("image/powerbi_3.png", "Figure 6.2 : Vue d'ensemble du tableau de bord décisionnel Power BI Nexora", 540, 260),
        pb(),

        title3("6.5.2 Historique et répartition des stocks d'atelier"),
        body("La figure 6.3 montre l'interface d'historique de stock et d'évolution des valorisations par site de production (Kondar, Sousse, Brno) :"),
        pb(),
        ...imageFigure("image/powerbi_1.png", "Figure 6.3 : Rapport Power BI « Historique d'évolution des stocks par site »", 540, 280),
        body("La figure 6.4 présente la vue globale de l'état des stocks d'atelier, la répartition par famille d'articles et les parts par site industriel :"),
        pb(),
        ...imageFigure("image/powerbi_2.png", "Figure 6.4 : Rapport Power BI « État de stock global et répartition par famille »", 540, 280),
        pb(),

        title3("6.5.3 Prévisions de cadence d'atelier"),
        body("La figure 6.5 présente l'écran de visualisation des cadences prévisionnelles à 30 jours (trajectoires prédictives et cadrage d'incertitude) :"),
        pb(),
        ...imageFigure("image/powerbi_4.png", "Figure 6.5 : Rapport Power BI « Prévision des cadences et charge atelier »", 540, 270),
        pb(),

        title3("6.5.4 Pilotage des stocks et alertes d'approvisionnement"),
        body("La figure 6.6 illustre l'interface dédiée à la surveillance d'inventaire et au suivi des alertes de rupture :"),
        pb(),
        ...imageFigure("image/powerbi_5.png", "Figure 6.6 : Rapport Power BI « Gestion des stocks d'atelier et alertes »", 540, 270),
        pb(),

        title3("6.5.5 Portail web opérationnel React & Spring Boot"),
        body("En complément des tableaux de bord Power BI dédiés à l'administrateur, la plateforme comprend une application web développée avec React 18.0 [22] et TypeScript 4.7 [23] côté client, adossée à Spring Boot 3.4.5 [17] côté serveur. Ce portail offre à l'opérateur d'atelier une interface fluide et réactive pour consulter les données opérationnelles d'inventaire, filtrer les alertes de criticité et suivre les indicateurs de fabrication en temps réel."),
        body("L'architecture des services (API REST) exposés par le serveur applicatif s'articule autour de cinq domaines principaux :"),
        pb(),
        makeTable(
          ["Module fonctionnel", "Rôle opérationnel", "Profils autorisés"],
          [
            ["Authentification & Rôles (/api/auth)", "Connexion sécurisée par jeton JWT et récupération du profil connecté.", "Opérateur / Administrateur"],
            ["Gestion des stocks (/api/stock)", "Consultation des 800 références, calcul des KPI d'inventaire, filtrage par statut et export Excel.", "Opérateur / Administrateur"],
            ["Suivi de fabrication (/api/production)", "Suivi des ordres de fabrication, état des 319 presses et suivi des machines.", "Opérateur / Administrateur"],
            ["Services d'Intelligence Artificielle (/api/ml)", "Génération et consultation des prévisions de cadence de production à 30 jours et détection d'anomalies.", "Administrateur"],
            ["Gestion des utilisateurs (/api/users)", "Création des comptes, activation et attribution des rôles applicatifs (RBAC).", "Administrateur"]
          ],
          [2600, 4200, 2466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.2 : Synthèse des services REST de l'application web", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.6 Tests et validation"),
        title3("6.6.1 Tests fonctionnels et d'intégration"),
        body("Afin de valider la conformité de la solution avec les spécifications du système, six scénarios de test d'intégration ont été déroulés :"),
        pb(),
        makeTable(
          ["Cas de test", "Protocole d'exécution", "Résultat constaté", "Statut"],
          [
            ["Connexion Data Warehouse DirectQuery", "Interrogation simultanée des tables FACT_CLE et ASTOCKDATE depuis Power BI Desktop.", "Temps de réponse fluide, synchronisation immédiate des visuels.", "Validé"],
            ["Mesures d'atelier (DAX)", "Vérification des formules de cadence, valorisation et rotation de stock sur 10 shifts types.", "Conformité stricte avec les déclarations d'atelier validées.", "Validé"],
            ["Prévision à 30 jours", "Calcul et affichage des prévisions de cadence à 30 jours sur l'interface graphique.", "Mise à jour instantanée des courbes et des bornes d'incertitude à 95 %.", "Validé"],
            ["Détection des ruptures", "Filtrage sur les références à stock nul (47 références distinctes) et contrôle de l'indicateur visuel rouge.", "Identification immédiate des références prioritaires avec tri par criticité.", "Validé"],
            ["Chiffrage commande 45j", "Contrôle de la somme budgétaire sur les 193 références prioritaires du catalogue.", "Montant égal aux 380 400 TND calculés dans le module d'approvisionnement.", "Validé"],
            ["Exportation tabulaire", "Export des alertes d'approvisionnement vers un tableur Excel.", "Génération d'un fichier conforme prêt pour transmission aux fournisseurs.", "Validé"]
          ],
          [2000, 3100, 2966, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.3 : Bilan des tests fonctionnels et d'intégration", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("6.6.2 Validation des prévisions d'atelier"),
        body("Le jeu de test temporel complet couvre une durée de **120 jours** (du 01/01/2026 au 30/04/2026). Sur cet ensemble, la fenêtre d'évaluation des prévisions glissantes porte sur **98 jours d'évaluation effective** (du 23/01/2026 au 30/04/2026). Les 22 premiers jours de janvier sont délibérément exclus du calcul d'erreur pour des motifs industriels et méthodologiques précis : d'une part, les 7 premiers jours correspondent à l'arrêt annuel de maintenance d'usine (fermeture complète), et d'autre part, les jours 8 à 22 fournissent la fenêtre de réchauffement (*warm-up*) nécessaire à l'initialisation des 21 retards temporels (*lag features*) avant la première projection prédictive à 30 jours. L'analyse comparée des cadences prédites et observées sur ces 98 jours confirme la grande fidélité des prévisions par rapport aux dynamiques réelles d'atelier (6,7 % de MAPE pour Prophet et 6,0 % pour Random Forest)."),
        pb(),

        title3("6.6.3 Validation des règles d'approvisionnement"),
        body("La simulation sur 45 jours a mis en évidence la suppression des commandes redondantes sur les 50 références en situation de surstock tout en ciblant les besoins d'approvisionnement pour les 193 références prioritaires du catalogue (47 ruptures et 146 critiques pour un budget de 380 400 TND), sécurisant la continuité de l'alimentation des lignes de fabrication."),
        pb(),

        title2("6.7 Bilan du Sprint 4"),
        body("Le tableau 6.4 récapitule les livrables validés à l'issue du Sprint 4 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Modélisation Power BI", "Connexion au Data Warehouse et création des mesures DAX", "Réalisé"],
            ["Rapport Supervision Machines", "Tableau de bord de suivi du parc machines et cadence des lignes", "Réalisé"],
            ["Rapport Prévision IA", "Tableau de bord des prévisions à 30 jours avec bornes d'incertitude à 95 %", "Réalisé"],
            ["Rapport Gestion des stocks", "Tableau de bord d'analyse d'inventaire, criticité des stocks et alertes", "Réalisé"],
            ["Portail web opérationnel", "Application React 18 / Spring Boot avec API REST documentées", "Réalisé"],
            ["Recette et validation", "Validation de 6 scénarios de test fonctionnels et d'intégration d'atelier", "Réalisé"]
          ],
          [2600, 4866, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.4 : Bilan des livrables du Sprint 4", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.8 Conclusion"),
        conclusionBox("Ce chapitre a présenté la conception, le déploiement et la validation des interfaces décisionnelles et opérationnelles de la plateforme Nexora lors du Sprint 4. En combinant la richesse analytique de Power BI pour l'administrateur et l'agilité d'un portail web React / Spring Boot pour l'opérateur en atelier, la solution comble le fossé entre la modélisation statistique avancée et les opérations industrielles quotidiennes. La conclusion générale suivante synthétise les résultats majeurs du projet, en discute les limites actuelles et esquisse des perspectives d'évolution prometteuses."),
        pageBreak(),
    
        // =========================================================
        // CONCLUSION GÉNÉRALE ET PERSPECTIVES
        // =========================================================
        title1("Conclusion générale et perspectives"),
        body("Ce projet de fin d'études a permis de concevoir, développer et valider la plateforme d'aide à la décision **Nexora**, destinée à moderniser le pilotage de la production et la gestion logistique d'un parc de 319 presses à injecter réparties sur trois sites industriels."),
        pb(),
        body("L'objectif fondamental était de valoriser l'entrepôt de données opérationnel pour substituer aux calculs manuels et réactifs un système automatisé, prédictif et ergonomique."),
        pb(),
        body("L'adoption de la démarche itérative Agile Scrum a permis de rythmer le projet autour de jalons concrets et mesurables :"),
        bullet("**Sprint 0 (Cadrage & Architecture)** : formalisation des besoins des deux acteurs d'atelier (Opérateur et Administrateur), modélisation des cas d'utilisation UML et conception de l'architecture découplée en quatre couches."),
        bullet("**Sprint 1 (Ingénierie des données & ETL)** : conception d'un pipeline Python assurant le dédoublonnage des lignes redondantes et le redressement des anomalies qualité, aboutissant au chargement des enregistrements validés dans les tables en étoile du Data Warehouse."),
        bullet("**Sprint 2 (Gestion intelligente des stocks)** : classification opérationnelle des stocks par niveau de couverture et de criticité (Rupture, Critique, Normal, Surstock) sur le catalogue de 800 références maîtresses, couplée à une formule de réapprovisionnement à 45 jours qui chiffre l'enveloppe prioritaire des 193 références en risque (847 204 unités pour un budget de 380 400 TND / 380 393 TND)."),
        bullet("**Sprint 3 (Modélisation prédictive par IA & Détection d'anomalies)** : comparaison de quatre modèles d'apprentissage automatique et de séries temporelles à l'horizon opérationnel de 30 jours (Random Forest et Prophet atteignant 6 % à 7 % de MAPE et des WAPE inférieurs à 5 %). Prophet a été retenu pour le déploiement opérationnel en raison de son explicabilité et de ses bandes d'incertitude à 95 %, exploitées avec succès pour la détection proactive des anomalies de cadence (100 % des arrêts d'atelier identifiés sans faux négatif)."),
        bullet("**Sprint 4 (Restitution & Validation)** : réalisation de tableaux de bord décisionnels Power BI pour le suivi managérial et d'un portail web opérationnel React / Spring Boot pour les équipes d'atelier, validés avec succès par des scénarios de test fonctionnels et d'intégration."),
        pb(),
        body("En dépit de ces résultats concluants, notre solution comporte certaines **limites méthodologiques et techniques** qu'il convient de souligner avec rigueur académique :"),
        bullet("**Périmètre temporel d'observation** : l'historique disponible s'étend sur 851 jours (janvier 2024 à avril 2026), ce qui représente un recul précieux mais reste restreint pour appréhender les cycles économiques pluriannuels du secteur automobile."),
        bullet("**Agrégation macroscopique de la prévision** : les modèles actuels prévoient la cadence globale au niveau de l'atelier ; ils ne modélisent pas encore individuellement le comportement de chacune des 319 presses ou de chaque moule spécifique."),
        bullet("**Dépendance aux saisies manuelles résiduelles** : la précision de la détection des motifs de rebus ou des causes d'arrêt demeure tributaire de la rigueur de saisie des opérateurs d'atelier dans le système transactionnel d'origine."),
        pb(),
        body("Ces constats ouvrent la voie à plusieurs **perspectives d'évolution industrielle** à court et moyen termes :"),
        bullet("**1. Modélisation hiérarchique par machine et famille de matière** : développer des modèles de séries temporelles hiérarchiques réconciliées (par site, atelier, presse et moule) afin de descendre au niveau de granularité le plus fin pour l'ordonnancement d'atelier."),
        bullet("**2. Intégration bidirectionnelle avec le moteur MRP de l'ERP** : injecter automatiquement les recommandations de commande de stock calculées par Nexora dans le module d'achats de l'ERP pour générer des demandes d'achat pré-remplies."),
        bullet("**3. Industrialisation MLOps et réentraînement continu** : mettre en œuvre un pipeline MLOps automatisé (avec MLflow ou Airflow) détectant la dérive des données (*data drift*) et déclenchant le réapprentissage périodique des modèles prédictifs."),
        bullet("**4. Système d'alerte multicanal automatisé** : déployer un service d'alertes par courrier électronique et notifications push Web/SMS à destination de l'administrateur et des opérateurs dès qu'une couverture de référence descend sous le seuil critique des 15 jours."),
        pb(),
        body("En conclusion, ce projet de fin d'études démontre avec succès comment la convergence de l'ingénierie des données, de l'apprentissage automatique et du développement logiciel moderne peut apporter une réponse concrète, quantifiable et durable aux défis de la performance industrielle."),
        pageBreak(),

        // =========================================================
        // BIBLIOGRAPHIE ET WEBOGRAPHIE (NORME IEEE)
        // =========================================================
        title1("Bibliographie"),
        body("Les références bibliographiques et sources techniques mobilisées dans le cadre de ce projet sont référencées ci-dessous conformément à la norme IEEE :"),
        pb(),
        linkBullet("[1] K. Schwaber et J. Sutherland, « The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game », Scrum.org, nov. 2020. ", "https://scrumguides.org", ""),
        bullet("[2] M. Cohn, User Stories Applied: For Agile Software Development. Boston, MA, USA : Addison-Wesley Professional, 2004."),
        bullet("[3] G. E. P. Box, G. M. Jenkins, G. C. Reinsel, et G. M. Ljung, Time Series Analysis: Forecasting and Control, 5e éd. Hoboken, NJ, USA : John Wiley & Sons, 2015."),
        linkBullet("[4] R. J. Hyndman et G. Athanasopoulos, Forecasting: Principles and Practice, 3e éd. Melbourne, Australie : OTexts, 2021. ", "https://otexts.com/fpp3/", ""),
        bullet("[5] A. Géron, Hands-On Machine Learning with Scikit-Learn, Keras and TensorFlow, 2e éd. Sebastopol, CA, USA : O'Reilly Media, 2019."),
        bullet("[6] T. Hastie, R. Tibshirani, et J. Friedman, The Elements of Statistical Learning: Data Mining, Inference, and Prediction, 2e éd. New York, NY, USA : Springer, 2009."),
        bullet("[7] L. Breiman, « Random Forests », Machine Learning, vol. 45, n° 1, p. 5-32, 2001."),
        bullet("[8] R. Kimball et M. Ross, The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling, 3e éd. Indianapolis, IN, USA : John Wiley & Sons, 2013."),
        bullet("[9] E. A. Silver, D. F. Pyke, et R. Peterson, Inventory Management and Production Planning and Scheduling, 3e éd. New York, NY, USA : John Wiley & Sons, 1998."),
        bullet("[10] S. Seabold et J. Perktold, « statsmodels: Econometric and statistical modeling with Python », in Proc. of the 9th Python in Science Conference, Austin, TX, USA, 2010, p. 92-96."),
        linkBullet("[11] F. Pedregosa et al., « Scikit-learn: Machine Learning in Python », Journal of Machine Learning Research, vol. 12, p. 2825-2830, 2011. ", "https://scikit-learn.org", ""),
        linkBullet("[12] S. J. Taylor et B. Letham, « Forecasting at scale: The Prophet procedure », The American Statistician, vol. 72, n° 1, p. 37-45, 2018. ", "https://peerj.com/preprints/3190/", ""),
        bullet("[13] J. D. Hunter, « Matplotlib: A 2D graphics environment », Computing in Science & Engineering, vol. 9, n° 3, p. 90-95, 2007."),
        bullet("[14] S. Axsäter, Inventory Control, 3e éd. New York, NY, USA : Springer International Publishing, 2015."),
        bullet("[15] R. G. Brown, Statistical Forecasting for Inventory Control. New York, NY, USA : McGraw-Hill, 1959."),
        linkBullet("[16] Microsoft Corporation, « Microsoft SQL Server 2022 Technical Documentation & Index Architecture », 2024. ", "https://learn.microsoft.com/sql/sql-server/", ""),
        linkBullet("[17] Spring Framework Team, « Spring Boot 3 Reference Documentation », VMware Tanzu, 2024. ", "https://spring.io/projects/spring-boot", ""),
        linkBullet("[18] Python Software Foundation, « Python Documentation, Version 3.10 », 2024. ", "https://docs.python.org/3/", ""),
        linkBullet("[19] W. McKinney, « Data Structures for Statistical Computing in Python (Pandas) », in Proc. of the 9th Python in Science Conf., Austin, TX, USA, 2010, p. 56-61. ", "https://pandas.pydata.org", ""),
        bullet("[20] C. R. Harris et al., « Array programming with NumPy », Nature, vol. 585, p. 357-362, 2020."),
        linkBullet("[21] S. Ramirez, « FastAPI: Modern, Fast Web Framework for Python », 2024. ", "https://fastapi.tiangolo.com", ""),
        linkBullet("[22] Meta Platforms Inc., « React.js 18 Documentation & Concurrent Features », 2024. ", "https://react.dev", ""),
        linkBullet("[23] B. Cherny, Programming TypeScript: Making Your JavaScript Applications Scale. Sebastopol, CA, USA : O'Reilly Media, 2019. ", "https://www.oreilly.com/library/view/programming-typescript/9781491954454/", ""),
        bullet("[24] A. Ferrari et M. Russo, The Definitive Guide to DAX: Business Intelligence with Microsoft Power BI, SQL Server Analysis Services, and Excel, 2e éd. Redmond, WA, USA : Microsoft Press, 2019."),
        bullet("[25] S. Nakajima, Introduction to TPM: Total Productive Maintenance. Cambridge, MA, USA : Productivity Press, 1988."),
        bullet("[26] G. Booch, J. Rumbaugh, et I. Jacobson, The Unified Modeling Language User Guide, 2e éd. Boston, MA, USA : Addison-Wesley, 2005."),
        pageBreak(),
    
      ]
    }
  ]
});

// GENERATION OF DOCX FILE DIRECTLY
Packer.toBuffer(doc).then(buffer => {
  const outputPath = path.join(__dirname, 'pfe_v8.docx');
  let savedPath = outputPath;
  try {
    fs.writeFileSync(outputPath, buffer);
    console.log("✓ Rapport PFE v8 généré avec succès : " + outputPath);
  } catch(e) {
    if (e.code === 'EBUSY') {
      savedPath = path.join(__dirname, 'pfe_v8_mis_a_jour.docx');
      fs.writeFileSync(savedPath, buffer);
      console.log("[ATTENTION] pfe_v8.docx est ouvert dans Word. Version a jour enregistree sous : " + savedPath);
    } else {
      throw e;
    }
  }

  // Copy to root workspace
  const rootPath = path.join(__dirname, '..', 'pfe_v8.docx');
  try {
    fs.writeFileSync(rootPath, buffer);
    console.log("✓ Copie sauvegardee a la racine : " + rootPath);
  } catch(e) {
    if (e.code === 'EBUSY') {
      const rootFallback = path.join(__dirname, '..', 'pfe_v8_mis_a_jour.docx');
      try {
        fs.writeFileSync(rootFallback, buffer);
        console.log("[ATTENTION] pfe_v8.docx racine est ouvert dans Word. Version a jour enregistree sous : " + rootFallback);
      } catch(e2) {}
    }
  }
}).catch(err => {
  console.error("Erreur generation pfe_v8.docx :", err);
});
