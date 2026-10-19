/* global console, process, URL */

import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const baseUrl = process.env.PLAY_SCREENSHOT_BASE_URL || "http://127.0.0.1:3000";
const outputDir = new URL("../../docs/assets/play-store-screenshots/", import.meta.url);
const screens = [
  ["01-home.png", "/"],
  ["02-pricing.png", "/pricing"],
  ["03-sign-in.png", "/auth/signin"],
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 360, height: 640 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();

try {
  for (const [fileName, path] of screens) {
    await page.goto(new URL(path, baseUrl).toString(), { waitUntil: "networkidle" });
    await page.screenshot({ path: fileURLToPath(new URL(fileName, outputDir)), fullPage: false });
  }
} finally {
  await browser.close();
}

console.log(`Wrote ${screens.length} Play Store phone screenshots to ${outputDir.pathname}`);
