#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  missingRequiredFields,
  normalizeLinkRecord,
  normalizeUrl,
  parseLinksCsv,
  serializeLinksCsv,
  type LinkRecord,
} from "../src/lib/links";

type LinkOccurrence = {
  file: string;
  url: string;
  line: number;
};

const CHECK_MODE = process.argv.includes("--check");
const EXTERNAL_LINK_COMPONENT_RE =
  /<ExternalLink\b[^>]*\bhref\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*\/?\s*>/g;
const RAW_EXTERNAL_MARKDOWN_LINK_RE =
  /(?<!\!)\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;
const LINKS_CSV_PATH = path.join(process.cwd(), "src", "data", "links.csv");

async function main(): Promise<void> {
  const docs = await loadDocFiles();
  const discoveredUrls = new Set<string>();
  const rawMarkdownLinks: LinkOccurrence[] = [];

  for (const doc of docs) {
    const content = await readFile(doc, "utf8");

    for (const match of content.matchAll(EXTERNAL_LINK_COMPONENT_RE)) {
      const url = match[1] ?? match[2];
      if (!url) {
        continue;
      }
      discoveredUrls.add(normalizeUrl(url));
    }

    for (const match of content.matchAll(RAW_EXTERNAL_MARKDOWN_LINK_RE)) {
      const url = match[1];
      discoveredUrls.add(normalizeUrl(url));
      rawMarkdownLinks.push({
        file: path.relative(process.cwd(), doc),
        url: normalizeUrl(url),
        line: indexToLine(content, match.index ?? 0),
      });
    }
  }

  const linksPath = LINKS_CSV_PATH;
  const currentText = existsSync(linksPath)
    ? await readFile(linksPath, "utf8")
    : "";

  let records: LinkRecord[];
  try {
    records = parseLinksCsv(currentText);
  } catch (error) {
    console.error(`links.csv parse error: ${(error as Error).message}`);
    process.exit(1);
  }

  const recordsByUrl = new Map(records.map((record) => [record.url, record]));
  const unusedUrls = [...recordsByUrl.keys()].filter(
    (url) => !discoveredUrls.has(url),
  );

  if (!CHECK_MODE) {
    for (const url of unusedUrls) {
      recordsByUrl.delete(url);
    }

    if (unusedUrls.length > 0) {
      console.log(`Pruned ${unusedUrls.length} unused links.csv entries.`);
    }

    for (const url of discoveredUrls) {
      if (!recordsByUrl.has(url)) {
        recordsByUrl.set(url, emptyLinkRecord(url));
      }
    }

    const nextText = serializeLinksCsv([...recordsByUrl.values()]);
    if (normalizeNewlines(currentText) !== nextText) {
      await writeFile(linksPath, nextText, "utf8");
      console.log(`Updated ${path.relative(process.cwd(), linksPath)}`);
    }

    records = parseLinksCsv(nextText);
  }

  const validationErrors: string[] = [];

  if (rawMarkdownLinks.length > 0) {
    validationErrors.push(
      'Raw external Markdown links are not allowed. Use <ExternalLink href="..." /> instead.',
    );
    for (const rawLink of rawMarkdownLinks) {
      validationErrors.push(
        `- ${rawLink.file}:${rawLink.line} -> ${rawLink.url}`,
      );
    }
  }

  for (const url of discoveredUrls) {
    if (!recordsByUrl.has(url) && CHECK_MODE) {
      validationErrors.push(`Missing links.csv entry for ${url}`);
    }
  }

  if (CHECK_MODE && unusedUrls.length > 0) {
    validationErrors.push("Unused links.csv entries found.");
    for (const url of unusedUrls) {
      validationErrors.push(`- Unused links.csv entry: ${url}`);
    }
  }

  const normalizedRecords = records.map(normalizeLinkRecord);
  for (const record of normalizedRecords) {
    const missing = missingRequiredFields(record);
    if (missing.length > 0) {
      validationErrors.push(
        `Missing required metadata for ${record.url}: ${missing.join(", ")}`,
      );
    }
  }

  const canonical = serializeLinksCsv(normalizedRecords);
  if (normalizeNewlines(currentText || canonical) !== canonical && CHECK_MODE) {
    validationErrors.push("links.csv is not normalized/sorted. Run: bun links");
  }

  if (validationErrors.length > 0) {
    console.error("Link validation failed.");
    for (const error of validationErrors) {
      console.error(error);
    }
    console.error("Run: bun links");
    process.exit(1);
  }

  if (CHECK_MODE) {
    console.log("Link validation passed.");
  }
}

async function loadDocFiles(): Promise<string[]> {
  const docsRoot = path.join(process.cwd(), "src", "content", "docs");
  const files = await collectDocsRecursive(docsRoot);
  files.sort((a, b) => a.localeCompare(b));
  return files;
}

async function collectDocsRecursive(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectDocsRecursive(fullPath)));
      continue;
    }

    if (
      entry.isFile() &&
      (fullPath.endsWith(".md") || fullPath.endsWith(".mdx"))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function emptyLinkRecord(rawUrl: string): LinkRecord {
  return {
    url: normalizeUrl(rawUrl),
    title: "",
    author: "",
    date: "",
    urldate: "",
  };
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

function indexToLine(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

await main();
