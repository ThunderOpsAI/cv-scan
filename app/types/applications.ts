// Phase 3: Application Tracking Types

export type ApplicationStatus = 'saved' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
export type ApplicationPriority = 'low' | 'medium' | 'high';
export type StageType = 'phone_screen' | 'technical' | 'behavioral' | 'onsite' | 'final' | 'offer' | 'other';
export type StageOutcome = 'pending' | 'passed' | 'failed' | 'cancelled';
export type EmailType = 'thank_you' | 'follow_up' | 'withdraw' | 'accept' | 'decline' | 'negotiate';
export type ReminderType = 'follow_up' | 'interview_prep' | 'application_deadline' | 'custom';

export interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
}

export interface Interviewer {
  name: string;
  title?: string;
  linkedin?: string;
  notes?: string;
}

export interface StructuredNotes {
  topics_discussed: string[];
  questions_they_asked: string[];
  their_concerns: string[];
  positive_signals: string[];
  next_steps_mentioned?: string;
  follow_up_points: string[];
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  title: string;
  url?: string;
  job_description?: string;
  location?: string;
  salary_range?: SalaryRange;
  source?: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  applied_at?: string;
  ats_score?: number;
  cultural_score?: number;
  notes?: string;
  job_pack_id?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStage {
  id: string;
  application_id: string;
  stage_type: StageType;
  stage_name?: string;
  scheduled_at?: string;
  completed_at?: string;
  interviewers: Interviewer[];
  raw_notes?: string;
  ai_structured?: StructuredNotes;
  outcome?: StageOutcome;
  feedback?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GeneratedEmail {
  id: string;
  user_id: string;
  application_id: string;
  stage_id?: string;
  email_type: EmailType;
  recipient_name?: string;
  recipient_email?: string;
  subject?: string;
  content: string;
  sent_at?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  application_id?: string;
  stage_id?: string;
  reminder_type: ReminderType;
  title: string;
  message?: string;
  scheduled_for: string;
  sent_at?: string;
  dismissed_at?: string;
  created_at: string;
}

// Request/Response types

export interface CreateApplicationRequest {
  company: string;
  title: string;
  url?: string;
  job_description?: string;
  location?: string;
  salary_range?: SalaryRange;
  source?: string;
  status?: ApplicationStatus;
  priority?: ApplicationPriority;
  applied_at?: string;
  notes?: string;
  job_pack_id?: string;
}

export interface UpdateApplicationRequest extends Partial<CreateApplicationRequest> {
  is_archived?: boolean;
  ats_score?: number;
  cultural_score?: number;
}

export interface ApplicationListResponse {
  applications: Application[];
  total: number;
}

export interface ApplicationWithStages extends Application {
  stages: ApplicationStage[];
}

export interface CreateStageRequest {
  application_id: string;
  stage_type: StageType;
  stage_name?: string;
  scheduled_at?: string;
  interviewers?: Interviewer[];
}

export interface UpdateStageRequest {
  stage_type?: StageType;
  stage_name?: string;
  scheduled_at?: string;
  completed_at?: string;
  interviewers?: Interviewer[];
  raw_notes?: string;
  outcome?: StageOutcome;
  feedback?: string;
}

export interface StructureNotesRequest {
  stage_id: string;
  raw_notes: string;
}

export interface GenerateEmailRequest {
  application_id: string;
  stage_id?: string;
  email_type: EmailType;
  context?: string;
}

export interface GenerateEmailResponse {
  email: GeneratedEmail;
  credits_charged: number;
}

// Kanban board types
export interface KanbanColumn {
  id: ApplicationStatus;
  title: string;
  applications: Application[];
}

export interface KanbanBoard {
  columns: KanbanColumn[];
}
