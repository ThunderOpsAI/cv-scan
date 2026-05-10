-- CVScan: Add marketing opt-in tracking (Mailjet AUP compliance)
-- Run this in Supabase SQL Editor to add the column to an existing database.

ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in_at TIMESTAMPTZ;

COMMENT ON COLUMN users.marketing_opt_in IS 'Explicit marketing email opt-in (Mailjet AUP). Separate from terms/privacy consent.';
COMMENT ON COLUMN users.marketing_opt_in_at IS 'Timestamp when the user opted in/out of marketing emails.';
