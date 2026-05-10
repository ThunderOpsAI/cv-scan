-- Comprehensive fix for Generations table
-- 1. Ensure table exists
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'cover_letter', 'bullets', 'job_pack'
    input JSONB,
    output TEXT,
    credits_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
DROP POLICY IF EXISTS "Users can view own generations" ON generations;
DROP POLICY IF EXISTS "Service role full access" ON generations;

-- 4. Create correct policies
-- Allow users to insert their own records
CREATE POLICY "Users can insert own generations"
ON public.generations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own records
CREATE POLICY "Users can view own generations"
ON public.generations FOR SELECT
USING (auth.uid() = user_id);

-- 5. Grant permissions to authenticated users
GRANT ALL ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;
