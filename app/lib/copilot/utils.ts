import type { SupabaseClient } from '@supabase/supabase-js';
import { CopilotContext } from '@/types/intelligence';

export interface CopilotContextHints {
  job_id?: string;
  profile_id?: string;
  company_name?: string;
}

export async function buildCopilotContext(
  userId: string,
  contextHints: CopilotContextHints | undefined,
  supabase: SupabaseClient
): Promise<CopilotContext> {
  const context: CopilotContext = {};

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, headline')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: approvedFacts } = await supabase
    .from('profile_facts')
    .select('fact_type, fact_text')
    .eq('user_id', userId)
    .eq('is_approved', true)
    .order('created_at', { ascending: true });

  if (profile || approvedFacts?.length) {
    type FactItem = { fact_type: string; fact_text: string };
    const factsList = (approvedFacts || []) as FactItem[];
    context.profile = {
      full_name: profile?.full_name || 'Candidate',
      headline: profile?.headline || undefined,
      approved_facts: factsList,
      skills: factsList
        .filter((fact) => fact.fact_type === 'skill')
        .map((fact) => fact.fact_text),
    };
  }

  if (contextHints?.job_id) {
    const { data: job } = await supabase
      .from('discovered_jobs')
      .select('title, company, description')
      .eq('id', contextHints.job_id)
      .eq('user_id', userId)
      .single();

    if (job) {
      context.current_job = {
        title: job.title,
        company: job.company,
        description: job.description || '',
      };
    }
  }

  return context;
}

export function buildSystemPrompt(context: CopilotContext): string {
  const parts = [
    'You are a helpful job search assistant. You help users with their job search, career advice, resume tips, and interview preparation.',
  ];

  if (context.profile) {
    parts.push('\nUser Profile:');
    parts.push(`- Name: ${context.profile.full_name}`);
    if (context.profile.headline) {
      parts.push(`- Current Role: ${context.profile.headline}`);
    }
    if (context.profile.approved_facts && context.profile.approved_facts.length > 0) {
      parts.push('\nApproved Career Facts:');
      context.profile.approved_facts.slice(0, 20).forEach((fact) => {
        parts.push(`- (${fact.fact_type}) ${fact.fact_text}`);
      });
    }
    if (context.profile.skills && context.profile.skills.length > 0) {
      parts.push(`\nKey Skills: ${context.profile.skills.slice(0, 10).join(', ')}`);
    }
  }

  if (context.current_job) {
    parts.push('\nCurrent Job Discussion:');
    parts.push(`- Title: ${context.current_job.title}`);
    parts.push(`- Company: ${context.current_job.company}`);
  }

  parts.push('\nProvide helpful, actionable advice. Be concise and professional.');
  parts.push('Use approved career facts as the only source for candidate-specific claims. If a fact is missing, ask the user to add or approve it instead of inventing it.');

  return parts.join('\n');
}
