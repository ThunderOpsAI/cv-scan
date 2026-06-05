-- =====================================================================
-- CVScan — full PostgreSQL schema (single deploy artefact)
-- Apply to Supabase SQL editor or psql. Uses IF NOT EXISTS / idempotent ALTER where possible.
-- Order: core (schema.sql), then tables not yet merged into core.
-- Stripe: set STRIPE_PRICE_* and webhook events (see app/api/stripe/*).
-- Legacy per-phase *.sql files are kept for history; prefer this file for greenfield.
-- =====================================================================

-- ========== SECTION A: core (users, credits, ledger, jobs, facts, RLS, RPCs) ==========

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
  hashed_password TEXT,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  consent_version TEXT DEFAULT '2026-04-12',
  marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_opt_in_at TIMESTAMPTZ,
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

-- ========== SECTION B: phase 0 — profiles, experiences, bullets, education, etc. ==========

-- Phase 0: Foundation Database Schema
-- Profile system with metric mining and STAR stories

-- ============================================
-- PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  headline TEXT,
  summary TEXT,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================
-- EXPERIENCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_experiences_profile_id ON experiences(profile_id);
CREATE INDEX IF NOT EXISTS idx_experiences_sort_order ON experiences(profile_id, sort_order);

-- ============================================
-- BULLETS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS bullets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mined_metrics JSONB, -- Stores enhanced metrics from mining: {questions: [], answers: [], enhanced_content: ""}
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bullets_experience_id ON bullets(experience_id);
CREATE INDEX IF NOT EXISTS idx_bullets_sort_order ON bullets(experience_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_bullets_mined_metrics ON bullets USING GIN (mined_metrics);

-- ============================================
-- EDUCATION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  gpa NUMERIC(3, 2),
  honors TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_education_profile_id ON education(profile_id);
CREATE INDEX IF NOT EXISTS idx_education_sort_order ON education(profile_id, sort_order);

-- ============================================
-- SKILLS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('technical', 'soft', 'language', 'certification')),
  name TEXT NOT NULL,
  proficiency TEXT CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(profile_id, category, name)
);

CREATE INDEX IF NOT EXISTS idx_skills_profile_id ON skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(profile_id, category);

-- ============================================
-- STAR STORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS star_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  situation TEXT NOT NULL,
  task TEXT NOT NULL,
  action TEXT NOT NULL,
  result TEXT NOT NULL,
  tags TEXT[], -- For categorization (e.g., ['leadership', 'problem-solving'])
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_star_stories_profile_id ON star_stories(profile_id);
CREATE INDEX IF NOT EXISTS idx_star_stories_tags ON star_stories USING GIN (tags);

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bullets_updated_at ON bullets;
CREATE TRIGGER update_bullets_updated_at BEFORE UPDATE ON bullets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_education_updated_at ON education;
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_star_stories_updated_at ON star_stories;
CREATE TRIGGER update_star_stories_updated_at BEFORE UPDATE ON star_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_stories ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Experiences: Users can only access their own experiences
DROP POLICY IF EXISTS "Users can view own experiences" ON experiences;
CREATE POLICY "Users can view own experiences"
  ON experiences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = experiences.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own experiences" ON experiences;
CREATE POLICY "Users can insert own experiences"
  ON experiences FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = experiences.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own experiences" ON experiences;
CREATE POLICY "Users can update own experiences"
  ON experiences FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = experiences.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own experiences" ON experiences;
CREATE POLICY "Users can delete own experiences"
  ON experiences FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = experiences.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Bullets: Users can only access bullets from their own experiences
DROP POLICY IF EXISTS "Users can view own bullets" ON bullets;
CREATE POLICY "Users can view own bullets"
  ON bullets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      JOIN profiles p ON p.id = e.profile_id
      WHERE e.id = bullets.experience_id
      AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own bullets" ON bullets;
CREATE POLICY "Users can insert own bullets"
  ON bullets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiences e
      JOIN profiles p ON p.id = e.profile_id
      WHERE e.id = bullets.experience_id
      AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own bullets" ON bullets;
CREATE POLICY "Users can update own bullets"
  ON bullets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      JOIN profiles p ON p.id = e.profile_id
      WHERE e.id = bullets.experience_id
      AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own bullets" ON bullets;
CREATE POLICY "Users can delete own bullets"
  ON bullets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      JOIN profiles p ON p.id = e.profile_id
      WHERE e.id = bullets.experience_id
      AND p.user_id = auth.uid()
    )
  );

-- Education: Users can only access their own education
DROP POLICY IF EXISTS "Users can view own education" ON education;
CREATE POLICY "Users can view own education"
  ON education FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = education.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own education" ON education;
CREATE POLICY "Users can insert own education"
  ON education FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = education.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own education" ON education;
CREATE POLICY "Users can update own education"
  ON education FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = education.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own education" ON education;
CREATE POLICY "Users can delete own education"
  ON education FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = education.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Skills: Users can only access their own skills
DROP POLICY IF EXISTS "Users can view own skills" ON skills;
CREATE POLICY "Users can view own skills"
  ON skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = skills.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own skills" ON skills;
CREATE POLICY "Users can insert own skills"
  ON skills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = skills.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own skills" ON skills;
CREATE POLICY "Users can update own skills"
  ON skills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = skills.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own skills" ON skills;
CREATE POLICY "Users can delete own skills"
  ON skills FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = skills.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- STAR Stories: Users can only access their own stories
DROP POLICY IF EXISTS "Users can view own star stories" ON star_stories;
CREATE POLICY "Users can view own star stories"
  ON star_stories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = star_stories.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own star stories" ON star_stories;
CREATE POLICY "Users can insert own star stories"
  ON star_stories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = star_stories.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own star stories" ON star_stories;
CREATE POLICY "Users can update own star stories"
  ON star_stories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = star_stories.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own star stories" ON star_stories;
CREATE POLICY "Users can delete own star stories"
  ON star_stories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = star_stories.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- ========== SECTION C: phase 1 — copilot, company cache, job discovery ==========

-- Phase 1: Intelligence Database Schema
-- Copilot chat, company research, and job discovery

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(user_id, last_message_at DESC);

-- ============================================
-- MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB, -- For storing additional context, sources, etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, created_at);

-- ============================================
-- COMPANY_CACHE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS company_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL, -- Cached company research data
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_company_cache_company_name ON company_cache(company_name);
CREATE INDEX IF NOT EXISTS idx_company_cache_expires_at ON company_cache(expires_at);

-- ============================================
-- SAVED_SEARCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query_params JSONB NOT NULL, -- Search parameters (keywords, location, etc.)
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'never')), -- Notification frequency
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_frequency ON saved_searches(user_id, frequency) WHERE frequency != 'never';

-- ============================================
-- DISCOVERED_JOBS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS discovered_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  saved_search_id UUID REFERENCES saved_searches(id) ON DELETE SET NULL,
  external_id TEXT NOT NULL, -- Job ID from Adzuna or other source
  source TEXT NOT NULL, -- 'adzuna', 'linkedin', etc.
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  url TEXT NOT NULL,
  salary_min NUMERIC,
  salary_max NUMERIC,
  posted_at TIMESTAMPTZ,
  match_score INTEGER, -- 0-100 score based on profile match
  match_reasons JSONB, -- Why this job matches (skills, experience, etc.)
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'saved', 'applied', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, external_id, source)
);

CREATE INDEX IF NOT EXISTS idx_discovered_jobs_user_id ON discovered_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_discovered_jobs_status ON discovered_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_discovered_jobs_match_score ON discovered_jobs(user_id, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_discovered_jobs_saved_search_id ON discovered_jobs(saved_search_id);
CREATE INDEX IF NOT EXISTS idx_discovered_jobs_posted_at ON discovered_jobs(posted_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON saved_searches;
CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_discovered_jobs_updated_at ON discovered_jobs;
CREATE TRIGGER update_discovered_jobs_updated_at BEFORE UPDATE ON discovered_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovered_jobs ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only access their own conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Messages: Users can only access messages from their own conversations
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Company cache: All authenticated users can read (shared cache)
DROP POLICY IF EXISTS "All users can view company cache" ON company_cache;
CREATE POLICY "All users can view company cache"
  ON company_cache FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Service role can manage cache
DROP POLICY IF EXISTS "Service role can manage company cache" ON company_cache;
CREATE POLICY "Service role can manage company cache"
  ON company_cache FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Saved searches: Users can only access their own searches
DROP POLICY IF EXISTS "Users can view own saved searches" ON saved_searches;
CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved searches" ON saved_searches;
CREATE POLICY "Users can insert own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved searches" ON saved_searches;
CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved searches" ON saved_searches;
CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- Discovered jobs: Users can only access their own discovered jobs
DROP POLICY IF EXISTS "Users can view own discovered jobs" ON discovered_jobs;
CREATE POLICY "Users can view own discovered jobs"
  ON discovered_jobs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own discovered jobs" ON discovered_jobs;
CREATE POLICY "Users can insert own discovered jobs"
  ON discovered_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own discovered jobs" ON discovered_jobs;
CREATE POLICY "Users can update own discovered jobs"
  ON discovered_jobs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own discovered jobs" ON discovered_jobs;
CREATE POLICY "Users can delete own discovered jobs"
  ON discovered_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTION: Clean expired company cache
-- ============================================

CREATE OR REPLACE FUNCTION clean_expired_company_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM company_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- This can be run periodically via a cron job or scheduled task

-- ========== SECTION D: phase 1 smart goals ==========

-- Phase 1: SMART Goals Feature

-- ============================================
-- SMART GOALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS smart_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal TEXT NOT NULL, -- Short summary
  specific TEXT,
  measurable TEXT,
  achievable TEXT,
  relevant TEXT,
  time_bound TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_smart_goals_profile_id ON smart_goals(profile_id);
CREATE INDEX IF NOT EXISTS idx_smart_goals_sort_order ON smart_goals(profile_id, sort_order);

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_smart_goals_updated_at ON smart_goals;
CREATE TRIGGER update_smart_goals_updated_at BEFORE UPDATE ON smart_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE smart_goals ENABLE ROW LEVEL SECURITY;

-- Users can only access their own goals
DROP POLICY IF EXISTS "Users can view own smart goals" ON smart_goals;
CREATE POLICY "Users can view own smart goals"
  ON smart_goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = smart_goals.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own smart goals" ON smart_goals;
CREATE POLICY "Users can insert own smart goals"
  ON smart_goals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = smart_goals.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own smart goals" ON smart_goals;
CREATE POLICY "Users can update own smart goals"
  ON smart_goals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = smart_goals.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own smart goals" ON smart_goals;
CREATE POLICY "Users can delete own smart goals"
  ON smart_goals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = smart_goals.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- ========== SECTION E: phase 1 career memory (may overlap core; IF NOT EXISTS safe) ==========

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

-- ========== SECTION F: phase 2 activation (jobs/fit overlap core) ==========

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

-- ========== SECTION G: phase 2 generated assets & onboarding columns ==========

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

-- ========== SECTION H: phase 2 job packs & ATS scans ==========

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

-- ========== SECTION I: phase 3 application tracker (applications, stages) ==========

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

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_application_stages_updated_at ON application_stages;
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
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON applications;
CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own applications" ON applications;
CREATE POLICY "Users can delete own applications"
  ON applications FOR DELETE USING (auth.uid() = user_id);

-- Application stages policies
DROP POLICY IF EXISTS "Users can view own application stages" ON application_stages;
CREATE POLICY "Users can view own application stages"
  ON application_stages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_stages.application_id
    AND applications.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own application stages" ON application_stages;
CREATE POLICY "Users can insert own application stages"
  ON application_stages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_stages.application_id
    AND applications.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own application stages" ON application_stages;
CREATE POLICY "Users can update own application stages"
  ON application_stages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_stages.application_id
    AND applications.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own application stages" ON application_stages;
CREATE POLICY "Users can delete own application stages"
  ON application_stages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_stages.application_id
    AND applications.user_id = auth.uid()
  ));

-- Generated emails policies
DROP POLICY IF EXISTS "Users can view own generated emails" ON generated_emails;
CREATE POLICY "Users can view own generated emails"
  ON generated_emails FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own generated emails" ON generated_emails;
CREATE POLICY "Users can insert own generated emails"
  ON generated_emails FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own generated emails" ON generated_emails;
CREATE POLICY "Users can update own generated emails"
  ON generated_emails FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own generated emails" ON generated_emails;
CREATE POLICY "Users can delete own generated emails"
  ON generated_emails FOR DELETE USING (auth.uid() = user_id);

-- Reminders policies
DROP POLICY IF EXISTS "Users can view own reminders" ON reminders;
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reminders" ON reminders;
CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reminders" ON reminders;
CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reminders" ON reminders;
CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE USING (auth.uid() = user_id);

-- ========== SECTION J: NextAuth public schema ==========

-- Run this in Supabase SQL Editor
-- This creates the tables needed by NextAuth in the PUBLIC schema

-- Ensure users table has emailVerified column (adapter needs it)
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_accepted_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_version text DEFAULT '2026-04-12';

-- Accounts table (for OAuth providers like Google)
CREATE TABLE IF NOT EXISTS accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  userid uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  provideraccountid text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  UNIQUE(provider, provideraccountid)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  sessiontoken text NOT NULL UNIQUE,
  userid uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires timestamptz NOT NULL
);

-- Verification Tokens (REQUIRED for Email Magic Links)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier text NOT NULL,
  token text NOT NULL UNIQUE,
  expires timestamptz NOT NULL,
  UNIQUE(identifier, token)
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Normalize older quoted camelCase columns to the lowercase names used by
-- the custom adapter. Supabase/Postgres lowercases unquoted identifiers, and
-- the app queries userid, provideraccountid, and sessiontoken directly.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'accounts'
      AND column_name = 'userId'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'accounts'
      AND column_name = 'userid'
  ) THEN
    ALTER TABLE accounts RENAME COLUMN "userId" TO userid;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'accounts'
      AND column_name = 'providerAccountId'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'accounts'
      AND column_name = 'provideraccountid'
  ) THEN
    ALTER TABLE accounts RENAME COLUMN "providerAccountId" TO provideraccountid;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'sessionToken'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'sessiontoken'
  ) THEN
    ALTER TABLE sessions RENAME COLUMN "sessionToken" TO sessiontoken;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'userId'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'userid'
  ) THEN
    ALTER TABLE sessions RENAME COLUMN "userId" TO userid;
  END IF;
END $$;

-- ========== OPTIONAL legacy fixes (commented; uncomment if migrating old DBs) ==========

-- cat fix-credit-rpc-compatibility.sql fix-credits-permissions.sql fix-generations-*.sql as needed

-- ========== END merged schema ==========

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
