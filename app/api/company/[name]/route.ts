import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { gemini } from '@/lib/gemini';
import { deductCredits } from '@/lib/supabase/credits';
import { CompanyData } from '@/types/intelligence';

const CREDIT_COST = 1;
const CACHE_DURATION_DAYS = 7;

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ name: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyName = decodeURIComponent(params.name);
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('force_refresh') === 'true';

    const supabase = createClient();

    if (!forceRefresh) {
      const { data: cachedCompany } = await (supabase
        .from('company_cache')
        .select as any)('*')
        .eq('company_name', companyName)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cachedCompany) {
        return NextResponse.json({
          company: cachedCompany.data,
          cached: true,
          expires_at: cachedCompany.expires_at,
        });
      }
    }

    const { data: user } = await (supabase
      .from('users')
      .select as any)('credits')
      .eq('id', session.user.id)
      .single();

    if (!user || user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more credits.' },
        { status: 402 }
      );
    }

    const companyData = await fetchCompanyResearch(companyName);

    const { data: deductResult, error: deductError } = await deductCredits(supabase as any, {
      p_user_id: session.user.id,
      p_amount: CREDIT_COST,
      p_description: `Company research: ${companyName}`,
    });

    if (deductError || !deductResult?.[0]?.success) {
      console.error('Failed to deduct credit:', deductError);
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || 'Failed to deduct credit' },
        { status: 500 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_DURATION_DAYS);

    await (supabase
      .from('company_cache')
      .upsert as any)({
        company_name: companyName,
        data: companyData,
        expires_at: expiresAt.toISOString(),
      });

    return NextResponse.json({
      company: companyData,
      cached: false,
      expires_at: expiresAt.toISOString(),
      creditsRemaining: deductResult[0].new_credits,
    });
  } catch (error: any) {
    console.error('Company research error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch company data' },
      { status: 500 }
    );
  }
}

async function fetchCompanyResearch(companyName: string): Promise<CompanyData> {
  const prompt = `Provide a comprehensive overview of ${companyName} as a company. Include:

1. Company description (1-2 sentences)
2. Industry
3. Company size (approximate employee count)
4. Headquarters location
5. Company culture (3-5 key points)
6. Core values (3-5 values)
7. Recent news or developments (2-3 items if notable)
8. Overall summary for job seekers (2-3 sentences)

Format your response as JSON with these exact keys: name, description, industry, size, headquarters, culture (array), values (array), recent_news (array), summary.`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: companyName,
        description: parsed.description,
        industry: parsed.industry,
        size: parsed.size,
        headquarters: parsed.headquarters,
        culture: parsed.culture || [],
        values: parsed.values || [],
        recent_news: parsed.recent_news || [],
        summary: parsed.summary,
      };
    }
  } catch (parseError) {
    console.error('Failed to parse company data:', parseError);
  }

  return {
    name: companyName,
    description: text.substring(0, 200),
    summary: 'Unable to fetch detailed company information.',
  };
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ name: string }> }
) {
  const params = await props.params; // await params
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyName = decodeURIComponent(params.name);
    const supabase = createClient();

    await (supabase
      .from('company_cache')
      .delete as any)()
      .eq('company_name', companyName);

    return NextResponse.json({ success: true, message: 'Cache cleared' });
  } catch (error: any) {
    console.error('Clear cache error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
