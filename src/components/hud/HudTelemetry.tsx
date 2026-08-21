"use client";

import { useEffect, useState } from "react";

/**
 * Fixed-corner readout strip. The clock is real (updates every second from
 * the visitor's own system time); the coordinates are a real, static fact
 * (Chennai, India — not a live GPS feed). Neither claims to be monitoring
 * anything — this is presentation, and is labeled plainly so it's never
 * mistaken for real telemetry.
 */
export default function HudTelemetry() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 z-40 hidden select-none px-[15px] py-[8px] font-mono text-[10px] uppercase tracking-[0.08em] text-dim md:block"
      aria-hidden
    >
      <span>13.0827°N 80.2707°E</span>
      <span className="mx-[10px] text-border-dim">/</span>
      <span>CHENNAI, IN</span>
      {time && (
        <>
          <span className="mx-[10px] text-border-dim">/</span>
          <span className="tabular-nums">{time} IST</span>
        </>
      )}
    </div>
  );
}
