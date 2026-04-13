export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          image: string | null;
          credits: number;
          stripe_customer_id: string | null;
          terms_accepted_at: string | null;
          privacy_accepted_at: string | null;
          consent_version: string | null;
          career_path:
            | "new_grad"
            | "career_switcher"
            | "employed"
            | "laid_off"
            | "international"
            | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          image?: string | null;
          credits?: number;
          stripe_customer_id?: string | null;
          terms_accepted_at?: string | null;
          privacy_accepted_at?: string | null;
          consent_version?: string | null;
          career_path?:
            | "new_grad"
            | "career_switcher"
            | "employed"
            | "laid_off"
            | "international"
            | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          image?: string | null;
          credits?: number;
          stripe_customer_id?: string | null;
          terms_accepted_at?: string | null;
          privacy_accepted_at?: string | null;
          consent_version?: string | null;
          career_path?:
            | "new_grad"
            | "career_switcher"
            | "employed"
            | "laid_off"
            | "international"
            | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: "purchase" | "usage" | "bonus";
          description: string | null;
          metadata: unknown | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: "purchase" | "usage" | "bonus";
          description?: string | null;
          metadata?: unknown | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: "purchase" | "usage" | "bonus";
          description?: string | null;
          metadata?: unknown | null;
          created_at?: string;
        };
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          type: "bullets" | "cover_letter";
          input: unknown;
          output: string;
          credits_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "bullets" | "cover_letter";
          input: unknown;
          output: string;
          credits_used: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "bullets" | "cover_letter";
          input?: unknown;
          output?: string;
          credits_used?: number;
          created_at?: string;
        };
      };
      profile_facts: {
        Row: {
          fact_id: string;
          user_id: string;
          fact_type: "work_history" | "education" | "skill" | "achievement" | "metric" | "goal";
          fact_text: string;
          is_approved: boolean;
          source: "manual" | "extracted";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          fact_id?: string;
          user_id: string;
          fact_type: "work_history" | "education" | "skill" | "achievement" | "metric" | "goal";
          fact_text: string;
          is_approved: boolean;
          source: "manual" | "extracted";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          fact_id?: string;
          user_id?: string;
          fact_type?: "work_history" | "education" | "skill" | "achievement" | "metric" | "goal";
          fact_text?: string;
          is_approved?: boolean;
          source?: "manual" | "extracted";
          created_at?: string;
          updated_at?: string;
        };
      };
      resume_versions: {
        Row: {
          version_id: string;
          user_id: string;
          raw_content: string;
          tailored_content: string | null;
          label: string | null;
          created_at: string;
        };
        Insert: {
          version_id?: string;
          user_id: string;
          raw_content: string;
          tailored_content?: string | null;
          label?: string | null;
          created_at?: string;
        };
        Update: {
          version_id?: string;
          user_id?: string;
          raw_content?: string;
          tailored_content?: string | null;
          label?: string | null;
          created_at?: string;
        };
      };
      jobs: {
        Row: {
          job_id: string;
          user_id: string;
          title: string;
          company: string;
          url: string | null;
          raw_description: string;
          source: "manual" | "captured" | "api";
          created_at: string;
        };
        Insert: {
          job_id?: string;
          user_id: string;
          title: string;
          company: string;
          url?: string | null;
          raw_description: string;
          source: "manual" | "captured" | "api";
          created_at?: string;
        };
        Update: {
          job_id?: string;
          user_id?: string;
          title?: string;
          company?: string;
          url?: string | null;
          raw_description?: string;
          source?: "manual" | "captured" | "api";
          created_at?: string;
        };
      };
      fit_analyses: {
        Row: {
          analysis_id: string;
          user_id: string;
          job_id: string;
          verdict: "apply" | "stretch" | "skip";
          signals_json: {
            strengths_matched: string[];
            must_have_gaps: string[];
            stretch_areas: string[];
          };
          rationale: string;
          created_at: string;
        };
        Insert: {
          analysis_id?: string;
          user_id: string;
          job_id: string;
          verdict: "apply" | "stretch" | "skip";
          signals_json: {
            strengths_matched: string[];
            must_have_gaps: string[];
            stretch_areas: string[];
          };
          rationale: string;
          created_at?: string;
        };
        Update: {
          analysis_id?: string;
          user_id?: string;
          job_id?: string;
          verdict?: "apply" | "stretch" | "skip";
          signals_json?: {
            strengths_matched: string[];
            must_have_gaps: string[];
            stretch_areas: string[];
          };
          rationale?: string;
          created_at?: string;
        };
      };
      generated_assets: {
        Row: {
          asset_id: string;
          user_id: string;
          job_id: string | null;
          asset_type: "tailored_bullets" | "cover_letter" | "follow_up";
          content: string;
          evidence_json: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          asset_id?: string;
          user_id: string;
          job_id?: string | null;
          asset_type: "tailored_bullets" | "cover_letter" | "follow_up";
          content: string;
          evidence_json?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          asset_id?: string;
          user_id?: string;
          job_id?: string | null;
          asset_type?: "tailored_bullets" | "cover_letter" | "follow_up";
          content?: string;
          evidence_json?: Record<string, unknown>;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
