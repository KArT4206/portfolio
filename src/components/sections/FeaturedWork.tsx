import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import { GithubIcon } from "@/components/icons/SocialIcons";
import { getFeaturedProjects } from "@/lib/projects";

export default async function FeaturedWork() {
  const featuredProjects = await getFeaturedProjects();

  return (
    <section id="work" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-accent">Selected Work</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Things I&apos;ve built &amp; researched
            </h2>
          </div>
          <Link
            href="/#contact"
            className="group hidden items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            Have a project in mind?
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.08}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-10 flex justify-center">
          <Link
            href="/github"
            className="group inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/50 hover:text-accent"
          >
            <GithubIcon width={15} height={15} />
            See all repositories on GitHub
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
