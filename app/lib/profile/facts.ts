import { gemini } from "@/lib/gemini";
import type { ApprovedProfileFactForTailoring } from "@/types/job-packs";
import type { CandidateProfileFact, ProfileFact, ProfileFactType } from "@/types/profile";

export const PROFILE_FACT_TYPES: ProfileFactType[] = [
  "work_history",
  "education",
  "skill",
  "achievement",
  "metric",
  "goal",
];

const FACT_TYPE_LABELS: Record<ProfileFactType, string> = {
  work_history: "Work history",
  education: "Education",
  skill: "Skill",
  achievement: "Achievement",
  metric: "Metric",
  goal: "Goal",
};

const MAX_FACTS_FROM_IMPORT = 40;
const MAX_FACT_LENGTH = 500;

type AiCandidateFact = {
  fact_type?: unknown;
  fact_text?: unknown;
};

export function isProfileFactType(value: unknown): value is ProfileFactType {
  return typeof value === "string" && PROFILE_FACT_TYPES.includes(value as ProfileFactType);
}

export function getFactTypeLabel(type: ProfileFactType): string {
  return FACT_TYPE_LABELS[type];
}

export function sanitizeFactText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\s+/g, " ")
    .replace(/^[\s\-*•]+/, "")
    .trim()
    .slice(0, MAX_FACT_LENGTH);
}

export function shortFactId(factId: string): string {
  return factId.slice(0, 8);
}

export function formatApprovedFactsForPrompt(
  facts: ApprovedProfileFactForTailoring[] | ProfileFact[]
): string {
  if (facts.length === 0) {
    return "No approved profile facts are available.";
  }

  return facts
    .map((fact) => `[fact:${shortFactId(fact.fact_id)}] (${fact.fact_type}) ${fact.fact_text}`)
    .join("\n");
}

/** Lists each fact with full `fact_id` UUID for models that must cite IDs exactly. */
export function formatApprovedFactsWithFullIds(
  facts: ApprovedProfileFactForTailoring[] | ProfileFact[]
): string {
  if (facts.length === 0) {
    return "No approved profile facts are available.";
  }

  return facts
    .map(
      (fact) =>
        `fact_id: ${fact.fact_id}\nfact_type: ${fact.fact_type}\nfact_text: ${fact.fact_text}`
    )
    .join("\n\n---\n\n");
}

export function resolveFactIdFromShortTag(
  facts: ApprovedProfileFactForTailoring[],
  shortOrFull: string
): string | null {
  const trimmed = shortOrFull.trim();
  for (const f of facts) {
    if (f.fact_id === trimmed || shortFactId(f.fact_id) === trimmed.slice(0, 8)) {
      return f.fact_id;
    }
  }
  return null;
}

export function approvedFactIds(facts: ApprovedProfileFactForTailoring[] | ProfileFact[]): string[] {
  return facts.map((fact) => fact.fact_id);
}

export async function extractCandidateFactsFromResume(
  rawContent: string
): Promise<CandidateProfileFact[]> {
  const resumeText = rawContent.trim();
  const prompt = `You extract candidate career facts from a resume for user review.

Rules:
- Extract only facts explicitly present in the resume text.
- Do not infer or invent achievements, skills, dates, metrics, responsibilities, credentials, titles, companies, or education.
- Do not estimate missing numbers or dates.
- Prefer specific, atomic facts the user can approve or reject.
- Use one of these fact_type values only: work_history, education, skill, achievement, metric, goal.
- Return only valid JSON with this shape:
[
  { "fact_type": "skill", "fact_text": "..." }
]

Resume text:
${resumeText}`;

  try {
    const result = await gemini.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = parseJsonArray(responseText);
    const normalized = normalizeCandidateFacts(parsed);

    if (normalized.length > 0) {
      return normalized;
    }
  } catch (error) {
    console.error("Resume fact extraction failed; falling back to local line extraction:", error);
  }

  return fallbackExtractCandidateFacts(resumeText);
}

