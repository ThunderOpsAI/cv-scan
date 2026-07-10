-- CVScan Database Schema
-- Supabase PostgreSQL Schema

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  credits INTEGER DEFAULT 3 NOT NULL, -- Free credits on signup
  stripe_customer_id TEXT UNIQUE,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  consent_version TEXT DEFAULT '2026-04-12',
  career_path TEXT CHECK (
    career_path IS NULL OR career_path IN (
      'new_grad',
      'career_switcher',
      'employed',
      'laid_off',
      'international'
    )
  ),
  onboarding_completed_at TIMESTAMPTZ,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (
    plan_tier IN ('free', 'starter', 'pro', 'enterprise')
  ),
  stripe_subscription_id TEXT,
  stripe_subscription_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_subscription_id_unique
  ON users(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- ============================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for purchase, negative for usage
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);

-- ============================================
-- CREDIT LEDGER (append-only; Build Spec 1.3 / Phase 3)
-- ============================================

CREATE TABLE IF NOT EXISTS credit_ledger (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('purchase', 'debit', 'refund', 'adjustment')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_reference_id_unique
  ON credit_ledger(reference_id)
  WHERE reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_created
  ON credit_ledger(user_id, created_at DESC);

-- ============================================
-- GENERATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bullets', 'cover_letter')),
  input JSONB NOT NULL, -- User's input data (job duties, resume, etc.)
  output TEXT NOT NULL, -- Generated content
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_type ON generations(type);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);

-- ============================================
-- ANALYTICS EVENTS TABLE (Build Spec 1.4)
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL CHECK (
    event_name IN (
      'user_signed_up',
      'resume_imported',
      'facts_reviewed',
      'job_fit_run',
      'tailoring_run',
      'cover_letter_run',
      'application_saved',
      'interview_prep_run',
      'credit_purchased',
      'credit_spent',
      'critical_error'
    )
  ),
  properties_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created
  ON analytics_events(event_name, created_at DESC);

-- ============================================
-- PROFILE FACTS TABLE
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
-- RESUME VERSIONS TABLE
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
-- JOBS + FIT ANALYSES (Phase 2 activation)
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
-- GENERATED ASSETS (Phase 2.2)
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
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profile_facts_updated_at ON profile_facts;
CREATE TRIGGER update_profile_facts_updated_at BEFORE UPDATE ON profile_facts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sync users.credits from ledger after each ledger insert (compat for session reads)
CREATE OR REPLACE FUNCTION credit_ledger_sync_user_credits()
RETURNS TRIGGER AS $$
DECLARE
  v_sum INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0)::INT INTO v_sum FROM credit_ledger WHERE user_id = NEW.user_id;
  UPDATE users SET credits = v_sum, updated_at = NOW() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_credit_ledger_sync_user_credits ON credit_ledger;
CREATE TRIGGER tr_credit_ledger_sync_user_credits
  AFTER INSERT ON credit_ledger
  FOR EACH ROW EXECUTE FUNCTION credit_ledger_sync_user_credits();

-- Initial ledger row for new accounts (matches default signup credits on users row)
CREATE OR REPLACE FUNCTION users_init_credit_ledger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credit_ledger (user_id, event_type, amount, balance_after, reference_id, description)
  VALUES (
    NEW.id,
    'adjustment',
    NEW.credits,
    NEW.credits,
    'signup:initial:' || NEW.id::text,
    'Initial credits on signup'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_users_init_credit_ledger ON users;
CREATE TRIGGER tr_users_init_credit_ledger
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION users_init_credit_ledger();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fit_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data (except credits and stripe_customer_id)
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own credit ledger"
  ON credit_ledger FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own generations
CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
  ON generations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON generations FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own analytics events" ON analytics_events;
CREATE POLICY "Users can view own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage analytics events" ON analytics_events;
CREATE POLICY "Service role can manage analytics events"
  ON analytics_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Users can manage their own approved profile facts
CREATE POLICY "Users can view own profile facts"
  ON profile_facts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile facts"
  ON profile_facts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_approved = TRUE);

CREATE POLICY "Users can update own profile facts"
  ON profile_facts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile facts"
  ON profile_facts FOR DELETE
  USING (auth.uid() = user_id);

-- Users can manage their own resume versions
CREATE POLICY "Users can view own resume versions"
  ON resume_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume versions"
  ON resume_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resume versions"
  ON resume_versions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume versions"
  ON resume_versions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own fit analyses"
  ON fit_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fit analyses"
  ON fit_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fit analyses"
  ON fit_analyses FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own generated assets"
  ON generated_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated assets"
  ON generated_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated assets"
  ON generated_assets FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can do everything (bypass RLS)
-- This is handled automatically by Supabase for service_role_key

-- ============================================
-- FUNCTIONS
-- ============================================

