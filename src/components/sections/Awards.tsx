import Reveal from "@/components/Reveal";
import { getPublishedAwards } from "@/lib/awards";

/**
 * Certificate links only appear when an actual certificate (uploaded file
 * or external URL) is set on the award through Admin — see
 * src/lib/awards.ts. Never a hardcoded assumption that one exists.
 */
export default async function Awards() {
  const awards = await getPublishedAwards();

  if (awards.length === 0) return null;

  return (
    <section id="awards" className="wireframe-divider-top scroll-mt-24 px-6 py-[58px] md:px-10">
      <Reveal>
        <p className="inline-block rounded-full border border-accent-green px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green">
          03 / Awards &amp; Recognition
        </p>
        <h2 className="mt-[15px] font-display text-3xl font-medium tracking-[0.02em] sm:text-4xl">
          Recognized contributions
        </h2>
      </Reveal>

      <div className="mt-[25px] grid gap-[1px] bg-border-dim sm:grid-cols-3">
        {awards.map((award, i) => (
          <Reveal key={award.id} delay={i * 0.06}>
            <div className="h-full bg-black p-[15px] sm:p-[25px]">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
                AWARD / {String(i + 1).padStart(3, "0")}
              </p>
              <h3 className="mt-[10px] font-display text-base font-medium tracking-[0.01em]">{award.title}</h3>
              <p className="mt-[8px] text-sm leading-[1.5] text-muted">{award.detail}</p>
              {award.certificateUrl && (
                <a
                  href={award.certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="VERIFY"
                  className="mt-[10px] inline-block font-mono text-[11px] uppercase tracking-[0.05em] text-accent-yellow hover:underline"
                >
                  [ VIEW CERTIFICATE ]
                </a>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
