import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = join(ROOT, "scripts", "i18n-literal-baseline.json");
const TARGET_DIRS = ["app", "components"];

const IGNORED_PATH_PATTERNS = [
  /^app\/terms-of-service\//,
  /^app\/privacy-policy\//,
  /^components\/ui\//,
  /^app\/providers\.tsx$/,
  /^app\/layout\.tsx$/,
  /^app\/globals\.css\.d\.ts$/,
];

const JSX_TEXT_REGEX = />([^<>{]+)</g;

function shouldIgnorePath(path) {
  return IGNORED_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function walk(dir) {
  const out = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(fullPath));
      continue;
    }

    if (!entry.name.endsWith(".tsx")) continue;
    out.push(fullPath);
  }
  return out;
}

function normalizeText(input) {
  return input.replace(/\s+/g, " ").trim();
}

function isCandidateLiteral(text) {
  if (text.length < 3) return false;
  if (!/[A-Za-z]/.test(text)) return false;
  if (/^[\d\s\W_]+$/.test(text)) return false;
  return true;
}

function countLiteralsInFile(filePath) {
  const source = readFileSync(filePath, "utf8");
  let count = 0;
  for (const match of source.matchAll(JSX_TEXT_REGEX)) {
    const text = normalizeText(match[1] ?? "");
    if (!isCandidateLiteral(text)) continue;
    count += 1;
  }
  return count;
}

function collectCounts() {
  const byFile = {};
  for (const dir of TARGET_DIRS) {
    const fullDir = join(ROOT, dir);
    const files = walk(fullDir);
    for (const file of files) {
      const rel = relative(ROOT, file).replace(/\\/g, "/");
      if (shouldIgnorePath(rel)) continue;
      const count = countLiteralsInFile(file);
      if (count > 0) {
        byFile[rel] = count;
      }
    }
  }

  const total = Object.values(byFile).reduce((sum, value) => sum + value, 0);
  return { total, byFile };
}

function writeBaseline(snapshot) {
  const payload = {
    generatedAt: new Date().toISOString(),
    total: snapshot.total,
    byFile: snapshot.byFile,
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`i18n literal baseline updated: ${payload.total} literals`);
}

function readBaseline() {
  return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
}

function compareAgainstBaseline(current, baseline) {
  const regressions = [];

  if (current.total > baseline.total) {
    regressions.push(
      `Total literal count increased: baseline=${baseline.total}, current=${current.total}`,
    );
  }

  const allFiles = new Set([
    ...Object.keys(current.byFile),
    ...Object.keys(baseline.byFile ?? {}),
  ]);

  for (const file of allFiles) {
    const baselineCount = baseline.byFile?.[file] ?? 0;
    const currentCount = current.byFile?.[file] ?? 0;
    if (currentCount > baselineCount) {
      regressions.push(
        `${file}: baseline=${baselineCount}, current=${currentCount}`,
      );
    }
  }

  return regressions;
}

function main() {
  const updateBaseline = process.argv.includes("--update-baseline");
  const current = collectCounts();

  if (updateBaseline) {
    writeBaseline(current);
    return;
  }

  const baseline = readBaseline();
  const regressions = compareAgainstBaseline(current, baseline);

  if (regressions.length > 0) {
    console.error("i18n literal guard failed:\n");
    for (const item of regressions) {
      console.error(`- ${item}`);
    }
    process.exit(1);
  }

  console.log(
    `i18n literal guard passed: total=${current.total} (baseline=${baseline.total})`,
  );
}

main();