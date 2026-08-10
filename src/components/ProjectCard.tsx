import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicProject } from "@/lib/projects";

const STATUS_STYLES: Record<string, string> = {
  "In Development": "text-accent-2 border-accent-2/30 bg-accent-2/10",
  Completed: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  Research: "text-accent border-accent/30 bg-accent/10",
  Paused: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  Archived: "text-muted border-border bg-surface-2",
};

export default function ProjectCard({ project }: { project: PublicProject }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_0_40px_-15px_rgba(124,92,255,0.5)]"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[project.status] ?? STATUS_STYLES.Archived}`}
          >
            {project.status}
          </span>
          <ArrowUpRight
            size={18}
            className="shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          />
        </div>

        <h3 className="mt-4 font-display text-xl font-semibold leading-snug">
          {project.shortTitle}
        </h3>
        <p className="mt-2 text-sm text-muted">{project.tagline}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tech.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted"
          >
            {t}
          </span>
        ))}
        {project.tech.length > 3 && (
          <span className="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted">
            +{project.tech.length - 3}
          </span>
        )}
      </div>
    </Link>
  );
}
