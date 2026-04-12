import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const LINE_HEIGHT = 14;
const FONT_SIZE = 11;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;

function wrapLine(font: { widthOfTextAtSize: (t: string, s: number) => number }, text: string): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (!w) continue;
    const trial = current ? `${current} ${w}` : w;
    if (font.widthOfTextAtSize(trial, FONT_SIZE) <= MAX_WIDTH) {
      current = trial;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function buildPdfBytes(title: string, body: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const titleLines = wrapLine(bold, title);
  for (const line of titleLines) {
    if (y < MARGIN + LINE_HEIGHT * 3) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    page.drawText(line, {
      x: MARGIN,
      y,
      size: 13,
      font: bold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= LINE_HEIGHT + 4;
  }
  y -= 8;

  const paragraphs = body.split(/\n\n+/);
  for (const para of paragraphs) {
    for (const rawLine of para.split("\n")) {
      const lines = wrapLine(font, rawLine.trim() || " ");
      for (const line of lines) {
        if (y < MARGIN + LINE_HEIGHT) {
          page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          y = PAGE_HEIGHT - MARGIN;
        }
        page.drawText(line, {
          x: MARGIN,
          y,
          size: FONT_SIZE,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= LINE_HEIGHT;
      }
    }
    y -= LINE_HEIGHT * 0.5;
  }

  return pdf.save();
}
