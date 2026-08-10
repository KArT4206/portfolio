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
      <section className="noise-bg px-6 pb-16 pt-16 sm:pt-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Link
              href="/#work"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft size={14} /> Back to work
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {project.category.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
                >
                  {c}
                </span>
              ))}
            </div>

            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-4 text-lg text-muted">{project.tagline}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-xs text-muted"
                >
                  {t}
                </span>
              ))}
            </div>

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-accent/50 hover:text-accent"
              >
                View repository <ArrowUpRight size={14} />
              </a>
            )}
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-3xl gap-14">
          <Reveal className="grid gap-10 sm:grid-cols-3">
            <div>
              <h2 className="font-display text-sm font-semibold text-accent">Overview</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{project.overview}</p>
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-accent">My Role</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{project.role}</p>
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-accent">Status</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{project.status}</p>
            </div>
          </Reveal>

          {project.problem && (
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight">The Problem</h2>
              <p className="mt-3 leading-relaxed text-muted">{project.problem}</p>
            </Reveal>
          )}

          {project.solution.length > 0 && (
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight">The Solution</h2>
              <ul className="mt-4 space-y-3">
                {project.solution.map((s, i) => (
                  <li key={i} className="flex gap-3 text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {project.results.length > 0 && (
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Results &amp; Metrics
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {project.results.map((r) => (
                  <div
                    key={r.label}
                    className="rounded-xl border border-border bg-surface p-5"
                  >
                    <p className="font-display text-2xl font-semibold gradient-text">{r.value}</p>
                    <p className="mt-1 text-xs text-muted">{r.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {project.attachments.length > 0 && (
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Documents &amp; Resources
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {project.attachments.map((a) => (
                  <a
                    key={a.url}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <FileText size={14} /> {a.label}
                  </a>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="border-t border-border px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs text-muted">Next project</p>
          <Link
            href={`/projects/${next.slug}`}
            className="group mt-2 flex items-center justify-between gap-4"
          >
            <span className="font-display text-2xl font-semibold tracking-tight transition-colors group-hover:text-accent">
              {next.shortTitle}
            </span>
            <ArrowRight
              size={22}
              className="shrink-0 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </article>
  );
}
