import type { ApprovedProfileFactForTailoring } from "@/types/job-packs";
import { shortFactId } from "@/lib/profile/facts";

export const FACT_TAG_RE = /\[fact:([a-f0-9-]{8,36})\]/gi;

export type EvidenceTagValidation = {
  validFactIds: string[];
  invalidTags: string[];
};

export function resolveApprovedFactId(
  facts: ApprovedProfileFactForTailoring[],
  shortOrFullId: string
): string | null {
  const normalized = shortOrFullId.trim().toLowerCase();
  if (!normalized) return null;

  for (const fact of facts) {
    const factId = fact.fact_id.toLowerCase();
    if (factId === normalized || shortFactId(fact.fact_id).toLowerCase() === normalized.slice(0, 8)) {
      return fact.fact_id;
    }
  }

  return null;
}

export function validateEvidenceTags(
  text: string,
  facts: ApprovedProfileFactForTailoring[]
): EvidenceTagValidation {
  const validFactIds: string[] = [];
  const invalidTags: string[] = [];
  const re = new RegExp(FACT_TAG_RE.source, FACT_TAG_RE.flags);
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const tag = match[1];
    const factId = resolveApprovedFactId(facts, tag);
    if (factId) {
      if (!validFactIds.includes(factId)) {
        validFactIds.push(factId);
      }
    } else if (!invalidTags.includes(tag)) {
      invalidTags.push(tag);
    }
  }

  return { validFactIds, invalidTags };
}

export function hasValidEvidenceTag(
  text: string,
  facts: ApprovedProfileFactForTailoring[]
): boolean {
  return validateEvidenceTags(text, facts).validFactIds.length > 0;
}

export function isLikelyCandidateClaim(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("dear ") ||
    lower.startsWith("sincerely") ||
    lower.startsWith("regards") ||
    lower.startsWith("best regards") ||
    lower.startsWith("thank you")
  ) {
    return false;
  }

  return /\b(candidate|background|experience|experienced|expertise|skill|skills|led|lead|managed|built|created|delivered|improved|increased|reduced|developed|designed|implemented|owned|launched|degree|certification|certified|credential|worked|achieved|bring|brings)\b/i.test(
    trimmed
  );
}

export function groundingErrorMessage(kind: "bullets" | "cover_letter" | "resume" | "asset") {
  if (kind === "bullets") {
    return "The draft was missing valid evidence tags from your approved profile facts. Add or approve supporting facts, then generate again.";
  }
  if (kind === "cover_letter") {
    return "The cover letter included candidate claims without valid evidence tags. Add or approve supporting facts, then generate again.";
  }
  if (kind === "resume") {
    return "The tailored resume included candidate claims without valid evidence tags. Add or approve supporting facts, then generate again.";
  }
  return "Generated career content must include valid evidence from your approved profile facts before it can be saved.";
}

export function findUngroundedCandidateClaimLines(
  text: string,
  facts: ApprovedProfileFactForTailoring[]
): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.filter((line) => {
    if (/^[A-Z][A-Z\s/&-]{2,}$/.test(line)) return false;
    const validation = validateEvidenceTags(line, facts);
    if (validation.invalidTags.length > 0) return true;
    return isLikelyCandidateClaim(line) && validation.validFactIds.length === 0;
  });
}
