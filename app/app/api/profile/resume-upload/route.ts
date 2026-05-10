import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  buildStoredResumePath,
  extractResumeTextFromFile,
} from "@/lib/profile/resume-files";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await extractResumeTextFromFile({
      buffer,
      fileName: file.name,
      mimeType: file.type,
    });

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough resume text. Try a clearer file or paste the text manually." },
        { status: 422 }
      );
    }

    const supabase = createClient();
    const storagePath = buildStoredResumePath(session.user.id, file.name);
    const { error: uploadError } = await supabase.storage
      .from("resume_uploads")
      .upload(storagePath, buffer, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      console.error("Resume upload storage error:", uploadError);
      return NextResponse.json(
        { error: "Failed to store the uploaded resume file." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text,
      label: file.name.replace(/\.[^.]+$/, ""),
      stored_path: storagePath,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process resume file" },
      { status: 400 }
    );
  }
}
