#!/usr/bin/env node
/**
 * Accessibility audit using pa11y against the running dev/preview server.
 * Usage: npm run a11y:test
 * Requires the app to be running at http://localhost:5173
 */

import { spawn } from "node:child_process";

const URL = process.env.A11Y_URL ?? "http://localhost:5173";

const checks = [
  { name: "Homepage", url: URL },
];

async function runPa11y(targetUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      [
        "pa11y",
        targetUrl,
        "--standard",
        "WCAG2AA",
        "--reporter",
        "cli",
        "--config",
        "pa11y.json",
      ],
      { stdio: "pipe", shell: true, cwd: new URL("..", import.meta.url).pathname },
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });

    child.on("close", (code) => {
      resolve({ code, stdout, stderr, url: targetUrl });
    });
    child.on("error", reject);
  });
}

console.log(`\n🔍 Accessibility audit (WCAG 2.0 AA) — ${URL}\n`);

let failures = 0;

for (const check of checks) {
  console.log(`Checking: ${check.name} (${check.url})`);
  try {
    const result = await runPa11y(check.url);
    if (result.stdout) console.log(result.stdout);
    if (result.stderr) console.error(result.stderr);
    if (result.code !== 0) {
      failures++;
      console.log(`❌ ${check.name}: issues found\n`);
    } else {
      console.log(`✅ ${check.name}: no issues\n`);
    }
  } catch (err) {
    failures++;
    console.error(`❌ ${check.name}: ${err.message}`);
    console.error("   Make sure the dev server is running: npm run dev\n");
  }
}

console.log("--- Manual checks ---");
console.log("• Voice search: Chrome/Edge microphone button");
console.log("• Screen reader: NVDA/VoiceOver announces search results");
console.log("• Keyboard: Tab through filters, Enter to select providers");
console.log("• Siri: 'Hey Siri, open healthpoint finder in Chrome' then use voice search");
console.log("• Gemini: set GEMINI_API_KEY for smarter voice parsing\n");

process.exit(failures > 0 ? 1 : 0);