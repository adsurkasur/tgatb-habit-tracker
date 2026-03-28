import { readdirSync, readFileSync, writeFileSync } from "node:fs";
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
  /à[\u0080-\u00BF]/u,
  /ã[\u0080-\u00BF]/u,
  /ä[\u0080-\u00BF]/u,
  /â†/u,
  /â€“|â€”|â€|â€˜|â€™|â€œ|â€\u009d/u,
  /Â©/u,
];

const WEB_WARNING = "Language changes apply immediately. This page may briefly re-render.";
const APP_WARNING = "Language changes apply instantly. No app restart is required.";

function listMessageFiles() {
  return readdirSync(MESSAGES_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort();
}

function suspiciousScore(value) {
  let score = 0;
  for (const pattern of SUSPICIOUS_PATTERNS) {
    const globalPattern = new RegExp(pattern.source, `${pattern.flags.includes("u") ? "u" : ""}g`);
    const matches = value.match(globalPattern);
    score += matches ? matches.length : 0;
  }
  return score;
}

function maybeDecodeMojibake(value) {
  const beforeScore = suspiciousScore(value);
  if (beforeScore === 0) {
    return { value, changed: false };
  }

  const decoded = Buffer.from(value, "latin1").toString("utf8");
  const afterScore = suspiciousScore(decoded);

  if (decoded.includes("\u0000")) {
    return { value, changed: false };
  }

  if (afterScore < beforeScore) {
    return { value: decoded, changed: true };
  }

  return { value, changed: false };
}

function walkAndFix(node) {
  if (typeof node === "string") {
    return maybeDecodeMojibake(node);
  }

  if (Array.isArray(node)) {
    let changed = false;
    const next = node.map((item) => {
      const result = walkAndFix(item);
      changed ||= result.changed;
      return result.value;
    });
    return { value: next, changed };
  }

  if (node && typeof node === "object") {
    let changed = false;
    const next = {};

    for (const [key, value] of Object.entries(node)) {
      const result = walkAndFix(value);
      next[key] = result.value;
      changed ||= result.changed;
    }

    return { value: next, changed };
  }

  return { value: node, changed: false };
}

function applyWarningCopy(messages) {
  const language = messages?.AppearanceSettings?.language;
  if (!language || typeof language !== "object") {
    return false;
  }

  let changed = false;

  if (language.restartWarningWeb !== WEB_WARNING) {
    language.restartWarningWeb = WEB_WARNING;
    changed = true;
  }

  if (language.restartWarningApp !== APP_WARNING) {
    language.restartWarningApp = APP_WARNING;
    changed = true;
  }

  return changed;
}

function main() {
  const files = listMessageFiles();
  if (files.length === 0) {
    throw new Error("No locale message files found in messages/ directory.");
  }

  const summary = [];

  for (const file of files) {
    const filePath = join(MESSAGES_DIR, file);
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);

    const fixed = walkAndFix(parsed);
    const warningChanged = applyWarningCopy(fixed.value);
    const canonical = `${JSON.stringify(fixed.value, null, 2)}\n`;

    const contentChanged = raw !== canonical;
    if (contentChanged) {
      writeFileSync(filePath, canonical, "utf8");
    }

    summary.push({
      file,
      contentChanged,
      hadEncodingFixes: fixed.changed,
      warningChanged,
    });
  }

  const touched = summary.filter((item) => item.contentChanged);
  console.log(`Processed ${summary.length} locale files.`);
  console.log(`Updated ${touched.length} files.`);

  for (const item of touched) {
    const tags = [];
    if (item.hadEncodingFixes) tags.push("encoding");
    if (item.warningChanged) tags.push("warnings");
    if (tags.length === 0) tags.push("format");
    console.log(`- ${item.file}: ${tags.join(", ")}`);
  }
}

main();
