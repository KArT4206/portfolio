"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";
import Reveal from "@/components/Reveal";
import { profile } from "@/lib/data";

type Status = "idle" | "sending" | "sent" | "error";

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
    <section id="contact" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="text-sm font-medium text-accent">Contact</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Let&apos;s build something worth shipping
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Open to internships, research collaborations, and interesting full-stack or AI/ML
            problems. Drop a note below, or email me directly.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs font-medium text-muted">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/50"
                  placeholder="Your name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-medium text-muted">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/50"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <label htmlFor="message" className="text-xs font-medium text-muted">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="resize-none rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/50"
                placeholder="What are you working on?"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
              >
                <Mail size={13} />
                or email {profile.email} directly
              </a>

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] disabled:opacity-60 disabled:hover:scale-100"
              >
                {status === "sending" ? "Sending..." : "Send message"}
                <Send size={14} />
              </button>
            </div>

            {status === "sent" && (
              <p className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 size={15} /> Message sent — I&apos;ll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className="mt-4 flex items-center gap-2 text-sm text-red-400">
                <AlertCircle size={15} /> {errorMsg}
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
