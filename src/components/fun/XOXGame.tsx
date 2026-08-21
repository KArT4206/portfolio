"use client";

import { useState } from "react";
import GameOverlay from "./GameOverlay";

type Cell = "X" | "O" | null;
type Difficulty = "EASY" | "NORMAL" | "HARD";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winner(board: Cell[]): Cell | "DRAW" | null {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every((c) => c) ? "DRAW" : null;
}

function minimax(board: Cell[], player: "X" | "O", depth = 0): { score: number; move: number | null } {
  const w = winner(board);
  if (w === "O") return { score: 10 - depth, move: null };
  if (w === "X") return { score: depth - 10, move: null };
  if (w === "DRAW") return { score: 0, move: null };

  const moves = board.map((c, i) => (c === null ? i : -1)).filter((i) => i !== -1);
  let best = player === "O" ? -Infinity : Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const next = [...board];
    next[move] = player;
    const { score } = minimax(next, player === "O" ? "X" : "O", depth + 1);
    if (player === "O" ? score > best : score < best) {
      best = score;
      bestMove = move;
    }
  }
  return { score: best, move: bestMove };
}

function computerMove(board: Cell[], difficulty: Difficulty): number {
  const empty = board.map((c, i) => (c === null ? i : -1)).filter((i) => i !== -1);
  if (difficulty === "EASY" || (difficulty === "NORMAL" && Math.random() < 0.5)) {
    return empty[Math.floor(Math.random() * empty.length)];
  }
  return minimax(board, "O").move ?? empty[0];
}

export default function XOXGame({ onClose }: { onClose: () => void }) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [vsComputer, setVsComputer] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [scoreX, setScoreX] = useState(0);
  const [scoreO, setScoreO] = useState(0);
  const [draws, setDraws] = useState(0);

  const result = winner(board);

  function play(index: number) {
    if (board[index] || result) return;
    const next = [...board];
    next[index] = turn;
    setBoard(next);

    const w = winner(next);
    if (w === "X") setScoreX((s) => s + 1);
    else if (w === "O") setScoreO((s) => s + 1);
    else if (w === "DRAW") setDraws((s) => s + 1);

    const nextTurn = turn === "X" ? "O" : "X";
    setTurn(nextTurn);

    if (!w && vsComputer && nextTurn === "O") {
      setTimeout(() => {
        setBoard((current) => {
          if (winner(current)) return current;
          const move = computerMove(current, difficulty);
          const withMove = [...current];
          withMove[move] = "O";
          const w2 = winner(withMove);
          if (w2 === "X") setScoreX((s) => s + 1);
          else if (w2 === "O") setScoreO((s) => s + 1);
          else if (w2 === "DRAW") setDraws((s) => s + 1);
          setTurn("X");
          return withMove;
        });
      }, 350);
    }
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setTurn("X");
  }

  return (
    <GameOverlay
      index="003"
      title="XOX"
      score={`X ${scoreX} — O ${scoreO} — DRAW ${draws}`}
      controls="CLICK A CELL — PLAY"
      onClose={onClose}
    >
      <div className="flex flex-wrap items-center gap-[10px]">
        <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-muted">
          <input
            type="checkbox"
            checked={vsComputer}
            onChange={(e) => {
              setVsComputer(e.target.checked);
              reset();
            }}
            className="h-3.5 w-3.5 accent-accent-green"
          />
          Vs Computer
        </label>
        {vsComputer && (
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="border border-border-dim bg-surface-2 px-[8px] py-[3px] font-mono text-[11px] uppercase tracking-[0.05em] text-foreground outline-none"
          >
            <option value="EASY">Easy</option>
            <option value="NORMAL">Normal</option>
            <option value="HARD">Hard</option>
          </select>
        )}
      </div>

      <div className="mx-auto mt-[15px] grid w-[220px] grid-cols-3 gap-[3px] bg-border-dim">
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            onClick={() => play(i)}
            data-cursor="PLAY"
            className="flex h-[68px] w-[68px] cursor-none items-center justify-center bg-black font-display text-3xl text-foreground hover:bg-surface-2"
          >
            {cell === "X" && <span className="text-accent-green">X</span>}
            {cell === "O" && <span className="text-accent-yellow">O</span>}
          </button>
        ))}
      </div>

      <div className="mt-[15px] flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.05em] text-muted">
          {result === "DRAW" ? "Draw." : result ? `${result} wins.` : `Turn: ${turn}`}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-border-dim px-[15px] py-[5px] font-mono text-[11px] uppercase tracking-[0.05em] hover:border-accent-yellow hover:text-accent-yellow"
        >
          Restart
        </button>
      </div>
    </GameOverlay>
  );
}
