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
          plan_tier: "free" | "starter" | "pro" | "enterprise";
          stripe_subscription_id: string | null;
          stripe_subscription_status: string | null;
          terms_accepted_at: string | null;
          privacy_accepted_at: string | null;
          consent_version: string | null;
          marketing_opt_in: boolean;
          marketing_opt_in_at: string | null;
          hashed_password: string | null;
          emailVerified: string | null;
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
          plan_tier?: "free" | "starter" | "pro" | "enterprise";
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string | null;
          terms_accepted_at?: string | null;
          privacy_accepted_at?: string | null;
          consent_version?: string | null;
          marketing_opt_in?: boolean;
          marketing_opt_in_at?: string | null;
          hashed_password?: string | null;
          emailVerified?: string | null;
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
          plan_tier?: "free" | "starter" | "pro" | "enterprise";
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string | null;
          terms_accepted_at?: string | null;
          privacy_accepted_at?: string | null;
          consent_version?: string | null;
          marketing_opt_in?: boolean;
          marketing_opt_in_at?: string | null;
          hashed_password?: string | null;
          emailVerified?: string | null;
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
        Relationships: [];
      };
      verification_tokens: {
        Row: {
          identifier: string;
          token: string;
          expires: string;
        };
        Insert: {
          identifier: string;
          token: string;
          expires: string;
        };
        Update: {
          identifier?: string;
          token?: string;
          expires?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      analytics_events: {
        Row: {
          event_id: string;
          user_id: string | null;
          event_name:
            | "user_signed_up"
            | "resume_imported"
            | "facts_reviewed"
            | "job_fit_run"
            | "tailoring_run"
            | "cover_letter_run"
            | "application_saved"
            | "interview_prep_run"
            | "credit_purchased"
            | "credit_spent"
            | "critical_error";
          properties_json: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          event_id?: string;
          user_id?: string | null;
          event_name:
            | "user_signed_up"
            | "resume_imported"
            | "facts_reviewed"
            | "job_fit_run"
            | "tailoring_run"
            | "cover_letter_run"
            | "application_saved"
            | "interview_prep_run"
            | "credit_purchased"
            | "credit_spent"
            | "critical_error";
          properties_json?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string | null;
          event_name?:
            | "user_signed_up"
            | "resume_imported"
            | "facts_reviewed"
            | "job_fit_run"
            | "tailoring_run"
            | "cover_letter_run"
            | "application_saved"
            | "interview_prep_run"
            | "credit_purchased"
            | "credit_spent"
            | "critical_error";
          properties_json?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };

      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          headline: string | null;
          summary: string | null;
          phone: string | null;
          location: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          github_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          full_name: string;
          headline?: string | null;
          summary?: string | null;
          phone?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          github_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          full_name?: string;
          headline?: string | null;
          summary?: string | null;
          phone?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          github_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      experiences: {
        Row: {
          id: string;
          profile_id: string;
          company: string;
          title: string;
          location: string | null;
          start_date: string;
          end_date: string | null;
          is_current: boolean | null;
          description: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          profile_id: string;
          company: string;
          title: string;
          location?: string | null;
          start_date: string;
          end_date?: string | null;
          is_current?: boolean | null;
          description?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          profile_id?: string;
          company?: string;
          title?: string;
          location?: string | null;
          start_date?: string;
          end_date?: string | null;
          is_current?: boolean | null;
          description?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bullets: {
        Row: {
          id: string;
          experience_id: string;
          content: string;
          mined_metrics: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          experience_id: string;
          content: string;
          mined_metrics?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          experience_id?: string;
          content?: string;
          mined_metrics?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bullets_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      education: {
        Row: {
          id: string;
          profile_id: string;
          institution: string;
          degree: string;
          field_of_study: string | null;
          location: string | null;
          start_date: string;
          end_date: string | null;
          gpa: number | null;
          honors: string | null;
          description: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          profile_id: string;
          institution: string;
          degree: string;
          field_of_study?: string | null;
          location?: string | null;
          start_date: string;
          end_date?: string | null;
          gpa?: number | null;
          honors?: string | null;
          description?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          profile_id?: string;
          institution?: string;
          degree?: string;
          field_of_study?: string | null;
          location?: string | null;
          start_date?: string;
          end_date?: string | null;
          gpa?: number | null;
          honors?: string | null;
          description?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          profile_id: string;
          category: string;
          name: string;
          proficiency: string | null;
          years_of_experience: number | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          profile_id: string;
          category: string;
          name: string;
          proficiency?: string | null;
          years_of_experience?: number | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          profile_id?: string;
          category?: string;
          name?: string;
          proficiency?: string | null;
          years_of_experience?: number | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      star_stories: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          situation: string;
          task: string;
          action: string;
          result: string;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          profile_id: string;
          title: string;
          situation: string;
          task: string;
          action: string;
          result: string;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          profile_id?: string;
          title?: string;
          situation?: string;
          task?: string;
          action?: string;
          result?: string;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          last_message_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          title: string;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          title?: string;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string | null;
          conversation_id: string;
          role: string;
          content: string;
          metadata: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          created_at: string;
        };
        Insert: {
          id?: string | null;
          conversation_id: string;
          role: string;
          content: string;
          metadata?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          created_at?: string;
        };
        Update: {
          id?: string | null;
          conversation_id?: string;
          role?: string;
          content?: string;
          metadata?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          created_at?: string;
        };
        Relationships: [];
      };
      company_cache: {
        Row: {
          id: string | null;
          company_name: string;
          data: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string | null;
          company_name: string;
          data: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string | null;
          company_name?: string;
          data?: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          query_params: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          frequency: string | null;
          last_run_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          name: string;
          query_params: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          frequency?: string | null;
          last_run_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          name?: string;
          query_params?: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          frequency?: string | null;
          last_run_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      discovered_jobs: {
        Row: {
          id: string;
          user_id: string;
          saved_search_id: string | null;
          external_id: string;
          source: string;
          title: string;
          company: string;
          location: string | null;
          description: string | null;
          url: string;
          salary_min: number | null;
          salary_max: number | null;
          posted_at: string | null;
          match_score: number | null;
          match_reasons: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          saved_search_id?: string | null;
          external_id: string;
          source: string;
          title: string;
          company: string;
          location?: string | null;
          description?: string | null;
          url: string;
          salary_min?: number | null;
          salary_max?: number | null;
          posted_at?: string | null;
          match_score?: number | null;
          match_reasons?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          saved_search_id?: string | null;
          external_id?: string;
          source?: string;
          title?: string;
          company?: string;
          location?: string | null;
          description?: string | null;
          url?: string;
          salary_min?: number | null;
          salary_max?: number | null;
          posted_at?: string | null;
          match_score?: number | null;
          match_reasons?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      smart_goals: {
        Row: {
          id: string;
          profile_id: string;
          goal: string;
          specific: string | null;
          measurable: string | null;
          achievable: string | null;
          relevant: string | null;
          time_bound: string | null;
          status: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          profile_id: string;
          goal: string;
          specific?: string | null;
          measurable?: string | null;
          achievable?: string | null;
          relevant?: string | null;
          time_bound?: string | null;
          status?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          profile_id?: string;
          goal?: string;
          specific?: string | null;
          measurable?: string | null;
          achievable?: string | null;
          relevant?: string | null;
          time_bound?: string | null;
          status?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      job_packs: {
        Row: {
          id: string;
          user_id: string;
          job_title: string;
          company: string;
          job_description: string;
          resume_version: string | null;
          cover_letter: string | null;
          ats_score: number | null;
          cultural_fit_warnings: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          job_title: string;
          company: string;
          job_description: string;
          resume_version?: string | null;
          cover_letter?: string | null;
          ats_score?: number | null;
          cultural_fit_warnings?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          job_title?: string;
          company?: string;
          job_description?: string;
          resume_version?: string | null;
          cover_letter?: string | null;
          ats_score?: number | null;
          cultural_fit_warnings?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ats_scans: {
        Row: {
          id: string;
          user_id: string;
          job_pack_id: string | null;
          job_description: string;
          ats_score: number;
          keyword_matches: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          section_scores: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          recommendations: string[] | null;
          is_free_scan: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          job_pack_id?: string | null;
          job_description: string;
          ats_score: number;
          keyword_matches?: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          section_scores?: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          recommendations?: string[] | null;
          is_free_scan?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          job_pack_id?: string | null;
          job_description?: string;
          ats_score?: number;
          keyword_matches?: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          section_scores?: Record<string, unknown> | unknown[] | string | number | boolean | object | null;
          recommendations?: string[] | null;
          is_free_scan?: boolean | null;
          created_at?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          company: string;
          title: string;
          url: string | null;
          job_description: string | null;
          location: string | null;
          salary_range: { min?: number; max?: number; currency?: string } | null;
          source: string | null;
          status: "saved" | "applied" | "screening" | "interviewing" | "offer" | "rejected" | "withdrawn";
          priority: "low" | "medium" | "high";
          applied_at: string | null;
          ats_score: number | null;
          cultural_score: number | null;
          notes: string | null;
          job_pack_id: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          company: string;
          title: string;
          url?: string | null;
          job_description?: string | null;
          location?: string | null;
          salary_range?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          source?: string | null;
          status?: string | null;
          priority?: string | null;
          applied_at?: string | null;
          ats_score?: number | null;
          cultural_score?: number | null;
          notes?: string | null;
          job_pack_id?: string | null;
          is_archived?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          company?: string;
          title?: string;
          url?: string | null;
          job_description?: string | null;
          location?: string | null;
          salary_range?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          source?: string | null;
          status?: string | null;
          priority?: string | null;
          applied_at?: string | null;
          ats_score?: number | null;
          cultural_score?: number | null;
          notes?: string | null;
          job_pack_id?: string | null;
          is_archived?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      application_stages: {
        Row: {
          id: string;
          application_id: string;
          stage_type: "phone_screen" | "technical" | "behavioral" | "onsite" | "final" | "offer" | "other";
          stage_name: string | null;
          scheduled_at: string | null;
          completed_at: string | null;
          interviewers: { name: string; title?: string; linkedin?: string; notes?: string }[];
          raw_notes: string | null;
          ai_structured: {
            topics_discussed: string[];
            questions_they_asked: string[];
            their_concerns: string[];
            positive_signals: string[];
            next_steps_mentioned?: string;
            follow_up_points: string[];
          } | null;
          outcome: "pending" | "passed" | "failed" | "cancelled" | null;
          feedback: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          application_id: string;
          stage_type: string;
          stage_name?: string | null;
          scheduled_at?: string | null;
          completed_at?: string | null;
          interviewers?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          raw_notes?: string | null;
          ai_structured?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          outcome?: string | null;
          feedback?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          application_id?: string;
          stage_type?: string;
          stage_name?: string | null;
          scheduled_at?: string | null;
          completed_at?: string | null;
          interviewers?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          raw_notes?: string | null;
          ai_structured?: Record<string, unknown> | unknown[] | string | number | boolean | object | null | null;
          outcome?: string | null;
          feedback?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_stages_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          }
        ];
      };
      generated_emails: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          stage_id: string | null;
          email_type: "thank_you" | "follow_up" | "withdraw" | "accept" | "decline" | "negotiate";
          recipient_name: string | null;
          recipient_email: string | null;
          subject: string | null;
          content: string;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          application_id: string;
          stage_id?: string | null;
          email_type: string;
          recipient_name?: string | null;
          recipient_email?: string | null;
          subject?: string | null;
          content: string;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          application_id?: string;
          stage_id?: string | null;
          email_type?: string;
          recipient_name?: string | null;
          recipient_email?: string | null;
          subject?: string | null;
          content?: string;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          stage_id: string | null;
          reminder_type: string;
          title: string;
          message: string | null;
          scheduled_for: string;
          sent_at: string | null;
          dismissed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          application_id?: string | null;
          stage_id?: string | null;
          reminder_type: string;
          title: string;
          message?: string | null;
          scheduled_for: string;
          sent_at?: string | null;
          dismissed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          application_id?: string | null;
          stage_id?: string | null;
          reminder_type?: string;
          title?: string;
          message?: string | null;
          scheduled_for?: string;
          sent_at?: string | null;
          dismissed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          userid: string;
          type: string;
          provider: string;
          provideraccountid: string;
          refresh_token: string | null;
          access_token: string | null;
          expires_at: number | null;
          token_type: string | null;
          scope: string | null;
          id_token: string | null;
          session_state: string | null;
        };
        Insert: {
          id?: string;
          userid: string;
          type: string;
          provider: string;
          provideraccountid: string;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
        };
        Update: {
          id?: string;
          userid?: string;
          type?: string;
          provider?: string;
          provideraccountid?: string;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          sessiontoken: string;
          userid: string;
          expires: string;
        };
        Insert: {
          id?: string;
          sessiontoken: string;
          userid: string;
          expires: string;
        };
        Update: {
          id?: string;
          sessiontoken?: string;
          userid?: string;
          expires?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_credit_balance: {
        Args: {
          p_user_id: string;
        };
        Returns: number;
      };
      deduct_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description: string;
          p_reference_id?: string | null;
        };
        Returns: {
          success: boolean;
          new_credits: number;
          error_message?: string | null;
        }[];
      };
      deduct_credit: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description: string;
        };
        Returns: {
          success: boolean;
          new_credits: number;
          error_message?: string | null;
        }[];
      };
      add_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description: string;
          p_reference_id?: string | null;
          p_metadata?: Record<string, unknown> | null;
          p_admin_id?: string | null;
        };
        Returns: {
          success: boolean;
          new_credits: number;
          error_message?: string | null;
        }[];
      };
      count_free_scans_today: {
        Args: {
          p_user_id: string;
        };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
