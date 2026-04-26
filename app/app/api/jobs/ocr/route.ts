import Tesseract from "tesseract.js";
import { NextRequest, NextResponse } from "next/server";
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

function extractJobAdHints(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const companyLine = lines.find((line) => /^company\s*[:-]/i.test(line));
  const titleLine = lines.find((line) => /^(job title|role|position)\s*[:-]/i.test(line));

  const title =
    titleLine?.replace(/^(job title|role|position)\s*[:-]\s*/i, "").trim() ||
    lines.find((line) => line.length <= 90 && /manager|engineer|developer|assistant|pilot|officer|coordinator|analyst|advisor|administrator|nurse|teacher|driver/i.test(line)) ||
    lines[0] ||
    "";

  const company =
    companyLine?.replace(/^company\s*[:-]\s*/i, "").trim() ||
    lines.find((line) => /pty|ltd|limited|group|health|care|aviation|airlines|university|council|government/i.test(line)) ||
    "";

  return {
    title: title.slice(0, 120),
    company: company.slice(0, 120),
  };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image is too large. Please upload a screenshot under 8 MB." },
      { status: 400 }
    );
  }

  if (file.type && !file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Upload an image or screenshot of the job ad." },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { data } = await Tesseract.recognize(buffer, "eng");
    const text = cleanOcrText(data.text);

    if (text.length < 20) {
      return NextResponse.json(
        { error: "Could not read enough text from that image. Try a clearer screenshot or paste the job ad." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, parsed: extractJobAdHints(text) });
  } catch (error) {
    console.error("Job ad OCR failed:", error);
    return NextResponse.json({ error: "OCR failed. Try a clearer screenshot or paste the job ad." }, { status: 500 });
  }
}
