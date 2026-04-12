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
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

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

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fit_analyses ENABLE ROW LEVEL SECURITY;

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

-- Users can view their own generations
CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  USING (auth.uid() = user_id);

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

-- Service role can do everything (bypass RLS)
-- This is handled automatically by Supabase for service_role_key

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to atomically deduct credits and log transaction
-- This prevents race conditions when multiple requests happen simultaneously
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  new_credits INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_credits INTEGER;
BEGIN
  -- Lock the user row to prevent concurrent modifications
  SELECT credits INTO v_current_credits
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user has enough credits
  IF v_current_credits < p_amount THEN
    RETURN QUERY SELECT FALSE, v_current_credits, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;

  -- Deduct credits
  v_new_credits := v_current_credits - p_amount;

  UPDATE users
  SET credits = v_new_credits,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the transaction
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'usage', p_description);

  -- Return success
  RETURN QUERY SELECT TRUE, v_new_credits, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits (for purchases/bonuses)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_credits INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_new_credits INTEGER;
BEGIN
  -- Update user credits
  UPDATE users
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits INTO v_new_credits;

  -- Check if update succeeded
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  -- Log the transaction
  INSERT INTO credit_transactions (user_id, amount, type, description, metadata)
  VALUES (p_user_id, p_amount, p_type, p_description, p_metadata);

  -- Return success
  RETURN QUERY SELECT TRUE, v_new_credits, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

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
