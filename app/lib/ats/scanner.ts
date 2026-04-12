// ATS Scanner - Analyzes job description against user profile
import { ATSAnalysisResult, ProfileForTailoring } from '@/types/job-packs';
import { gemini } from '@/lib/gemini';
import { formatApprovedFactsForPrompt } from '@/lib/profile/facts';

export async function analyzeJobDescription(
  jd: string,
  profile: ProfileForTailoring
): Promise<ATSAnalysisResult> {
  const flashModel = gemini.getGenerativeModel();
  const approvedFactsText = formatApprovedFactsForPrompt(profile.approved_facts);

  const prompt = `Analyze this job description for ATS compatibility with the candidate's approved profile facts.

Job Description:
${jd}

Approved Profile Facts:
${approvedFactsText}

Grounding rules:
- Treat the approved facts as the only source of candidate truth.
- Do not infer or invent skills, achievements, metrics, dates, responsibilities, education, certifications, or credentials.
- Mark JD requirements as missing when they are not supported by approved facts.

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
1. Match skills mentioned in JD only against approved facts
2. Check experience relevance only against approved facts
3. Evaluate education fit only against approved facts
4. Provide actionable recommendations that ask the user to add or approve missing facts instead of inventing them`;

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
