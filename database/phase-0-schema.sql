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
