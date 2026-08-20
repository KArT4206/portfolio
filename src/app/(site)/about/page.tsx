import type { Metadata } from "next";
import { Download, MapPin, GraduationCap } from "lucide-react";
import Reveal from "@/components/Reveal";
import { profile, education, experience, honors } from "@/lib/data";

export const metadata: Metadata = {
  title: "About — Karthik B",
  description: "Background, experience, and education for Karthik B.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-[58px] pt-[58px] md:px-10">
        <div className="hyperspace-field" aria-hidden />
        <div className="relative max-w-3xl">
          <Reveal>
            <p className="inline-block rounded-full border border-accent-green px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green">
              About
            </p>
            <h1 className="mt-[15px] font-display text-4xl font-medium tracking-[0.02em] sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-[15px] flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.05em] text-muted">
              <MapPin size={13} /> {profile.location}
            </p>
            <p className="mt-[25px] max-w-2xl text-lg leading-[1.63] text-muted">{profile.summary}</p>

            <a
              href="/Karthik_B_Resume.pdf"
              download
              className="mt-[25px] inline-flex items-center gap-2 rounded-full bg-accent px-[50px] py-[25px] font-mono text-xs uppercase tracking-[0.05em] text-white transition-opacity hover:opacity-90"
            >
              <Download size={14} /> Download resume
            </a>
          </Reveal>
        </div>
      </section>

      <section className="wireframe-divider-top px-6 py-[50px] md:px-10">
        <div className="max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-medium tracking-[0.02em]">Education</h2>
            <div className="section-frame mt-[25px] bg-black p-[15px] sm:p-[25px]">
              <div className="flex items-start gap-3">
                <GraduationCap size={18} className="mt-0.5 shrink-0 text-accent-yellow" />
                <div>
                  <p className="font-medium">{education.school}</p>
                  <p className="mt-[5px] font-mono text-xs uppercase tracking-[0.05em] text-muted">
                    {education.degree} · {education.dates}
                  </p>
                  <div className="mt-[15px] flex flex-wrap gap-[5px]">
                    {education.coursework.map((c) => (
                      <span
                        key={c}
                        className="border border-border-dim px-[8px] py-[2px] font-mono text-[11px] text-muted"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="wireframe-divider-top px-6 py-[50px] md:px-10">
        <div className="max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-medium tracking-[0.02em]">Experience</h2>
          </Reveal>

          <div className="mt-[25px] space-y-[50px] border-l border-border-dim pl-[25px]">
            {experience.map((exp, i) => (
              <Reveal key={exp.org} delay={i * 0.08} className="relative">
                <span className="absolute -left-[calc(25px+4px)] top-1.5 h-2 w-2 rounded-full bg-accent-yellow" />
                <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">{exp.dates}</p>
                <h3 className="mt-1 font-display text-lg font-medium tracking-[0.01em]">{exp.org}</h3>
                <p className="text-sm text-muted">
                  {exp.role} — {exp.location}
                </p>
                <ul className="mt-[15px] space-y-[8px]">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="flex gap-[10px] text-sm text-muted">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
                      <span className="leading-[1.5]">{b}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="wireframe-divider-top px-6 py-[50px] md:px-10">
        <div className="max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-medium tracking-[0.02em]">
              Honors &amp; Affiliations
            </h2>
            <ul className="mt-[25px] space-y-[1px] bg-border-dim">
              {honors.map((h) => (
                <li key={h.title} className="bg-black p-[15px] sm:p-[20px]">
                  <p className="font-medium">{h.title}</p>
                  <p className="mt-[5px] text-sm leading-[1.5] text-muted">{h.detail}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
