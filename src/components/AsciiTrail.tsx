"use client";

import { useEffect, useRef } from "react";
import { isDarkAt } from "@/lib/surfaceTone";

const CELL_W = 9;
const CELL_H = 14;
const LIFE = 1.6; // seconds
const MAX = 700;
const GLYPHS = ".:-=+*#%@01xXo/\\|<>{}[]$&";
type RGB = [number, number, number];
// Colours cycle along the length of the trail. On dark surfaces: glowing
// blue -> orange -> green. On light surfaces: deep ink navy -> crimson ->
// emerald, since additive glow is invisible on white.
const DARK_PALETTE: RGB[] = [
  [110, 170, 255],
  [255, 170, 80],
  [110, 255, 160],
];
const LIGHT_PALETTE: RGB[] = [
  [30, 50, 160],
  [200, 30, 70],
  [10, 130, 80],
];

type P = { c: number; r: number; age: number; ch: string; tint: number; next: number; light: boolean };

function tintColor(t: number, a: number, light: boolean) {
  const PALETTE = light ? LIGHT_PALETTE : DARK_PALETTE;
  const n = PALETTE.length;
  const x = ((t % n) + n) % n;
  const i = Math.floor(x);
  const f = x - i;
  const p = PALETTE[i];
  const q = PALETTE[(i + 1) % n];
  return `rgba(${Math.round(p[0] + (q[0] - p[0]) * f)},${Math.round(p[1] + (q[1] - p[1]) * f)},${Math.round(p[2] + (q[2] - p[2]) * f)},${a})`;
}

const GLYPH_FONT = `${CELL_H - 2}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
const HALO_FONT = `bold ${CELL_H + 8}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

const randGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

export default function AsciiTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
    };
    resize();

    const parts: P[] = [];
    const occupied = new Set<number>();
    let last: { x: number; y: number } | null = null;
    let travelled = 0;
    let raf = 0;
    let prev = 0;

    const spawn = (x: number, y: number, tint: number, light: boolean) => {
      const c = Math.round(x / CELL_W);
      const r = Math.round(y / CELL_H);
      const key = r * 10000 + c;
      if (occupied.has(key)) return;
      occupied.add(key);
      parts.push({ c, r, age: 0, ch: randGlyph(), tint, next: 0.05 + Math.random() * 0.08, light });
      if (parts.length > MAX) {
        const old = parts.shift()!;
        occupied.delete(old.r * 10000 + old.c);
      }
    };

    const onMove = (e: PointerEvent) => {
      const cur = { x: e.clientX, y: e.clientY };
      if (document.documentElement.dataset.theme === "tomb") {
        last = null;
        return;
      }
      const light = !isDarkAt(cur.x, cur.y);
      const from = last ?? cur;
      const dist = Math.hypot(cur.x - from.x, cur.y - from.y);
      const steps = Math.max(1, Math.ceil(dist / (CELL_W * 0.8)));
      // faster movement leaves a wider, scattered trail
      const spread = Math.min(3, 1 + dist / 40);
      for (let k = 1; k <= steps; k++) {
        const x = from.x + ((cur.x - from.x) * k) / steps;
        const y = from.y + ((cur.y - from.y) * k) / steps;
        travelled += dist / steps;
        const tint = travelled / 260;
        spawn(x, y, tint, light);
        for (let j = 0; j < spread; j++) {
          spawn(x + (Math.random() - 0.5) * CELL_W * 3 * spread, y + (Math.random() - 0.5) * CELL_H * 2 * spread, tint, light);
        }
      }
      last = cur;
      if (!raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age += dt;
        if (p.age >= LIFE) {
          occupied.delete(p.r * 10000 + p.c);
          parts.splice(i, 1);
          continue;
        }
        // characters scramble while they're alive, slowing as they fade
        p.next -= dt;
        if (p.next <= 0) {
          p.ch = randGlyph();
          p.next = 0.05 + p.age * 0.25;
        }
        // stays near full brightness, then eases out at the end
        const k = Math.pow(1 - p.age / LIFE, 0.6);
        const x = p.c * CELL_W;
        const y = p.r * CELL_H;
        // cheap glow: a big faint copy under the crisp glyph (shadowBlur
        // per glyph is what made this expensive)
        // glow adds light on dark surfaces; on white it's a soft ink bleed
        ctx.globalCompositeOperation = p.light ? "source-over" : "lighter";
        ctx.font = HALO_FONT;
        ctx.fillStyle = tintColor(p.tint, (p.light ? 0.16 : 0.32) * k, p.light);
        ctx.fillText(p.ch, x, y);
        ctx.font = GLYPH_FONT;
        ctx.fillStyle = tintColor(p.tint, k, p.light);
        ctx.fillText(p.ch, x, y);
      }
      ctx.globalCompositeOperation = "source-over";
      raf = parts.length ? requestAnimationFrame(frame) : 0;
      if (!raf) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    const onLeave = () => (last = null);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("pointerleave", onLeave);
    // scrolling moves content under the cursor; drop the stale anchor
    window.addEventListener("scroll", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden data-tone-ignore className="pointer-events-none fixed inset-0 z-[45] h-screen w-screen" />;
}
