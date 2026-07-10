-- =====================================================================
-- CVScan Database Migration: Fix Credit Balance
-- Fix get_credit_balance for users without a ledger entry
-- =====================================================================

CREATE OR REPLACE FUNCTION get_credit_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    SUM(amount), 
    (SELECT credits FROM users WHERE id = p_user_id)
  )::INT 
  FROM credit_ledger 
  WHERE user_id = p_user_id;
$$;
