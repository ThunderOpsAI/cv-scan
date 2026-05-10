export const APP_NAME = "AICVScan";
export const APP_TAGLINE = "AI resume review and interview prep built for real applications.";
export const APP_DESCRIPTION =
  "AICVScan helps candidates scan roles, sharpen resumes, prepare interviews, and move faster with clear AI guidance.";
export const SUPPORT_EMAIL = "support@cv-scan.com";

export function appTitle(title?: string) {
  return title ? `${title} | ${APP_NAME}` : APP_NAME;
}

export function brandWordmark() {
  return {
    leading: "AI",
    trailing: "CVScan",
  };
}
