import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isProfileFactType, sanitizeFactText } from "@/lib/profile/facts";
import type { ProfileFactSource, SaveProfileFactsRequest } from "@/types/profile";

const MAX_FACTS_PER_SAVE = 40;

function isProfileFactSource(value: unknown): value is ProfileFactSource {
  return value === "manual" || value === "extracted";
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scope = req.nextUrl.searchParams.get("scope");
    const approvedOnly = scope !== "all";

    const supabase = createClient();

    let query = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from("profile_facts") as any
    )
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (approvedOnly) {
      query = query.eq("is_approved", true);
    }

    const { data: facts, error } = await query;

    if (error) {
      console.error("Get profile facts error:", error);
      return NextResponse.json(
        { error: approvedOnly ? "Failed to fetch approved facts" : "Failed to fetch profile facts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ facts: facts || [] });
  } catch (error) {
    console.error("Get profile facts error:", error);
    return NextResponse.json({ error: "Failed to fetch profile facts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<SaveProfileFactsRequest>;

    if (!Array.isArray(body.facts) || body.facts.length === 0) {
      return NextResponse.json({ error: "At least one approved fact is required" }, { status: 400 });
    }

    const factsToSave = body.facts.slice(0, MAX_FACTS_PER_SAVE).flatMap((fact) => {
      const factText = sanitizeFactText(fact.fact_text);
      const source = isProfileFactSource(fact.source) ? fact.source : "extracted";

      if (!isProfileFactType(fact.fact_type) || factText.length < 3) {
        return [];
      }

      return [{
        user_id: session.user.id,
        fact_type: fact.fact_type,
        fact_text: factText,
        is_approved: true,
        source,
      }];
    });

    if (factsToSave.length === 0) {
      return NextResponse.json({ error: "No valid approved facts to save" }, { status: 400 });
    }

    const supabase = createClient();

    const { data: existingFacts, error: existingError } = await (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from("profile_facts") as any
    )
      .select("fact_type, fact_text")
      .eq("user_id", session.user.id)
      .eq("is_approved", true);

    if (existingError) {
      console.error("Check duplicate profile facts error:", existingError);
      return NextResponse.json({ error: "Failed to check existing facts" }, { status: 500 });
    }

    const existingKeys = new Set(
      (existingFacts || []).map((fact: { fact_type: string; fact_text: string }) =>
        `${fact.fact_type}:${fact.fact_text.toLowerCase()}`
      )
    );

    const dedupedFacts = factsToSave.filter((fact) => {
      const key = `${fact.fact_type}:${fact.fact_text.toLowerCase()}`;
      if (existingKeys.has(key)) {
        return false;
      }
      existingKeys.add(key);
      return true;
    });

    if (dedupedFacts.length === 0) {
      return NextResponse.json({
        facts: [],
        skipped_duplicates: factsToSave.length,
        message: "All approved facts were already saved.",
      });
    }

    const { data: savedFacts, error: insertError } = await (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from("profile_facts") as any
    )
      .insert(dedupedFacts)
      .select("*");

    if (insertError) {
      console.error("Save approved profile facts error:", insertError);
      return NextResponse.json({ error: "Failed to save approved facts" }, { status: 500 });
    }

    return NextResponse.json({
      facts: savedFacts || [],
      skipped_duplicates: factsToSave.length - dedupedFacts.length,
      message: "Approved facts saved to career memory.",
    }, { status: 201 });
  } catch (error) {
    console.error("Save approved profile facts error:", error);
    return NextResponse.json({ error: "Failed to save approved facts" }, { status: 500 });
  }
}
