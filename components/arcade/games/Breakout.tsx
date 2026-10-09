"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sound";
import { useAnimationFrame } from "@/lib/useAnimationFrame";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useThemeColors, type ThemeColors } from "@/lib/useThemeColors";
import type { TechType } from "@/lib/taxonomy";
import { BOARD_H, BOARD_W, Board, KeyPad, Overlay, Panel, Pips, Stat, isStartKey, monoFont, setupCanvas } from "../parts";
import type { ArcadeTech, GameProps } from "../types";
import { useHighScore } from "../useHighScore";

// "Stack Smash": breakout where every brick is something from the tech stack.

const COLS = 3;
const MAX_ROWS = 7;
const MARGIN = 8;
const GAP = 4;
const BRICK_W = (BOARD_W - MARGIN * 2 - GAP * (COLS - 1)) / COLS;
const BRICK_H = 18;
const TOP = 36;
const PADDLE_W = 52;
const PADDLE_H = 6;
const PADDLE_Y = BOARD_H - 26;
const PADDLE_SPEED = 320;
const BALL_R = 4;
const SPEED_START = 210;
const SPEED_MAX = 330;
const LIVES = 3;

type Status = "idle" | "playing" | "paused" | "over" | "won";
type Brick = { x: number; y: number; title: string; colour: keyof ThemeColors; alive: boolean };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; colour: keyof ThemeColors };

const TYPE_COLOUR: Record<TechType, keyof ThemeColors> = {
  language: "orange",
  framework: "green",
  library: "indigo",
  database: "purple",
  "apis-integration": "coral",
  devops: "orange",
  "development-tool": "green",
  "workflow-methodology": "indigo",
};

function buildBricks(technos: readonly ArcadeTech[]): Brick[] {
  const picked = technos.slice(0, COLS * MAX_ROWS);
  return picked.map((t, i) => ({
    x: MARGIN + (i % COLS) * (BRICK_W + GAP),
    y: TOP + Math.floor(i / COLS) * (BRICK_H + GAP),
    title: t.title,
    colour: TYPE_COLOUR[t.type] ?? "green",
    alive: true,
  }));
}

