import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; format: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, format } = await params;

    if (format !== 'pdf' && format !== 'docx') {
      return NextResponse.json(
        { error: 'Invalid format. Use pdf or docx' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get job pack
    const { data: jobPack, error } = await (supabase
      .from('job_packs')
      .select as any)('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error || !jobPack) {
      return NextResponse.json(
        { error: 'Job pack not found' },
        { status: 404 }
      );
    }

    // Build content
    const resumeContent = jobPack.resume_version || 'No tailored resume available';
    const coverLetterContent = jobPack.cover_letter || 'No cover letter available';

    if (format === 'pdf') {
      // Generate PDF using simple text-based approach
      const pdfContent = await generatePDF(jobPack, resumeContent, coverLetterContent);
      
      return new NextResponse(pdfContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${jobPack.company}-${jobPack.job_title}-pack.pdf"`,
        },
      });
    } else {
      // Generate DOCX
      const docxContent = await generateDOCX(jobPack, resumeContent, coverLetterContent);
      
      return new NextResponse(docxContent, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${jobPack.company}-${jobPack.job_title}-pack.docx"`,
        },
      });
    }
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export job pack' },
      { status: 500 }
    );
  }
}

async function generatePDF(
  jobPack: any,
  resumeContent: string,
  coverLetterContent: string
): Promise<Buffer> {
  // Simple PDF generation without external dependencies
  // This creates a basic PDF structure
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >>
endobj
4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 7 0 R /Resources << /Font << /F1 6 0 R >> >> >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${getStreamLength(resumeContent, jobPack)} >>
stream
BT
/F1 16 Tf
50 750 Td
(TAILORED RESUME) Tj
/F1 10 Tf
0 -30 Td
(${jobPack.job_title} at ${jobPack.company}) Tj
0 -20 Td
(ATS Score: ${jobPack.ats_score || 'N/A'}%) Tj
0 -30 Td
${formatTextForPDF(resumeContent)}
ET
endstream
endobj
7 0 obj
<< /Length ${getStreamLength(coverLetterContent, jobPack)} >>
stream
BT
/F1 16 Tf
50 750 Td
(COVER LETTER) Tj
/F1 10 Tf
0 -30 Td
(${jobPack.job_title} at ${jobPack.company}) Tj
0 -30 Td
${formatTextForPDF(coverLetterContent)}
ET
endstream
endobj
xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000264 00000 n 
0000000413 00000 n 
0000000363 00000 n 
0000000500 00000 n 
trailer
<< /Size 8 /Root 1 0 R >>
startxref
600
%%EOF`;

  return Buffer.from(content, 'utf-8');
}

function getStreamLength(content: string, jobPack: any): number {
  return 200 + content.length;
}

function formatTextForPDF(text: string): string {
  // Escape special PDF characters and format for display
  const lines = text.split('\n').slice(0, 50); // Limit lines
  return lines
    .map((line, i) => {
      const escaped = line
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .substring(0, 80); // Limit line length
      return `(${escaped}) Tj\n0 -12 Td`;
    })
    .join('\n');
}

async function generateDOCX(
  jobPack: any,
  resumeContent: string,
  coverLetterContent: string
): Promise<Buffer> {
  // Simple DOCX generation - returns a basic Open XML structure
  // For production, use the 'docx' library
  
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>TAILORED RESUME</w:t></w:r></w:p>
    <w:p><w:r><w:t>${jobPack.job_title} at ${jobPack.company}</w:t></w:r></w:p>
    <w:p><w:r><w:t>ATS Score: ${jobPack.ats_score || 'N/A'}%</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    ${resumeContent.split('\n').map(line => `<w:p><w:r><w:t>${escapeXml(line)}</w:t></w:r></w:p>`).join('\n')}
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>---</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>COVER LETTER</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    ${coverLetterContent.split('\n').map(line => `<w:p><w:r><w:t>${escapeXml(line)}</w:t></w:r></w:p>`).join('\n')}
  </w:body>
</w:document>`;

  // Return as simple text for now - in production, create proper DOCX zip structure
  const textContent = `TAILORED RESUME\n${jobPack.job_title} at ${jobPack.company}\nATS Score: ${jobPack.ats_score || 'N/A'}%\n\n${resumeContent}\n\n---\n\nCOVER LETTER\n\n${coverLetterContent}`;
  
  return Buffer.from(textContent, 'utf-8');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
