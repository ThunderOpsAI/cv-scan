import { CopilotContext } from '@/types/intelligence';

export async function buildCopilotContext(
  userId: string,
  contextHints: any,
  supabase: any
): Promise<CopilotContext> {
  const context: CopilotContext = {};

  const { data: profile } = await (supabase
    .from('profiles')
    .select as any)('*, experiences(*), skills(*)')
    .eq('user_id', userId)
    .single();

  if (profile) {
    context.profile = {
      full_name: profile.full_name,
      headline: profile.headline,
      experiences: profile.experiences?.map((exp: any) => ({
        company: exp.company,
        title: exp.title,
        years: calculateYears(exp.start_date, exp.end_date),
      })),
      skills: profile.skills?.map((skill: any) => skill.name),
    };
  }

  if (contextHints?.job_id) {
    const { data: job } = await (supabase
      .from('discovered_jobs')
      .select as any)('*')
      .eq('id', contextHints.job_id)
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
    if (context.profile.experiences && context.profile.experiences.length > 0) {
      parts.push('\nRecent Experience:');
      context.profile.experiences.slice(0, 3).forEach((exp) => {
        parts.push(`- ${exp.title} at ${exp.company} (${exp.years} years)`);
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

  return parts.join('\n');
}

function calculateYears(startDate: string, endDate?: string): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return Math.round(years * 10) / 10;
}
