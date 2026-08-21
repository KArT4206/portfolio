"use client";

import { useEffect, useRef, useState } from "react";
import { Gamepad2 } from "lucide-react";
import Ghost, { type GhostHandle } from "./Ghost";
import RobotMascot from "./RobotMascot";
import ExplorerMascot from "./ExplorerMascot";
import GameOverlay from "./GameOverlay";
import XOXGame from "./XOXGame";
import SnakeGame from "./SnakeGame";
import NeonMaze from "./NeonMaze";
import CatchGhostGame from "./CatchGhostGame";
import FunTerminal from "./FunTerminal";
import type { SiteSettings } from "@/lib/siteSettings";

type GameId = "none" | "arcade-menu" | "xox" | "snake" | "maze" | "catch-ghost" | "terminal";

const IDLE_TIMEOUT = 26000;

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/**
 * Orchestrates the whole optional "hidden fun world" layer: mascots, the
 * arcade, the terminal, and idle-triggered ambient events. Fully gated by
 * SiteSettings — Admin can disable any piece (or all of it) without a code
 * change. Mounted once, alongside the existing HUD components, in the
 * (site) layout.
 */
export default function FunSystem({ settings }: { settings: SiteSettings }) {
  const [active, setActive] = useState<GameId>("none");
  const [ghostFollowMode, setGhostFollowMode] = useState(false);
  const [idleMessage, setIdleMessage] = useState<string | null>(null);
  const ghostRef = useRef<GhostHandle>(null);

  const close = () => setActive("none");

  // Discover GitHub open -> celebrate; light, best-effort observer rather
  // than threading a callback through the existing Navbar/RepoExplorer.
  useEffect(() => {
    if (!settings.ghostEnabled) return;
    function handleClick(e: MouseEvent) {
      const link = (e.target as HTMLElement)?.closest?.('a[href*="github.com"], a[href="/github"]');
      if (link) ghostRef.current?.celebrate();
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [settings.ghostEnabled]);

  // Hidden keyboard shortcut: backtick opens the terminal.
  useEffect(() => {
    if (!settings.terminalEnabled) return;
    function handleKey(e: KeyboardEvent) {
      if (isTyping(e.target)) return;
      if (e.key === "`") {
        e.preventDefault();
        setActive((a) => (a === "terminal" ? "none" : "terminal"));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [settings.terminalEnabled]);

  // Lets other components (e.g. the Hero "Open Terminal" button) request the
  // terminal without prop-drilling — same cross-component pattern as maxwarp.
  useEffect(() => {
    if (!settings.terminalEnabled) return;
    function handleOpenTerminal() {
      setActive("terminal");
    }
    window.addEventListener("kb:open-terminal", handleOpenTerminal);
    return () => window.removeEventListener("kb:open-terminal", handleOpenTerminal);
  }, [settings.terminalEnabled]);

  // Idle event manager: resets on any real interaction, fires one small
  // ambient event after ~26s of inactivity.
  useEffect(() => {
    if (!settings.idleEventsEnabled) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timeoutId: ReturnType<typeof setTimeout>;

    function fireIdleEvent() {
      const options: (() => void)[] = [];
      if (settings.ghostEnabled) {
        options.push(() => {
          ghostRef.current?.becomeCurious();
          setIdleMessage("still there?");
          setTimeout(() => setIdleMessage(null), 3200);
        });
      }
      options.push(() => {
        setIdleMessage("GRID CALIBRATED");
        setTimeout(() => setIdleMessage(null), 2200);
      });
      if (options.length > 0) options[Math.floor(Math.random() * options.length)]();
      reset();
    }

    function reset() {
      clearTimeout(timeoutId);
      if (reduceMotion) return;
      timeoutId = setTimeout(fireIdleEvent, IDLE_TIMEOUT);
    }

    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((evt) => window.addEventListener(evt, reset, { passive: true }));
    reset();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, reset));
    };
  }, [settings.idleEventsEnabled, settings.ghostEnabled]);

  if (!settings.funModeEnabled) return null;

  return (
    <>
      {settings.ghostEnabled && (
        <Ghost ref={ghostRef} enabled followMode={ghostFollowMode} onToggleFollow={() => setGhostFollowMode((v) => !v)} />
      )}
      {settings.robotEnabled && <RobotMascot enabled />}
      {settings.explorerEnabled && <ExplorerMascot enabled />}

      {(settings.arcadeEnabled || settings.terminalEnabled) && (
        <button
          type="button"
          onClick={() => setActive("arcade-menu")}
          data-cursor="PLAY"
          aria-label="Fun"
          className="fixed bottom-[15px] right-[15px] z-[100] flex h-[26px] w-[26px] cursor-none items-center justify-center"
        >
          <span className="hud-live-dot absolute h-full w-full rounded-full border border-accent-green/70" />
          <span className="h-[10px] w-[10px] rounded-full bg-accent-green shadow-[0_0_8px_2px_rgba(74,222,128,0.7)] transition-transform hover:scale-125" />
        </button>
      )}

      {idleMessage && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-[15px] left-1/2 z-[280] -translate-x-1/2 border border-accent-green bg-black px-[15px] py-[8px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green"
        >
          {idleMessage}
        </div>
      )}

      {active === "arcade-menu" && (
        <GameOverlay index="000" title="Arcade" onClose={close}>
          <div className="grid grid-cols-2 gap-[10px]">
            {settings.arcadeEnabled && (
              <>
                <ArcadeTile label="Snake" onClick={() => setActive("snake")} />
                <ArcadeTile label="Neon Maze" onClick={() => setActive("maze")} />
                <ArcadeTile label="XOX" onClick={() => setActive("xox")} />
                <ArcadeTile label="Catch the Ghost" onClick={() => setActive("catch-ghost")} />
              </>
            )}
            {settings.terminalEnabled && <ArcadeTile label="Terminal" onClick={() => setActive("terminal")} />}
          </div>
        </GameOverlay>
      )}
      {active === "xox" && <XOXGame onClose={close} />}
      {active === "snake" && <SnakeGame onClose={close} />}
      {active === "maze" && <NeonMaze onClose={close} />}
      {active === "catch-ghost" && <CatchGhostGame onClose={close} />}
      {active === "terminal" && (
        <FunTerminal
          onClose={close}
          onOpenArcade={() => setActive("arcade-menu")}
          onSummonGhost={() => ghostRef.current?.becomeCurious()}
          onPulseMatrix={() => window.dispatchEvent(new CustomEvent("kb:maxwarp", { detail: { active: true } }))}
        />
      )}
    </>
  );
}

function ArcadeTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="PLAY"
      className="flex cursor-none flex-col items-center gap-[8px] border border-border-dim bg-black p-[20px] transition-colors hover:border-accent-green hover:text-accent-green"
    >
      <Gamepad2 size={20} />
      <span className="font-mono text-[11px] uppercase tracking-[0.05em]">{label}</span>
    </button>
  );
}
