const MODULES = ["AI", "FS", "SEC", "EMB", "RES"];

/**
 * Compact status-dot strip — a legend of focus domains, not a live-monitoring
 * feed. Modeled loosely on the GT Planar reference's top-bar module readout,
 * rebuilt with our own tokens; every dot is simply "on" since all five are
 * genuinely active focus areas, so there's nothing here to misrepresent.
 */
export default function HudModuleStatus() {
  return (
    <div className="flex items-center gap-[15px] font-mono text-[10px] uppercase tracking-[0.05em] text-dim">
      {MODULES.map((m) => (
        <span key={m} className="inline-flex items-center gap-[5px]">
          <span className="hud-module-dot" />
          {m}
        </span>
      ))}
    </div>
  );
}
