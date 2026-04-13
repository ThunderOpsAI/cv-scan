
import { ProfileForTailoring } from '@/types/job-packs';
import { formatApprovedFactsForPrompt } from '@/lib/profile/facts';

export function buildCoverLetterPrompt(
    profile: ProfileForTailoring,
    jobTitle: string,
    company: string,
    jd: string
): string {
    const approvedFactsText = formatApprovedFactsForPrompt(profile.approved_facts);

    return `
    You are an expert career coach writing a high-impact cover letter for ${profile.full_name}.
    
    Target Role: ${jobTitle}
    Target Company: ${company}
    
    APPROVED PROFILE FACTS:
    ${approvedFactsText}

    JOB DESCRIPTION:
    ${jd}

    GROUNDING RULES:
    - Use only the approved profile facts listed above as evidence for candidate claims.
    - Do not add or imply achievements, skills, dates, metrics, responsibilities, titles, education, certifications, or credentials that are not in approved facts.
    - Do not estimate numbers or dates.
    - If a job requirement is not supported by approved facts, do not pretend the candidate has it.
    - Include compact evidence tags like [fact:12345678] beside specific claims where they fit naturally.

    INSTRUCTIONS:
    Write a compelling, non-generic cover letter that follows this structure:
    
    1.  **The Hook**: Open with a strong statement connecting the candidate's background to the company's mission or specific challenges mentioned in the JD. Avoid "I am writing to apply for...".
    2.  **The Story (The "Meat")**: Select the most relevant approved facts and weave them into a narrative. Show, don't just tell.
    3.  **The Culture Fit**: Briefly mention why this specific company appeals based on the JD, without inventing personal history.
    4.  **The Close**: confident call to action.

    TONE: Professional, confident, authentic. Avoid buzzwords like "passionate", "motivated" unless backed by evidence.
    LENGTH: Keep it under 350 words.
    
    Return ONLY the cover letter text.
  `;
}

export function buildResumeTailoringPrompt(
    profile: ProfileForTailoring,
    jd: string
): string {
    const approvedFactsText = formatApprovedFactsForPrompt(profile.approved_facts);

    return `
    You are an expert resume writer. Tailor the following resume to the Job Description provided.

    JOB DESCRIPTION:
    ${jd}

    CANDIDATE CONTACT FIELDS:
    Name: ${profile.full_name}
    Headline: ${profile.headline}
    Summary: ${profile.summary}
    
    APPROVED PROFILE FACTS:
    ${approvedFactsText}

    INSTRUCTIONS:
    1.  **Summary**: Rewrite the summary to be focused on the JD only when approved facts support the claims.
    2.  **Experience**:
        -   Reframe approved work, achievement, and metric facts for the JD.
        -   Use JD keywords only when the approved facts support them.
        -   Include compact evidence tags like [fact:12345678] beside rewritten bullets.
        -   **CRITICAL RULE**: Do NOT invent jobs, companies, dates, achievements, metrics, responsibilities, titles, skills, education, certifications, or credentials.
        -   **CRITICAL RULE**: Do NOT estimate missing numbers or dates.
    3.  **Skills**: Include only skills present in approved facts.
    4.  **Gaps**: If important JD requirements are unsupported by approved facts, list them under a short GAP NOTES section instead of inventing experience.

    OUTPUT FORMAT:
    Return the complete tailored resume text. Use a clean, plain-text format with clear section headers (SUMMARY, EXPERIENCE, EDUCATION, SKILLS).
  `;
}
