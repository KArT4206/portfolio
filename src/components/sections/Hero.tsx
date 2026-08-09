"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDownRight } from "lucide-react";
import { profile } from "@/lib/data";

export default function Hero() {
  return (
    <section className="noise-bg relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-muted"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-2 animate-pulse" />
          Open to internship &amp; research opportunities
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-8 max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl"
        >
          {profile.heroLines[0]} <span className="gradient-text">{profile.heroLines[1]}</span>{" "}
          {profile.heroLines[2]}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-muted"
        >
          {profile.summary}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/#work"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
          >
            View my work
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/#contact"
            className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-accent/50 hover:text-accent"
          >
            Get in touch
            <ArrowDownRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </Link>
        </motion.div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-accent/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10%] left-[-5%] h-72 w-72 rounded-full bg-accent-2/10 blur-[120px]"
      />
    </section>
  );
}
