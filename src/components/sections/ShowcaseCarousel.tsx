"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";

export type ShowcaseItem = {
  slug: string;
  title: string;
  tagline: string;
  category: string[];
  coverImageUrl: string | null;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function ShowcaseCarousel({ projects }: { projects: ShowcaseItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const cards = Array.from(track.children) as HTMLElement[];
      let nearest = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      setActive(nearest);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  function go(delta: number) {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.min(Math.max(active + delta, 0), projects.length - 1);
    const card = track.children[next] as HTMLElement | undefined;
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setActive(next);
  }

  if (projects.length === 0) return null;

  return (
    <section id="work" className="scroll-mt-20 bg-black py-24 text-white md:py-32">
      <Reveal className="flex flex-wrap items-end justify-between gap-6 px-6 md:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            My projects / Showcase
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Selected work
          </h2>
        </div>
        <Link
          href="/github"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-5 py-2 text-sm transition-colors hover:bg-white hover:text-black"
        >
          Discover all <ArrowUpRight size={14} />
        </Link>
      </Reveal>

      <div
        ref={trackRef}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 md:scroll-px-10 md:px-10"
      >
        {projects.map((p, i) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="group relative w-[85vw] shrink-0 snap-start sm:w-[60vw] lg:w-[42vw]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-900">
              {p.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-end bg-gradient-to-br from-neutral-800 to-black p-8">
                  <span className="font-display text-6xl font-black text-white/10 sm:text-8xl">{pad(i + 1)}</span>
                </div>
              )}
            </div>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight">{p.title}</h3>
                <p className="mt-1 text-sm text-white/55">{p.tagline}</p>
              </div>
              <ArrowUpRight className="mt-1 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
            {p.category.length > 0 && (
              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/40">{p.category.join(" · ")}</p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between px-6 md:px-10">
        <p className="font-display text-sm tabular-nums" aria-live="polite">
          <span className="text-white">{pad(active + 1)}</span>
          <span className="text-white/40"> / {pad(projects.length)}</span>
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => go(-1)}
            disabled={active === 0}
            className="rounded-full border border-white/40 p-3 transition-colors hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => go(1)}
            disabled={active === projects.length - 1}
            className="rounded-full border border-white/40 p-3 transition-colors hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