export default function Breakout({ technos, onWin }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fontRef = useRef("monospace");
  const colours = useThemeColors();
  const reduced = useReducedMotion();
  const { best, submit } = useHighScore("breakout");

  const [status, setStatus] = useState<Status>("idle");
  const [lives, setLives] = useState(LIVES);
  const [score, setScore] = useState(0);
  const [smashed, setSmashed] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(() => Math.min(technos.length, COLS * MAX_ROWS));

  // mutable world; React state only mirrors what the side panel shows
  const world = useRef({
    bricks: buildBricks(technos),
    paddleX: BOARD_W / 2,
    ball: { x: BOARD_W / 2, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0, stuck: true },
    speed: SPEED_START,
    particles: [] as Particle[],
    keys: { left: false, right: false },
    serveAt: 0,
    score: 0,
    lives: LIVES,
  });

  const reset = useCallback(() => {
    const w = world.current;
    w.bricks = buildBricks(technos);
    w.paddleX = BOARD_W / 2;
    w.ball = { x: BOARD_W / 2, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0, stuck: true };
    w.speed = SPEED_START;
    w.particles = [];
    w.score = 0;
    w.lives = LIVES;
    w.serveAt = performance.now() + 500;
    setScore(0);
    setLives(LIVES);
    setSmashed(null);
    setRemaining(w.bricks.length);
  }, [technos]);

  const start = useCallback(() => {
    if (status === "paused") {
      setStatus("playing");
      return;
    }
    reset();
    setStatus("playing");
  }, [status, reset]);

  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const w = world.current;
    ctx.clearRect(0, 0, BOARD_W, BOARD_H);

    // bricks
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const b of w.bricks) {
      if (!b.alive) continue;
      const c = colours[b.colour];
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 4);
      ctx.fill();
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = c;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = c;
      let size = 10;
      ctx.font = `${size}px ${fontRef.current}`;
      while (ctx.measureText(b.title).width > BRICK_W - 6 && size > 7) {
        size -= 1;
        ctx.font = `${size}px ${fontRef.current}`;
      }
      ctx.fillText(b.title, b.x + BRICK_W / 2, b.y + BRICK_H / 2 + 0.5, BRICK_W - 6);
    }

    // particles
    for (const p of w.particles) {
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = colours[p.colour];
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.globalAlpha = 1;

    // paddle
    ctx.fillStyle = colours.light;
    ctx.beginPath();
    ctx.roundRect(w.paddleX - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H, 3);
    ctx.fill();

    // ball
    ctx.shadowColor = colours.green;
    ctx.shadowBlur = 12;
    ctx.fillStyle = colours.green;
    ctx.beginPath();
    ctx.arc(w.ball.x, w.ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [colours]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = setupCanvas(canvas);
    fontRef.current = monoFont();
    draw();
  }, [draw]);

  const update = useCallback(
    (dt: number) => {
      const w = world.current;
      const ball = w.ball;

      // paddle
      const dir = (w.keys.right ? 1 : 0) - (w.keys.left ? 1 : 0);
      w.paddleX = Math.min(BOARD_W - PADDLE_W / 2, Math.max(PADDLE_W / 2, w.paddleX + dir * PADDLE_SPEED * dt));

      // serve
      if (ball.stuck) {
        ball.x = w.paddleX;
        ball.y = PADDLE_Y - BALL_R - 1;
        if (performance.now() >= w.serveAt) {
          const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 0.8;
          ball.vx = Math.cos(angle) * w.speed;
          ball.vy = Math.sin(angle) * w.speed;
          ball.stuck = false;
        }
      } else {
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // walls
        if (ball.x < BALL_R) {
          ball.x = BALL_R;
          ball.vx = Math.abs(ball.vx);
          sfx.hit();
        } else if (ball.x > BOARD_W - BALL_R) {
          ball.x = BOARD_W - BALL_R;
          ball.vx = -Math.abs(ball.vx);
          sfx.hit();
        }
        if (ball.y < BALL_R) {
          ball.y = BALL_R;
          ball.vy = Math.abs(ball.vy);
          sfx.hit();
        }

        // paddle: bounce angle depends on where it hits
        if (
          ball.vy > 0 &&
          ball.y + BALL_R >= PADDLE_Y &&
          ball.y - BALL_R <= PADDLE_Y + PADDLE_H &&
          Math.abs(ball.x - w.paddleX) <= PADDLE_W / 2 + BALL_R
        ) {
          const hit = Math.max(-1, Math.min(1, (ball.x - w.paddleX) / (PADDLE_W / 2)));
          const angle = -Math.PI / 2 + hit * (Math.PI / 3);
          w.speed = Math.min(SPEED_MAX, w.speed + 4);
          ball.vx = Math.cos(angle) * w.speed;
          ball.vy = Math.sin(angle) * w.speed;
          ball.y = PADDLE_Y - BALL_R;
          sfx.hit();
        }

        // bricks: resolve the first overlap along the axis of least penetration
        for (let i = 0; i < w.bricks.length; i++) {
          const b = w.bricks[i];
          if (!b.alive) continue;
          const nx = Math.max(b.x, Math.min(ball.x, b.x + BRICK_W));
          const ny = Math.max(b.y, Math.min(ball.y, b.y + BRICK_H));
          if ((ball.x - nx) ** 2 + (ball.y - ny) ** 2 > BALL_R ** 2) continue;

          w.bricks[i] = { ...b, alive: false };
          const overlapX = Math.min(ball.x + BALL_R - b.x, b.x + BRICK_W - (ball.x - BALL_R));
          const overlapY = Math.min(ball.y + BALL_R - b.y, b.y + BRICK_H - (ball.y - BALL_R));
          if (overlapX < overlapY) ball.vx = -ball.vx;
          else ball.vy = -ball.vy;

          w.score += 10;
          setScore(w.score);
          setSmashed(b.title);
          setRemaining(w.bricks.filter((x) => x.alive).length);
          sfx.score();
          if (!reduced) {
            for (let i = 0; i < 14; i++) {
              const a = Math.random() * Math.PI * 2;
              const s = 30 + Math.random() * 90;
              w.particles.push({ x: b.x + BRICK_W / 2, y: b.y + BRICK_H / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, colour: b.colour });
            }
          }
          if (w.bricks.every((x) => !x.alive)) {
            submit(w.score + w.lives * 50);
            setScore(w.score + w.lives * 50);
            setStatus("won");
            sfx.win();
            onWin();
          }
          break;
        }

        // lost the ball
        if (ball.y - BALL_R > BOARD_H) {
          w.lives -= 1;
          setLives(w.lives);
          sfx.lose();
          if (w.lives <= 0) {
            submit(w.score);
            setStatus("over");
          } else {
            ball.stuck = true;
            w.speed = Math.max(SPEED_START, w.speed - 30);
            w.serveAt = performance.now() + 700;
          }
        }
      }

      // particles
      w.particles = w.particles
        .map((p) => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt, vy: p.vy + 160 * dt, life: p.life - dt * 1.6 }))
        .filter((p) => p.life > 0);

      draw();
    },
    [draw, onWin, reduced, submit],
  );

  useAnimationFrame(update, status === "playing");

  // keyboard: hold arrows / A-D to move; P pauses
  useEffect(() => {
    const w = world.current;
    function onKey(e: KeyboardEvent) {
      const down = e.type === "keydown";
      if (down && isStartKey(e) && status !== "playing") {
        e.preventDefault();
        start();
        return;
      }
      if (down && (e.key === "p" || e.key === "P") && (status === "playing" || status === "paused")) {
        setStatus(status === "playing" ? "paused" : "playing");
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") w.keys.left = down;
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") w.keys.right = down;
      else return;
      if (status === "playing") e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [status, start]);

  useEffect(() => {
    const onHide = () => document.hidden && setStatus((s) => (s === "playing" ? "paused" : s));
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  // mouse / touch: paddle follows the pointer over the board
  function onPointerMove(e: React.PointerEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * BOARD_W;
    world.current.paddleX = Math.min(BOARD_W - PADDLE_W / 2, Math.max(PADDLE_W / 2, x));
  }

  const nudge = (d: "left" | "right") => {
    const w = world.current;
    w.paddleX = Math.min(BOARD_W - PADDLE_W / 2, Math.max(PADDLE_W / 2, w.paddleX + (d === "left" ? -28 : 28)));
    if (status !== "playing") draw();
  };

  return (
    <>
      <Board onPointerMove={onPointerMove} onPointerDown={onPointerMove} className="touch-none">
        <canvas ref={canvasRef} aria-label="Stack Smash board" role="img" style={{ width: BOARD_W, height: BOARD_H }} />
        {status !== "playing" && (
          <Overlay
            status={status}
            onStart={start}
            message={status === "won" ? "STACK SMASHED!" : undefined}
            detail={status === "won" || status === "over" ? `score ${score} · best ${Math.max(best, score)}` : undefined}
          />
        )}
      </Board>

      <div className="flex flex-1 flex-col text-sm text-white">
        <Panel>
          <p>{"// mouse, touch or"}</p>
          <p>{"// ← → to move"}</p>
          <p>{"// enter to start"}</p>
          <KeyPad only="horizontal" onPress={(d) => (d === "left" || d === "right") && nudge(d)} />
        </Panel>

        <p className="mt-6 px-3">{"// lives"}</p>
        <Pips total={LIVES} lit={lives} className="mt-3 px-3" />

        <div className="mt-6 space-y-1 px-3 text-xs">
          <Stat label="score" value={score} />
          <Stat label="bricks" value={remaining} />
          <Stat label="best" value={best} />
        </div>
        <p className="mt-4 min-h-10 px-3 text-xs">
          {smashed ? (
            <>
              <span>{"// smashed: "}</span>
              <span className="text-accent-coral">&quot;{smashed}&quot;</span>
            </>
          ) : (
            <span>{"// break my whole stack"}</span>
          )}
        </p>
      </div>
    </>
  );
}
