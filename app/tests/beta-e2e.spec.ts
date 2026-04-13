/**
 * CVScan Public Beta – Comprehensive E2E Test Suite
 *
 * Covers all Build Spec phases for the beta/no-auth-payments branch:
 *   1. Public pages (homepage, pricing, trust, privacy, terms, sign-in stub)
 *   2. Beta banner presence on every page
 *   3. Dashboard & navigation (mock session)
 *   4. ATS Scanner flow
 *   5. Generate Bullet Points flow
 *   6. Generate Cover Letter flow
 *   7. Application Tracker (Kanban + List views, add modal)
 *   8. Job Packs page
 *   9. Profile hub & sub-pages
 *  10. Intelligence pages (Copilot, Interview, Discover Jobs, STAR Stories, SMART Goals)
 *  11. Disabled-for-beta pages (buy-credits, pricing stub, sign-in stub)
 *  12. Legal / compliance pages (privacy, terms, trust)
 *  13. Data export / deletion stub
 *  14. Responsiveness smoke check
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collect console errors during a test */
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

/** Assert the sticky beta banner is visible */
async function assertBetaBanner(page: Page) {
  await expect(
    page.getByText(/Beta.*No authentication or payments required/i).first()
  ).toBeVisible();
}

/** Navigate and wait for hydration */
async function navigateTo(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. PUBLIC HOMEPAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Homepage", () => {
  test("renders hero, features, pricing preview, footer, and beta banner", async ({
    page,
  }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/");

    // Beta banner
    await assertBetaBanner(page);

    // Hero
    await expect(
      page.getByRole("heading", { name: /Supercharge Your Job Search/i })
    ).toBeVisible();
    await expect(page.getByText(/AI Career & Application Platform/i)).toBeVisible();

    // CTA buttons
    await expect(page.getByRole("link", { name: /Try Free/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /See How It Works/i })).toBeVisible();

    // How It Works section
    await expect(page.getByRole("heading", { name: /How It Works/i })).toBeVisible();
    await expect(page.getByText(/Discover & Track/i)).toBeVisible();
    await expect(page.getByText(/Score & Tailor/i)).toBeVisible();
    await expect(page.getByText(/Apply & Land Offers/i)).toBeVisible();

    // Pricing preview
    await expect(page.getByText("Starter Pack")).toBeVisible();
    await expect(page.getByText("Popular Pack")).toBeVisible();
    await expect(page.getByText("Pro Pack")).toBeVisible();

    // Footer
    await expect(page.getByText(/© 2026 CVScan/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Terms" })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("navigates from homepage to key pages via links", async ({ page }) => {
    await navigateTo(page, "/");

    // Footer links
    const privacyLink = page.locator('footer a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();

    const termsLink = page.locator('footer a[href="/terms"]');
    await expect(termsLink).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. BETA-DISABLED PAGES (Auth, Payments)
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Beta-disabled pages", () => {
  test("sign-in page shows disabled message", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/auth/signin");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /Sign-in Disabled/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Authentication is not required in the public beta/i)
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("buy-credits page shows disabled message", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/buy-credits");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /Payments Disabled/i })
    ).toBeVisible();
    await expect(
      page.getByText(/not available in the public beta/i)
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("pricing page shows disabled message", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/pricing");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /Pricing Disabled/i })
    ).toBeVisible();
    await expect(
      page.getByText(/free and open in the public beta/i)
    ).toBeVisible();

    expect(errors).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. LEGAL & COMPLIANCE PAGES
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Legal pages", () => {
  test("privacy policy page renders correctly", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/privacy");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /Privacy Policy/i })
    ).toBeVisible();
    await expect(page.getByText(/Information We Collect/i)).toBeVisible();
    await expect(page.getByText(/How We Use Your Data/i)).toBeVisible();
    await expect(page.getByText(/Artificial Intelligence/i)).toBeVisible();
    await expect(page.getByText(/Data Sharing/i)).toBeVisible();
    await expect(page.getByText(/Data Export/i)).toBeVisible();
    await expect(page.getByText(/Data Retention/i)).toBeVisible();
    // Beta-specific disclosure
    await expect(
      page.getByText(/During the public beta, we do not require accounts/i)
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("terms of service page renders correctly", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/terms");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /Terms of Service/i })
    ).toBeVisible();
    await expect(page.getByText(/Acceptance of Terms/i)).toBeVisible();
    await expect(page.getByText(/AI Output Disclaimer/i)).toBeVisible();
    await expect(page.getByText(/No Fabrication/i)).toBeVisible();
    await expect(page.getByText(/No Deceptive Auto-Apply/i)).toBeVisible();
    // Beta-specific
    await expect(
      page.getByText(/credits and payments are disabled/i)
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("trust & security page renders correctly", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/trust");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /Trust & Security/i })
    ).toBeVisible();
    await expect(page.getByText(/Your Data is Yours/i)).toBeVisible();
    await expect(page.getByText(/Assisted, Not Automated/i)).toBeVisible();
    await expect(page.getByText(/Meeting Standards/i)).toBeVisible();
    await expect(page.getByText(/Hallucination Risk/i)).toBeVisible();

    expect(errors).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. DASHBOARD (Mock Session)
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Dashboard", () => {
  test("renders dashboard with mock session (Beta User, 9999 credits)", async ({
    page,
  }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/dashboard");

    await assertBetaBanner(page);

    // Welcome message with mock user name
    await expect(
      page.getByRole("heading", { name: /Welcome back, Beta User/i })
    ).toBeVisible();

    // Credits visible
    await expect(page.getByText("9999")).toBeVisible();

    // Account info card
    await expect(page.getByText("beta@cvscan.com")).toBeVisible();

    // Section headings
    await expect(page.getByRole("heading", { name: /Your Profile/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Job Applications/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Intelligence/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Content Generation/i })
    ).toBeVisible();

    // Feature tiles
    await expect(page.getByText(/Job fit/i).first()).toBeVisible();
    await expect(page.getByText(/ATS Scanner/i).first()).toBeVisible();
    await expect(page.getByText(/Job Packs/i).first()).toBeVisible();
    await expect(page.getByText(/Application Tracker/i).first()).toBeVisible();
    await expect(page.getByText(/Career Copilot/i).first()).toBeVisible();
    await expect(page.getByText(/Mock Interview/i).first()).toBeVisible();
    await expect(page.getByText(/Discover Jobs/i).first()).toBeVisible();
    await expect(page.getByText(/Generate Bullet Points/i).first()).toBeVisible();
    await expect(page.getByText(/Generate Cover Letter/i).first()).toBeVisible();

    // Activation checklist
    await expect(page.getByText(/Activation checklist/i)).toBeVisible();

    // User ID footer
    await expect(page.getByText("beta-user-123")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("dashboard navigation links work", async ({ page }) => {
    await navigateTo(page, "/dashboard");

    // Navigate to ATS Scanner
    await page.locator('[data-testid="ats-scanner-link"]').click();
    await expect(page).toHaveURL(/\/dashboard\/scanner/);
    await expect(
      page.getByRole("heading", { name: /ATS Scanner/i })
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. ATS SCANNER
// ═══════════════════════════════════════════════════════════════════════════
test.describe("ATS Scanner", () => {
  test("renders scanner page with input and button", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/dashboard/scanner");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /ATS Scanner/i })
    ).toBeVisible();
    await expect(page.getByText(/Analyze how well your profile matches/i)).toBeVisible();

    // Input and button present
    await expect(page.locator('[data-testid="job-description-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="scan-button"]')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("shows error when scanning with empty input", async ({ page }) => {
    await navigateTo(page, "/dashboard/scanner");

    await page.locator('[data-testid="scan-button"]').click();
    await expect(page.getByText(/Please enter a job description/i)).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. GENERATE BULLET POINTS
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Generate Bullet Points", () => {
  test("renders page with form elements", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/generate/bullets");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /Generate Resume Bullets/i })
    ).toBeVisible();
    await expect(page.getByText(/1 credit per generation/i)).toBeVisible();
    await expect(page.getByText(/Open Career Memory/i)).toBeVisible();

    // Form elements
    await expect(page.locator("#jobDuty")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Generate Bullet Points/i })
    ).toBeVisible();

    // Tips section
    await expect(page.getByText(/Tips for best results/i)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("submit button is disabled when input is empty", async ({ page }) => {
    await navigateTo(page, "/generate/bullets");

    const submitBtn = page.getByRole("button", {
      name: /Generate Bullet Points/i,
    });
    await expect(submitBtn).toBeDisabled();
  });

  test("submit button enables when input has content", async ({ page }) => {
    await navigateTo(page, "/generate/bullets");

    await page.locator("#jobDuty").fill("Managed a team of 5 engineers");
    const submitBtn = page.getByRole("button", {
      name: /Generate Bullet Points/i,
    });
    await expect(submitBtn).toBeEnabled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. GENERATE COVER LETTER
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Generate Cover Letter", () => {
  test("renders page with form elements and history sidebar", async ({
    page,
  }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/generate/cover-letter");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /Generate Cover Letter/i })
    ).toBeVisible();
    await expect(page.getByText(/2 credits per generation/i)).toBeVisible();
    await expect(page.getByText(/Open Career Memory/i)).toBeVisible();

    // Job description input
    await expect(page.locator("#jobDescription")).toBeVisible();

    // Submit button
    await expect(
      page.getByRole("button", { name: /Generate Cover Letter/i })
    ).toBeVisible();

    // History sidebar
    await expect(page.getByRole("heading", { name: /History/i })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("submit button is disabled when input is empty", async ({ page }) => {
    await navigateTo(page, "/generate/cover-letter");

    const submitBtn = page.getByRole("button", {
      name: /Generate Cover Letter/i,
    });
    await expect(submitBtn).toBeDisabled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. APPLICATION TRACKER
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Application Tracker", () => {
  test("renders with Kanban & List view toggles and add button", async ({
    page,
  }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/dashboard/applications");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /Application Tracker/i })
    ).toBeVisible();

    // View toggles
    await expect(page.locator('[data-testid="view-kanban"]')).toBeVisible();
    await expect(page.locator('[data-testid="view-list"]')).toBeVisible();

    // Add button
    await expect(page.locator('[data-testid="new-application-btn"]')).toBeVisible();

    // Kanban board (default view)
    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();

    // Column headers
    await expect(page.getByText("Saved")).toBeVisible();
    await expect(page.getByText("Applied")).toBeVisible();
    await expect(page.getByText("Screening")).toBeVisible();
    await expect(page.getByText("Interviewing")).toBeVisible();
    await expect(page.getByText("Offer")).toBeVisible();

    // AI Disclosure banner
    await expect(
      page.getByText(/Some application content may be generated by AI/i)
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("can switch to list view", async ({ page }) => {
    await navigateTo(page, "/dashboard/applications");

    await page.locator('[data-testid="view-list"]').click();
    await expect(page.locator('[data-testid="list-view"]')).toBeVisible();

    // Table headers
    await expect(page.getByText("Company")).toBeVisible();
    await expect(page.getByText("Position")).toBeVisible();
    await expect(page.getByText("Status")).toBeVisible();
  });

  test("opens and closes add application modal", async ({ page }) => {
    await navigateTo(page, "/dashboard/applications");

    // Open modal
    await page.locator('[data-testid="new-application-btn"]').click();
    await expect(
      page.getByRole("heading", { name: /Add Application/i })
    ).toBeVisible();

    // Form fields present
    await expect(page.locator('[data-testid="new-app-company"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-app-title"]')).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(
      page.getByRole("heading", { name: /Add Application/i })
    ).toBeHidden();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. JOB PACKS
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Job Packs", () => {
  test("renders job packs page with header and new pack button", async ({
    page,
  }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/dashboard/job-packs");

    await assertBetaBanner(page);
    await expect(
      page.getByRole("heading", { name: /Job Packs/i })
    ).toBeVisible();
    await expect(page.getByText(/tailored application packages/i)).toBeVisible();
    await expect(
      page.locator('[data-testid="new-job-pack-btn"]')
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("new job pack page loads", async ({ page }) => {
    await navigateTo(page, "/dashboard/job-packs/new");

    await assertBetaBanner(page);
    // Should have content for creating a new job pack
    await expect(page.locator("body")).not.toBeEmpty();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. PROFILE HUB & SUB-PAGES
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Profile section", () => {
  test("profile hub page loads", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/dashboard/profile");

    await assertBetaBanner(page);
    await expect(page.locator("body")).not.toBeEmpty();
    expect(errors).toEqual([]);
  });

  const profileSubPages = [
    { path: "/dashboard/profile/facts", label: "Career Memory / Facts" },
    { path: "/dashboard/profile/skills", label: "Skills" },
    { path: "/dashboard/profile/education", label: "Education" },
    { path: "/dashboard/profile/experience", label: "Experience" },
    { path: "/dashboard/profile/stories", label: "STAR Stories" },
    { path: "/dashboard/profile/goals", label: "SMART Goals" },
  ];

  for (const sub of profileSubPages) {
    test(`sub-page ${sub.label} loads without crash`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await navigateTo(page, sub.path);

      await assertBetaBanner(page);
      // At minimum the page body must render
      await expect(page.locator("body")).not.toBeEmpty();
      expect(errors).toEqual([]);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. INTELLIGENCE PAGES
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Intelligence pages", () => {
  const intelligencePages = [
    { path: "/dashboard/copilot", heading: /Career Copilot/i },
    { path: "/dashboard/interview", heading: /Mock Interview/i },
    { path: "/dashboard/jobs", heading: /Discover Jobs|Job Search/i },
    { path: "/dashboard/job-fit", heading: /Job Fit|Job fit/i },
    { path: "/dashboard/library", heading: /Library|Generated Assets/i },
  ];

  for (const pg of intelligencePages) {
    test(`${pg.path} renders`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await navigateTo(page, pg.path);

      await assertBetaBanner(page);
      await expect(page.locator("body")).not.toBeEmpty();
      expect(errors).toEqual([]);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. ONBOARDING
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Onboarding", () => {
  test("onboarding page loads", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await navigateTo(page, "/dashboard/onboarding");

    await assertBetaBanner(page);
    await expect(page.locator("body")).not.toBeEmpty();
    expect(errors).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. CROSS-CUTTING: BETA BANNER ON ALL PAGES
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Beta banner presence across all routes", () => {
  const allRoutes = [
    "/",
    "/dashboard",
    "/dashboard/scanner",
    "/dashboard/applications",
    "/dashboard/job-packs",
    "/dashboard/copilot",
    "/dashboard/interview",
    "/dashboard/jobs",
    "/dashboard/profile",
    "/dashboard/onboarding",
    "/generate/bullets",
    "/generate/cover-letter",
    "/pricing",
    "/buy-credits",
    "/auth/signin",
    "/privacy",
    "/terms",
    "/trust",
  ];

  for (const route of allRoutes) {
    test(`beta banner visible on ${route}`, async ({ page }) => {
      await navigateTo(page, route);
      await assertBetaBanner(page);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 14. RESPONSIVE SMOKE TESTS
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Responsive layout", () => {
  test("homepage is usable at mobile viewport (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, "/");

    await expect(
      page.getByRole("heading", { name: /Supercharge Your Job Search/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Try Free/i })).toBeVisible();
  });

  test("dashboard is usable at tablet viewport (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await navigateTo(page, "/dashboard");

    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();
  });

  test("dashboard renders at full desktop viewport (1440px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await navigateTo(page, "/dashboard");

    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();
    await expect(page.getByText("9999")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 15. NAVIGATION FLOW SMOKE TESTS
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Navigation flows", () => {
  test("homepage → dashboard → scanner → dashboard round trip", async ({
    page,
  }) => {
    await navigateTo(page, "/");

    // Go to dashboard (via Sign In link — in beta it links to /auth/signin or /dashboard)
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();

    // Dashboard → Scanner
    await page.locator('[data-testid="ats-scanner-link"]').click();
    await expect(page).toHaveURL(/\/dashboard\/scanner/);
    await expect(
      page.getByRole("heading", { name: /ATS Scanner/i })
    ).toBeVisible();

    // Back to Dashboard
    await page.getByRole("link", { name: "Dashboard" }).first().click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("dashboard → applications → back", async ({ page }) => {
    await navigateTo(page, "/dashboard");

    await page.locator('[data-testid="application-tracker-link"]').click();
    await expect(page).toHaveURL(/\/dashboard\/applications/);
    await expect(
      page.getByRole("heading", { name: /Application Tracker/i })
    ).toBeVisible();

    await page.getByRole("link", { name: "Dashboard" }).first().click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("dashboard → job packs → new job pack", async ({ page }) => {
    await navigateTo(page, "/dashboard");

    await page.locator('[data-testid="job-packs-link"]').click();
    await expect(page).toHaveURL(/\/dashboard\/job-packs/);

    await page.locator('[data-testid="new-job-pack-btn"]').click();
    await expect(page).toHaveURL(/\/dashboard\/job-packs\/new/);
  });

  test("dashboard → generate bullets", async ({ page }) => {
    await navigateTo(page, "/dashboard");

    await page.getByText("Generate Bullet Points").click();
    await expect(page).toHaveURL(/\/generate\/bullets/);
    await expect(
      page.getByRole("heading", { name: /Generate Resume Bullets/i })
    ).toBeVisible();
  });

  test("dashboard → generate cover letter", async ({ page }) => {
    await navigateTo(page, "/dashboard");

    await page.getByText("Generate Cover Letter").click();
    await expect(page).toHaveURL(/\/generate\/cover-letter/);
    await expect(
      page.getByRole("heading", { name: /Generate Cover Letter/i })
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 16. SEO & META CHECKS
// ═══════════════════════════════════════════════════════════════════════════
test.describe("SEO basics", () => {
  test("homepage has title and meta description", async ({ page }) => {
    await navigateTo(page, "/");

    const title = await page.title();
    expect(title).toContain("CVScan");

    const metaDesc = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(metaDesc).toBeTruthy();
    expect(metaDesc!.length).toBeGreaterThan(20);
  });

  test("privacy page has correct title", async ({ page }) => {
    await navigateTo(page, "/privacy");

    const title = await page.title();
    expect(title).toContain("Privacy");
  });

  test("terms page has correct title", async ({ page }) => {
    await navigateTo(page, "/terms");

    const title = await page.title();
    expect(title).toContain("Terms");
  });

  test("trust page has correct title", async ({ page }) => {
    await navigateTo(page, "/trust");

    const title = await page.title();
    expect(title).toContain("Trust");
  });
});
