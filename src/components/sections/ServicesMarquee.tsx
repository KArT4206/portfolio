import Reveal from "@/components/Reveal";
import { getPublishedSkillGroups } from "@/lib/skillGroups";

const FALLBACK_ROWS = [
  "Full-Stack Development",
  "AI / ML Engineering",
  "Applied Research",
  "Embedded & IoT Systems",
  "Security Engineering",
];

export default async function ServicesMarquee() {
  const groups = await getPublishedSkillGroups();
  const rows = groups.length > 0 ? groups.map((g) => g.category) : FALLBACK_ROWS;

  return (
    <section id="services" className="scroll-mt-20 overflow-hidden bg-white pb-24 text-black md:pb-32">
      <Reveal className="mx-auto max-w-6xl px-6 text-center md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">What I do</p>
        <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
          Built with <span className="font-serif-display font-normal italic">curiosity</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-black/60">
          Engineering across the stack — from interfaces and APIs to models and hardware — with
          every claim backed by something that actually runs.
        </p>
      </Reveal>

      <div className="mt-16 flex flex-col gap-3" aria-label="Services">
        {rows.map((label, i) => (
          <div key={label} className="relative flex overflow-hidden border-y border-black/10 py-3">
            {/* Content duplicated once so translating -50% loops seamlessly */}
            <div
              className={`marquee-track flex shrink-0 whitespace-nowrap ${i % 2 ? "marquee-track--reverse" : ""}`}
              style={{ animationDuration: `${32 + i * 6}s` }}
            >
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1} className="flex shrink-0">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <span
                      key={j}
                      className={`px-6 font-display text-3xl font-black uppercase tracking-tight sm:text-5xl ${
                        j % 2 ? "text-black/15" : ""
                      }`}
                    >
                      {label} <span className="font-serif-display font-normal">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
