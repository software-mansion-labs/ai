import { execa } from "execa";
import type { AstroGlobal } from "astro";
import { Mailmap } from "./mailmap";

export type GitHubProfile = {
  github: string;
  name: string;
  avatarUrl: string;
  url: string;
};

type AttributionAstro = Pick<AstroGlobal, "locals">;

const mailmapPromise = Mailmap.load();

const getProfile = (github: string, mailmap: Mailmap): GitHubProfile => {
  const normalizedGithub = github.toLowerCase();
  const profile = mailmap.getProfile(normalizedGithub);

  return {
    ...profile,
    avatarUrl: `https://github.com/${profile.github}.png`,
    url: `https://github.com/${profile.github}`,
  };
};

export const getAuthors = async (astro: AttributionAstro) => {
  const {
    entry: { data },
  } = astro.locals.starlightRoute;
  const mailmap = await mailmapPromise;

  return (data.authors ?? []).map((github) => getProfile(github, mailmap));
};

export const getContributors = async (astro: AttributionAstro) => {
  const {
    entry: { data, filePath },
  } = astro.locals.starlightRoute;
  const mailmap = await mailmapPromise;
  const authorGithubs = data.authors ?? [];
  const authorSet = new Set(
    authorGithubs.map((github) => github.toLowerCase()),
  );
  const contributorCounts = new Map<string, number>();

  const { stdout: gitLog } = await execa("git", [
    "log",
    "--follow",
    "--format=%ae",
    "--",
    filePath,
  ]);

  for (const email of gitLog.split("\n")) {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      continue;
    }

    const github = mailmap.getGithubForEmail(trimmedEmail);

    if (authorSet.has(github)) {
      continue;
    }

    contributorCounts.set(github, (contributorCounts.get(github) ?? 0) + 1);
  }

  return Array.from(contributorCounts.entries())
    .sort(
      ([firstGithub, firstCount], [secondGithub, secondCount]) =>
        secondCount - firstCount || firstGithub.localeCompare(secondGithub),
    )
    .map(([github]) => getProfile(github, mailmap));
};
