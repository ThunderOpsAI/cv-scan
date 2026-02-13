-- Based on https://authjs.dev/reference/adapter/supabase
-- Run this in your Supabase SQL Editor to enable NextAuth/Auth.js

-- User table (likely already exists, ensure columns match)
create table if not exists users (
  id uuid not null default uuid_generate_v4() primary key,
  name text,
  email text not null unique,
  emailVerified timestamptz,
  image text,
  credits integer default 3, -- Add default credits for new users
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Accounts table (for OAuth providers like Google)
create table if not exists accounts (
  id uuid not null default uuid_generate_v4() primary key,
  userId uuid not null references users(id) on delete cascade,
  type text not null,
  provider text not null,
  providerAccountId text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  
  unique(provider, providerAccountId)
);

-- Sessions table (for database sessions if used)
create table if not exists sessions (
  id uuid not null default uuid_generate_v4() primary key,
  sessionToken text not null unique,
  userId uuid not null references users(id) on delete cascade,
  expires timestamptz not null
);

-- Verification Tokens (REQUIRED for Email Magic Links)
create table if not exists verification_tokens (
  identifier text not null,
  token text not null unique,
  expires timestamptz not null,
  
  unique(identifier, token)
);
