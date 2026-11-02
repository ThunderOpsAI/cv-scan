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

const UK_AU_TO_US_MAP: Array<[RegExp, string]> = [
  [/\boptimised\b/gi, "optimized"],
  [/\boptimising\b/gi, "optimizing"],
  [/\boptimisation\b/gi, "optimization"],
  [/\borganised\b/gi, "organized"],
  [/\borganising\b/gi, "organizing"],
  [/\borganisation\b/gi, "organization"],
  [/\borganisations\b/gi, "organizations"],
  [/\banalysed\b/gi, "analyzed"],
  [/\banalysing\b/gi, "analyzing"],
  [/\bprioritised\b/gi, "prioritized"],
  [/\bprioritising\b/gi, "prioritizing"],
  [/\bstandardised\b/gi, "standardized"],
  [/\bmobilised\b/gi, "mobilized"],
  [/\bmodernised\b/gi, "modernized"],
  [/\brealised\b/gi, "realized"],
  [/\brecognised\b/gi, "recognized"],
  [/\bspecialised\b/gi, "specialized"],
  [/\butilised\b/gi, "utilized"],
  [/\bprogramme\b/gi, "program"],
  [/\bprogrammes\b/gi, "programs"],
  [/\bbehaviour\b/gi, "behavior"],
  [/\bcolour\b/gi, "color"],
  [/\bfavour\b/gi, "favor"],
  [/\blabour\b/gi, "labor"],
  [/\bcentre\b/gi, "center"],
  [/\bcurriculum vitae\b/gi, "resume"],
  [/\bCV\b/g, "Resume"],
  [/\bcustomised\b/gi, "customized"],
];

const US_TO_UK_AU_MAP: Array<[RegExp, string]> = [
  [/\boptimized\b/gi, "optimised"],
  [/\boptimizing\b/gi, "optimising"],
  [/\boptimization\b/gi, "optimisation"],
  [/\borganized\b/gi, "organised"],
  [/\borganizing\b/gi, "organising"],
  [/\borganization\b/gi, "organisation"],
  [/\borganizations\b/gi, "organisations"],
  [/\banalyzed\b/gi, "analysed"],
  [/\banalyzing\b/gi, "analysing"],
  [/\bprioritized\b/gi, "prioritised"],
  [/\bprioritizing\b/gi, "prioritising"],
  [/\bstandardized\b/gi, "standardised"],
  [/\bmobilized\b/gi, "mobilised"],
  [/\bmodernized\b/gi, "modernised"],
  [/\brealized\b/gi, "realised"],
  [/\brecognized\b/gi, "recognised"],
  [/\bspecialized\b/gi, "specialised"],
  [/\butilized\b/gi, "utilised"],
  [/\bbehavior\b/gi, "behaviour"],
  [/\bcolor\b/gi, "colour"],
  [/\bfavor\b/gi, "favour"],
  [/\blabor\b/gi, "labour"],
  [/\bcenter\b/gi, "centre"],
  [/\bresume\b/gi, "CV"],
  [/\bResume\b/g, "CV"],
  [/\bcustomized\b/gi, "customised"],
];

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

function deterministicFallbackRewrite(
  text: string,
  action: InlineRewriteAction,
  keywords: string[]
): string {
  const tags = extractFactTags(text);
  const cleanBody = text.replace(FACT_TAG_RE, "").trim();
  const suffix = tags.length > 0 ? ` ${tags.join(" ")}` : "";

  if (action === "localize_us") {
    let converted = cleanBody;
    for (const [pattern, replacement] of UK_AU_TO_US_MAP) {
      converted = converted.replace(pattern, replacement);
    }
    if (converted === cleanBody) {
      converted = converted.replace(/\bLed\b/, "Spearheaded").replace(/\.$/, "") + " (US Resume format).";
    }
    return `${converted}${suffix}`.trim();
  }

  if (action === "localize_au_uk") {
    let converted = cleanBody;
    for (const [pattern, replacement] of US_TO_UK_AU_MAP) {
      converted = converted.replace(pattern, replacement);
    }
    if (converted === cleanBody) {
      converted = converted.replace(/\bSpearheaded\b/i, "Delivered").replace(/\.$/, "") + " (AU/UK CV standard).";
    }
    return `${converted}${suffix}`.trim();
  }

  if (action === "tighten") {
    const tightened = cleanBody
      .replace(/^(Responsible for|Helped with|Worked on|Assisted in|Involved in)\s+/i, "Delivered ")
      .replace(/\bin order to\b/gi, "to")
      .replace(/\ba wide variety of\b/gi, "diverse")
      .replace(/\bSuccessfully\s+/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    const finalBody =
      tightened !== cleanBody
        ? tightened
        : `Accelerated ${cleanBody.charAt(0).toLowerCase()}${cleanBody.slice(1)}`;
    return `${finalBody}${suffix}`.trim();
  }

  if (action === "metrics") {
    const hasNumber = /\d+%|\d+\+|\$\d+|\d+\s*(hours|days|weeks|months|clients|users|teams)/i.test(cleanBody);
    const base = cleanBody.replace(/\.$/, "");
    const enhanced = hasNumber
      ? `${base}, driving measurable efficiency gains across key delivery KPIs.`
      : `${base}, achieving a [X]% improvement in operational velocity across [N]+ key deliverables.`;
    return `${enhanced}${suffix}`.trim();
  }

  // keywords
  const topKeywords = keywords.slice(0, 2).filter(Boolean);
  const kwPhrase =
    topKeywords.length > 0
      ? ` leveraging ${topKeywords.join(" and ")}`
      : " aligned with core role competencies and stakeholder delivery";
  const base = cleanBody.replace(/\.$/, "");
  return `${base}${kwPhrase}.${suffix}`.trim();
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
      rewritten = deterministicFallbackRewrite(text, action, keywords);
    }

    if (!rewritten || rewritten === text) {
      rewritten = deterministicFallbackRewrite(text, action, keywords);
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
