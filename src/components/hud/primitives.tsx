import type { ReactNode } from "react";

/**
 * Core HUD design-system primitives. Everything cockpit-flavored in this
 * portfolio should compose from these instead of growing bespoke markup —
 * that's what keeps "instrument panel" from turning into a pile of
 * one-off components. Original implementation: shape/behavior only, no
 * code, assets, or fonts taken from any reference site.
 */

// ---------- Structure ----------

/** A bordered instrument panel — the base container for any HUD module. */
export function HudFrame({
  children,
  className = "",
  inset = false,
}: {
  children: ReactNode;
  className?: string;
  inset?: boolean;
}) {
  return <div className={`${inset ? "inset-frame" : "section-frame"} bg-black ${className}`}>{children}</div>;
}

/** Small corner tick marks, like a viewfinder — purely decorative framing. */
export function HudWireframe({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute -left-px -top-px h-[6px] w-[6px] border-l border-t border-accent-yellow" />
      <span className="pointer-events-none absolute -right-px -top-px h-[6px] w-[6px] border-r border-t border-accent-yellow" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-[6px] w-[6px] border-b border-l border-accent-yellow" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-[6px] w-[6px] border-b border-r border-accent-yellow" />
      {children}
    </div>
  );
}

/** A hairline rule, matching the border-as-architecture system. */
export function HudDivider({ vertical = false, className = "" }: { vertical?: boolean; className?: string }) {
  return (
    <div
      className={`${vertical ? "w-px self-stretch" : "h-px w-full"} bg-border-dim ${className}`}
      aria-hidden
    />
  );
}

// ---------- Typography / labeling ----------

/** Small uppercase mono caption — the interface's primary label type. */
export function HudLabel({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: "muted" | "dim" | "yellow" | "green";
  className?: string;
}) {
  const toneClass = {
    muted: "text-muted",
    dim: "text-dim",
    yellow: "text-accent-yellow",
    green: "text-accent-green",
  }[tone];
  return (
    <span className={`font-mono text-[11px] uppercase tracking-[0.1em] ${toneClass} ${className}`}>
      {children}
    </span>
  );
}

/** "03 /" numbered index prefix, used for nav, modules, and lists alike. */
export function HudIndex({ n, className = "" }: { n: number | string; className?: string }) {
  const label = typeof n === "number" ? String(n).padStart(2, "0") : n;
  return <span className={`font-mono text-[10px] text-dim ${className}`}>{label} /</span>;
}

/** Static coordinate/fact readout, e.g. geolocation — never a live feed. */
export function HudCoordinates({ value, className = "" }: { value: string; className?: string }) {
  return <span className={`font-mono text-[10px] uppercase tracking-[0.08em] text-dim ${className}`}>{value}</span>;
}

// ---------- Status ----------

type StatusTone = "on" | "off" | "warn";

const STATUS_DOT_CLASS: Record<StatusTone, string> = {
  on: "bg-accent-green",
  off: "bg-dim",
  warn: "bg-accent-crimson",
};

/** A single status dot — the atom every status/module indicator is built from. */
export function HudIndicator({ tone = "on", live = false }: { tone?: StatusTone; live?: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[tone]} ${live ? "hud-live-dot" : ""}`}
      aria-hidden
    />
  );
}

/**
 * A labeled status line, e.g. "SYSTEM ONLINE". `live` ties the dot to a
 * real, checked condition (pulses); otherwise it's a static presentational
 * dot — never claim monitoring that isn't actually happening.
 */
export function HudStatus({
  label,
  tone = "on",
  live = false,
}: {
  label: string;
  tone?: StatusTone;
  live?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
      <HudIndicator tone={tone} live={live} />
      {label}
    </span>
  );
}

// ---------- Data ----------

/** A label/value data readout pair, e.g. in the Hero stat grid. */
export function HudReadout({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`bg-black p-[10px] ${className}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-dim">{label}</p>
      <p className="mt-[3px] font-mono text-xs text-accent-yellow">{value}</p>
    </div>
  );
}

/**
 * A segmented gauge bar. `value`/`max` drive the fill for real metrics
 * (project count, skill count, ...); `decorative` renders the same look
 * for a value that isn't a measured quantity, and is labeled as such.
 */
export function HudGauge({
  label,
  value,
  max,
  display,
  decorative = false,
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  decorative?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <HudLabel>{label}</HudLabel>
        {decorative && <span className="font-mono text-[9px] uppercase tracking-[0.05em] text-dim">decorative</span>}
      </div>
      <div className="pilot-stat-track mt-[5px]">
        <div className="pilot-stat-fill-static h-full bg-accent-green" style={{ width: `${pct}%` }} aria-hidden />
      </div>
      <p className="mt-[5px] font-mono text-sm tabular-nums text-foreground">{display}</p>
    </div>
  );
}

/** A live/blinking dot, standalone — for small "active now" markers. */
export function HudSignal({ tone = "on" }: { tone?: StatusTone }) {
  return <HudIndicator tone={tone} live />;
}

/** Terminal-style bordered container, for the contact channel and similar. */
export function HudTerminal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`section-frame bg-black p-[15px] sm:p-[25px] ${className}`}>{children}</div>;
}

/**
 * A full module block: index + label header, hairline-divided from its
 * body. Used for research papers, awards, mission briefs, etc.
 */
export function HudModule({
  index,
  title,
  status,
  children,
  className = "",
}: {
  index: number | string;
  title: string;
  status?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <HudFrame className={`p-[15px] sm:p-[25px] ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <HudLabel tone="dim">
          <HudIndex n={index} /> {title}
        </HudLabel>
        {status && <HudLabel tone="yellow">{status}</HudLabel>}
      </div>
      <div className="mt-[10px]">{children}</div>
    </HudFrame>
  );
}
