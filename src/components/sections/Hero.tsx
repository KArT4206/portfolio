"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Terminal } from "lucide-react";
import type { PublicProfile } from "@/lib/profile";

export default function Hero({
  profile,
  showTerminalButton = false,
}: {
  profile: PublicProfile;
  showTerminalButton?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <section
      ref={ref}
      className="relative -mt-20 flex min-h-[100svh] items-center justify-center overflow-hidden bg-black px-4 pb-16 pt-28 text-white"
    >
      {profile.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.imageUrl}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top opacity-25 grayscale"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-full w-[28vw] min-w-[180px] -translate-x-1/2 bg-gradient-to-b from-white/15 via-white/5 to-transparent"
        />
      )}

      <motion.div style={{ opacity, scale }} className="relative z-10 flex max-w-6xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
        >
          <span className="rounded-full border border-white/50 px-4 py-1.5">AI &amp; Full-Stack Engineer</span>
          <a
            href="#freelance"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-black transition-opacity hover:opacity-85"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Available for freelance
          </a>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-6 font-display text-[clamp(2.4rem,9vw,7.5rem)] font-black uppercase leading-[0.92] tracking-[-0.04em]"
        >
          Build software
          <br />
          that ships with
          <br />
          purpose &amp; proof
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mt-6 max-w-xl text-sm text-white/60 sm:text-base"
        >
          {profile.tagline} — from production web platforms to IEEE-published research.
        </motion.p>

        {showTerminalButton && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("kb:open-terminal"))}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-white hover:text-black"
          >
            <Terminal size={14} /> Open terminal
          </button>
        )}
      </motion.div>
    </section>
  );
}
