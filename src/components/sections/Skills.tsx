import Reveal from "@/components/Reveal";
import { skills } from "@/lib/data";

export default function Skills() {
  return (
    <section className="border-y border-border bg-surface/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-medium text-accent">Skill Stack</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            The tools behind the work
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
            <Reveal key={group.category} delay={i * 0.06}>
              <h3 className="font-display text-sm font-semibold text-foreground">
                {group.category}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
