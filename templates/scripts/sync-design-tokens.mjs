#!/usr/bin/env node
/**
 * Sync design tokens from a GitHub repo or a local design-tokens JSON file → Uniwind generated files.
 *
 * Intake pins TOKENS_SOURCE (GitHub URL or local path). Compatible aliases:
 * TOKENS_GITHUB_URL (repos) / TOKENS_LOCAL_PATH (JSON file). Phase B: implement
 * `transformAndWrite` for this source’s export layout. Users re-run anytime:
 *
 *   bun run tokens:sync
 *
 * Appearance (light/dark) ≠ Figma color schemes (e.g. Default / Rider Tools).
 * Never auto-map scheme names to Uniwind light/dark — see templates/TOKEN_SYNC.md.
 *
 * Output contracts:
 *   - Uniwind: templates/TOKEN_SYNC.md + stubs under src/theme/tokens/generated/
 *   - Storybook (when src/stories/design-tokens/ exists): templates/STORYBOOK_TOKEN_DEFINITIONS.md
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src/theme/tokens/generated");
const CACHE_DIR = path.join(ROOT, ".tokens-cache");

/** Set at bootstrap Phase B from intake (override with env). */
const TOKENS_SOURCE =
  process.env.TOKENS_SOURCE?.trim() ||
  process.env.TOKENS_GITHUB_URL?.trim() ||
  process.env.TOKENS_LOCAL_PATH?.trim() ||
  "https://github.com/ORG/design-tokens";

const GENERATED_BANNER = "/* AUTO-GENERATED — do not edit. Run: bun run tokens:sync */";
const METRO_CONFIG = path.join(ROOT, "metro.config.js");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeGenerated(fileName, body) {
  const withBanner = body.startsWith("/* AUTO-GENERATED") ? body : `${GENERATED_BANNER}\n${body}`;
  const filePath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(filePath, withBanner.endsWith("\n") ? withBanner : `${withBanner}\n`);
  console.log(`  wrote ${path.relative(ROOT, filePath)}`);
}

/**
 * Patch Uniwind `extraThemes` in metro.config.js from detected scheme slugs.
 * Idempotent: if the array already matches, leave the file untouched (do not throw).
 * Throw only when `extraThemes: […]` is missing from the config.
 *
 * @param {string[]} schemeSlugs
 */
function patchMetroExtraThemes(schemeSlugs) {
  if (!fs.existsSync(METRO_CONFIG)) {
    console.warn("  warn: metro.config.js missing — skip extraThemes patch");
    return;
  }
  const src = fs.readFileSync(METRO_CONFIG, "utf8");
  const list = schemeSlugs.map((s) => `"${s}"`).join(", ");
  if (!/extraThemes:\s*\[/.test(src)) {
    throw new Error(
      "Could not patch extraThemes in metro.config.js — expected `extraThemes: […]`.",
    );
  }
  const next = src.replace(/extraThemes:\s*\[[^\]]*\]/, `extraThemes: [${list}]`);
  if (next === src) {
    console.log(`  metro extraThemes already set: [${list}]`);
    return;
  }
  fs.writeFileSync(METRO_CONFIG, next);
  console.log(`  patched metro extraThemes: [${list}]`);
}

/** @param {string} source */
function isGitHubUrl(source) {
  return /^https?:\/\/(www\.)?github\.com[/:]/i.test(source) || /^git@github\.com:/i.test(source);
}

/** @param {string} source */
function isPlaceholderSource(source) {
  return !source || source.includes("ORG/design-tokens");
}

/**
 * Shallow-clone or fetch the tokens repo into .tokens-cache/repo.
 * @param {string} githubUrl
 * @returns {string} absolute path to the checkout
 */
