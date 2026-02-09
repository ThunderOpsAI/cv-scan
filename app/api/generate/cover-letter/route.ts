import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { gemini } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/supabase/credits";

const CREDIT_COST = 2;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    const token = await getToken({ req: req as any });
    const email = (token as any)?.email as string | undefined;

    let userId: string | undefined;
    if (email) {
      const { data: dbUser } = await (supabase
        .from("users")
        .select as any)("id")
        .eq("email", email)
        .single();
      userId = dbUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resume, jobDescription } = await req.json();

    if (!resume || typeof resume !== "string" || resume.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide detailed resume information (at least 50 characters)" },
        { status: 400 }
      );
    }

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide a detailed job description (at least 50 characters)" },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const { data: user } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single() as { data: { credits: number } | null };

    if (!user || user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits. You need at least 2 credits." },
        { status: 402 }
      );
    }

    // Generate cover letter using Gemini
    const prompt = `You are an expert career counselor and professional writer. Create a compelling, personalized cover letter based on the candidate's resume and the job description.

CANDIDATE RESUME/BACKGROUND:
${resume}

JOB DESCRIPTION:
${jobDescription}

Requirements for the cover letter:
- Write in a professional, enthusiastic tone
- Start with a strong opening paragraph that captures attention
- Highlight 2-3 key qualifications that match the job requirements
- Show genuine interest in the company and role
- Demonstrate how the candidate's experience solves the employer's needs
- End with a confident call to action
- Keep it concise (3-4 paragraphs, under 400 words)
- Use proper business letter format
- DO NOT include placeholder text like "[Your Name]" or "[Date]" - write a complete letter body only
- Focus on specific achievements and skills from the resume that align with job requirements

Write the cover letter body now:`;

    const result = await gemini.generateContent(prompt);
    const response = result.response;
    const coverLetter = response.text().trim();

    if (coverLetter.length < 100) {
      return NextResponse.json(
        { error: "Failed to generate cover letter. Please try again." },
        { status: 500 }
      );
    }

    // Deduct credits using Supabase function
    const { data: deductResult, error: deductError } = await deductCredits(supabase as any, {
      p_user_id: userId,
      p_amount: CREDIT_COST,
      p_description: "Generated cover letter",
    });

    if (deductError || !deductResult?.[0]?.success) {
      console.error("Failed to deduct credit:", deductError);
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || "Failed to deduct credit" },
        { status: 500 }
      );
    }

    // Save generation to database
    await supabase
      .from("generations")
      .insert({
        user_id: userId,
        type: "cover_letter",
        input: { resume, job_description: jobDescription } as any,
        output: coverLetter,
        credits_used: CREDIT_COST,
      } as any);

    return NextResponse.json({
      coverLetter,
      creditsRemaining: deductResult[0].new_credits,
    });
  } catch (error: any) {
    console.error("Generate cover letter error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
