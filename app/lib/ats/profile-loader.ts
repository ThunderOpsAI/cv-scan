// Profile Loader - Loads user profile data for ATS analysis and tailoring
import { SupabaseClient } from '@supabase/supabase-js';
import { ApprovedProfileFactForTailoring, ProfileForTailoring } from '@/types/job-packs';
import { formatApprovedFactsForPrompt, getFactTypeLabel, shortFactId } from '@/lib/profile/facts';

type LegacyProfile = {
  full_name?: string | null;
  headline?: string | null;
  summary?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
};

type UserIdentity = {
  name?: string | null;
  email?: string | null;
};

export async function loadProfileForTailoring(
  userId: string,
  supabase: SupabaseClient
): Promise<ProfileForTailoring | null> {
  try {
    // Contact fields can come from the legacy profile, but generation claims below
    // are sourced only from approved profile_facts rows.
    const { data: profile, error: profileError } = await (supabase
      .from('profiles')
      .select as any)('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Failed to load profile:', profileError);
    }

    const { data: user, error: userError } = await (supabase
      .from('users')
      .select as any)('name, email')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Failed to load user identity:', userError);
    }

    const { data: approvedFacts, error: factsError } = await (supabase
      .from('profile_facts')
      .select as any)('fact_id, fact_type, fact_text, source')
      .eq('user_id', userId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (factsError) {
      console.error('Failed to load approved profile facts:', factsError);
      return null;
    }

    const facts = (approvedFacts || []) as ApprovedProfileFactForTailoring[];

    if (facts.length === 0) {
      return null;
    }

    const legacyProfile = profile as LegacyProfile | null;
    const userIdentity = user as UserIdentity | null;
    const workHistoryFacts = facts.filter((fact) => fact.fact_type === 'work_history');
    const achievementFacts = facts.filter((fact) => fact.fact_type === 'achievement' || fact.fact_type === 'metric');
    const educationFacts = facts.filter((fact) => fact.fact_type === 'education');
    const skillFacts = facts.filter((fact) => fact.fact_type === 'skill');
    const goalFacts = facts.filter((fact) => fact.fact_type === 'goal');

    return {
      full_name: legacyProfile?.full_name || userIdentity?.name || userIdentity?.email || 'Candidate',
      headline: legacyProfile?.headline || undefined,
      summary: legacyProfile?.summary || undefined,
      phone: legacyProfile?.phone || undefined,
      location: legacyProfile?.location || undefined,
      linkedin_url: legacyProfile?.linkedin_url || undefined,
      approved_facts: facts,
      experiences: [
        ...(workHistoryFacts.length > 0
          ? [{
            company: 'Approved profile facts',
            title: 'Work history',
            start_date: '',
            is_current: false,
            bullets: workHistoryFacts.map((fact) => fact.fact_text),
          }]
          : []),
        ...(achievementFacts.length > 0
          ? [{
            company: 'Approved profile facts',
            title: 'Achievements and metrics',
            start_date: '',
            is_current: false,
            bullets: achievementFacts.map((fact) => fact.fact_text),
          }]
          : []),
      ],
      education: educationFacts.map((fact) => ({
        institution: 'Approved education fact',
        degree: fact.fact_text,
        start_date: '',
      })),
      skills: skillFacts.map((fact) => ({
        name: fact.fact_text,
        category: 'approved_fact',
      })),
      star_stories: achievementFacts.map((fact) => ({
        title: `${getFactTypeLabel(fact.fact_type)} ${shortFactId(fact.fact_id)}`,
        situation: '',
        task: '',
        action: '',
        result: fact.fact_text,
        tags: [fact.fact_type],
      })),
      smart_goals: goalFacts.map((fact) => ({
        goal: fact.fact_text,
        status: 'approved',
      })),
    };
  } catch (error) {
    console.error('Error loading profile for tailoring:', error);
    return null;
  }
}

// Build original resume text from profile
export function buildOriginalResume(profile: ProfileForTailoring): string {
  const lines: string[] = [];

  // Header
  lines.push(profile.full_name);
  if (profile.headline) lines.push(profile.headline);
  if (profile.location) lines.push(profile.location);
  if (profile.phone) lines.push(profile.phone);
  if (profile.linkedin_url) lines.push(profile.linkedin_url);
  lines.push('');

  // Summary
  if (profile.summary) {
    lines.push('SUMMARY');
    lines.push(profile.summary);
    lines.push('');
  }

  if (profile.approved_facts.length > 0) {
    lines.push('APPROVED PROFILE FACTS');
    lines.push(formatApprovedFactsForPrompt(profile.approved_facts));
    lines.push('');
    return lines.join('\n');
  }

  // Experience
  if (profile.experiences.length > 0) {
    lines.push('EXPERIENCE');
    for (const exp of profile.experiences) {
      const dateRange = exp.is_current
        ? `${exp.start_date} - Present`
        : `${exp.start_date} - ${exp.end_date || ''}`;
      lines.push(`${exp.title} at ${exp.company}`);
      lines.push(`${exp.location || ''} | ${dateRange}`);
      for (const bullet of exp.bullets) {
        lines.push(`  • ${bullet}`);
      }
      lines.push('');
    }
  }

  // Education
  if (profile.education.length > 0) {
    lines.push('EDUCATION');
    for (const edu of profile.education) {
      const dateRange = edu.end_date
        ? `${edu.start_date} - ${edu.end_date}`
        : `${edu.start_date} - Present`;
      lines.push(`${edu.degree}${edu.field_of_study ? ` in ${edu.field_of_study}` : ''}`);
      lines.push(`${edu.institution} | ${dateRange}`);
      lines.push('');
    }
  }

  // Skills
  if (profile.skills.length > 0) {
    lines.push('SKILLS');
    lines.push(profile.skills.map(s => s.name).join(', '));
  }

  return lines.join('\n');
}
