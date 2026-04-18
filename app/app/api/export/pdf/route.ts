import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildPdfBytes } from "@/lib/export/pdf-text";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "Export";
    const content = typeof body.content === "string" ? body.content : "";
    const reviewAcknowledged = body.review_acknowledged === true;
    const filename =
      typeof body.filename === "string" && body.filename.endsWith(".pdf")
        ? body.filename
        : "cvscan-export.pdf";

    if (!content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    if (!reviewAcknowledged) {
      return NextResponse.json(
        { error: "Review the AI-generated content and confirm it is accurate before export." },
        { status: 400 }
      );
    }

    const bytes = await buildPdfBytes(title, content);

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Failed to build PDF" }, { status: 500 });
  }
}
