import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deductCredits, addCredits } from "@/lib/supabase/credits";
import { debitReferenceFromRequest } from "@/lib/billing/idempotency";
import { generateFollowUpDraft } from "@/lib/generation/follow-up-draft";

const CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const jobTitle = typeof body.job_title === "string" ? body.job_title.trim() : "";
    const company = typeof body.company === "string" ? body.company.trim() : "";
    const appliedAt =
      typeof body.applied_at === "string" ? body.applied_at : new Date().toISOString();

    if (!jobTitle || !company) {
      return NextResponse.json(
        { error: "job_title and company are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: userRow } = await (supabase as any)
      .from("users")
      .select("credits, name")
      .eq("id", session.user.id)
      .single();

    if (!userRow || userRow.credits < CREDIT_COST) {
      return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
    }

    const referenceId = debitReferenceFromRequest(req, "follow-up");
    const { data: deductResult, error: deductError } = await deductCredits(supabase as never, {
      p_user_id: session.user.id,
      p_amount: CREDIT_COST,
      p_description: `Follow-up draft: ${jobTitle}`,
      p_reference_id: referenceId,
    });

    if (deductError || !deductResult?.[0]?.success) {
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || "Failed to deduct credits" },
        { status: 402 }
      );
    }

    const candidateName =
      typeof session.user.name === "string" && session.user.name.trim()
        ? session.user.name.trim()
        : typeof userRow.name === "string" && userRow.name
          ? userRow.name
          : "Candidate";

    let draft;
    try {
      draft = await generateFollowUpDraft({
        jobTitle,
        company,
        appliedAtIso: appliedAt,
        candidateName,
      });
    } catch (err) {
      await addCredits(supabase as never, {
        p_user_id: session.user.id,
        p_amount: CREDIT_COST,
        p_description: "Refund: Generation failed",
        p_reference_id: `refund-error-${referenceId}`,
      });
      throw err;
    }

    return NextResponse.json({
      draft,
      new_credits: deductResult[0].new_credits,
    });
  } catch (error) {
    console.error("Follow-up draft error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate draft" },
      { status: 500 }
    );
  }
}
