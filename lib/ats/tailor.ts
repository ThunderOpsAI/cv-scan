// Resume Tailoring - Tailors resume content to job description
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileForTailoring } from '@/types/job-packs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function tailorResumeToJob(
  profile: ProfileForTailoring,
  jd: string
): Promise<string> {
  // Build original resume text from profile
  const experiencesText = profile.experiences
    .map(exp => {
      const dateRange = exp.is_current
        ? `${exp.start_date} - Present`
        : `${exp.start_date} - ${exp.end_date || 'N/A'}`;
      const bullets = exp.bullets.map(b => `  • ${b}`).join('\n');
      return `${exp.title} at ${exp.company}\n${exp.location || ''} | ${dateRange}\n${bullets}`;
    })
    .join('\n\n');

  const educationText = profile.education
    .map(edu => {
      const dateRange = edu.end_date
        ? `${edu.start_date} - ${edu.end_date}`
        : `${edu.start_date} - Present`;
      return `${edu.degree}${edu.field_of_study ? ` in ${edu.field_of_study}` : ''}\n${edu.institution} | ${dateRange}`;
    })
    .join('\n\n');

  const skillsText = profile.skills
    .map(s => s.name)
    .join(', ');

  const prompt = `Tailor this resume for the specific job description. Keep all facts accurate.

Original Resume:

Name: ${profile.full_name}
${profile.headline ? `Headline: ${profile.headline}` : ''}
${profile.summary ? `Summary: ${profile.summary}` : ''}

EXPERIENCE:
${experiencesText || 'No experience listed'}

EDUCATION:
${educationText || 'No education listed'}

SKILLS:
${skillsText || 'No skills listed'}

Job Description:
${jd}

Return a tailored resume text that:
- Emphasizes relevant skills and experience for this specific role
- Uses keywords from the job description naturally where applicable
- Reorders or rewrites bullet points for better match with job requirements
- Maintains complete truthfulness - do NOT add skills or experiences not in original
- Formats cleanly with clear sections

Return ONLY the tailored resume text, no additional commentary.`;

  try {
    const result = await proModel.generateContent(prompt);
    const tailoredResume = result.response.text();
    return tailoredResume.trim();
  } catch (error) {
    console.error('Resume tailoring error:', error);
    // Return original resume format on error
    return `${profile.full_name}\n${profile.headline || ''}\n\n${profile.summary || ''}\n\nEXPERIENCE:\n${experiencesText}\n\nEDUCATION:\n${educationText}\n\nSKILLS:\n${skillsText}`;
  }
}

export async function generateCoverLetter(
  profile: ProfileForTailoring,
  jobTitle: string,
  company: string,
  jd: string
): Promise<string> {
  const topExperiences = profile.experiences
    .slice(0, 3)
    .map(exp => `${exp.title} at ${exp.company}: ${exp.bullets.slice(0, 2).join('; ')}`)
    .join('\n');

  const prompt = `Write a professional cover letter for this job application.

Candidate: ${profile.full_name}
${profile.headline ? `Current Role: ${profile.headline}` : ''}

Relevant Experience:
${topExperiences || 'Entry-level candidate'}

Key Skills: ${profile.skills.slice(0, 10).map(s => s.name).join(', ') || 'Various skills'}

Applying for: ${jobTitle} at ${company}

Job Description:
${jd}

Write a compelling cover letter that:
1. Opens with enthusiasm for the specific role and company
2. Highlights 2-3 most relevant experiences/achievements
3. Shows understanding of the company's needs from the JD
4. Closes with a clear call to action
5. Keeps it under 350 words
6. Uses professional but personable tone

Return ONLY the cover letter text, ready to send.`;

  try {
    const result = await proModel.generateContent(prompt);
    const coverLetter = result.response.text();
    return coverLetter.trim();
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position at ${company}.\n\nWith my background and skills, I am confident I would be a valuable addition to your team.\n\nThank you for considering my application.\n\nSincerely,\n${profile.full_name}`;
  }
}
