// Notes Structurer - Processes raw interview notes into structured data
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StructuredNotes } from '@/types/applications';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function structureInterviewNotes(rawNotes: string): Promise<StructuredNotes> {
  const prompt = `Process these raw interview notes into structured data.

Raw Notes:
${rawNotes}

Extract and organize the following information. Return ONLY valid JSON (no markdown):
{
  "topics_discussed": ["topic1", "topic2"],
  "questions_they_asked": ["question1", "question2"],
  "their_concerns": ["concern1", "concern2"],
  "positive_signals": ["signal1", "signal2"],
  "next_steps_mentioned": "description of next steps if any",
  "follow_up_points": ["point1", "point2"]
}

Guidelines:
- topics_discussed: Main subjects covered in the interview
- questions_they_asked: Specific questions the interviewer asked
- their_concerns: Any hesitations or concerns they expressed about the candidate
- positive_signals: Positive reactions, interest indicators, or encouraging comments
- next_steps_mentioned: Timeline, next rounds, or process information shared
- follow_up_points: Things to mention in follow-up or prepare for next round

If information is not available for a field, use an empty array [] or null.`;

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

    const structured: StructuredNotes = JSON.parse(responseText);
    
    // Ensure all arrays exist
    return {
      topics_discussed: structured.topics_discussed || [],
      questions_they_asked: structured.questions_they_asked || [],
      their_concerns: structured.their_concerns || [],
      positive_signals: structured.positive_signals || [],
      next_steps_mentioned: structured.next_steps_mentioned || undefined,
      follow_up_points: structured.follow_up_points || [],
    };
  } catch (error) {
    console.error('Notes structuring error:', error);
    return {
      topics_discussed: [],
      questions_they_asked: [],
      their_concerns: [],
      positive_signals: [],
      follow_up_points: [],
    };
  }
}
