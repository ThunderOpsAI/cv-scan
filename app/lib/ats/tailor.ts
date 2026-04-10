import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileForTailoring } from '@/types/job-packs';
import { buildOriginalResume } from './profile-loader';
import { buildCoverLetterPrompt, buildResumeTailoringPrompt } from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const proModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function tailorResumeToJob(
  profile: ProfileForTailoring,
  jd: string
): Promise<string> {
  // Use the advanced prompt builder
  const prompt = buildResumeTailoringPrompt(profile, jd);

  try {
    const result = await proModel.generateContent(prompt);
    const tailoredResume = result.response.text();
    // Return the response directly
    return tailoredResume.trim();
  } catch (error) {
    console.error('Resume tailoring error:', error);
    // Return original resume format on error
    return buildOriginalResume(profile);
  }
}

export async function generateCoverLetter(
  profile: ProfileForTailoring,
  jobTitle: string,
  company: string,
  jd: string
): Promise<string> {
  // Use the advanced prompt builder with STAR stories context
  const prompt = buildCoverLetterPrompt(profile, jobTitle, company, jd);

  try {
    const result = await proModel.generateContent(prompt);
    const coverLetter = result.response.text();
    return coverLetter.trim();
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position at ${company}.\n\nWith my background and skills, I am confident I would be a valuable addition to your team.\n\nThank you for considering my application.\n\nSincerely,\n${profile.full_name}`;
  }
}
