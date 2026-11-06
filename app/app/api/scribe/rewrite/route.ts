import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { gemini } from "@/lib/gemini";
import { plainAiText } from "@/lib/text/plain-ai-output";
import { FACT_TAG_RE } from "@/lib/generation/grounding";

export type InlineRewriteAction =
  | "tighten"
  | "metrics"
  | "keywords"
  | "localize_au_uk"
  | "localize_us";

interface InlineRewriteRequest {
  text?: unknown;
  action?: unknown;
  jobContext?: unknown;
  keywords?: unknown;
  mode?: unknown;
}

function extractFactTags(text: string): string[] {
  const matches = text.match(FACT_TAG_RE);
  return matches ? Array.from(new Set(matches)) : [];
}

function restoreFactTagsIfMissing(originalText: string, rewrittenText: string): string {
  const originalTags = extractFactTags(originalText);
  if (originalTags.length === 0) return rewrittenText;

  let result = rewrittenText.trim();
  for (const tag of originalTags) {
    if (!result.toLowerCase().includes(tag.toLowerCase())) {
      result = `${result} ${tag}`;
    }
  }
  return result.trim();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as InlineRewriteRequest;
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const action = (typeof body.action === "string" ? body.action : "tighten") as InlineRewriteAction;
    const jobContext = typeof body.jobContext === "string" ? body.jobContext.trim() : "";
    const mode = body.mode === "paragraph" ? "paragraph" : "bullet";
    const keywords = Array.isArray(body.keywords)
      ? body.keywords.filter((k): k is string => typeof k === "string" && k.trim().length > 0)
      : [];

    if (!text) {
      return NextResponse.json({ error: "Please provide text to rewrite." }, { status: 400 });
    }

    const validActions: InlineRewriteAction[] = [
      "tighten",
      "metrics",
      "keywords",
      "localize_au_uk",
      "localize_us",
    ];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid rewrite action." }, { status: 400 });
    }

    const actionInstructions: Record<InlineRewriteAction, string> = {
      tighten:
        "Make this text tighter, punchier, and more executive. Start with a strong active verb, cut filler words, and maximize clarity while keeping all factual meaning intact.",
      metrics:
        "Strengthen quantifiable impact and measurable outcomes. If numbers already exist, foreground them clearly; if no exact numbers exist, frame measurable scope or insert a clear [X]% / [N]+ metric placeholder without fabricating specific false history.",
      keywords: `Naturally weave in the most relevant target job keywords (${
        keywords.length > 0 ? keywords.slice(0, 5).join(", ") : "from the job context"
      }) so ATS scanners score higher, without keyword-stuffing or inventing ungrounded claims.`,
      localize_au_uk:
        "Localize spelling, phrasing, and conventions to Australian / British English (AU/UK CV style: e.g. optimise, organisation, programme, behaviour, concise achievement tone).",
      localize_us:
        "Localize spelling, phrasing, and conventions to American English (US Resume style: e.g. optimize, organization, program, behavior, direct impact-first action phrasing).",
    };

    const existingTags = extractFactTags(text);
    const prompt = `You are Scribe, an inline AI co-writing assistant for resumes and cover letters.
Rewrite the selected ${mode} according to the instruction below.

Action instruction:
${actionInstructions[action]}

${jobContext ? `Target job context:\n${jobContext.slice(0, 1200)}\n` : ""}
${keywords.length > 0 ? `Target keywords to prioritize if truthful: ${keywords.slice(0, 8).join(", ")}\n` : ""}
Original ${mode}:
${text}

Strict rules:
- Return ONLY the rewritten ${mode} text on a single line (or single paragraph).
- Do NOT include bullet symbols (•, -, *), quotation marks, markdown formatting, or explanations.
- Preserve any existing evidence tags like ${existingTags.length > 0 ? existingTags.join(", ") : "[fact:...]"} verbatim at the end of the text.
- Keep the length appropriate for a ${mode === "bullet" ? "concise 1-2 line resume bullet" : "cohesive cover letter paragraph"}.`;

    let rewritten = "";
    try {
      const result = await gemini.generateContent(prompt);
      const raw = result.response.text();
      rewritten = plainAiText(raw).replace(/^[\s•\-*]+/, "").trim();
      rewritten = restoreFactTagsIfMissing(text, rewritten);
    } catch {
      return NextResponse.json(
        { error: "AI rewrite is unavailable right now. Please try again." },
        { status: 502 }
      );
    }

    if (!rewritten || rewritten === text) {
      return NextResponse.json(
        { error: "The AI could not produce a different rewrite. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      original: text,
      rewritten,
      action,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to rewrite selection" },
      { status: 500 }
    );
  }
}
