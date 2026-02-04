// Profile Loader - Loads user profile data for ATS analysis and tailoring
import { SupabaseClient } from '@supabase/supabase-js';
import { ProfileForTailoring } from '@/types/job-packs';

export async function loadProfileForTailoring(
  userId: string,
  supabase: SupabaseClient
): Promise<ProfileForTailoring | null> {
  try {
    // Load profile
    const { data: profile, error: profileError } = await (supabase
      .from('profiles')
      .select as any)('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Failed to load profile:', profileError);
      return null;
    }

    // Load experiences with bullets
    const { data: experiences, error: expError } = await (supabase
      .from('experiences')
      .select as any)('*, bullets(*)')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: true });

    if (expError) {
      console.error('Failed to load experiences:', expError);
    }

    // Load education
    const { data: education, error: eduError } = await (supabase
      .from('education')
      .select as any)('*')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: true });

    if (eduError) {
      console.error('Failed to load education:', eduError);
    }

    // Load skills
    const { data: skills, error: skillsError } = await (supabase
      .from('skills')
      .select as any)('*')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: true });

    if (skillsError) {
      console.error('Failed to load skills:', skillsError);
    }

    // Format experiences with bullets
    const formattedExperiences = (experiences || []).map((exp: any) => ({
      company: exp.company,
      title: exp.title,
      location: exp.location,
      start_date: exp.start_date,
      end_date: exp.end_date,
      is_current: exp.is_current,
      bullets: (exp.bullets || []).map((b: any) => b.mined_metrics?.enhanced_content || b.content),
    }));

    // Format education
    const formattedEducation = (education || []).map((edu: any) => ({
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.field_of_study,
      start_date: edu.start_date,
      end_date: edu.end_date,
    }));

    // Format skills
    const formattedSkills = (skills || []).map((skill: any) => ({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
    }));

    return {
      full_name: profile.full_name,
      headline: profile.headline,
      summary: profile.summary,
      phone: profile.phone,
      location: profile.location,
      linkedin_url: profile.linkedin_url,
      experiences: formattedExperiences,
      education: formattedEducation,
      skills: formattedSkills,
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
