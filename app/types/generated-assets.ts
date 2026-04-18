import type { ApprovedProfileFactForTailoring } from "@/types/job-packs";

export type GeneratedAssetType = "tailored_bullets" | "cover_letter" | "follow_up";

export interface TailoredBulletItem {
  fact_id: string;
  original: string;
  tailored: string;
  grounded: boolean;
  note?: string;
}

export interface TailoredBulletsEvidence {
  items: TailoredBulletItem[];
  ungroundable_notes: string[];
}

export interface CoverLetterEvidence {
  paragraphs: Array<{
    text: string;
    fact_ids: string[];
    missing_grounding?: boolean;
    invalid_tags?: string[];
  }>;
  raw_text: string;
  valid_fact_ids: string[];
  invalid_fact_tags: string[];
  missing_grounding_notes: string[];
  has_ungrounded_claims: boolean;
}

export interface SaveGeneratedAssetRequest {
  job_id: string | null;
  asset_type: GeneratedAssetType;
  content: string;
  evidence_json: Record<string, unknown>;
}

export function filterFactsForBullets(
  facts: ApprovedProfileFactForTailoring[]
): ApprovedProfileFactForTailoring[] {
  return facts.filter((f) =>
    ["work_history", "achievement", "metric", "skill"].includes(f.fact_type)
  );
}
