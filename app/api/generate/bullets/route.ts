import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { gemini } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

const CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobDuty } = await req.json();

    if (!jobDuty || typeof jobDuty !== "string" || jobDuty.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a detailed job duty (at least 10 characters)" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if user has enough credits
    const { data: user } = await supabase
      .from("users")
      .select("credits")
      .eq("id", session.user.id)
      .single() as { data: { credits: number } | null };

    if (!user || user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase more credits." },
        { status: 402 }
      );
    }

    // Generate resume bullets using Gemini
    const prompt = `You are an expert resume writer. Transform the following job duty into 3-5 professional, ATS-optimized resume bullet points.

Job Duty: ${jobDuty}

Requirements:
- Start each bullet with a strong action verb
- Include quantifiable metrics when possible (estimate if not provided)
- Use concise, impactful language
- Optimize for Applicant Tracking Systems (ATS)
- Focus on accomplishments and impact, not just responsibilities
- Keep each bullet to 1-2 lines maximum

Return ONLY the bullet points, one per line, without any numbering or bullet symbols. Each line should be a complete sentence.`;

    const result = await gemini.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse bullets (split by newlines, filter empty)
    const bullets = text
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0 && !b.match(/^[\d\.\-\*•]/)); // Remove numbering/bullets

    if (bullets.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate bullet points. Please try again." },
        { status: 500 }
      );
    }

    // Deduct credit using Supabase function
    const { data: deductResult, error: deductError } = await supabase.rpc(
      "deduct_credits",
      {
        p_user_id: session.user.id,
        p_amount: CREDIT_COST,
        p_description: "Generated resume bullets",
      }
    ) as { data: Array<{ success: boolean; new_credits: number; error_message?: string }> | null; error: any };

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
        user_id: session.user.id,
        type: "bullets",
        input: { job_duty: jobDuty } as any,
        output: bullets.join("\n"),
        credits_used: CREDIT_COST,
      } as any);

    return NextResponse.json({
      bullets,
      creditsRemaining: deductResult[0].new_credits,
    });
  } catch (error: any) {
    console.error("Generate bullets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate bullets" },
      { status: 500 }
    );
  }
}
