import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HudFrame, HudWireframe, HudLabel, HudIndex } from "@/components/hud/primitives";
import { getPublishedProjects } from "@/lib/projects";

const CAPABILITIES = ["FRONTEND", "BACKEND", "API", "AUTH", "RBAC", "GPS", "ANALYTICS", "DATABASE"];

/**
 * The flagship project gets its own cockpit "mission brief" module, more
 * prominent than a regular project card — same real data as everywhere
 * else on the site, just given the visual weight it earns.
 */
export default async function Mission() {
  const projects = await getPublishedProjects();
  const egmp = projects.find((p) => p.slug === "egmp");
  if (!egmp) return null;

  return (
    <section className="wireframe-divider-top px-6 py-[50px] md:px-10">
      <HudWireframe>
        <HudFrame className="p-[15px] sm:p-[35px]">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <HudLabel tone="green">
              <HudIndex n={1} /> Mission
            </HudLabel>
            <HudLabel tone="yellow">STATUS: {egmp.status.toUpperCase()}</HudLabel>
          </div>

          <h2 className="mt-[15px] max-w-3xl font-display text-3xl font-medium uppercase leading-[1.05] tracking-[0.01em] sm:text-4xl md:text-5xl">
            {egmp.title}
          </h2>
          <p className="mt-[15px] max-w-2xl text-muted">{egmp.overview}</p>

          <div className="mt-[20px] flex flex-wrap gap-[5px]">
            {CAPABILITIES.map((c) => (
              <span
                key={c}
                className="border border-border-dim px-[10px] py-[3px] font-mono text-[11px] uppercase tracking-[0.05em] text-accent-green"
              >
                {c}
              </span>
            ))}
          </div>

          <p className="mt-[20px] max-w-2xl font-mono text-xs leading-[1.6] text-muted">{egmp.role}</p>

          <Link
            href={`/projects/${egmp.slug}`}
            data-cursor="READ"
            className="group mt-[25px] inline-flex items-center gap-2 rounded-full bg-accent px-[25px] py-[12px] font-mono text-xs uppercase tracking-[0.05em] text-white transition-opacity hover:opacity-90"
          >
            View mission brief
            <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </HudFrame>
      </HudWireframe>
    </section>
  );
}
