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
