import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicProject } from "@/lib/projects";

const STATUS_STYLES: Record<string, string> = {
  "In Development": "border-accent-green text-accent-green",
  Completed: "border-accent-yellow text-accent-yellow",
  Research: "border-accent text-white",
  Paused: "border-accent-amber text-accent-amber",
  Archived: "border-border-dim text-muted",
};

export default function ProjectCard({ project, index }: { project: PublicProject; index: number }) {
  const id = String(index + 1).padStart(3, "0");
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-cursor="OPEN"
      className="section-frame group flex h-full flex-col justify-between bg-black p-[15px] transition-colors hover:bg-surface-2"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
            PROJECT / {id}
          </span>
          <ArrowUpRight
            size={16}
            className="shrink-0 text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-yellow"
          />
        </div>

        <h3 className="mt-[10px] font-display text-xl font-medium leading-snug tracking-[0.01em]">
          {project.shortTitle}
        </h3>
        <p className="mt-[8px] text-sm leading-[1.5] text-muted">{project.tagline}</p>

        <span
          className={`mt-[10px] inline-block rounded-full border px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.05em] ${STATUS_STYLES[project.status] ?? STATUS_STYLES.Archived}`}
        >
          STATUS: {project.status}
        </span>
      </div>

      <div className="mt-[20px]">
        <div className="flex flex-wrap gap-[5px]">
          {project.tech.slice(0, 3).map((t) => (
            <span
              key={t}
              className="border border-border-dim px-[8px] py-[2px] font-mono text-[11px] text-muted"
            >
              {t}
            </span>
          ))}
          {project.tech.length > 3 && (
            <span className="border border-border-dim px-[8px] py-[2px] font-mono text-[11px] text-muted">
              +{project.tech.length - 3}
            </span>
          )}
        </div>
        <p className="mt-[10px] font-mono text-[11px] uppercase tracking-[0.05em] text-accent-yellow opacity-0 transition-opacity group-hover:opacity-100">
          [ OPEN PROJECT ]
        </p>
      </div>
    </Link>
  );
}
