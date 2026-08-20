"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import RepoCard from "@/components/github/RepoCard";
import type { GithubRepo } from "@/lib/github";
import { customProjectOrder } from "@/lib/repoConfig";

function featuredRank(repoName: string): number {
  const idx = customProjectOrder.indexOf(repoName);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

export type EnrichedRepo = {
  repo: GithubRepo;
  displayName: string;
  description: string | null;
  categories: string[];
  featured: boolean;
  caseStudySlug?: string;
};

type SortKey = "updated" | "stars" | "alphabetical";

export default function RepoExplorer({ repos }: { repos: EnrichedRepo[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("updated");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => r.categories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [repos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let result = repos.filter((r) => {
      if (featuredOnly && !r.featured) return false;
      if (activeCategory && !r.categories.includes(activeCategory)) return false;
      if (!q) return true;
      const haystack = [
        r.displayName,
        r.repo.name,
        r.description ?? "",
        ...r.categories,
        ...r.repo.topics,
        r.repo.language ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    result = [...result].sort((a, b) => {
      if (sort === "stars") return b.repo.stars - a.repo.stars;
      if (sort === "alphabetical") return a.displayName.localeCompare(b.displayName);
      return new Date(b.repo.updatedAt).getTime() - new Date(a.repo.updatedAt).getTime();
    });

    // Featured repos always float to the top. Among featured repos, honor the curated
    // customProjectOrder rather than whatever the active sort dropdown picked — that's
    // the whole point of marking something featured. Non-featured repos keep the order
    // the chosen sort just produced (stable sort preserves it).
    result.sort((a, b) => {
      if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
      if (a.featured && b.featured) return featuredRank(a.repo.name) - featuredRank(b.repo.name);
      return 0;
    });

    return result;
  }, [repos, query, activeCategory, sort, featuredOnly]);

  return (
    <div>
      <div className="flex flex-col gap-[15px] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories..."
            className="w-full rounded-full border border-border-dim bg-surface-2 py-[10px] pl-[38px] pr-[15px] text-sm outline-none transition-colors focus:border-accent-yellow"
          />
        </div>

        <div className="flex flex-wrap items-center gap-[15px]">
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="h-3.5 w-3.5 accent-accent"
            />
            Featured only
          </label>

          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
            <SlidersHorizontal size={13} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-border-dim bg-surface-2 px-[10px] py-[5px] text-xs uppercase tracking-[0.05em] text-foreground outline-none"
            >
              <option value="updated">Recently updated</option>
              <option value="stars">Most stars</option>
              <option value="alphabetical">A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mt-[15px] flex flex-wrap gap-[5px]">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-[15px] py-[2px] font-mono text-[11px] uppercase tracking-[0.05em] transition-colors ${
              activeCategory === null
                ? "border-accent-yellow text-accent-yellow"
                : "border-border-dim text-muted hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c === activeCategory ? null : c)}
              className={`rounded-full border px-[15px] py-[2px] font-mono text-[11px] uppercase tracking-[0.05em] transition-colors ${
                activeCategory === c
                  ? "border-accent-yellow text-accent-yellow"
                  : "border-border-dim text-muted hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <p className="mt-[25px] font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
        {filtered.length} {filtered.length === 1 ? "repository" : "repositories"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-[15px] border border-dashed border-border-dim p-12 text-center">
          <p className="text-sm text-muted">No repositories match your filters.</p>
          <button
            onClick={() => {
              setQuery("");
              setActiveCategory(null);
              setFeaturedOnly(false);
            }}
            className="mt-3 font-mono text-xs uppercase tracking-[0.05em] text-accent-green hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-[15px] grid gap-[1px] bg-border-dim sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RepoCard
              key={r.repo.id}
              repo={r.repo}
              displayName={r.displayName}
              description={r.description}
              categories={r.categories}
              featured={r.featured}
              caseStudySlug={r.caseStudySlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
