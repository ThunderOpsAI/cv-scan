-- Migration to add hashed_password for CredentialsProvider

ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password TEXT;
