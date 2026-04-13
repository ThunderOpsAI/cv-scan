-- Credit RPC compatibility for production Supabase.
-- Apply this if production has only one of the historical RPC names:
--   public.deduct_credit(uuid, integer, text)
--   public.deduct_credits(uuid, integer, text)
--   public.deduct_credits(uuid, integer) with old parameter names
--
-- The app now calls through lib/supabase/credits.ts, which supports both names.
-- This script makes the database support both names too without replacing
-- existing functions when they already exist.

DO $$
BEGIN
  IF to_regprocedure('public.deduct_credits(uuid, integer, text)') IS NULL THEN
    IF to_regprocedure('public.deduct_credit(uuid, integer, text)') IS NOT NULL THEN
      EXECUTE $create$
        CREATE FUNCTION public.deduct_credits(
          p_user_id UUID,
          p_amount INTEGER,
          p_description TEXT
        )
        RETURNS TABLE (
          success BOOLEAN,
          new_credits INTEGER,
          error_message TEXT
        )
        LANGUAGE sql
        SECURITY DEFINER
        SET search_path = public
        AS $fn$
          SELECT * FROM public.deduct_credit($1, $2, $3);
        $fn$;
      $create$;
    ELSE
      EXECUTE $create$
        CREATE FUNCTION public.deduct_credits(
          p_user_id UUID,
          p_amount INTEGER,
          p_description TEXT
        )
        RETURNS TABLE (
          success BOOLEAN,
          new_credits INTEGER,
          error_message TEXT
        )
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $fn$
        DECLARE
          v_current_credits INTEGER;
          v_new_credits INTEGER;
        BEGIN
          IF p_amount <= 0 THEN
            RETURN QUERY SELECT FALSE, 0, 'Credit amount must be positive'::TEXT;
            RETURN;
          END IF;

          SELECT credits INTO v_current_credits
          FROM public.users
          WHERE id = p_user_id
          FOR UPDATE;

          IF NOT FOUND THEN
            RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
            RETURN;
          END IF;

          IF v_current_credits < p_amount THEN
            RETURN QUERY SELECT FALSE, v_current_credits, 'Insufficient credits'::TEXT;
            RETURN;
          END IF;

          v_new_credits := v_current_credits - p_amount;

          UPDATE public.users
          SET credits = v_new_credits,
              updated_at = NOW()
          WHERE id = p_user_id;

          INSERT INTO public.credit_transactions (user_id, amount, type, description)
          VALUES (p_user_id, -p_amount, 'usage', p_description);

          RETURN QUERY SELECT TRUE, v_new_credits, NULL::TEXT;
        END;
        $fn$;
      $create$;
    END IF;
  END IF;

  IF to_regprocedure('public.deduct_credit(uuid, integer, text)') IS NULL THEN
    EXECUTE $create$
      CREATE FUNCTION public.deduct_credit(
        p_user_id UUID,
        p_amount INTEGER,
        p_description TEXT
      )
      RETURNS TABLE (
        success BOOLEAN,
        new_credits INTEGER,
        error_message TEXT
      )
      LANGUAGE sql
      SECURITY DEFINER
      SET search_path = public
      AS $fn$
        SELECT * FROM public.deduct_credits($1, $2, $3);
      $fn$;
      $create$;
  END IF;

  IF to_regprocedure('public.deduct_credits(uuid, integer)') IS NULL THEN
    EXECUTE $create$
      CREATE FUNCTION public.deduct_credits(
        user_id_param UUID,
        credits_to_deduct INTEGER
      )
      RETURNS TABLE (
        success BOOLEAN,
        new_credits INTEGER,
        error_message TEXT
      )
      LANGUAGE sql
      SECURITY DEFINER
      SET search_path = public
      AS $fn$
        SELECT * FROM public.deduct_credits($1, $2, 'Mock interview reply');
      $fn$;
    $create$;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regrole('authenticated') IS NOT NULL THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, integer, text) TO authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, integer) TO authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.deduct_credit(uuid, integer, text) TO authenticated';
  END IF;

  IF to_regrole('service_role') IS NOT NULL THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, integer, text) TO service_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, integer) TO service_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.deduct_credit(uuid, integer, text) TO service_role';
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
