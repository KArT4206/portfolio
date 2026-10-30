"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";
import Reveal from "@/components/Reveal";

type Status = "idle" | "sending" | "sent" | "error";

const PROJECT_TYPES = ["Website / landing page", "Web app / dashboard", "AI, automation or IoT", "Something else", "Not a freelance project"];

const inputClass =
  "border border-border bg-surface-2 px-[10px] py-[10px] text-sm text-foreground outline-none placeholder:text-dim focus:border-accent-yellow";

export default function Contact({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const typeRef = useRef<HTMLSelectElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // The Freelance section's "Start a project" button pre-fills the form.
  useEffect(() => {
    function onStart(e: Event) {
      const type = (e as CustomEvent<{ type?: string }>).detail?.type;
      if (typeRef.current) typeRef.current.value = type ?? PROJECT_TYPES[0];
      if (subjectRef.current && !subjectRef.current.value) subjectRef.current.value = "Freelance project";
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 700);
    }
    window.addEventListener("kb:freelance-start", onStart);
    return () => window.removeEventListener("kb:freelance-start", onStart);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const projectType = (form.elements.namedItem("projectType") as HTMLSelectElement).value;
    const rawSubject = (form.elements.namedItem("subject") as HTMLInputElement).value.trim();
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: projectType ? `[${projectType}] ${rawSubject}`.trim() : rawSubject,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong.");
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section id="contact" className="scroll-mt-20 bg-black px-6 py-24 text-white md:px-10 md:py-32">
      <Reveal className="text-center">
        <h2 className="font-display text-[clamp(2.5rem,8vw,6.5rem)] font-black uppercase leading-[0.95] tracking-[-0.04em]">
          Let&apos;s build something
          <span className="block font-serif-display font-normal normal-case italic tracking-normal">
            exceptional
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-white/60">
          Available for freelance projects, internships and research collaborations.
        </p>
        <a
          href={`mailto:${email}`}
          className="mt-8 inline-block text-lg underline decoration-white/30 underline-offset-8 transition-colors hover:decoration-white sm:text-2xl"
        >
          {email}
        </a>
      </Reveal>

      <div className="mx-auto mt-16 max-w-3xl">
        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} className="section-frame bg-black p-[15px] sm:p-[25px]">
            <p className="mb-[15px] font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
              {status === "sent"
                ? "LINK STATUS: TRANSMITTED"
                : status === "sending"
                ? "LINK STATUS: TRANSMITTING..."
                : status === "error"
                ? "LINK STATUS: FAILED"
                : "LINK STATUS: STANDBY"}
            </p>
            <div className="grid gap-[15px] sm:grid-cols-2">
              <div className="flex flex-col gap-[5px]">
                <label htmlFor="name" className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                  Name
                </label>
                <input ref={nameRef} id="name" name="name" required className={inputClass} placeholder="Your name" />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="mt-[15px] flex flex-col gap-[5px]">
              <label htmlFor="projectType" className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                Project type <span className="normal-case tracking-normal text-dim">(optional)</span>
              </label>
              <select ref={typeRef} id="projectType" name="projectType" defaultValue="" className={inputClass}>
                <option value="">Choose one…</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-[15px] flex flex-col gap-[5px]">
              <label htmlFor="subject" className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                Subject
              </label>
              <input ref={subjectRef} id="subject" name="subject" className={inputClass} placeholder="What's this about?" />
            </div>

            <div className="mt-[15px] flex flex-col gap-[5px]">
              <label htmlFor="message" className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className={`resize-none ${inputClass}`}
                placeholder="What are you working on?"
              />
            </div>

            <div className="mt-[25px] flex flex-wrap items-center justify-between gap-4">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-muted transition-colors hover:text-foreground"
              >
                <Mail size={13} />
                or email directly
              </a>

              <button
                type="submit"
                disabled={status === "sending"}
                data-cursor="TRANSMIT"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-[25px] py-[10px] font-mono text-xs uppercase tracking-[0.05em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {status === "sending" ? "Transmitting..." : "Transmit"}
                <Send size={13} />
              </button>
            </div>

            {status === "sent" && (
              <p className="mt-[15px] flex items-center gap-2 font-mono text-xs text-accent-green">
                <CheckCircle2 size={14} /> Transmitted — I&apos;ll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className="mt-[15px] flex items-center gap-2 font-mono text-xs text-accent-crimson">
                <AlertCircle size={14} /> {errorMsg}
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
