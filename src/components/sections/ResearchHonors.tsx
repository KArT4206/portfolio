import { Award, BookOpen, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import { honors } from "@/lib/data";

const ICONS = [Award, BookOpen, Users];

export default function ResearchHonors() {
  return (
    <section id="research" className="wireframe-divider-top scroll-mt-24 px-6 py-[58px] md:px-10">
      <Reveal>
        <p className="inline-block rounded-full border border-accent-green px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green">
          Research &amp; Honors
        </p>
        <h2 className="mt-[15px] font-display text-3xl font-medium tracking-[0.02em] sm:text-4xl">
          Recognized research contributions
        </h2>
      </Reveal>

      <div className="mt-[25px] grid gap-[1px] bg-border-dim sm:grid-cols-3">
        {honors.map((honor, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <Reveal key={honor.title} delay={i * 0.06}>
              <div className="h-full bg-black p-[15px] sm:p-[25px]">
                <Icon size={18} className="text-accent-yellow" />
                <h3 className="mt-[15px] font-display text-base font-medium tracking-[0.01em]">
                  {honor.title}
                </h3>
                <p className="mt-[8px] text-sm leading-[1.5] text-muted">{honor.detail}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
