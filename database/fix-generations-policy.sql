-- Fix generations table permissions
-- Users need to be able to insert their own generations (cover letters, etc.)

-- 1. DROP EXISTING POLICY IF IT EXISTS (To be safe)
DROP POLICY IF EXISTS "Users can insert own generations" ON generations;

-- 2. CREATE INSERT POLICY
CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. ENSURE SELECT POLICY EXISTS (It likely does, but good to be sure)
DROP POLICY IF EXISTS "Users can view own generations" ON generations;
CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  USING (auth.uid() = user_id);

-- 4. ENABLE RLS (Just in case)
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