function parseJsonArray(responseText: string): unknown {
  let cleaned = responseText.trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();
  const jsonStart = cleaned.indexOf("[");
  const jsonEnd = cleaned.lastIndexOf("]");

  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  return JSON.parse(cleaned);
}

function normalizeCandidateFacts(value: unknown): CandidateProfileFact[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const facts: CandidateProfileFact[] = [];

  for (const item of value as AiCandidateFact[]) {
    const factType = item?.fact_type;
    const factText = sanitizeFactText(item?.fact_text);

    if (!isProfileFactType(factType) || factText.length < 3) {
      continue;
    }

    const key = `${factType}:${factText.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    facts.push({
      temp_id: `candidate-${facts.length + 1}`,
      fact_type: factType,
      fact_text: factText,
      source: "extracted",
    });

    if (facts.length >= MAX_FACTS_FROM_IMPORT) {
      break;
    }
  }

  return facts;
}

function fallbackExtractCandidateFacts(rawContent: string): CandidateProfileFact[] {
  const facts: CandidateProfileFact[] = [];
  const seen = new Set<string>();
  let currentSection: ProfileFactType | null = null;

  const pushFact = (factType: ProfileFactType, factText: string) => {
    const sanitized = sanitizeFactText(factText);
    if (sanitized.length < 3 || shouldSkipLine(sanitized)) {
      return;
    }

    const key = `${factType}:${sanitized.toLowerCase()}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    facts.push({
      temp_id: `candidate-${facts.length + 1}`,
      fact_type: factType,
      fact_text: sanitized,
      source: "extracted",
    });
  };

  for (const rawLine of rawContent.split(/\r?\n/)) {
    const line = sanitizeFactText(rawLine);
    if (!line) {
      continue;
    }

    const section = classifySectionHeading(line);
    if (section) {
      currentSection = section;
      continue;
    }

    if (currentSection === "skill" && line.includes(",")) {
      for (const skill of line.split(",")) {
        pushFact("skill", skill);
      }
    } else {
      pushFact(classifyFactLine(line, currentSection), line);
    }

    if (facts.length >= MAX_FACTS_FROM_IMPORT) {
      break;
    }
  }

  return facts;
}

function classifySectionHeading(line: string): ProfileFactType | null {
  const normalized = line.toLowerCase().replace(/[:]/g, "");

  if (/^(skills|technical skills|core skills|tools|technologies)$/.test(normalized)) {
    return "skill";
  }
  if (/^(education|certifications|licenses)$/.test(normalized)) {
    return "education";
  }
  if (/^(experience|work experience|employment|professional experience)$/.test(normalized)) {
    return "work_history";
  }
  if (/^(achievements|selected achievements|accomplishments)$/.test(normalized)) {
    return "achievement";
  }
  if (/^(goals|career goals|objective)$/.test(normalized)) {
    return "goal";
  }

  return null;
}

function classifyFactLine(line: string, section: ProfileFactType | null): ProfileFactType {
  if (section) {
    return section;
  }

  if (/\b\d+(\.\d+)?\s*(%|percent|x|k|m|million|billion|users|customers|people|team|teams|hours|days|weeks|months|years)\b/i.test(line)) {
    return "metric";
  }

  if (/\b(university|college|bachelor|master|mba|phd|degree|certificate|certification)\b/i.test(line)) {
    return "education";
  }

  if (/\b(led|built|launched|delivered|improved|reduced|increased|created|managed|owned|designed|implemented)\b/i.test(line)) {
    return "achievement";
  }

  if (/\b(engineer|manager|analyst|designer|consultant|developer|director|specialist|coordinator)\b/i.test(line)) {
    return "work_history";
  }

  return "skill";
}

function shouldSkipLine(line: string): boolean {
  if (line.length > MAX_FACT_LENGTH) {
    return true;
  }

  if (/^[A-Z\s]{3,}$/.test(line) && line.split(/\s+/).length <= 4) {
    return true;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line)) {
    return true;
  }

  if (/^(https?:\/\/|linkedin\.com|github\.com)/i.test(line)) {
    return true;
  }

  return false;
}
