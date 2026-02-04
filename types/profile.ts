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

export interface UpdateProfileRequest extends Partial<CreateProfileRequest> {}

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

export interface UpdateExperienceRequest extends Partial<CreateExperienceRequest> {}

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

export interface UpdateEducationRequest extends Partial<CreateEducationRequest> {}

export interface CreateSkillRequest {
  profile_id: string;
  category: SkillCategory;
  name: string;
  proficiency?: SkillProficiency;
  years_of_experience?: number;
}

export interface UpdateSkillRequest extends Partial<Omit<CreateSkillRequest, 'profile_id'>> {}

export interface CreateStarStoryRequest {
  profile_id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags?: string[];
}

export interface UpdateStarStoryRequest extends Partial<CreateStarStoryRequest> {}

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
  };
  recommendations: string[];
}
