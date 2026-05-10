import { Document, Packer, Paragraph, TextRun } from "docx";

export async function buildDocxBuffer(title: string, body: string): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 32 })],
    }),
    new Paragraph({ children: [new TextRun({ text: "" })] }),
  ];

  for (const block of body.split(/\n\n+/)) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: block.trim() })],
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
