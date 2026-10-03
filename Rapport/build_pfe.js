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
        body("Dans le secteur manufacturier et la plasturgie automobile, l'amélioration de la performance industrielle repose de plus en plus sur l'exploitation des données générées au sein des ateliers. Le suivi des cadences de fabrication, l'évaluation du Taux de Rendement Global (TRG/OEE) et la gestion des approvisionnements constituent des leviers majeurs pour assurer la continuité de la production et maîtriser les coûts d'exploitation."),
        pb(),
        body("Ce projet de fin d'études s'inscrit dans ce cadre au sein d'un équipementier automobile exploitant plusieurs usines en Tunisie (sites de Kondar et Sousse) et en République Tchèque (site de Brno). Avec un parc de 319 presses à injecter de capacités variées, l'entreprise fabrique des pièces plastiques techniques destinées à l'industrie automobile."),
        pb(),
        body("Bien que l'entreprise dispose d'un entrepôt de données (Data Warehouse sous Microsoft SQL Server) regroupant l'historique des opérations, le pilotage quotidien restait en partie manuel. Le calcul du TRG était souvent réalisé a posteriori sur des feuilles de calcul, ce qui limitait la réactivité face aux aléas de production. De même, la gestion des stocks de matières premières et de composants manquait d'outils d'anticipation, provoquant ponctuellement des retards d'approvisionnement ou des stocks dormants."),
        pb(),
        body("La problématique de ce projet peut ainsi se formuler :"),
        body("*« Comment valoriser les données du Data Warehouse pour concevoir un système d'aide à la décision permettant de superviser les machines, de prévoir les cadences de production grâce à l'apprentissage automatique et d'optimiser la gestion des stocks ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),
        body("Pour répondre à ce besoin, nous avons développé la solution **Nexora**, structurée autour de trois axes principaux :"),
        bullet("**1. Un pipeline de traitement et d'assainissement des données** : extraction des données brutes, correction des anomalies de stock et chargement dans des tables adaptées à l'analyse."),
        bullet("**2. Un module de prévision par apprentissage automatique** : comparaison de quatre modèles pour estimer les volumes de production futurs et détection d'anomalies sur les cadences."),
        bullet("**3. Un module de gestion prévisionnelle des stocks** : classification des articles du catalogue et calcul des besoins de réapprovisionnement sur un horizon cible de 45 jours."),
        pb(),
        body("Ces fonctionnalités sont accessibles à travers une application web développée avec React.js et un backend Spring Boot, complétée par des tableaux de bord Power BI pour le suivi décisionnel."),
        pb(),
        body("Le projet a été mené selon la méthodologie Agile Scrum, découpé en un Sprint 0 de cadrage et quatre sprints de réalisation. Le présent rapport s'organise en six chapitres :"),
        bullet("**Le premier chapitre** présente le cadre général du projet, l'entreprise d'accueil, l'étude de l'existant, la méthodologie Scrum et la démarche de modélisation."),
        bullet("**Le deuxième chapitre (Sprint 0)** est dédié à l'analyse des besoins fonctionnels et non fonctionnels, à la conception de l'architecture globale et au choix des technologies."),
        bullet("**Le troisième chapitre (Sprint 1)** détaille l'exploration des données, le traitement de la qualité et la réalisation du pipeline ETL alimentant le Data Warehouse."),
        bullet("**Le quatrième chapitre (Sprint 2)** présente la conception du module de gestion des stocks, la classification des articles et le calcul des recommandations de réapprovisionnement."),
        bullet("**Le cinquième chapitre (Sprint 3)** expose le développement, l'entraînement et l'évaluation comparative des modèles de prévision ainsi que la détection d'anomalies."),
        bullet("**Le sixième chapitre (Sprint 4)** décrit la conception des tableaux de bord Power BI, l'intégration des interfaces et les tests de validation du système."),
        pb(),
        body("Le rapport se termine par une conclusion générale résumant les résultats obtenus et proposant des perspectives d'évolution pour le système."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 1 : CONTEXTE ET CADRE DU PROJET
        // =========================================================
        title1("Chapitre 1 : Contexte et cadre du projet"),

        title2("1.1 Introduction"),
        body("Ce premier chapitre présente le cadre général de notre projet de fin d'études. Nous décrivons d'abord le contexte académique au sein de la Faculté des Sciences de Monastir, puis l'entreprise d'accueil, spécialisée dans les services numériques et l'ingénierie logicielle. Nous analysons ensuite les problématiques industrielles rencontrées dans les ateliers de plasturgie automobile, les limites des outils actuels et la solution **Nexora** conçue pour y répondre. Enfin, nous présentons la démarche méthodologique Agile Scrum et les diagrammes UML utilisés pour encadrer le développement."),
        pb(),

        title2("1.2 Contexte académique"),
        body("Ce projet est réalisé dans le cadre du **Master Professionnel en Data Science** de la Faculté des Sciences de Monastir (FSM), rattachée à l'Université de Monastir. Cette formation prépare les étudiants à l'analyse de données complexes, au développement de modèles prédictifs et à l'intégration de solutions logicielles d'aide à la décision."),
        pb(),
        body("Ce travail de fin d'études permet d'appliquer les compétences acquises en apprentissage automatique et en ingénierie des données à des données industrielles réelles issues d'un parc de presses à injecter."),
        pb(),

        title2("1.3 Présentation de l'organisme d'accueil"),
        title3("1.3.1 Présentation de l'entreprise"),
        body("Le projet a été développé en collaboration avec **Maps-IT**, une société de services informatiques et d'ingénierie logicielle située à Monastir en Tunisie. Fondée en 2021, Maps-IT accompagne ses clients dans la mise en place de solutions logicielles sur mesure, le développement d'applications web, l'intégration de systèmes décisionnels et la valorisation des données par la Data Science."),
        pb(),
        body("Le tableau 1.1 présente la fiche d'identité de l'entreprise :"),
        pb(),
        makeTable(
          ["Champ", "Information"],
          [
            ["Raison sociale", "Maps-IT"],
            ["Date de création", "2021"],
            ["Secteur d'activité", "Services informatiques et ingénierie logicielle"],
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
        body("Maps-IT intervient principalement dans trois domaines complémentaires :"),
        bullet("**Développement logiciel sur mesure** : conception d'applications web et mobiles adaptées aux besoins spécifiques des clients."),
        bullet("**Business Intelligence et gestion des données** : conception d'entrepôts de données, mise en place de flux ETL et création de tableaux de bord de suivi."),
        bullet("**Data Science et Intelligence Artificielle** : exploration de données, modélisation prédictive et optimisation des processus opérationnels."),
        pb(),

        title2("1.4 Présentation de la plateforme Nexora"),
        title3("1.4.1 Présentation générale"),
        body("**Nexora** est une solution logicielle d'aide à la décision conçue pour faciliter le suivi des ateliers de production et la gestion des stocks. Elle s'appuie sur les données centralisées dans le Data Warehouse de l'entreprise pour proposer des indicateurs de fonctionnement en temps réel, des prévisions de cadence et des recommandations de réapprovisionnement."),
        pb(),
        ...imageFigure("logos/logo.png", "Figure 1.2 : Logo de la plateforme Nexora", 220, 90),
        body("La solution s'adresse aux responsables d'atelier, aux planificateurs de production et aux gestionnaires de stock, en leur fournissant une interface simple et claire pour piloter leurs activités au quotidien."),
        pb(),

        title3("1.4.2 Fonctionnalités principales"),
        body("La plateforme Nexora s'articule autour de quatre fonctionnalités majeures :"),
        bullet("**Suivi des machines et du TRG/OEE** : visualisation de l'état des presses de l'atelier et calcul des trois composantes du Taux de Rendement Global (Disponibilité, Performance, Qualité)."),
        bullet("**Prévision des volumes de fabrication** : estimation des cadences de production futures à 7, 15 et 30 jours pour aider à l'organisation du travail en équipe."),
        bullet("**Gestion prévisionnelle des stocks** : classification des articles du catalogue selon leur niveau d'inventaire et proposition de quantités à commander pour sécuriser un horizon de 45 jours."),
        bullet("**Tableaux de bord interactifs** : rapports Power BI permettant de filtrer les indicateurs par atelier, machine ou famille de matière."),
        pb(),

        title3("1.4.3 Limites de la situation actuelle"),
        body("Avant la mise en place de Nexora, le suivi de production présentait plusieurs contraintes :"),
        bullet("**Calcul manuel du TRG** : les fiches de production remplies à la main étaient compilées en fin de mois sur tableur, limitant la réactivité en cas de panne ou de baisse de cadence."),
        bullet("**Gestion réactive des approvisionnements** : les commandes de matières premières étaient souvent passées après constat d'une pénurie, créant des risques d'arrêt de ligne."),
        bullet("**Présence de surstocks** : pour se prémunir des ruptures, certaines références étaient commandées en trop grande quantité, immobilisant de la trésorerie."),
        bullet("**Accès complexe aux données de l'ERP** : les informations opérationnelles étaient difficiles à consulter rapidement par les équipes sur le terrain."),
        pb(),

        title2("1.5 Présentation du projet"),
        title3("1.5.1 Contexte et problématique"),
        body("L'entreprise dispose d'un Data Warehouse (dbDWH1) conservant l'historique des opérations de fabrication (tables FACT_Mvts_Stocks, Fact_PA, DIM_OF-Mach, DIM_FamArt). Cependant, ces données étaient peu exploitées pour anticiper les besoins futurs."),
        body("La problématique centrale du projet est donc :"),
        body("*« Comment exploiter les données de l'entrepôt pour construire un outil d'aide à la décision capable de suivre la production, de prévoir les cadences par apprentissage automatique et de guider les réapprovisionnements de stock ? »*", { align: AlignmentType.CENTER, italics: true }),
        pb(),

        title3("1.5.2 Étude de l'existant"),
        body("En milieu industriel, trois approches sont couramment utilisées : les feuilles de calcul Excel, les modules de base des ERP et les progiciels MES spécialisés. Si les tableurs sont simples mais manuels, les solutions logicielles lourdes sont souvent complexes à paramétrer et n'intègrent pas toujours de modèles prédictifs adaptés aux besoins de l'atelier."),
        pb(),

        title3("1.5.3 Solution proposée"),
        body("Pour répondre à ces besoins de manière adaptée, la solution **Nexora** combine trois composantes :"),
        bullet("**1. Un pipeline de traitement des données (ETL)** : ingestion, nettoyage des anomalies d'inventaire et structuration des données dans les 7 tables du Data Warehouse dbDWH1."),
        bullet("**2. Un module de prévision par apprentissage automatique** : comparaison de quatre modèles (Régression Linéaire, ARIMA, Random Forest, Prophet) pour prévoir les cadences, complété par Isolation Forest pour la détection d'anomalies."),
        bullet("**3. Un module de gestion des stocks** : suivi du niveau de risque des articles et calcul des quantités à commander sur un horizon de 45 jours."),
        pb(),
        body("L'ensemble est intégré dans une application web avec React.js et Spring Boot, et complété par des rapports interactifs sous Microsoft Power BI."),
        pb(),
        body("Le tableau 1.2 résume la comparaison entre les solutions existantes et la solution Nexora :"),
        pb(),
        makeTable(
          ["Critère d'évaluation", "Progiciels MES standards", "ERP classique", "Feuilles de calcul (Excel)", "Solution Nexora"],
          [
            ["Suivi du TRG en continu",         "✓", "✗", "✗",        "✓"],
            ["Prévisions de cadence par IA",     "✗", "✗", "✗",        "✓"],
            ["Tableaux de bord décisionnels",    "✓", "Limité", "✗",   "✓"],
            ["Lien direct avec le Data Warehouse", "✓", "✓", "Instable", "✓"],
            ["Classification et suivi des stocks", "✓", "✗", "✗",      "✓"],
            ["Recommandations d'approvisionnement", "✗", "✗", "✗",      "✓"],
            ["Facilité d'utilisation en atelier", "✗", "✗", "✗",       "✓"],
            ["Coût et modularité",               "✗", "✗", "✓",        "✓"],
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
        body("Le traitement des données et la restitution des résultats suivent un enchaînement en huit étapes, illustré dans la figure 1.3 :"),
        pb(),
        ...imageFigure("diagrams/architecture.png", "Figure 1.3 : Workflow complet du système décisionnel Nexora", 460, 460),
        bullet("**1. Ingestion des données** : lecture des fichiers d'extraction bruts et des données opérationnelles."),
        bullet("**2. Nettoyage (ETL)** : détection des doublons, correction des formats de date et assainissement des stocks négatifs."),
        bullet("**3. Préparation des variables** : calcul de 16 variables temporelles et statistiques (moyennes mobiles, lags, indicateurs de calendrier)."),
        bullet("**4. Découpage chronologique** : séparation des données en 80 % pour l'entraînement et 20 % pour le test afin d'évaluer les modèles de manière réaliste."),
        bullet("**5. Entraînement des modèles** : apprentissage des quatre modèles de prévision et du modèle de détection d'anomalies."),
        bullet("**6. Validation croisée** : évaluation par TimeSeriesSplit à 5 plis pour vérifier la stabilité temporelle."),
        bullet("**7. Évaluation des résultats** : calcul des indicateurs de performance (MAE, RMSE, MAPE, R²)."),
        bullet("**8. Restitution utilisateur** : affichage des prévisions et des indicateurs dans l'application web et les rapports Power BI."),
        pb(),

        title2("1.7 Méthodologie de développement"),
        title3("1.7.1 Étude comparative des méthodes"),
        body("Avant d'entamer le développement, nous avons comparé l'approche classique en cascade et l'approche Agile afin de choisir la méthode la plus appropriée :"),
        pb(),
        makeTable(
          ["Critère", "Approche classique (Cascade)", "Approche Agile (Scrum)"],
          [
            ["Cycle de développement", "Linéaire et séquentiel", "Itératif et par incréments"],
            ["Planification", "Fixée au départ", "Adaptable selon l'avancement"],
            ["Livraisons", "Unique à la fin du projet", "Régulières à la fin de chaque sprint"],
            ["Prise en compte des retours", "Tardive en fin de cycle", "Continue à chaque itération"],
            ["Gestion des imprévus", "Peu flexible", "Facilement intégrable"]
          ],
          [2400, 3100, 3166]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 1.3 : Comparaison entre approche classique et approche agile", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("Le tableau 1.4 résume les avantages et inconvénients des deux méthodes :"),
        pb(),
        makeTable(
          ["Méthodologie", "Avantages principaux", "Inconvénients principaux"],
          [
            ["Approche classique", "• Cadre et étapes bien définis au départ.\n• Facilité de planification contractuelle.", "• Faible flexibilité en cas d'anomalies sur les données.\n• Validation tardive par les utilisateurs finaux."],
            ["Approche Agile (Scrum)", "• Adaptabilité aux spécificités des données réelles.\n• Validation progressive des modules développés.\n• Échanges réguliers avec les encadrants.", "• Nécessite un suivi continu du Product Owner.\n• Exige une gestion rigoureuse des priorités du backlog."]
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
        body("Nous avons retenu la méthodologie Agile Scrum [1, 2] car elle convient particulièrement aux projets intégrant plusieurs composants distincts (traitement des données, modélisation prédictive, gestion des stocks et interface décisionnelle)."),
        pb(),
        body("Cette démarche permet de tester et d'ajuster chaque composant au fil des itérations, tout en intégrant régulièrement les retours des encadrants."),
        pb(),
        body("Le déroulement de notre projet suit les étapes classiques de Scrum :"),
        body("1. Élaboration du Product Backlog.", { indent: 400 }),
        body("2. Planification des sprints.", { indent: 400 }),
        body("3. Développement et test des fonctionnalités.", { indent: 400 }),
        body("4. Validation d'un incrément à chaque fin d'itération.", { indent: 400 }),
        body("5. Revue et ajustement continu.", { indent: 400 }),
        pb(),
        body("La figure suivante illustre le cycle de fonctionnement de la méthodologie Scrum :"),
        pb(),
        ...imageFigure("scrum-framework-9.29.23.png", "Figure 1.4 : Cycle de la méthodologie Scrum", 520, 320),
        pb(),

        title3("1.7.3 Organisation des rôles Scrum"),
        body("Les rôles au sein de l'équipe ont été définis comme suit :"),
        bullet("**Product Owner** : encadrant en entreprise, veillant à la cohérence avec les besoins du terrain et à la priorisation des fonctionnalités."),
        bullet("**Scrum Master** : encadrant universitaire à la FSM, garant de la rigueur méthodologique et du bon déroulement académique du travail."),
        bullet("**Équipe de Développement** : assurée par l'étudiante, en charge de la conception, de la préparation des données, de l'apprentissage des modèles et du développement applicatif."),
        pb(),

        title3("1.7.4 Product Backlog"),
        body("Le Product Backlog regroupe les 20 exigences formulées sous forme de User Stories, réparties par sprint et priorisées :"),
        pb(),
        makeTable(
          ["ID", "Récit Utilisateur (User Story)", "Priorité", "Estimation (jours)", "Sprint Associé"],
          [
            ["US01", "En tant qu'utilisateur, je veux m'authentifier afin d'accéder aux fonctionnalités autorisées", "Haute", "5 jours", "Sprint 1"],
            ["US02", "En tant qu'administrateur, je veux gérer les rôles pour restreindre les accès aux données", "Haute", "5 jours", "Sprint 1"],
            ["US03", "En tant qu'administrateur, je veux auditer le DWH afin de cartographier les tables de production", "Haute", "8 jours", "Sprint 1"],
            ["US04", "En tant qu'administrateur, je veux nettoyer les données de stock pour éliminer les anomalies", "Haute", "5 jours", "Sprint 1"],
            ["US05", "En tant que responsable, je veux classer les articles selon la méthode ABC pour prioriser les stocks", "Haute", "8 jours", "Sprint 2"],
            ["US06", "En tant que responsable, je veux recevoir des alertes en cas de stock critique", "Haute", "5 jours", "Sprint 2"],
            ["US07", "En tant qu'opérateur, je veux consulter les mouvements de stock enregistrés", "Moyenne", "5 jours", "Sprint 2"],
            ["US08", "En tant que responsable, je veux obtenir des recommandations pour le réapprovisionnement", "Haute", "5 jours", "Sprint 2"],
            ["US09", "En tant que responsable, je veux estimer les besoins en matières selon les plannings", "Moyenne", "5 jours", "Sprint 2"],
            ["US10", "En tant que responsable, je veux suivre les transferts d'articles entre les dépôts", "Basse", "3 jours", "Sprint 2"],
            ["US11", "En tant que responsable, je veux visualiser l'état des 319 machines de l'atelier", "Haute", "8 jours", "Sprint 3"],
            ["US12", "En tant que responsable, je veux consulter le calcul du TRG par machine et par atelier", "Haute", "8 jours", "Sprint 3"],
            ["US13", "En tant qu'opérateur, je veux suivre l'avancement des ordres de fabrication", "Moyenne", "5 jours", "Sprint 3"],
            ["US14", "En tant que responsable, je veux extraire l'historique de production pour entraîner les modèles", "Haute", "5 jours", "Sprint 3"],
            ["US15", "En tant que responsable, je veux évaluer 4 modèles d'apprentissage pour prévoir les volumes", "Haute", "8 jours", "Sprint 3"],
            ["US16", "En tant que responsable, je veux visualiser les prévisions de cadence à 30 jours", "Haute", "5 jours", "Sprint 3"],
            ["US17", "En tant qu'utilisateur, je veux pouvoir filtrer les indicateurs par atelier et par date", "Haute", "5 jours", "Sprint 4"],
            ["US18", "En tant qu'utilisateur, je veux exporter les résultats d'inventaire sous format Excel", "Moyenne", "3 jours", "Sprint 4"],
            ["US19", "En tant que responsable, je veux consulter un tableau de bord global de production sur Power BI", "Haute", "8 jours", "Sprint 4"],
            ["US20", "En tant que responsable, je veux analyser l'état des stocks sur un rapport Power BI dédié", "Haute", "5 jours", "Sprint 4"]
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
        body("Le projet a été organisé en cinq sprints successifs, chacun correspondant à un objectif de réalisation précis :"),
        pb(),
        makeTable(
          ["Sprint", "Objectif principal", "Livrable produit"],
          [
            ["Sprint 0", "Analyse des besoins et conception générale", "Spécifications fonctionnelles et architecture du système"],
            ["Sprint 1", "Prétraitement des données et pipeline ETL", "Données assainies et chargement des 7 tables du DWH dbDWH1"],
            ["Sprint 2", "Module de gestion intelligente des stocks", "Classification ABC, alertes et recommandations de commande"],
            ["Sprint 3", "Modélisation prédictive des cadences (4 modèles)", "Modèles de prévision comparés et détection d'anomalies"],
            ["Sprint 4", "Tableaux de bord décisionnels et validation", "Rapports Power BI, intégration web et tests fonctionnels"]
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
        body("Pour modéliser la structure et le comportement du système, nous avons utilisé le langage **UML (Unified Modeling Language)** [26]. Quatre types de diagrammes ont été principalement mobilisés :"),
        bullet("**Diagramme de cas d'utilisation (Chapitre 2)** : illustration des fonctionnalités offertes aux différents profils d'utilisateurs."),
        bullet("**Diagramme de classes (Chapitres 2 et 3)** : représentation de la structure des données et des entités de production."),
        bullet("**Diagramme d'activité (Chapitre 3)** : description des étapes de traitement et de nettoyage au sein du pipeline ETL."),
        bullet("**Diagramme de séquence (Chapitre 6)** : représentation des échanges de messages lors de la consultation des rapports décisionnels."),
        pb(),

        title2("1.9 Conclusion"),
        conclusionBox("Ce premier chapitre a posé le cadre du projet Nexora. Après avoir situé le travail au sein de l'entreprise d'accueil et analysé les contraintes actuelles de l'atelier, nous avons précisé la démarche méthodologique Scrum adoptée pour planifier les développements. Le chapitre suivant présente les résultats du Sprint 0, consacré à la spécification des besoins et à la conception de l'architecture générale du système."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 2 : SPRINT 0 : ANALYSE DES BESOINS ET CONCEPTION
        // =========================================================
        title1("Chapitre 2 : Sprint 0 : Analyse des besoins et Conception du Système"),

        title2("2.1 Introduction"),
        body("Ce chapitre correspond au Sprint 0 de notre démarche Scrum. Cette étape initiale a pour objectif de formaliser les exigences du système **Nexora**, d'identifier les différents profils d'utilisateurs et leurs interactions avec la plateforme, de concevoir l'architecture globale en quatre couches et de définir l'environnement technique retenu pour le développement."),
        pb(),

        title2("2.2 Spécification des besoins"),
        body("La spécification des besoins permet de traduire les attentes des équipes d'atelier en fonctionnalités logicielles concrètes. Nous distinguons les besoins fonctionnels, qui précisent les services fournis par le système, des besoins non fonctionnels, qui définissent les critères de qualité technique."),
        pb(),

        title3("2.2.1 Besoins fonctionnels"),
        body("Les fonctionnalités attendues sont organisées selon les principaux profils d'utilisateurs :"),
        bullet("**Le Responsable de Production / Chef d'Atelier** : doit pouvoir visualiser l'état des 319 presses en temps réel, suivre le Taux de Rendement Global (TRG/OEE) global et par machine, analyser les principales causes d'arrêt (changement d'outillage, panne mécanique, attente matière) et consulter les prévisions de cadence à 7, 15 et 30 jours pour faciliter la planification des équipes."),
        bullet("**Le Gestionnaire des Stocks** : doit pouvoir consulter l'état des articles du catalogue, identifier rapidement les produits en situation de rupture ou en stock critique, vérifier la couverture restante en jours et obtenir des propositions de commande calculées pour maintenir un stock de sécurité suffisant."),
        bullet("**L'Opérateur d'Atelier** : doit pouvoir consulter les ordres de fabrication qui lui sont assignés et enregistrer les déclarations de fin de série ainsi que les quantités produites."),
        bullet("**L'Administrateur Système** : doit gérer les comptes utilisateurs, attribuer les droits d'accès aux différentes rubriques et s'assurer du bon fonctionnement des synchronisations de données."),
        bullet("**Le Data Warehouse (Système)** : fournit les données d'historique de stock et de fabrication nécessaires au calcul des indicateurs et à l'apprentissage des modèles."),
        pb(),

        title3("2.2.2 Besoins non fonctionnels"),
        body("Le tableau 2.1 récapitule les exigences non fonctionnelles retenues pour guider la conception de la solution :"),
        pb(),
        makeTable(
          ["Catégorie", "Exigence"],
          [
            ["Performance", "Temps de réponse rapide pour l'affichage du tableau de bord et des prévisions, sans latence perceptible par l'utilisateur."],
            ["Sécurité", "Authentification sécurisée, gestion des accès restreinte aux utilisateurs autorisés et protection des données sensibles."],
            ["Fiabilité", "Utilisation de données correctement nettoyées et de modèles évalués afin de garantir des résultats fiables."],
            ["Maintenabilité", "Code organisé de manière modulaire et documenté pour faciliter les évolutions futures."],
            ["Évolutivité", "Architecture permettant l'intégration de nouveaux modèles ou fonctionnalités sans modification majeure du système."],
            ["Ergonomie", "Interface intuitive et facile à prendre en main, y compris pour un utilisateur non technique."]
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
        body("L'analyse des cas d'utilisation met en évidence les acteurs intervenant sur le système :"),
        bullet("**1. Le Responsable de Production** : consulte la supervision des machines, le TRG et les prévisions de fabrication."),
        bullet("**2. Le Gestionnaire des Stocks** : exploite les indicateurs de rotation, les alertes de pénurie et les suggestions de réapprovisionnement."),
        bullet("**3. L'Opérateur d'Atelier** : déclare les quantités réalisées et signale les arrêts au poste de travail."),
        bullet("**4. L'Administrateur** : configure les utilisateurs, les rôles et supervise les flux techniques."),
        bullet("**5. Le Data Warehouse SQL Server** : assure la persistance des données consolidées et alimente les traitements décisionnels."),
        pb(),

        title3("2.3.2 Diagramme des cas d'utilisation global"),
        body("La figure 2.1 présente le diagramme de cas d'utilisation global, illustrant les interactions entre les acteurs et les grands modules du système :"),
        pb(),
        ...imageFigure("diagrams/global_usecase.png", "Figure 2.1 : Diagramme des cas d'utilisation global", 540, 310),
        body("Les relations d'inclusion illustrent les dépendances logiques : l'affichage des prévisions de fabrication s'appuie sur les données prétraitées par le pipeline ETL, tandis que la génération des alertes de stock découle directement de l'évaluation de la couverture en jours."),
        pb(),

        title2("2.4 Architecture globale du système"),
        body("Pour assurer la clarté et la modularité de la solution, l'architecture globale de Nexora est organisée en **quatre couches**, comme l'illustre la figure 2.2 :"),
        pb(),
        ...imageFigure("diagrams/arch_logique.png", "Figure 2.2 : Architecture globale du système décisionnel en quatre couches", 540, 260),
        bullet("**1. Couche Données (Data Layer)** : composée de l'entrepôt de données Microsoft SQL Server (dbDWH1). Elle centralise les tables de faits et de dimensions issues des opérations d'atelier (mouvements de stocks, cadences réelles, nomenclatures et en-cours)."),
        bullet("**2. Couche Traitement & ETL (Processing Layer)** : regroupe les scripts Python chargés d'extraire les données brutes, de corriger les anomalies (doublons, formats de date, scories de stock) et de structurer les tables analytiques."),
        bullet("**3. Couche Métier & IA (Business & AI Layer)** : intègre les services applicatifs en charge de la logique de calcul du TRG, de la classification des stocks et de l'exécution des modèles d'apprentissage automatique (Régression Linéaire, ARIMA, Random Forest, Prophet, Isolation Forest)."),
        bullet("**4. Couche Présentation (Presentation Layer)** : interface utilisateur web développée avec React.js pour la consultation quotidienne, complétée par des rapports Microsoft Power BI pour les analyses détaillées."),
        pb(),

        title2("2.5 Environnement de travail"),
        title3("2.5.1 Environnement matériel"),
        body("Les phases de préparation des données, d'entraînement des modèles et de développement ont été réalisées sur un ordinateur portable présentant les caractéristiques suivantes :"),
        bullet("**Processeur** : Intel Core i7-12700H (14 cœurs)."),
        bullet("**Mémoire vive (RAM)** : 16 Go DDR4."),
        bullet("**Stockage** : SSD NVMe de 512 Go."),
        bullet("**Système d'exploitation** : Microsoft Windows 11 (64 bits)."),
        pb(),

        title3("2.5.2 Environnement logiciel"),
        body("Le tableau 2.2 présente les principaux outils, langages et bibliothèques utilisés pour la réalisation du projet :"),
        pb(),
        makeTable(
          ["Outil / Technologie", "Version", "Rôle dans le projet"],
          [
            ["Environnement de développement"],
            ["Visual Studio Code", "1.104", "Éditeur de code pour le développement Python, React.js et les scripts ETL."],
            ["IntelliJ IDEA", "2024.1", "Environnement de développement pour le backend Spring Boot."],
            ["Git & GitHub", "2.52", "Gestion de versions et hébergement du code source du projet."],

            ["Base de données"],
            ["Microsoft SQL Server", "2022", "Système de gestion de base de données relationnelle hébergeant le Data Warehouse (dbDWH1)."],
            ["SSMS", "19.3", "Outil d'administration et de gestion des requêtes SQL Server."],

            ["Langages de programmation"],
            ["Python", "3.10", "Traitement des données (ETL), apprentissage automatique et calculs statistiques."],
            ["Java", "17", "Développement du serveur applicatif et des services backend."],
            ["TypeScript / JavaScript", "ES2022", "Développement de l'interface utilisateur web."],

            ["Frameworks et bibliothèques"],
            ["Spring Boot", "3.2", "Framework backend pour la gestion des services métiers et des points d'accès."],
            ["React.js", "18.2", "Bibliothèque frontend pour la création des vues de l'interface utilisateur."],
            ["Pandas & NumPy", "2.1 / 1.26", "Manipulation des données tabulaires et calculs numériques vectorisés."],
            ["Scikit-learn", "1.3", "Prétraitement, modélisation et détection d'anomalies (Isolation Forest)."],
            ["Prophet", "1.1", "Modélisation des séries temporelles pour la prévision de production."],
            ["Statsmodels", "0.14", "Modèle statistique ARIMA et tests de stationnarité."],
            ["Microsoft Power BI", "2024", "Création des rapports décisionnels interactifs pour les équipes d'atelier."]
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
        conclusionBox("Ce chapitre a présenté le Sprint 0 en posant les bases fonctionnelles et architecturales de la solution Nexora. L'analyse des besoins a permis de définir les attentes clés des utilisateurs d'atelier, tandis que l'architecture en quatre couches assure une organisation claire des différents composants. L'environnement technique retenu combine des outils stables et adaptés aux problématiques de Data Science et de développement web. Le chapitre suivant aborde le Sprint 1, consacré au nettoyage des données et à la mise en œuvre du pipeline ETL."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 3 : SPRINT 1 : PRÉTRAITEMENT ET PIPELINE ETL
        // =========================================================
        title1("Chapitre 3 : Sprint 1 : Prétraitement des données, assainissement de la qualité et pipeline ETL"),

        title2("3.1 Introduction"),
        body("Ce chapitre correspond au Sprint 1 de notre démarche Agile Scrum. Dans un projet d'analyse de données et d'aide à la décision, la qualité des informations en entrée conditionne la fiabilité des résultats. Dans un contexte industriel réel, les données brutes issues des systèmes d'information comportent fréquemment des anomalies de saisie, des doublons ou des valeurs manquantes. L'objectif de ce premier sprint est donc d'extraire les données brutes, d'identifier les anomalies de qualité, de concevoir un pipeline de nettoyage en Python et de charger les données assainies dans les sept tables du Data Warehouse Microsoft SQL Server (dbDWH1)."),
        pb(),

        title2("3.2 Backlog du Sprint 1"),
        body("Le tableau 3.1 présente les tâches planifiées pour le Sprint 1, ordonnancées par priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Extraction et audit de qualité des fichiers bruts (ex: ASTOCKDATE_RAW.csv, 51 500 lignes)", "2 jours"],
            ["Élevée", "Développement des fonctions de nettoyage pour les 10 anomalies identifiées", "3 jours"],
            ["Élevée", "Structuration des données selon le schéma en étoile du DWH (7 tables)", "2 jours"],
            ["Élevée", "Mise en place du chargement automatisé vers SQL Server dbDWH1", "1 jour"],
            ["Élevée", "Calcul des variables temporelles et statistiques (Feature Engineering)", "2 jours"],
            ["Moyenne", "Analyse exploratoire des séries de production (distributions, saisonnalités)", "2 jours"],
            ["Moyenne", "Création des index adaptés sur les tables de faits SQL Server", "1 jour"],
            ["Faible", "Mise en place de la journalisation et du rapport d'audit automatisé", "1 jour"]
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
        body("Les données utilisées proviennent des extractions opérationnelles de l'ERP de l'entreprise et des relevés de production d'atelier des sites de Kondar, Sousse et Brno. Ces données couvrent une période continue d'activité d'atelier (du 1er janvier 2024 au 30 avril 2026)."),
        pb(),
        body("Le tableau 3.2 donne un aperçu statistique global de la volumétrie traitée :"),
        pb(),
        makeTable(
          ["Indicateur de volumétrie", "Valeur constatée"],
          [
            ["Lignes brutes d'inventaire extraites (ASTOCKDATE_RAW.csv)", "51 500 enregistrements bruts"],
            ["Lignes de mouvements de stock certifiées (FACT_Mvts_Stocks)", "32 043 enregistrements nettoyés"],
            ["Nombre d'articles distincts au catalogue (DIM_FamArt)", "800 références d'atelier"],
            ["Nombre de presses à injecter suivies (DIM_OF-Mach)", "319 machines actives"],
            ["Nombre d'enregistrements en-cours de fabrication (FACT_Encours)", "8 344 lignes d'en-cours"],
            ["Nombre de composants et liens de nomenclature (FACT_BOM)", "439 liens d'assemblage"],
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

        title3("3.3.2 Description des tables principales du Data Warehouse dbDWH1"),
        body("Le Data Warehouse (dbDWH1) est organisé selon un schéma en étoile articulé autour de deux tables de dimensions et de cinq tables de faits :"),
        pb(),
        makeTable(
          ["Nom de la table", "Type", "Rôle et contenu dans le projet"],
          [
            ["dbo.DIM_FamArt", "Dimension", "Référentiel des articles : code article, désignation, nom abrégé, famille matière, groupe comptable et typologie client."],
            ["dbo.DIM_OF-Mach", "Dimension", "Référentiel des machines : 319 presses à injecter réparties par site (Kondar, Sousse, Brno), tonnage et atelier d'affectation."],
            ["dbo.FACT_Mvts_Stocks", "Fait", "Historique des mouvements de stock : date, référence article, quantité, coût unitaire valorisé et site de stockage."],
            ["dbo.FACT_Encours", "Fait", "Suivi des en-cours de fabrication : pièces et semi-finis actuellement en cours d'injection sur les lignes."],
            ["dbo.Fact_PA", "Fait", "Production réelle de l'atelier : pièces injectées, pièces conformes, rebuts et cadences constatées par jour."],
            ["dbo.FACT_OF-Rebuts", "Fait", "Qualité et défaillances : enregistrement des pièces rebutées avec la cause constatée (bavure, déformation, etc.)."],
            ["dbo.FACT_BOM", "Fait", "Nomenclatures des produits : décomposition des produits finis en sous-composants avec les quantités requises."]
          ],
          [2200, 1400, 5066]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.3 : Tables principales de la base", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("3.3.3 Modélisation dimensionnelle"),
        body("La figure 3.1 présente le schéma relationnel modélisant les liens entre les dimensions et les tables de faits du Data Warehouse dbDWH1 :"),
        pb(),
        ...imageFigure("diagrams/er_diagram.png", "Figure 3.1 : Diagramme relationnel et structure de la base de données DWH", 540, 310),
        body("Les principales relations sont les suivantes :"),
        bullet("**DIM_FamArt vers FACT_Mvts_Stocks** : chaque article peut faire l'objet de plusieurs mouvements de stock dans le temps."),
        bullet("**DIM_FamArt vers FACT_Encours** : un article peut être en cours de fabrication sur une ou plusieurs lignes de production."),
        bullet("**DIM_OF-Mach vers Fact_PA** : chaque presse génère quotidiennement des enregistrements de production."),
        bullet("**DIM_FamArt vers FACT_BOM** : un article parent est relié à l'ensemble de ses composants nécessaires à la fabrication."),
        bullet("**Fact_PA vers FACT_OF-Rebuts** : les ordres de fabrication consignent les pièces rebutées et leur motif."),
        pb(),

        title2("3.4 Analyse exploratoire des données (EDA)"),
        title3("3.4.1 Analyse statistique"),
        body("Une analyse statistique descriptive a été menée sur les cadences journalières afin d'étudier la distribution de la production :"),
        pb(),
        makeTable(
          ["Variable de production", "Minimum", "Maximum", "Moyenne", "Médiane", "Écart-type", "CV (%)"],
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
        body("Le tableau 3.5 met en évidence l'impact de certains événements sur le volume moyen de pièces produites par jour :"),
        pb(),
        makeTable(
          ["Période / Événement", "Nb jours", "Cadence Moy. (pcs/j)", "Cadence Max (pcs/j)", "Ratio vs Normal"],
          [
            ["Activité nominale standard", "580", "66 420", "98 450", "1,00"],
            ["Période estivale (congés constructeurs)", "45", "38 210", "52 100", "0,58"],
            ["Pics de livraison de fin de trimestre", "60", "94 850", "148 620", "1,43"],
            ["Maintenance annuelle programmée", "14", "18 900", "28 400", "0,28"],
            ["Changements d'outillages (moules)", "72", "54 300", "76 200", "0,82"],
            ["Période de Ramadan (horaires adaptés)", "80", "56 800", "79 100", "0,85"]
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
        body("La figure 3.2 montre l'évolution globale de la production de pièces sur la période étudiée, mettant en évidence les variations saisonnières et les baisses d'activité en période estivale :"),
        pb(),
        ...imageFigure("image/fig_3_2_production_evolution.png", "Figure 3.2 : Évolution temporelle de la production globale des 319 presses (2024–2026)", 540, 230),
        body("La figure 3.3 présente la répartition de la production par jour de la semaine et par mois, illustrant la régularité du rythme en milieu de semaine et la baisse habituelle le week-end :"),
        pb(),
        ...imageFigure("image/fig_3_3_saisonnalite.png", "Figure 3.3 : Saisonnalité de production par jour de la semaine et par mois", 540, 220),
        body("La figure 3.4 montre une carte thermique croisant les mois et les jours de semaine, identifiant les périodes de plus forte charge d'atelier :"),
        pb(),
        ...imageFigure("image/fig_3_4_heatmap.png", "Figure 3.4 : Heatmap d'activité atelier : cadence selon le mois et le jour de semaine", 540, 230),
        pb(),

        title2("3.5 Conception et réalisation du pipeline ETL"),
        title3("3.5.1 Architecture du pipeline ETL"),
        body("Le pipeline de traitement (situé dans le module etl_pipeline/) est conçu pour automatiser l'ingestion, le nettoyage et le chargement des données. Il s'organise selon les étapes suivantes :"),
        bullet("**1. Ingestion des sources brutes** : lecture des fichiers CSV non nettoyés issus des exports ERP et d'atelier."),
        bullet("**2. Nettoyage de la qualité** : application systématique de règles pour corriger les 10 anomalies recensées."),
        bullet("**3. Structuration en schéma en étoile** : projection des enregistrements nettoyés vers les deux dimensions et cinq faits."),
        bullet("**4. Chargement vers la base de données** : écriture dans les tables de SQL Server dbDWH1 et génération d'un rapport de synthèse."),
        pb(),
        body("La figure 3.5 illustre le flux général d'exécution du pipeline ETL :"),
        pb(),
        ...imageFigure("diagrams/sprint1_activity.png", "Figure 3.5 : Architecture et flux d'exécution du pipeline ETL", 520, 240),
        body("Le diagramme de séquence de la figure 3.6 détaille les étapes successives d'extraction, de transformation et de chargement :"),
        pb(),
        ...imageFigure("diagrams/sprint1_seq.png", "Figure 3.6 : Diagramme de séquence du pipeline ETL d'atelier", 520, 250),
        pb(),

        title3("3.5.2 Extraction des données"),
        body("Le module d'extraction lit les fichiers sources bruts en prenant en compte les variations d'encodage (UTF-8, Latin-1) et de structure. La lecture s'effectue sous forme de texte brut afin de préserver l'état initial des données avant d'appliquer les corrections."),
        pb(),

        title3("3.5.3 Transformation et traitement des anomalies"),
        body("L'analyse initiale du fichier brut a révélé environ 20 % à 25 % d'anomalies de saisie. Le module de nettoyage traite dix types d'incohérences courantes :"),
        bullet("**1. Identifiants articles (No_)** : mise en majuscules, suppression des espaces et élimination des lignes sans référence."),
        bullet("**2. Dédoublonnage** : suppression des lignes strictement identiques et des doublons sur la clé métier composite (DateStock, No_, Site)."),
        bullet("**3. Nettoyage du texte** : suppression des espaces superflus de début et fin de chaîne, et réduction des doubles espaces."),
        bullet("**4. Harmonisation des dates** : conversion des dates au format ISO 8601 (YYYY-MM-DD) et rejet des dates non valides (ex: 30 février)."),
        bullet("**5. Formats numériques** : remplacement de la virgule par un point décimal, suppression des unités de mesure dans les champs de quantité ('500 u' vers 500.0) et traitement des valeurs aberrantes."),
        bullet("**6. Coûts unitaires** : suppression des suffixes monétaires ('TND') et remplacement des coûts négatifs ou nuls par la médiane de la famille d'articles."),
        bullet("**7. Catégories d'articles** : harmonisation de la casse et correction des fautes de frappe usuelles."),
        bullet("**8. Sites de stockage** : standardisation des noms de dépôts pour éviter les doublons d'appellation."),
        bullet("**9. Cohérence entre colonnes** : réconciliation des écarts entre les colonnes de quantité et normalisation de l'indicateur d'en-cours (0 ou 1)."),
        bullet("**10. Valeurs manquantes** : attribution de libellés ou de catégories par défaut pour les champs non renseignés."),
        pb(),
        body("Le tableau 3.6 résume le bilan quantitatif des données avant et après exécution du nettoyage :"),
        pb(),
        makeTable(
          ["Critère de qualité", "État initial (Fichier brut)", "État final (Après nettoyage ETL)"],
          [
            ["Lignes d'inventaire traitées", "51 500 lignes brutes", "32 043 lignes valides (FACT_Mvts_Stocks)"],
            ["Lignes dupliquées éliminées", "18 337 doublons détectés", "0 doublon résiduel sur clé composite"],
            ["Dates invalides écartées", "660 dates non conformes", "0 date erronée (100 % au format ISO)"],
            ["Champs textuels nettoyés", "67 039 corrections d'espaces/casse", "Textes uniformisés et lisibles"],
            ["Séparateurs décimaux et unités corrigés", "464 formats numériques corrigés", "0 anomalie (nombres décimaux conformes)"],
            ["Coûts négatifs ou nuls ajustés", "528 valeurs de coût non valides", "0 coût aberrant (imputation par médiane)"],
            ["Stocks négatifs transitoires régularisés", "165 cas constatés", "0 stock négatif résiduel"],
            ["Incohérences logiques résolues", "849 écarts entre colonnes résolus", "Cohérence rétablie entre attributs"],
            ["Champs manquants traités", "365 valeurs non renseignées", "0 champ orphelin (valeurs par défaut attribuées)"]
          ],
          [2800, 2900, 2966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 3.6 : Bilan de la qualité des données", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("**Préparation des variables (Feature Engineering)** :"),
        body("Après nettoyage, 16 variables explicatives sont calculées pour préparer l'apprentissage des modèles :"),
        bullet("**Variables de calendrier** : jour de la semaine, mois, indicateur de week-end et type d'équipe (matin, après-midi, nuit)."),
        bullet("**Variables de décalage (lags)** : cadences observées à J-1, J-7 et J-14 pour intégrer l'historique récent."),
        bullet("**Moyennes mobiles** : moyennes glissantes sur 7 et 14 jours et volatilité de la production sur 28 jours."),
        bullet("**Indicateurs d'atelier** : suivi des opérations de maintenance et des changements de moule."),
        pb(),

        title3("3.5.4 Chargement dans le Data Warehouse"),
        body("L'étape finale charge les données assainies dans les sept tables du Data Warehouse dbDWH1. Pour optimiser les temps d'accès, des index clusterisés ont été définis sur les colonnes clés (comme la date et la référence article dans FACT_Mvts_Stocks). En complément, un export des tables au format CSV est conservé pour faciliter les analyses directes."),
        pb(),

        title2("3.6 Résultats du pipeline ETL"),
        body("Le tableau 3.7 résume les principaux résultats obtenus à l'issue de l'exécution du pipeline :"),
        pb(),
        makeTable(
          ["Indicateur du pipeline", "Résultat obtenu"],
          [
            ["Lignes brutes traitées en entrée", "51 500 enregistrements"],
            ["Lignes conservées dans FACT_Mvts_Stocks", "32 043 enregistrements nettoyés"],
            ["Tables alimentées dans dbDWH1", "7 tables (2 dimensions et 5 faits)"],
            ["Variables explicatives calculées pour l'IA", "16 variables d'entrée"],
            ["Temps d'exécution du pipeline complet", "Environ 2,6 secondes pour l'inventaire"],
            ["Taux de données valides conservées", "62,2 % (après suppression des doublons et anomalies)"],
            ["Taux d'anomalies résiduelles", "0,0 % (données conformes aux règles définies)"]
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
        body("Le tableau 3.8 présente le bilan des livrables réalisés au cours du Sprint 1 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Extraction des fichiers bruts", "Module d'ingestion multi-formats opérationnel", "Réalisé"],
            ["Nettoyage des données", "Module traitant les 10 anomalies identifiées", "Réalisé"],
            ["Schéma en étoile", "Définition des 7 tables du Data Warehouse dbDWH1", "Réalisé"],
            ["Chargement en base", "Module d'insertion avec gestion des exports", "Réalisé"],
            ["Préparation des variables", "16 variables explicatives créées pour les modèles", "Réalisé"],
            ["Optimisation SQL Server", "Mise en place des index sur les tables de faits", "Réalisé"],
            ["Rapport d'audit", "Génération automatique du bilan avant/après nettoyage", "Réalisé"],
            ["Dossier de code etl_pipeline/", "Scripts organisés, testés et documentés", "Réalisé"]
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
        conclusionBox("Ce chapitre a présenté les travaux du Sprint 1 consacrés à la préparation et au nettoyage des données. À partir d'un fichier brut comportant des anomalies variées, le développement d'un pipeline ETL modulaire a permis de structurer et d'assainir les informations avant leur intégration dans le Data Warehouse dbDWH1. Ces données fiabilisées constituent une base solide pour la suite du projet. Le chapitre suivant aborde le Sprint 2, dédié à la gestion des stocks de l'atelier."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 4 : SPRINT 2 : GESTION INTELLIGENTE DES STOCKS
        // =========================================================
        title1("Chapitre 4 : Sprint 2 : Développement du module de gestion intelligente des stocks"),

        title2("4.1 Introduction"),
        body("Ce chapitre correspond au Sprint 2 de notre démarche Scrum. Dans un atelier d'injection plastique, la gestion rigoureuse des stocks de matières premières (résines techniques) et de composants est essentielle pour éviter les arrêts de ligne tout en maîtrisant les coûts de stockage. L'objectif de ce sprint est de concevoir le module de **gestion des stocks** de la plateforme Nexora. En exploitant les données assainies de la table FACT_Mvts_Stocks du Data Warehouse dbDWH1, ce module évalue l'état de chaque référence du catalogue, identifie les situations de pénurie ou de surstock, et propose des recommandations de commande adaptées pour maintenir un stock de sécurité suffisant."),
        pb(),

        title2("4.2 Backlog du Sprint 2"),
        body("Le tableau 4.1 récapitule les tâches planifiées pour le Sprint 2 avec leur priorité et durée d'exécution estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Définition du schéma fonctionnel du module de gestion des stocks", "1 jour"],
            ["Élevée", "Calcul des taux de consommation journaliers, de la couverture et de la rotation", "2 jours"],
            ["Élevée", "Mise en place des règles de classification des articles (Rupture, Critique, Normal, Surstock)", "2 jours"],
            ["Élevée", "Développement de l'algorithme de calcul des commandes pour une couverture de 45 jours", "2 jours"],
            ["Moyenne", "Mise en place des alertes d'atelier priorisées par niveau de risque", "1 jour"],
            ["Faible", "Intégration des vues de synthèse d'inventaire et des fonctions d'export", "1 jour"]
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
        body("Le fonctionnement du module repose sur un enchaînement en quatre étapes, illustré par la figure 4.1 :"),
        pb(),
        ...imageFigure("diagrams/sprint3_activity.png", "Figure 4.1 : Architecture et flux d'exécution du module de gestion des stocks", 520, 240),
        bullet("**1. Données d'entrée** : lecture des stocks actuels et de l'historique des mouvements depuis la table FACT_Mvts_Stocks du Data Warehouse."),
        bullet("**2. Calcul des indicateurs** : évaluation du taux de consommation moyen par jour, de la couverture restante en jours et du taux de rotation."),
        bullet("**3. Classification des articles** : affectation de chaque référence à un niveau d'état de stock prédéfini."),
        bullet("**4. Recommandations et alertes** : calcul des quantités à commander, estimation du coût global et génération d'alertes pour les articles prioritaires."),
        pb(),

        title2("4.4 Analyse des niveaux de stock et de rotation"),
        body("Pour suivre l'état de chaque article du catalogue, nous calculons d'abord son taux de consommation journalier moyen à partir de l'historique de l'atelier :"),
        body("*taux_journalier_i = Consommation_Annuelle_i / 365*", { align: AlignmentType.CENTER, italics: true }),
        body("À partir de ce taux, deux indicateurs principaux sont suivis :"),
        bullet("**La couverture en jours** : durée d'autonomie estimée de l'atelier sans nouvelle livraison :\n*couverture_jours_i = stock_actuel_i / taux_journalier_i*"),
        bullet("**Le coefficient de rotation** : fréquence de renouvellement du stock au cours de l'année :\n*rotation_i = Consommation_Annuelle_i / stock_actuel_i*"),
        body("Une rotation élevée correspond à un article consommé rapidement nécessitant une vigilance accrue, tandis qu'une rotation très faible signale un produit peu utilisé risquant de s'accumuler inutilement."),
        pb(),

        title2("4.5 Classification des produits"),
        body("Chaque article du catalogue est classé selon son niveau de couverture disponible, conformément aux règles définies avec les équipes logistiques :"),
        pb(),
        makeTable(
          ["Statut du stock", "Condition appliquée", "Indicateur visuel", "Action recommandée"],
          [
            ["Rupture de Stock", "Stock disponible = 0 unité", "Rouge", "Commande urgente requise pour éviter l'arrêt machine."],
            ["Stock Critique", "Couverture < 15 jours de production", "Orange", "Lancement d'une commande prioritaire sous quelques jours."],
            ["Stock Normal", "15 jours ≤ Couverture < 120 jours", "Vert", "Niveau satisfaisant ; aucune commande immédiate nécessaire."],
            ["Surstock", "Couverture ≥ 120 jours", "Violet", "Report des prochaines commandes pour limiter l'immobilisation."]
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
        body("Pour les articles en rupture ou en stock critique, le système évalue la quantité nécessaire pour rétablir une **couverture de sécurité de 45 jours** (couvrant un délai moyen de livraison de 30 jours et une marge de sécurité de 15 jours) :"),
        body("*Q_commander_i = max(Q_min_conditionnement, floor(taux_journalier_i * 45) - stock_actuel_i)*", { align: AlignmentType.CENTER, italics: true }),
        body("Un seuil minimal de commande est pris en compte pour respecter les unités usuelles de livraison (sacs de granulés, cartons ou palettes)."),
        pb(),

        title3("4.6.2 Estimation du budget"),
        body("Le montant prévisionnel des commandes est obtenu en multipliant les quantités suggérées par le coût unitaire de chaque référence :"),
        body("*Budget_Total = Σ (Q_commander_i * Prix_Unitaire_i)* pour les articles nécessitant un réapprovisionnement", { align: AlignmentType.CENTER, italics: true }),
        body("Cette estimation aide les responsables à anticiper les dépenses d'approvisionnement à court terme."),
        pb(),

        title3("4.6.3 Alertes prioritaires"),
        body("Pour faciliter la prise de décision, les alertes sont hiérarchisées selon l'impact potentiel d'une rupture sur la ligne de production. Le système met ainsi en avant les références les plus urgentes à traiter pour l'approvisionneur."),
        pb(),

        title2("4.7 Résultats obtenus"),
        body("L'analyse appliquée aux 6 875 articles du catalogue montre la répartition illustrée par la figure 4.2 :"),
        pb(),
        ...imageFigure("diagrams/segmentation_pareto_kmeans.png", "Figure 4.2 : Segmentation multicritère Pareto ABC et Clustering des stocks", 540, 250),
        body("Sur l'ensemble des références analysées :"),
        bullet("**Stock Normal** : 4 920 articles (71,6 %) présentent une couverture équilibrée."),
        bullet("**Rupture de Stock** : 312 articles (4,5 %) sont actuellement épuisés."),
        bullet("**Stock Critique** : 1 240 articles (18,0 %) disposent de moins de 15 jours d'autonomie."),
        bullet("**Surstock** : 403 articles (5,9 %) ont une couverture supérieure à 120 jours."),
        pb(),
        body("La figure 4.3 montre la répartition des articles en alerte selon les principales familles de matières :"),
        pb(),
        ...imageFigure("image/fig_5_3_ruptures_stocks.png", "Figure 4.3 : Synthèse des alertes d'atelier par catégorie d'articles", 520, 230),
        body("Le budget total estimé pour reconstituer les stocks des articles prioritaires sur un horizon de 45 jours s'élève à **2 418 650 TND**."),
        pb(),

        title2("4.8 Bilan du Sprint 2"),
        body("Le tableau 4.3 résume les livrables réalisés au cours du Sprint 2 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Architecture du module", "Schéma des étapes de traitement des stocks", "Réalisé"],
            ["Calcul des indicateurs", "Calcul automatique du taux de consommation, de la couverture et rotation", "Réalisé"],
            ["Classification des articles", "Répartition des références selon les 4 statuts de stock", "Réalisé"],
            ["Calcul des commandes", "Formule de réapprovisionnement pour une couverture de 45 jours", "Réalisé"],
            ["Chiffrage budgétaire", "Estimation du montant global des approvisionnements", "Réalisé"],
            ["Alertes d'atelier", "Identification des articles les plus urgents à commander", "Réalisé"],
            ["Exports de données", "Possibilité d'exporter les recommandations sous format tabulaire", "Réalisé"]
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
        conclusionBox("Ce chapitre a décrit le module de gestion des stocks développé lors du Sprint 2. En exploitant les données fiabilisées du Data Warehouse, la solution permet de passer d'une gestion réactive à un suivi plus régulier et prévisionnel, en identifiant rapidement les références à réapprovisionner et les situations de surstock. Le chapitre suivant aborde le Sprint 3, consacré à la modélisation prédictive des cadences de production par apprentissage automatique."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 5 : SPRINT 3 : MODÉLISATION PRÉDICTIVE PAR IA
        // =========================================================
        title1("Chapitre 5 : Sprint 3 : Modélisation prédictive par Intelligence Artificielle"),

        title2("5.1 Introduction"),
        body("Ce chapitre correspond au Sprint 3 de notre démarche Scrum. L'objectif de ce sprint est de modéliser les séries temporelles de production afin d'anticiper les cadences de fabrication de l'atelier. Nous comparons quatre modèles d'apprentissage automatique : la **Régression Linéaire**, le modèle statistique **ARIMA**, la méthode d'ensemble **Random Forest** et le modèle additif **Prophet**. L'évaluation est menée à l'aide d'un protocole de validation croisée temporelle (*TimeSeriesSplit* à 5 plis) respectant la causalité des données. En complément, l'algorithme non supervisé **Isolation Forest** est utilisé pour détecter d'éventuelles dérives de cadence sur les presses."),
        pb(),

        title2("5.2 Backlog du Sprint 3"),
        body("Le tableau 5.1 présente les tâches planifiées pour le Sprint 3 avec leur priorité et leur durée estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Définition de la variable cible et découpage chronologique des données", "1 jour"],
            ["Élevée", "Implémentation et entraînement des 4 modèles (Prophet, Random Forest, ARIMA, Régression)", "3 jours"],
            ["Élevée", "Mise en place de la détection d'anomalies de cadence par Isolation Forest", "2 jours"],
            ["Élevée", "Évaluation par validation croisée temporelle (TimeSeriesSplit à 5 plis)", "2 jours"],
            ["Moyenne", "Comparaison des modèles selon les métriques MAE, RMSE, MAPE et R²", "1 jour"],
            ["Moyenne", "Calcul des intervalles d'incertitude à 95 % avec le modèle Prophet", "1 jour"],
            ["Faible", "Génération des trajectoires de prévision à 7, 15 et 30 jours", "1 jour"]
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
        body("Le processus de modélisation prédictive s'articule selon les étapes illustrées par la figure 5.1 :"),
        pb(),
        ...imageFigure("diagrams/sprint2_activity.png", "Figure 5.1 : Architecture et flux d'exécution du module de modélisation IA de Nexora", 520, 240),
        bullet("**1. Ingestion des données** : extraction de l'historique des cadences depuis la table Fact_PA du Data Warehouse."),
        bullet("**2. Préparation des variables** : encodage des jours travaillés, prise en compte des jours fériés et calcul des décalages temporels (lags)."),
        bullet("**3. Entraînement et validation** : apprentissage des modèles et application de la validation croisée TimeSeriesSplit."),
        bullet("**4. Comparaison des performances** : mesure des erreurs de prévision (MAE, RMSE, MAPE, R²) sur le jeu de test."),
        bullet("**5. Restitution des prévisions** : mise à disposition des résultats pour l'affichage dans les tableaux de bord."),
        pb(),

        title2("5.4 Préparation des données pour l'apprentissage"),
        title3("5.4.1 Variable cible"),
        body("La variable cible est le volume journalier de pièces conformes produites par l'atelier d'injection. Afin de réduire la dispersion des valeurs extrêmes, une transformation logarithmique est appliquée :"),
        body("*log_cadence = log(1 + Cadence_Journalière)*", { align: AlignmentType.CENTER, italics: true }),
        body("Les métriques d'évaluation sont ensuite recalculées après application de la transformation inverse (*expm1*) pour exprimer les résultats en nombre réel de pièces."),
        pb(),

        title3("5.4.2 Variables explicatives"),
        body("Le tableau 5.2 récapitule les variables utilisées pour alimenter les modèles prédictifs :"),
        pb(),
        makeTable(
          ["Catégorie", "Variables créées", "Utilité pour la prévision"],
          [
            ["Calendrier", "day_of_week, is_weekend, month, working_day", "Capture le rythme hebdomadaire et la saisonnalité mensuelle de l'activité."],
            ["Événements", "is_holiday, is_summer_break, shift_pattern", "Prend en compte les arrêts programmés et les congés d'usine."],
            ["Décalages (lags)", "lag_1, lag_7, lag_14, lag_30", "Intègre les cadences observées la veille, la semaine passée et le mois précédent."],
            ["Moyennes mobiles", "roll_mean_7, roll_mean_14, roll_std_7", "Indique la tendance récente de production et la variabilité de la ligne."]
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
        body("Pour évaluer les modèles de manière réaliste et éviter tout risque de fuite d'information (*data leakage*), les données sont découpées de manière strictement chronologique :"),
        pb(),
        makeTable(
          ["Jeu de données", "Proportion", "Nombre de jours", "Période couverte"],
          [
            ["Entraînement (Train)", "80 %", "388 jours", "31 décembre 2024 au 22 janvier 2026"],
            ["Test (Évaluation)", "20 %", "98 jours", "23 janvier 2026 au 30 avril 2026"]
          ],
          [2600, 1600, 2000, 2466]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.3 : Découpage chronologique Train/Test", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("5.4.4 Normalisation"),
        body("Les modèles Random Forest et Prophet ne nécessitent pas de mise à l'échelle particulière des données. Pour la Régression Linéaire, les variables d'entrée ont été standardisées (moyenne nulle et variance unitaire) à l'aide de l'outil `StandardScaler` afin d'assurer un apprentissage équilibré."),
        pb(),

        title2("5.5 Métriques d'évaluation"),
        body("Quatre métriques standards sont utilisées pour mesurer la précision des prévisions :"),
        pb(),
        makeTable(
          ["Métrique", "Formule", "Interprétation"],
          [
            ["MAE (Erreur Absolue Moyenne)", "MAE = (1/n) * Σ |y_i - ŷ_i|", "Mesure l'écart moyen en nombre de pièces ; plus elle est basse, plus le modèle est précis."],
            ["RMSE (Racine de l'Erreur Quadratique)", "RMSE = sqrt((1/n) * Σ (y_i - ŷ_i)²)", "Donne un poids plus important aux écarts importants."],
            ["MAPE (Erreur Relative Moyenne)", "MAPE = (100/n) * Σ |(y_i - ŷ_i) / y_i|", "Exprime l'erreur en pourcentage par rapport au volume réel."],
            ["R² (Coefficient de Détermination)", "R² = 1 - (SS_res / SS_tot)", "Indique la proportion de variance expliquée par le modèle (proche de 1 = bonne adéquation)."]
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
        title3("5.6.1 Modèles de prévision des séries temporelles"),
        body("Quatre modèles de prévision ont été configurés et testés pour l'estimation des cadences :"),
        pb(),
        body("**1. Régression Linéaire** : modèle de référence établissant une relation linéaire entre les variables explicatives et la cadence :"),
        ...makeProsConsTable("5.5", "Régression Linéaire",
          ["Temps d'apprentissage très rapide.", "Interprétation directe des coefficients."],
          ["Capacité limitée à appréhender les variations non linéaires.", "Sensible aux changements brutaux de rythme de production."]
        ),
        pb(),
        body("**2. Modèle ARIMA** : approche statistique autorégressive adaptée aux séries temporelles stationnaires :"),
        ...makeProsConsTable("5.6", "Modèle ARIMA",
          ["Cadre statistique éprouvé pour les séries temporelles.", "Bonne précision sur les horizons très courts (1 à 3 jours)."],
          ["Difficulté à intégrer simultanément plusieurs saisonnalités.", "Moins réactif lors de perturbations inhabituelles d'atelier."]
        ),
        pb(),
        body("**3. Random Forest Regressor** : ensemble d'arbres de décision capable de capturer des relations complexes :"),
        ...makeProsConsTable("5.7", "Random Forest Regressor",
          ["Capture bien les non-linéarités et les effets de calendrier.", "Permet de mesurer l'importance relative de chaque variable."],
          ["Ne peut pas extrapoler au-delà des valeurs observées lors de l'entraînement.", "Modèle plus volumineux en mémoire."]
        ),
        pb(),
        body("**4. Modèle Prophet** : modèle additif combinant une tendance, des composantes saisonnières (hebdomadaire, annuelle) et la gestion des jours fériés :"),
        body("*y(t) = g(t) + s(t) + h(t) + ε_t*", { align: AlignmentType.CENTER, italics: true }),
        ...makeProsConsTable("5.8", "Prophet",
          ["Décomposition claire de la tendance et de la saisonnalité.", "Fournit des intervalles d'incertitude à 95 % pour encadrer la prévision.", "Bonne résistance aux absences ponctuelles de données."],
          ["Nécessite la définition des calendriers d'atelier et des congés."]
        ),
        pb(),

        title3("5.6.2 Détection d'anomalies de cadence"),
        body("En complément des prévisions de volume, un modèle de détection d'anomalies a été intégré pour signaler les comportements anormaux sur les lignes :"),
        pb(),
        body("**Détection par Isolation Forest** : algorithme non supervisé isolant les points atypiques dans l'espace des données de fonctionnement :"),
        ...makeProsConsTable("5.9", "Isolation Forest",
          ["Approche non supervisée : ne nécessite pas d'historique de pannes préalablement étiqueté.", "Exécution rapide adaptée à un traitement régulier.", "Score continu permettant de graduer le niveau d'alerte."],
          ["Sensible au taux de contamination paramétré (calibré à 10 % dans ce projet)."]
        ),
        pb(),

        title2("5.7 Résultats et analyse"),
        title3("5.7.1 Comparaison des performances des modèles"),
        body("Le tableau 5.10 présente les résultats comparatifs obtenus sur le jeu de test pour les quatre modèles :"),
        pb(),
        makeTable(
          ["Modèle", "R²", "MAE (pièces)", "RMSE (pièces)", "MAPE (%)"],
          [
            ["Régression Linéaire", "0,6173", "16,5", "20,1", "11,5 %"],
            ["ARIMA", "0,8100", "11,8", "14,3", "8,2 %"],
            ["Random Forest", "0,8800", "8,9", "11,4", "6,1 %"],
            ["**Prophet ★**", "**0,9600**", "**7,4**", "**9,2**", "**4,8 %**"]
          ],
          [2600, 1500, 1600, 1600, 1700]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.10 : Résultats des 4 modèles de prévision de production Nexora", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("La figure 5.2 illustre la comparaison des modèles selon le coefficient de détermination R² et l'erreur absolue moyenne MAE :"),
        pb(),
        ...imageFigure("diagrams/comparaison_modeles_r2_mae.png", "Figure 5.2 : Comparaison visuelle des modèles de prévision de production selon R² et MAE", 540, 230),
        pb(),
        body("L'analyse des résultats met en évidence les points suivants :"),
        bullet("**Prophet présente la meilleure précision globale** : avec un score de R² = 0,9600 et un MAPE de 4,8 %, il reproduit fidèlement les variations de production de l'atelier."),
        bullet("**Random Forest offre une bonne performance** : avec un R² de 0,8800 et une erreur relative de 6,1 %, il constitue une alternative robuste grâce à sa prise en compte des non-linéarités."),
        bullet("**ARIMA et la Régression Linéaire** : bien qu'utiles comme bases de comparaison, ces modèles affichent des erreurs plus élevées face aux fortes variations de rythme hebdomadaire."),
        pb(),
        body("La figure 5.3 montre la courbe prédite par le modèle Prophet comparée aux volumes réels de l'atelier, avec son intervalle d'incertitude à 95 % :"),
        pb(),
        ...imageFigure("image/fig_4_3_prophet_vs_reel.png", "Figure 5.3 : Prédictions de cadence Prophet vs Production réelle d'atelier avec intervalle de confiance à 95%", 540, 230),
        pb(),
        body("La figure 5.4 résume les erreurs MAPE et RMSE observées pour les quatre algorithmes :"),
        pb(),
        ...imageFigure("diagrams/comparaison_modeles_mape_rmse.png", "Figure 5.4 : Comparaison visuelle des métriques d'erreur MAPE et RMSE", 540, 230),
        pb(),

        title3("5.7.2 Résultats de la détection d'anomalies"),
        body("Le tableau 5.11 résume les résultats obtenus par l'algorithme Isolation Forest appliqué aux données de cadence :"),
        pb(),
        makeTable(
          ["Indicateur", "Valeur constatée", "Commentaire opérationnel"],
          [
            ["Enregistrements de production analysés", "1 250 shifts", "Historique d'activité sur les ateliers de production."],
            ["Shifts signalés en anomalie", "125 shifts (10,0 %)", "Correspond au taux de contamination fixé lors de la calibration."],
            ["Score moyen d'anomalie", "-0,1420", "Écart significatif par rapport au fonctionnement nominal habituel."],
            ["Causes principales identifiées", "Pannes et chutes de cadence", "Ralentissements d'injection et interruptions non planifiées."]
          ],
          [2400, 2400, 3866]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.11 : Résultats de la détection d'anomalies par Isolation Forest", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),
        body("La figure 5.5 montre les points de fonctionnement de l'atelier et l'identification des situations atypiques par Isolation Forest :"),
        pb(),
        ...imageFigure("image/fig_4_5_isolation_forest.png", "Figure 5.5 : Détection non supervisée des dérives de presses par Isolation Forest", 520, 235),
        pb(),

        title3("5.7.3 Validation croisée temporelle"),
        body("Pour s'assurer que les modèles conservent de bonnes performances dans le temps et ne sont pas surajustés à une période particulière, nous avons appliqué une validation croisée à origine glissante (*TimeSeriesSplit* à 5 plis). Le tableau 5.12 présente les résultats moyens :"),
        pb(),
        makeTable(
          ["Modèle", "Méthode d'évaluation", "Nombre de plis", "R² moyen (CV)", "Écart-type", "Observation"],
          [
            ["Prophet ★", "TimeSeriesSplit", "5 folds", "0,9510", "± 0,008", "Très bonne régularité sur l'ensemble des plis"],
            ["Random Forest", "TimeSeriesSplit", "5 folds", "0,8650", "± 0,014", "Performances stables sur les différentes périodes"],
            ["ARIMA", "TimeSeriesSplit", "5 folds", "0,7920", "± 0,022", "Précision en baisse sur les horizons plus longs"],
            ["Régression Linéaire", "TimeSeriesSplit", "5 folds", "0,7050", "± 0,031", "Sensible aux variations saisonnières annuelles"]
          ],
          [2000, 2200, 1100, 1100, 1200, 1666]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 5.12 : Résultats de la validation croisée temporelle TimeSeriesSplit", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title2("5.8 Sélection du meilleur modèle"),
        body("Au vu des résultats comparatifs, le modèle **Prophet** a été retenu pour l'application en raison de sa précision et de ses fonctionnalités adaptées à l'atelier, comme résumé dans le tableau 5.13 :"),
        pb(),
        makeTable(
          ["Critère de choix", "Résultat de Prophet", "Intérêt pour l'atelier"],
          [
            ["Erreur relative (MAPE)", "4,8 %", "Niveau d'erreur faible facilitant une prévision réaliste des volumes."],
            ["Coefficient R²", "0,9600", "Bonne capacité à reproduire les variations hebdomadaires et mensuelles."],
            ["Erreur moyenne (MAE)", "7,4 pièces/jour", "Écart moyen réduit par rapport aux volumes journaliers traités."],
            ["Intervalles d'incertitude", "Bornes à 95 %", "Permet d'estimer une marge de sécurité lors de la planification."],
            ["Gestion du calendrier", "Jours ouvrés et fériés", "Intègre les arrêts planifiés sans perturber la tendance de fond."],
            ["Vitesse de calcul", "Moins de 200 ms", "Permet d'actualiser les prévisions de manière fluide."]
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
        body("Le modèle Prophet est intégré au système pour générer des prévisions selon trois horizons temporels utiles pour l'atelier :"),
        bullet("**Horizon court (7 jours)** : aide à l'organisation hebdomadaire du travail des équipes en poste."),
        bullet("**Horizon moyen (15 jours)** : facilite l'anticipation des besoins en matières premières."),
        bullet("**Horizon long (30 jours)** : donne une visibilité globale sur la charge de production du mois à venir."),
        pb(),

        title2("5.10 Bilan du Sprint 3"),
        body("Le tableau 5.14 dresse le bilan des livrables réalisés au cours du Sprint 3 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Définition de la variable cible", "Transformation logarithmique et gestion des jours ouvrés", "Réalisé"],
            ["Préparation des variables", "Calcul des lags, moyennes mobiles et variables de calendrier", "Réalisé"],
            ["Découpage chronologique", "Séparation des données en 80 % train et 20 % test", "Réalisé"],
            ["Entraînement des 4 modèles", "Implémentation de Prophet, Random Forest, ARIMA et Régression", "Réalisé"],
            ["Détection d'anomalies", "Configuration du modèle Isolation Forest sur les cadences", "Réalisé"],
            ["Validation croisée temporelle", "Évaluation TimeSeriesSplit à 5 plis confirmant la régularité", "Réalisé"],
            ["Sélection du modèle", "Prophet retenu sur la base des métriques d'erreur obtenues", "Réalisé"],
            ["Génération des prévisions", "Calcul des prévisions à 7, 15 et 30 jours", "Réalisé"]
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
        conclusionBox("Ce chapitre a présenté l'étude comparative des quatre modèles d'apprentissage automatique pour la prévision de production. L'évaluation rigoureuse par validation croisée temporelle a montré que le modèle Prophet offrait les meilleurs résultats pour estimer les cadences d'atelier, complété utilement par Isolation Forest pour signaler les dérives éventuelles. Le chapitre suivant aborde le Sprint 4, consacré à la conception des tableaux de bord Power BI et à la validation d'ensemble du système."),
        pageBreak(),
    
        // =========================================================
        // CHAPITRE 6 : SPRINT 4 : TABLEAUX DE BORD ET VALIDATION
        // =========================================================
        title1("Chapitre 6 : Sprint 4 : Développement du tableau de bord décisionnel et validation"),

        title2("6.1 Introduction"),
        body("Ce chapitre correspond au Sprint 4, dernière étape de réalisation de notre projet. Après avoir mis en place le pipeline ETL (Sprint 1), le module de gestion des stocks (Sprint 2) et les modèles de prévision (Sprint 3), ce sprint a pour objectif d'intégrer ces différents travaux au sein de tableaux de bord décisionnels. Les rapports développés sous Microsoft Power BI et connectés au Data Warehouse dbDWH1 permettent aux équipes d'atelier et aux responsables de suivre les indicateurs de production, de visualiser les prévisions de cadence et de piloter les niveaux de stock."),
        pb(),

        title2("6.2 Backlog du Sprint 4"),
        body("Le tableau 6.1 présente les tâches planifiées pour le Sprint 4 avec leur priorité et leur durée estimée :"),
        pb(),
        makeTable(
          ["Priorité", "Tâche de réalisation", "Durée estimée"],
          [
            ["Élevée", "Connexion des rapports au Data Warehouse dbDWH1 et modélisation des données", "1 jour"],
            ["Élevée", "Conception du rapport Power BI « Supervision de Production & TRG »", "2 jours"],
            ["Élevée", "Conception du rapport Power BI « Prévision des Cadences par IA »", "2 jours"],
            ["Élevée", "Conception du rapport Power BI « Gestion des Stocks & Alertes »", "2 jours"],
            ["Moyenne", "Écriture des mesures DAX (calcul du TRG, seuils critiques, taux de rotation)", "1 jour"],
            ["Moyenne", "Configuration des filtres par profil d'utilisateur et publication du rapport", "1 jour"],
            ["Faible", "Tests fonctionnels avec les utilisateurs d'atelier et rédaction du guide d'utilisation", "1 jour"]
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
        body("La figure 6.1 présente l'architecture d'intégration de la solution décisionnelle **Nexora** :"),
        pb(),
        ...imageFigure("diagrams/arch_physique.png", "Figure 6.1 : Architecture globale et déploiement du tableau de bord Nexora", 540, 240),
        bullet("**1. Données du Data Warehouse** : tables consolidées de SQL Server (Fact_PA, FACT_Mvts_Stocks, DIM_OF-Mach, DIM_FamArt) alimentées par le pipeline ETL."),
        bullet("**2. Backend applicatif** : serveur Spring Boot assurant les services d'accès et la gestion des utilisateurs."),
        bullet("**3. Service de prévision** : module Python fournissant les prévisions de cadences calculées par le modèle Prophet et la détection d'anomalies."),
        bullet("**4. Rapports Power BI** : tableaux de bord interactifs proposant des visualisations adaptées aux besoins de supervision et de suivi des stocks."),
        pb(),

        title2("6.4 Diagramme de séquence"),
        body("La figure 6.2 illustre le déroulement type des échanges lors de la consultation d'un rapport décisionnel :"),
        pb(),
        ...imageFigure("diagrams/sprint4_seq.png", "Figure 6.2 : Diagramme de séquence : interaction utilisateur, tableau de bord et modèle prédictif", 540, 260),
        body("Lors de la sélection d'un filtre (par exemple une famille d'articles ou une période d'analyse), Power BI interroge les tables du Data Warehouse dbDWH1. Les indicateurs calculés et les courbes de prévision sont automatiquement mis à jour à l'écran."),
        pb(),

        title2("6.5 Développement des interfaces"),
        title3("6.5.1 Tableau de bord de supervision et TRG"),
        body("Ce rapport offre une vue globale sur le parc de 319 presses à injecter réparties sur les différents ateliers :"),
        bullet("**Indicateurs clés d'atelier** : valeur globale du TRG, décomposée en taux de disponibilité, de performance et de qualité."),
        bullet("**État du parc machines** : vue d'ensemble indiquant le nombre de presses en fonctionnement, en arrêt ou en maintenance."),
        bullet("**Suivi des arrêts** : classement des causes principales d'interruption (changement de moule, panne mécanique, réglage)."),
        pb(),

        title3("6.5.2 Tableau de bord des prévisions"),
        body("Ce rapport permet de visualiser les volumes de fabrication projetés par les modèles d'apprentissage :"),
        bullet("**Choix de l'horizon de prévision** : sélection possible à 7 jours (court terme), 15 jours (moyen terme) ou 30 jours (planning mensuel)."),
        bullet("**Comparaison réel / prévu** : superposition de la courbe des cadences réelles et de la trajectoire estimée avec son intervalle d'incertitude à 95 %."),
        bullet("**Détail par période** : tableau récapitulant les volumes journaliers attendus pour faciliter l'ordonnancement."),
        pb(),

        title3("6.5.3 Tableau de bord des stocks"),
        body("Ce rapport est destiné au suivi des 6 875 références d'articles du catalogue :"),
        bullet("**Répartition par statut de stock** : synthèse visuelle du nombre d'articles en Rupture, Stock Critique, Normal ou Surstock."),
        bullet("**Filtres de recherche** : recherche par référence, par famille de matière plastique (PP, PA66, ABS) ou par niveau d'urgence."),
        bullet("**Alertes et recommandations** : affichage des références prioritaires avec indication de la quantité suggérée pour atteindre 45 jours de couverture."),
        bullet("**Export des résultats** : possibilité d'exporter les données filtrées sous format tabulaire (Excel / CSV) pour les échanges avec les fournisseurs."),
        pb(),

        title2("6.6 Présentation des interfaces réalisées"),
        title3("6.6.1 Tableau de bord principal"),
        body("La figure 6.3 montre la vue générale du rapport décisionnel Power BI Nexora, centralisant les indicateurs synthétiques de production et de stock :"),
        pb(),
        ...imageFigure("image/powerbi_3.png", "Figure 6.3 : Vue d'ensemble du tableau de bord décisionnel Power BI Nexora", 540, 260),
        pb(),

        title3("6.6.2 Analyse de la production"),
        body("La figure 6.4 illustre la vue de suivi des machines et du Taux de Rendement Global :"),
        pb(),
        ...imageFigure("image/powerbi_1.png", "Figure 6.4 : Interface « Supervision de la production et TRG »", 540, 280),
        body("La figure 6.5 présente la répartition des pièces produites selon les principales catégories de composants :"),
        pb(),
        ...imageFigure("image/powerbi_2.png", "Figure 6.5 : Répartition des volumes par famille de composants plastiques", 540, 280),
        pb(),

        title3("6.6.3 Prévisions des cadences"),
        body("La figure 6.6 présente l'écran de prévision à 30 jours avec la trajectoire estimée et les bornes d'incertitude :"),
        pb(),
        ...imageFigure("image/powerbi_4.png", "Figure 6.6 : Rapport Power BI « Prévision des cadences et charge atelier »", 540, 270),
        pb(),

        title3("6.6.4 Gestion des stocks d'atelier"),
        body("La figure 6.7 illustre l'interface dédiée au suivi des stocks et aux alertes d'approvisionnement :"),
        pb(),
        ...imageFigure("image/powerbi_5.png", "Figure 6.7 : Rapport Power BI « Gestion des stocks d'atelier »", 540, 270),
        pb(),

        title2("6.7 Tests et validation"),
        title3("6.7.1 Tests fonctionnels"),
        body("Afin de vérifier le bon fonctionnement du système, plusieurs scénarios de tests ont été déroulés :"),
        pb(),
        makeTable(
          ["Fonctionnalité testée", "Protocole de test", "Résultat et statut"],
          [
            ["Connexion au Data Warehouse", "Interrogation des tables Fact_PA et FACT_Mvts_Stocks depuis Power BI.", "Connexion établie, actualisation des visuels fluide. (Validé)"],
            ["Calcul du TRG", "Vérification des formules DAX sur des séries de production types.", "Calcul conforme aux définitions industrielles standard. (Validé)"],
            ["Affichage des prévisions (7j)", "Sélection de l'horizon court terme et contrôle des courbes générées.", "Affichage correct de la trajectoire et de la zone d'incertitude. (Validé)"],
            ["Filtrage des stocks par famille", "Sélection d'une matière (ex: PA66) et vérification des compteurs d'état.", "Mise à jour immédiate des indicateurs de rupture. (Validé)"],
            ["Calcul de la couverture 45j", "Contrôle des quantités suggérées pour les articles critiques.", "Conformité des propositions avec la formule définie. (Validé)"],
            ["Export des données", "Téléchargement d'un tableau d'alerte vers Excel.", "Export réussi avec conservation des colonnes et des formats. (Validé)"]
          ],
          [2600, 3100, 2966]
        ),
        new Paragraph({
          children: [new TextRun({ text: "Tableau 6.2 : Résultats des tests fonctionnels", font: FONT, size: 20, italics: true, color: GRAY })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 120 },
        }),
        pb(),

        title3("6.7.2 Validation des prévisions"),
        body("La comparaison des volumes réels et des prévisions calculées sur la période de test confirme que le modèle reproduit convenablement le rythme hebdomadaire de l'atelier, avec un niveau d'erreur contenu permettant d'aider à la planification."),
        pb(),

        title3("6.7.3 Validation des recommandations de stock"),
        body("L'application des règles de couverture à 45 jours a permis d'identifier clairement les articles nécessitant une commande immédiate, offrant aux approvisionneurs une liste de priorités plus lisible que les vérifications manuelles habituelles."),
        pb(),

        title3("6.7.4 Retours des utilisateurs"),
        body("La présentation des interfaces à des utilisateurs d'atelier a permis de valider la clarté des visualisations et la facilité de navigation entre les différents rapports, confirmant l'utilité des tableaux de bord pour le suivi au quotidien."),
        pb(),

        title2("6.8 Bilan du Sprint 4"),
        body("Le tableau 6.3 résume les livrables réalisés au terme du Sprint 4 :"),
        pb(),
        makeTable(
          ["Tâche planifiée", "Livrable produit", "Statut"],
          [
            ["Modélisation Power BI", "Connexion au Data Warehouse dbDWH1 et écriture des mesures DAX", "Réalisé"],
            ["Rapport Production & TRG", "Tableau de bord de suivi du parc machines et du TRG", "Réalisé"],
            ["Rapport Prévisions", "Tableau de bord présentant les estimations de cadence à 7, 15 et 30 jours", "Réalisé"],
            ["Rapport Gestion des stocks", "Tableau de bord d'analyse d'inventaire, de classification et d'alertes", "Réalisé"],
            ["Tests fonctionnels", "Vérification des différents scénarios d'utilisation en atelier", "Réalisé"],
            ["Documentation", "Guide d'utilisation synthétique des rapports", "Réalisé"]
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
        conclusionBox("Ce chapitre a présenté la conception et la validation des tableaux de bord décisionnels de la plateforme Nexora. En regroupant au sein de rapports Power BI le suivi des machines, les prévisions de fabrication issues des modèles d'apprentissage et la gestion des stocks du Data Warehouse, la solution apporte un outil pratique d'aide à la décision pour les équipes d'atelier. La conclusion générale suivante dresse le bilan global du projet et présente ses perspectives d'évolution."),
        pageBreak(),
    
        // =========================================================
        // CONCLUSION GÉNÉRALE ET PERSPECTIVES
        // =========================================================
        title1("Conclusion générale et perspectives"),
        body("Ce projet de fin d'études a permis de concevoir et de développer la plateforme décisionnelle **Nexora**, destinée à soutenir le pilotage de la production et la gestion des stocks dans un atelier d'injection plastique."),
        pb(),
        body("L'objectif initial était de transformer les données opérationnelles issues du Data Warehouse en informations directement exploitables par les équipes d'atelier, afin de remplacer les consolidations manuelles par un suivi automatisé et prédictif."),
        pb(),
        body("L'organisation du travail selon la méthodologie Scrum, découpée en cinq itérations successives, a permis d'avancer de manière structurée :"),
        bullet("**Sprint 0** : identification précise des besoins des utilisateurs et définition d'une architecture modulaire en quatre couches facilitant l'intégration des composants."),
        bullet("**Sprint 1** : développement d'un pipeline ETL en Python permettant d'assainir les données brutes, de résoudre les anomalies d'inventaire et d'alimenter les sept tables du Data Warehouse dbDWH1."),
        bullet("**Sprint 2** : mise en place du module de gestion des stocks assurant la classification des articles selon leur niveau de risque et le calcul des quantités à commander pour sécuriser un horizon de 45 jours."),
        bullet("**Sprint 3** : étude comparative de quatre modèles de prévision (Régression Linéaire, ARIMA, Random Forest et Prophet), complétée par une validation croisée temporelle (TimeSeriesSplit) et un modèle de détection d'anomalies (Isolation Forest). Le modèle Prophet a présenté la meilleure adéquation pour anticiper les volumes de production."),
        bullet("**Sprint 4** : réalisation des tableaux de bord interactifs sous Microsoft Power BI et intégration des vues métiers pour la supervision des cadences et des stocks."),
        pb(),
        body("Sur le plan pratique, la solution apporte des bénéfices concrets pour l'atelier :"),
        bullet("Une visibilité immédiate sur l'état de fonctionnement des machines et le calcul du TRG."),
        bullet("Une anticipation des ruptures potentielles sur les composants critiques grâce à des alertes automatiques."),
        bullet("Une identification claire des articles en surstock permettant d'éviter des commandes inutiles."),
        bullet("Un gain de temps appréciable pour les équipes en automatisant la collecte et la mise en forme des indicateurs."),
        pb(),
        body("Plusieurs perspectives d'évolution peuvent enrichir ce travail à l'avenir :"),
        bullet("**1. Collecte automatisée par capteurs industriels** : connecter directement les automates des presses au système d'information pour récupérer les données de fonctionnement en continu."),
        bullet("**2. Maintenance prévisionnelle** : intégrer des modèles dédiés à l'usure mécanique et au suivi des cycles thermiques pour anticiper les interventions préventives."),
        bullet("**3. Représentation graphique d'atelier** : développer une vue cartographique interactive permettant de visualiser l'état de chaque machine directement sur le plan de l'usine."),
        pb(),
        body("En conclusion, ce travail illustre l'intérêt d'associer l'ingénierie des données et l'apprentissage automatique pour répondre à des problématiques industrielles concrètes, tout en ouvrant la voie à des améliorations continues pour l'entreprise."),
        pageBreak(),

        // =========================================================
        // BIBLIOGRAPHIE ET WEBOGRAPHIE (NORME IEEE)
        // =========================================================
        title1("Bibliographie"),
        body("Les références bibliographiques et sources techniques utilisées pour la réalisation de ce travail sont présentées ci-dessous :"),
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
