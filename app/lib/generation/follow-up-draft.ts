import { gemini } from "@/lib/gemini";

export async function generateFollowUpDraft(input: {
  jobTitle: string;
  company: string;
  appliedAtIso: string;
  candidateName: string;
}): Promise<string> {
  const applied = new Date(input.appliedAtIso);
  const dateStr = Number.isNaN(applied.getTime())
    ? input.appliedAtIso
    : applied.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const prompt = `Write a short, professional follow-up email body (no subject line) for a candidate who applied for a role.

Candidate name: ${input.candidateName}
Role: ${input.jobTitle}
Company: ${input.company}
Date they applied (stated for context only): ${dateStr}

Rules:
- Do not invent employers, interviews, or offers.
- Keep it concise (120–220 words), polite, one clear ask (e.g. status update).
- Return ONLY the email body text.`;

  const result = await gemini.generateContent(prompt);
  return result.response.text().trim();
}
