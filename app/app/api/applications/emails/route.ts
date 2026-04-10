import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { generateEmail } from '@/lib/applications/email-generator';
import { deductCredits } from '@/lib/supabase/credits';
import { GenerateEmailRequest, GenerateEmailResponse } from '@/types/applications';

const CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateEmailRequest = await req.json();

    if (!body.application_id || !body.email_type) {
      return NextResponse.json(
        { error: 'Application ID and email type are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check credits
    const { data: user } = await (supabase
      .from('users')
      .select as any)('credits')
      .eq('id', session.user.id)
      .single();

    if (!user || user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    // Get application
    const { data: application } = await (supabase
      .from('applications')
      .select as any)('*')
      .eq('id', body.application_id)
      .eq('user_id', session.user.id)
      .single();

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get stage if provided
    let stage = null;
    if (body.stage_id) {
      const { data: stageData } = await (supabase
        .from('application_stages')
        .select as any)('*')
        .eq('id', body.stage_id)
        .single();
      stage = stageData;
    }

    // Generate email
    const emailContent = await generateEmail(body.email_type, {
      application,
      stage,
      additionalContext: body.context,
    });

    // Deduct credit
    const { data: deductResult, error: deductError } = await deductCredits(supabase as any, {
      p_user_id: session.user.id,
      p_amount: CREDIT_COST,
      p_description: `Email generation: ${body.email_type}`,
    });

    if (deductError || !deductResult?.[0]?.success) {
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || 'Failed to deduct credit' },
        { status: 500 }
      );
    }

    // Store generated email
    const { data: email, error } = await (supabase
      .from('generated_emails')
      .insert as any)({
        user_id: session.user.id,
        application_id: body.application_id,
        stage_id: body.stage_id,
        email_type: body.email_type,
        subject: emailContent.subject,
        content: emailContent.content,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to store email:', error);
      return NextResponse.json(
        { error: 'Failed to store generated email' },
        { status: 500 }
      );
    }

    const response: GenerateEmailResponse = {
      email,
      credits_charged: CREDIT_COST,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate email' },
      { status: 500 }
    );
  }
}
