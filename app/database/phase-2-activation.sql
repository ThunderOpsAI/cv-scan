-- Phase 2.1: Activation — Jobs + job fit analyses (Build Spec)
-- Local SQL only. Apply to Supabase after product owner approval.

-- ============================================
-- JOBS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS jobs (
  job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  company TEXT NOT NULL CHECK (char_length(trim(company)) > 0),
  url TEXT,
  raw_description TEXT NOT NULL CHECK (char_length(trim(raw_description)) > 0),
  source TEXT NOT NULL CHECK (source IN ('manual', 'captured', 'api')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_created ON jobs(user_id, created_at DESC);

-- ============================================
-- FIT_ANALYSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS fit_analyses (
  analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('apply', 'stretch', 'skip')),
  signals_json JSONB NOT NULL,
  rationale TEXT NOT NULL CHECK (char_length(trim(rationale)) > 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fit_analyses_user_id ON fit_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_fit_analyses_job_id ON fit_analyses(job_id, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fit_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;
CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own fit analyses" ON fit_analyses;
CREATE POLICY "Users can view own fit analyses"
  ON fit_analyses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fit analyses" ON fit_analyses;
CREATE POLICY "Users can insert own fit analyses"
  ON fit_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own fit analyses" ON fit_analyses;
CREATE POLICY "Users can delete own fit analyses"
  ON fit_analyses FOR DELETE
  USING (auth.uid() = user_id);
