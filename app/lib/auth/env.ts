const DEVELOPMENT_NEXTAUTH_SECRET = "cvscan-development-nextauth-secret";

export const hasSupabaseServerEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
export const hasGoogleAuthEnv =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
export const hasEmailAuthEnv = !!process.env.RESEND_API_KEY;
export const nextAuthSecret =
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === "production" ? undefined : DEVELOPMENT_NEXTAUTH_SECRET);
export const hasNextAuthSecret = !!nextAuthSecret;
export const useSecureCookies =
  process.env.NEXTAUTH_URL?.startsWith("https://") || process.env.NODE_ENV === "production";
export const sessionTokenCookieName = `${useSecureCookies ? "__Secure-" : ""}next-auth.session-token`;

export function isAuthConfigured() {
  return hasSupabaseServerEnv && hasNextAuthSecret && hasGoogleAuthEnv && hasEmailAuthEnv;
}
