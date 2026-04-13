import { gemini } from "@/lib/gemini";
import type { ProfileForTailoring } from "@/types/job-packs";
import { formatApprovedFactsWithFullIds, shortFactId } from "@/lib/profile/facts";
import type { TailoredBulletsEvidence } from "@/types/generated-assets";
import { filterFactsForBullets } from "@/types/generated-assets";
import { resolveApprovedFactId } from "@/lib/generation/grounding";

function parseJson(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();
  const s = cleaned.indexOf("{");
  const e = cleaned.lastIndexOf("}");
  if (s >= 0 && e > s) cleaned = cleaned.slice(s, e + 1);
  return JSON.parse(cleaned);
}

export async function generateTailoredBulletsForJob(
  profile: ProfileForTailoring,
  jobDescription: string,
  jobTitle: string,
  company: string
): Promise<TailoredBulletsEvidence> {
  const bulletFacts = filterFactsForBullets(profile.approved_facts);
  const factsBlock =
    bulletFacts.length > 0
      ? formatApprovedFactsWithFullIds(bulletFacts)
      : formatApprovedFactsWithFullIds(profile.approved_facts);

  const prompt = `You tailor resume bullet points for a specific job using ONLY approved profile facts as evidence.

Job title: ${jobTitle}
Company: ${company}

Job description:
${jobDescription.trim()}

Approved profile facts (ONLY source of truth — each block has fact_id UUID):
${factsBlock}

Rules:
- For each output item, set fact_id to the exact fact_id UUID from the matching block above.
- original must quote or closely paraphrase that fact's fact_text (the "before").
- tailored must rewrite it for this job using JD keywords only where supported by that fact.
- grounded must be false if you cannot honestly connect the fact to the JD without inventing detail; still provide your best honest tailored line and a short note.
- Do not invent employers, titles, dates, metrics, degrees, certifications, or skills not present in the approved facts.
- Produce 3–8 items when enough distinct facts exist; fewer if facts are limited.
- If a fact type is weak for bullets, you may skip it.

Return ONLY valid JSON:
{
  "items": [
    {
      "fact_id": "<uuid>",
      "original": "string",
      "tailored": "string",
      "grounded": true,
      "note": "optional"
    }
  ],
  "ungroundable_notes": ["optional JD asks for X but no fact supports it"]
}`;

  const result = await gemini.generateContent(prompt);
  const raw = result.response.text();
  const parsed = parseJson(raw) as Record<string, unknown>;
  const itemsRaw = parsed.items;
  const ungroundable = parsed.ungroundable_notes;

  const items: TailoredBulletsEvidence["items"] = [];
  const notes: string[] = [];
  if (Array.isArray(itemsRaw)) {
    for (const row of itemsRaw) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const rawFactId = typeof o.fact_id === "string" ? o.fact_id : "";
      const factId = resolveApprovedFactId(profile.approved_facts, rawFactId);
      const original = typeof o.original === "string" ? o.original : "";
      const tailored = typeof o.tailored === "string" ? o.tailored : "";
      const grounded = o.grounded === true;
      const note = typeof o.note === "string" ? o.note : undefined;
      if (!factId) {
        notes.push("A generated bullet was dropped because it cited a fact outside your approved profile.");
        continue;
      }
      if (!tailored.trim()) continue;
      items.push({
        fact_id: factId,
        original: original || "(from approved fact)",
        tailored: tailored.trim(),
        grounded,
        note,
      });
    }
  }

  if (Array.isArray(ungroundable)) {
    for (const n of ungroundable) {
      if (typeof n === "string" && n.trim()) notes.push(n.trim());
    }
  }

  if (items.length === 0) {
    notes.push(
      "Could not produce structured bullets — add more approved work or achievement facts in Career Memory."
    );
  }

  return { items, ungroundable_notes: notes };
}

export function summarizeEvidenceForStorage(evidence: TailoredBulletsEvidence): Record<string, unknown> {
  return {
    variant: "tailored_bullets_v1",
    items: evidence.items.map((i) => ({
      fact_id: i.fact_id,
      fact_short: shortFactId(i.fact_id),
      original: i.original,
      tailored: i.tailored,
      grounded: i.grounded,
      note: i.note,
    })),
    ungroundable_notes: evidence.ungroundable_notes,
  };
}
