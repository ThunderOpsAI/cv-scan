-- CVScan Phase 0 analytics retention hardening
-- Goal: keep analytics_events for 12 months, then purge older rows.
-- Safe to apply after analytics_events exists.

CREATE OR REPLACE FUNCTION public.purge_old_analytics_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.analytics_events
  WHERE created_at < NOW() - INTERVAL '12 months';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.purge_old_analytics_events()
IS 'Deletes analytics_events rows older than 12 months.';

-- Optional pg_cron schedule for Supabase projects with pg_cron enabled.
DO $$
DECLARE
  existing_job_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    EXECUTE $sql$
      SELECT COUNT(*)
      FROM cron.job
      WHERE jobname = 'purge-old-analytics-events-monthly'
    $sql$
    INTO existing_job_count;

    IF existing_job_count = 0 THEN
      PERFORM cron.schedule(
        'purge-old-analytics-events-monthly',
        '0 3 1 * *',
        $$SELECT public.purge_old_analytics_events();$$
      );
    END IF;
  END IF;
END;
$$;