-- Ledger balance (sum of signed amounts)
CREATE OR REPLACE FUNCTION get_credit_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0)::INT FROM credit_ledger WHERE user_id = p_user_id;
$$;
REVOKE EXECUTE ON FUNCTION get_credit_balance(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_credit_balance(UUID) FROM anon, authenticated;

-- Debit credits: ledger row + legacy credit_transactions; optional idempotent reference_id
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_credits INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_ref TEXT;
  v_bal INTEGER;
  v_new INTEGER;
  v_repeat_bal INTEGER;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'Invalid amount'::TEXT;
    RETURN;
  END IF;

  v_ref := NULLIF(TRIM(COALESCE(p_reference_id, '')), '');
  IF v_ref IS NULL THEN
    v_ref := 'debit:ephemeral:' || gen_random_uuid()::text;
  END IF;

  PERFORM 1 FROM users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  SELECT cl.balance_after INTO v_repeat_bal
  FROM credit_ledger cl
  WHERE cl.reference_id = v_ref AND cl.user_id = p_user_id AND cl.event_type = 'debit'
  LIMIT 1;

  IF FOUND THEN
    SELECT COALESCE(SUM(amount), 0)::INT INTO v_bal FROM credit_ledger WHERE user_id = p_user_id;
    RETURN QUERY SELECT TRUE, v_bal, NULL::TEXT;
    RETURN;
  END IF;

  SELECT COALESCE(SUM(amount), 0)::INT INTO v_bal FROM credit_ledger WHERE user_id = p_user_id;

  IF v_bal < p_amount THEN
    RETURN QUERY SELECT FALSE, v_bal, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;

  v_new := v_bal - p_amount;

  INSERT INTO credit_ledger (user_id, event_type, amount, balance_after, reference_id, description)
  VALUES (p_user_id, 'debit', -p_amount, v_new, v_ref, p_description);

  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'usage', p_description);

  RETURN QUERY SELECT TRUE, v_new, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
REVOKE EXECUTE ON FUNCTION deduct_credits(UUID, INTEGER, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION deduct_credits(UUID, INTEGER, TEXT, TEXT) FROM anon, authenticated;

-- Add credits (purchases / bonuses): idempotent when p_reference_id repeats
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_credits INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_ref TEXT;
  v_bal INTEGER;
  v_new INTEGER;
  v_event TEXT;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'Invalid amount'::TEXT;
    RETURN;
  END IF;

  v_ref := NULLIF(TRIM(COALESCE(p_reference_id, '')), '');
  IF v_ref IS NULL THEN
    v_ref := 'credit:ephemeral:' || gen_random_uuid()::text;
  END IF;

  PERFORM 1 FROM users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM credit_ledger cl WHERE cl.reference_id = v_ref AND cl.user_id = p_user_id) THEN
    SELECT COALESCE(SUM(amount), 0)::INT INTO v_bal FROM credit_ledger WHERE user_id = p_user_id;
    RETURN QUERY SELECT TRUE, v_bal, NULL::TEXT;
    RETURN;
  END IF;

  IF p_type = 'purchase' THEN
    v_event := 'purchase';
  ELSE
    v_event := 'adjustment';
  END IF;

  SELECT COALESCE(SUM(amount), 0)::INT INTO v_bal FROM credit_ledger WHERE user_id = p_user_id;
  v_new := v_bal + p_amount;

  INSERT INTO credit_ledger (user_id, event_type, amount, balance_after, reference_id, description, metadata)
  VALUES (p_user_id, v_event, p_amount, v_new, v_ref, p_description, COALESCE(p_metadata, '{}'::jsonb));

  INSERT INTO credit_transactions (user_id, amount, type, description, metadata)
  VALUES (p_user_id, p_amount, p_type, p_description, p_metadata);

  RETURN QUERY SELECT TRUE, v_new, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
REVOKE EXECUTE ON FUNCTION add_credits(UUID, INTEGER, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION add_credits(UUID, INTEGER, TEXT, TEXT, JSONB, TEXT) FROM anon, authenticated;

-- Phase 3.3 — subscription columns on existing databases (no-op when already present)
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free';
UPDATE users SET plan_tier = 'free' WHERE plan_tier IS NULL;
ALTER TABLE users ALTER COLUMN plan_tier SET DEFAULT 'free';
ALTER TABLE users ALTER COLUMN plan_tier SET NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_tier_check;
ALTER TABLE users ADD CONSTRAINT users_plan_tier_check CHECK (plan_tier IN ('free', 'starter', 'pro', 'enterprise'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_subscription_id_unique
  ON users(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Backfill: one adjustment row per user who has no ledger rows yet (idempotent)
INSERT INTO credit_ledger (user_id, event_type, amount, balance_after, reference_id, description)
SELECT u.id, 'adjustment', u.credits, u.credits, 'legacy:users_credits:' || u.id::text, 'Migrated balance from users.credits'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM credit_ledger cl WHERE cl.user_id = u.id);

-- ============================================
-- SEED DATA (for development)
-- ============================================

-- This will only insert if the table is empty
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
--     INSERT INTO users (email, name, credits)
--     VALUES
--       ('test@example.com', 'Test User', 10),
--       ('demo@example.com', 'Demo User', 5);
--   END IF;
-- END $$;

-- ============================================
-- STORAGE BUCKETS (OCR & PHOTO CAPTURES)
-- ============================================

-- Create resume_uploads bucket for OCR / Document parsing if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resume_uploads',
  'resume_uploads',
  false,
  10485760, -- 10 MB limit
  '{image/jpeg,image/png,image/webp,application/pdf}'
) ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = '{image/jpeg,image/png,image/webp,application/pdf}';

-- RLS policies for storage buckets mapping to authenticated user folders
-- E.g., uploading to 'resume_uploads/{user_id}/file.jpg'

CREATE POLICY "Users can upload their own resume files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resume_uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own resume files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resume_uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own resume files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resume_uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own resume files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resume_uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
