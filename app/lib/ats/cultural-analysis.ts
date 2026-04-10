// Cultural Analysis - Detects potential red flags in job descriptions
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function detectCulturalWarnings(jd: string): Promise<string[]> {
  const prompt = `Analyze this job description for potential red flags and cultural concerns:

${jd}

Look for signs of:
- Unrealistic expectations ("wear many hats", "fast-paced", "startup mentality" without context)
- Toxic culture signs ("family", "work hard play hard", "rockstar", "ninja", "guru")
- Excessive hours mentions ("24/7", "nights and weekends", "always on")
- Vague compensation ("competitive salary" without range, "unlimited PTO")
- High turnover indicators ("hit the ground running", "self-starter" overemphasis)
- Unprofessional language or unreasonable requirements
- Potential discrimination or bias in language

Return ONLY a JSON array of warning strings. Each warning should be a brief, clear statement.
If no warnings found, return an empty array: []

Examples of good warnings:
- "'Rockstar' language may indicate unrealistic expectations"
- "'Work hard play hard' often signals long hours culture"
- "No salary range listed - potential negotiation disadvantage"

Return ONLY the JSON array, no markdown or code blocks.`;

  try {
    const result = await flashModel.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Clean up response
    if (responseText.startsWith('```json')) {
      responseText = responseText.slice(7);
    } else if (responseText.startsWith('```')) {
      responseText = responseText.slice(3);
    }
    if (responseText.endsWith('```')) {
      responseText = responseText.slice(0, -3);
    }
    responseText = responseText.trim();

    const warnings: string[] = JSON.parse(responseText);
    
    // Ensure it's an array of strings
    if (!Array.isArray(warnings)) {
      return [];
    }
    
    return warnings.filter(w => typeof w === 'string').slice(0, 10);
  } catch (error) {
    console.error('Cultural analysis error:', error);
    return [];
  }
}
