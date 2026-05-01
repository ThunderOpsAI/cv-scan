-- Run this in Supabase SQL Editor
-- This creates the tables needed by NextAuth in the PUBLIC schema

-- Ensure users table has emailVerified column (adapter needs it)
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" timestamptz;

-- Accounts table (for OAuth providers like Google)
CREATE TABLE IF NOT EXISTS accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  UNIQUE(provider, "providerAccountId")
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  "sessionToken" text NOT NULL UNIQUE,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires timestamptz NOT NULL
);

-- Verification Tokens (REQUIRED for Email Magic Links)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier text NOT NULL,
  token text NOT NULL UNIQUE,
  expires timestamptz NOT NULL,
  UNIQUE(identifier, token)
);
