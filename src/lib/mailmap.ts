import { readFile } from "node:fs/promises";

export type MailmapProfile = {
  github: string;
  name: string;
};

export type MailmapEntry = MailmapProfile & {
  emails: string[];
};

export const mailmapPath = new URL("../../.mailmap", import.meta.url);

export const getGithubFromEmail = (email: string) =>
  email
    .toLowerCase()
    .match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/)?.[1];

const getMailmapLineError = (lineNumber: number, message: string) =>
  new Error(`Invalid .mailmap entry on line ${lineNumber}: ${message}`);

const parseMailmapLine = (
  line: string,
  lineNumber: number,
): MailmapEntry | null => {
  const trimmedLine = line.trim();

  if (!trimmedLine || trimmedLine.startsWith("#")) {
    return null;
  }

  const emails = Array.from(trimmedLine.matchAll(/<([^>]+)>/g), (match) =>
    match[1].toLowerCase(),
  );
  const [canonicalEmail, ...aliasEmails] = emails;

  if (!canonicalEmail) {
    throw getMailmapLineError(
      lineNumber,
      "expected a canonical email address.",
    );
  }

  const github = getGithubFromEmail(canonicalEmail);

  if (!github) {
    throw getMailmapLineError(
      lineNumber,
      `canonical email "${canonicalEmail}" must be a GitHub noreply address.`,
    );
  }

  const name = trimmedLine.slice(0, trimmedLine.indexOf("<")).trim();

  if (!name) {
    throw getMailmapLineError(lineNumber, "expected a canonical name.");
  }

  return {
    github,
    name,
    emails: [canonicalEmail, ...aliasEmails],
  };
};

const parseMailmap = (mailmap: string) =>
  mailmap.split("\n").flatMap((line, index) => {
    const profile = parseMailmapLine(line, index + 1);
    return profile ? [profile] : [];
  });

const normalizeEmail = (email: string) => email.toLowerCase();

const normalizeEntry = (entry: MailmapEntry): MailmapEntry => ({
  github: entry.github.toLowerCase(),
  name: entry.name.trim(),
  emails: Array.from(new Set(entry.emails.map(normalizeEmail))).sort((a, b) =>
    a.localeCompare(b),
  ),
});

export const serializeMailmapEntries = (entries: MailmapEntry[]) => {
  const normalizedEntries = entries
    .map(normalizeEntry)
    .sort(
      (first, second) =>
        first.name.localeCompare(second.name) ||
        first.github.localeCompare(second.github) ||
        first.emails.join("\0").localeCompare(second.emails.join("\0")),
    );

  return `${normalizedEntries
    .flatMap(({ github, name, emails }) => {
      const canonicalEmail = `${github}@users.noreply.github.com`;
      const aliasEmails = emails.filter((email) => email !== canonicalEmail);

      if (aliasEmails.length === 0) {
        return [`${name} <${canonicalEmail}>`];
      }

      return aliasEmails.map(
        (email) => `${name} <${canonicalEmail}> <${email}>`,
      );
    })
    .join("\n")}\n`;
};

export class Mailmap {
  static async load(path: URL | string = mailmapPath) {
    const entries = parseMailmap(await readFile(path, "utf8"));
    return new Mailmap(entries);
  }

  static fromEntries(entries: MailmapEntry[]) {
    return new Mailmap(entries);
  }

  readonly #entries: MailmapEntry[];
  readonly #emailGithubMap: Record<string, string>;
  readonly #profileMap: Record<string, MailmapProfile>;

  private constructor(entries: MailmapEntry[]) {
    this.#entries = entries.map(normalizeEntry);
    this.#emailGithubMap = Object.fromEntries(
      this.#entries.flatMap(({ emails, github }) =>
        emails.map((email) => [email, github]),
      ),
    );
    this.#profileMap = Object.fromEntries(
      this.#entries.map(({ github, name }) => [github, { github, name }]),
    );
  }

  entries() {
    return this.#entries.map(({ emails, ...profile }) => ({
      ...profile,
      emails: [...emails],
    }));
  }

  toString() {
    return serializeMailmapEntries(this.#entries);
  }

  getGithubForEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);

    // Keep unmapped GitHub noreply commit authors attributable by username.
    const github =
      this.#emailGithubMap[normalizedEmail] ??
      getGithubFromEmail(normalizedEmail);

    if (!github) {
      throw new Error(
        `No GitHub username found for email "${email}". Add a .mailmap entry like: Name <github@users.noreply.github.com> <${email}>.`,
      );
    }

    return github;
  }

  getProfile(github: string) {
    const profile = this.#profileMap[github.toLowerCase()];

    if (!profile) {
      throw new Error(
        `No .mailmap profile found for GitHub user "${github}". Add a .mailmap entry like: Name <${github}@users.noreply.github.com>.`,
      );
    }

    return profile;
  }
}
