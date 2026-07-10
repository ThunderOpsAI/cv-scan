-- ============================================
-- Phase 4: Security Hardening (RLS & RPCs)
-- ============================================

-- 1. Restrict execution of SECURITY DEFINER functions to service_role only
-- This prevents IDOR where any authenticated user could mint or drain credits

REVOKE EXECUTE ON FUNCTION get_credit_balance(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_credit_balance(UUID) FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION deduct_credits(UUID, INTEGER, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION deduct_credits(UUID, INTEGER, TEXT, TEXT) FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION add_credits(UUID, INTEGER, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION add_credits(UUID, INTEGER, TEXT, TEXT, JSONB, TEXT) FROM anon, authenticated;

-- Ensure explicit DENY ALL policies on NextAuth tables
-- (accounts, sessions, verification_tokens)
-- These are accessed via service_role bypassing RLS, so anon/authenticated should have NO access.

CREATE POLICY "Deny all" ON accounts FOR ALL USING (false);
CREATE POLICY "Deny all" ON sessions FOR ALL USING (false);
CREATE POLICY "Deny all" ON verification_tokens FOR ALL USING (false);
