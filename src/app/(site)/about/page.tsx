import type { Metadata } from "next";
import { Download, MapPin, GraduationCap } from "lucide-react";
import Reveal from "@/components/Reveal";
import PilotStatus from "@/components/hud/PilotStatus";
import { profile } from "@/lib/data";
import { getPublishedExperience } from "@/lib/experience";
import { getPublishedAwards } from "@/lib/awards";
import { getPublishedEducation } from "@/lib/education";
import { getPublishedCertifications } from "@/lib/certifications";
import { getPublishedPublications } from "@/lib/publications";
import { getActiveResume } from "@/lib/resume";

export const metadata: Metadata = {
  title: "About — Karthik B",
  description: "Background, experience, and education for Karthik B.",
};

function formatExperienceDates(startDate: string | null, endDate: string | null): string {
  const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const start = startDate ? fmt(startDate) : "";
  const end = endDate ? fmt(endDate) : "Present";
  return start ? `${start} – ${end}` : end;
}

function formatEducationDates(startDate: string | null, endDate: string | null): string {
  const year = (iso: string) => new Date(iso).getFullYear();
  const start = startDate ? year(startDate) : "";

  if (!endDate) return start ? `${start} – Present` : "Present";

  const isFuture = new Date(endDate).getTime() > Date.now();
  const end = isFuture ? `${year(endDate)} (Expected)` : String(year(endDate));
  return start ? `${start} – ${end}` : end;
}

function formatPublicationDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function AboutPage() {
  const [experience, awards, education, certifications, publications, resume] = await Promise.all([
    getPublishedExperience(),
    getPublishedAwards(),
    getPublishedEducation(),
    getPublishedCertifications(),
    getPublishedPublications(),
    getActiveResume(),
  ]);
  const primaryEducation = education[0] ?? null;
  const resumeHref = resume?.url ?? "/Karthik_B_Resume.pdf";

  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-[58px] pt-[58px] md:px-10">
        <div className="hyperspace-field" aria-hidden />
        <div className="relative max-w-3xl">
          <Reveal>
            <p className="inline-block rounded-full border border-accent-green px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green">
              05 / Identity Panel
            </p>
            <h1 className="mt-[15px] font-display text-4xl font-medium tracking-[0.02em] sm:text-5xl">
              {profile.name}
            </h1>

            <div className="section-frame mt-[25px] grid gap-[1px] bg-border-dim sm:grid-cols-2">
              <div className="bg-black p-[15px]">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">Identity</p>
                <p className="mt-[5px] font-mono text-sm">{profile.name} ({profile.initials})</p>
              </div>
              <div className="bg-black p-[15px]">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">Role</p>
                <p className="mt-[5px] font-mono text-sm">{profile.tagline}</p>
              </div>
              <div className="bg-black p-[15px]">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">Institution</p>
                <p className="mt-[5px] flex items-center gap-1.5 font-mono text-sm">
                  <MapPin size={12} /> {primaryEducation?.school ?? "—"}
                </p>
              </div>
              <div className="bg-black p-[15px]">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">Period</p>
                <p className="mt-[5px] font-mono text-sm">
                  {primaryEducation ? formatEducationDates(primaryEducation.startDate, primaryEducation.endDate) : "—"}
                </p>
              </div>
              <div className="bg-black p-[15px] sm:col-span-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">Focus</p>
                <div className="mt-[8px] flex flex-wrap gap-[5px]">
                  {["AI/ML", "Full-Stack", "Cybersecurity", "Embedded Systems", "Research"].map((f) => (
                    <span
                      key={f}
                      className="border border-border-dim px-[8px] py-[2px] font-mono text-[11px] text-muted"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-[25px] max-w-2xl text-lg leading-[1.63] text-muted">{profile.summary}</p>

            <a
              href={resumeHref}
              download
              target="_blank"
              rel="noreferrer"
              data-cursor="OPEN"
              className="mt-[25px] inline-flex items-center gap-2 rounded-full bg-accent px-[50px] py-[25px] font-mono text-xs uppercase tracking-[0.05em] text-white transition-opacity hover:opacity-90"
            >
              <Download size={14} /> Download resume
            </a>
          </Reveal>

          <Reveal delay={0.1} className="mt-[25px] max-w-2xl">
            <PilotStatus />
          </Reveal>
        </div>
      </section>

      <section className="wireframe-divider-top px-6 py-[50px] md:px-10">
        <div className="max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-medium tracking-[0.02em]">Education</h2>
            <div className="mt-[25px] flex flex-col gap-[15px]">
              {education.map((e) => (
                <div key={e.id} className="section-frame bg-black p-[15px] sm:p-[25px]">
                  <div className="flex items-start gap-3">
                    <GraduationCap size={18} className="mt-0.5 shrink-0 text-accent-yellow" />
                    <div>
                      <p className="font-medium">{e.school}</p>
                      <p className="mt-[5px] font-mono text-xs uppercase tracking-[0.05em] text-muted">
                        {e.degree} · {formatEducationDates(e.startDate, e.endDate)}
                      </p>
                      {e.coursework.length > 0 && (
                        <div className="mt-[15px] flex flex-wrap gap-[5px]">
                          {e.coursework.map((c) => (
                            <span
                              key={c}
                              className="border border-border-dim px-[8px] py-[2px] font-mono text-[11px] text-muted"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {education.length === 0 && <p className="text-sm text-muted">No education entries published yet.</p>}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="experience" className="wireframe-divider-top scroll-mt-24 px-6 py-[50px] md:px-10">
        <div className="max-w-3xl">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">System Timeline</p>
            <h2 className="mt-[5px] font-display text-2xl font-medium tracking-[0.02em]">Experience</h2>
          </Reveal>

          <div className="mt-[25px] space-y-[50px] border-l border-border-dim pl-[25px]">
            {experience.map((exp, i) => (
              <Reveal key={exp.id} delay={i * 0.08} className="relative">
                <span className="absolute -left-[calc(25px+4px)] top-1.5 h-2 w-2 rounded-full bg-accent-yellow" />
                <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
                  {formatExperienceDates(exp.startDate, exp.endDate)}
                </p>
                <h3 className="mt-1 font-display text-lg font-medium tracking-[0.01em]">{exp.org}</h3>
                <p className="text-sm text-muted">
                  {exp.role}
                  {exp.location ? ` — ${exp.location}` : ""}
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
            {experience.length === 0 && <p className="text-sm text-muted">No experience entries published yet.</p>}
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
              {awards.map((a) => (
                <li key={a.id} className="bg-black p-[15px] sm:p-[20px]">
                  <p className="font-medium">{a.title}</p>
                  <p className="mt-[5px] text-sm leading-[1.5] text-muted">{a.detail}</p>
                </li>
              ))}
              {awards.length === 0 && (
                <li className="bg-black p-[15px] text-sm text-muted sm:p-[20px]">No honors published yet.</li>
              )}
            </ul>
          </Reveal>
        </div>
      </section>

      {publications.length > 0 && (
        <section className="wireframe-divider-top px-6 py-[50px] md:px-10">
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-medium tracking-[0.02em]">Publications</h2>
              <ul className="mt-[25px] space-y-[1px] bg-border-dim">
                {publications.map((p) => (
                  <li key={p.id} className="bg-black p-[15px] sm:p-[20px]">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium">{p.title}</p>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          data-cursor="READ"
                          className="font-mono text-[11px] uppercase tracking-[0.05em] text-accent-yellow hover:underline"
                        >
                          [ READ ]
                        </a>
                      )}
                    </div>
                    <p className="mt-[5px] text-sm leading-[1.5] text-muted">
                      {p.authors.length > 0 ? p.authors.join(", ") : ""}
                      {p.journal ? ` — ${p.journal}` : ""}
                      {p.publicationDate ? ` (${formatPublicationDate(p.publicationDate)})` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="wireframe-divider-top px-6 py-[50px] md:px-10">
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-medium tracking-[0.02em]">Certifications</h2>
              <ul className="mt-[25px] space-y-[1px] bg-border-dim">
                {certifications.map((c) => (
                  <li key={c.id} className="bg-black p-[15px] sm:p-[20px]">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium">{c.name}</p>
                      {c.certificateUrl && (
                        <a
                          href={c.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          data-cursor="VERIFY"
                          className="font-mono text-[11px] uppercase tracking-[0.05em] text-accent-yellow hover:underline"
                        >
                          [ VERIFY CREDENTIAL ]
                        </a>
                      )}
                    </div>
                    <p className="mt-[5px] text-sm leading-[1.5] text-muted">
                      {c.issuer}
                      {c.credentialId ? ` · ${c.credentialId}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}
    </div>
  );
}
