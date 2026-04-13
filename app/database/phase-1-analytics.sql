-- CVScan Phase 1.4 analytics event plumbing
-- Apply only with product-owner approval. The canonical full replay file
-- app/database/cvscan-full-schema.sql also includes this table.

CREATE TABLE IF NOT EXISTS analytics_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL CHECK (
    event_name IN (
      'user_signed_up',
      'resume_imported',
      'facts_reviewed',
      'job_fit_run',
      'tailoring_run',
      'cover_letter_run',
      'application_saved',
      'interview_prep_run',
      'credit_purchased',
      'credit_spent',
      'critical_error'
    )
  ),
  properties_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created
  ON analytics_events(event_name, created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analytics events" ON analytics_events;
CREATE POLICY "Users can view own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage analytics events" ON analytics_events;
CREATE POLICY "Service role can manage analytics events"
  ON analytics_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
