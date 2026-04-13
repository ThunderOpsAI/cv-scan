import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/supabase/credits";
import { debitReferenceFromRequest } from "@/lib/billing/idempotency";
import { loadProfileForTailoring } from "@/lib/ats/profile-loader";
import { generateCoverLetter as generateGroundedCoverLetter } from "@/lib/ats/tailor";
import { approvedFactIds } from "@/lib/profile/facts";

const CREDIT_COST = 2;

type CoverLetterRequest = {
  resume?: unknown;
  jobDescription?: unknown;
  jobTitle?: unknown;
  company?: unknown;
};

type SaveCoverLetterRequest = CoverLetterRequest & {
  coverLetter?: unknown;
};

type GenerationInsert = {
  user_id: string;
  type: "cover_letter";
  input: {
    job_description: string;
    approved_fact_ids: string[];
  };
  output: string;
  credits_used: number;
};

type InsertGeneration = (values: GenerationInsert) => PromiseLike<{ error: unknown | null }>;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();
    const userId = session.user.id;

    const { jobDescription, jobTitle, company } = (await req.json()) as CoverLetterRequest;

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide a detailed job description (at least 50 characters)" },
        { status: 400 }
      );
    }

    const profile = await loadProfileForTailoring(userId, supabase);

    if (!profile) {
      return NextResponse.json(
        { error: "Import your resume and approve profile facts before generating a cover letter." },
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

    const coverLetter = await generateGroundedCoverLetter(
      profile,
      typeof jobTitle === "string" && jobTitle.trim() ? jobTitle.trim() : "the target role",
      typeof company === "string" && company.trim() ? company.trim() : "the target company",
      jobDescription
    );

    if (coverLetter.length < 100) {
      return NextResponse.json(
        { error: "Failed to generate cover letter. Please try again." },
        { status: 500 }
      );
    }

    // Deduct credits using Supabase function
    const { data: deductResult, error: deductError } = await deductCredits(supabase, {
      p_user_id: userId,
      p_amount: CREDIT_COST,
      p_description: "Generated cover letter",
      p_reference_id: debitReferenceFromRequest(req, "gen-cover-letter"),
    });

    if (deductError || !deductResult?.[0]?.success) {
      console.error("Failed to deduct credit:", deductError);
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || "Failed to deduct credit" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      coverLetter,
      creditsRemaining: deductResult[0].new_credits,
      approvedFactIds: approvedFactIds(profile.approved_facts),
    });
  } catch (error: unknown) {
    console.error("Generate cover letter error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to generate cover letter") },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();
    const userId = session.user.id;

    const { data: generations, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "cover_letter")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Failed to fetch generations:", error);
      return NextResponse.json({ error: "Failed to fetch saved items" }, { status: 500 });
    }

    return NextResponse.json({ generations });
  } catch (error: unknown) {
    console.error("Fetch generations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved items" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();
    const userId = session.user.id;

    const { coverLetter, jobDescription } = (await req.json()) as SaveCoverLetterRequest;

    if (
      typeof coverLetter !== "string" ||
      typeof jobDescription !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const profile = await loadProfileForTailoring(userId, supabase);

    if (!profile) {
      return NextResponse.json(
        { error: "Approved profile facts are required before saving generated career content." },
        { status: 400 }
      );
    }

    // Save to database
    const insertGeneration = supabase.from("generations").insert as unknown as InsertGeneration;
    const { error: insertError } = await insertGeneration({
      user_id: userId,
      type: "cover_letter",
      input: {
        job_description: jobDescription,
        approved_fact_ids: approvedFactIds(profile.approved_facts),
      },
      output: coverLetter,
      credits_used: 0, // No credits used for saving (already deducted during generation)
    });

    if (insertError) {
      console.error("Failed to save cover letter:", insertError);
      return NextResponse.json(
        { error: "Failed to save cover letter" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Save cover letter error:", error);
    return NextResponse.json(
      { error: "Failed to save cover letter" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("generations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // Ensure user can only delete their own

    if (deleteError) {
      console.error("Failed to delete cover letter:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete cover letter" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete cover letter error:", error);
    return NextResponse.json(
      { error: "Failed to delete cover letter" },
      { status: 500 }
    );
  }
}
