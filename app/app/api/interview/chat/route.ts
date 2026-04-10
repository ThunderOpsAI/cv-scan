import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gemini } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, company = "a tech company", role = "software engineer" } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Since this is a specialized interview bot, let's construct the prompt
    // We combine the history into a single prompt for Gemini or use an array if supported. 
    // We'll format it as a script for the AI.

    let conversationHistory = messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n');

    const systemPrompt = `You are a professional technical recruiter and hiring manager conducting an interview for the role of ${role} at ${company}. 
Your goal is to practice interviewing the candidate. 

STRICT RULES:
1. Stay in character at all times. You are the interviewer. DO NOT break character.
2. Ask ONE question at a time.
3. Wait for the candidate's response.
4. After the candidate responds, provide brief, constructive feedback on their answer (what was good, what could be improved), and then immediately ask the next interview question.
5. If the user asks for a hint, provide a small tip on how to answer the question well.
6. Keep your responses concise (under 150 words).

Here is the conversation so far:
${conversationHistory}

Based on the above, write your next response as the Interviewer. Remember to give feedback if the candidate just answered, and then ask the next question.`;

    // Deduct 1 credit for interview practice turn (optional, but consistent with copilot)
    const supabase = createClient();
    if (session.user.credits < 1) {
      return NextResponse.json({ error: 'Insufficient credits (1 required per message)' }, { status: 402 });
    }

    // Deduct credit
    const { error: creditError } = await (supabase.rpc as any)('deduct_credits', {
      user_id_param: session.user.id,
      credits_to_deduct: 1,
    });

    if (creditError) {
      console.error('Credit deduction failed:', creditError);
      return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 });
    }

    const result = await gemini.generateContent(systemPrompt);
    const aiResponse = result.response.text();

    return NextResponse.json({ 
      response: aiResponse,
    });
  } catch (error: any) {
    console.error('Interview Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
