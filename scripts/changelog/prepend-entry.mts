import { readFileSync, writeFileSync } from "fs";

const aiResultPath = process.argv[2];
if (!aiResultPath) {
  console.error("Usage: prepend-entry.mts <ai_result_json>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(aiResultPath, "utf-8"));

if (typeof raw !== "object" || raw === null) {
  console.error("[changelog entry] Expected object, got", typeof raw);
  process.exit(1);
}
if (typeof raw.entry !== "string" || raw.entry.trim() === "") {
  console.error(
    "[changelog entry] Missing or empty 'entry' field. Full result:",
    JSON.stringify(raw),
  );
  process.exit(1);
}

const entry = raw.entry.trim();
const dateHeading = entry.match(/^##\s+(\d{4}-\d{2}-\d{2})\s*$/m);
if (!dateHeading) {
  console.error("[changelog entry] Expected entry to include a YYYY-MM-DD h2");
  process.exit(1);
}
const entryDate = dateHeading[1];

const MARKER = "{/* ENTRIES_START */}" as const;
const changelogPath = "src/content/docs/changelog.mdx" as const;
const utf8 = "utf-8" as const;

const content = readFileSync(changelogPath, utf8);
if (!content.includes(MARKER)) {
  console.error(`[changelog.mdx] Marker "${MARKER}" not found`);
  process.exit(1);
}

const headingPattern = new RegExp(`(^|\\n)##\\s+${entryDate}\\s*(\\n|$)`);
if (headingPattern.test(content)) {
  console.log(`[changelog.mdx] Entry for ${entryDate} already exists`);
  process.exit(0);
}

writeFileSync(changelogPath, content.replace(MARKER, `${MARKER}\n\n${entry}`));
console.log("[changelog.mdx] Updated");
