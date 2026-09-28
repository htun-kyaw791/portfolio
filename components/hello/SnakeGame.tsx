"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropleft, IoMdArrowDropright, IoMdArrowDropup } from "react-icons/io";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const COLS = 16;
const ROWS = 27;
const FOOD_GOAL = 10;
const TICK_MS = 110;

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";
type Status = "idle" | "playing" | "over" | "won";
type Game = { snake: Point[]; food: Point; eaten: number; status: Status };

const VECTORS: Record<Dir, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };
const KEYS: Record<string, Dir> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };

const START_SNAKE: Point[] = Array.from({ length: 6 }, (_, i) => ({ x: 7, y: 16 + i }));
const initialGame: Game = { snake: START_SNAKE, food: { x: 8, y: 6 }, eaten: 0, status: "idle" };

function randomFood(snake: Point[]): Point {
  while (true) {
    const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}

function step(game: Game, dir: Dir): Game {
  const head = game.snake[0];
  const next = { x: head.x + VECTORS[dir].x, y: head.y + VECTORS[dir].y };
  const hitWall = next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS;
  const hitSelf = game.snake.slice(0, -1).some((s) => s.x === next.x && s.y === next.y);
  if (hitWall || hitSelf) return { ...game, status: "over" };

  const ate = next.x === game.food.x && next.y === game.food.y;
  const snake = [next, ...(ate ? game.snake : game.snake.slice(0, -1))];
  if (!ate) return { ...game, snake };

  const eaten = game.eaten + 1;
  return { snake, eaten, food: randomFood(snake), status: eaten >= FOOD_GOAL ? "won" : "playing" };
}

function Key({ dir, onPress, children }: { dir: Dir; onPress: (d: Dir) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={dir}
      onClick={() => onPress(dir)}
      className="flex h-7 w-12 items-center justify-center rounded-lg border border-line bg-bg-deep text-white transition-colors hover:bg-btn"
    >
      {children}
    </button>
  );
}

function Bolt({ className }: { className: string }) {
  return <span className={`absolute size-4 rounded-full bg-[radial-gradient(#196c6a,#114b4a)] shadow-inner ${className}`} />;
}

export default function SnakeGame() {
  const [game, setGame] = useState<Game>(initialGame);
  const dir = useRef<Dir>("up");
  const queued = useRef<Dir>("up");

  const start = useCallback(() => {
    dir.current = queued.current = "up";
    setGame({ ...initialGame, status: "playing" });
  }, []);

  const turn = useCallback((d: Dir) => {
    if (d !== OPPOSITE[dir.current]) queued.current = d;
  }, []);

  useEffect(() => {
    if (game.status !== "playing") return;
    const id = setInterval(() => {
      dir.current = queued.current;
      setGame((g) => step(g, dir.current));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [game.status]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Enter/Space start a round, unless focus is on a control that handles them itself.
      if ((e.key === "Enter" || e.key === " ") && game.status !== "playing" && e.target === document.body) {
        e.preventDefault();
        start();
        return;
      }
      const d = KEYS[e.key];
      if (!d || game.status !== "playing") return;
      e.preventDefault();
      turn(d);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game.status, start, turn]);

  return (
    <div className="relative flex w-[510px] gap-6 rounded-lg border border-black/30 bg-[linear-gradient(150deg,rgba(23,85,83,0.7)_1.7%,rgba(67,217,173,0.09)_81.82%)] p-8 shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] backdrop-blur-2xl">
      <Bolt className="left-3 top-3" />
      <Bolt className="right-3 top-3" />
      <Bolt className="bottom-3 left-3" />
      <Bolt className="bottom-3 right-3" />

      {/* board */}
      <div
        className="relative grid h-[405px] w-[240px] rounded-lg bg-bg/85 shadow-[inset_1px_5px_11px_rgba(2,18,27,0.71)]"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
      >
        {game.snake.map((s, i) => (
          <span
            key={i}
            style={{ gridColumn: s.x + 1, gridRow: s.y + 1, opacity: Math.max(0.15, 1 - i * (0.85 / game.snake.length)) }}
            className={cn("bg-accent-green", i === 0 && "rounded-t-md")}
          />
        ))}
        {game.status !== "won" && (
          <span
            style={{ gridColumn: game.food.x + 1, gridRow: game.food.y + 1 }}
            className="rounded-full bg-accent-green shadow-[0_0_12px_4px_rgba(67,217,173,0.5)]"
          />
        )}

        {game.status !== "playing" && (
          <div className="absolute inset-x-0 bottom-16 flex flex-col items-center gap-3">
            {game.status === "over" && <p className="w-full bg-bg-deep/80 py-2 text-center text-xl text-accent-green">GAME OVER!</p>}
            {game.status === "won" && <p className="w-full bg-bg-deep/80 py-2 text-center text-xl text-accent-green">WELL DONE!</p>}
            <Button variant={game.status === "idle" ? "primary" : "ghost"} onClick={start}>
              {game.status === "idle" ? "start-game" : "play-again"}
            </Button>
          </div>
        )}
      </div>

      {/* controls */}
      <div className="flex flex-1 flex-col text-sm text-white">
        <div className="rounded-lg bg-bg-deep/20 p-3">
          <p>{"// use keyboard"}</p>
          <p>{"// arrows to play"}</p>
          <p>{"// enter to start"}</p>
          <div className="mt-4 flex flex-col items-center gap-1">
            <Key dir="up" onPress={turn}><IoMdArrowDropup /></Key>
            <div className="flex gap-1">
              <Key dir="left" onPress={turn}><IoMdArrowDropleft /></Key>
              <Key dir="down" onPress={turn}><IoMdArrowDropdown /></Key>
              <Key dir="right" onPress={turn}><IoMdArrowDropright /></Key>
            </div>
          </div>
        </div>

        <p className="mt-6 px-3">{"// food left"}</p>
        <div className="mt-3 grid grid-cols-5 gap-4 px-3">
          {Array.from({ length: FOOD_GOAL }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-2.5 rounded-full bg-accent-green",
                i < FOOD_GOAL - game.eaten ? "shadow-[0_0_8px_2px_rgba(67,217,173,0.5)]" : "opacity-20",
              )}
            />
          ))}
        </div>

        <Link
          href="/about-me"
          className="mt-auto self-end rounded-lg border border-white px-4 py-2.5 text-sm transition-colors hover:border-white/50"
        >
          skip
        </Link>
      </div>
    </div>
  );
}
