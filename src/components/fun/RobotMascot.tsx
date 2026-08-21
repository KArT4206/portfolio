"use client";

import { useEffect, useState } from "react";

/**
 * Original tiny "repair robot" — not WALL-E, just a boxy little bot on
 * treads. Wanders across the bottom of the screen occasionally, pauses
 * mid-crossing to "repair" a matrix dot (a brief glow), then leaves.
 */
export default function RobotMascot({ enabled }: { enabled: boolean }) {
  const [crossing, setCrossing] = useState(false);
  const [x, setX] = useState(-80);
  const [message, setMessage] = useState<string | null>(null);

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
        setCrossing(true);
        setX(-80);
        scheduleNext(45000 + Math.random() * 60000);
      }, delay);
    }
    scheduleNext(20000 + Math.random() * 20000);

    return () => clearTimeout(timeoutId);
  }, [enabled]);

  useEffect(() => {
    if (!crossing) return;
    const end = window.innerWidth + 80;
    let rafId = 0;
    let stopped = false;
    function step() {
      if (stopped) return;
      setX((prev) => {
        const next = prev + 1.6;
        if (next >= end) {
          stopped = true;
          setCrossing(false);
          return -80;
        }
        return next;
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
    <div
      className="pointer-events-none fixed bottom-[26px] left-0 z-[110]"
      style={{ transform: `translateX(${x}px)` }}
      aria-hidden
    >
      <button
        type="button"
        data-cursor="HELLO"
        onClick={() => {
          setMessage("beep.");
          setTimeout(() => setMessage(null), 1500);
        }}
        className="pointer-events-auto block cursor-none"
        aria-label="A small robot"
      >
        <svg width="40" height="36" viewBox="0 0 40 36">
          <rect x="8" y="10" width="24" height="18" rx="3" fill="rgba(97,0,255,0.12)" stroke="#7000ff" strokeWidth="1.5" />
          <circle cx="16" cy="18" r="2.5" fill="#fcff76" />
          <circle cx="24" cy="18" r="2.5" fill="#fcff76" />
          <rect x="14" y="23" width="12" height="2" fill="#7000ff" />
          <line x1="20" y1="10" x2="20" y2="4" stroke="#7000ff" strokeWidth="1.5" />
          <circle cx="20" cy="3" r="2" fill="#fcff76" />
          <rect x="4" y="28" width="8" height="4" fill="#7000ff" />
          <rect x="28" y="28" width="8" height="4" fill="#7000ff" />
        </svg>
      </button>
      {message && (
        <span className="pointer-events-none absolute left-1/2 top-[-20px] -translate-x-1/2 whitespace-nowrap border border-accent-field bg-black px-[6px] py-[2px] font-mono text-[10px] uppercase tracking-[0.05em] text-accent-field">
          {message}
        </span>
      )}
    </div>
  );
}
