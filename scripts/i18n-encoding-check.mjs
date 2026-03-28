import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MESSAGES_DIR = join(process.cwd(), "messages");

const SUSPICIOUS_PATTERNS = [
  /\uFFFD/u,
  /Ã[\u0080-\u00BF]/u,
  /Â[\u0080-\u00BF]/u,
  /â[\u0080-\u00BF]/u,
  /Ð[\u0080-\u00BF]/u,
  /Ñ[\u0080-\u00BF]/u,
  /Ø[\u0080-\u00BF]/u,
  // Removed: /à[\u0080-\u00BF]/u, // Too aggressive for French text
  // Removed: /ã[\u0080-\u00BF]/u, // Too aggressive for Portuguese text
  // Removed: /ä[\u0080-\u00BF]/u, // Too aggressive for German/Swedish text
  /â†/u,
  /â€“|â€”|â€|â€˜|â€™|â€œ|â€\u009d/u,
  /Â©/u,
];

function listMessageFiles() {
  return readdirSync(MESSAGES_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort();
}

function hasSuspiciousEncoding(value) {
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(value));
}

function walkStrings(node, path, issues) {
  if (typeof node === "string") {
    if (hasSuspiciousEncoding(node)) {
      issues.push({ path, value: node });
    }
    return;
  }

  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) {
      walkStrings(node[i], `${path}[${i}]`, issues);
    }
    return;
  }

  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      const nextPath = path ? `${path}.${key}` : key;
      walkStrings(value, nextPath, issues);
    }
  }
}

function main() {
  const files = listMessageFiles();
  if (files.length === 0) {
    throw new Error("No locale message files found in messages/ directory.");
  }

  const errors = [];

  for (const file of files) {
    const filePath = join(MESSAGES_DIR, file);
    const raw = readFileSync(filePath, "utf8");

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      errors.push(`Invalid JSON in ${file}: ${error.message}`);
      continue;
    }

    const canonical = `${JSON.stringify(parsed, null, 2)}\n`;
    if (raw !== canonical) {
      errors.push(`Formatting drift in ${file}: file is not canonical 2-space JSON with trailing newline.`);
    }

    const issues = [];
    walkStrings(parsed, "", issues);

    for (const issue of issues) {
      errors.push(`Encoding issue in ${file} at ${issue.path}: ${JSON.stringify(issue.value)}`);
    }
  }

  if (errors.length > 0) {
    console.error("i18n encoding check failed:\n");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`i18n encoding check passed for ${files.length} locale files.`);
}

main();
