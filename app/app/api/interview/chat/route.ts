import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emitAnalyticsEvent, logCriticalError } from '@/lib/analytics/server';
import { gemini } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';
import { deductCredits } from '@/lib/supabase/credits';
import { debitReferenceFromRequest } from '@/lib/billing/idempotency';
import { getPlanTierForUser, planMeetsMinimum } from '@/lib/billing/plan-tier';
import { plainAiText } from '@/lib/text/plain-ai-output';

const CREDIT_COST = 1;

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

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

    const sanitizedMessages: ChatMessage[] = messages
      .filter((message: Partial<ChatMessage>) =>
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0
      )
      .map((message: ChatMessage) => ({
        role: message.role,
        content: message.content.trim(),
      }));

    if (sanitizedMessages.length === 0) {
      return NextResponse.json({ error: 'At least one message is required' }, { status: 400 });
    }

    const supabase = createClient();

    const planTier = await getPlanTierForUser(supabase, session.user.id);
    if (!planMeetsMinimum(planTier, 'starter')) {
      return NextResponse.json(
        {
          error:
            'Interview prep chat requires a Starter subscription or higher. Credits alone do not unlock this flow.',
          code: 'PLAN_REQUIRED',
          min_plan: 'starter',
        },
        { status: 403 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', session.user.id)
      .single() as { data: { credits: number } | null; error: any };

    if (userError || !user) {
      console.error('Failed to load user credits for interview chat:', userError);
      await logCriticalError({
        workflow: 'interview_credit_load',
        userId: session.user.id,
        supabase,
        error: userError ?? 'Missing user credit row',
      });
      return NextResponse.json(
        { error: 'Unable to verify your credit balance. Please try again.' },
        { status: 500 }
      );
    }

    /* Credit check bypassed for beta */

    // Since this is a specialized interview bot, let's construct the prompt
    // We combine the history into a single prompt for Gemini or use an array if supported. 
    // We'll format it as a script for the AI.

    const conversationHistory = sanitizedMessages
      .map((message) => `${message.role === 'user' ? 'Candidate' : 'Interviewer'}: ${message.content}`)
      .join('\n');

    const systemPrompt = `You are a professional technical recruiter and hiring manager conducting an interview for the role of ${role} at ${company}. 
Your goal is to practice interviewing the candidate. 

STRICT RULES:
1. Stay in character at all times. You are the interviewer. DO NOT break character.
2. Ask ONE question at a time.
3. Wait for the candidate's response.
4. After the candidate responds, provide brief, constructive feedback on their answer (what was good, what could be improved), and then immediately ask the next interview question.
5. If the user asks for a hint, provide a small tip on how to answer the question well.
6. Keep your responses concise (under 150 words).
7. Return plain text only. Do not use markdown formatting, headings, bold, italics, or bullet symbols.

Here is the conversation so far:
${conversationHistory}

Based on the above, write your next response as the Interviewer. Remember to give feedback if the candidate just answered, and then ask the next question.`;

    const result = await gemini.generateContent(systemPrompt);
    const aiResponse = plainAiText(result.response.text());

    const deductResult = [{success:true}]; const deductError = null; /* const { data: deductResult, error: deductError } = await deductCredits(supabase as any, {
      p_user_id: session.user.id,
      p_amount: CREDIT_COST,
      p_description: `Mock interview reply: ${role} at ${company}`,
      p_reference_id: debitReferenceFromRequest(req, 'interview'),
    }); */

    if (deductError || !deductResult?.[0]?.success) {
      console.error('Interview credit deduction failed:', {
        error: deductError,
        rpcResult: deductResult,
        userId: session.user.id,
      });
      return NextResponse.json(
        {
          error: deductResult?.[0]?.error_message ||
            'Unable to process credits. Your balance was not changed; please try again.',
        },
        { status: deductResult?.[0]?.error_message === 'Insufficient credits' ? 402 : 500 }
      );
    }

    await emitAnalyticsEvent({
      eventName: 'interview_prep_run',
      userId: session.user.id,
      supabase,
      properties: {
        message_count: sanitizedMessages.length,
        plan_tier: planTier,
        credits_charged: CREDIT_COST,
      },
    });

    return NextResponse.json({ 
      response: aiResponse,
      creditsRemaining: deductResult[0].new_credits,
    });
  } catch (error: any) {
    console.error('Interview Chat error:', error);
    await logCriticalError({
      workflow: 'interview_prep_run',
      error,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
