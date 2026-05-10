import { ProfileForTailoring } from '@/types/job-packs';
import { buildOriginalResume } from './profile-loader';
import { buildCoverLetterPrompt, buildResumeTailoringPrompt } from './prompts';
import { gemini } from '@/lib/gemini';
import { plainAiText } from '@/lib/text/plain-ai-output';

export async function tailorResumeToJob(
  profile: ProfileForTailoring,
  jd: string
): Promise<string> {
  const proModel = gemini.getGenerativeModel();
  // Use the advanced prompt builder
  const prompt = buildResumeTailoringPrompt(profile, jd);

  try {
    const result = await proModel.generateContent(prompt);
    const tailoredResume = result.response.text();
    // Return the response directly
    return plainAiText(tailoredResume);
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
  const proModel = gemini.getGenerativeModel();
  // Use the advanced prompt builder with STAR stories context
  const prompt = buildCoverLetterPrompt(profile, jobTitle, company, jd);

  try {
    const result = await proModel.generateContent(prompt);
    const coverLetter = result.response.text();
    return plainAiText(coverLetter);
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return `Dear Hiring Manager,\n\nI am interested in the ${jobTitle} position at ${company}. I have included my approved career facts for review and would welcome the opportunity to discuss the role further.\n\nThank you for considering my application.\n\nSincerely,\n${profile.full_name}`;
  }
}
