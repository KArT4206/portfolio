import { Award, BookOpen, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import { honors } from "@/lib/data";

const ICONS = [Award, BookOpen, Users];

export default function ResearchHonors() {
  return (
    <section id="research" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-medium text-accent">Research &amp; Honors</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Recognized research contributions
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {honors.map((honor, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={honor.title} delay={i * 0.08}>
                <div className="glow-border h-full rounded-2xl border border-border bg-surface p-6">
                  <Icon size={20} className="text-accent" />
                  <h3 className="mt-4 font-display text-base font-semibold">{honor.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{honor.detail}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
