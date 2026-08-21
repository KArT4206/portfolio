import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type GithubPresentation = {
  hiddenRepositories: string[];
  featuredRepositories: string[];
  repositoryAliases: Record<string, string>;
  repositoryCategories: Record<string, string[]>;
  customProjectOrder: string[];
  caseStudyLinks: Record<string, string>;
};

const EMPTY: GithubPresentation = {
  hiddenRepositories: [],
  featuredRepositories: [],
  repositoryAliases: {},
  repositoryCategories: {},
  customProjectOrder: [],
  caseStudyLinks: {},
};

async function fetchPresentation(): Promise<GithubPresentation> {
  const overrides = await prisma.githubRepoOverride.findMany();

  const out: GithubPresentation = {
    hiddenRepositories: [],
    featuredRepositories: [],
    repositoryAliases: {},
    repositoryCategories: {},
    customProjectOrder: [],
    caseStudyLinks: {},
  };

  const ordered = overrides
    .filter((o) => o.displayOrder !== null)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  for (const o of overrides) {
    if (o.hidden) out.hiddenRepositories.push(o.repoName);
    if (o.featured) out.featuredRepositories.push(o.repoName);
    if (o.alias) out.repositoryAliases[o.repoName] = o.alias;
    if (o.categories.length > 0) out.repositoryCategories[o.repoName] = o.categories;
    if (o.caseStudySlug) out.caseStudyLinks[o.repoName] = o.caseStudySlug;
  }
  out.customProjectOrder = ordered.map((o) => o.repoName);

  return out;
}

async function safely<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[githubPresentation] database call failed, using fallback:", err);
    return fallback;
  }
}

export const getGithubPresentation = unstable_cache(
  async (): Promise<GithubPresentation> => safely(EMPTY, fetchPresentation),
  ["github-presentation"],
  { tags: ["github-presentation"], revalidate: 3600 }
);

export function humanizeRepoName(name: string, aliases: Record<string, string>): string {
  return aliases[name] ?? name.replace(/[-_]+/g, " ").trim();
}
