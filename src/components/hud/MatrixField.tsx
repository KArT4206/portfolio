"use client";

import { useEffect, useRef } from "react";

// Original implementation: a full-viewport dot grid, drawn to canvas rather
// than DOM nodes so a dense grid stays cheap. Dots nudge and brighten near
// the pointer with falloff, and idle ones drift on a per-dot sine phase so
// the field feels alive without anyone touching it. Sits behind all normal
// in-flow content (negative z-index, first child of body) — purely additive,
// doesn't touch any existing layout/typography/color.
const DOT_SPACING = 34;
const DOT_RADIUS = 1.1;
const CURSOR_RADIUS = 130;
const CURSOR_DISPLACEMENT = 3;
const BASE_ALPHA = 0.14;
const AMBIENT_AMPLITUDE = 0.12;
const AMBIENT_SPEED = 0.0007;
const CURSOR_ALPHA_BOOST = 0.55;
const DOT_COLOR = "0, 255, 133"; // matches --accent-green
const RIPPLE_RADIUS = 160;
const RIPPLE_DURATION = 700;

type Ripple = { x: number; y: number; start: number };

export default function MatrixField({ interactionEnabled = true }: { interactionEnabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let phases = new Float32Array(0);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999, active: false };
    const ripples: Ripple[] = [];
    let speedMultiplier = 1;
    let ampMultiplier = 1;
    let rafId = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / DOT_SPACING) + 1;
      rows = Math.ceil(height / DOT_SPACING) + 1;
      const count = cols * rows;
      const next = new Float32Array(count);
      for (let i = 0; i < count; i++) next[i] = Math.random() * Math.PI * 2;
      phases = next;
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);

      while (ripples.length && time - ripples[0].start > RIPPLE_DURATION) ripples.shift();

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const baseX = col * DOT_SPACING;
          const baseY = row * DOT_SPACING;
          let x = baseX;
          let y = baseY;
          let alpha = BASE_ALPHA;

          if (!reduceMotion) {
            alpha += AMBIENT_AMPLITUDE * ampMultiplier * (0.5 + 0.5 * Math.sin(time * AMBIENT_SPEED * speedMultiplier + phases[idx]));

            if (interactionEnabled && pointer.active) {
              const dx = baseX - pointer.x;
              const dy = baseY - pointer.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < CURSOR_RADIUS) {
                const influence = 1 - dist / CURSOR_RADIUS;
                alpha += influence * CURSOR_ALPHA_BOOST;
                const angle = Math.atan2(dy, dx);
                x += Math.cos(angle) * influence * CURSOR_DISPLACEMENT;
                y += Math.sin(angle) * influence * CURSOR_DISPLACEMENT;
              }
            }

            for (const r of ripples) {
              const age = (time - r.start) / RIPPLE_DURATION;
              const ringRadius = age * RIPPLE_RADIUS;
              const dist = Math.hypot(baseX - r.x, baseY - r.y);
              const band = Math.abs(dist - ringRadius);
              if (band < 22) {
                const strength = (1 - age) * (1 - band / 22);
                alpha += strength * 0.7;
              }
            }
          }

          ctx!.beginPath();
          ctx!.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${DOT_COLOR}, ${Math.min(alpha, 0.9)})`;
          ctx!.fill();
        }
      }
    }

    function loop(time: number) {
      draw(time);
      rafId = requestAnimationFrame(loop);
    }

    function handlePointerMove(e: PointerEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }
    function handlePointerLeave() {
      pointer.active = false;
    }
    function handleClick(e: MouseEvent) {
      if (!interactionEnabled) return;
      ripples.push({ x: e.clientX, y: e.clientY, start: performance.now() });
    }
    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (!reduceMotion) {
        rafId = requestAnimationFrame(loop);
      }
    }
    function handleMaxWarp(e: Event) {
      const active = (e as CustomEvent<{ active: boolean }>).detail?.active;
      speedMultiplier = active ? 5 : 1;
      ampMultiplier = active ? 1.8 : 1;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("click", handleClick);
    window.addEventListener("kb:maxwarp", handleMaxWarp);
    document.addEventListener("visibilitychange", handleVisibility);

    if (reduceMotion) {
      draw(0);
    } else {
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("kb:maxwarp", handleMaxWarp);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [interactionEnabled]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />;
}
