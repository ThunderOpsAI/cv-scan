-- Function to atomically deduct credits and log transaction
-- This prevents race conditions when multiple requests happen simultaneously

CREATE OR REPLACE FUNCTION deduct_credit(
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
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'usage', p_description);

  -- Return success
  RETURN QUERY SELECT TRUE, v_new_credits, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
