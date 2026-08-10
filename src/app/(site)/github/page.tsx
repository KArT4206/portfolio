import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import Reveal from "@/components/Reveal";
import RepoExplorer, { type EnrichedRepo } from "@/components/github/RepoExplorer";
import { fetchGithubRepos, fetchReadmeExcerpt } from "@/lib/github";
import {
  featuredRepositories,
  hiddenRepositories,
  repositoryCategories,
  caseStudyLinks,
  humanizeRepoName,
} from "@/lib/repoConfig";

export const metadata: Metadata = {
  title: "GitHub Projects — Karthik B",
  description: "Live feed of public repositories from github.com/KArT4206, auto-synced hourly.",
};

export default async function GithubPage() {
  const { repos, stale, error } = await fetchGithubRepos();
  const visibleRepos = repos.filter((r) => !hiddenRepositories.includes(r.name));

  // README excerpts only fill in for featured repos that have no GitHub description —
  // fetching every repo's README would multiply our request count for little benefit
  // (see the comment on extractReadmeExcerpt in src/lib/github.ts).
  const needsExcerpt = visibleRepos.filter(
    (r) => featuredRepositories.includes(r.name) && !r.description
  );
  const excerpts = await Promise.all(needsExcerpt.map((r) => fetchReadmeExcerpt(r.name)));
  const excerptByName = new Map(needsExcerpt.map((r, i) => [r.name, excerpts[i]]));

  const enriched: EnrichedRepo[] = visibleRepos.map((repo) => ({
    repo,
    displayName: humanizeRepoName(repo.name),
    description: repo.description ?? excerptByName.get(repo.name) ?? null,
    categories: repositoryCategories[repo.name] ?? [],
    featured: featuredRepositories.includes(repo.name),
    caseStudySlug: caseStudyLinks[repo.name],
  }));

  return (
    <div>
      <section className="noise-bg px-6 pb-12 pt-16 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-sm font-medium text-accent">Live from GitHub</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              GitHub Projects
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Auto-synced from{" "}
              <a
                href="https://github.com/KArT4206"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline decoration-border underline-offset-4 hover:decoration-accent"
              >
                github.com/KArT4206
              </a>{" "}
              — this list updates itself as repos change, no manual editing.
            </p>

            {stale && (
              <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>
                  Showing cached repository data — the live GitHub API request failed
                  {error ? ` (${error})` : ""}. This will refresh automatically once GitHub is
                  reachable again.
                </span>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          {enriched.length === 0 && !stale ? (
            <p className="text-sm text-muted">No public repositories found.</p>
          ) : enriched.length === 0 && stale ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted">
                Unable to load projects right now — GitHub&apos;s API didn&apos;t respond and
                there&apos;s no cached data yet. Try refreshing in a moment.
              </p>
            </div>
          ) : (
            <Reveal>
              <RepoExplorer repos={enriched} />
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}
