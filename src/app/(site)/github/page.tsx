import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import Reveal from "@/components/Reveal";
import RepoExplorer, { type EnrichedRepo } from "@/components/github/RepoExplorer";
import { fetchGithubRepos, fetchReadmeExcerpt } from "@/lib/github";
import { getGithubPresentation, humanizeRepoName } from "@/lib/githubPresentation";

export const metadata: Metadata = {
  title: "GitHub Projects — Karthik B",
  description: "Live feed of public repositories from github.com/KArT4206, auto-synced hourly.",
};

export default async function GithubPage() {
  const [{ repos, stale, error }, presentation] = await Promise.all([fetchGithubRepos(), getGithubPresentation()]);
  const visibleRepos = repos.filter((r) => !presentation.hiddenRepositories.includes(r.name));

  // README excerpts only fill in for featured repos that have no GitHub description —
  // fetching every repo's README would multiply our request count for little benefit
  // (see the comment on extractReadmeExcerpt in src/lib/github.ts).
  const needsExcerpt = visibleRepos.filter(
    (r) => presentation.featuredRepositories.includes(r.name) && !r.description
  );
  const excerpts = await Promise.all(needsExcerpt.map((r) => fetchReadmeExcerpt(r.name)));
  const excerptByName = new Map(needsExcerpt.map((r, i) => [r.name, excerpts[i]]));

  const enriched: EnrichedRepo[] = visibleRepos.map((repo) => ({
    repo,
    displayName: humanizeRepoName(repo.name, presentation.repositoryAliases),
    description: repo.description ?? excerptByName.get(repo.name) ?? null,
    categories: presentation.repositoryCategories[repo.name] ?? [],
    featured: presentation.featuredRepositories.includes(repo.name),
    caseStudySlug: presentation.caseStudyLinks[repo.name],
  }));

  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-[50px] pt-[58px] md:px-10">
        <div className="hyperspace-field" aria-hidden />
        <div className="relative">
          <Reveal>
            <p className="inline-block rounded-full border border-accent-green px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green">
              Live from GitHub
            </p>
            <h1 className="mt-[15px] font-display text-4xl font-medium tracking-[0.02em] sm:text-5xl">
              GitHub Projects
            </h1>
            <p className="mt-[15px] max-w-2xl text-lg text-muted">
              Auto-synced from{" "}
              <a
                href="https://github.com/KArT4206"
                target="_blank"
                rel="noreferrer"
                className="text-accent-green underline decoration-transparent underline-offset-4 hover:decoration-accent-green"
              >
                github.com/KArT4206
              </a>{" "}
              — this list updates itself as repos change, no manual editing.
            </p>

            {stale && (
              <div className="mt-[25px] flex items-start gap-2.5 border border-accent-crimson bg-black px-[15px] py-[10px] text-sm text-accent-crimson">
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

      <section className="wireframe-divider-top px-6 pb-[100px] pt-[50px] md:px-10">
        {enriched.length === 0 && !stale ? (
          <p className="text-sm text-muted">No public repositories found.</p>
        ) : enriched.length === 0 && stale ? (
          <div className="border border-dashed border-border-dim p-12 text-center">
            <p className="text-sm text-muted">
              Unable to load projects right now — GitHub&apos;s API didn&apos;t respond and
              there&apos;s no cached data yet. Try refreshing in a moment.
            </p>
          </div>
        ) : (
          <Reveal>
            <RepoExplorer repos={enriched} customOrder={presentation.customProjectOrder} />
          </Reveal>
        )}
      </section>
    </div>
  );
}
