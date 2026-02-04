import { MatchReason } from '@/types/intelligence';

interface UserProfile {
  experiences?: Array<{
    title: string;
    company: string;
  }>;
  skills?: Array<{
    name: string;
    category: string;
  }>;
  education?: Array<{
    degree: string;
    field_of_study?: string;
  }>;
}

interface JobData {
  title: string;
  company: string;
  description: string;
  location?: string;
}

export function calculateMatchScore(
  job: JobData,
  profile: UserProfile
): { score: number; reasons: MatchReason[] } {
  const reasons: MatchReason[] = [];
  let totalScore = 0;

  const jobText = `${job.title} ${job.description}`.toLowerCase();

  if (profile.skills && profile.skills.length > 0) {
    const matchedSkills = profile.skills.filter((skill) =>
      jobText.includes(skill.name.toLowerCase())
    );

    matchedSkills.forEach((skill) => {
      const weight = skill.category === 'technical' ? 15 : 10;
      totalScore += weight;
      reasons.push({
        type: 'skill',
        value: skill.name,
        weight,
      });
    });
  }

  if (profile.experiences && profile.experiences.length > 0) {
    const relevantExp = profile.experiences.find((exp) =>
      jobText.includes(exp.title.toLowerCase().split(' ')[0])
    );

    if (relevantExp) {
      const weight = 20;
      totalScore += weight;
      reasons.push({
        type: 'experience',
        value: relevantExp.title,
        weight,
      });
    }
  }

  if (profile.education && profile.education.length > 0) {
    const relevantEdu = profile.education.find(
      (edu) =>
        jobText.includes(edu.degree.toLowerCase()) ||
        (edu.field_of_study &&
          jobText.includes(edu.field_of_study.toLowerCase()))
    );

    if (relevantEdu) {
      const weight = 10;
      totalScore += weight;
      reasons.push({
        type: 'education',
        value: edu.degree,
        weight,
      });
    }
  }

  const jobTitleWords = job.title.toLowerCase().split(' ');
  const profileTitles = profile.experiences
    ?.map((exp) => exp.title.toLowerCase())
    .join(' ')
    .split(' ') || [];

  const titleMatches = jobTitleWords.filter((word) =>
    profileTitles.some((profileWord) => profileWord.includes(word) && word.length > 3)
  );

  if (titleMatches.length > 0) {
    const weight = 15;
    totalScore += weight;
    reasons.push({
      type: 'keyword',
      value: titleMatches.join(', '),
      weight,
    });
  }

  const finalScore = Math.min(100, totalScore);

  return {
    score: finalScore,
    reasons: reasons.slice(0, 5),
  };
}
