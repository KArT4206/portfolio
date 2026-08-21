"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Original floating "explorer pod" — a small geometric capsule under two
 * balloons, drifting diagonally across the upper part of the screen. Not
 * a copy of any specific film's house; just an abstract floating craft.
 */
export default function ExplorerMascot({ enabled }: { enabled: boolean }) {
  const [crossing, setCrossing] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: 120 });
  const [message, setMessage] = useState<string | null>(null);
  const startY = useRef(120);

  useEffect(() => {
    if (!enabled) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timeoutId: ReturnType<typeof setTimeout>;
    function scheduleNext(delay: number) {
      timeoutId = setTimeout(() => {
        if (reduceMotion) {
          scheduleNext(60000);
          return;
        }
        startY.current = 80 + Math.random() * 160;
        setPos({ x: -100, y: startY.current });
        setCrossing(true);
        scheduleNext(60000 + Math.random() * 60000);
      }, delay);
    }
    scheduleNext(35000 + Math.random() * 25000);

    return () => clearTimeout(timeoutId);
  }, [enabled]);

  useEffect(() => {
    if (!crossing) return;
    const end = window.innerWidth + 100;
    let rafId = 0;
    let stopped = false;
    let t = 0;
    function step() {
      if (stopped) return;
      t += 1;
      setPos((prev) => {
        const nextX = prev.x + 1.1;
        const nextY = startY.current + Math.sin(t * 0.02) * 18;
        if (nextX >= end) {
          stopped = true;
          setCrossing(false);
          return { x: -100, y: startY.current };
        }
        return { x: nextX, y: nextY };
      });
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };
  }, [crossing]);

  if (!enabled || !crossing) return null;

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[110]" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} aria-hidden>
      <button
        type="button"
        data-cursor="PLAY"
        onClick={() => {
          setMessage("EXPLORATION MODE");
          setTimeout(() => setMessage(null), 1600);
        }}
        className="pointer-events-auto block cursor-none"
        aria-label="A tiny floating explorer pod"
      >
        <svg width="56" height="60" viewBox="0 0 56 60">
          <circle cx="16" cy="12" r="8" fill="none" stroke="#fcff76" strokeWidth="1.2" />
          <circle cx="34" cy="8" r="6" fill="none" stroke="#fcff76" strokeWidth="1.2" />
          <line x1="16" y1="20" x2="24" y2="34" stroke="#fcff76" strokeWidth="1" />
          <line x1="34" y1="14" x2="28" y2="34" stroke="#fcff76" strokeWidth="1" />
          <path d="M18,34 L38,34 L34,50 L22,50 Z" fill="rgba(0,255,133,0.08)" stroke="#00ff85" strokeWidth="1.5" />
          <circle cx="28" cy="41" r="3" fill="#00ff85" />
        </svg>
      </button>
      {message && (
        <span className="pointer-events-none absolute left-1/2 top-[-20px] -translate-x-1/2 whitespace-nowrap border border-accent-yellow bg-black px-[6px] py-[2px] font-mono text-[10px] uppercase tracking-[0.05em] text-accent-yellow">
          {message}
        </span>
      )}
    </div>
  );
}
