import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ProfileStrength } from '@/types/profile';

const WEIGHTS = {
  basic_info: 20,
  experiences: 30,
  education: 20,
  skills: 20,
  star_stories: 5,
  smart_goals: 5, // Split 10 points between stories and goals
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    const { data: profile } = await (supabase
      .from('profiles')
      .select as any)('*')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      const strength: ProfileStrength = {
        overall_percentage: 0,
        sections: {
          basic_info: { completed: false, weight: WEIGHTS.basic_info },
          experiences: { completed: false, weight: WEIGHTS.experiences, count: 0 },
          education: { completed: false, weight: WEIGHTS.education, count: 0 },
          skills: { completed: false, weight: WEIGHTS.skills, count: 0 },
          star_stories: { completed: false, weight: WEIGHTS.star_stories, count: 0 },
          smart_goals: { completed: false, weight: WEIGHTS.smart_goals, count: 0 },
        },
        recommendations: [
          'Create your profile with basic information',
          'Add at least 2 work experiences',
          'Add your education background',
          'List your top 5-10 skills',
          'Create 3-5 STAR stories for interview prep',
          'Set a SMART goal for your career',
        ],
      };
      return NextResponse.json({ strength });
    }

    const { data: experiences } = await (supabase
      .from('experiences')
      .select as any)('id')
      .eq('profile_id', profile.id);

    const { data: education } = await (supabase
      .from('education')
      .select as any)('id')
      .eq('profile_id', profile.id);

    const { data: skills } = await (supabase
      .from('skills')
      .select as any)('id')
      .eq('profile_id', profile.id);

    const { data: starStories } = await (supabase
      .from('star_stories')
      .select as any)('id')
      .eq('profile_id', profile.id);

    const { data: smartGoals } = await (supabase
      .from('smart_goals')
      .select as any)('id')
      .eq('profile_id', profile.id);

    const experiencesCount = experiences?.length || 0;
    const educationCount = education?.length || 0;
    const skillsCount = skills?.length || 0;
    const starStoriesCount = starStories?.length || 0;
    const smartGoalsCount = smartGoals?.length || 0;

    const basicInfoComplete =
      !!profile.full_name &&
      !!profile.headline &&
      !!profile.summary &&
      !!profile.location;

    const experiencesComplete = experiencesCount >= 2;
    const educationComplete = educationCount >= 1;
    const skillsComplete = skillsCount >= 5;
    const starStoriesComplete = starStoriesCount >= 3;
    const smartGoalsComplete = smartGoalsCount >= 1; // At least 1 goal

    let totalScore = 0;
    if (basicInfoComplete) totalScore += WEIGHTS.basic_info;
    if (experiencesComplete) totalScore += WEIGHTS.experiences;
    if (educationComplete) totalScore += WEIGHTS.education;
    if (skillsComplete) totalScore += WEIGHTS.skills;
    if (starStoriesComplete) totalScore += WEIGHTS.star_stories;
    if (smartGoalsComplete) totalScore += WEIGHTS.smart_goals;

    const recommendations: string[] = [];
    if (!basicInfoComplete) {
      recommendations.push('Complete your profile with headline, summary, and location');
    }
    if (!experiencesComplete) {
      recommendations.push(`Add ${2 - experiencesCount} more work experience${experiencesCount === 1 ? '' : 's'}`);
    }
    if (!educationComplete) {
      recommendations.push('Add your education background');
    }
    if (!skillsComplete) {
      recommendations.push(`Add ${5 - skillsCount} more skill${skillsCount === 4 ? '' : 's'} (aim for 5-10 total)`);
    }
    if (!starStoriesComplete) {
      recommendations.push(`Create ${3 - starStoriesCount} more STAR stor${starStoriesCount === 2 ? 'y' : 'ies'} for interview prep`);
    }
    if (!smartGoalsComplete) {
      recommendations.push('Set at least 1 SMART goal for your career');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your profile is complete! Keep it updated with new experiences.');
    }

    const strength: ProfileStrength = {
      overall_percentage: Math.min(totalScore, 100), // Cap at 100
      sections: {
        basic_info: {
          completed: basicInfoComplete,
          weight: WEIGHTS.basic_info,
        },
        experiences: {
          completed: experiencesComplete,
          weight: WEIGHTS.experiences,
          count: experiencesCount,
        },
        education: {
          completed: educationComplete,
          weight: WEIGHTS.education,
          count: educationCount,
        },
        skills: {
          completed: skillsComplete,
          weight: WEIGHTS.skills,
          count: skillsCount,
        },
        star_stories: {
          completed: starStoriesComplete,
          weight: WEIGHTS.star_stories,
          count: starStoriesCount,
        },
        smart_goals: {
          completed: smartGoalsComplete,
          weight: WEIGHTS.smart_goals,
          count: smartGoalsCount,
        },
      },
      recommendations,
    };

    return NextResponse.json({ strength });
  } catch (error: any) {
    console.error('Get profile strength error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate profile strength' },
      { status: 500 }
    );
  }
}
