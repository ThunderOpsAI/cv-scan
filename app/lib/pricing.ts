export type CreditPackage = {
  id: "starter" | "popular" | "pro";
  name: string;
  credits: number;
  price: number;
  priceInCents: number;
  description: string;
  features: string[];
  popular?: boolean;
  offerLabel?: string;
  cta: string;
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 20,
    price: 4.99,
    priceInCents: 499,
    description: "A quick first pass for a fresh role, CV update, or interview round.",
    features: ["20 credits", "No expiry", "Fast checkout"],
    cta: "Choose Starter",
  },
  {
    id: "popular",
    name: "Launch Pack",
    credits: 50,
    price: 9.99,
    priceInCents: 999,
    description: "Best fit for active job seekers tailoring across multiple applications.",
    features: ["50 credits", "No expiry", "Best value per credit", "Ideal for weekly applications"],
    popular: true,
    offerLabel: "Launch offer: 50% off for first 200 users",
    cta: "Claim Launch Offer",
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 150,
    price: 15.99,
    priceInCents: 1599,
    description: "Built for focused search sprints, interview prep, and repeated tailoring.",
    features: ["150 credits", "No expiry", "Priority email support"],
    cta: "Choose Pro",
  },
];

export const CREDIT_PACKAGE_MAP = Object.fromEntries(
  CREDIT_PACKAGES.map((pkg) => [pkg.id, pkg])
) as Record<CreditPackage["id"], CreditPackage>;
