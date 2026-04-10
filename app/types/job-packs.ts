// Phase 2: Job Packs - ATS Scanner, Job Packs, Tailoring Types

export interface JobPack {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  job_description: string;
  resume_version?: string;
  cover_letter?: string;
  ats_score?: number;
  cultural_fit_warnings: string[];
  created_at: string;
  updated_at: string;
}

export interface KeywordMatches {
  found: string[];
  missing: string[];
}

export interface SectionScores {
  skills: number;
  experience: number;
  education: number;
  format: number;
}

export interface ATSScan {
  id: string;
  user_id: string;
  job_pack_id?: string;
  job_description: string;
  ats_score: number;
  keyword_matches: KeywordMatches;
  section_scores: SectionScores;
  recommendations: string[];
  is_free_scan: boolean;
  created_at: string;
}

// ATS Analysis Result from Gemini
export interface ATSAnalysisResult {
  score: number;
  keyword_matches: KeywordMatches;
  section_scores: SectionScores;
  recommendations: string[];
}

// Request/Response types for APIs

export interface ATSScanRequest {
  job_description: string;
}

export interface ATSScanResponse {
  scan: ATSScan;
  free_scans_remaining: number;
  credits_charged: number;
}

export interface CreateJobPackRequest {
  job_title: string;
  company: string;
  job_description: string;
}

export interface UpdateJobPackRequest {
  job_title?: string;
  company?: string;
  job_description?: string;
  resume_version?: string;
  cover_letter?: string;
}

export interface JobPackResponse {
  job_pack: JobPack;
  ats_scan?: ATSScan;
}

export interface JobPackListResponse {
  job_packs: JobPack[];
  total: number;
}

export interface TailorDiffChange {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export interface TailorDiffResponse {
  original: string;
  tailored: string;
  changes: TailorDiffChange[];
}

export interface ExportFormat {
  format: 'pdf' | 'docx';
}

// Profile data for tailoring
export interface ProfileForTailoring {
  full_name: string;
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  experiences: ExperienceForTailoring[];
  education: EducationForTailoring[];
  skills: SkillForTailoring[];
  star_stories: StarStoryForTailoring[];
  smart_goals: SmartGoalForTailoring[];
}

export interface ExperienceForTailoring {
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  bullets: string[];
}

export interface EducationForTailoring {
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
}

export interface SkillForTailoring {
  name: string;
  category: string;
  proficiency?: string;
}

export interface StarStoryForTailoring {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags?: string[];
}

export interface SmartGoalForTailoring {
  goal: string;
  status: string;
  achievable?: string;
  relevant?: string;
}
