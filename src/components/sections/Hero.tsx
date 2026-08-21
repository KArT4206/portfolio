"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDownRight, Terminal } from "lucide-react";
import type { PublicProfile } from "@/lib/profile";
import WarpJump from "@/components/hud/WarpJump";

export default function Hero({
  projectSlugs,
  profile,
  showTerminalButton = false,
}: {
  projectSlugs: string[];
  profile: PublicProfile;
  showTerminalButton?: boolean;
}) {
  return (
    <section className="relative overflow-hidden pb-[100px] pt-[58px]">
      <div className="hyperspace-field" aria-hidden />

      <div className="relative px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center gap-x-[15px] gap-y-[5px] font-mono text-[11px] uppercase tracking-[0.1em] text-dim"
        >
          <span>CS ENGINEER</span>
          <span className="text-border-dim">/</span>
          <span>AI</span>
          <span className="text-border-dim">/</span>
          <span>SOFTWARE</span>
          <span className="text-border-dim">/</span>
          <span>HARDWARE</span>
          <span className="text-border-dim">/</span>
          <span>RESEARCH</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mt-[15px] inline-flex items-center gap-2 rounded-full border border-accent-green px-[15px] py-[5px] font-mono text-[11px] uppercase tracking-[0.1em] text-foreground"
        >
          <span className="hud-live-dot h-1.5 w-1.5 rounded-full bg-accent-green" />
          Status: Open to internship &amp; research roles
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: "linear" }}
          className="mt-[15px] font-mono text-sm text-muted"
        >
          Hi, I&apos;m <span className="text-foreground">{profile.name}</span> — {profile.tagline}.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "linear" }}
          className="section-frame mt-[15px] max-w-4xl px-1 pb-4 font-display text-4xl font-normal leading-[0.95] tracking-[0.01em] sm:text-6xl md:text-[86px]"
        >
          {profile.heroLines[0]} <span className="text-signal">{profile.heroLines[1]}</span>{" "}
          {profile.heroLines[2]}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: "linear" }}
          className="mt-[15px] max-w-2xl text-[16px] leading-[1.63] text-muted"
        >
          {profile.summary}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: "linear" }}
          className="mt-[25px] grid max-w-xl grid-cols-2 gap-[1px] bg-border-dim sm:grid-cols-4"
        >
          {[
            { label: "Institution", value: "VIT Chennai" },
            { label: "Period", value: "2023 – 2027" },
            { label: "Papers", value: "3 published" },
            { label: "Location", value: "13.08°N 80.27°E" },
          ].map((s) => (
            <div key={s.label} className="bg-black p-[10px]">
              <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-dim">{s.label}</p>
              <p className="mt-[3px] font-mono text-xs text-accent-yellow">{s.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25, ease: "linear" }}
          className="mt-[25px] flex flex-wrap items-center gap-[15px]"
        >
          <Link
            href="/#work"
            data-cursor="VIEW"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-[50px] py-[25px] font-mono text-xs uppercase tracking-[0.05em] text-white transition-opacity hover:opacity-90"
          >
            View my work
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/#contact"
            data-cursor="CONTACT"
            className="group inline-flex items-center gap-2 rounded-full border border-accent-yellow px-[50px] py-[25px] font-mono text-xs uppercase tracking-[0.05em] text-foreground transition-colors hover:bg-accent-yellow hover:text-black"
          >
            Get in touch
            <ArrowDownRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </Link>
          <WarpJump slugs={projectSlugs} />
          {showTerminalButton && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("kb:open-terminal"))}
              data-cursor="OPEN"
              className="group inline-flex items-center gap-2 rounded-full border border-border-dim px-[25px] py-[25px] font-mono text-xs uppercase tracking-[0.05em] text-muted transition-colors hover:border-accent-green hover:text-accent-green"
            >
              <Terminal size={14} />
              Open terminal
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
