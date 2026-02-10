-- ============================================
-- BULLETPRO SCHEMA ADDITIONS
-- Run these migrations in order by phase
-- ============================================

-- ============================================
-- PHASE 0: Profile System
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  headline VARCHAR(255),
  location JSONB, -- {city, state, country}
  contact JSONB,  -- {phone, linkedin, portfolio}
  career_goals JSONB, -- {target_roles[], salary{min,target,max}, prefs{}}
  profile_strength INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  dates JSONB NOT NULL, -- {start, end, is_current}
  location VARCHAR(255),
  description TEXT,
  tools TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bullets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  enhanced_text TEXT,
  mined_metrics JSONB,
  skills TEXT[],
  times_used INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(100),
  field VARCHAR(255),
  dates JSONB,
  gpa DECIMAL(3,2),
  honors TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- technical, soft, tool, cert, language
  proficiency VARCHAR(50),
  years INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE star_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL, -- {situation, task, action, result}
  tags TEXT[],
  source_experience_id UUID REFERENCES experiences(id),
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 0 Indexes
CREATE INDEX idx_experiences_user ON experiences(user_id);
CREATE INDEX idx_bullets_exp ON bullets(experience_id);
CREATE INDEX idx_education_user ON education(user_id);
CREATE INDEX idx_skills_user ON skills(user_id);
CREATE INDEX idx_star_stories_user ON star_stories(user_id);

-- Phase 0 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own experiences" ON experiences
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bullets" ON bullets
  FOR ALL USING (experience_id IN (SELECT id FROM experiences WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own education" ON education
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skills" ON skills
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own stories" ON star_stories
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PHASE 1: Intelligence (Copilot, Jobs)
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- user, assistant
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE company_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_normalized VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  data JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  filters JSONB NOT NULL,
  notify BOOLEAN DEFAULT TRUE,
  notify_frequency VARCHAR(20) DEFAULT 'daily',
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discovered_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_id UUID REFERENCES saved_searches(id),
  external_id VARCHAR(255),
  source VARCHAR(100),
  data JSONB NOT NULL,
  match_score INTEGER,
  match_reasons JSONB,
  status VARCHAR(50) DEFAULT 'new',
  discovered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 1 Indexes
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conv ON messages(conversation_id);
CREATE INDEX idx_company_cache_name ON company_cache(name_normalized);
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_discovered_jobs_user ON discovered_jobs(user_id, status);

-- Phase 1 RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovered_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own messages" ON messages
  FOR ALL USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own searches" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own discovered jobs" ON discovered_jobs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PHASE 2: Job Packs
-- ============================================

CREATE TABLE job_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID, -- FK added after applications table exists
  job_description TEXT NOT NULL,
  company VARCHAR(255),
  title VARCHAR(255),
  ats_score INTEGER,
  ats_breakdown JSONB,
  keywords JSONB,
  cultural_analysis JSONB,
  tailored_bullets JSONB,
  cover_letter TEXT,
  application_answers JSONB,
  diff_data JSONB,
  pack_type VARCHAR(50),
  credits_charged INTEGER,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ats_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  job_description TEXT NOT NULL,
  resume_text TEXT,
  score INTEGER,
  breakdown JSONB,
  keywords JSONB,
  cultural JSONB,
  share_token VARCHAR(50) UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  credits_charged INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 2 Indexes
CREATE INDEX idx_job_packs_user ON job_packs(user_id);
CREATE INDEX idx_ats_scans_user ON ats_scans(user_id);
CREATE INDEX idx_ats_scans_token ON ats_scans(share_token) WHERE share_token IS NOT NULL;

-- Phase 2 RLS
ALTER TABLE job_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own job packs" ON job_packs
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own scans" ON ats_scans
  FOR ALL USING (auth.uid() = user_id OR is_public = TRUE);

-- ============================================
-- PHASE 3: Application Tracking
-- ============================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  job_description TEXT,
  location VARCHAR(255),
  salary_range JSONB,
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'saved',
  priority VARCHAR(20) DEFAULT 'medium',
  applied_at DATE,
  ats_score INTEGER,
  cultural_score INTEGER,
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE application_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  stage_type VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  interviewers JSONB,
  raw_notes TEXT,
  ai_structured JSONB,
  outcome VARCHAR(50),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE generated_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES application_stages(id) ON DELETE CASCADE,
  email_type VARCHAR(50),
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  application_id UUID REFERENCES applications(id),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from job_packs to applications
ALTER TABLE job_packs ADD CONSTRAINT fk_job_packs_application 
  FOREIGN KEY (application_id) REFERENCES applications(id);

-- Phase 3 Indexes
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(user_id, status);
CREATE INDEX idx_stages_app ON application_stages(application_id);
CREATE INDEX idx_reminders_pending ON reminders(user_id, scheduled_for) 
  WHERE sent_at IS NULL AND dismissed_at IS NULL;

-- Phase 3 RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own applications" ON applications
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own stages" ON application_stages
  FOR ALL USING (application_id IN (SELECT id FROM applications WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own emails" ON generated_emails
  FOR ALL USING (stage_id IN (SELECT s.id FROM application_stages s JOIN applications a ON s.application_id = a.id WHERE a.user_id = auth.uid()));
CREATE POLICY "Users can manage own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PHASE 4: Interview Prep
-- ============================================

CREATE TABLE interview_preps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id),
  interview_type VARCHAR(50),
  content JSONB NOT NULL,
  practice_count INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  credits_charged INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 4 Indexes
CREATE INDEX idx_interview_preps_user ON interview_preps(user_id);

-- Phase 4 RLS
ALTER TABLE interview_preps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preps" ON interview_preps
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PHASE 6: Referrals
-- ============================================

CREATE TABLE referral_codes (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id),
  referee_id UUID REFERENCES auth.users(id),
  code VARCHAR(10),
  signed_up_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  credits_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 6 Indexes
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);

-- Phase 6 RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code" ON referral_codes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referrals" ON referrals
  FOR ALL USING (auth.uid() = referrer_id);
