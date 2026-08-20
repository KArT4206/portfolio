import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, ArrowRight, FileText } from "lucide-react";
import Reveal from "@/components/Reveal";
import { getPublishedProjectBySlug, getPublishedProjects, getAllPublishedSlugs } from "@/lib/projects";

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Karthik B`,
    description: project.tagline,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([getPublishedProjectBySlug(slug), getPublishedProjects()]);
  if (!project) notFound();

  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const next = allProjects[(currentIndex + 1) % allProjects.length];

  return (
    <article>
      <section className="relative overflow-hidden px-6 pb-[50px] pt-[58px] md:px-10">
        <div className="hyperspace-field" aria-hidden />
        <div className="relative max-w-3xl">
          <Reveal>
            <Link
              href="/#work"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.05em] text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft size={13} /> Back to work
            </Link>

            <div className="mt-[25px] flex flex-wrap items-center gap-[5px]">
              {project.category.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border-dim px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.05em] text-muted"
                >
                  {c}
                </span>
              ))}
            </div>

            <h1 className="section-frame mt-[15px] px-1 pb-3 font-display text-3xl font-normal leading-[1] tracking-[0.01em] sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-[15px] text-lg text-muted">{project.tagline}</p>

            <div className="mt-[15px] flex flex-wrap gap-[5px]">
              {project.tech.map((t) => (
                <span key={t} className="border border-border-dim px-[8px] py-[2px] font-mono text-xs text-muted">
                  {t}
                </span>
              ))}
            </div>

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-[25px] inline-flex items-center gap-1.5 rounded-full border border-accent-yellow px-[25px] py-[10px] font-mono text-xs uppercase tracking-[0.05em] transition-colors hover:bg-accent-yellow hover:text-black"
              >
                View repository <ArrowUpRight size={13} />
              </a>
            )}
          </Reveal>
        </div>
      </section>

      <section className="wireframe-divider-top px-6 pb-[100px] pt-[50px] md:px-10">
        <div className="grid max-w-3xl gap-[50px]">
          <Reveal className="grid gap-[25px] sm:grid-cols-3">
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent-yellow">Overview</h2>
              <p className="mt-[8px] text-sm leading-[1.5] text-muted">{project.overview}</p>
            </div>
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent-yellow">My Role</h2>
              <p className="mt-[8px] text-sm leading-[1.5] text-muted">{project.role}</p>
            </div>
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent-yellow">Status</h2>
              <p className="mt-[8px] text-sm leading-[1.5] text-muted">{project.status}</p>
            </div>
          </Reveal>

          {project.problem && (
            <Reveal>
              <h2 className="font-display text-2xl font-medium tracking-[0.02em]">The Problem</h2>
              <p className="mt-[10px] leading-[1.63] text-muted">{project.problem}</p>
            </Reveal>
          )}

          {project.solution.length > 0 && (
            <Reveal>
              <h2 className="font-display text-2xl font-medium tracking-[0.02em]">The Solution</h2>
              <ul className="mt-[15px] space-y-[10px]">
                {project.solution.map((s, i) => (
                  <li key={i} className="flex gap-[10px] text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-yellow" />
                    <span className="leading-[1.5]">{s}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {project.results.length > 0 && (
            <Reveal>
              <h2 className="font-display text-2xl font-medium tracking-[0.02em]">Results &amp; Metrics</h2>
              <div className="mt-[15px] grid gap-[1px] bg-border-dim sm:grid-cols-2">
                {project.results.map((r) => (
                  <div key={r.label} className="bg-black p-[15px] sm:p-[20px]">
                    <p className="font-mono text-2xl font-medium tabular-nums text-accent-yellow">{r.value}</p>
                    <p className="mt-[5px] font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
                      {r.label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {project.attachments.length > 0 && (
            <Reveal>
              <h2 className="font-display text-2xl font-medium tracking-[0.02em]">Documents &amp; Resources</h2>
              <div className="mt-[15px] flex flex-wrap gap-[10px]">
                {project.attachments.map((a) => (
                  <a
                    key={a.url}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border-dim px-[15px] py-[10px] text-sm transition-colors hover:border-accent-yellow hover:text-accent-yellow"
                  >
                    <FileText size={14} /> {a.label}
                  </a>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="wireframe-divider-top px-6 py-[50px] md:px-10">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">Next project</p>
          <Link href={`/projects/${next.slug}`} className="group mt-[8px] flex items-center justify-between gap-4">
            <span className="font-display text-2xl font-medium tracking-[0.02em] transition-colors group-hover:text-accent-yellow">
              {next.shortTitle}
            </span>
            <ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </article>
  );
}
