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
  index,
}: {
  repo: GithubRepo;
  displayName: string;
  description: string | null;
  categories: string[];
  featured: boolean;
  caseStudySlug?: string;
  index: number;
}) {
  const id = String(index + 1).padStart(3, "0");
  return (
    <div className="group flex h-full flex-col justify-between bg-black p-[15px] transition-colors hover:bg-surface-2">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-[5px]">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
              REPOSITORY / {id}
            </span>
            {featured && (
              <span className="rounded-full border border-accent-yellow px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.05em] text-accent-yellow">
                Featured
              </span>
            )}
            {repo.archived && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border-dim px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
                <Archive size={11} /> Archived
              </span>
            )}
          </div>
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            data-cursor="VIEW"
            aria-label={`${displayName} on GitHub`}
            className="shrink-0 text-muted transition-colors hover:text-accent-yellow"
          >
            <GithubIcon width={16} height={16} />
          </a>
        </div>

        <h3 className="mt-[15px] font-display text-lg font-medium leading-snug tracking-[0.01em]">
          {displayName}
        </h3>

        <p className="mt-[8px] line-clamp-3 text-sm text-muted">
          {description ?? "No description yet — check the repository for details."}
        </p>

        {categories.length > 0 && (
          <div className="mt-[15px] flex flex-wrap gap-[5px]">
            {categories.map((c) => (
              <span key={c} className="border border-border-dim px-[8px] py-[2px] font-mono text-[11px] text-muted">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-[20px]">
        <div className="flex flex-wrap items-center gap-x-[15px] gap-y-[5px] font-mono text-[11px] text-muted">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-green" />
              {repo.language}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star size={11} /> {repo.stars}
          </span>
          {repo.forks > 0 && (
            <span className="inline-flex items-center gap-1">
              <GitFork size={11} /> {repo.forks}
            </span>
          )}
          <span>Updated {formatUpdated(repo.updatedAt)}</span>
        </div>

        <div className="mt-[15px] flex flex-wrap gap-[8px]">
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            data-cursor="VIEW"
            className="inline-flex items-center gap-1.5 rounded-full border border-border-dim px-[15px] py-[5px] font-mono text-[11px] uppercase tracking-[0.05em] transition-colors hover:border-accent-yellow hover:text-accent-yellow"
          >
            <GithubIcon width={12} height={12} /> Code
          </a>
          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noreferrer"
              data-cursor="VIEW"
              className="inline-flex items-center gap-1.5 rounded-full border border-border-dim px-[15px] py-[5px] font-mono text-[11px] uppercase tracking-[0.05em] transition-colors hover:border-accent-yellow hover:text-accent-yellow"
            >
              <ExternalLink size={12} /> Live demo
            </a>
          )}
          {caseStudySlug && (
            <Link
              href={`/projects/${caseStudySlug}`}
              data-cursor="READ"
              className="group/cs inline-flex items-center gap-1.5 rounded-full bg-accent px-[15px] py-[5px] font-mono text-[11px] uppercase tracking-[0.05em] text-white transition-opacity hover:opacity-90"
            >
              <BookOpen size={12} /> Case study
              <ArrowUpRight size={11} className="transition-transform group-hover/cs:translate-x-0.5 group-hover/cs:-translate-y-0.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
