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
