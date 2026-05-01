// Phase 1: Intelligence - Copilot, Company Research, Job Discovery Types

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CompanyCache {
  id: string;
  company_name: string;
  data: CompanyData;
  created_at: string;
  expires_at: string;
}

export interface CompanyData {
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  headquarters?: string;
  website?: string;
  culture?: string[];
  values?: string[];
  recent_news?: string[];
  glassdoor_rating?: number;
  summary?: string;
}

export type SearchFrequency = 'daily' | 'weekly' | 'never';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  query_params: SearchQueryParams;
  frequency: SearchFrequency;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchQueryParams {
  keywords?: string;
  location?: string;
  radius?: number;
  job_type?: string; // 'full-time', 'part-time', 'contract', etc.
  salary_min?: number;
  remote?: boolean;
}

export type JobStatus = 'new' | 'viewed' | 'saved' | 'applied' | 'rejected';
export type JobSource = 'adzuna' | 'linkedin' | 'indeed' | 'custom';

export interface DiscoveredJob {
  id: string;
  user_id: string;
  saved_search_id?: string;
  external_id: string;
  source: JobSource;
  title: string;
  company: string;
  location?: string;
  description?: string;
  url: string;
  salary_min?: number;
  salary_max?: number;
  posted_at?: string;
  match_score?: number;
  match_reasons?: MatchReason[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface MatchReason {
  type: 'skill' | 'experience' | 'education' | 'location' | 'keyword';
  value: string;
  weight: number;
}

// Request/Response types

export interface CreateConversationRequest {
  title?: string;
  initial_message?: string;
}

export interface SendMessageRequest {
  conversation_id: string;
  content: string;
  context?: {
    profile_id?: string;
    job_id?: string;
    company_name?: string;
  };
}

export interface SendMessageResponse {
  message: Message;
  assistant_message: Message;
}

export interface StreamMessageChunk {
  type: 'token' | 'done' | 'error';
  content?: string;
  error?: string;
}

export interface GetCompanyRequest {
  name: string;
  force_refresh?: boolean;
}

export interface GetCompanyResponse {
  company: CompanyData;
  cached: boolean;
  expires_at?: string;
}

export interface DiscoverJobsRequest {
  keywords?: string;
  location?: string;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface DiscoverJobsResponse {
  jobs: DiscoveredJob[];
  total: number;
  page: number;
  has_more: boolean;
}

export interface CreateSavedSearchRequest {
  name: string;
  query_params: SearchQueryParams;
  frequency?: SearchFrequency;
}

export interface UpdateSavedSearchRequest extends Partial<CreateSavedSearchRequest> {}

export interface UpdateJobStatusRequest {
  status: JobStatus;
}

// Adzuna API types (external)

export interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  created: string;
  category?: {
    label: string;
    tag: string;
  };
}

export interface AdzunaSearchResponse {
  results: AdzunaJob[];
  count: number;
  mean: number;
}

// Copilot context types

export interface CopilotContext {
  profile?: {
    full_name: string;
    headline?: string;
    experiences?: Array<{
      company: string;
      title: string;
      years: number;
    }>;
    skills?: string[];
  };
  current_job?: {
    title: string;
    company: string;
    description: string;
  };
  conversation_history?: Message[];
}

export interface CopilotPrompt {
  system: string;
  user: string;
  context?: CopilotContext;
}
