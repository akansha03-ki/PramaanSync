import { jsPDF } from 'jspdf';
import { buildFullDossierDocuments, buildSectionDocument } from './reportContent';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 18;
const MARGIN_TOP = 22;
const MARGIN_BOTTOM = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const COLORS = {
  title: [15, 23, 42],
  muted: [100, 116, 139],
  body: [51, 65, 85],
  line: [226, 232, 240],
  accent: [180, 83, 9],
  noteBg: [255, 251, 235]
};

const addHeaderFooter = (doc, { caseId, sectionTitle, generatedAt, page, pages }) => {
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, 12, PAGE_WIDTH - MARGIN_X, 12);

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.title);
  doc.text('PramaanSync Forensic Dossier', MARGIN_X, 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(caseId || '', PAGE_WIDTH - MARGIN_X, 9, { align: 'right' });

  doc.setDrawColor(...COLORS.line);
  doc.line(MARGIN_X, PAGE_HEIGHT - 12, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 12);
  doc.text(sectionTitle || '', MARGIN_X, PAGE_HEIGHT - 7);
  doc.text(`Generated ${generatedAt}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 7, { align: 'center' });
  doc.text(`Page ${page} of ${pages}`, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 7, { align: 'right' });
};

const ensureSpace = (ctx, needed) => {
  if (ctx.y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
    ctx.doc.addPage();
    ctx.y = MARGIN_TOP;
    ctx.pageTitles.push(ctx.sectionTitle);
  }
};

const wrap = (doc, text, fontSize, width = CONTENT_WIDTH) => {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(String(text ?? ''), width);
};

const drawTable = (ctx, headers, rows) => {
  const colCount = headers.length;
  const colWidth = CONTENT_WIDTH / colCount;
  const cellPad = 1.6;
  const fontSize = colCount > 5 ? 6.5 : 7.5;

  ctx.doc.setFontSize(fontSize);

  const measureRow = (cells, header = false) => {
    ctx.doc.setFont('helvetica', header ? 'bold' : 'normal');
    let height = 6;
    cells.forEach((cell) => {
      const lines = wrap(ctx.doc, cell, fontSize, colWidth - cellPad * 2);
      height = Math.max(height, lines.length * 3.2 + 3);
    });
    return height;
  };

  const paintRow = (cells, isHeader) => {
    const rowHeight = measureRow(cells, isHeader);
    ensureSpace(ctx, rowHeight + 1);
    if (isHeader) {
      ctx.doc.setFillColor(248, 250, 252);
      ctx.doc.rect(MARGIN_X, ctx.y, CONTENT_WIDTH, rowHeight, 'F');
    }
    ctx.doc.setDrawColor(...COLORS.line);
    ctx.doc.rect(MARGIN_X, ctx.y, CONTENT_WIDTH, rowHeight);

    cells.forEach((cell, index) => {
      const x = MARGIN_X + index * colWidth;
      ctx.doc.line(x, ctx.y, x, ctx.y + rowHeight);
      ctx.doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
      ctx.doc.setTextColor(...(isHeader ? COLORS.title : COLORS.body));
      const lines = wrap(ctx.doc, cell, fontSize, colWidth - cellPad * 2);
      ctx.doc.text(lines, x + cellPad, ctx.y + 3.4);
    });
    ctx.y += rowHeight;
  };

  paintRow(headers, true);
  rows.forEach((row) => paintRow(row, false));
  ctx.y += 4;
};

const renderBlocks = (ctx, blocks) => {
  blocks.forEach((block) => {
    if (block.type === 'heading') {
      ensureSpace(ctx, 14);
      ctx.doc.setFont('times', 'bold');
      ctx.doc.setFontSize(13);
      ctx.doc.setTextColor(...COLORS.title);
      ctx.doc.text(block.text, MARGIN_X, ctx.y);
      ctx.y += 2;
      ctx.doc.setDrawColor(...COLORS.line);
      ctx.doc.line(MARGIN_X, ctx.y, MARGIN_X + 46, ctx.y);
      ctx.y += 7;
    } else if (block.type === 'paragraph') {
      ctx.doc.setFont('times', 'normal');
      const lines = wrap(ctx.doc, block.text, 10);
      const height = lines.length * 4.6;
      ensureSpace(ctx, height + 3);
      ctx.doc.setFontSize(10);
      ctx.doc.setTextColor(...COLORS.body);
      ctx.doc.text(lines, MARGIN_X, ctx.y);
      ctx.y += height + 3;
    } else if (block.type === 'note') {
      ctx.doc.setFont('helvetica', 'italic');
      const lines = wrap(ctx.doc, block.text, 9, CONTENT_WIDTH - 6);
      const height = lines.length * 4.2 + 6;
      ensureSpace(ctx, height + 3);
      ctx.doc.setFillColor(...COLORS.noteBg);
      ctx.doc.rect(MARGIN_X, ctx.y - 3, CONTENT_WIDTH, height, 'F');
      ctx.doc.setFontSize(9);
      ctx.doc.setTextColor(...COLORS.accent);
      ctx.doc.text(lines, MARGIN_X + 3, ctx.y + 2);
      ctx.y += height + 3;
    } else if (block.type === 'table') {
      drawTable(ctx, block.headers, block.rows);
    } else if (block.type === 'kv') {
      block.rows.forEach(([label, value]) => {
        ensureSpace(ctx, 8);
        ctx.doc.setFont('helvetica', 'bold');
        ctx.doc.setFontSize(8.5);
        ctx.doc.setTextColor(...COLORS.muted);
        ctx.doc.text(String(label).toUpperCase(), MARGIN_X, ctx.y);
        ctx.doc.setFont('times', 'normal');
        ctx.doc.setFontSize(10);
        ctx.doc.setTextColor(...COLORS.body);
        const isLong = String(value ?? '').length > 48;
        const fontSize = isLong ? 8 : 10;
        const lines = wrap(ctx.doc, value, fontSize, CONTENT_WIDTH - 4);
        ctx.doc.setFontSize(fontSize);
        ctx.doc.text(lines, MARGIN_X, ctx.y + 4.5);
        ctx.y += lines.length * (isLong ? 3.6 : 4.4) + 6;
      });
    }
  });
};

const renderDocument = (ctx, document, { isFirst }) => {
  ctx.sectionTitle = document.title;
  if (!isFirst) {
    ctx.doc.addPage();
    ctx.y = MARGIN_TOP;
    ctx.pageTitles.push(document.title);
  }

  ctx.doc.setFont('times', 'bold');
  ctx.doc.setFontSize(18);
  ctx.doc.setTextColor(...COLORS.title);
  const titleLines = wrap(ctx.doc, document.title, 18);
  ctx.doc.text(titleLines, MARGIN_X, ctx.y);
  ctx.y += titleLines.length * 8 + 2;

  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.setFontSize(9);
  ctx.doc.setTextColor(...COLORS.muted);
  ctx.doc.text(`Case ${document.caseId}  ·  ${new Date(document.generatedAt).toLocaleString()}`, MARGIN_X, ctx.y);
  ctx.y += 8;

  renderBlocks(ctx, document.blocks || []);
};

const finalizeAndSave = (doc, pageTitles, filename, caseId, generatedAt) => {
  const pages = doc.getNumberOfPages();
  const stamp = new Date(generatedAt).toLocaleString();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    const sectionTitle = pageTitles[page - 1] || pageTitles[pageTitles.length - 1] || 'Forensic Report';
    addHeaderFooter(doc, {
      caseId,
      sectionTitle,
      generatedAt: stamp,
      page,
      pages
    });
  }
  doc.save(filename);
};

export const downloadSectionPdf = (sectionId, report, options = {}) => {
  const document = buildSectionDocument(sectionId, report, options);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ctx = { doc, y: MARGIN_TOP, sectionTitle: document.title, pageTitles: [document.title] };
  renderDocument(ctx, document, { isFirst: true });
  const safeTitle = document.title.replace(/[^\w]+/g, '_');
  finalizeAndSave(
    doc,
    ctx.pageTitles,
    `${report.caseId}_${safeTitle}.pdf`,
    report.caseId,
    document.generatedAt
  );
};

export const downloadFullReportPdf = (report) => {
  const documents = buildFullDossierDocuments(report);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const firstTitle = documents[0]?.title || 'Forensic Report';
  const ctx = { doc, y: MARGIN_TOP, sectionTitle: firstTitle, pageTitles: [firstTitle] };
  documents.forEach((document, index) => {
    renderDocument(ctx, document, { isFirst: index === 0 });
  });
  finalizeAndSave(
    doc,
    ctx.pageTitles,
    `${report.caseId}_Full_Forensic_Report.pdf`,
    report.caseId,
    report.generatedAt || new Date().toISOString()
  );
};
