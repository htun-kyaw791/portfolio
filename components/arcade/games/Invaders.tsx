"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/sound";
import { useAnimationFrame } from "@/lib/useAnimationFrame";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useThemeColors } from "@/lib/useThemeColors";
import { Board, KeyPad, Overlay, Panel, Pips, Stat, isStartKey, monoFont, setupCanvas } from "../parts";
import type { GameProps } from "../types";
import { useHighScore } from "../useHighScore";
import { H, LIVES, W, WAVES, createInvaders, type Input } from "./invaders-engine";

type Status = "idle" | "playing" | "paused" | "over" | "won";

export default function Invaders({ onWin }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fontRef = useRef("monospace");
  const colours = useThemeColors();
  const reduced = useReducedMotion();
  const { best, submit } = useHighScore("invaders");

  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [wave, setWave] = useState(1);
  const [fixed, setFixed] = useState<string[]>([]);
  const input = useRef<Input>({ left: false, right: false, fire: false, fireQueued: false, pointerX: null });

  const engine = useMemo(
    () =>
      createInvaders(
        {
          score: setScore,
          lives: setLives,
          wave: setWave,
          fixed: (name) => setFixed((f) => [name, ...f].slice(0, 4)),
          end: (won, final) => {
            submit(final);
            setStatus(won ? "won" : "over");
            if (won) onWin();
          },
          sound: (kind) => {
            if (kind === "shoot") sfx.key();
            else if (kind === "hit") sfx.score();
            else if (kind === "hurt") sfx.hit();
            else if (kind === "win") sfx.win();
            else sfx.lose();
          },
        },
        reduced,
      ),
    [onWin, reduced, submit],
  );

  const draw = useCallback(() => {
    if (ctxRef.current) engine.draw(ctxRef.current, colours, fontRef.current);
  }, [engine, colours]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = setupCanvas(canvas, W, H);
    fontRef.current = monoFont();
    engine.reset();
    draw();
  }, [engine, draw]);

  const start = useCallback(() => {
    if (status === "paused") return setStatus("playing");
    engine.reset();
    setFixed([]);
    setStatus("playing");
  }, [engine, status]);

  useAnimationFrame((dt) => {
    engine.step(dt, input.current);
    draw();
  }, status === "playing");

  useEffect(() => {
    const keys = input.current;
    function onKey(e: KeyboardEvent) {
      const down = e.type === "keydown";
      // Space fires while playing, starts otherwise
      if (down && status !== "playing" && isStartKey(e)) {
        e.preventDefault();
        start();
        return;
      }
      if (down && (e.key === "p" || e.key === "P") && (status === "playing" || status === "paused")) {
        setStatus(status === "playing" ? "paused" : "playing");
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = down;
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = down;
      else if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        keys.fire = down;
        if (down && !e.repeat) keys.fireQueued = true;
      }
      else return;
      if (status === "playing") {
        e.preventDefault();
        keys.pointerX = null;
      }
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

  // mouse/touch: ship follows the pointer, holding the button fires
  const pointerX = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * W;
  };

  return (
    <>
      <Board
        className="touch-none"
        onPointerMove={(e) => (input.current.pointerX = pointerX(e))}
        onPointerDown={(e) => {
          input.current.pointerX = pointerX(e);
          if (status === "playing") {
            input.current.fire = true;
            input.current.fireQueued = true;
          }
        }}
        onPointerUp={() => (input.current.fire = false)}
        onPointerLeave={() => {
          input.current.fire = false;
          input.current.pointerX = null;
        }}
      >
        <canvas ref={canvasRef} role="img" aria-label="Bug Invaders board" style={{ width: W, height: H }} />
        {status !== "playing" && (
          <Overlay
            status={status}
            onStart={start}
            message={status === "won" ? "ALL BUGS FIXED!" : status === "over" ? "BUGS IN PROD!" : undefined}
            detail={status === "won" || status === "over" ? `score ${score} · best ${Math.max(best, score)}` : undefined}
          />
        )}
      </Board>

      <div className="flex flex-1 flex-col text-sm text-white">
        <Panel>
          <p>{"// ← → or mouse"}</p>
          <p>{"// space: fire"}</p>
          <p>{"// fix every bug"}</p>
          <KeyPad only="horizontal" onPress={(d) => {
            const keys = input.current;
            keys.pointerX = null;
            if (d === "left" || d === "right") {
              keys[d] = true;
              setTimeout(() => (keys[d] = false), 140);
            }
          }} />
        </Panel>

        <p className="mt-5 px-3">{"// lives"}</p>
        <Pips total={LIVES} lit={lives} className="mt-3 px-3" />

        <div className="mt-5 space-y-1 px-3 text-xs">
          <Stat label="wave" value={`${wave}/${WAVES}`} />
          <Stat label="score" value={score} />
          <Stat label="best" value={best} />
        </div>

        <div className="mt-4 min-h-16 px-3 text-xs">
          {fixed.length ? (
            fixed.map((f, i) => (
              <p key={`${f}-${i}`} className={i ? "opacity-50" : ""}>
                <span className="text-accent-green">✓</span> fixed <span className="text-accent-coral">{f}</span>
              </p>
            ))
          ) : (
            <p>{"// squash bugs before prod"}</p>
          )}
        </div>
      </div>
    </>
  );
}
