import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";

const MESSAGES_DIR = join(process.cwd(), "messages");
const DEFAULT_LOCALE = "en";

function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function loadMessages(filePath) {
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function getLocaleFiles() {
  const files = readdirSync(MESSAGES_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    throw new Error("No locale message files found in messages/ directory.");
  }

  return files;
}

function main() {
  const files = getLocaleFiles();
  const localeMap = new Map();

  for (const file of files) {
    const locale = basename(file, ".json");
    const messages = loadMessages(join(MESSAGES_DIR, file));
    localeMap.set(locale, new Set(flattenKeys(messages)));
  }

  if (!localeMap.has(DEFAULT_LOCALE)) {
    throw new Error(`Default locale file ${DEFAULT_LOCALE}.json is missing.`);
  }

  const baseKeys = localeMap.get(DEFAULT_LOCALE);
  const errors = [];

  for (const [locale, keys] of localeMap.entries()) {
    if (locale === DEFAULT_LOCALE) continue;

    const missing = [...baseKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !baseKeys.has(k));

    if (missing.length > 0) {
      errors.push(`Locale '${locale}' is missing ${missing.length} keys:\n  - ${missing.join("\n  - ")}`);
    }

    if (extra.length > 0) {
      errors.push(`Locale '${locale}' has ${extra.length} extra keys not in '${DEFAULT_LOCALE}':\n  - ${extra.join("\n  - ")}`);
    }
  }

  if (errors.length > 0) {
    console.error("i18n check failed:\n");
    for (const err of errors) {
      console.error(err);
      console.error("");
    }
    process.exit(1);
  }

  console.log(`i18n check passed for locales: ${[...localeMap.keys()].join(", ")}`);
}

main();
