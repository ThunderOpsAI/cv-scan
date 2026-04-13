-- Phase 1.2: Career Profile and Memory Schema
-- Local SQL only. Apply to Supabase later after product owner approval.

-- ============================================
-- PROFILE_FACTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS profile_facts (
  fact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fact_type TEXT NOT NULL CHECK (
    fact_type IN ('work_history', 'education', 'skill', 'achievement', 'metric', 'goal')
  ),
  fact_text TEXT NOT NULL CHECK (char_length(trim(fact_text)) > 0),
  is_approved BOOLEAN NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('manual', 'extracted')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profile_facts_user_id ON profile_facts(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_facts_user_approved ON profile_facts(user_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_profile_facts_type ON profile_facts(user_id, fact_type);

-- ============================================
-- RESUME_VERSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS resume_versions (
  version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_content TEXT NOT NULL CHECK (char_length(trim(raw_content)) > 0),
  tailored_content TEXT,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON resume_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_created_at ON resume_versions(user_id, created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_profile_facts_updated_at ON profile_facts;
CREATE TRIGGER update_profile_facts_updated_at BEFORE UPDATE ON profile_facts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profile_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile facts" ON profile_facts;
CREATE POLICY "Users can view own profile facts"
  ON profile_facts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile facts" ON profile_facts;
CREATE POLICY "Users can insert own profile facts"
  ON profile_facts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_approved = TRUE);

DROP POLICY IF EXISTS "Users can update own profile facts" ON profile_facts;
CREATE POLICY "Users can update own profile facts"
  ON profile_facts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile facts" ON profile_facts;
CREATE POLICY "Users can delete own profile facts"
  ON profile_facts FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own resume versions" ON resume_versions;
CREATE POLICY "Users can view own resume versions"
  ON resume_versions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resume versions" ON resume_versions;
CREATE POLICY "Users can insert own resume versions"
  ON resume_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resume versions" ON resume_versions;
CREATE POLICY "Users can update own resume versions"
  ON resume_versions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resume versions" ON resume_versions;
CREATE POLICY "Users can delete own resume versions"
  ON resume_versions FOR DELETE
  USING (auth.uid() = user_id);
