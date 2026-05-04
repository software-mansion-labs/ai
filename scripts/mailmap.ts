#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";
import { type MailmapEntry, Mailmap, mailmapPath } from "../src/lib/mailmap";

type CommitAuthor = {
  file: string;
  sha: string;
  name: string;
  email: string;
};

type GitHubCommitResponse = {
  author?: {
    login?: string;
  } | null;
  commit?: {
    author?: {
      name?: string;
    } | null;
  };
};

type GitHubUserResponse = {
  login?: string;
  name?: string | null;
};

const CHECK_MODE = process.argv.includes("--check");
const REPOSITORY = "software-mansion/agentic-engineering";
const MAILMAP_PATH = path.join(process.cwd(), ".mailmap");

async function main(): Promise<void> {
  const commitAuthors = await loadCommitAuthors();
  const mailmap = await loadMailmap();

  if (!CHECK_MODE) {
    const entries = await updateEntries(mailmap.entries(), commitAuthors);
    const nextText = Mailmap.fromEntries(entries).toString();
    const currentText = existsSync(MAILMAP_PATH)
      ? await readFile(MAILMAP_PATH, "utf8")
      : "";

    if (normalizeNewlines(currentText) !== nextText) {
      await writeFile(MAILMAP_PATH, nextText, "utf8");
      console.log(`Updated ${path.relative(process.cwd(), MAILMAP_PATH)}`);
    }
  }

  const validationErrors = await validateMailmap(await loadMailmap(), {
    commitAuthors,
  });

  if (validationErrors.length > 0) {
    console.error("Mailmap validation failed.");
    for (const error of validationErrors) {
      console.error(error);
    }
    console.error("Run: bun mailmap");
    process.exit(1);
  }

  if (CHECK_MODE) {
    console.log("Mailmap validation passed.");
  }
}

async function loadMailmap() {
  if (!existsSync(MAILMAP_PATH)) {
    return Mailmap.fromEntries([]);
  }

  return Mailmap.load(mailmapPath);
}

async function loadCommitAuthors(): Promise<CommitAuthor[]> {
  const commitAuthors: CommitAuthor[] = [];

  for (const file of await loadDocFiles()) {
    const { stdout } = await execa("git", [
      "log",
      "--follow",
      "--format=%H%x09%aN%x09%aE",
      "--",
      file,
    ]);

    for (const line of stdout.split("\n")) {
      const [sha, name, email] = line.split("\t");
      if (!sha || !name || !email) {
        continue;
      }

      commitAuthors.push({
        file: path.relative(process.cwd(), file),
        sha,
        name,
        email,
      });
    }
  }

  return commitAuthors;
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

async function updateEntries(
  currentEntries: MailmapEntry[],
  commitAuthors: CommitAuthor[],
) {
  const entriesByGithub = new Map<string, MailmapEntry>();

  for (const entry of currentEntries) {
    const existingEntry = entriesByGithub.get(entry.github);
    if (existingEntry) {
      existingEntry.emails.push(...entry.emails);
      continue;
    }

    entriesByGithub.set(entry.github, { ...entry, emails: [...entry.emails] });
  }

  for (const person of commitAuthors) {
    const existingGithub = getExistingGithubForEmail(
      entriesByGithub,
      person.email,
    );
    const commitAuthor = existingGithub
      ? null
      : await fetchGitHubCommitAuthor(person.sha);
    const resolvedGithub = existingGithub ?? commitAuthor?.github;

    if (!resolvedGithub) {
      throw new Error(
        `No GitHub user found for ${person.file} commit ${person.sha.slice(0, 7)} by ${person.name} <${person.email}>. Add a .mailmap entry like: Name <github@users.noreply.github.com> <${person.email}>.`,
      );
    }

    await ensureGitHubProfile(
      entriesByGithub,
      resolvedGithub,
      commitAuthor?.name ?? person.name,
    );
    entriesByGithub.get(resolvedGithub)?.emails.push(person.email);
  }

  return Array.from(entriesByGithub.values());
}

async function ensureGitHubProfile(
  entriesByGithub: Map<string, MailmapEntry>,
  github: string,
  fallbackName = github,
) {
  const normalizedGithub = github.toLowerCase();

  if (entriesByGithub.has(normalizedGithub)) {
    return;
  }

  const user = await fetchGitHubUser(normalizedGithub);

  entriesByGithub.set(normalizedGithub, {
    github: normalizedGithub,
    name: user.name || fallbackName,
    emails: [`${normalizedGithub}@users.noreply.github.com`],
  });
}

function getExistingGithubForEmail(
  entriesByGithub: Map<string, MailmapEntry>,
  email: string,
) {
  const normalizedEmail = email.toLowerCase();

  for (const [github, entry] of entriesByGithub) {
    if (
      entry.emails
        .map((entryEmail) => entryEmail.toLowerCase())
        .includes(normalizedEmail)
    ) {
      return github;
    }
  }

  return undefined;
}

async function fetchGitHubCommitAuthor(sha: string) {
  const response = await fetchGitHub<GitHubCommitResponse>(
    `https://api.github.com/repos/${REPOSITORY}/commits/${sha}`,
  );
  const github = response.author?.login?.toLowerCase();

  if (!github) {
    return null;
  }

  return {
    github,
    name: response.commit?.author?.name ?? github,
  };
}

async function fetchGitHubUser(github: string) {
  const response = await fetchGitHub<GitHubUserResponse>(
    `https://api.github.com/users/${github}`,
  );

  if (!response.login) {
    throw new Error(`GitHub API did not return a login for "${github}".`);
  }

  return {
    github: response.login.toLowerCase(),
    name: response.name?.trim() || response.login,
  };
}

async function fetchGitHub<T>(url: string): Promise<T> {
  const headers = new Headers({
    accept: "application/vnd.github+json",
    "user-agent": "software-mansion-mailmap-bot/1.0",
    "x-github-api-version": "2022-11-28",
  });
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `GitHub API request failed (${response.status} ${response.statusText}): ${url}`,
    );
  }

  return response.json() as Promise<T>;
}

async function validateMailmap(
  mailmap: Mailmap,
  {
    commitAuthors,
  }: {
    commitAuthors: CommitAuthor[];
  },
) {
  const validationErrors: string[] = [];

  for (const commitAuthor of commitAuthors) {
    try {
      const github = mailmap.getGithubForEmail(commitAuthor.email);
      mailmap.getProfile(github);
    } catch (error) {
      validationErrors.push(
        `${commitAuthor.file}: commit ${commitAuthor.sha.slice(0, 7)} by ${commitAuthor.name} <${commitAuthor.email}>: ${(error as Error).message}`,
      );
    }
  }

  const currentText = existsSync(MAILMAP_PATH)
    ? Bun.file(MAILMAP_PATH).text()
    : Promise.resolve("");

  validationErrors.push(...(await validateSortedMailmap(mailmap, currentText)));

  return validationErrors;
}

async function validateSortedMailmap(
  mailmap: Mailmap,
  currentText: Promise<string>,
) {
  if (normalizeNewlines(await currentText) === mailmap.toString()) {
    return [];
  }

  return [".mailmap is not normalized/sorted. Run: bun mailmap"];
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

await main();
