import { readFile } from "node:fs/promises";

const assetLinksPath = new URL("../app/public/.well-known/assetlinks.json", import.meta.url);
const fallbackPath = new URL("../www/index.html", import.meta.url);

const [assetLinks, fallback] = await Promise.all([
  readFile(assetLinksPath, "utf8"),
  readFile(fallbackPath, "utf8"),
]);

if (assetLinks.includes("REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT")) {
  throw new Error(
    "assetlinks.json still has the Play App Signing fingerprint placeholder. Update it from Play Console before releasing."
  );
}

if (!/^[\s\S]*"sha256_cert_fingerprints"[\s\S]*[A-F0-9]{2}(?::[A-F0-9]{2}){31}/.test(assetLinks)) {
  throw new Error("assetlinks.json does not contain a valid SHA-256 certificate fingerprint.");
}

if (!fallback.includes("<h1>")) {
  throw new Error("The Capacitor www fallback page is empty.");
}

console.log("Play release configuration checks passed.");
