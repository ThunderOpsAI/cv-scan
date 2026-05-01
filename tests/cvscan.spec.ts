import { test, expect } from '@playwright/test';

test('AICVScan homepage loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('body')).toContainText(/AICVScan/i);
});
