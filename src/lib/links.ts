import { parse, stringify } from "@std/csv";
import { z } from "astro/zod";

export const LINKS_HEADER = [
  "url",
  "title",
  "author",
  "date",
  "urldate",
] as const;
export const REQUIRED_LINK_FIELDS = ["title", "urldate"] as const;

export const linkSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  author: z.string(),
  date: z.string().date().or(z.literal("")),
  urldate: z.string().date(),
});

const UTM_PARAM_RE = /^utm_/i;

export type LinkField = (typeof LINKS_HEADER)[number];

export type LinkRecord = z.infer<typeof linkSchema>;

export function normalizeUrl(rawUrl: string): string {
  const input = rawUrl.trim();
  try {
    const parsed = new URL(input);
    const keptEntries: Array<[string, string]> = [];

    for (const [key, value] of parsed.searchParams.entries()) {
      if (!UTM_PARAM_RE.test(key)) {
        keptEntries.push([key, value]);
      }
    }

    parsed.search = "";
    for (const [key, value] of keptEntries) {
      parsed.searchParams.append(key, value);
    }

    return parsed.toString();
  } catch {
    return input;
  }
}

export function toIsoDate(value: string): string {
  const trimmed = value.trim();
  if (linkSchema.shape.date.safeParse(trimmed).success) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.valueOf())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

export function normalizeLinkRecord(record: LinkRecord): LinkRecord {
  return {
    url: normalizeUrl(record.url),
    title: record.title.trim(),
    author: record.author.trim(),
    date: toIsoDate(record.date),
    urldate: toIsoDate(record.urldate),
  };
}

export function missingRequiredFields(record: LinkRecord): LinkField[] {
  const missing: LinkField[] = [];

  for (const field of REQUIRED_LINK_FIELDS) {
    if (!record[field].trim()) {
      missing.push(field);
    }
  }

  return missing;
}

export function parseLinksCsv(content: string): LinkRecord[] {
  const parsed = parse(content, {
    skipFirstRow: true,
    columns: LINKS_HEADER,
  }) as LinkRecord[];

  const rows: LinkRecord[] = parsed.map((row) =>
    normalizeLinkRecord({
      url: row.url ?? "",
      title: row.title ?? "",
      author: row.author ?? "",
      date: row.date ?? "",
      urldate: row.urldate ?? "",
    }),
  );

  const seen = new Set<string>();
  for (const row of rows) {
    if (!row.url) {
      throw new Error("links.csv contains an empty url value.");
    }
    if (seen.has(row.url)) {
      throw new Error(`links.csv contains duplicate url row: ${row.url}`);
    }
    seen.add(row.url);
  }

  return rows;
}

export function serializeLinksCsv(records: LinkRecord[]): string {
  const sorted = records
    .map(normalizeLinkRecord)
    .sort((a, b) => a.url.localeCompare(b.url));

  const output = stringify(sorted, {
    columns: LINKS_HEADER,
  })
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  return output.endsWith("\n") ? output : `${output}\n`;
}
