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
