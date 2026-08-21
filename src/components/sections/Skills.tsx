import Reveal from "@/components/Reveal";
import { getPublishedSkillGroups } from "@/lib/skillGroups";

export default async function Skills() {
  const skillGroups = await getPublishedSkillGroups();

  if (skillGroups.length === 0) return null;

  return (
    <section className="wireframe-divider-top px-6 py-[58px] md:px-10">
      <Reveal>
        <p className="inline-block rounded-full border border-accent-green px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green">
          Skill Stack
        </p>
        <h2 className="mt-[15px] font-display text-3xl font-medium tracking-[0.02em] sm:text-4xl">
          The tools behind the work
        </h2>
      </Reveal>

      <div className="mt-[25px] grid gap-x-[25px] gap-y-[25px] sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, i) => (
          <Reveal key={group.id} delay={i * 0.05}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent-yellow">
              {group.category}
            </h3>
            <div className="mt-[10px] flex flex-wrap gap-[5px]">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border-dim px-[15px] py-[2px] text-xs text-muted transition-colors hover:border-foreground hover:text-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
