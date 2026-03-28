import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const MESSAGES_DIR = join(ROOT, "messages");
const SOURCE_LOCALE = "en";
const TARGET_LOCALES = [
  "ms",
  "th",
  "vi",
  "fil",
  "zh",
  "ja",
  "ko",
  "es",
  "fr",
  "de",
  "pt",
  "ar",
  "hi",
  "ru",
];

const BATCH_SIZE = 20;
const SEP = "\n⟪SEP⟫\n";
const TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 500;

function loadJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function saveJson(filePath, value) {
  writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function collectStrings(node, path = [], out = []) {
  if (typeof node === "string") {
    out.push({ path, value: node });
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((item, index) => collectStrings(item, [...path, index], out));
    return out;
  }
  if (node && typeof node === "object") {
    Object.entries(node).forEach(([key, value]) => collectStrings(value, [...path, key], out));
  }
  return out;
}

function setAtPath(root, path, value) {
  let cursor = root;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    cursor = cursor[key];
  }
  cursor[path[path.length - 1]] = value;
}

function shouldSkipTranslation(input) {
  if (!input.trim()) return true;
  if (/^https?:\/\//i.test(input.trim())) return true;
  if (/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(input.trim())) return true;
  if (/github\.com\//i.test(input)) return true;
  if (/^\{[a-zA-Z0-9_]+\}$/.test(input.trim())) return true;
  return false;
}

function protectPlaceholders(input) {
  const placeholders = [];
  let text = input;

  text = text.replace(/\{[a-zA-Z0-9_]+\}/g, (m) => {
    const token = `__PH_${placeholders.length}__`;
    placeholders.push(m);
    return token;
  });

  return { text, placeholders };
}

function restorePlaceholders(input, placeholders) {
  let output = input;
  placeholders.forEach((value, index) => {
    output = output.replaceAll(`__PH_${index}__`, value);
  });
  return output;
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

async function translateBatch(values, targetLocale) {
  const protectedValues = values.map((value) => protectPlaceholders(value));
  const joined = protectedValues.map((item) => item.text).join(SEP);
  const query = new URLSearchParams({
    client: "gtx",
    sl: SOURCE_LOCALE,
    tl: targetLocale,
    dt: "t",
    q: joined,
  });

  let response;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    response = await fetch(`${TRANSLATE_URL}?${query.toString()}`);
    if (response.ok) {
      break;
    }

    if (response.status >= 500 && attempt < MAX_RETRIES - 1) {
      const delay = BASE_RETRY_DELAY_MS * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    throw new Error(`Translate API failed (${response.status})`);
  }

  const payload = await response.json();
  const translatedJoined = (payload?.[0] ?? []).map((part) => part?.[0] ?? "").join("");
  const translatedParts = translatedJoined.split(SEP);

  if (translatedParts.length !== values.length) {
    throw new Error("Separator mismatch in translation response");
  }

  return translatedParts.map((translated, index) =>
    restorePlaceholders(translated, protectedValues[index].placeholders),
  );
}

async function translateLocale(baseMessages, locale) {
  const output = JSON.parse(JSON.stringify(baseMessages));
  const strings = collectStrings(baseMessages).filter((item) => !shouldSkipTranslation(item.value));
  const batches = chunk(strings, BATCH_SIZE);

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    const sourceValues = batch.map((item) => item.value);
    let translatedValues;

    try {
      translatedValues = await translateBatch(sourceValues, locale);
    } catch {
      // Fallback to per-string translation if a batch response is malformed.
      translatedValues = [];
      for (const source of sourceValues) {
        const [single] = await translateBatch([source], locale);
        translatedValues.push(single);
      }
    }

    batch.forEach((entry, index) => {
      setAtPath(output, entry.path, translatedValues[index]);
    });

    if ((i + 1) % 10 === 0 || i === batches.length - 1) {
      console.log(`[${locale}] translated ${Math.min((i + 1) * BATCH_SIZE, strings.length)}/${strings.length} strings`);
    }
  }

  return output;
}

async function main() {
  const sourcePath = join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`);
  const baseMessages = loadJson(sourcePath);

  for (const locale of TARGET_LOCALES) {
    const translated = await translateLocale(baseMessages, locale);
    const outputPath = join(MESSAGES_DIR, `${locale}.json`);
    saveJson(outputPath, translated);
    console.log(`Saved ${locale}.json`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
