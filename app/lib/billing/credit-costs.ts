/**
 * Canonical credit costs for paid actions (Build Spec Phase 3.2).
 * Keep in sync with route handlers that call deduct_credits.
 */
export const CREDIT_COSTS = {
  jobFit: 1,
  tailoredBullets: 1,
  coverLetter: 2,
  followUp: 1,
  standaloneBullets: 1,
  standaloneCoverLetter: 2,
  copilotMessage: 1,
  atsScan: 1,
  jobPack: 5,
  companyIntel: 1,
  applicationEmail: 1,
  mineMetrics: 1,
  interviewPrepMessage: 1,
} as const;

export type CreditCostKey = keyof typeof CREDIT_COSTS;
