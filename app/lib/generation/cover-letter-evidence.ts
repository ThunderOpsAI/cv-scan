import type { ApprovedProfileFactForTailoring } from "@/types/job-packs";
import type { CoverLetterEvidence } from "@/types/generated-assets";
import {
  FACT_TAG_RE,
  isLikelyCandidateClaim,
  validateEvidenceTags,
} from "@/lib/generation/grounding";

export function extractCoverLetterEvidence(
  letter: string,
  facts: ApprovedProfileFactForTailoring[]
): CoverLetterEvidence {
  const paragraphs: CoverLetterEvidence["paragraphs"] = [];
  const validFactIds: string[] = [];
  const invalidFactTags: string[] = [];
  const missingGroundingNotes: string[] = [];
  const blocks = letter.split(/\n\n+/);

  for (const [index, block] of blocks.entries()) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const tagValidation = validateEvidenceTags(trimmed, facts);
    const missingGrounding =
      isLikelyCandidateClaim(trimmed) && tagValidation.validFactIds.length === 0;

    for (const factId of tagValidation.validFactIds) {
      if (!validFactIds.includes(factId)) {
        validFactIds.push(factId);
      }
    }

    for (const tag of tagValidation.invalidTags) {
      if (!invalidFactTags.includes(tag)) {
        invalidFactTags.push(tag);
      }
    }

    if (missingGrounding) {
      missingGroundingNotes.push(
        `Paragraph ${index + 1} contains a candidate claim without an approved fact tag.`
      );
    }

    paragraphs.push({
      text: trimmed,
      fact_ids: tagValidation.validFactIds,
      missing_grounding: missingGrounding,
      invalid_tags: tagValidation.invalidTags,
    });
  }

  if (validFactIds.length === 0) {
    missingGroundingNotes.push("No approved profile fact tags were found in the cover letter.");
  }

  return {
    paragraphs,
    raw_text: letter,
    valid_fact_ids: validFactIds,
    invalid_fact_tags: invalidFactTags,
    missing_grounding_notes: missingGroundingNotes,
    has_ungrounded_claims: missingGroundingNotes.length > 0 || invalidFactTags.length > 0,
  };
}

export function stripFactTagsForExport(text: string): string {
  return text.replace(FACT_TAG_RE, "").replace(/\s+\n/g, "\n").trim();
}
