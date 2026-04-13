import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildDocxBuffer } from "@/lib/export/docx-text";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "Export";
    const content = typeof body.content === "string" ? body.content : "";
    const filename =
      typeof body.filename === "string" && body.filename.endsWith(".docx")
        ? body.filename
        : "cvscan-export.docx";

    if (!content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const buf = await buildDocxBuffer(title, content);

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
      },
    });
  } catch (error) {
    console.error("DOCX export error:", error);
    return NextResponse.json({ error: "Failed to build DOCX" }, { status: 500 });
  }
}
