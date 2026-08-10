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
      <section className="noise-bg px-6 pb-16 pt-16 sm:pt-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-sm font-medium text-accent">About</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-4 flex items-center gap-1.5 text-sm text-muted">
              <MapPin size={14} /> {profile.location}
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{profile.summary}</p>

            <a
              href="/Karthik_B_Resume.pdf"
              download
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
            >
              <Download size={15} /> Download resume
            </a>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Education</h2>
            <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-start gap-3">
                <GraduationCap size={20} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="font-medium">{education.school}</p>
                  <p className="mt-1 text-sm text-muted">
                    {education.degree} · {education.dates}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {education.coursework.map((c) => (
                      <span
                        key={c}
                        className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-muted"
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

      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Experience</h2>
          </Reveal>

          <div className="mt-8 space-y-10 border-l border-border pl-8">
            {experience.map((exp, i) => (
              <Reveal key={exp.org} delay={i * 0.08} className="relative">
                <span className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                <p className="text-xs text-muted">{exp.dates}</p>
                <h3 className="mt-1 font-display text-lg font-semibold">{exp.org}</h3>
                <p className="text-sm text-muted">
                  {exp.role} — {exp.location}
                </p>
                <ul className="mt-3 space-y-2">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2.5 text-sm text-muted">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Honors &amp; Affiliations
            </h2>
            <ul className="mt-6 space-y-4">
              {honors.map((h) => (
                <li key={h.title} className="rounded-xl border border-border bg-surface p-5">
                  <p className="font-medium">{h.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{h.detail}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
