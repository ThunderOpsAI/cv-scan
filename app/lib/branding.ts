export const APP_NAME = "AI CV Scan";
export const APP_TAGLINE = "AI resume review and interview prep built for real applications.";
export const APP_DESCRIPTION =
  "AI CV Scan helps candidates scan roles, sharpen resumes, prepare interviews, and move faster with clear AI guidance.";
export const SUPPORT_EMAIL = "support@aicvscan.com";

export function appTitle(title?: string) {
  return title ? `${title} | ${APP_NAME}` : APP_NAME;
}

export function brandWordmark() {
  return {
    leading: "AI",
    trailing: "CV Scan",
  };
}
