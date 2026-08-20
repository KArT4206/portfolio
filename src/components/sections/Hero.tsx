"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDownRight } from "lucide-react";
import { profile } from "@/lib/data";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-[100px] pt-[58px]">
      <div className="hyperspace-field" aria-hidden />

      <div className="relative px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-accent-green px-[15px] py-[5px] font-mono text-[11px] uppercase tracking-[0.1em] text-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
          Status: Open to internship &amp; research roles
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="section-frame mt-[25px] max-w-4xl px-1 pb-4 font-display text-4xl font-normal leading-[0.95] tracking-[0.01em] sm:text-6xl md:text-[86px]"
        >
          {profile.heroLines[0]} <span className="text-signal">{profile.heroLines[1]}</span>{" "}
          {profile.heroLines[2]}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-[25px] max-w-2xl text-[16px] leading-[1.63] text-muted"
        >
          {profile.summary}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-[50px] flex flex-wrap items-center gap-[15px]"
        >
          <Link
            href="/#work"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-[50px] py-[25px] font-mono text-xs uppercase tracking-[0.05em] text-white transition-opacity hover:opacity-90"
          >
            View my work
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/#contact"
            className="group inline-flex items-center gap-2 rounded-full border border-accent-yellow px-[50px] py-[25px] font-mono text-xs uppercase tracking-[0.05em] text-foreground transition-colors hover:bg-accent-yellow hover:text-black"
          >
            Get in touch
            <ArrowDownRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