function fetchTokensRepo(githubUrl) {
  ensureDir(CACHE_DIR);
  const repoDir = path.join(CACHE_DIR, "repo");

  if (fs.existsSync(path.join(repoDir, ".git"))) {
    console.log(`Fetching latest in ${path.relative(ROOT, repoDir)}…`);
    execFileSync("git", ["-C", repoDir, "fetch", "--depth", "1", "origin"], {
      stdio: "inherit",
    });
    execFileSync("git", ["-C", repoDir, "reset", "--hard", "origin/HEAD"], {
      stdio: "inherit",
    });
  } else {
    if (fs.existsSync(repoDir)) {
      fs.rmSync(repoDir, { recursive: true, force: true });
    }
    console.log(`Cloning ${githubUrl}…`);
    execFileSync("git", ["clone", "--depth", "1", githubUrl, repoDir], {
      stdio: "inherit",
    });
  }

  return repoDir;
}

/**
 * Resolve intake source to a path the transform can read.
 * GitHub URL → cloned repo directory. Local path → absolute file or directory.
 *
 * @returns {{ kind: "github" | "local"; path: string; label: string }}
 */
function resolveTokensSource() {
  if (isPlaceholderSource(TOKENS_SOURCE)) {
    throw new Error(
      "Set TOKENS_SOURCE (env or constant in scripts/sync-design-tokens.mjs) to a GitHub URL or a local path to a design-tokens JSON file.",
    );
  }

  if (isGitHubUrl(TOKENS_SOURCE)) {
    const repoDir = fetchTokensRepo(TOKENS_SOURCE);
    return { kind: "github", path: repoDir, label: TOKENS_SOURCE };
  }

  const localPath = path.isAbsolute(TOKENS_SOURCE)
    ? TOKENS_SOURCE
    : path.resolve(ROOT, TOKENS_SOURCE);

  if (!fs.existsSync(localPath)) {
    throw new Error(`Design tokens source not found: ${localPath}`);
  }

  const stat = fs.statSync(localPath);
  if (stat.isFile() && !/\.json$/i.test(localPath)) {
    throw new Error(`Local design tokens source must be a .json file (got: ${localPath})`);
  }

  console.log(`Using local tokens source: ${localPath}`);
  return { kind: "local", path: localPath, label: localPath };
}

/**
 * AGENT (Phase B): parse plugin exports under `sourcePath` and write Uniwind files to OUT_DIR.
 *
 * `sourcePath` is either a cloned tokens repo directory (GitHub intake) or an absolute
 * path to a design-tokens `.json` file (local intake). Sibling exports may live next to
 * a JSON file — check `path.dirname(sourcePath)` when needed.
 *
 * Must produce the same file set / shapes as template stubs in src/theme/tokens/generated/
 * (theme.css, colors.ts names+metadata, spacing.css, typography-primitives.css,
 * typography.ts recipes, …). Delete stale typography-primitives.ts / typography-classes.ts
 * if present. Typography: text-size-* + leading-* + font-Regular|Medium|SemiBold|Bold —
 * see templates/TOKEN_SYNC.md “Typography (Uniwind)”. Call patchMetroExtraThemes(schemeSlugs)
 * when multi-scheme.
 *
 * When Storybook is on, also write src/stories/design-tokens/token-definitions.ts per
 * templates/STORYBOOK_TOKEN_DEFINITIONS.md (export API — stories import fixed shapes;
 * token keys/counts vary per design system).
 *
 * @param {string} sourcePath
 */
function transformAndWrite(sourcePath) {
  void sourcePath;
  void writeGenerated;
  void OUT_DIR;
  void os;
  void patchMetroExtraThemes;

  throw new Error(
    "Phase B incomplete: implement transformAndWrite() in scripts/sync-design-tokens.mjs for this tokens source’s export format.",
  );
}

function main() {
  console.log("Syncing design tokens → Uniwind generated/\n");

  const source = resolveTokensSource();
  console.log(`  source (${source.kind}): ${source.label}`);

  ensureDir(OUT_DIR);
  transformAndWrite(source.path);

  console.log("\nDone. Re-run anytime: bun run tokens:sync");
}

main();
