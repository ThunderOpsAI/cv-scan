-- Fix credit deduction permissions by using SECURITY DEFINER
-- This allows the function to bypass RLS and insert into credit_transactions

-- 1. DROP EXISTING FUNCTION
DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER, TEXT);

-- 2. RECREATE WITH SECURITY DEFINER
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  new_credits INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_credits INTEGER;
BEGIN
  -- Lock the user row to prevent concurrent modifications
  SELECT credits INTO v_current_credits
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  -- Check if user has enough credits
  IF v_current_credits < p_amount THEN
    RETURN QUERY SELECT FALSE, v_current_credits, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;

  -- Deduct credits
  v_new_credits := v_current_credits - p_amount;

  UPDATE users
  SET credits = v_new_credits,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the transaction
  -- Note: metadata is optional in schema, so omitting it here is fine
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'usage', p_description);

  -- Return success
  RETURN QUERY SELECT TRUE, v_new_credits, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. ALSO UPDATE ADD_CREDITS FOR CONSISTENCY
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  new_credits INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_credits INTEGER;
BEGIN
  -- Lock the user row to prevent concurrent modifications
  SELECT credits INTO v_current_credits
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  -- Add credits
  v_new_credits := v_current_credits + p_amount;

  UPDATE users
  SET credits = v_new_credits,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the transaction
  INSERT INTO credit_transactions (user_id, amount, type, description, metadata)
  VALUES (p_user_id, p_amount, p_type, p_description, p_metadata);

  -- Return success
  RETURN QUERY SELECT TRUE, v_new_credits, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
