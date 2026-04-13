import { gemini } from "@/lib/gemini";
import type { FitSignals, FitVerdict } from "@/types/fit";

const VERDICTS: FitVerdict[] = ["apply", "stretch", "skip"];

function parseJsonObject(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return JSON.parse(cleaned);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeSignals(value: unknown): FitSignals {
  if (!value || typeof value !== "object") {
    return { strengths_matched: [], must_have_gaps: [], stretch_areas: [] };
  }
  const o = value as Record<string, unknown>;
  return {
    strengths_matched: isStringArray(o.strengths_matched) ? o.strengths_matched : [],
    must_have_gaps: isStringArray(o.must_have_gaps) ? o.must_have_gaps : [],
    stretch_areas: isStringArray(o.stretch_areas) ? o.stretch_areas : [],
  };
}

export async function analyzeJobFit(input: {
  jobTitle: string;
  company: string;
  jobDescription: string;
  approvedFactsBlock: string;
}): Promise<{ verdict: FitVerdict; signals: FitSignals; rationale: string }> {
  const prompt = `You are a career coach helping a candidate decide whether to apply for a job.

Rules:
- Use ONLY the approved profile facts below as evidence of what the candidate has done, knows, or is qualified for.
- Do not invent skills, employers, titles, degrees, certifications, dates, or metrics not stated in the facts.
- If the job requires something not evidenced in the facts, list it as a gap or stretch — do not assume the candidate has it.
- Return exactly one verdict: "apply" (strong match), "stretch" (worth applying but notable gaps), or "skip" (poor fit or hard requirements not evidenced).

Job title: ${input.jobTitle}
Company: ${input.company}

Job description:
${input.jobDescription.trim()}

Approved profile facts (only evidence you may use):
${input.approvedFactsBlock}

Return ONLY valid JSON with this exact shape (no markdown outside the JSON):
{
  "verdict": "apply" | "stretch" | "skip",
  "signals": {
    "strengths_matched": ["short bullet", "..."],
    "must_have_gaps": ["requirement not evidenced in facts", "..."],
    "stretch_areas": ["areas where fit is possible but not proven in facts", "..."]
  },
  "rationale": "2-5 sentences in plain language for the candidate."
}`;

  const result = await gemini.generateContent(prompt);
  const raw = result.response.text();
  const parsed = parseJsonObject(raw) as Record<string, unknown>;

  const verdictRaw = parsed.verdict;
  const verdict =
    typeof verdictRaw === "string" && VERDICTS.includes(verdictRaw as FitVerdict)
      ? (verdictRaw as FitVerdict)
      : "stretch";

  const signals = normalizeSignals(parsed.signals);
  const rationale =
    typeof parsed.rationale === "string" && parsed.rationale.trim().length > 0
      ? parsed.rationale.trim()
      : "Review the signals above against your approved facts before deciding.";

  return { verdict, signals, rationale };
}
