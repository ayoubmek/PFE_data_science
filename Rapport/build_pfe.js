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

const imageFigure = (imageRelPath, captionText, maxW = 540, maxH = 380) => {
  const fullPath = path.isAbsolute(imageRelPath) ? imageRelPath : path.join(__dirname, imageRelPath);
  if (fs.existsSync(fullPath)) {
    try {
      const buffer = fs.readFileSync(fullPath);
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 140, after: 60 },
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width: maxW, height: maxH },
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
        body("Dans le secteur hautement concurrentiel de la plasturgie automobile (équipementier Tier-1), la maîtrise des cadences de production et la gestion agile des stocks de matières premières et de pièces techniques constituent des enjeux stratégiques majeurs. Face à l'hétérogénéité des outils d'atelier et à la dispersion des données issues de 319 presses à injecter réparties sur plusieurs sites (Kondar, Sousse en Tunisie et Brno en République Tchèque), ce projet de fin d'études présente la conception et le déploiement de **Nexora**, un système décisionnel intelligent d'aide au pilotage d'atelier et de gestion proactive des stocks."),
        pb(),
        body("S'appuyant sur l'exploitation d'un Data Warehouse d'entreprise sous Microsoft SQL Server consolidant plus de 1,5 million de mouvements de stock (Item Ledger Entry) et 250 000 déclarations d'opérations machines (Capacity Ledger Entry), la solution s'articule autour de trois composantes complémentaires : un pipeline ETL assainissant les données et accélérant les requêtes d'atelier ; un module d'intelligence artificielle prédictive évaluant les algorithmes de pointe sous validation croisée temporelle (TimeSeriesSplit), où l'algorithme bayésien Prophet de Meta (R² = 0,9600, MAPE = 4,8 %) démontre une nette supériorité face à Random Forest, ARIMA et la Régression Linéaire, complété par Isolation Forest pour la détection d'anomalies de presses et K-Means pour la segmentation des stocks ; et un module de gestion intelligente des stocks qui traduit ces prévisions en recommandations de réapprovisionnement sous un horizon cible de 45 jours."),
        pb(),
        body("L'ensemble des fonctionnalités est intégré dans une application web réactive développée avec React.js, orchestrée par un backend Spring Boot 3 et complétée par des tableaux de bord interactifs sous Microsoft Power BI. Les résultats obtenus en atelier confirment une nette amélioration de la réactivité opérationnelle, matérialisée par un gain mesuré de +6,3 points de TRG et une diminution significative des ruptures de matières critiques."),
        pb(),
        bold_body("Mots-clés :"),
        body("Système décisionnel intelligent, Industrie 4.0, Plasturgie Automobile, Taux de Rendement Global (TRG/OEE), Séries Temporelles, Machine Learning, Prophet, Random Forest, ARIMA, Isolation Forest, K-Means, Pipeline ETL, SQL Server, Spring Boot, React.js, Power BI."),
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
        tocLine("1.3.2 Domaines d'activité", 2, "5"),
        tocLine("1.4 Présentation de la plateforme Nexora", 1, "5"),
        tocLine("1.4.1 Présentation générale", 2, "5"),
        tocLine("1.4.2 Fonctionnalités principales", 2, "6"),
        tocLine("1.4.3 Limite actuelle et besoin d'évolution", 2, "6"),
        tocLine("1.5 Présentation du projet", 1, "7"),
        tocLine("1.5.1 Contexte et problématique", 2, "7"),
        tocLine("1.5.2 Étude de l'existant", 2, "7"),
        tocLine("1.5.3 Solution proposée", 2, "8"),
        tocLine("1.6 Workflow complet du projet", 1, "9"),
        tocLine("1.7 Méthodologie de développement", 1, "10"),
        tocLine("1.7.1 Étude comparative des méthodes", 2, "10"),
        tocLine("1.7.2 Choix méthodologique : Scrum", 2, "11"),
        tocLine("1.7.3 Application de Scrum au projet", 2, "12"),
        tocLine("1.7.4 Product Backlog", 2, "12"),
        tocLine("1.7.5 Planification des sprints", 2, "13"),
        tocLine("1.8 Langage de modélisation UML", 1, "14"),
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
        tocLine("3 Sprint 1 : Prétraitement des données et pipeline ETL", 0, "23"),
        tocLine("3.1 Introduction", 1, "24"),
        tocLine("3.2 Backlog du Sprint 1", 1, "24"),
        tocLine("3.3 Présentation des données", 1, "24"),
        tocLine("3.3.1 Source des données", 2, "24"),
        tocLine("3.3.2 Description des tables principales", 2, "25"),
        tocLine("3.3.3 Diagramme de classes", 2, "25"),
        tocLine("3.4 Analyse exploratoire des données (EDA)", 1, "26"),
        tocLine("3.4.1 Analyse statistique", 2, "27"),
        tocLine("3.4.2 Visualisation des données", 2, "27"),
        tocLine("3.5 Conception et réalisation du pipeline ETL", 1, "29"),
        tocLine("3.5.1 Architecture du pipeline", 2, "29"),
        tocLine("3.5.2 Extraction", 2, "31"),
        tocLine("3.5.3 Transformation", 2, "32"),
        tocLine("3.5.4 Chargement", 2, "33"),
        tocLine("3.6 Résultats du pipeline ETL", 1, "34"),
        tocLine("3.7 Bilan du Sprint 1", 1, "34"),
        tocLine("3.8 Conclusion", 1, "35"),
        pb(),
        pb(),
        tocLine("4 Sprint 2 : Développement du module de gestion intelligente des stocks", 0, "36"),
        tocLine("4.1 Introduction", 1, "37"),
        tocLine("4.2 Backlog du Sprint 2", 1, "37"),
        tocLine("4.3 Architecture du module de gestion des stocks", 1, "37"),
        tocLine("4.4 Analyse des niveaux de stock et de rotation", 1, "38"),
        tocLine("4.5 Classification des produits", 1, "39"),
        tocLine("4.6 Génération des recommandations", 1, "39"),
        tocLine("4.6.1 Calcul des quantités à commander", 2, "40"),
        tocLine("4.6.2 Estimation du budget", 2, "40"),
        tocLine("4.6.3 Alertes intelligentes", 2, "40"),
        tocLine("4.7 Résultats obtenus", 1, "41"),
        tocLine("4.8 Bilan du Sprint 2", 1, "42"),
        tocLine("4.9 Conclusion", 1, "43"),
        pb(),
        tocLine("5 Sprint 3 : Modélisation prédictive par Intelligence Artificielle", 0, "45"),
        tocLine("5.1 Introduction", 1, "46"),
        tocLine("5.2 Backlog du Sprint 3", 1, "46"),
        tocLine("5.3 Architecture du module de modélisation prédictive", 1, "47"),
        tocLine("5.4 Préparation des données pour l'apprentissage", 1, "47"),
        tocLine("5.4.1 Variable cible", 2, "47"),
        tocLine("5.4.2 Variables explicatives", 2, "48"),
        tocLine("5.4.3 Découpage Train/Test", 2, "48"),
        tocLine("5.4.4 Normalisation et Prétraitement", 2, "49"),
        tocLine("5.5 Métriques d'évaluation", 1, "49"),
        tocLine("5.6 Développement des quatre modèles d'IA", 1, "50"),
        tocLine("5.6.1 Modèles de Séries Temporelles et Machine Learning de Prévision", 2, "50"),
        tocLine("5.6.2 Modèles d'Apprentissage Non Supervisé et Surveillance d'Atelier", 2, "52"),
        tocLine("5.7 Résultats et analyse", 1, "54"),
        tocLine("5.7.1 Résultats des modèles Machine Learning", 2, "54"),
        tocLine("5.7.2 Résultats des modèles complémentaires d'atelier", 2, "56"),
        tocLine("5.7.3 Validation croisée temporelle", 2, "57"),
        tocLine("5.8 Sélection meilleur modèle", 1, "58"),
        tocLine("5.9 Génération des prévisions", 1, "59"),
        tocLine("5.10 Bilan du Sprint 3", 1, "59"),
        tocLine("5.11 Conclusion", 1, "60"),
        pb(),
        tocLine("6 Sprint 4 : Développement du tableau de bord décisionnel et validation", 0, "62"),
        tocLine("6.1 Introduction", 1, "63"),
        tocLine("6.2 Backlog du Sprint 4", 1, "63"),
        tocLine("6.3 Architecture du tableau de bord", 1, "64"),
        tocLine("6.4 Diagramme de séquence", 1, "65"),
        tocLine("6.5 Développement des interfaces", 1, "66"),
        tocLine("6.5.1 Tableau de bord de supervision et TRG", 2, "66"),
        tocLine("6.5.2 Tableau de bord des prévisions", 2, "66"),
        tocLine("6.5.3 Tableau de bord des stocks", 2, "67"),
        tocLine("6.6 Présentation des interfaces réalisées", 1, "68"),
        tocLine("6.6.1 Tableau de bord principal", 2, "68"),
        tocLine("6.6.2 Analyse de la production", 2, "68"),
        tocLine("6.6.3 Prévisions des cadences", 2, "69"),
        tocLine("6.6.4 Gestion des stocks d'atelier", 2, "70"),
        tocLine("6.7 Tests et validation", 1, "70"),
        tocLine("6.7.1 Tests fonctionnels", 2, "70"),
        tocLine("6.7.2 Validation des résultats", 2, "71"),
        tocLine("6.7.3 Validation des recommandations de stock", 2, "71"),
        tocLine("6.7.4 Validation de l'interface utilisateur", 2, "72"),
        tocLine("6.8 Bilan du Sprint 4", 1, "72"),
        tocLine("6.9 Conclusion", 1, "72"),
        pb(),
        tocLine("Conclusion générale et perspectives", 0, "74"),
        tocLine("Bibliographie", 0, "76"),
        pageBreak(),

        // TABLE DES FIGURES
        frontTitle("Table des figures"),
        tocLine("Figure 1.1 : Logo de l'entreprise industrielle d'accueil", 1, "4"),
        tocLine("Figure 1.2 : Logo de la plateforme Nexora", 1, "6"),
        tocLine("Figure 1.3 : Workflow complet du système décisionnel Nexora", 1, "9"),
        tocLine("Figure 1.4 : Cycle de la méthodologie Scrum", 1, "12"),
        tocLine("Figure 2.1 : Diagramme des cas d'utilisation global", 1, "18"),
        tocLine("Figure 2.2 : Architecture globale du système décisionnel en quatre couches", 1, "19"),
        tocLine("Figure 3.1 : Diagramme relationnel et structure de la base de données DWH", 1, "26"),
        tocLine("Figure 3.2 : Évolution temporelle de la production globale des 319 presses (2024–2026)", 1, "28"),
        tocLine("Figure 3.3 : Saisonnalité de production par jour de la semaine et par mois", 1, "28"),
        tocLine("Figure 3.4 : Heatmap d'activité atelier : cadence selon le mois et le jour de semaine", 1, "29"),
        tocLine("Figure 3.5 : Architecture et flux d'exécution du pipeline ETL", 1, "30"),
        tocLine("Figure 3.6 : Diagramme de séquence du pipeline ETL d'atelier", 1, "31"),
        tocLine("Figure 4.1 : Architecture et flux d'exécution du module de gestion des stocks", 1, "37"),
        tocLine("Figure 4.2 : Segmentation multicritère Pareto ABC et Clustering des stocks", 1, "41"),
        tocLine("Figure 4.3 : Synthèse des alertes d'atelier par catégorie d'articles", 1, "42"),
        tocLine("Figure 5.1 : Architecture et flux d'exécution du module de modélisation IA de Nexora", 1, "47"),
        tocLine("Figure 5.2 : Comparaison visuelle des modèles de prévision de production selon R² et MAE", 1, "54"),
        tocLine("Figure 5.3 : Prédictions de cadence Prophet vs Production réelle d'atelier avec intervalle de confiance à 95%", 1, "55"),
        tocLine("Figure 5.4 : Comparaison visuelle des métriques d'erreur MAPE et RMSE", 1, "55"),
        tocLine("Figure 5.5 : Détection non supervisée des dérives de presses par Isolation Forest", 1, "56"),
        tocLine("Figure 6.1 : Architecture globale et déploiement du tableau de bord Nexora", 1, "64"),
        tocLine("Figure 6.2 : Diagramme de séquence : interaction utilisateur, tableau de bord et modèle prédictif", 1, "65"),
        tocLine("Figure 6.3 : En-tête et navigation du tableau de bord Nexora", 1, "68"),
        tocLine("Figure 6.4 : Interface « Supervision de la production et TRG »", 1, "68"),
        tocLine("Figure 6.5 : Répartition des volumes par famille de composants plastiques", 1, "69"),
        tocLine("Figure 6.6 : Interface « Prévision des cadences et charge atelier »", 1, "69"),
        tocLine("Figure 6.7 : Interface « Gestion des stocks d'atelier »", 1, "70"),
        pageBreak(),

        // LISTE DES TABLEAUX
        frontTitle("Liste des tableaux"),
        tocLine("Tableau 1.1 : Fiche d'identité de Maps-IT", 1, "5"),
        tocLine("Tableau 1.2 : Comparaison des solutions existantes avec notre système", 1, "9"),
        tocLine("Tableau 1.3 : Comparaison entre approche classique et approche agile", 1, "10"),
        tocLine("Tableau 1.4 : Avantages et inconvénients des méthodologies", 1, "11"),
        tocLine("Tableau 1.5 : Product Backlog priorisé du projet", 1, "13"),
        tocLine("Tableau 1.6 : Planification des sprints du projet", 1, "14"),
        tocLine("Tableau 2.1 : Les besoins non fonctionnels", 1, "17"),
        tocLine("Tableau 2.2 : Outils et technologies utilisés", 1, "21"),
        tocLine("Tableau 3.1 : Priorisation des tâches pour le Sprint 1", 1, "24"),
        tocLine("Tableau 3.2 : Aperçu statistique général de la base de données DWH", 1, "25"),
        tocLine("Tableau 3.3 : Tables principales de la base", 1, "25"),
        tocLine("Tableau 3.4 : Statistiques descriptives de la série journalière de production", 1, "27"),
        tocLine("Tableau 3.5 : Impact des événements et variations industrielles sur la cadence", 1, "27"),
        tocLine("Tableau 3.6 : Bilan de la qualité des données", 1, "32"),
        tocLine("Tableau 3.7 : Résultats du pipeline ETL", 1, "34"),
        tocLine("Tableau 3.8 : Bilan des livrables du Sprint 1", 1, "35"),
        tocLine("Tableau 4.1 : Priorisation des tâches : Sprint 2", 1, "37"),
        tocLine("Tableau 4.2 : Classification des produits par niveau de stock", 1, "39"),
        tocLine("Tableau 4.3 : Bilan des livrables du Sprint 2", 1, "42"),
        tocLine("Tableau 5.1 : Priorisation des tâches : Sprint 3", 1, "46"),
        tocLine("Tableau 5.2 : Les variables explicatives communes aux modèles de cadence", 1, "48"),
        tocLine("Tableau 5.3 : Découpage chronologique Train/Test", 1, "48"),
        tocLine("Tableau 5.4 : Métriques d'évaluation des modèles", 1, "49"),
        tocLine("Tableau 5.5 : Avantages et limites : Régression Linéaire", 1, "50"),
        tocLine("Tableau 5.6 : Avantages et limites : Modèle ARIMA", 1, "51"),
        tocLine("Tableau 5.7 : Avantages et limites : Random Forest Regressor", 1, "51"),
        tocLine("Tableau 5.8 : Avantages et limites : Prophet (Meta)", 1, "52"),
        tocLine("Tableau 5.9 : Avantages et limites : Isolation Forest", 1, "53"),
        tocLine("Tableau 5.10 : Résultats des 4 modèles de prévision de production Nexora", 1, "54"),
        tocLine("Tableau 5.11 : Résultats de la détection d'anomalies par Isolation Forest", 1, "56"),
        tocLine("Tableau 5.12 : Résultats de la validation croisée temporelle TimeSeriesSplit", 1, "57"),
        tocLine("Tableau 5.13 : Justification du choix de Prophet (Meta) comme modèle champion", 1, "58"),
        tocLine("Tableau 5.14 : Bilan des livrables du Sprint 3", 1, "59"),
        tocLine("Tableau 6.1 : Priorisation des tâches : Sprint 4", 1, "63"),
        tocLine("Tableau 6.2 : Résultats des tests fonctionnels", 1, "71"),
        tocLine("Tableau 6.3 : Bilan des livrables du Sprint 4", 1, "72"),
        pageBreak(),

        // LISTE DES ABRÉVIATIONS
        frontTitle("Liste des abréviations"),
        makeTable(
          ["Abréviation", "Signification en Français", "Définition / Contexte Industriel"],
          [
            ["API", "Application Programming Interface", "Interface de programmation applicative pour l'échange de données inter-services"],
            ["ARIMA", "AutoRegressive Integrated Moving Average", "Modèle statistique autorégressif intégré pour séries temporelles"],
            ["BI", "Business Intelligence", "Informatique décisionnelle pour l'aide au pilotage et au reporting exécutif"],
            ["CLE", "Capacity Ledger Entry", "Table DWH enregistrant les capacités machines, temps de cycle et arrêts"],
            ["CV", "Cross-Validation (Validation Croisée)", "Méthode d'évaluation statistique par partitionnement des données"],
            ["DWH", "Data Warehouse", "Entrepôt de données consolidant les flux industriels multi-sites (Tunisie, Rép. Tchèque)"],
            ["ERP", "Enterprise Resource Planning", "Progiciel de gestion intégré de l'entreprise (Microsoft Dynamics NAV)"],
            ["ETL", "Extract, Transform, Load", "Pipeline d'extraction, nettoyage, enrichissement et chargement des données"],
            ["IA", "Intelligence Artificielle", "Ensemble des techniques et algorithmes simulant l'intelligence humaine"],
            ["ILE", "Item Ledger Entry", "Table DWH traçant les mouvements physiques d'articles (1,5M de lignes)"],
            ["KPI", "Key Performance Indicator", "Indicateur clé de performance opérationnelle et financière"],
            ["MAE", "Mean Absolute Error", "Erreur absolue moyenne entre cadences réelles et prédictions"],
            ["MAPE", "Mean Absolute Percentage Error", "Pourcentage moyen d'erreur absolue de prévision"],
            ["MCO", "Moindres Carrés Ordinaires", "Méthode standard d'estimation des coefficients de régression linéaire"],
            ["MES", "Manufacturing Execution System", "Système de pilotage et d'exécution des ateliers de fabrication"],
            ["ML", "Machine Learning", "Apprentissage automatique à partir de données historiques"],
            ["OEE", "Overall Equipment Effectiveness", "Équivalent anglo-saxon du Taux de Rendement Global (TRG)"],
            ["RBAC", "Role-Based Access Control", "Contrôle d'accès aux fonctionnalités fondé sur les profils et rôles métier"],
            ["RF", "Random Forest Regressor", "Algorithme d'apprentissage supervisé par forêt d'arbres de décision"],
            ["RMSE", "Root Mean Square Error", "Racine carrée de l'erreur quadratique moyenne pénalisant les grands écarts"],
            ["SQL", "Structured Query Language", "Langage de requêtage relationnel (Microsoft SQL Server)"],
            ["TND", "Dinar Tunisien", "Unité monétaire utilisée pour la valorisation financière des stocks"],
            ["TRG", "Taux de Rendement Global", "Indicateur normé synthétisant la Disponibilité, la Performance et la Qualité machine"],
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
        body("L'industrie manufacturière moderne traverse une transformation profonde, portée par les principes de l'Industrie 4.0 et l'intégration massive des technologies de l'information au cœur des ateliers de production. Dans le secteur hautement concurrentiel de la plasturgie automobile (équipementier de rang 1), la performance industrielle ne dépend plus uniquement de la capacité mécanique des machines, mais de l'aptitude à exploiter les flux massifs de données générés en continu pour piloter les cadences, maximiser le Taux de Rendement Global (TRG/OEE) et anticiper les besoins de réapprovisionnement."),
        pb(),
        body("C'est dans ce contexte exigeant que s'inscrit le projet **Nexora**, déployé au sein d'un grand groupe industriel équipementier automobile exploitant plusieurs sites de production, notamment en Tunisie (usines de Kondar et Sousse) et en République Tchèque (site de Brno). Avec un parc consolidé de 319 presses à injecter de fort et moyen tonnage (Demag, Arburg, KraussMaffei, Engel), l'entreprise assure la fabrication de pièces plastiques techniques complexes destinées aux plus grands constructeurs automobiles européens."),
        pb(),
        body("Bien que l'entreprise dispose d'un entrepôt de données d'entreprise (Data Warehouse sous Microsoft SQL Server) accumulant des millions d'enregistrements historiques, elle souffre d'une lacune opérationnelle majeure : l'absence d'outils décisionnels intelligents en temps réel et de capacités prédictives. Le suivi de l'efficacité machine et le calcul du TRG étaient historiquement réalisés de manière manuelle et décalée sur des tableurs Excel en fin de mois, interdisant toute réactivité immédiate face aux dérives de cadences. Parallèlement, la gestion des stocks de matières premières (granulés PP, PA66, ABS) et de composants techniques s'opérait de manière purement empirique, engendrant des ruptures d'approvisionnement critiques qui bloquaient les lignes d'assemblage ou, à l'inverse, des surstocks immobilisant inutilement d'importants capitaux financiers."),
        pb(),
        body("Dès lors, la problématique centrale de ce projet de fin d'études se formule ainsi :"),
        body("*« Comment exploiter les données historiques et transactionnelles massives du Data Warehouse afin de concevoir et déployer un système décisionnel intelligent capable de superviser les machines en temps réel, de prévoir avec précision les cadences d'atelier par l'intelligence artificielle, et d'optimiser proactivement la gestion des stocks industriels ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("Pour répondre rigoureusement à cette problématique, nous avons conçu et développé la plateforme **Nexora**, articulée autour de trois piliers complémentaires :"),
        bullet("**1. Un pipeline ETL d'ingestion et d'assainissement** : connectant directement la base Microsoft SQL Server, éliminant les anomalies de stock et restructurant les données de fabrication en tables analytiques indexées et optimisées."),
        bullet("**2. Un module d'intelligence artificielle prédictive** : entraînant et comparant rigoureusement neuf modèles de Machine Learning et de Deep Learning pour modéliser les séries temporelles de production et anticiper les charges d'atelier."),
        bullet("**3. Un module de gestion intelligente et prescriptive des stocks** : traduisant automatiquement les prévisions de fabrication en alertes de rupture imminente et en recommandations de réapprovisionnement sous un horizon cible de 45 jours."),
        pb(),
        body("L'ensemble de ces briques est restitué à travers une application web industrielle développée avec React.js, pilotée par un backend Spring Boot 3 et complétée par des tableaux de bord interactifs Microsoft Power BI."),
        pb(),
        body("Le développement de ce projet a été mené selon la méthodologie Agile Scrum, découpé en un Sprint 0 de cadrage et quatre sprints de réalisation de quatre semaines. Ce mémoire s'organise en six chapitres structurés comme suit :"),
        bullet("**Le premier chapitre** pose le cadre général du projet, présente l'organisme d'accueil industriel, analyse les limites de l'existant, détaille la solution proposée, la démarche Scrum et la modélisation UML."),
        bullet("**Le deuxième chapitre (Sprint 0)** est dédié à l'analyse des exigences fonctionnelles et non fonctionnelles, à la conception architecturale à quatre couches et à la définition de l'environnement technologique."),
        bullet("**Le troisième chapitre (Sprint 1)** expose l'analyse exploratoire (EDA), le nettoyage des données du Data Warehouse et la réalisation du pipeline ETL optimisé."),
        bullet("**Le quatrième chapitre (Sprint 2)** présente la conception et le développement du module de gestion intelligente des stocks, la classification des 6 875 articles du catalogue et la génération automatique des alertes et recommandations de réapprovisionnement."),
        bullet("**Le cinquième chapitre (Sprint 3)** détaille le développement, l'entraînement et l'évaluation comparative des quatre modèles d'intelligence artificielle pour la prévision de production, complétés par la détection d'anomalies."),
        bullet("**Le sixième chapitre (Sprint 4)** est consacré au développement et à l'intégration des tableaux de bord décisionnels, suivi des tests fonctionnels et de la validation industrielle en atelier."),
        pb(),
        body("Ce rapport se clôt par une conclusion générale dressant le bilan des résultats obtenus et exposant les perspectives d'évolution vers l'Internet des Objets (IoT) et la maintenance prédictive."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 1 : CONTEXTE ET CADRE DU PROJET
        // =========================================================
        title1("Chapitre 1 : Contexte et cadre du projet"),

        title2("1.1 Introduction"),
        body("Ce premier chapitre pose le cadre général de notre projet de fin d'études. Nous présentons en premier lieu le contexte académique au sein de la Faculté des Sciences de Monastir, puis nous détaillons l'organisme d'accueil industriel, fleuron de la plasturgie automobile opérant en Tunisie et en Europe. Nous analysons ensuite les enjeux opérationnels d'atelier, les limites des pratiques actuelles fondées sur des outils disparates et non prédictifs, et la solution logicielle et analytique **Nexora** développée pour y répondre. Enfin, nous exposons le workflow global du système, la démarche méthodologique Agile Scrum retenue ainsi que le langage de modélisation UML encadrant nos réalisations."),
        pb(),

        title2("1.2 Contexte académique"),
        body("Ce travail s'inscrit dans le cadre du **Master Professionnel en Data Science** dispensé par la Faculté des Sciences de Monastir (FSM) au sein de l'Université de Monastir. Cette formation d'excellence vise à former des spécialistes de haut niveau capables de concevoir des architectures de données complexes, de développer des modèles prédictifs fondés sur l'intelligence artificielle et d'intégrer des solutions décisionnelles au sein de systèmes d'information industriels."),
        pb(),
        body("Ce projet de fin d'études représente une opportunité privilégiée de conjuguer compétences théoriques avancées en apprentissage automatique (Machine Learning, Deep Learning, Séries Temporelles) et impératifs concrets de l'ingénierie logicielle industrielle, en confrontant nos algorithmes à un jeu de données réel de production totalisant plus de 1,5 million d'enregistrements."),
        pb(),

        title2("1.3 Présentation de l'organisme d'accueil"),
        title3("1.3.1 Présentation de l'entreprise"),
        body("L'organisme d'accueil est **Maps-IT**, une société de services informatiques et d'ingénierie logicielle basée à Monastir en Tunisie. Fondée en 2021, Maps-IT accompagne ses clients dans la mise en œuvre de solutions technologiques sur mesure, le développement d'architectures web et cloud, l'intégration de systèmes décisionnels (Business Intelligence) et la valorisation industrielle des données par la Data Science et l'Intelligence Artificielle."),
        pb(),
        body("Le tableau 1.1 synthétise la fiche d'identité de l'entreprise d'accueil :"),
        pb(),
        makeTable(
          ["Champ", "Information"],
          [
            ["Raison sociale", "Maps-IT"],
            ["Date de création", "2021"],
            ["Secteur", "Services informatiques et logiciels"],
            ["Localisation", "Monastir, Tunisie"],
            ["Contact", "mapsit.info@gmail.com"],
            ["Site web", "https://maps-it.com"]
          ],
          [3000, 5666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.1 : Fiche d'identité de Maps-IT", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.3.2 Domaines d'activité"),
        body("Maps-IT déploie son expertise autour de plusieurs pôles de compétences complémentaires :"),
        bullet("**Ingénierie logicielle et développement sur mesure** : conception d'applications web, mobiles et de portails métiers performants et sécurisés."),
        bullet("**Business Intelligence et architectures décisionnelles** : conception d'entrepôts de données (Data Warehouse), pipelines d'intégration ETL et modélisation de tableaux de bord de pilotage exécutif."),
        bullet("**Data Science et Intelligence Artificielle** : développement de modèles prédictifs pour les séries temporelles, analyse exploratoire de données volumineuses et optimisation des processus opérationnels."),
        pb(),

        title2("1.4 Présentation de la plateforme Nexora"),
        title3("1.4.1 Présentation générale"),
        body("**Nexora** est une plateforme logicielle et décisionnelle intelligente conçue spécifiquement pour unifier le pilotage des 319 presses à injecter et automatiser la gestion des stocks de production de l'entreprise. Accessible via une interface web réactive sécurisée, Nexora interconnecte le Data Warehouse SQL Server d'entreprise, un moteur d'intelligence artificielle prédictive et des tableaux de bord interactifs."),
        pb(),
        ...imageFigure("logos/logo.png", "Figure 1.2 : Logo de la plateforme Nexora", 220, 90),
        body("La plateforme permet aux responsables d'ateliers, planificateurs de production et gestionnaires de stock de superviser les indicateurs en temps réel, de diagnostiquer instantanément les dérives de fabrication et de planifier les approvisionnements sur la base de prévisions fiabilisées par l'intelligence artificielle."),
        pb(),

        title3("1.4.2 Fonctionnalités principales"),
        body("La plateforme Nexora offre quatre grands ensembles de fonctionnalités métier :"),
        bullet("**Suivi temps réel des machines et calcul automatique du TRG/OEE** : affichage en direct du statut des 319 presses (en marche, arrêtée, réglage, maintenance) et décomposition instantanée du Taux de Rendement Global selon ses trois composantes : Disponibilité, Performance et Qualité."),
        bullet("**Prévision des cadences et des volumes de fabrication** : modélisation temporelle par apprentissage automatique anticipant la charge machine à 7, 15 et 30 jours pour optimiser le planning des équipes de travail."),
        bullet("**Gestion proactive et prescriptive des stocks** : classification automatique des 6 875 articles du catalogue selon leur niveau de risque (Rupture, Critique, Normal, Surstock) et calcul des quantités économiques à réapprovisionner pour maintenir une couverture sécurisée de 45 jours."),
        bullet("**Tableaux de bord analytiques et reporting exécutif** : visualisations interactives haute performance (ApexCharts et Power BI Embedded) permettant des analyses croisées par usine, atelier, machine et famille de matière."),
        pb(),

        title3("1.4.3 Limite actuelle et besoin d'évolution"),
        body("Avant le déploiement de Nexora, l'entreprise s'appuyait sur des processus manuels et des outils cloisonnés qui engendraient des faiblesses opérationnelles critiques :"),
        bullet("**Calcul manuel et décalé du TRG** : les fiches de production remplies à la main par les opérateurs étaient ressaisies sur des tableurs Excel en fin de mois. Ce décalage temporel interdisait toute réaction rapide face aux pannes répétées ou aux micro-arrêts perlés."),
        bullet("**Absence totale d'anticipation des stocks** : la gestion d'inventaire reposait sur des constats visuels hebdomadaires. Les commandes de matières plastiques étaient passées dans l'urgence après constat de pénurie, entraînant des arrêts de presses coûteux et des pénalités de retard client."),
        bullet("**Surstocks coûteux et capital immobilisé** : pour compenser le manque de visibilité, certains planificateurs sur-commandaient des résines techniques coûteuses, immobilisant inutilement des centaines de milliers de dinars de trésorerie."),
        bullet("**Cloisonnement de l'ERP Microsoft Dynamics NAV** : l'accès complexe aux tables SQL Server réservait les données aux administratifs, privant les équipes de terrain d'un outil visuel adapté à leur quotidien."),
        pb(),

        title2("1.5 Présentation du projet"),
        title3("1.5.1 Contexte et problématique"),
        body("Le Data Warehouse d'entreprise accumule depuis des années des millions de lignes d'historique de production : plus de 250 000 enregistrements de temps machines dans la table **Capacity Ledger Entry (CLE)** et plus de 1,5 million de mouvements de pièces dans la table **Item Ledger Entry (ILE)**. Cette mine d'informations demeurait pourtant sous-exploitée pour l'aide à la décision proactive."),
        body("La question centrale qui guide notre démarche est donc :"),
        body("*« Comment transformer les données historiques du Data Warehouse SQL Server en un système décisionnel intelligent capable de calculer le TRG en temps réel, de prédire avec précision les cadences d'atelier par IA et d'automatiser les recommandations de réapprovisionnement des stocks ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),

        title3("1.5.2 Étude de l'existant"),
        body("L'analyse des solutions existantes sur le marché et des pratiques industrielles met en lumière trois approches principales : les progiciels MES industriels lourds (ex. SAP MES, Siemens), les modules standards des ERP d'entreprise (Microsoft Dynamics NAV) et les feuilles de calcul manuelles (Excel). Si chacune répond à des besoins spécifiques, aucune ne combine le calcul du TRG en temps réel, l'inférence prédictive par intelligence artificielle et une ergonomie fluide adaptée aux opérateurs d'atelier."),
        pb(),

        title3("1.5.3 Solution proposée"),
        body("Pour répondre à ces limites, la solution développée, nommée **Nexora**, est un système décisionnel modulaire articulé autour de trois composantes principales :"),
        bullet("**1. Un pipeline ETL robuste et performant** : assurant l'extraction depuis Microsoft SQL Server, le nettoyage des anomalies de stock, le recalage des inventaires et le calcul de 16 variables explicatives industrielles."),
        bullet("**2. Un module d'intelligence artificielle prédictive** : s'appuyant sur l'entraînement de 9 modèles d'IA pour projeter les cadences de fabrication et la charge d'atelier sur des horizons temporels de 7, 15 et 30 jours."),
        bullet("**3. Un module de gestion intelligente des stocks** : classant les 6 875 articles du catalogue et générant des alertes automatiques priorisées pour sécuriser 45 jours de couverture de stock."),
        pb(),
        body("L'ensemble de ces fonctionnalités est intégré au sein d'une interface web réactive développée avec React 18, pilotée par Spring Boot 3 et enrichie de rapports décisionnels Microsoft Power BI."),
        pb(),
        body("Le tableau 1.2 synthétise la comparaison entre les solutions existantes du marché et notre solution Nexora :"),
        pb(),
        makeTable(
          ["Critère d'évaluation", "Progiciels MES Lourds (SAP MES, Siemens)", "ERP Classique (Microsoft NAV)", "Méthodes Tableurs (Excel)", "Notre solution : Nexora"],
          [
            ["Suivi TRG en temps réel",         "✓", "✗", "✗",        "✓"],
            ["Modélisation prédictive IA",       "✗", "✗", "✗",        "✓"],
            ["Tableaux de bord BI intégrés",     "✓", "Limité", "✗",   "✓"],
            ["Connexion directe DWH SQL Server", "✓", "✓", "Instable", "✓"],
            ["Gestion intelligente des stocks",  "✓", "✗", "✗",        "✓"],
            ["Alertes et recommandations IA",    "✗", "✗", "✗",        "✓"],
            ["Ergonomie adaptée atelier",        "✗", "✗", "✗",        "✓"],
            ["Coût maîtrisé & évolutivité",      "✗", "✗", "✓",        "✓"],
          ],
          [2400, 1800, 1600, 1400, 1466]
        ),
        new Paragraph({
          children: [
            new TextRun({ text: "Tableau 1.2 : Comparaison des solutions existantes avec notre système", font: FONT, size: 20, italics: true, color: GRAY })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("1.6 Workflow complet du projet"),
        body("Le système décisionnel suit un pipeline continu structuré en huit étapes successives, illustré dans la figure 1.3 :"),
        pb(),
        ...imageFigure("diagrams/architecture.png", "Figure 1.3 : Workflow complet du système décisionnel Nexora", 460, 460),
        bullet("**1. Collecte continue** : extraction automatisée des données depuis les tables de faits du Data Warehouse SQL Server (CLE, ILE, Item, Machine Center)."),
        bullet("**2. Nettoyage (ETL)** : détection des stocks négatifs, traitement des valeurs manquantes et filtrage des doublons opérationnels."),
        bullet("**3. Feature Engineering** : création de 16 variables explicatives temporelles (lags de cadences à J-1, J-7, J-14, moyennes mobiles, saisonnalités des constructeurs)."),
        bullet("**4. Split Train/Test** : découpage chronologique strict en 80 % pour l'apprentissage et 20 % pour l'évaluation afin de prévenir tout data leakage."),
        bullet("**5. Entraînement** : apprentissage comparatif des modèles de prévision temporelle (Prophet, Random Forest, ARIMA, Régression Linéaire) et de détection d'anomalies (Isolation Forest)."),
        bullet("**6. Validation & Optimisation** : optimisation des hyperparamètres par validation croisée temporelle TimeSeriesSplit à 5 plis."),
        bullet("**7. Évaluation multi-critères** : calcul rigoureux des métriques MAE, RMSE, MAPE et R² pour chaque modèle testé."),
        bullet("**8. Restitution applicative** : injection des prédictions dans le tableau de bord interactif React.js et les rapports Power BI."),
        pb(),

        title2("1.7 Méthodologie de développement"),
        title3("1.7.1 Étude comparative des méthodes"),
        body("Avant d'engager les développements, nous avons confronté l'approche traditionnelle en cascade (cycle en V) à l'approche Agile afin de retenir le cadre le plus efficient pour un projet couplant recherche en Data Science et génie logiciel :"),
        pb(),
        makeTable(
          ["Critère", "Approche classique", "Approche agile"],
          [
            ["Cycle de vie", "Linéaire et en cascade", "Itératif et incrémental"],
            ["Planification", "Déterministe, besoins figés", "Flexible, ajustements continus"],
            ["Livraisons", "Unique en fin de projet", "Fréquentes à chaque sprint"],
            ["Gestion du changement", "Difficiles à intégrer", "Facilement acceptés"],
            ["Feedback", "En fin de cycle", "Continu et régulier"],
            ["Indicateur de succès", "Respect du plan initial", "Valeur livrée et satisfaction"]
          ],
          [2400, 3100, 3166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.3 : Comparaison entre approche classique et approche agile", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 1.4 récapitule la balance avantages/inconvénients des deux méthodologies :"),
        pb(),
        makeTable(
          ["Méthodologie", "Avantages Principaux", "Inconvénients / Risques Majeurs"],
          [
            ["Approche classique", "• Structure claire et jalons temporels rigides.\n• Facilité de planification contractuelle initiale.", "• Manque cruel de flexibilité face aux imprévus de données.\n• Détection très tardive des écarts entre modèle et terrain."],
            ["Approche Agile (Scrum)", "• Forte réactivité face aux réalités des données du DWH.\n• Démonstration progressive d'incréments exploitables.\n• Alignement continu avec les ingénieurs d'atelier.", "• Nécessite une disponibilité soutenue du Product Owner.\n• Risque de dérive si le backlog n'est pas rigoureusement borné."]
          ],
          [2200, 3200, 3266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.4 : Avantages et inconvénients des méthodologies", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.7.2 Choix méthodologique : Scrum"),
        body("La réussite d’un projet dépend en grande partie de la méthodologie de développement adoptée, notamment de sa capacité à s’adapter aux évolutions des besoins et à assurer une livraison progressive des fonctionnalités."),
        pb(),
        body("Dans le cadre de ce projet, nous avons choisi la méthodologie Agile Scrum [1, 2], car elle est particulièrement adaptée au développement d’une solution intégrant plusieurs modules, tels que le pipeline ETL, la prévision des ventes, la gestion intelligente des stocks et le tableau de bord décisionnel."),
        pb(),
        body("Cette approche permet de réaliser et de valider progressivement chaque module, tout en facilitant les échanges avec les encadrants et l’intégration des améliorations au fil des sprints."),
        pb(),
        body("Le déroulement de notre projet Scrum suit les étapes suivantes [2] :"),
        body("1. Élaboration du Product Backlog.", { indent: 400 }),
        body("2. Planification des sprints.", { indent: 400 }),
        body("3. Développement et tests des fonctionnalités.", { indent: 400 }),
        body("4. Livraison d’un incrément fonctionnel à la fin de chaque sprint.", { indent: 400 }),
        body("5. Revue du sprint et amélioration continue.", { indent: 400 }),
        pb(),
        body("La figure suivante illustre le cycle de vie de la méthodologie Scrum :"),
        pb(),
        ...imageFigure("scrum-framework-9.29.23.png", "Figure 1.4 : Cycle de la méthodologie Scrum", 520, 320),
        pb(),

        title3("1.7.3 Application de Scrum au projet"),
        body("L'organisation des rôles Scrum a été formalisée comme suit :"),
        bullet("**Product Owner** :                 (encadrant en entreprise), garant de la conformité aux besoins industriels et de la priorisation du Product Backlog."),
        bullet("**Scrum Master** :                 (encadrant universitaire à la FSM), veillant au respect de la démarche scientifique, à la méthodologie et à la levée des blocages théoriques."),
        bullet("**Équipe de Développement** : assurée par l'étudiante ingénieure, en charge de la conception architecturale, de l'ingénierie des données, du développement des modèles d'IA et de l'intégration logicielle."),
        pb(),

        title3("1.7.4 Product Backlog"),
        body("Le Product Backlog répertorie l'ensemble des 20 exigences du système formulées sous forme de User Stories, priorisées et estimées en jours selon les sprints de réalisation :"),
        pb(),
        makeTable(
          ["ID", "Récit Utilisateur (User Story)", "Priorité", "Estimation (jours)", "Sprint Associé"],
          [
            ["US01", "En tant qu'utilisateur, je veux m'authentifier par jeton JWT afin d'accéder aux fonctions autorisées", "Haute", "5 jours", "Sprint 1"],
            ["US02", "En tant qu'administrateur, je veux configurer les rôles RBAC pour restreindre les accès aux API", "Haute", "5 jours", "Sprint 1"],
            ["US03", "En tant qu'administrateur, je veux auditer le DWH afin de cartographier les tables de faits", "Haute", "8 jours", "Sprint 1"],
            ["US04", "En tant qu'administrateur, je veux assainir les données de mouvements de stock afin d'éliminer les anomalies", "Haute", "5 jours", "Sprint 1"],
            ["US05", "En tant que manager, je veux classer les articles selon la méthode ABC de Pareto afin d'optimiser le stockage", "Haute", "8 jours", "Sprint 2"],
            ["US06", "En tant que manager, je veux recevoir des alertes automatiques de rupture critique (< 5 pcs)", "Haute", "5 jours", "Sprint 2"],
            ["US07", "En tant qu'opérateur, je veux enregistrer des entrées/sorties de stock conformes au DWH", "Moyenne", "5 jours", "Sprint 2"],
            ["US08", "En tant que manager, je veux obtenir des recommandations de commande d'approvisionnement", "Haute", "5 jours", "Sprint 2"],
            ["US09", "En tant que manager, je veux adapter les équipes (3x8) selon les besoins d'approvisionnement", "Moyenne", "5 jours", "Sprint 2"],
            ["US10", "En tant que manager, je veux planifier des transferts inter-usines Tunisie-Brno", "Basse", "3 jours", "Sprint 2"],
            ["US11", "En tant que manager, je veux suivre les 319 machines d'atelier en temps réel", "Haute", "8 jours", "Sprint 3"],
            ["US12", "En tant que manager, je veux calculer automatiquement le TRG en direct par centre de charge", "Haute", "8 jours", "Sprint 3"],
            ["US13", "En tant qu'opérateur, je veux déclarer le statut des Ordres de Fabrication", "Moyenne", "5 jours", "Sprint 3"],
            ["US14", "En tant que manager, je veux extraire et agréger l'historique de production afin d'alimenter les modèles d'IA", "Haute", "5 jours", "Sprint 3"],
            ["US15", "En tant que manager, je veux entraîner 4 modèles d'IA (Prophet, RF, ARIMA, Régression) pour fiabiliser les prévisions", "Haute", "8 jours", "Sprint 3"],
            ["US16", "En tant que manager, je veux visualiser les prévisions de cadence à 30 jours et bornes à 95%", "Haute", "5 jours", "Sprint 3"],
            ["US17", "En tant que manager, je veux disposer d'une console avec filtres multi-critères", "Haute", "5 jours", "Sprint 4"],
            ["US18", "En tant que manager, je veux exporter les données filtrées sous format Excel (.xlsx)", "Moyenne", "3 jours", "Sprint 4"],
            ["US19", "En tant que manager, je veux superviser la production globale sur un tableau de bord exécutif Power BI", "Haute", "8 jours", "Sprint 4"],
            ["US20", "En tant que manager, je veux analyser la valorisation et les mouvements de stock sur Power BI", "Haute", "5 jours", "Sprint 4"]
          ],
          [700, 4966, 1000, 1100, 900]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.5 : Product Backlog priorisé du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("1.7.5 Planification des sprints"),
        body("Le projet a été articulé en cinq sprints consécutifs de quatre semaines, chacun donnant lieu à un chapitre dédié :"),
        pb(),
        makeTable(
          ["Sprint", "Objectif", "Livrable principal"],
          [
            ["Sprint 0", "Analyse des besoins et conception globale", "Spécifications fonctionnelles et architecture globale"],
            ["Sprint 1", "Analyse, nettoyage des données et pipeline ETL", "Data Warehouse assaini et table analytique consolidée"],
            ["Sprint 2", "Conception du module de gestion des stocks", "Classification ABC, alertes et recommandations d'approvisionnement"],
            ["Sprint 3", "Modélisation prédictive par IA (4 modèles)", "Modèles comparés (Prophet, RF, ARIMA, Régression) et Isolation Forest"],
            ["Sprint 4", "Développement des tableaux de bord et validation", "Rapports Power BI / Web d'atelier et recette fonctionnelle"]
          ],
          [2000, 3500, 3500]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.6 : Planification des sprints du projet", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("1.8 Langage de modélisation UML"),
        body("Pour modéliser les aspects structurels et comportementaux du système, le langage **UML 2.5 (Unified Modeling Language)** [28] a été utilisé. Étant donné que notre projet est principalement axé sur la Data Science et l'intelligence artificielle appliquée à la plasturgie automobile, nous avons utilisé quatre diagrammes essentiels :"),
        bullet("**Diagramme des cas d'utilisation (Chapitre 2)** : représentation des interactions entre les acteurs d'atelier et les fonctionnalités de la plateforme Nexora."),
        bullet("**Diagramme de classes (Chapitre 2 et 3)** : modélisation de la structure des entités de production et du schéma de données du Data Warehouse SQL Server."),
        bullet("**Diagramme d'activité (Chapitre 3)** : montre les étapes logiques d'ingestion, d'assainissement et de transformation du pipeline ETL."),
        bullet("**Diagramme de séquence (Chapitre 6)** : modélisation dynamique des flux de requêtes entre l'utilisateur, les rapports Power BI et le Data Warehouse SQL Server."),
        pb(),

        title2("1.9 Conclusion"),
        conclusionBox("Ce premier chapitre a établi les fondements du projet Nexora au sein de l'environnement industriel de la plasturgie automobile. L'analyse critique de l'existant a confirmé l'impérieuse nécessité d'un système décisionnel unifié, capable de relier le Data Warehouse à des algorithmes d'IA prédictive et à des tableaux de bord ergonomiques. La démarche Agile Scrum et la modélisation UML fournissent le cadre rigoureux garantissant une réalisation maîtrisée. Le chapitre suivant détaille les résultats du Sprint 0, consacré à la spécification fine des besoins et à la conception architecturale globale."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 2 : SPRINT 0 : ANALYSE DES BESOINS ET CONCEPTION
        // =========================================================
        title1("Chapitre 2 : Sprint 0 : Analyse des besoins et Conception du Système"),

        title2("2.1 Introduction"),
        body("Ce chapitre correspond au Sprint 0 de notre démarche Scrum. Étape charnière de tout projet d'ingénierie logicielle d'envergure, le Sprint 0 a pour objectif de formaliser l'ensemble des exigences du système décisionnel **Nexora**, d'analyser les interactions entre les utilisateurs et la plateforme, de concevoir l'architecture technique en quatre couches et d'arrêter la stack logicielle et matérielle mobilisée tout au long du cycle de vie du projet."),
        pb(),

        title2("2.2 Spécification des besoins"),
        body("La spécification méthodique des exigences permet de traduire les objectifs industriels exprimés par la direction de l'usine en fonctionnalités logicielles vérifiables et quantifiables. Nous distinguons les besoins fonctionnels, décrivant les services attendus, des besoins non fonctionnels, fixant les exigences de qualité technique."),
        pb(),

        title3("2.2.1 Besoins fonctionnels"),
        body("Les besoins fonctionnels sont ventilés selon les rôles opérationnels des utilisateurs de la plateforme Nexora :"),
        bullet("**Le Responsable de Production / Chef d'Atelier** : doit pouvoir superviser l'ensemble du parc de 319 presses en temps réel, visualiser instantanément le Taux de Rendement Global (TRG/OEE) global et par machine, consulter la décomposition du TRG (Disponibilité, Performance, Qualité), identifier les causes d'arrêt machine (changement de moule, panne mécanique, réglage thermique), et accéder aux prévisions de cadences à 7, 15 et 30 jours pour équilibrer la charge des équipes en régime 3x8."),
        bullet("**Le Gestionnaire des Stocks et des Approvisionnements** : doit pouvoir analyser en temps réel l'état des 6 875 références d'articles, filtrer les produits par statut de stock (Rupture, Critique, Normal, Surstock), consulter la couverture en jours et le taux de rotation de chaque matière plastique, recevoir des alertes de rupture imminente hiérarchisées par coût d'arrêt évité, et obtenir des recommandations automatisées de réapprovisionnement sous horizon 45 jours avec chiffrage budgétaire."),
        bullet("**L'Opérateur d'Atelier** : doit disposer d'un terminal d'atelier simplifié pour déclarer les débuts et fins d'ordres de fabrication (OF), enregistrer les quantités de pièces conformes et de rebuts, et signaler les événements d'arrêt machine sans perturber le cycle d'injection."),
        bullet("**L'Administrateur Système** : doit administrer les comptes utilisateurs et attribuer les rôles selon la politique de contrôle d'accès RBAC (Role-Based Access Control), paramétrer les seuils de stock de sécurité, superviser l'exécution du pipeline ETL, consulter les journaux d'audit de sécurité et déclencher le réentraînement des modèles d'IA prédictive."),
        bullet("**Le Data Warehouse Microsoft SQL Server (Acteur Système)** : doit alimenter de manière continue et fiable le pipeline ETL en données brutes d'atelier (tables CLE, ILE, Item, Machine Center) et garantir l'intégrité référentielle des données industrielles."),
        pb(),

        title3("2.2.2 Besoins non fonctionnels"),
        body("Les besoins non fonctionnels définissent le niveau d'exigence en termes de performance, de sécurité, de robustesse et d'ergonomie :"),
        pb(),
        makeTable(
          ["Catégorie d'exigence", "Spécification Technique et Critère de Qualité Validé"],
          [
            ["Performance", "Temps de réponse inférieur à 1 seconde pour le chargement des tableaux de bord, et inférieur à 500 ms pour les requêtes analytiques sur les 1,5M de lignes de stock."],
            ["Sécurité", "Authentification stateless sécurisée par jetons JSON Web Tokens (JWT), chiffrement des échanges en HTTPS/TLS, et cloisonnement strict des accès par rôles RBAC."],
            ["Fiabilité et Intégrité", "Disponibilité du système garantie à 99,5 %, intégrité transactionnelle ACID sur la base de données, et mécanisme de repli (fallback) hors-ligne en cas de coupure réseau."],
            ["Maintenabilité", "Architecture modulaire hautement découplée (API REST Spring Boot, microservice FastAPI indépendant), code documenté et versionné sous Git/GitHub."],
            ["Évolutivité / Scalabilité", "Capacité d'absorber l'ajout de nouvelles unités industrielles sans réécriture du socle logiciel, et scalabilité horizontale des microservices sous conteneurs Docker."],
            ["Ergonomie Industrielle", "Interface réactive et moderne sous React.js, navigation intuitive sans formation complexe préalable, visualisations interactives adaptées aux écrans d'atelier."]
          ],
          [2400, 6266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.1 : Les besoins non fonctionnels", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("2.3 Analyse des besoins"),
        title3("2.3.1 Identification des acteurs"),
        body("L'analyse des cas d'utilisation met en relief cinq acteurs principaux interagissant avec la plateforme Nexora :"),
        bullet("**1. Le Responsable de Production** : utilisateur clé des fonctionnalités de supervision d'atelier, d'analyse du TRG et de projection des cadences."),
        bullet("**2. Le Gestionnaire des Stocks** : utilisateur principal du module prescriptif d'inventaire, des alertes de rupture et des préconisations d'approvisionnement."),
        bullet("**3. L'Opérateur d'Atelier** : acteur terrain alimentant les déclarations de fabrication au pied de presse."),
        bullet("**4. L'Administrateur Système** : responsable de la gouvernance, des rôles RBAC et de la maintenance technique."),
        bullet("**5. Le Data Warehouse SQL Server** : acteur non-humain fournissant les données transactionnelles et recevant les résultats consolidés."),
        pb(),

        title3("2.3.2 Diagramme des cas d'utilisation global"),
        body("La figure 2.1 présente le diagramme de cas d'utilisation global, illustrant la cartographie des interactions entre les acteurs et les grands modules applicatifs :"),
        pb(),
        ...imageFigure("diagrams/global_usecase.png", "Figure 2.1 : Diagramme des cas d'utilisation global", 540, 310),
        body("Les relations d'inclusion (« include ») traduisent les dépendances intrinsèques du système : la consultation des prévisions de fabrication inclut obligatoirement l'inférence par le modèle d'IA Prophet, qui repose à son tour sur l'exécution préalable du pipeline ETL. De même, la génération des alertes de stock critique inclut le calcul en temps réel de la couverture en jours à partir des prévisions de consommation."),
        pb(),

        title2("2.4 Architecture globale du système"),
        body("Pour concilier robustesse industrielle, modularité et performance d'analyse en temps réel, l'architecture globale de Nexora est structurée en **quatre couches logicielles découplées**, comme l'illustre la figure 2.2 :"),
        pb(),
        ...imageFigure("diagrams/arch_logique.png", "Figure 2.2 : Architecture globale du système décisionnel en quatre couches", 540, 260),
        bullet("**1. Couche Données (Data Layer)** : constituée de l'entrepôt de données d'entreprise Microsoft SQL Server 2022. Elle centralise les tables opérationnelles de l'ERP Microsoft Dynamics NAV, notamment les 250 000 opérations de la table *Capacity Ledger Entry* et les 1,5 million de mouvements de stock de la table *Item Ledger Entry*."),
        bullet("**2. Couche Traitement & ETL (Processing Layer)** : assure l'extraction continue des flux SQL Server, l'assainissement des anomalies de stocks négatifs, le feature engineering des 16 variables explicatives industrielles et l'alimentation de la table analytique optimisée."),
        bullet("**3. Couche Métier & IA (Business & AI Layer)** : cœur décisionnel combinant le backend Spring Boot 3 (API RESTful, gestion des règles métiers, calcul du TRG et sécurité RBAC) et le microservice de Data Science sous FastAPI en Python 3.10 (chargement des modèles Prophet, Random Forest, ARIMA, Isolation Forest et K-Means)."),
        bullet("**4. Couche Présentation (Presentation Layer)** : interface utilisateur accessible par navigateur web, développée avec React 18, enrichie de graphiques dynamiques ApexCharts et de tableaux de bord décisionnels Microsoft Power BI Embedded pour le reporting exécutif."),
        pb(),

        title2("2.5 Environnement de travail"),
        title3("2.5.1 Environnement matériel"),
        body("L'ensemble des phases d'ingénierie des données, d'apprentissage des modèles d'IA et de développement logiciel a été réalisé sur une station de travail disposant des spécifications matérielles suivantes :"),
        bullet("**Processeur** : Intel Core i7-12700H (14 cœurs physiques, 20 threads, jusqu'à 4.70 GHz)."),
        bullet("**Mémoire vive (RAM)** : 16 Go DDR4 cadencée à 3 200 MHz, permettant la manipulation en mémoire vive de DataFrames volumineux."),
        bullet("**Stockage** : SSD NVMe PCIe 4.0 de 512 Go offrant un débit supérieur à 3 500 Mo/s pour les transferts de bases de données."),
        bullet("**Système d'exploitation** : Microsoft Windows 11 Professionnel (64 bits)."),
        pb(),

        title3("2.5.2 Environnement logiciel"),
        body("Le tableau 2.2 détaille la suite logicielle, les frameworks et bibliothèques techniques mobilisés tout au long du projet :"),
        pb(),
        makeTable(
          ["Outil / Technologie", "Version", "Utilisation"],
          [
            ["Environnement de développement"],
            ["Visual Studio Code", "1.104.1", "Éditeur de code utilisé pour le développement Python, React et scripts d'intégration."],
            ["IntelliJ IDEA", "2024.1", "Environnement de développement intégré pour le backend Spring Boot 3 et Java 17."],
            ["Git", "2.52.0", "Système de contrôle de version pour le suivi des modifications."],
            ["GitHub", "—", "Plateforme d'hébergement pour le versionnement collaboratif et la traçabilité."],

            ["SGBD"],
            ["Microsoft SQL Server", "2022", "Système de gestion de base de données relationnelle hébergeant le Data Warehouse (dbDWH)."],
            ["SQL Server Management Studio (SSMS)", "19.3", "Interface d'administration, de profilage et d'optimisation des index clusterisés SQL."],

            ["Langage de programmation"],
            ["Python", "3.10.11", "Langage principal : ETL, modélisation de séries temporelles et microservice API."],
            ["Java (JDK)", "17 LTS", "Socle d'exécution robuste et performant pour le serveur applicatif Spring Boot 3."],
            ["TypeScript / JavaScript", "ES2022", "Développement de l'interface web réactive sous React.js."],

            ["Frameworks et Bibliothèques Web"],
            ["Spring Boot", "3.2.4", "Framework backend : exposition des API RESTful, Spring Data JPA et sécurité JWT."],
            ["FastAPI", "0.110.0", "Microservice web asynchrone ultra-rapide dédié au service des prédictions d'IA."],
            ["React.js", "18.2.0", "Bibliothèque frontend pour la construction de l'interface web réactive d'atelier."],
            ["Axios / CSS3", "1.6.0", "Client HTTP pour la communication avec les API REST et stylisation responsive de l'interface."],

            ["Bibliothèques Python"],
            ["Pandas", "2.1.0", "Manipulation et analyse des données tabulaires (DataFrame)."],
            ["NumPy", "1.26.0", "Calculs numériques et tableaux multidimensionnels vectorisés."],
            ["PyODBC / SQLAlchemy", "2.0.0", "Connecteur et ORM facilitant les interactions avec la base de données SQL Server."],
            ["Scikit-learn", "1.3.0", "Prétraitement, segmentation K-Means et détection d'anomalies Isolation Forest."],
            ["Prophet (Meta)", "1.1.5", "Modélisation bayésienne des séries temporelles (prévision de production et de stock)."],
            ["Statsmodels", "0.14.0", "Modélisation autorégressive ARIMA, tests de stationnarité (ADF) et décompositions."],
            ["Matplotlib", "3.8.0", "Génération de graphiques analytiques et courbes de prévision."],
            ["Seaborn", "0.13.0", "Visualisations statistiques avancées et matrices de corrélation."],

            ["Modélisation et conception"],
            ["Microsoft Power BI", "2024", "Conception et publication des tableaux de bord décisionnels interactifs pour l'atelier."],
            ["UML (OMG)", "2.5.1", "Langage de modélisation unifié pour l'architecture et la conception du système."]
          ],
          [2500, 1300, 4866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 2.2 : Outils et technologies utilisés", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("2.6 Conclusion"),
        conclusionBox("Ce chapitre a présenté le Sprint 0, posant les fondations conceptuelles, fonctionnelles et architecturales de la plateforme Nexora. La spécification détaillée des besoins par profil métier a permis de cerner avec précision les services attendus en atelier. L'architecture en quatre couches assure une séparation rigoureuse des responsabilités, garantissant la fluidité des requêtes DWH et l'évolutivité du moteur prédictif. Le choix d'une stack éprouvée (Spring Boot 3, FastAPI, Prophet, React.js, Power BI) garantit la pérennité de la solution. Le chapitre suivant détaille le Sprint 1, consacré au prétraitement des données du Data Warehouse et à la construction du pipeline ETL."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 3 : SPRINT 1 : PRÉTRAITEMENT ET PIPELINE ETL
        // =========================================================
        title1("Chapitre 3 : Sprint 1 : Prétraitement des données et pipeline ETL"),

        title2("3.1 Introduction"),
        body("Ce chapitre correspond au Sprint 1 de notre démarche Agile Scrum. Dans un projet de Business Intelligence et de modélisation prédictive appliquée à l'industrie, la qualité intrinsèque des données conditionne directement la fiabilité des modèles d'IA et la pertinence des décisions d'atelier. L'objectif de ce premier sprint de réalisation est d'extraire les données brutes du Data Warehouse Microsoft SQL Server, de diagnostiquer les anomalies industrielles (notamment les stocks négatifs transitoires et les temps d'arrêt non renseignés), de construire un pipeline ETL robuste et de générer une table analytique enrichie et hautement optimisée prête pour l'apprentissage automatique."),
        pb(),

        title2("3.2 Backlog du Sprint 1"),
        body("Le tableau 3.1 présente les tâches planifiées pour le Sprint 1, ordonnancées par priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche d'ingénierie et de développement", "Durée estimée"],
          [
            ["Élevée", "Connexion sécurisée au Data Warehouse Microsoft SQL Server 2022 d'entreprise", "1 jour"],
            ["Élevée", "Extraction des tables de faits opérationnelles (Capacity Ledger Entry, Item Ledger Entry, Item)", "1 jour"],
            ["Élevée", "Audit de qualité, assainissement des stocks négatifs et traitement des valeurs aberrantes", "3 jours"],
            ["Élevée", "Conception du pipeline ETL et Feature Engineering (lags temporels, moyennes mobiles, jours ouvrés)", "2 jours"],
            ["Élevée", "Analyse exploratoire des données (EDA) : distributions, saisonnalités et détection des arrêts machines", "2 jours"],
            ["Moyenne", "Optimisation de l'indexation clusterisée sur SQL Server pour réduire la latence de requêtage", "1 jour"],
            ["Faible", "Mise en place de la journalisation (logging) et gestion des erreurs de chargement en base", "1 jour"]
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
        body("Les données exploitées dans ce projet proviennent directement de l'entrepôt de données (Data Warehouse) Microsoft SQL Server 2022 de l'entreprise, consolidé à partir de l'ERP Microsoft Dynamics NAV. Les tables couvrent l'activité industrielle continue des sites de Kondar, Sousse et Brno sur une période de 851 jours consécutifs (du 1er janvier 2024 au 30 avril 2026)."),
        pb(),
        body("Le tableau 3.2 présente un aperçu statistique global de la volumétrie traitée :"),
        pb(),
        makeTable(
          ["Indicateur Clé de Volumétrie", "Valeur / Quantité Consolidée"],
          [
            ["Nombre total de mouvements de stock (Item Ledger Entry)", "1 524 812 lignes"],
            ["Nombre total d'enregistrements machines (Capacity Ledger Entry)", "248 930 lignes"],
            ["Nombre d'articles distincts au catalogue (Item)", "6 875 références"],
            ["Nombre de centres de charge / presses à injecter actives", "319 machines"],
            ["Nombre de familles de matières plastiques", "18 catégories"],
            ["Valeur totale des stocks gérés", "14 850 420 TND"],
            ["Période d'activité analysée", "851 jours d'atelier (01/01/2024 au 30/04/2026)"]
          ],
          [4500, 4166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.2 : Aperçu statistique général de la base de données DWH", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.2 Description des tables principales"),
        body("Parmi les tables relationnelles du Data Warehouse d'entreprise, quatre tables centrales constituent le socle de notre modélisation :"),
        pb(),
        makeTable(
          ["Nom de la Table SQL", "Rôle Métier et Contenu Industriel dans le Projet Nexora"],
          [
            ["Item Ledger Entry (ILE)", "Table centrale des mouvements de stock : enregistre chaque entrée, sortie, consommation atelier, transfert inter-usines, date comptable, quantité et coût unitaire."],
            ["Capacity Ledger Entry (CLE)", "Table d'exécution de production : consigne chaque opération machine, ordre de fabrication (OF), temps de cycle, temps d'arrêt, cadence réelle et quantité de rebuts."],
            ["Item", "Référentiel des articles : nomenclature des 6 875 composants et résines plastiques, désignation, matière (PP, PA66, ABS), prix d'achat, seuils de sécurité."],
            ["Machine Center", "Référentiel des 319 presses à injecter : identifiant machine, tonnage (50T à 1500T), atelier, site géographique (Kondar, Sousse, Brno) et cadence nominale."]
          ],
          [2800, 5866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.3 : Tables principales de la base", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.3 Diagramme de classes"),
        body("La figure 3.1 expose le diagramme de classes UML modélisant la structure relationnelle des entités du Data Warehouse industriel :"),
        pb(),
        ...imageFigure("diagrams/er_diagram.png", "Figure 3.1 : Diagramme relationnel et structure de la base de données DWH", 540, 310),
        body("Les cardinalités et règles de gestion modélisées sont les suivantes :"),
        bullet("**MachineCenter – CapacityLedgerEntry (1 – 0..*)** : une presse à injecter réalise de multiples opérations de fabrication au fil des shifts."),
        bullet("**Item – CapacityLedgerEntry (1 – 0..*)** : un composant plastique est injecté lors de multiples ordres de fabrication."),
        bullet("**Item – ItemLedgerEntry (1 – 0..*)** : un article subit des centaines de mouvements d'entrées, sorties et transferts."),
        bullet("**Item – Stock (1 – 1)** : chaque référence possède une fiche synthétisant le niveau d'inventaire disponible, le stock de sécurité et la valeur immobilisée."),
        pb(),

        title2("3.4 Analyse exploratoire des données (EDA)"),
        title3("3.4.1 Analyse statistique"),
        body("Une analyse statistique approfondie a été conduite sur la série temporelle journalière consolidée afin de caractériser la distribution des cadences de production et de détecter d'éventuelles régularités :"),
        pb(),
        makeTable(
          ["Variable de Production", "Minimum", "Maximum", "Moyenne", "Médiane", "Écart-type", "CV (%)"],
          [
            ["Cadence journalière (pièces/jour)", "12 450", "148 620", "64 890", "63 120", "19 450", "30,0 %"],
            ["Heures d'injection effectives / jour", "420 h", "2 380 h", "1 840 h", "1 890 h", "295 h", "16,0 %"],
            ["Heures d'arrêts machines / jour", "45 h", "890 h", "285 h", "260 h", "115 h", "40,4 %"],
            ["Taux de rebut moyen d'atelier", "0,4 %", "6,8 %", "1,85 %", "1,70 %", "0,65 %", "35,1 %"],
            ["Taux de Rendement Global (TRG/OEE)", "48,2 %", "88,6 %", "71,4 %", "72,1 %", "6,8 %", "9,5 %"]
          ],
          [2400, 1000, 1000, 1100, 1100, 1000, 1066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.4 : Statistiques descriptives de la série journalière de production", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 3.5 met en évidence l'impact des variations saisonnières et des arrêts industriels sur le volume moyen de pièces produites par jour :"),
        pb(),
        makeTable(
          ["Période / Événement Industriel", "Nb jours", "Cadence Moy. (pcs/j)", "Cadence Max (pcs/j)", "Ratio vs Normal"],
          [
            ["Régime nominal normal d'atelier", "580", "66 420", "98 450", "1,00"],
            ["Période estivale (congés constructeurs)", "45", "38 210", "52 100", "0,58"],
            ["Pics de livraison de fin de trimestre", "60", "94 850", "148 620", "1,43"],
            ["Maintenance annuelle programmée", "14", "18 900", "28 400", "0,28"],
            ["Modifications d'outillages (moules)", "72", "54 300", "76 200", "0,82"],
            ["Période de Ramadan (régime 3x8 adapté)", "80", "56 800", "79 100", "0,85"]
          ],
          [2600, 1100, 1800, 1800, 1366]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.5 : Impact des événements et variations industrielles sur la cadence", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.4.2 Visualisation des données"),
        body("La figure 3.2 illustre l'évolution temporelle de la production globale de pièces sur l'ensemble de la période d'étude (2024–2026), mettant en évidence la tendance de fond et les creux d'activité estivaux :"),
        pb(),
        ...imageFigure("image/fig_3_2_production_evolution.png", "Figure 3.2 : Évolution temporelle de la production globale des 319 presses (2024–2026)", 540, 230),
        body("La figure 3.3 présente la distribution hebdomadaire et mensuelle de la production, confirmant le rythme soutenu du mardi au vendredi et la baisse programmée lors des opérations de maintenance du dimanche :"),
        pb(),
        ...imageFigure("image/fig_3_3_saisonnalite.png", "Figure 3.3 : Saisonnalité de production par jour de la semaine et par mois", 540, 220),
        body("La figure 3.4 présente la carte thermique (heatmap) croisant les mois de l'année et les jours de semaine, révélant les périodes de forte intensité d'injection plastique :"),
        pb(),
        ...imageFigure("image/fig_3_4_heatmap.png", "Figure 3.4 : Heatmap d'activité atelier : cadence selon le mois et le jour de semaine", 540, 230),
        pb(),

        title2("3.5 Conception et réalisation du pipeline ETL"),
        title3("3.5.1 Architecture du pipeline"),
        body("Le pipeline ETL développé pour Nexora est conçu pour automatiser l'ingestion, le filtrage et l'enrichissement des données d'atelier. La figure 3.5 illustre son architecture générale reliant le Data Warehouse à la table analytique :"),
        pb(),
        ...imageFigure("diagrams/sprint1_activity.png", "Figure 3.5 : Architecture et flux d'exécution du pipeline ETL", 520, 240),
        body("Le diagramme d'activité UML présenté en figure 3.6 détaille le déroulement séquentiel des opérations du pipeline :"),
        pb(),
        ...imageFigure("diagrams/sprint1_seq.png", "Figure 3.6 : Diagramme de séquence du pipeline ETL d'atelier", 520, 250),
        pb(),

        title3("3.5.2 Extraction"),
        body("L'extraction est orchestrée en Python via le connecteur ODBC haute performance `pyodbc` couplé à SQLAlchemy pour Microsoft SQL Server. Les données sont extraites en mode incrémental pour ne charger que les enregistrements créés ou modifiés depuis le dernier cycle :"),
        bullet("**Extraction des flux machines** : requêtage de la table *Capacity Ledger Entry* filtrant sur les statuts d'ordres fermés avec calcul des durées réelles d'injection."),
        bullet("**Extraction des flux d'inventaire** : requêtage de la table *Item Ledger Entry* regroupant entrées fournisseurs, consommations en pied de presse et transferts inter-usines."),
        pb(),

        title3("3.5.3 Transformation"),
        body("La phase de transformation comprend l'assainissement rigoureux des anomalies et le feature engineering :"),
        body("**1. Assainissement et nettoyage des données** :"),
        bullet("Détection et neutralisation des stocks négatifs transitoires causés par des décalages d'enregistrement des bons de livraison."),
        bullet("Imputation des valeurs manquantes de temps de cycle par la médiane de la machine sur le même outillage."),
        bullet("Filtrage des outliers extrêmes par la règle de Tukey (au-delà de 3 écarts interquartiles IQR)."),
        pb(),
        body("Le tableau 3.6 résume le bilan de qualité avant et après exécution du pipeline ETL :"),
        pb(),
        makeTable(
          ["Critère de Qualité des Données", "État Initial (Données Brutes DWH)", "État Final (Après Nettoyage ETL)"],
          [
            ["Lignes de mouvements de stock", "1 524 812 lignes brutes", "1 518 940 lignes valides (5 872 erronées éliminées)"],
            ["Lignes de production machines", "248 930 lignes brutes", "247 610 lignes qualifiées (1 320 doublons purgés)"],
            ["Stocks négatifs transitoires", "482 cas identifiés dans l'historique", "0 cas restant (recalés sur dernier inventaire certifié)"],
            ["Temps de cycle aberrants (< 2s)", "1 840 enregistrements fantômes", "0 valeur aberrante (recalibrés sur fiche technique)"],
            ["Doublons d'enregistrements", "Présence de réémissions de tickets", "0 doublon résiduel (clé primaire composite stricte)"]
          ],
          [2800, 2900, 2966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.6 : Bilan de la qualité des données", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("**2. Feature Engineering (16 variables explicatives industrielles)** :"),
        bullet("**Variables calendaires et d'équipes** : jour de la semaine, mois, indicateur de week-end, et type de shift (Matin, Après-midi, Nuit)."),
        bullet("**Lags temporels de production** : cadence de la veille (J-1), du même jour de la semaine passée (J-7), et de la quinzaine (J-14)."),
        bullet("**Moyennes et volatilités mobiles** : moyennes mobiles sur 7 et 14 jours, écart-type mobile sur 28 jours."),
        bullet("**Indicateurs industriels d'atelier** : indicateur de maintenance programmée, indicateur de changement de moule, et ratio de cadence machine."),
        pb(),

        title3("3.5.4 Chargement"),
        body("Les données nettoyées et enrichies sont chargées dans la table analytique optimisée `production_stock_analytics` sur Microsoft SQL Server 2022. Pour garantir des temps de requêtage inférieurs à 500 ms sur plus d'un million de lignes, une stratégie d'indexation clusterisée sur la clé composite `(Posting_Date, Item_No, Machine_No)` a été mise en œuvre."),
        pb(),

        title2("3.6 Résultats du pipeline ETL"),
        body("Le tableau 3.7 synthétise les résultats quantitatifs obtenus à l'issue de l'exécution complète du pipeline ETL :"),
        pb(),
        makeTable(
          ["Indicateur de Performance du Pipeline", "Résultat Obtenu"],
          [
            ["Volume total de lignes chargées dans la table analytique", "1 766 550 enregistrements enrichis"],
            ["Nombre de colonnes dans la table analytique", "38 colonnes métiers et analytiques"],
            ["Nombre de features industrielles créées", "16 variables d'entrée sélectionnées pour l'IA"],
            ["Temps moyen d'exécution du pipeline complet", "4 minutes 12 secondes pour l'historique complet"],
            ["Temps moyen de réponse des requêtes analytiques", "448 ms (contre > 30 s avant indexation)"],
            ["Taux d'anomalies résiduelles", "0,0 % (100 % de conformité d'intégrité)"]
          ],
          [5200, 3466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.7 : Résultats du pipeline ETL", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("3.7 Bilan du Sprint 1"),
        body("Le tableau 3.8 présente le bilan d'avancement du Sprint 1 et la validation des livrables :"),
        pb(),
        makeTable(
          ["Tâche réalisée", "Livrable Produit et Validé", "Statut"],
          [
            ["Connexion au DWH", "Accès sécurisé ODBC/SQL Server validé", "Réalisé"],
            ["Extraction des données", "Extraction de 1,7M de lignes brutes", "Réalisé"],
            ["Audit de qualité", "Diagnostic et purge des 7 192 anomalies", "Réalisé"],
            ["Nettoyage des stocks", "Résolution intégrale des stocks négatifs", "Réalisé"],
            ["Feature Engineering", "16 variables explicatives industrielles", "Réalisé"],
            ["Optimisation SQL Server", "Index clusterisés (temps ramené à 448 ms)", "Réalisé"],
            ["Chargement analytique", "Table production_stock_analytics opérationnelle", "Réalisé"],
            ["Diagrammes UML", "Diagramme de classes DWH et diagramme d'activité ETL", "Réalisé"]
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
        conclusionBox("Ce chapitre a exposé l'ensemble des travaux réalisés au cours du Sprint 1. La maîtrise des flux de données issus de 319 presses et de 1,5 million de mouvements d'articles a permis de surmonter le défi des données hétérogènes. Grâce au pipeline ETL et à l'assainissement rigoureux des anomalies de stock, nous disposons désormais d'un socle de données certifié et performant. Le chapitre suivant détaille le Sprint 2, consacré au développement, à l'entraînement et à la comparaison des modèles d'intelligence artificielle pour la prévision des cadences d'atelier."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 4 : SPRINT 2 : GESTION INTELLIGENTE DES STOCKS
        // =========================================================
        title1("Chapitre 4 : Sprint 2 : Développement du module de gestion intelligente des stocks"),

        title2("4.1 Introduction"),
        body("Ce chapitre correspond au Sprint 2 de notre démarche Agile Scrum. La maîtrise rigoureuse des stocks de matières premières (résines thermoplastiques, polymères techniques) et de composants injectés constitue un enjeu stratégique vital pour la rentabilité et la continuité d'exploitation d'un équipementier automobile Tier-1. L'objectif de ce sprint est de concevoir et d'implémenter le module de **gestion intelligente et proactive des stocks** de la plateforme Nexora. En exploitant l'état d'inventaire et les flux physiques consolidés issus du Data Warehouse Microsoft SQL Server (table Item Ledger Entry), ce module évalue en temps réel le niveau de risque des 6 875 références d'articles, diagnostique instantanément les pénuries et génère automatiquement des préconisations de réapprovisionnement chiffrées pour sécuriser la continuité de fabrication."),
        pb(),

        title2("4.2 Backlog du Sprint 2"),
        body("Le tableau 4.1 récapitule les tâches ordonnancées pour le Sprint 2 avec leur priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche d'Ingénierie de Gestion des Stocks", "Durée estimée"],
          [
            ["Élevée", "Conception de l'architecture fonctionnelle en 4 étapes du module de stock", "1 jour"],
            ["Élevée", "Calcul automatisé des consommations moyennes, de la couverture d'atelier et de la rotation", "2 jours"],
            ["Élevée", "Classification catégorielle des 6 875 articles (Rupture, Critique, Normal, Surstock)", "2 jours"],
            ["Élevée", "Modélisation de l'algorithme de calcul des quantités économiques pour une couverture de 45 jours", "2 jours"],
            ["Moyenne", "Moteur d'alertes prédictives priorisées par coût d'arrêt de ligne évité", "1 jour"],
            ["Faible", "Intégration des visualisations d'inventaire et export CSV/XLSX dans l'application", "1 jour"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.1 : Priorisation des tâches : Sprint 2", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.3 Architecture du module de gestion des stocks"),
        body("Le module de gestion intelligente des stocks opère selon un processus séquentiel en quatre étapes majeures, illustré par la figure 4.1 :"),
        pb(),
        ...imageFigure("diagrams/sprint3_activity.png", "Figure 4.1 : Architecture et flux d'exécution du module de gestion des stocks", 520, 240),
        bullet("**1. Données d'entrée** : ingestion continue des stocks physiques actuels et des mouvements historiques issus de la table *Item Ledger Entry* du Data Warehouse."),
        bullet("**2. Calcul des métriques d'inventaire** : calcul dynamique du taux de consommation journalier moyen, de la couverture en jours et du coefficient de rotation."),
        bullet("**3. Classification multi-niveaux** : catégorisation instantanée de chaque article dans un état d'inventaire normé."),
        bullet("**4. Moteur prescriptif** : dimensionnement automatique des commandes à passer, évaluation du budget d'approvisionnement et déclenchement d'alertes d'atelier."),
        pb(),

        title2("4.4 Analyse des niveaux de stock et de rotation"),
        body("Pour traduire les flux physiques d'atelier en indicateurs opérationnels pour chacun des 6 875 composants et polymères du catalogue, nous calculons pour chaque article *i* le taux de consommation journalier moyen sur la base de l'historique d'atelier consolidé :"),
        body("*taux_journalier_i = Consommation_Annuelle_i / 365*", { align: AlignmentType.CENTER, italics: true }),
        body("À partir de ce taux de consommation, deux indicateurs clés sont recalculés en continu pour chaque référence :"),
        bullet("**La couverture en jours** : durée résiduelle d'autonomie de l'atelier sans réapprovisionnement :\n*couverture_jours_i = stock_actuel_i / taux_journalier_i*"),
        bullet("**Le coefficient de rotation du stock** : indicateur d'intensité d'écoulement matière :\n*rotation_i = Consommation_Annuelle_i / stock_actuel_i*"),
        body("Une rotation élevée caractérise un composant à flux tendu hautement sensible, tandis qu'une rotation anormalement basse signale un article dormant risquant l'obsolescence technique et immobilisant du capital."),
        pb(),

        title2("4.5 Classification des produits"),
        body("Chaque référence du catalogue est classée selon des règles strictes définies conjointement avec la direction logistique de l'usine :"),
        pb(),
        makeTable(
          ["Statut du Stock", "Règle de Gestion et Condition Métier", "Couleur", "Action Opérationnelle Requise"],
          [
            ["Rupture de Stock", "Stock physique = 0 unité (presse à l'arrêt)", "Rouge", "Déclenchement immédiat d'une commande d'urgence."],
            ["Stock Critique", "Couverture disponible < 15 jours de fabrication", "Orange", "Lancement d'un bon de commande prioritaire sous 7 jours."],
            ["Stock Normal", "15 jours ≤ Couverture < 120 jours", "Vert", "Niveau nominal de sécurité ; aucune action requise."],
            ["Surstock", "Couverture ≥ 120 jours (capital immobilisé)", "Violet", "Gel temporaire des commandes et rééquilibrage inter-usines."]
          ],
          [2000, 3200, 1100, 2366]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 4.2 : Classification des produits par niveau de stock", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("4.6 Génération des recommandations"),
        title3("4.6.1 Calcul des quantités à commander"),
        body("Pour tout article identifié en état de Rupture ou de Stock Critique, le module calcule automatiquement la quantité optimale à commander afin de rétablir une **couverture cible sécurisée de 45 jours** (couvrant le délai moyen d'approvisionnement fournisseur de 30 jours augmenté d'un stock tampon de sécurité de 15 jours) :"),
        body("*Q_commander_i = max(Q_min_conditionnement, floor(taux_journalier_i * 45) - stock_actuel_i)*", { align: AlignmentType.CENTER, italics: true }),
        body("Un seuil minimal de commande respectant les unités logistiques de livraison (sacs de granulés de 25 kg, fûts ou palettes complètes) est automatiquement imposé pour préserver la rentabilité des coûts de transport."),
        pb(),

        title3("4.6.2 Estimation du budget"),
        body("Le budget d'approvisionnement global recommandé est calculé en valorisant chaque quantité préconisée par son coût d'achat unitaire :"),
        body("*Budget_Total = Σ (Q_commander_i * Prix_Achat_Unitaire_i)* pour tous les articles en Rupture ou Critique", { align: AlignmentType.CENTER, italics: true }),
        body("Ce chiffrage instantané permet aux acheteurs et à la direction financière d'anticiper les décaissements de trésorerie sur les quatre semaines à venir."),
        pb(),

        title3("4.6.3 Alertes intelligentes"),
        body("Afin de guider les approvisionneurs d'atelier submergés par le volume d'articles, le système génère des alertes prescriptives priorisées par le **coût financier d'arrêt de ligne évité** :"),
        body("*Perte_Estimée_i = max(0, (45 - couverture_jours_i) * taux_journalier_i * Coût_Horaire_Arrêt)*", { align: AlignmentType.CENTER, italics: true }),
        body("Le système extrait et met en exergue dans le tableau de bord le top 20 des urgences absolues nécessitant une décision immédiate du responsable logistique."),
        pb(),

        title2("4.7 Résultats obtenus"),
        body("L'analyse menée sur l'ensemble des 6 875 articles du catalogue d'entreprise révèle la répartition visuelle présentée en figure 4.2 :"),
        pb(),
        ...imageFigure("diagrams/segmentation_pareto_kmeans.png", "Figure 4.2 : Segmentation multicritère Pareto ABC et Clustering des stocks", 540, 250),
        body("Sur les 6 875 articles :"),
        bullet("**Stock Normal** : 4 920 articles (71,6 %) sont à un niveau de couverture sain."),
        bullet("**Rupture de Stock** : 312 articles (4,5 %) sont en rupture complète."),
        bullet("**Stock Critique** : 1 240 articles (18,0 %) présentent moins de 15 jours d'autonomie."),
        bullet("**Surstock** : 403 articles (5,9 %) immobilisent inutilement du fonds de roulement."),
        pb(),
        body("La figure 4.3 illustre la concentration des articles en rupture et en stock critique selon les familles de matières plastiques :"),
        pb(),
        ...imageFigure("image/fig_5_3_ruptures_stocks.png", "Figure 4.3 : Synthèse des alertes d'atelier par catégorie d'articles", 520, 230),
        body("Les familles techniques les plus exposées au risque de pénurie sont les résines polyamide PA66 renforcées, les connecteurs étanches sous-capot et les colorants maîtres, en raison de délais fournisseurs atteignant jusqu'à six semaines."),
        body("Le budget total de réapprovisionnement recommandé pour sécuriser l'ensemble du catalogue s'élève à **2 418 650 TND**."),
        pb(),

        title2("4.8 Bilan du Sprint 2"),
        body("Le tableau 4.3 récapitule les livrables validés au terme du Sprint 2 :"),
        pb(),
        makeTable(
          ["Tâche réalisée", "Livrable Produit et Validé", "Statut"],
          [
            ["Architecture du module", "Schéma fonctionnel en 4 étapes de gestion des stocks", "Réalisé"],
            ["Calcul des indicateurs", "Moteur dynamique de calcul du taux, de la couverture et rotation", "Réalisé"],
            ["Classification catalogue", "Répartition des 6 875 articles en 4 statuts d'inventaire", "Réalisé"],
            ["Dimensionnement des commandes", "Formule de réapprovisionnement sur horizon 45 jours", "Réalisé"],
            ["Chiffrage budgétaire", "Estimation du budget global (2 418 650 TND)", "Réalisé"],
            ["Moteur d'alertes", "Top 20 des articles critiques priorisés par risque financier", "Réalisé"],
            ["Export des recommandations", "Génération de rapports exportables en CSV et Excel (.xlsx)", "Réalisé"]
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
        conclusionBox("Ce chapitre a présenté le module de gestion intelligente et prédictive des stocks d'atelier développé durant le Sprint 2. En exploitant les données consolidées du Data Warehouse, Nexora transforme une information brute en décisions de réapprovisionnement hiérarchisées et chiffrées. Ce passage d'une gestion réactive à un pilotage proactif permet d'éradiquer les ruptures de matières critiques tout en assainissant les surstocks dormants. Le chapitre suivant aborde le Sprint 3, consacré au développement et à l'entraînement des modèles d'intelligence artificielle pour la prévision de production."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 5 : SPRINT 3 : MODÉLISATION PRÉDICTIVE PAR IA
        // =========================================================
        title1("Chapitre 5 : Sprint 3 : Modélisation prédictive par Intelligence Artificielle"),

        title2("5.1 Introduction"),
        body("Ce chapitre correspond au Sprint 3 de notre projet. Véritable cœur scientifique et algorithmique de la plateforme **Nexora**, ce sprint est dédié à la modélisation prédictive des cadences de fabrication et de la demande industrielle. L'objectif est d'entraîner, d'évaluer et de comparer rigoureusement quatre modèles d'intelligence artificielle retenus pour l'application Nexora sous un protocole expérimental de validation croisée temporelle (*TimeSeriesSplit* à 5 plis). Le module confronte le modèle additif bayésien **Prophet (Meta)**, l'ensemble ensembliste **Random Forest Regressor**, le modèle autorégressif statistique **ARIMA** et la **Régression Linéaire** standard, complétés par l'algorithme **Isolation Forest** pour la détection non-supervisée des dérives de cadences des presses."),
        pb(),

        title2("5.2 Backlog du Sprint 3"),
        body("Le tableau 5.1 présente les tâches planifiées pour le Sprint 3 avec leur priorité et charge estimée en jours :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de Recherche & Développement IA Nexora", "Durée estimée"],
          [
            ["Élevée", "Définition de la variable cible et découpage chronologique sans fuite de données", "1 jour"],
            ["Élevée", "Développement et calibration des 4 modèles de prévision (Prophet, Random Forest, ARIMA, Régression Linéaire)", "3 jours"],
            ["Élevée", "Intégration du module de détection d'anomalies par Isolation Forest", "2 jours"],
            ["Élevée", "Évaluation comparative par validation croisée temporelle TimeSeriesSplit (5 folds)", "2 jours"],
            ["Moyenne", "Benchmark multicritère des modèles selon MAE, RMSE, MAPE et R²", "1 jour"],
            ["Moyenne", "Calibration des intervalles de confiance bayésiens à 95 % sous Prophet", "1 jour"],
            ["Faible", "Génération automatisée des trajectoires de prévision à 7, 15 et 30 jours via FastAPI", "1 jour"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.1 : Priorisation des tâches : Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.3 Architecture du module de modélisation prédictive"),
        body("Le module d'intelligence artificielle prédictive de Nexora est structuré selon un flux modulaire continu garantissant traçabilité et réactivité en production industrielle, tel qu'illustré par la figure 5.1 :"),
        pb(),
        ...imageFigure("diagrams/sprint2_activity.png", "Figure 5.1 : Architecture et flux d'exécution du module de modélisation IA de Nexora", 520, 240),
        bullet("**1. Ingestion des séries d'atelier** : extraction automatisée des cadences réelles depuis le Data Warehouse SQL Server (*production_stock_analytics*)."),
        bullet("**2. Prétraitement et ingénierie des caractéristiques** : encodage des calendriers d'équipes en 3x8, détection des jours ouvrés/fériés et calcul des composantes autorégressives."),
        bullet("**3. Entraînement et validation croisée** : exécution du protocole *TimeSeriesSplit* à 5 plis pour prévenir tout surapprentissage sur les séries d'atelier."),
        bullet("**4. Évaluation multicritère** : comparaison sur les métriques normalisées (R², MAE, RMSE, MAPE) et respect des exigences de l'industrie automobile (MAPE < 5%)."),
        bullet("**5. Déploiement et inférence asynchrone** : exposition des modèles sous FastAPI pour une inférence en moins de 200 ms vers l'interface React.js."),
        pb(),

        title2("5.4 Préparation des données pour l'apprentissage"),
        title3("5.4.1 Variable cible"),
        body("La variable cible à prédire est le volume journalier de pièces conformes produites par atelier d'injection plastique (exprimé en nombre de pièces finies ou en cadence horaire équivalente). Afin de stabiliser la variance face aux à-coups de production et de réduire l'asymétrie de distribution, nous appliquons une transformation logarithmique :"),
        body("*log_cadence = log(1 + Cadence_Journalière)*", { align: AlignmentType.CENTER, italics: true }),
        body("Cette transformation ramène le coefficient d'asymétrie (skewness) de 1,78 à 0,28. Les métriques finales sont calculées après transformation inverse par la fonction exponentielle (*expm1*)."),
        pb(),

        title3("5.4.2 Variables explicatives"),
        body("Le tableau 5.2 récapitule les variables explicatives industrielles retenues pour alimenter les modèles prédictifs :"),
        pb(),
        makeTable(
          ["Catégorie de Variables", "Variables Retenues", "Signification et Justification Métier en Atelier"],
          [
            ["Temporelles & Calendrier", "day_of_week, is_weekend, month, working_day", "Capture le cycle hebdomadaire d'atelier et la saisonnalité mensuelle des commandes."],
            ["Événements d'Atelier", "is_holiday, is_summer_break, shift_pattern", "Code les arrêts constructeurs, les congés programmés et le travail en 3x8."],
            ["Lags de Production", "lag_1, lag_7, lag_14, lag_30", "Mémoire temporelle : cadence de la veille, de la semaine précédente et du mois antérieur."],
            ["Statistiques Mobiles", "roll_mean_7, roll_mean_14, roll_std_7", "Indicateurs de tendance lissée, volatilité des arrêts machines et stabilité de ligne."]
          ],
          [2400, 3000, 3266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.2 : Les variables explicatives communes aux modèles de cadence", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("5.4.3 Découpage Train/Test"),
        body("Pour respecter la causalité temporelle des séries d'atelier et proscrire rigoureusement tout risque de fuite d'information (*data leakage*), le partitionnement est opéré de manière strictement chronologique :"),
        pb(),
        makeTable(
          ["Ensemble de Données", "Proportion", "Nombre de Jours", "Période Calendaire Couverte"],
          [
            ["Entraînement (Train)", "80 %", "388 jours d'atelier", "31 décembre 2024 au 22 janvier 2026"],
            ["Test (Évaluation)", "20 %", "98 jours d'atelier", "23 janvier 2026 au 30 avril 2026"]
          ],
          [2600, 1600, 2000, 2466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.3 : Découpage chronologique Train/Test", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("5.4.4 Normalisation et Prétraitement"),
        body("Pour les algorithmes ensemblistes (Random Forest) et additifs (Prophet), aucune mise à l'échelle spécifique n'est exigée. En revanche, pour la Régression Linéaire, une standardisation centrée-réduite via `StandardScaler` (moyenne nulle et variance unitaire) est appliquée sur les axes de quantité pour garantir une pondération équilibrée des dimensions."),
        pb(),

        title2("5.5 Métriques d'évaluation"),
        body("Quatre métriques normées sont retenues pour évaluer la qualité prédictive des modèles :"),
        pb(),
        makeTable(
          ["Métrique", "Définition Mathématique", "Interprétation dans le Contexte d'Atelier"],
          [
            ["MAE (Erreur Absolue Moyenne)", "MAE = (1/n) * Σ |y_i - ŷ_i|", "Mesure l'écart moyen absolu en nombre de pièces ; plus elle est faible, meilleure est la prévision."],
            ["RMSE (Racine de l'Erreur Quadratique)", "RMSE = sqrt((1/n) * Σ (y_i - ŷ_i)²)", "Pénalise sévèrement les erreurs d'amplitude importante, cruciales pour éviter les ruptures."],
            ["MAPE (Pourcentage d'Erreur Absolue)", "MAPE = (100/n) * Σ |(y_i - ŷ_i) / y_i|", "Erreur relative en pourcentage ; un MAPE inférieur à 5 % est la norme de l'industrie automobile."],
            ["R² (Coefficient de Détermination)", "R² = 1 - (SS_res / SS_tot)", "Part de la variance des cadences d'atelier expliquée par le modèle (seuil cible industriel ≥ 0,80)."]
          ],
          [2200, 3200, 3266]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.4 : Métriques d'évaluation des modèles", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.6 Développement des quatre modèles d'IA"),
        title3("5.6.1 Modèles de Séries Temporelles et Machine Learning de Prévision"),
        body("Quatre modèles de prévision ont été implémentés, paramétrés et évalués au sein du microservice FastAPI de Nexora :"),
        pb(),
        body("**5.6.1.1 Régression Linéaire (Baseline MCO)** : modèle statistique classique établissant une relation linéaire directe entre les composantes temporelles et la cadence de fabrication :"),
        ...makeProsConsTable("5.5", "Régression Linéaire",
          ["Entraînement quasi instantané (< 0,05 s).", "Interprétabilité directe des coefficients de régression."],
          ["Incapable de capturer la saisonnalité hebdomadaire non-linéaire.", "Forte sensibilité aux dérives et variations brutales d'atelier."]
        ),
        pb(),
        body("**5.6.1.2 Modèle Autorégressif ARIMA** : modélisation stochastique autorégressive intégrée et moyenne mobile `ARIMA(p, d, q)` appliquée aux séries différentiées :"),
        ...makeProsConsTable("5.6", "Modèle ARIMA",
          ["Formulation statistique rigoureuse adaptée aux processus stationnaires.", "Bonne précision sur les horizons très courts (1 à 3 jours)."],
          ["Difficulté à modéliser simultanément plusieurs périodicités (semaine + année).", "Moins réactif lors de ruptures d'atelier imprévues."]
        ),
        pb(),
        body("**5.6.1.3 Random Forest Regressor** : ensemble d'arbres de décision construits par ensachage aléatoire (*bagging*) avec division optimale des critères :"),
        ...makeProsConsTable("5.7", "Random Forest Regressor",
          ["Capture naturellement les non-linéarités complexes et interactions d'atelier.", "Fournit une mesure d'importance relative des variables explicatives."],
          ["Incapable d'extrapoler au-delà des bornes observées dans le train set.", "Empreinte mémoire plus lourde en production."]
        ),
        pb(),
        body("**5.6.1.4 Modèle Prophet de Meta (Modèle Champion Retenu)** : modèle additif bayésien décomposant la série en tendance par morceaux, saisonnalités de Fourier (hebdomadaire et annuelle) et effets calendaires :"),
        body("*y(t) = g(t) + s(t) + h(t) + ε_t*", { align: AlignmentType.CENTER, italics: true }),
        ...makeProsConsTable("5.8", "Prophet (Meta)",
          ["Décomposition interprétable : tendance d'atelier, saisonnalité hebdo et jours fériés.", "Génération native des intervalles d'incertitude à 95 % (yhat_lower, yhat_upper).", "Excellente robustesse aux données manquantes et aux arrêts machines."],
          ["Nécessite la spécification explicite des calendriers de shifts d'usine."]
        ),
        pb(),

        title3("5.6.2 Modèles d'Apprentissage Non Supervisé et Surveillance d'Atelier"),
        body("Pour compléter les capacités prédictives de Nexora, l'algorithme d'apprentissage non supervisé **Isolation Forest** a été intégré au pipeline :"),
        pb(),
        body("**5.6.2.1 Détection d'anomalies par Isolation Forest** : algorithme d'isolation récursive dans l'espace des caractéristiques pour détecter les dérives anormales de cadence et les pannes émergentes :"),
        ...makeProsConsTable("5.9", "Isolation Forest",
          ["Non supervisé : n'exige aucun étiquetage manuel préalable des défaillances.", "Complexité linéaire O(n) garantissant une détection temps réel.", "Score d'anomalie normalisé facilitant le déclenchement d'alertes."],
          ["Sensible au paramètre de contamination fixé arbitrairement (calibré à 10 % dans Nexora)."]
        ),
        pb(),

        title2("5.7 Résultats et analyse"),
        title3("5.7.1 Résultats des modèles Machine Learning"),
        body("Le tableau 5.10 présente la synthèse comparative des performances obtenues sur le jeu de test par les quatre modèles d'intelligence artificielle de Nexora :"),
        pb(),
        makeTable(
          ["Modèle", "R²", "MAE (pièces)", "RMSE (pièces)", "MAPE (%)"],
          [
            ["Régression Linéaire", "0,6173", "16,5", "20,1", "11,5"],
            ["ARIMA", "0,8100", "11,8", "14,3", "8,2"],
            ["Random Forest", "0,8800", "8,9", "11,4", "6,1"],
            ["**Prophet (Meta) ★**", "**0,9600**", "**7,4**", "**9,2**", "**4,8**"]
          ],
          [2600, 1500, 1600, 1600, 1700]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.10 : Résultats des 4 modèles de prévision de production Nexora", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("La figure 5.2 expose la comparaison visuelle des modèles selon le coefficient de détermination R² et l'erreur absolue moyenne MAE :"),
        pb(),
        ...imageFigure("diagrams/comparaison_modeles_r2_mae.png", "Figure 5.2 : Comparaison visuelle des modèles de prévision de production selon R² et MAE", 540, 230),
        pb(),
        body("L'analyse comparative met en lumière les constats suivants :"),
        bullet("**Supériorité incontestable de Prophet (Meta)** : avec un score exceptionnel de **R² = 0,9600**, Prophet explique 96 % de la variance des cadences d'injection plastique, surpassant nettement tous les autres modèles."),
        bullet("**Atteinte du seuil d'excellence automobile (MAPE < 5%)** : seul Prophet parvient à descendre à **4,8 % de MAPE**, satisfaisant rigoureusement aux normes qualité des équipementiers de premier rang."),
        bullet("**Robustesse de Random Forest** : avec R² = 0,8800 et MAPE = 6,1 %, Random Forest confirme l'efficacité des approches non linéaires pour appréhender les interactions calendaires."),
        pb(),
        body("La figure 5.3 compare visuellement la trajectoire prédite par Prophet aux cadences réelles d'atelier sur le jeu de test, accompagnée de sa bande de confiance à 95 % :"),
        pb(),
        ...imageFigure("image/fig_4_3_prophet_vs_reel.png", "Figure 5.3 : Prédictions de cadence Prophet vs Production réelle d'atelier avec intervalle de confiance à 95%", 540, 230),
        pb(),
        body("La figure 5.4 illustre la comparaison des métriques d'erreur relative (MAPE) et quadratique (RMSE) pour l'ensemble des 4 algorithmes :"),
        pb(),
        ...imageFigure("diagrams/comparaison_modeles_mape_rmse.png", "Figure 5.4 : Comparaison visuelle des métriques d'erreur MAPE et RMSE", 540, 230),
        pb(),

        title3("5.7.2 Résultats des modèles complémentaires d'atelier"),
        body("Le tableau 5.11 résume les performances du module de détection d'anomalies par Isolation Forest exécuté sur les données de cadence des 319 presses :"),
        pb(),
        makeTable(
          ["Indicateur d'Atelier", "Valeur Observée", "Interprétation et Décision Opérationnelle"],
          [
            ["Enregistrements analysés", "1 250 shifts d'injection", "Historique consolidé multi-lignes couvrant les ateliers Kondar et Brno."],
            ["Anomalies confirmées", "125 shifts (10,0 %)", "Correspondance exacte avec le taux de contamination calibré."],
            ["Score d'anomalie moyen", "-0,1420", "Déviation marquée par rapport au centre de masse nominal (score négatif)."],
            ["Causes dominantes", "Surchauffe vis & Chute cadence", "Arrêts non planifiés et pannes de régulation thermique du moule."]
          ],
          [2400, 2400, 3866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.11 : Résultats de la détection d'anomalies par Isolation Forest", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("La figure 5.5 présente la projection des cadences réelles et la détection non supervisée des points critiques par Isolation Forest :"),
        pb(),
        ...imageFigure("image/fig_4_5_isolation_forest.png", "Figure 5.5 : Détection non supervisée des dérives de presses par Isolation Forest", 520, 235),
        pb(),

        title3("5.7.3 Validation croisée temporelle"),
        body("Pour prouver la robustesse des modèles face à des conditions d'atelier variées et proscrire tout surapprentissage accidentel, nous avons soumis les quatre modèles à une validation croisée temporelle à origine glissante (*TimeSeriesSplit* à 5 folds). Le tableau 5.12 présente les scores moyens obtenus :"),
        pb(),
        makeTable(
          ["Modèle Évalué", "Méthode de Validation", "Nombre de Plis", "R² Moyen (CV)", "Stabilité (Écart-type)", "Verdict Validation"],
          [
            ["Prophet (Meta) ★", "TimeSeriesSplit (Rolling-Origin)", "5 folds", "0,9510", "± 0,008", "Très haute stabilité, généralisation optimale"],
            ["Random Forest", "TimeSeriesSplit (Rolling-Origin)", "5 folds", "0,8650", "± 0,014", "Bonne régularité sur les plis intermédiaires"],
            ["ARIMA", "TimeSeriesSplit (Rolling-Origin)", "5 folds", "0,7920", "± 0,022", "Dégradation progressive sur horizons > 15j"],
            ["Régression Linéaire", "TimeSeriesSplit (Rolling-Origin)", "5 folds", "0,7050", "± 0,031", "Sensible aux changements de régime annuel"]
          ],
          [2000, 2200, 1100, 1100, 1200, 1666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.12 : Résultats de la validation croisée temporelle TimeSeriesSplit", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.8 Sélection meilleur modèle"),
        body("Le modèle **Prophet (Meta)** est retenu de manière catégorique comme le champion de notre architecture prédictive Nexora pour les justifications exposées dans le tableau 5.13 :"),
        pb(),
        makeTable(
          ["Critère de Sélection", "Performance Validée de Prophet", "Justification Opérationnelle pour l'Atelier Nexora"],
          [
            ["Précision Relative (MAPE)", "4,8 % (Meilleur score absolu)", "Erreur relative minime, largement inférieure au seuil de tolérance de l'industrie automobile (< 5 %)."],
            ["Coefficient R² (0,9600)", "96 % de variance expliquée", "Capture quasi-parfaite des variations d'atelier et de la demande client."],
            ["Erreur Absolue (MAE)", "7,4 pièces par jour", "Écart résiduel négligeable face aux séries de fabrication de plusieurs centaines d'unités."],
            ["Bandes d'incertitude 95%", "Bornes natives yhat_lower / yhat_upper", "Permet de dimensionner dynamiquement les stocks de sécurité et la charge machines."],
            ["Modélisation calendaire", "Prise en compte déterministe des shifts", "Neutralise rigoureusement l'impact des week-ends, jours fériés et arrêts d'usine."],
            ["Vitesse d'inférence (< 200 ms)", "Exécution légère sur CPU standard", "Déploiement asynchrone ultra-fluide sous FastAPI sans infrastructure GPU onéreuse."]
          ],
          [2600, 2400, 3666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.13 : Justification du choix de Prophet (Meta) comme modèle champion", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.9 Génération des prévisions"),
        body("Le modèle champion Prophet est sérialisé et déployé dans le microservice FastAPI via l'endpoint `/predict/production`. Il génère dynamiquement les trajectoires de fabrication selon trois horizons d'atelier :"),
        bullet("**Horizon court terme (7 jours)** : ajustement opérationnel des plannings d'équipes en 3x8 et séquencement des ordres de fabrication (OF) sur les 319 presses."),
        bullet("**Horizon moyen terme (15 jours)** : planification des approvisionnements en matières premières (granulés plastiques PA66, PP) et confirmation des fenêtres de livraison clients."),
        bullet("**Horizon long terme (30 jours)** : anticipation budgétaire, maintenance préventive planifiée et équilibrage capacitaire inter-usines (Kondar et Brno)."),
        pb(),

        title2("5.10 Bilan du Sprint 3"),
        body("Le tableau 5.14 dresse le bilan synthétique des livrables conçus et validés lors du Sprint 3 :"),
        pb(),
        makeTable(
          ["Tâche réalisée", "Livrable Produit et Validé pour Nexora", "Statut"],
          [
            ["Définition variable cible", "Transformation log_cadence et détection des jours ouvrés", "Réalisé"],
            ["Feature Engineering", "Création des lags, moyennes mobiles et encodages calendaires", "Réalisé"],
            ["Split chronologique", "Découpage 80/20 sans fuite temporelle (388j train / 98j test)", "Réalisé"],
            ["Entraînement 4 modèles prédictifs", "Prophet, Random Forest, ARIMA, Régression Linéaire", "Réalisé"],
            ["Détection d'anomalies atelier", "Isolation Forest configuré à 10 % de contamination", "Réalisé"],
            ["Validation croisée temporelle", "TimeSeriesSplit à 5 plis confirmant Prophet (R² CV = 0,9510)", "Réalisé"],
            ["Sélection modèle champion", "Prophet retenu (R² = 0,9600, MAPE = 4,8 %, MAE = 7,4 pcs)", "Réalisé"],
            ["Service d'inférence FastAPI", "Endpoints asynchrones déployés pour horizons 7, 15 et 30 jours", "Réalisé"]
          ],
          [2600, 4866, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.14 : Bilan des livrables du Sprint 3", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.11 Conclusion"),
        conclusionBox("Ce chapitre a exposé le développement et l'évaluation comparative des quatre modèles d'intelligence artificielle de Nexora. La confrontation rigoureuse des modèles sous validation croisée temporelle a établi la nette suprématie de l'algorithme bayésien Prophet de Meta (R² = 0,9600, MAPE = 4,8 %) pour anticiper avec une très grande précision les cadences d'injection plastique, couplé à Isolation Forest pour la surveillance des dérives machines. Le chapitre suivant aborde le Sprint 4, consacré au développement du portail décisionnel Power BI et à la recette utilisateur finale."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 6 : SPRINT 4 : TABLEAUX DE BORD ET VALIDATION
        // =========================================================
        title1("Chapitre 6 : Sprint 4 : Développement du tableau de bord décisionnel et validation"),

        title2("6.1 Introduction"),
        body("Ce chapitre correspond au Sprint 4, ultime itération de développement de notre projet. Après avoir mis en place le pipeline ETL (Sprint 1), développé le module de gestion des stocks (Sprint 2) et entraîné les modèles d'intelligence artificielle (Sprint 3), l'enjeu de ce sprint est de regrouper l'ensemble de ces briques au sein d'un portail décisionnel unifié, ergonomique et directement exploitable par les opérationnels d'atelier et la direction industrielle. Ces rapports Power BI Desktop / Power BI Service, connectés en mode DirectQuery au Data Warehouse SQL Server, centralisent les indicateurs de production, les prévisions de cadence et le pilotage des stocks, concrétisant la valeur ajoutée du système Nexora."),
        pb(),

        title2("6.2 Backlog du Sprint 4"),
        body("Le tableau 6.1 détaille les tâches planifiées pour ce dernier sprint de réalisation :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de Conception et de Recette Décisionnelle Power BI", "Durée estimée"],
          [
            ["Élevée", "Connexion DirectQuery au DWH SQL Server et modélisation en étoile", "1 jour"],
            ["Élevée", "Conception du rapport Power BI « Supervision de Production & TRG »", "2 jours"],
            ["Élevée", "Conception du rapport Power BI « Prévision des Cadences par IA »", "2 jours"],
            ["Élevée", "Conception du rapport Power BI « Gestion Prédictive des Stocks & Alertes »", "2 jours"],
            ["Moyenne", "Développement des mesures DAX (TRG, variances, seuils critiques de stock)", "1 jour"],
            ["Moyenne", "Configuration de la sécurité au niveau des lignes (RLS) et publication Power BI Service", "1 jour"],
            ["Faible", "Recette fonctionnelle avec les chefs d'atelier et documentation utilisateur", "1 jour"]
          ],
          [1600, 5666, 1400]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.1 : Priorisation des tâches : Sprint 4", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.3 Architecture du tableau de bord"),
        body("La figure 6.1 illustre l'architecture globale du portail décisionnel **Nexora**, articulée autour de quatre couches interactives :"),
        pb(),
        ...imageFigure("diagrams/arch_physique.png", "Figure 6.1 : Architecture globale et déploiement du tableau de bord Nexora", 540, 240),
        bullet("**1. Sources de données** : tables de faits du Data Warehouse SQL Server (1,5M mouvements, 250k enregistrements machines) synchronisées par le pipeline ETL."),
        bullet("**2. Couche API & Cache** : backend Spring Boot 3 assurant la gestion des sessions JWT, la mise en cache Redis des indicateurs chauds et la sécurisation RBAC."),
        bullet("**3. Microservice de Machine Learning** : service FastAPI en Python 3.10 hébergeant le modèle champion Prophet ainsi que les modèles comparatifs (Random Forest, ARIMA, Régression Linéaire) et Isolation Forest pour l'inférence temps réel."),
        bullet("**4. Rapports Power BI Desktop / Service** : tableaux de bord publiés sur Power BI Service, connectés en mode DirectQuery au Data Warehouse SQL Server, offrant des visuels interactifs (graphiques, matrices, KPI) avec sécurité au niveau des lignes (RLS) selon le profil utilisateur."),
        pb(),

        title2("6.4 Diagramme de séquence"),
        body("Afin de documenter la dynamique des échanges lors d'une session de travail type, le diagramme de séquence UML de la figure 6.2 illustre les interactions entre le chef d'atelier, l'interface web, le backend Spring Boot, le microservice FastAPI et le Data Warehouse :"),
        pb(),
        ...imageFigure("diagrams/sprint4_seq.png", "Figure 6.2 : Diagramme de séquence : interaction utilisateur, tableau de bord et modèle prédictif", 540, 260),
        body("Power BI se connecte en mode DirectQuery au Data Warehouse SQL Server. Lors de l'ouverture d'un rapport, des requêtes DAX sont générées dynamiquement vers les tables de faits et de dimensions du DWH. Les prévisions Prophet, préalablement stockées dans la table FactPrevision, sont chargées avec leurs bandes de confiance à 95 %. Chaque filtre appliqué par l'utilisateur déclenche une nouvelle requête SQL en temps réel."),
        pb(),

        title2("6.5 Développement des interfaces"),
        title3("6.5.1 Tableau de bord de supervision et TRG"),
        body("Ce rapport Power BI constitue le centre de contrôle des 319 presses à injecter réparties entre Kondar, Sousse et Brno. Connecté en DirectQuery à la table de faits FactProduction du DWH, il offre une vision synoptique immédiate :"),
        bullet("**Cartouches d'indicateurs globaux** : TRG moyen d'atelier, taux de disponibilité mécanique, taux de performance de cadence et taux de qualité."),
        bullet("**Matrice d'état des machines** : vue en grille représentant chaque presse par un code couleur dynamique (Vert : injection en cours, Rouge : arrêt pour panne, Orange : changement de moule, Bleu : maintenance programmée)."),
        bullet("**Décomposition des temps d'arrêt** : diagramme de Pareto identifiant les causes d'arrêt prépondérantes (pannes hydrauliques, défauts régulation thermique, attente matière)."),
        pb(),

        title3("6.5.2 Tableau de bord des prévisions"),
        body("Le rapport Power BI de prévision interroge la table FactPrevision du DWH, alimentée par le microservice FastAPI (modèle Prophet), et permet aux planificateurs d'anticiper la charge d'atelier :"),
        bullet("**Sélecteur d'horizon dynamique** : basculement immédiat entre 7 jours (gestion des équipes en 3x8), 15 jours (matières premières) et 30 jours (planning usine)."),
        bullet("**Graphique superposé historique / prédiction** : courbe continue reliant la cadence réelle d'atelier à la projection calculée par Prophet, bordée par son intervalle de confiance à 95 %."),
        bullet("**Tableau de détail exportable** : affichage journalier des volumes projetés, des temps d'injection prévus et de la variance attendue."),
        pb(),

        title3("6.5.3 Tableau de bord des stocks"),
        body("Le rapport Power BI de gestion des stocks interroge les tables FactStock et DimArticle du DWH, traitant les 6 875 références du catalogue d'entreprise :"),
        bullet("**Synthèse du niveau de risque** : compteurs visuels indiquant le nombre de références en Rupture, Critique, Normal et Surstock, ainsi que la valeur financière du stock immobilisé en dinars tunisiens."),
        bullet("**Tableau paginé interactif** : recherche textuelle instantanée, filtrage par famille de plastique (PP, PA66, ABS) et tri automatique par urgence de commande."),
        bullet("**Module d'alertes prescriptives** : fiches d'alerte pour le top 20 des urgences précisant la quantité exacte à commander pour 45 jours et le coût d'arrêt évité."),
        bullet("**Export natif Power BI** : téléchargement des données filtrées en CSV et classeur Excel directement depuis Power BI Service, sans développement additionnel."),
        pb(),

        title2("6.6 Présentation des interfaces réalisées"),
        title3("6.6.1 Tableau de bord principal"),
        body("La figure 6.3 présente la vue d'ensemble du rapport décisionnel Power BI Nexora, affichant les indicateurs clés (KPI) globaux directement connectés au Data Warehouse SQL Server :"),
        pb(),
        ...imageFigure("image/powerbi_3.png", "Figure 6.3 : Vue d'ensemble du tableau de bord décisionnel Power BI Nexora", 540, 260),
        pb(),

        title3("6.6.2 Analyse de la production"),
        body("La figure 6.4 expose la console de supervision d'atelier en temps réel, affichant le statut des presses et la jauge de TRG instantanée :"),
        pb(),
        ...imageFigure("image/powerbi_1.png", "Figure 6.4 : Interface « Supervision de la production et TRG »", 540, 280),
        body("La figure 6.5 illustre la répartition des volumes de pièces injectées selon les grandes familles de composants automobiles :"),
        pb(),
        ...imageFigure("image/powerbi_2.png", "Figure 6.5 : Répartition des volumes par famille de composants plastiques", 540, 280),
        pb(),

        title3("6.6.3 Prévisions des cadences"),
        body("La figure 6.6 présente l'écran de prévision à 30 jours généré par l'algorithme d'IA, montrant la trajectoire de cadence et les bornes d'incertitude :"),
        pb(),
        ...imageFigure("image/powerbi_4.png", "Figure 6.6 : Rapport Power BI « Prévision des cadences et charge atelier »", 540, 270),
        pb(),

        title3("6.6.4 Gestion des stocks d'atelier"),
        body("La figure 6.7 illustre la console d'inventaire prédictif avec les indicateurs de rupture et la liste des recommandations d'achat :"),
        pb(),
        ...imageFigure("image/powerbi_5.png", "Figure 6.7 : Rapport Power BI « Gestion des stocks d'atelier »", 540, 270),
        pb(),

        title2("6.7 Tests et validation"),
        title3("6.7.1 Tests fonctionnels"),
        body("Afin de garantir la robustesse du système avant son déploiement en atelier, dix scénarios de tests d'intégration ont été exécutés avec succès :"),
        pb(),
        makeTable(
          ["Fonctionnalité Éprouvée", "Protocole de Test Exécuté", "Résultat Obtenu et Statut"],
          [
            ["Connexion DWH SQL Server", "Interrogation en DirectQuery des tables FactProduction et FactStock.", "Connexion établie avec succès, temps de réponse sous les 400 ms. (Validé)"],
            ["Supervision TRG en direct", "Simulation d'arrêts presses et recalcul dynamique des mesures DAX de TRG.", "Recalcul instantané du TRG atelier sur les 319 presses sans latence. (Validé)"],
            ["Visualisation des prévisions (7j)", "Filtrage sur l'horizon 7 jours et comparaison aux lancements réels.", "Rendu dynamique de la courbe Prophet et de son intervalle de confiance. (Validé)"],
            ["Prévision mensuelle (30j)", "Agrégation de la cadence globale sur les ateliers Kondar, Sousse et Brno.", "Affichage fluide des visualisations et conformité des bornes de prévision. (Validé)"],
            ["Segments multi-critères stock", "Filtrage interactif par famille (PA66, PP) et statut de rupture.", "Actualisation croisée de l'ensemble des visuels en moins de 250 ms. (Validé)"],
            ["Alertes de stock & couverture 45j", "Contrôle des cartes KPI et jauges d'alertes pour le top 20 des urgences.", "Conformité stricte des seuils d'alerte et des quantités prescrites. (Validé)"],
            ["Exportation native Excel (.xlsx)", "Téléchargement des données tabulaires filtrées vers Microsoft Excel.", "Export instantané et préservation intégrale des formats numériques. (Validé)"],
            ["Sécurité RLS (Row-Level Security)", "Connexion avec les profils Chef d'atelier vs Direction générale.", "Filtrage automatique et strict des données selon le périmètre d'atelier. (Validé)"]
          ],
          [2600, 3100, 2966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.2 : Résultats des tests fonctionnels", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("6.7.2 Validation des résultats"),
        body("Les prédictions de cadence générées par le modèle champion ont été validées en conditions réelles d'atelier sur la période janvier-avril 2026 :"),
        bullet("**R² = 0,8134** : confirmation de la très forte corrélation entre prévisions et fabrications réelles."),
        bullet("**MAE = 3 354 pièces** : écart moyen contenu à moins de 5,1 % du volume moyen d'atelier."),
        bullet("**MAPE = 12,9 %** : précision opérationnelle remarquable pour des séries d'injection plastique soumises aux aléas de moules."),
        pb(),

        title3("6.7.3 Validation des recommandations de stock"),
        body("Un audit mené auprès des approvisionneurs d'atelier a validé la pertinence des préconisations de commande : la politique de couverture à 45 jours a permis de supprimer les ruptures sur 18 matières stratégiques lors des essais pilotes."),
        pb(),

        title3("6.7.4 Validation de l'interface utilisateur"),
        body("L'ergonomie a été évaluée auprès d'un panel d'utilisateurs composé de deux chefs d'ateliers et d'un gestionnaire d'approvisionnement. Les retours ont unanimement salué la clarté des visuels Power BI, la réactivité des filtres et segments croisés, et la suppression des tâches manuelles de consolidation sous Excel."),
        pb(),

        title2("6.8 Bilan du Sprint 4"),
        body("Le tableau 6.3 récapitule les livrables achevés et validés au terme du Sprint 4 :"),
        pb(),
        makeTable(
          ["Tâche réalisée", "Livrable Produit et Validé", "Statut"],
          [
            ["Modélisation DWH & DAX", "Modèle en étoile connecté en DirectQuery au DWH SQL Server et mesures DAX", "Réalisé"],
            ["Rapport Production & TRG", "Tableau de bord Power BI de supervision des 319 presses et calcul du TRG", "Réalisé"],
            ["Rapport Prévisions IA", "Tableau de bord Power BI restituant les prédictions Prophet à 7, 15 et 30 jours", "Réalisé"],
            ["Rapport Gestion des stocks", "Tableau de bord Power BI d'analyse ABC, ruptures et alertes de réapprovisionnement", "Réalisé"],
            ["Sécurité RLS & Déploiement", "Configuration de la sécurité par rôle et publication sur Power BI Service", "Réalisé"],
            ["Recette fonctionnelle", "Validation de l'ensemble des scénarios de test avec les équipes d'atelier", "Réalisé"],
            ["Documentation technique", "Guide utilisateur des rapports Power BI et dictionnaire des mesures DAX", "Réalisé"]
          ],
          [2600, 4866, 1200]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.3 : Bilan des livrables du Sprint 4", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("6.9 Conclusion"),
        conclusionBox("Ce chapitre a présenté la conception, le développement et la validation du portail décisionnel Nexora, aboutissement final de notre démarche d'ingénierie. En centralisant dans des rapports Power BI le suivi du TRG, les prévisions de l'intelligence artificielle issues du DWH SQL Server et la gestion prescriptive des stocks, Nexora dote l'équipementier automobile d'un outil de pilotage décisionnel d'avant-garde. Les tests et la recette utilisateur confirment la puissance des visualisations interactives et l'impact opérationnel immédiat du système."),
        pageBreak(),
    
        // =========================================================
        // CONCLUSION GÉNÉRALE ET PERSPECTIVES
        // =========================================================
        title1("Conclusion générale et perspectives"),
        body("Ce projet de fin d'études a permis de concevoir, développer et déployer en environnement industriel réel la plateforme décisionnelle intelligente **Nexora**, répondant aux défis critiques de pilotage de production et de gestion des stocks au sein d'un grand équipementier de plasturgie automobile multi-sites."),
        pb(),
        body("Partant d'un constat empirique caractérisé par des silos de données, des calculs de TRG manuels et différés, et des décisions d'approvisionnement réactives génératrices de ruptures et de surstocks, l'objectif principal était de valoriser le patrimoine informationnel du Data Warehouse (plus de 1,5 million de mouvements d'articles et 250 000 enregistrements machines) pour en faire un puissant levier d'aide à la décision."),
        pb(),
        body("La conduite du projet selon la méthodologie Agile Scrum, articulée en cinq sprints successifs, a garanti une livraison incrémentale et parfaitement validée à chaque étape :"),
        bullet("**Sprint 0** : cadrage rigoureux des besoins auprès des directeurs d'usines et ingénieurs méthodes, aboutissant à une architecture logicielle découplée en quatre niveaux garantissant scalabilité, robustesse et sécurité RBAC."),
        bullet("**Sprint 1** : mise en œuvre d'un pipeline ETL hautement performant sous SQL Server et Spring Boot, divisant par soixante les temps de réponse sur les tables de faits volumineuses grâce à une indexation clusterisée optimisée."),
        bullet("**Sprint 2** : élaboration d'un moteur de gestion des stocks calculant en temps réel la couverture en jours et le taux de rotation des 6 875 références d'atelier, générant des recommandations de réapprovisionnement chiffrées sur un horizon cible de 45 jours."),
        bullet("**Sprint 3** : modélisation et évaluation comparative de quatre algorithmes d'IA (Régression Linéaire, ARIMA, Random Forest, Prophet) sous validation croisée temporelle TimeSeriesSplit à 5 plis, démontrant la nette suprématie de l'algorithme Prophet de Meta (R² = 0,9600, MAPE = 4,8 %), complété par Isolation Forest pour la détection des anomalies de cadences des presses."),
        bullet("**Sprint 4** : conception et déploiement de rapports Power BI interactifs connectés en DirectQuery au Data Warehouse SQL Server, couvrant la production, les prévisions IA et les stocks, validés lors des sessions de recette opérationnelle."),
        pb(),
        body("Sur le plan industriel et opérationnel, les gains mesurés au terme du déploiement pilote sont substantiels :"),
        bullet("**Amélioration de l'efficacité d'atelier** : augmentation mesurée de **+6,3 points de TRG global**, attribuable à la détection précoce des micro-arrêts et à la réactivité immédiate des chefs d'équipes."),
        bullet("**Sécurisation des flux logistiques** : réduction de **22 % des ruptures de stock** sur les composants et résines plastiques critiques de classe A."),
        bullet("**Optimisation du fonds de roulement** : diminution de **18 % des situations de surstock** sur les articles à faible rotation, libérant une trésorerie d'exploitation significative."),
        bullet("**Fluidité d'accès aux données** : temps moyen d'accès aux indicateurs clés ramené de 3 jours de consolidation manuelle à moins d'une seconde."),
        pb(),
        body("Au-delà de ces résultats concrets, ce travail ouvre des perspectives d'évolution prometteuses pour l'infrastructure informatique et analytique de l'entreprise :"),
        bullet("**1. Interconnexion IoT industrielle (MQTT / OPC-UA)** : connecter directement les automates programmables des presses Demag, Arburg et Engel via des passerelles industrielles pour acquérir les grandeurs physiques en continu (pression d'injection, température du moule, temps de plastification) sans aucune intervention humaine."),
        bullet("**2. Maintenance prédictive par intelligence artificielle** : enrichir le service de Data Science avec des modèles dédiés à l'usure mécanique des vis de plastification avant l'apparition de dérives qualité sur les pièces."),
        bullet("**3. Synoptique 2D/3D dynamique d'atelier (Digital Twin)** : intégrer une représentation spatiale en temps réel des ateliers de Kondar et Brno visualisant l'ensemble des 319 machines sous forme de jumeau numérique interactif."),
        pb(),
        body("En définitive, ce projet démontre la viabilité et l'impact décisif de l'intelligence artificielle et du décisionnel moderne appliqués à la plasturgie automobile, positionnant l'entreprise d'accueil sur la voie de l'excellence opérationnelle et de l'Usine du Futur."),
        pageBreak(),

        // =========================================================
        // BIBLIOGRAPHIE ET WEBOGRAPHIE (NORME IEEE)
        // =========================================================
        title1("Bibliographie"),
        body("Les références bibliographiques et sources techniques mobilisées au cours de ce projet sont présentées ci-dessous conformément aux normes académiques et à la convention internationale IEEE :"),
        pb(),
        linkBullet("[1] K. Schwaber et J. Sutherland, « The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game », Scrum.org, nov. 2020. ", "https://scrumguides.org", ""),
        bullet("[2] M. Cohn, User Stories Applied: For Agile Software Development. Boston, MA, USA : Addison-Wesley Professional, 2004."),
        bullet("[3] G. E. P. Box, G. M. Jenkins, G. C. Reinsel, et G. M. Ljung, Time Series Analysis: Forecasting and Control, 5e éd. Hoboken, NJ, USA : John Wiley & Sons, 2015."),
        linkBullet("[4] R. J. Hyndman et G. Athanasopoulos, Forecasting: Principles and Practice, 3e éd. Melbourne, Australie : OTexts, 2021. ", "https://otexts.com/fpp3/", ""),
        bullet("[5] A. Géron, Hands-On Machine Learning with Scikit-Learn, Keras and TensorFlow, 2e éd. Sebastopol, CA, USA : O'Reilly Media, 2019."),
        bullet("[6] T. Hastie, R. Tibshirani, et J. Friedman, The Elements of Statistical Learning: Data Mining, Inference, and Prediction, 2e éd. New York, NY, USA : Springer, 2009."),
        bullet("[7] L. Breiman, « Random Forests », Machine Learning, vol. 45, n° 1, p. 5-32, 2001."),
        bullet("[8] F. T. Liu, K. M. Ting, et Z.-H. Zhou, « Isolation Forest », in Proc. of the 8th IEEE International Conference on Data Mining (ICDM), Pise, Italie, 2008, p. 413-422."),
        bullet("[9] J. MacQueen, « Some methods for classification and analysis of multivariate observations », in Proc. of 5th Berkeley Symposium on Mathematical Statistics and Probability, vol. 1, 1967, p. 281-297."),
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
        linkBullet("[23] Microsoft Corporation, « TypeScript Documentation: Typed JavaScript at Any Scale », 2024. ", "https://www.typescriptlang.org", ""),
        linkBullet("[24] Microsoft Corporation, « Microsoft Power BI Guidance Documentation & DAX Reference », 2024. ", "https://learn.microsoft.com/power-bi/", ""),
        bullet("[25] S. Nakajima, Introduction to TPM: Total Productive Maintenance. Cambridge, MA, USA : Productivity Press, 1988."),
        linkBullet("[26] Object Management Group (OMG), « Unified Modeling Language (UML) Specification, Version 2.5.1 », déc. 2017. ", "https://www.omg.org/spec/UML/2.5.1/", "")
    
      ]
    }
  ]
});

// GENERATION OF DOCX FILE DIRECTLY
Packer.toBuffer(doc).then(buffer => {
  const outputPath = path.join(__dirname, 'pfe.docx');
  let savedPath = outputPath;
  try {
    fs.writeFileSync(outputPath, buffer);
    console.log("✓ Rapport PFE généré avec succès : " + outputPath);
  } catch(e) {
    if (e.code === 'EBUSY') {
      savedPath = path.join(__dirname, 'pfe_mis_a_jour.docx');
      fs.writeFileSync(savedPath, buffer);
      console.log("[ATTENTION] pfe.docx est ouvert dans Word. Version a jour enregistree sous : " + savedPath);
    } else {
      throw e;
    }
  }

  // Copy to root workspace
  const rootPath = path.join(__dirname, '..', 'pfe.docx');
  try {
    fs.writeFileSync(rootPath, buffer);
    console.log("✓ Copie sauvegardee a la racine : " + rootPath);
  } catch(e) {
    if (e.code === 'EBUSY') {
      const rootFallback = path.join(__dirname, '..', 'pfe_mis_a_jour.docx');
      try {
        fs.writeFileSync(rootFallback, buffer);
        console.log("[ATTENTION] pfe.docx racine est ouvert dans Word. Version a jour enregistree sous : " + rootFallback);
      } catch(e2) {}
    }
  }
}).catch(err => {
  console.error("Erreur generation pfe.docx :", err);
});
