// Phase 0: Foundation - Profile Types

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  github_url?: string;
  created_at: string;
  updated_at: string;
}

export type ProfileFactType =
  | 'work_history'
  | 'education'
  | 'skill'
  | 'achievement'
  | 'metric'
  | 'goal';

export type ProfileFactSource = 'manual' | 'extracted';

export interface ProfileFact {
  fact_id: string;
  user_id: string;
  fact_type: ProfileFactType;
  fact_text: string;
  is_approved: boolean;
  source: ProfileFactSource;
  created_at: string;
  updated_at: string;
}

export interface ResumeVersion {
  version_id: string;
  user_id: string;
  raw_content: string;
  tailored_content?: string | null;
  label?: string | null;
  created_at: string;
}

export interface CandidateProfileFact {
  temp_id: string;
  fact_type: ProfileFactType;
  fact_text: string;
  source: 'extracted';
}

export interface Experience {
  id: string;
  profile_id: string;
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MinedMetrics {
  questions: string[];
  answers: string[];
  enhanced_content: string;
}

export interface Bullet {
  id: string;
  experience_id: string;
  content: string;
  mined_metrics?: MinedMetrics;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  profile_id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  gpa?: number;
  honors?: string;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SkillCategory = 'technical' | 'soft' | 'language' | 'certification';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  id: string;
  profile_id: string;
  category: SkillCategory;
  name: string;
  proficiency?: SkillProficiency;
  years_of_experience?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StarStory {
  id: string;
  profile_id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface SmartGoal {
  id: string;
  profile_id: string;
  goal: string;
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  time_bound?: string;
  status: 'in_progress' | 'completed';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Request/Response types for API

export interface CreateProfileRequest {
  full_name: string;
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  github_url?: string;
}

export type UpdateProfileRequest = Partial<CreateProfileRequest>;

export interface ResumeImportRequest {
  raw_content: string;
  label?: string;
}

export interface ResumeImportResponse {
  resume_version: ResumeVersion;
  candidate_facts: CandidateProfileFact[];
  review_message: string;
}

export interface SaveProfileFactsRequest {
  facts: Array<{
    fact_type: ProfileFactType;
    fact_text: string;
    source?: ProfileFactSource;
  }>;
}

/** PATCH /api/profile/facts/[id] */
export interface UpdateProfileFactRequest {
  fact_type?: ProfileFactType;
  fact_text?: string;
  is_approved?: boolean;
}

export interface CreateExperienceRequest {
  profile_id: string;
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export type UpdateExperienceRequest = Partial<CreateExperienceRequest>;

export interface CreateBulletRequest {
  experience_id: string;
  content: string;
}

export interface UpdateBulletRequest {
  content?: string;
  mined_metrics?: MinedMetrics;
}

export interface MineMetricsRequest {
  bullet_id: string;
  context: {
    job_title: string;
    company: string;
    bullet_content: string;
  };
}

export interface MineMetricsResponse {
  questions: string[];
}

export interface SubmitMetricsAnswersRequest {
  bullet_id: string;
  answers: string[];
}

export interface SubmitMetricsAnswersResponse {
  enhanced_content: string;
  mined_metrics: MinedMetrics;
}

export interface CreateEducationRequest {
  profile_id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  gpa?: number;
  honors?: string;
  description?: string;
}

export type UpdateEducationRequest = Partial<CreateEducationRequest>;

export interface CreateSkillRequest {
  profile_id: string;
  category: SkillCategory;
  name: string;
  proficiency?: SkillProficiency;
  years_of_experience?: number;
}

export type UpdateSkillRequest = Partial<Omit<CreateSkillRequest, 'profile_id'>>;

export interface CreateStarStoryRequest {
  profile_id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags?: string[];
}

export type UpdateStarStoryRequest = Partial<CreateStarStoryRequest>;

export interface CreateSmartGoalRequest {
  profile_id: string;
  goal: string;
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  time_bound?: string;
  status?: 'in_progress' | 'completed';
}

export type UpdateSmartGoalRequest = Partial<Omit<CreateSmartGoalRequest, 'profile_id'>>;

export interface ProfileStrength {
  overall_percentage: number;
  sections: {
    basic_info: {
      completed: boolean;
      weight: number;
    };
    experiences: {
      completed: boolean;
      weight: number;
      count: number;
    };
    education: {
      completed: boolean;
      weight: number;
      count: number;
    };
    skills: {
      completed: boolean;
      weight: number;
      count: number;
    };
    star_stories: {
      completed: boolean;
      weight: number;
      count: number;
    };
    smart_goals: {
      completed: boolean;
      weight: number;
      count: number;
    };
  };
  recommendations: string[];
}
