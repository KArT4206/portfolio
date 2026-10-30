"use client";

import { useEffect, useRef, useState } from "react";
import { Gamepad2 } from "lucide-react";
import PixelBuddy, { type BuddyHandle } from "./PixelBuddy";
import Blackout from "./Blackout";
import GameOverlay from "./GameOverlay";
import XOXGame from "./XOXGame";
import SnakeGame from "./SnakeGame";
import NeonMaze from "./NeonMaze";
import CatchGhostGame from "./CatchGhostGame";
import FunTerminal from "./FunTerminal";
import type { SiteSettings } from "@/lib/siteSettings";

type GameId = "none" | "arcade-menu" | "xox" | "snake" | "maze" | "catch-ghost" | "terminal";

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
  const ghostRef = useRef<BuddyHandle>(null);

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

  if (!settings.funModeEnabled) return null;

  return (
    <>
      {settings.ghostEnabled && <PixelBuddy ref={ghostRef} />}
      <Blackout />

      {(settings.arcadeEnabled || settings.terminalEnabled) && (
        <button
          type="button"
          onClick={() => setActive("arcade-menu")}
          data-cursor="PLAY"
          aria-label="Fun"
          className="fixed bottom-[15px] right-[15px] z-[89] flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-black text-white mix-blend-difference transition-transform hover:scale-110"
        >
          <Gamepad2 size={14} />
        </button>
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
            <ArcadeTile
              label="Blackout"
              onClick={() => {
                close();
                window.dispatchEvent(new CustomEvent("kb:blackout"));
              }}
            />
            {settings.ghostEnabled && (
              <ArcadeTile
                label="Potty break"
                onClick={() => {
                  close();
                  window.dispatchEvent(new CustomEvent("kb:buddy-washroom"));
                }}
              />
            )}
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
      className="flex flex-col items-center gap-[8px] border border-border-dim bg-black p-[20px] transition-colors hover:border-accent-green hover:text-accent-green"
    >
      <Gamepad2 size={20} />
      <span className="font-mono text-[11px] uppercase tracking-[0.05em]">{label}</span>
    </button>
  );
}
