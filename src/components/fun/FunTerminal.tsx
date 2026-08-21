"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GameOverlay from "./GameOverlay";

type TerminalData = {
  projects: { title: string; status: string; slug: string }[];
  research: { title: string; status: string }[];
  awards: { title: string; year: number | null }[];
};

const HELP_LINES = [
  "AVAILABLE COMMANDS:",
  "  help       — this list",
  "  about      — who I am",
  "  projects   — real published projects",
  "  research   — real published research",
  "  awards     — real published awards",
  "  github     — open the GitHub page",
  "  contact    — jump to the contact channel",
  "  games      — open the arcade",
  "  ghost      — summon the ghost",
  "  matrix     — pulse the background grid",
  "  clear      — clear this screen",
];

export default function FunTerminal({
  onClose,
  onOpenArcade,
  onSummonGhost,
  onPulseMatrix,
}: {
  onClose: () => void;
  onOpenArcade: () => void;
  onSummonGhost: () => void;
  onPulseMatrix: () => void;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<string[]>(["KARTHIK.B TERMINAL — type `help` to begin."]);
  const [input, setInput] = useState("");
  const dataRef = useRef<TerminalData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/fun/terminal")
      .then((r) => r.json())
      .then((d) => (dataRef.current = d))
      .catch(() => {});
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [lines]);

  function print(...newLines: string[]) {
    setLines((prev) => [...prev, ...newLines]);
  }

  function runCommand(raw: string) {
    const cmd = raw.trim().toLowerCase();
    print(`> ${raw}`);
    if (!cmd) return;

    switch (cmd) {
      case "help":
        print(...HELP_LINES);
        break;
      case "about":
        print("Karthik B — Full-Stack Engineer, AI/ML Researcher & Embedded Systems Builder.", "VIT Chennai, 2023–2027.");
        break;
      case "projects": {
        const p = dataRef.current?.projects ?? [];
        if (p.length === 0) print("No published projects loaded yet.");
        else print(...p.map((x, i) => `${String(i + 1).padStart(2, "0")}. ${x.title} — ${x.status}`));
        break;
      }
      case "research": {
        const r = dataRef.current?.research ?? [];
        if (r.length === 0) print("No published research loaded yet.");
        else print(...r.map((x, i) => `${String(i + 1).padStart(2, "0")}. ${x.title} — ${x.status}`));
        break;
      }
      case "awards": {
        const a = dataRef.current?.awards ?? [];
        if (a.length === 0) print("No published awards loaded yet.");
        else print(...a.map((x, i) => `${String(i + 1).padStart(2, "0")}. ${x.title}${x.year ? ` (${x.year})` : ""}`));
        break;
      }
      case "github":
        print("Opening /github ...");
        router.push("/github");
        onClose();
        break;
      case "contact":
        print("Jumping to transmission channel ...");
        router.push("/#contact");
        onClose();
        break;
      case "games":
        print("Opening arcade ...");
        onOpenArcade();
        break;
      case "ghost":
        print("...");
        onSummonGhost();
        break;
      case "matrix":
        print("Pulsing grid.");
        onPulseMatrix();
        break;
      case "clear":
        setLines([]);
        return;
      default:
        print(`Unknown command: ${cmd}. Type "help".`);
    }
  }

  return (
    <GameOverlay index="006" title="Terminal" onClose={onClose}>
      <div
        className="h-[280px] overflow-y-auto bg-black font-mono text-[12px] leading-[1.6] text-accent-green"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {l}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        className="mt-[10px] flex items-center gap-[8px] border-t border-border-dim pt-[10px]"
        onSubmit={(e) => {
          e.preventDefault();
          runCommand(input);
          setInput("");
        }}
      >
        <span className="font-mono text-accent-green">&gt;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none"
          autoComplete="off"
          spellCheck={false}
          placeholder="type a command..."
        />
      </form>
    </GameOverlay>
  );
}
