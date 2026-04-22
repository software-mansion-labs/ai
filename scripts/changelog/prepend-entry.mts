import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(readFileSync("/tmp/ai-result.json", "utf-8"));

if (typeof raw !== "object" || raw === null) {
  console.error("[ai-result.json] Expected object, got", typeof raw);
  process.exit(1);
}

if (typeof raw.entry !== "string" || raw.entry.trim() === "") {
  console.error(
    "[ai-result.json] Missing or empty 'entry' field. Full result:",
    JSON.stringify(raw),
  );
  process.exit(1);
}

const entry: string = raw.entry;

const MARKER = "{/* ENTRIES_START */}" as const;
const changelogPath = "src/content/docs/changelog.mdx" as const;
const utf8 = "utf-8" as const;

const content = readFileSync(changelogPath, utf8);
if (!content.includes(MARKER)) {
  console.error(`[changelog.mdx] Marker "${MARKER}" not found`);
  process.exit(1);
}

writeFileSync(changelogPath, content.replace(MARKER, `${MARKER}\n\n${entry}`));
console.log("[changelog.mdx] Updated");
