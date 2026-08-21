const STATS = [
  { key: "focus", label: "Focus" },
  { key: "caffeine", label: "Caffeine" },
  { key: "curiosity", label: "Curiosity" },
  { key: "debug-streak", label: "Debug Streak" },
  { key: "chill", label: "Chill" },
] as const;

/**
 * Playful, honestly-labeled easter egg — gauge bars that idle through
 * staggered stepped animations, not a readout of anything real. Inspired
 * by the GT Planar reference's "pilot status" HUD widget, rebuilt here
 * from scratch with our own tokens and keyframes (no reference assets).
 */
export default function PilotStatus() {
  return (
    <div className="section-frame bg-black p-[15px] sm:p-[25px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green">
          Pilot Status
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-dim">Simulated / for fun</p>
      </div>

      <div className="mt-[15px] grid gap-[15px] sm:grid-cols-2">
        {STATS.map((stat) => (
          <div key={stat.key}>
            <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted">{stat.label}</p>
            <div className="pilot-stat-track mt-[5px]">
              <div className={`pilot-stat-fill pilot-stat-fill--${stat.key}`} aria-hidden />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
