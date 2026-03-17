import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; format: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, format: rawFormat } = await params;
    const format = rawFormat.toLowerCase();

    if (format !== 'pdf' && format !== 'docx') {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    const supabase = createClient();

    // Fetch Job Pack
    const { data: jobPack, error } = await (supabase
      .from('job_packs')
      .select as any)('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error || !jobPack) {
      return NextResponse.json({ error: 'Job pack not found' }, { status: 404 });
    }

    const { company, job_title, resume_version, cover_letter } = jobPack;
    const documentName = `${company}_${job_title}_Application`.replace(/\s+/g, '_');

    // Generate DOCX
    if (format === 'docx') {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Application for ${job_title} at ${company}`,
                    bold: true,
                    size: 32,
                  }),
                ],
                spacing: { after: 400 },
              }),
              new Paragraph({
                children: [new TextRun({ text: "COVER LETTER", bold: true, size: 28 })],
                spacing: { before: 200, after: 200 },
              }),
              ...(cover_letter || "No cover letter.").split('\n').map(
                (line: string) => new Paragraph({ text: line, spacing: { after: 120 } })
              ),
              new Paragraph({
                children: [new TextRun({ text: "RESUME", bold: true, size: 28 })],
                spacing: { before: 400, after: 200 },
                pageBreakBefore: true,
              }),
              ...(resume_version || "No resume tailored.").split('\n').map(
                (line: string) => new Paragraph({ text: line, spacing: { after: 120 } })
              ),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      return new Response(buffer as any, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${documentName}.docx"`,
        },
      });
    }

    // Generate PDF
    if (format === 'pdf') {
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      let y = height - 50;

      const drawText = (text: string, font: any, size: number, options: any = {}) => {
        if (y < 50) {
          page = pdfDoc.addPage();
          y = height - 50;
        }
        page.drawText(text, { x: 50, y, size, font, color: rgb(0, 0, 0), ...options });
        y -= (size + 5);
      };

      const drawLines = (textContext: string) => {
        const lines = textContext.split('\n');
        for (const line of lines) {
           // Basic wrap if too long
           if (line.length > 80) {
              let currentLine = '';
              const words = line.split(' ');
              for (const word of words) {
                 if ((currentLine + word).length > 80) {
                    drawText(currentLine, timesRomanFont, 10);
                    currentLine = word + ' ';
                 } else {
                    currentLine += word + ' ';
                 }
              }
              if (currentLine) drawText(currentLine, timesRomanFont, 10);
           } else {
             drawText(line, timesRomanFont, 10);
           }
        }
      }

      drawText(`Application for ${job_title} at ${company}`, timesRomanBoldFont, 18);
      y -= 20;

      drawText("COVER LETTER", timesRomanBoldFont, 14);
      y -= 10;
      drawLines(cover_letter || "No cover letter.");

      page = pdfDoc.addPage();
      y = height - 50;
      
      drawText("RESUME", timesRomanBoldFont, 14);
      y -= 10;
      drawLines(resume_version || "No resume tailored.");

      const pdfBytes = await pdfDoc.save();

      return new Response(pdfBytes as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${documentName}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export document' },
      { status: 500 }
    );
  }
}
