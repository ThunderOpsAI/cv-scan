export const AUTH_CONSENT_VERSION = "2026-04-12";

export function buildConsentFields(acceptedAt = new Date(), marketingOptIn = false) {
  const acceptedAtIso = acceptedAt.toISOString();

  return {
    terms_accepted_at: acceptedAtIso,
    privacy_accepted_at: acceptedAtIso,
    consent_version: AUTH_CONSENT_VERSION,
    marketing_opt_in: marketingOptIn,
    marketing_opt_in_at: marketingOptIn ? acceptedAtIso : null,
  };
}
