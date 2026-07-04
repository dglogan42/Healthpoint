#!/usr/bin/env node
/**
 * Static accessibility checks (no browser required).
 * Validates built HTML and key a11y patterns in source.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcDir = join(root, "src");

const checks = [];
let passed = 0;
let failed = 0;

function pass(msg) {
  checks.push({ ok: true, msg });
  passed++;
}

function fail(msg) {
  checks.push({ ok: false, msg });
  failed++;
}

// Check built HTML
const distHtml = join(root, "dist/index.html");
try {
  const html = readFileSync(distHtml, "utf8");
  if (html.includes('lang="en-NZ"')) pass("HTML lang=en-NZ set");
  else fail("HTML missing lang=en-NZ");
  if (html.includes("viewport")) pass("Viewport meta present");
  else fail("Missing viewport meta");
} catch {
  fail("dist/index.html not found — run npm run build first");
}

// Check source patterns
const srcFiles = readdirSync(join(srcDir, "components"))
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => readFileSync(join(srcDir, "components", f), "utf8"))
  .join("\n");

const appSrc = readFileSync(join(srcDir, "App.tsx"), "utf8");
const allSrc = srcFiles + appSrc + readFileSync(join(srcDir, "index.css"), "utf8");

if (allSrc.includes("SkipLink") || allSrc.includes("skip-link")) pass("Skip to main content link");
else fail("Missing skip link");

if (allSrc.includes("sr-only")) pass("Screen reader only utility class");
else fail("Missing .sr-only class");

if (allSrc.includes(":focus-visible")) pass("Focus visible styles defined");
else fail("Missing :focus-visible styles");

if (allSrc.includes("aria-live")) pass("Live regions for dynamic updates");
else fail("Missing aria-live regions");

if (allSrc.includes("aria-pressed")) pass("Toggle buttons use aria-pressed");
else fail("Missing aria-pressed on filter chips");

if (allSrc.includes("VoiceSearchButton") || allSrc.includes("voice-search")) pass("Voice search UI present");
else fail("Missing voice search");

if (allSrc.includes("role=\"search\"")) pass("Search landmark present");
else fail("Missing role=search");

if (allSrc.includes("prefers-reduced-motion")) pass("Reduced motion support");
else fail("Missing prefers-reduced-motion");

console.log("\n📋 Static accessibility checks\n");
for (const c of checks) {
  console.log(`${c.ok ? "✅" : "❌"} ${c.msg}`);
}
console.log(`\n${passed} passed, ${failed} failed\n`);

process.exit(failed > 0 ? 1 : 0);