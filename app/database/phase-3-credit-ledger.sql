-- Phase 3 — Monetisation: append-only credit_ledger, idempotent debits/credits
-- Apply after prior phase SQL (or reconcile from merged app/database/schema.sql).
-- Safe to re-run: backfill uses NOT EXISTS per user; CREATE uses IF NOT EXISTS / OR REPLACE.

CREATE TABLE IF NOT EXISTS credit_ledger (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('purchase', 'debit', 'refund', 'adjustment')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_reference_id_unique
  ON credit_ledger(reference_id)
  WHERE reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_created
  ON credit_ledger(user_id, created_at DESC);

ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credit ledger" ON credit_ledger;
CREATE POLICY "Users can view own credit ledger"
  ON credit_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION credit_ledger_sync_user_credits()
RETURNS TRIGGER AS $$
DECLARE
  v_sum INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0)::INT INTO v_sum FROM credit_ledger WHERE user_id = NEW.user_id;
  UPDATE users SET credits = v_sum, updated_at = NOW() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_credit_ledger_sync_user_credits ON credit_ledger;
CREATE TRIGGER tr_credit_ledger_sync_user_credits
  AFTER INSERT ON credit_ledger
  FOR EACH ROW EXECUTE FUNCTION credit_ledger_sync_user_credits();

CREATE OR REPLACE FUNCTION users_init_credit_ledger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credit_ledger (user_id, event_type, amount, balance_after, reference_id, description)
  VALUES (
    NEW.id,
    'adjustment',
    NEW.credits,
    NEW.credits,
    'signup:initial:' || NEW.id::text,
    'Initial credits on signup'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_users_init_credit_ledger ON users;
CREATE TRIGGER tr_users_init_credit_ledger
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION users_init_credit_ledger();

CREATE OR REPLACE FUNCTION get_credit_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0)::INT FROM credit_ledger WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_credits INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_ref TEXT;
  v_bal INTEGER;
  v_new INTEGER;
  v_repeat_bal INTEGER;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'Invalid amount'::TEXT;
    RETURN;
  END IF;

  v_ref := NULLIF(TRIM(COALESCE(p_reference_id, '')), '');
  IF v_ref IS NULL THEN
    v_ref := 'debit:ephemeral:' || gen_random_uuid()::text;
  END IF;

  PERFORM 1 FROM users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  SELECT cl.balance_after INTO v_repeat_bal
  FROM credit_ledger cl
  WHERE cl.reference_id = v_ref AND cl.user_id = p_user_id AND cl.event_type = 'debit'
  LIMIT 1;

  IF FOUND THEN
    SELECT COALESCE(SUM(amount), 0)::INT INTO v_bal FROM credit_ledger WHERE user_id = p_user_id;
    RETURN QUERY SELECT TRUE, v_bal, NULL::TEXT;
    RETURN;
  END IF;

  SELECT COALESCE(SUM(amount), 0)::INT INTO v_bal FROM credit_ledger WHERE user_id = p_user_id;

  IF v_bal < p_amount THEN
    RETURN QUERY SELECT FALSE, v_bal, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;

  v_new := v_bal - p_amount;

  INSERT INTO credit_ledger (user_id, event_type, amount, balance_after, reference_id, description)
  VALUES (p_user_id, 'debit', -p_amount, v_new, v_ref, p_description);

  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'usage', p_description);

  RETURN QUERY SELECT TRUE, v_new, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_credits INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_ref TEXT;
  v_bal INTEGER;
  v_new INTEGER;
  v_event TEXT;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'Invalid amount'::TEXT;
    RETURN;
  END IF;

  v_ref := NULLIF(TRIM(COALESCE(p_reference_id, '')), '');
  IF v_ref IS NULL THEN
    v_ref := 'credit:ephemeral:' || gen_random_uuid()::text;
  END IF;

  PERFORM 1 FROM users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM credit_ledger cl WHERE cl.reference_id = v_ref AND cl.user_id = p_user_id) THEN
    SELECT COALESCE(SUM(amount), 0)::INT INTO v_bal FROM credit_ledger WHERE user_id = p_user_id;
    RETURN QUERY SELECT TRUE, v_bal, NULL::TEXT;
    RETURN;
  END IF;

  IF p_type = 'purchase' THEN
    v_event := 'purchase';
  ELSE
    v_event := 'adjustment';
  END IF;

  SELECT COALESCE(SUM(amount), 0)::INT INTO v_bal FROM credit_ledger WHERE user_id = p_user_id;
  v_new := v_bal + p_amount;

  INSERT INTO credit_ledger (user_id, event_type, amount, balance_after, reference_id, description, metadata)
  VALUES (p_user_id, v_event, p_amount, v_new, v_ref, p_description, COALESCE(p_metadata, '{}'::jsonb));

  INSERT INTO credit_transactions (user_id, amount, type, description, metadata)
  VALUES (p_user_id, p_amount, p_type, p_description, p_metadata);

  RETURN QUERY SELECT TRUE, v_new, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

INSERT INTO credit_ledger (user_id, event_type, amount, balance_after, reference_id, description)
SELECT u.id, 'adjustment', u.credits, u.credits, 'legacy:users_credits:' || u.id::text, 'Migrated balance from users.credits'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM credit_ledger cl WHERE cl.user_id = u.id);
