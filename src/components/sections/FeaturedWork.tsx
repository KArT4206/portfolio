import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import { GithubIcon } from "@/components/icons/SocialIcons";
import { getFeaturedProjects } from "@/lib/projects";

export default async function FeaturedWork() {
  const featuredProjects = await getFeaturedProjects();

  return (
    <section id="work" className="wireframe-divider-top scroll-mt-24 px-6 py-[58px] md:px-10">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-block rounded-full border border-accent-green px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green">
            Selected Work
          </p>
          <h2 className="mt-[15px] font-display text-3xl font-medium tracking-[0.02em] sm:text-4xl">
            Things I&apos;ve built &amp; researched
          </h2>
        </div>
        <Link
          href="/#contact"
          className="group hidden items-center gap-1.5 font-mono text-xs uppercase tracking-[0.05em] text-muted transition-colors hover:text-foreground sm:inline-flex"
        >
          Have a project in mind?
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <div className="mt-[25px] grid gap-[1px] bg-border-dim sm:grid-cols-2 lg:grid-cols-3">
        {featuredProjects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.06}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="mt-[50px] flex justify-center">
        <Link
          href="/github"
          className="group inline-flex items-center gap-2 rounded-full border border-border-dim px-[25px] py-[10px] font-mono text-xs uppercase tracking-[0.05em] transition-colors hover:border-accent-yellow hover:text-accent-yellow"
        >
          <GithubIcon width={14} height={14} />
          See all repositories on GitHub
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </section>
  );
}
