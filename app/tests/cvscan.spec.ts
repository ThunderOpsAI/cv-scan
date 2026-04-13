import { test, expect } from '@playwright/test';

test('public homepage routes visitors to the public pricing page', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /Supercharge Your Job Search/i })
  ).toBeVisible();

  await page.getByRole('navigation').getByRole('link', { name: 'Pricing' }).click();

  await expect(page).toHaveURL(/\/pricing$/);
  await expect(
    page.getByRole('heading', { name: /Simple, Transparent Pricing/i })
  ).toBeVisible();
  await expect(page.getByText('50 Credits')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('sign-in page enforces consent before email sign-in', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('/auth/signin');

  await page.getByLabel('Email Address').fill('tester@example.com');
  await page.getByRole('button', { name: 'Sign in with Email' }).click();

  await expect(
    page.getByText('Please agree to the Terms and Privacy Policy to continue.')
  ).toBeVisible();

  await page.getByLabel(/I agree to the Terms of Service and Privacy Policy/i).check();
  await expect(
    page.getByText('Please agree to the Terms and Privacy Policy to continue.')
  ).toBeHidden();
  expect(consoleErrors).toEqual([]);
});

test('protected dashboard flow redirects guests and protected API returns 401', async ({ page, request }) => {
  const profileResponse = await request.get('/api/profile');
  expect(profileResponse.status()).toBe(401);
  await expect(profileResponse.json()).resolves.toEqual({ error: 'Unauthorized' });

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth\/signin(?:\?.*)?$/);
  await expect(page.getByText('Sign in to your account')).toBeVisible();

  await page.goto('/buy-credits');
  await expect(page).toHaveURL(/\/auth\/signin(?:\?.*)?$/);
  await expect(page.getByText('Sign in to your account')).toBeVisible();

  await page.goto('/generate/bullets');
  await expect(page).toHaveURL(/\/auth\/signin(?:\?.*)?$/);
  await expect(page.getByText('Sign in to your account')).toBeVisible();

  await page.goto('/dashboard/profile/facts');
  await expect(page).toHaveURL(/\/auth\/signin(?:\?.*)?$/);
  await expect(page.getByText('Sign in to your account')).toBeVisible();
});
