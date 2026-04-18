import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getOwnedBullet } from '@/lib/supabase/user-scope';
import { gemini } from '@/lib/gemini';
import { deductCredits } from '@/lib/supabase/credits';
import { debitReferenceFromRequest } from '@/lib/billing/idempotency';
import { plainAiText } from '@/lib/text/plain-ai-output';
import { MineMetricsRequest, SubmitMetricsAnswersRequest } from '@/types/profile';

const CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const supabase = createClient();

    if ('context' in body) {
      return await generateQuestions(body as MineMetricsRequest, session.user.id, supabase);
    } else if ('answers' in body) {
      return await enhanceBullet(body as SubmitMetricsAnswersRequest, session.user.id, supabase, req);
    } else {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Mine metrics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function generateQuestions(
  body: MineMetricsRequest,
  userId: string,
  supabase: any
) {
  const { bullet_id, context } = body;

  if (!bullet_id || !context.job_title || !context.company || !context.bullet_content) {
    return NextResponse.json(
      { error: 'bullet_id and complete context are required' },
      { status: 400 }
    );
  }

  const bullet = await getOwnedBullet(supabase, userId, bullet_id);

  if (!bullet) {
    return NextResponse.json(
      { error: 'Bullet not found' },
      { status: 404 }
    );
  }

  const prompt = `You are a professional resume coach helping someone strengthen their resume bullet points with quantifiable metrics.

Context:
- Job Title: ${context.job_title}
- Company: ${context.company}
- Current Bullet: ${context.bullet_content}

Generate 3-5 strategic questions that will help uncover specific metrics, numbers, or quantifiable results for this bullet point. Focus on:
- Scope (team size, budget, users affected)
- Impact (percentage improvements, time saved, revenue generated)
- Scale (how many, how often, how large)
- Results (before/after comparisons)

Do not suggest or invent metrics. Ask questions so the user can provide exact facts.

Return ONLY the questions, one per line, without numbering.`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text();

  const questions = text
    .split('\n')
    .map((q) => plainAiText(q.trim()))
    .filter((q) => q.length > 0 && q.endsWith('?'));

  if (questions.length === 0) {
    return NextResponse.json(
      { error: 'Failed to generate questions. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ questions });
}

async function enhanceBullet(
  body: SubmitMetricsAnswersRequest,
  userId: string,
  supabase: any,
  req: NextRequest
) {
  const { bullet_id, answers } = body;

  if (!bullet_id || !answers || answers.length === 0) {
    return NextResponse.json(
      { error: 'bullet_id and answers are required' },
      { status: 400 }
    );
  }

  const { data: user } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  /* Credit check bypassed for beta */

  const bullet = await getOwnedBullet(supabase, userId, bullet_id);

  if (!bullet) {
    return NextResponse.json(
      { error: 'Bullet not found' },
      { status: 404 }
    );
  }

  const answersText = answers.map((a, i) => `${i + 1}. ${a}`).join('\n');

  const prompt = `You are a professional resume writer. Enhance the following resume bullet point using the provided metrics and context.

Original Bullet: ${bullet.content}
Job Title: ${bullet.experiences?.title || 'Unknown'}
Company: ${bullet.experiences?.company || 'Unknown'}

Additional Context/Metrics:
${answersText}

Create an enhanced, ATS-optimized bullet point that:
- Starts with a strong action verb
- Incorporates only the quantifiable metrics provided in the user's answers
- Is concise (1-2 lines maximum)
- Focuses on impact and results
- Uses professional language
- Does not invent achievements, skills, dates, metrics, responsibilities, titles, credentials, or tools
- If the answers do not provide a metric, write a truthful non-quantified bullet

Return ONLY the enhanced bullet point, nothing else.`;

  const result = await gemini.generateContent(prompt);
  const enhanced_content = plainAiText(result.response.text());

  if (!enhanced_content) {
    return NextResponse.json(
      { error: 'Failed to enhance bullet. Please try again.' },
      { status: 500 }
    );
  }

  const deductResult = [{success:true}]; const deductError = null; /* const { data: deductResult, error: deductError } = await deductCredits(supabase as any, {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_description: 'Metric mining enhancement',
    p_reference_id: debitReferenceFromRequest(req, `mine-metrics:${bullet_id}`),
  }); */

  if (deductError || !deductResult?.[0]?.success) {
    console.error('Failed to deduct credit:', deductError);
    return NextResponse.json(
      { error: deductResult?.[0]?.error_message || 'Failed to deduct credit' },
      { status: 500 }
    );
  }

  const minedMetrics = {
    questions: [],
    answers,
    enhanced_content,
  };

  const { error: updateError } = await supabase
    .from('bullets')
    .update({
      content: enhanced_content,
      mined_metrics: minedMetrics,
    })
    .eq('id', bullet_id)
    .eq('experience_id', bullet.experience_id)
    .select()
    .single();

  if (updateError) {
    console.error('Failed to update bullet:', updateError);
    return NextResponse.json(
      { error: 'Failed to save enhanced bullet' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    enhanced_content,
    mined_metrics: minedMetrics,
    creditsRemaining: deductResult[0].new_credits,
  });
}
