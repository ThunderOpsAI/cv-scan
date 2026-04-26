import Tesseract from "tesseract.js";
import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/applications/parseResume";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function cleanOcrText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image is too large. Please upload a photo or screenshot under 8 MB." },
      { status: 400 }
    );
  }

  if (file.type && !file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Upload a photo or screenshot image. Paste text for PDF or DOCX resumes for now." },
      { status: 400 }
    );
  }

  try {
    // Convert Blob to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run OCR using Tesseract.js
    const { data } = await Tesseract.recognize(buffer, "eng");
    const text = cleanOcrText(data.text);

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Could not read enough resume text from that image. Try a clearer photo or paste the resume text." },
        { status: 422 }
      );
    }

    const parsed = parseResumeText(text);
    return NextResponse.json({ text, parsed });
  } catch (error) {
    console.error("Resume OCR failed:", error);
    return NextResponse.json({ error: "OCR failed. Try a clearer photo or paste the resume text." }, { status: 500 });
  }
}
