import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { getPublishedResearch } from "@/lib/research";

export default async function Research() {
  const papers = await getPublishedResearch();

  if (papers.length === 0) return null;

  return (
    <section id="research" className="wireframe-divider-top scroll-mt-24 px-6 py-[58px] md:px-10">
      <Reveal>
        <p className="inline-block rounded-full border border-accent-green px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green">
          02 / Research
        </p>
        <h2 className="mt-[15px] font-display text-3xl font-medium tracking-[0.02em] sm:text-4xl">
          Published &amp; presented research
        </h2>
      </Reveal>

      <div className="mt-[25px] flex flex-col gap-[1px] bg-border-dim">
        {papers.map((paper, i) => (
          <Reveal key={paper.id} delay={i * 0.06}>
            <div className="bg-black p-[15px] sm:p-[25px]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
                    PAPER / {String(i + 1).padStart(3, "0")} — STATUS: {paper.status.replace("_", " ").toUpperCase()}
                  </p>
                  <h3 className="mt-[8px] font-display text-lg font-medium tracking-[0.01em] sm:text-xl">
                    {paper.title}
                  </h3>
                  <p className="mt-[5px] text-sm text-muted">{paper.description}</p>
                </div>
                {paper.paperUrl && (
                  <a
                    href={paper.paperUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="READ"
                    className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-dim px-[15px] py-[8px] font-mono text-[11px] uppercase tracking-[0.05em] transition-colors hover:border-accent-yellow hover:text-accent-yellow"
                  >
                    Details
                    <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
              </div>

              {paper.metrics.length > 0 && (
                <div className="mt-[15px] grid gap-[1px] bg-border-dim sm:grid-cols-3">
                  {paper.metrics.slice(0, 6).map((m) => (
                    <div key={m.label} className="bg-black p-[10px] sm:p-[15px]">
                      <p className="font-mono text-lg font-medium tabular-nums text-accent-yellow sm:text-xl">
                        {m.value}
                      </p>
                      <p className="mt-[3px] font-mono text-[10px] uppercase tracking-[0.05em] text-muted">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {paper.attachments.length > 0 && (
                <div className="mt-[15px] flex flex-wrap gap-[10px]">
                  {paper.attachments.map((a) => (
                    <Link
                      key={a.url}
                      href={a.url}
                      target="_blank"
                      data-cursor="OPEN"
                      className="inline-flex items-center gap-1.5 border border-border-dim px-[10px] py-[5px] font-mono text-[11px] uppercase tracking-[0.05em] text-muted transition-colors hover:border-accent-yellow hover:text-accent-yellow"
                    >
                      [{a.mimeType === "application/pdf" ? "PDF" : "DOC"}] {a.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
