"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Rocket } from "lucide-react";

/**
 * "Space ship" easter egg: a warp-jump button that flashes a brief
 * radiating burst (see .warp-jump-overlay in globals.css) and then
 * navigates to a random project. Purely for fun — inspired by the warp
 * transition on the GT Planar reference site, rebuilt from scratch with
 * our own CSS, no reference assets.
 */
export default function WarpJump({ slugs }: { slugs: string[] }) {
  const router = useRouter();
  const [active, setActive] = useState(false);

  if (slugs.length === 0) return null;

  function jump() {
    const target = slugs[Math.floor(Math.random() * slugs.length)];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      router.push(`/projects/${target}`);
      return;
    }

    setActive(true);
    setTimeout(() => {
      router.push(`/projects/${target}`);
      setTimeout(() => setActive(false), 200);
    }, 450);
  }

  return (
    <>
      <button
        type="button"
        onClick={jump}
        data-cursor="WARP"
        className="group inline-flex items-center gap-2 rounded-full border border-border-dim px-[25px] py-[25px] font-mono text-xs uppercase tracking-[0.05em] text-muted transition-colors hover:border-accent-yellow hover:text-accent-yellow"
      >
        <Rocket size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        Warp to random project
      </button>
      <div className={`warp-jump-overlay ${active ? "warp-jump-active" : ""}`} aria-hidden />
    </>
  );
}
