"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";
import Reveal from "@/components/Reveal";
import { profile } from "@/lib/data";

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "border border-border bg-surface-2 px-[10px] py-[10px] text-sm text-foreground outline-none placeholder:text-dim focus:border-accent-yellow";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
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
    <section id="contact" className="wireframe-divider-top scroll-mt-24 px-6 py-[58px] md:px-10">
      <div className="max-w-3xl">
        <Reveal>
          <p className="inline-block rounded-full border border-accent-green px-[10px] py-[2px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green">
            Contact
          </p>
          <h2 className="mt-[15px] font-display text-3xl font-medium tracking-[0.02em] sm:text-4xl">
            Let&apos;s build something worth shipping
          </h2>
          <p className="mt-[15px] max-w-xl text-muted">
            Open to internships, research collaborations, and interesting full-stack or AI/ML
            problems. Drop a note below, or email me directly.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-[25px]">
          <form onSubmit={handleSubmit} className="section-frame bg-black p-[15px] sm:p-[25px]">
            <div className="grid gap-[15px] sm:grid-cols-2">
              <div className="flex flex-col gap-[5px]">
                <label htmlFor="name" className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                  Name
                </label>
                <input id="name" name="name" required className={inputClass} placeholder="Your name" />
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
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-muted transition-colors hover:text-foreground"
              >
                <Mail size={13} />
                or email directly
              </a>

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-[25px] py-[10px] font-mono text-xs uppercase tracking-[0.05em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {status === "sending" ? "Sending..." : "Send message"}
                <Send size={13} />
              </button>
            </div>

            {status === "sent" && (
              <p className="mt-[15px] flex items-center gap-2 font-mono text-xs text-accent-green">
                <CheckCircle2 size={14} /> Message sent — I&apos;ll get back to you soon.
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
