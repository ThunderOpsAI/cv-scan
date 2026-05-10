export type JobSource = "manual" | "captured" | "api";

export type FitVerdict = "apply" | "stretch" | "skip";

export interface FitSignals {
  strengths_matched: string[];
  must_have_gaps: string[];
  stretch_areas: string[];
}

export interface JobRecord {
  job_id: string;
  user_id: string;
  title: string;
  company: string;
  url: string | null;
  raw_description: string;
  source: JobSource;
  created_at: string;
}

export interface FitAnalysisRecord {
  analysis_id: string;
  user_id: string;
  job_id: string;
  verdict: FitVerdict;
  signals_json: FitSignals;
  rationale: string;
  created_at: string;
}

export interface CreateJobRequest {
  title: string;
  company: string;
  url?: string | null;
  raw_description: string;
  source?: JobSource;
}
