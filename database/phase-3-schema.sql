-- Phase 3: Application Tracking Database Schema
-- Application tracker, interview stages, and email generation

-- ============================================
-- APPLICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  job_description TEXT,
  location TEXT,
  salary_range JSONB, -- {min: number, max: number, currency: string}
  source TEXT, -- 'linkedin', 'indeed', 'company_site', 'referral', 'other'
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  applied_at DATE,
  ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
  cultural_score INTEGER CHECK (cultural_score >= 0 AND cultural_score <= 100),
  notes TEXT,
  job_pack_id UUID REFERENCES job_packs(id) ON DELETE SET NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_is_archived ON applications(user_id, is_archived);

-- ============================================
-- APPLICATION_STAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS application_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  stage_type TEXT NOT NULL CHECK (stage_type IN ('phone_screen', 'technical', 'behavioral', 'onsite', 'final', 'offer', 'other')),
  stage_name TEXT, -- Custom name like "Round 1 with Sarah"
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  interviewers JSONB DEFAULT '[]'::jsonb, -- [{name, title, linkedin, notes}]
  raw_notes TEXT, -- User's brain dump after interview
  ai_structured JSONB, -- Structured notes from AI
  outcome TEXT CHECK (outcome IN ('pending', 'passed', 'failed', 'cancelled')),
  feedback TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stages_application_id ON application_stages(application_id);
CREATE INDEX IF NOT EXISTS idx_stages_scheduled_at ON application_stages(scheduled_at);

-- ============================================
-- GENERATED_EMAILS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS generated_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES application_stages(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('thank_you', 'follow_up', 'withdraw', 'accept', 'decline', 'negotiate')),
  recipient_name TEXT,
  recipient_email TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emails_application_id ON generated_emails(application_id);
CREATE INDEX IF NOT EXISTS idx_emails_stage_id ON generated_emails(stage_id);

-- ============================================
-- REMINDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES application_stages(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('follow_up', 'interview_prep', 'application_deadline', 'custom')),
  title TEXT NOT NULL,
  message TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(user_id, scheduled_for) WHERE sent_at IS NULL AND dismissed_at IS NULL;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_stages_updated_at BEFORE UPDATE ON application_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Applications policies
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON applications FOR DELETE USING (auth.uid() = user_id);

-- Application stages policies
CREATE POLICY "Users can view own application stages"
  ON application_stages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_stages.application_id
    AND applications.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own application stages"
  ON application_stages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_stages.application_id
    AND applications.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own application stages"
  ON application_stages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_stages.application_id
    AND applications.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own application stages"
  ON application_stages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_stages.application_id
    AND applications.user_id = auth.uid()
  ));

-- Generated emails policies
CREATE POLICY "Users can view own generated emails"
  ON generated_emails FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated emails"
  ON generated_emails FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated emails"
  ON generated_emails FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated emails"
  ON generated_emails FOR DELETE USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE USING (auth.uid() = user_id);
