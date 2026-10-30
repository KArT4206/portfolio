"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import Reveal from "@/components/Reveal";

// 12x12 pixel icons in the same style as the buddy.
const ICONS = {
  site: ["############", "#..........#", "#.##.......#", "#..........#", "#.########.#", "#.#......#.#", "#.#......#.#", "#.########.#", "#..........#", "############", "....####....", "..########.."],
  app: ["############", "#.#.#......#", "############", "#..#.......#", "#..#.#####.#", "#..#.......#", "#..#.###...#", "#..#.......#", "#..#.####..#", "#..#.......#", "#..#.......#", "############"],
  ai: [".#.#.#.#.#..", "############", "#..........#", "#.###..###.#", "#.#.#..#.#.#", "#.###..###.#", "#..........#", "#...####...#", "#..........#", "############", ".#.#.#.#.#..", "............"],
};

function PixelIcon({ grid }: { grid: string[] }) {
  const d = grid
    .flatMap((row, y) => [...row].map((c, x) => (c === "#" ? `M${x} ${y}h1v1h-1z` : "")))
    .join("");
  return (
    <svg viewBox="0 0 12 12" width={44} height={44} shapeRendering="crispEdges" aria-hidden>
      <path d={d} fill="currentColor" />
    </svg>
  );
}

const OFFERS = [
  {
    icon: ICONS.site,
    type: "Website / landing page",
    title: "Websites & landing pages",
    body: "Fast, good-looking business sites, portfolios and storefronts that rank and convert.",
  },
  {
    icon: ICONS.app,
    type: "Web app / dashboard",
    title: "Web apps & dashboards",
    body: "Full-stack Next.js / Node apps with auth, databases, admin panels and real deployments.",
  },
  {
    icon: ICONS.ai,
    type: "AI, automation or IoT",
    title: "AI, automation & IoT",
    body: "Model and chatbot integrations, computer vision, workflow automation and ESP32 hardware.",
  },
];

const STEPS = ["Chat about the idea", "Proposal & quote", "Build with weekly demos", "Launch & support"];

function start(type?: string) {
  window.dispatchEvent(new CustomEvent("kb:freelance-start", { detail: { type } }));
}

export default function Freelance({ email }: { email: string }) {
  return (
    <section id="freelance" className="scroll-mt-20 bg-white px-6 pb-24 text-black md:px-10 md:pb-32">
      <div className="mx-auto max-w-6xl border-t border-black/10 pt-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Open for freelance
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
              Freelance — <span className="font-serif-display font-normal italic">let&apos;s build yours</span>
            </h2>
          </div>
          <p className="max-w-sm text-black/60">
            I take on a small number of client projects alongside my work, end-to-end from idea to launch.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {OFFERS.map((o, i) => (
            <Reveal key={o.title} delay={i * 0.08}>
              <button
                type="button"
                onClick={() => start(o.type)}
                className="group flex h-full w-full flex-col rounded-2xl border border-black/15 p-7 text-left transition-colors hover:bg-black hover:text-white"
              >
                <PixelIcon grid={o.icon} />
                <h3 className="mt-6 font-display text-2xl font-bold tracking-tight">{o.title}</h3>
                <p className="mt-2 text-sm text-black/60 transition-colors group-hover:text-white/70">{o.body}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium">
                  Start this <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3 border-t-2 border-black pt-4">
                <span className="font-display text-3xl font-black tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-medium">{s}</span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.15} className="mt-12 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => start()}
            className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
          >
            Start a project <ArrowUpRight size={15} />
          </button>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent("Freelance project")}`}
            className="inline-flex items-center gap-2 rounded-full border border-black px-6 py-3 text-sm font-medium transition-colors hover:bg-black hover:text-white"
          >
            <Mail size={15} /> Email me
          </a>
        </Reveal>
      </div>
    </section>
  );
}
