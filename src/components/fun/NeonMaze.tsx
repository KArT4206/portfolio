"use client";

import { useEffect, useRef, useState } from "react";
import GameOverlay from "./GameOverlay";

// Original maze layout — a nested-ring design, not any existing game's map.
const MAZE = [
  "###########",
  "#.........#",
  "#.#######.#",
  "#.#.....#.#",
  "#.#.###.#.#",
  "#...#.#...#",
  "#.###.###.#",
  "#.........#",
  "###########",
];

const CELL = 26;
const ROWS = MAZE.length;
const COLS = MAZE[0].length;

type Point = { x: number; y: number };

function isWall(x: number, y: number): boolean {
  if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return true;
  return MAZE[y][x] === "#";
}

function openCells(): Point[] {
  const cells: Point[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!isWall(x, y)) cells.push({ x, y });
    }
  }
  return cells;
}

const ENEMY_STARTS: Point[] = [
  { x: 9, y: 1 },
  { x: 5, y: 7 },
];

const TOTAL_OPEN_CELLS = openCells().length;

export default function NeonMaze({ onClose }: { onClose: () => void }) {
  const [player, setPlayer] = useState<Point>({ x: 1, y: 1 });
  const [enemies, setEnemies] = useState<Point[]>(ENEMY_STARTS);
  const [collected, setCollected] = useState<Set<string>>(new Set(["1,1"]));
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [elapsed, setElapsed] = useState(0);

  const dirRef = useRef<Point>({ x: 0, y: 0 });
  const playerPosRef = useRef<Point>({ x: 1, y: 1 });

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp" || e.key === "w") dirRef.current = { x: 0, y: -1 };
      else if (e.key === "ArrowDown" || e.key === "s") dirRef.current = { x: 0, y: 1 };
      else if (e.key === "ArrowLeft" || e.key === "a") dirRef.current = { x: -1, y: 0 };
      else if (e.key === "ArrowRight" || e.key === "d") dirRef.current = { x: 1, y: 0 };
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    const speed = Math.max(140, 240 - level * 15);
    const interval = setInterval(() => {
      setElapsed((t) => t + 1);

      setPlayer((prev) => {
        const d = dirRef.current;
        const next = { x: prev.x + d.x, y: prev.y + d.y };
        const moved = !isWall(next.x, next.y) ? next : prev;
        playerPosRef.current = moved;

        setCollected((prevSet) => {
          const key = `${moved.x},${moved.y}`;
          if (prevSet.has(key)) return prevSet;
          const nextSet = new Set(prevSet);
          nextSet.add(key);
          if (nextSet.size >= TOTAL_OPEN_CELLS) {
            setStatus("won");
          }
          return nextSet;
        });

        return moved;
      });

      const p = playerPosRef.current;
      setEnemies((prev) =>
        prev.map((e) => {
          const options: Point[] = [
            { x: e.x + 1, y: e.y },
            { x: e.x - 1, y: e.y },
            { x: e.x, y: e.y + 1 },
            { x: e.x, y: e.y - 1 },
          ].filter((o) => !isWall(o.x, o.y));
          if (options.length === 0) return e;
          options.sort(
            (a, b) => Math.abs(a.x - p.x) + Math.abs(a.y - p.y) - (Math.abs(b.x - p.x) + Math.abs(b.y - p.y))
          );
          const choice = Math.random() < 0.75 ? options[0] : options[Math.floor(Math.random() * options.length)];
          if (choice.x === p.x && choice.y === p.y) setStatus("lost");
          return choice;
        })
      );
    }, speed);

    return () => clearInterval(interval);
  }, [status, level]);

  function restart(nextLevel = 1) {
    playerPosRef.current = { x: 1, y: 1 };
    setPlayer({ x: 1, y: 1 });
    setEnemies(ENEMY_STARTS);
    setCollected(new Set(["1,1"]));
    setStatus("playing");
    setElapsed(0);
    setLevel(nextLevel);
    dirRef.current = { x: 0, y: 0 };
  }

  return (
    <GameOverlay
      index="004"
      title="Neon Maze"
      score={`SCORE ${collected.size}/${TOTAL_OPEN_CELLS} · LEVEL ${level} · TIME ${elapsed}s`}
      controls="ARROW KEYS / WASD — MOVE"
      onClose={onClose}
    >
      <svg width={COLS * CELL} height={ROWS * CELL} className="mx-auto block border border-border-dim bg-black">
        {MAZE.map((row, y) =>
          [...row].map((c, x) =>
            c === "#" ? (
              <rect key={`${x}-${y}`} x={x * CELL} y={y * CELL} width={CELL} height={CELL} fill="#1a0014" stroke="#606060" strokeWidth={0.5} />
            ) : null
          )
        )}
        {openCells()
          .filter((c) => !collected.has(`${c.x},${c.y}`))
          .map((c) => (
            <circle key={`${c.x}-${c.y}`} cx={c.x * CELL + CELL / 2} cy={c.y * CELL + CELL / 2} r={3} fill="#fcff76" />
          ))}
        {enemies.map((e, i) => (
          <circle key={i} cx={e.x * CELL + CELL / 2} cy={e.y * CELL + CELL / 2} r={CELL / 2 - 3} fill="rgba(255,0,61,0.75)" />
        ))}
        <circle cx={player.x * CELL + CELL / 2} cy={player.y * CELL + CELL / 2} r={CELL / 2 - 3} fill="#00ff85" />
      </svg>

      {status !== "playing" && (
        <p className={`mt-[10px] text-center font-mono text-xs uppercase tracking-[0.05em] ${status === "won" ? "text-accent-green" : "text-accent-crimson"}`}>
          {status === "won" ? "Level cleared." : "Caught — game over."}
        </p>
      )}

      <div className="mt-[15px] flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-dim">Arrows / WASD to move</p>
        <button
          type="button"
          onClick={() => (status === "won" ? restart(level + 1) : restart(level))}
          className="rounded-full border border-border-dim px-[15px] py-[5px] font-mono text-[11px] uppercase tracking-[0.05em] hover:border-accent-yellow hover:text-accent-yellow"
        >
          {status === "won" ? "Next Level" : "Restart"}
        </button>
      </div>

      <div className="mt-[15px] grid grid-cols-3 gap-[5px] sm:hidden">
        <div />
        <button type="button" onClick={() => (dirRef.current = { x: 0, y: -1 })} className="border border-border-dim py-[10px] text-center">↑</button>
        <div />
        <button type="button" onClick={() => (dirRef.current = { x: -1, y: 0 })} className="border border-border-dim py-[10px] text-center">←</button>
        <button type="button" onClick={() => (dirRef.current = { x: 0, y: 1 })} className="border border-border-dim py-[10px] text-center">↓</button>
        <button type="button" onClick={() => (dirRef.current = { x: 1, y: 0 })} className="border border-border-dim py-[10px] text-center">→</button>
      </div>
    </GameOverlay>
  );
}
