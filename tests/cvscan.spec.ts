import { test, expect } from '@playwright/test';

test('CVScan homepage loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('body')).toContainText(/CV/i);
});
