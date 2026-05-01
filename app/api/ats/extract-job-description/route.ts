import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { gemini } from "@/lib/gemini";

const MAX_BASE64_SIZE = 10_000_000;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image, mimeType } = await req.json();

    if (!image || !mimeType) {
      return NextResponse.json({ error: "Image data is required." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ error: "Unsupported image format." }, { status: 400 });
    }

    if (typeof image !== "string" || image.length > MAX_BASE64_SIZE) {
      return NextResponse.json({ error: "Image is too large to process." }, { status: 400 });
    }

    const prompt = [
      {
        text:
          "Extract the complete job description text from this image. Return plain text only. Preserve bullet points and paragraph breaks. Do not summarize or add commentary.",
      },
      {
        inlineData: {
          mimeType,
          data: image,
        },
      },
    ];

    const result = await gemini.generateContent(prompt as any);
    const text = result.response.text().trim();

    if (!text) {
      return NextResponse.json(
        { error: "We couldn't read enough text from that image. Try a clearer photo or upload a file instead." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Extract job description error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract text from image." },
      { status: 500 }
    );
  }
}
