// ATS Scanner - Analyzes job description against user profile
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ATSAnalysisResult, ProfileForTailoring } from '@/types/job-packs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function analyzeJobDescription(
  jd: string,
  profile: ProfileForTailoring
): Promise<ATSAnalysisResult> {
  const skillsList = profile.skills.map(s => s.name).join(', ');
  const experiencesList = profile.experiences
    .map(e => `${e.title} at ${e.company} (${e.bullets.join('; ')})`)
    .join('\n');
  const educationList = profile.education
    .map(e => `${e.degree} in ${e.field_of_study || 'N/A'} from ${e.institution}`)
    .join('\n');

  const prompt = `Analyze this job description for ATS compatibility with the candidate's profile.

Job Description:
${jd}

Candidate Profile:
- Skills: ${skillsList || 'None listed'}
- Experience:
${experiencesList || 'None listed'}
- Education:
${educationList || 'None listed'}

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "score": <number 0-100>,
  "keyword_matches": {
    "found": ["skill1", "skill2"],
    "missing": ["skill3", "skill4"]
  },
  "section_scores": {
    "skills": <number 0-100>,
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "format": <number 0-100>
  },
  "recommendations": ["Add more keywords about X", "Highlight Y experience"]
}

Analyze carefully:
1. Match skills mentioned in JD against candidate skills
2. Check experience relevance to job requirements
3. Evaluate education fit
4. Provide actionable recommendations to improve match`;

  try {
    const result = await flashModel.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7);
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    const analysis: ATSAnalysisResult = JSON.parse(cleanedResponse);
    
    // Validate and clamp scores
    analysis.score = Math.max(0, Math.min(100, analysis.score || 0));
    analysis.section_scores = {
      skills: Math.max(0, Math.min(100, analysis.section_scores?.skills || 0)),
      experience: Math.max(0, Math.min(100, analysis.section_scores?.experience || 0)),
      education: Math.max(0, Math.min(100, analysis.section_scores?.education || 0)),
      format: Math.max(0, Math.min(100, analysis.section_scores?.format || 0)),
    };
    analysis.keyword_matches = {
      found: analysis.keyword_matches?.found || [],
      missing: analysis.keyword_matches?.missing || [],
    };
    analysis.recommendations = analysis.recommendations || [];

    return analysis;
  } catch (error) {
    console.error('ATS analysis error:', error);
    // Return default result on error
    return {
      score: 50,
      keyword_matches: { found: [], missing: [] },
      section_scores: { skills: 50, experience: 50, education: 50, format: 50 },
      recommendations: ['Unable to fully analyze. Please try again.'],
    };
  }
}
