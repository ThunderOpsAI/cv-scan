-- Phase 2: generated_assets + onboarding fields on users
-- Local SQL. Apply to Supabase when approved.

-- ============================================
-- GENERATED_ASSETS (Build Spec 2.2)
-- ============================================

CREATE TABLE IF NOT EXISTS generated_assets (
  asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(job_id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('tailored_bullets', 'cover_letter', 'follow_up')),
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
  evidence_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generated_assets_user_id ON generated_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_assets_job_id ON generated_assets(user_id, job_id, created_at DESC);

-- ============================================
-- USERS — onboarding / career path (Build Spec 2.4 P1)
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS career_path TEXT
  CHECK (
    career_path IS NULL OR career_path IN (
      'new_grad',
      'career_switcher',
      'employed',
      'laid_off',
      'international'
    )
  );

ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- ============================================
-- RLS
-- ============================================

ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own generated assets" ON generated_assets;
CREATE POLICY "Users can view own generated assets"
  ON generated_assets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own generated assets" ON generated_assets;
CREATE POLICY "Users can insert own generated assets"
  ON generated_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own generated assets" ON generated_assets;
CREATE POLICY "Users can delete own generated assets"
  ON generated_assets FOR DELETE
  USING (auth.uid() = user_id);
