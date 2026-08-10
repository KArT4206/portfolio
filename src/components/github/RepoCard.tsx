import Link from "next/link";
import { Star, GitFork, ExternalLink, ArrowUpRight, Archive, BookOpen } from "lucide-react";
import { GithubIcon } from "@/components/icons/SocialIcons";
import type { GithubRepo } from "@/lib/github";

function formatUpdated(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays < 1) return "today";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export default function RepoCard({
  repo,
  displayName,
  description,
  categories,
  featured,
  caseStudySlug,
}: {
  repo: GithubRepo;
  displayName: string;
  description: string | null;
  categories: string[];
  featured: boolean;
  caseStudySlug?: string;
}) {
  return (
    <div className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_0_40px_-15px_rgba(124,92,255,0.5)]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {featured && (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
                Featured
              </span>
            )}
            {repo.archived && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-muted">
                <Archive size={11} /> Archived
              </span>
            )}
          </div>
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${displayName} on GitHub`}
            className="shrink-0 text-muted transition-colors hover:text-accent"
          >
            <GithubIcon width={17} height={17} />
          </a>
        </div>

        <h3 className="mt-4 font-display text-lg font-semibold leading-snug">{displayName}</h3>

        <p className="mt-2 line-clamp-3 text-sm text-muted">
          {description ?? "No description yet — check the repository for details."}
        </p>

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] text-muted"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-2" />
              {repo.language}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star size={12} /> {repo.stars}
          </span>
          {repo.forks > 0 && (
            <span className="inline-flex items-center gap-1">
              <GitFork size={12} /> {repo.forks}
            </span>
          )}
          <span>Updated {formatUpdated(repo.updatedAt)}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent/50 hover:text-accent"
          >
            <GithubIcon width={13} height={13} /> Code
          </a>
          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent/50 hover:text-accent"
            >
              <ExternalLink size={13} /> Live demo
            </a>
          )}
          {caseStudySlug && (
            <Link
              href={`/projects/${caseStudySlug}`}
              className="group/cs inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-transform hover:scale-[1.03]"
            >
              <BookOpen size={13} /> Case study
              <ArrowUpRight size={12} className="transition-transform group-hover/cs:translate-x-0.5 group-hover/cs:-translate-y-0.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
