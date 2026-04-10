
import { ProfileForTailoring, StarStoryForTailoring, SmartGoalForTailoring } from '@/types/job-packs';

export function buildCoverLetterPrompt(
    profile: ProfileForTailoring,
    jobTitle: string,
    company: string,
    jd: string
): string {
    const experiencesText = profile.experiences
        .slice(0, 3)
        .map(exp => `${exp.title} at ${exp.company}`)
        .join(', ');

    const starStoriesText = profile.star_stories
        .map(s => `STAR Story (${s.title}):\nSituation: ${s.situation}\nTask: ${s.task}\nAction: ${s.action}\nResult: ${s.result}`)
        .join('\n\n');

    const smartGoalsText = profile.smart_goals
        .map(g => `Career Goal: ${g.goal}`)
        .join('\n');

    const skillsText = profile.skills.map(s => s.name).join(', ');

    return `
    You are an expert career coach writing a high-impact cover letter for ${profile.full_name}.
    
    Target Role: ${jobTitle}
    Target Company: ${company}
    
    CANDIDATE PROFILE:
    Current Role: ${profile.headline || 'N/A'}
    Top Experience: ${experiencesText}
    Key Skills: ${skillsText}
    
    ACHIEVEMENTS (Use these to prove value):
    ${starStoriesText || 'No specific stories provided - strictly use experience bullets'}
    
    CAREER AMBITIONS:
    ${smartGoalsText || 'N/A'}

    JOB DESCRIPTION:
    ${jd}

    INSTRUCTIONS:
    Write a compelling, non-generic cover letter that follows this structure:
    
    1.  **The Hook**: Open with a strong statement connecting the candidate's background to the company's mission or specific challenges mentioned in the JD. Avoid "I am writing to apply for...".
    2.  **The Story (The "Meat")**: Select the ONE most relevant STAR story (or experience if no stories) and weave it into a narrative. Show, don't just tell. connect the "Result" directly to how it solves the company's problem.
    3.  **The Culture Fit**: Briefly mention why this specific company appeals (referencing values or goals from JD), connecting it to the candidate's career ambitions if relevant.
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
    // We format the resume components here to save token space in the main logic if needed,
    // but for now we'll rely on the caller to pass the structured profile and we output the text.
    // Actually, the main logic builds the text representation. Let's assume we pass the profile data structures directly.

    const experiencesText = profile.experiences
        .map(exp => {
            const bullets = exp.bullets.map(b => `- ${b}`).join('\n');
            return `Position: ${exp.title} at ${exp.company}\nBullets:\n${bullets}`;
        })
        .join('\n\n');

    // ... (skills etc are passed in the logic, we can just take the raw text or the structured object)
    // Let's refine the input to match what `tailorResumeToJob` expects/uses.
    // The original function built the text. Let's rebuild it here or accept it.
    // To keep it simple and clean, let's accept the pre-formatted sections or the raw profile.
    // Let's accept the raw profile and formatting helper.

    return `
    You are an expert resume writer. Tailor the following resume to the Job Description provided.

    JOB DESCRIPTION:
    ${jd}

    CANDIDATE PROFILE:
    Name: ${profile.full_name}
    Headline: ${profile.headline}
    Summary: ${profile.summary}
    
    EXPERIENCE:
    ${experiencesText}
    
    SKILLS:
    ${profile.skills.map(s => s.name).join(', ')}

    STAR STORIES (Context for achievements):
    ${profile.star_stories.map(s => `[${s.title}]: ${s.result}`).join('\n')}

    INSTRUCTIONS:
    1.  **Summary**: Rewrite the summary to be laser-focused on the JD's keywords and role requirements.
    2.  **Experience**:
        -   Reorder bullet points to prioritize those most relevant to the JD.
        -   Rewrite specific bullet points to use keywords from the JD, BUT ONLY IF the underlying experience supports it.
        -   Use the STAR stories provided to enhance bullet points with concrete results if they match the role.
        -   **CRITICAL RULE**: Do NOT invent new jobs, companies, or dates. You can only reframe existing experience.
        -   **CRITICAL RULE**: Do NOT add skills the candidate doesn't have.
    3.  **Skills**: Reorder the skills list to put the most relevant ones first.

    OUTPUT FORMAT:
    Return the complete tailored resume text. Use a clean, plain-text format with clear section headers (SUMMARY, EXPERIENCE, EDUCATION, SKILLS).
  `;
}
