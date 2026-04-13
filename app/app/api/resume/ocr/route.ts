import Tesseract from "tesseract.js";
import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/applications/parseResume";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    // Convert Blob to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run OCR using Tesseract.js
    const { data } = await Tesseract.recognize(buffer, "eng");
    const parsed = parseResumeText(data.text);
    return NextResponse.json({ text: data.text, parsed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "OCR failed" }, { status: 500 });
  }
}
