-- Phase 2: Job Packs Database Schema
-- ATS scanning, job packs, tailored resumes, and cultural analysis

-- ============================================
-- JOB_PACKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS job_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  job_description TEXT NOT NULL,
  resume_version TEXT, -- Tailored resume text
  cover_letter TEXT, -- Generated cover letter
  ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
  cultural_fit_warnings JSONB DEFAULT '[]'::jsonb, -- Array of warning strings
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_packs_user_id ON job_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_packs_created_at ON job_packs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_packs_company ON job_packs(company);

-- ============================================
-- ATS_SCANS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ats_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_pack_id UUID REFERENCES job_packs(id) ON DELETE SET NULL,
  job_description TEXT NOT NULL,
  ats_score INTEGER NOT NULL CHECK (ats_score >= 0 AND ats_score <= 100),
  keyword_matches JSONB NOT NULL DEFAULT '{"found": [], "missing": []}'::jsonb,
  section_scores JSONB NOT NULL DEFAULT '{}'::jsonb, -- {skills: score, experience: score, education: score, format: score}
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_free_scan BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ats_scans_user_id ON ats_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_scans_created_at ON ats_scans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ats_scans_job_pack_id ON ats_scans(job_pack_id);
CREATE INDEX IF NOT EXISTS idx_ats_scans_is_free ON ats_scans(user_id, is_free_scan, created_at);

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_job_packs_updated_at ON job_packs;
CREATE TRIGGER update_job_packs_updated_at BEFORE UPDATE ON job_packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE job_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_scans ENABLE ROW LEVEL SECURITY;

-- Job Packs: Users can only access their own job packs
DROP POLICY IF EXISTS "Users can view own job packs" ON job_packs;
CREATE POLICY "Users can view own job packs"
  ON job_packs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own job packs" ON job_packs;
CREATE POLICY "Users can insert own job packs"
  ON job_packs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own job packs" ON job_packs;
CREATE POLICY "Users can update own job packs"
  ON job_packs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own job packs" ON job_packs;
CREATE POLICY "Users can delete own job packs"
  ON job_packs FOR DELETE
  USING (auth.uid() = user_id);

-- ATS Scans: Users can only access their own scans
DROP POLICY IF EXISTS "Users can view own ats scans" ON ats_scans;
CREATE POLICY "Users can view own ats scans"
  ON ats_scans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ats scans" ON ats_scans;
CREATE POLICY "Users can insert own ats scans"
  ON ats_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ats scans" ON ats_scans;
CREATE POLICY "Users can update own ats scans"
  ON ats_scans FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own ats scans" ON ats_scans;
CREATE POLICY "Users can delete own ats scans"
  ON ats_scans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTION: Count free scans today
-- ============================================

CREATE OR REPLACE FUNCTION count_free_scans_today(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM ats_scans
    WHERE user_id = p_user_id
      AND is_free_scan = TRUE
      AND created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day'
  );
END;
$$ LANGUAGE plpgsql;
