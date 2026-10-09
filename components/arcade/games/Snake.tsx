"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { sfx } from "@/lib/sound";
import { ARROW_KEYS, Board, KeyPad, Overlay, Panel, Pips, Stat, isStartKey, type Dir } from "../parts";
import type { GameProps } from "../types";
import { useHighScore } from "../useHighScore";

const COLS = 16;
const ROWS = 27;
const FOOD_GOAL = 10;
const TICK_MS = 110;

type Point = { x: number; y: number };
type Status = "idle" | "playing" | "paused" | "over" | "won";
type Game = { snake: Point[]; food: Point; eaten: number; status: Status };

const VECTORS: Record<Dir, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

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

export default function Snake({ onWin }: GameProps) {
  const [game, setGame] = useState<Game>(initialGame);
  const { best, submit } = useHighScore("snake");
  const dir = useRef<Dir>("up");
  const queued = useRef<Dir>("up");

  const start = useCallback(() => {
    if (game.status === "paused") {
      setGame((g) => ({ ...g, status: "playing" }));
      return;
    }
    dir.current = queued.current = "up";
    setGame({ ...initialGame, status: "playing" });
  }, [game.status]);

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

  // side effects of state transitions
  const prev = useRef(game);
  useEffect(() => {
    const before = prev.current;
    prev.current = game;
    if (game.eaten > before.eaten) sfx.score();
    if (game.status === before.status) return;
    if (game.status === "over") sfx.lose();
    if (game.status === "won") {
      sfx.win();
      onWin();
    }
    if (game.status === "over" || game.status === "won") submit(game.eaten);
  }, [game, onWin, submit]);

  // pause when the tab is hidden
  useEffect(() => {
    const onHide = () => document.hidden && setGame((g) => (g.status === "playing" ? { ...g, status: "paused" } : g));
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isStartKey(e) && game.status !== "playing") {
        e.preventDefault();
        start();
        return;
      }
      if ((e.key === "p" || e.key === "P") && (game.status === "playing" || game.status === "paused")) {
        setGame((g) => ({ ...g, status: g.status === "playing" ? "paused" : "playing" }));
        return;
      }
      const d = ARROW_KEYS[e.key];
      if (!d || game.status !== "playing") return;
      e.preventDefault();
      turn(d);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game.status, start, turn]);

  return (
    <>
      <Board
        aria-label="Snake board"
        className="grid"
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
            className="rounded-full bg-accent-green glow-accent-green [--glow-blur:12px] [--glow-spread:4px]"
          />
        )}
        {game.status !== "playing" && <Overlay status={game.status} onStart={start} />}
      </Board>

      <div className="flex flex-1 flex-col text-sm text-white">
        <Panel>
          <p>{"// use keyboard"}</p>
          <p>{"// arrows to play"}</p>
          <p>{"// enter to start"}</p>
          <KeyPad onPress={turn} />
        </Panel>

        <p className="mt-6 px-3">{"// food left"}</p>
        <Pips total={FOOD_GOAL} lit={FOOD_GOAL - game.eaten} className="mt-3 px-3" />
        <div className="mt-6 px-3 text-xs">
          <Stat label="best" value={best} />
        </div>
      </div>
    </>
  );
}
