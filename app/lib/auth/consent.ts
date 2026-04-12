export const AUTH_CONSENT_VERSION = "2026-04-12";

export function buildConsentFields(acceptedAt = new Date()) {
  const acceptedAtIso = acceptedAt.toISOString();

  return {
    terms_accepted_at: acceptedAtIso,
    privacy_accepted_at: acceptedAtIso,
    consent_version: AUTH_CONSENT_VERSION,
  };
}
