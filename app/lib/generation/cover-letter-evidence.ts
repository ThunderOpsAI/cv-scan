import type { ApprovedProfileFactForTailoring } from "@/types/job-packs";
import { shortFactId } from "@/lib/profile/facts";
import type { CoverLetterEvidence } from "@/types/generated-assets";

const TAG_RE = /\[fact:([a-f0-9-]{8,36})\]/gi;

export function extractCoverLetterEvidence(
  letter: string,
  facts: ApprovedProfileFactForTailoring[]
): CoverLetterEvidence {
  const byShort = new Map<string, string>();
  for (const f of facts) {
    byShort.set(shortFactId(f.fact_id), f.fact_id);
    byShort.set(f.fact_id, f.fact_id);
  }

  const paragraphs: CoverLetterEvidence["paragraphs"] = [];
  const blocks = letter.split(/\n\n+/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const factIds: string[] = [];
    let m: RegExpExecArray | null;
    const re = new RegExp(TAG_RE.source, TAG_RE.flags);
    while ((m = re.exec(trimmed)) !== null) {
      const key = m[1];
      const full = byShort.get(key) || byShort.get(key.slice(0, 8));
      if (full && !factIds.includes(full)) {
        factIds.push(full);
      }
    }
    paragraphs.push({ text: trimmed, fact_ids: factIds });
  }

  return { paragraphs, raw_text: letter };
}

export function stripFactTagsForExport(text: string): string {
  return text.replace(TAG_RE, "").replace(/\s+\n/g, "\n").trim();
}
