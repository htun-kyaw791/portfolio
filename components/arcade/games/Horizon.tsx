"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BlackHole from "@/components/blackhole/BlackHole";
import { sfx } from "@/lib/sound";
import { useAnimationFrame } from "@/lib/useAnimationFrame";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useThemeColors } from "@/lib/useThemeColors";
import { Board, Overlay, Panel, Pips, Stat, isStartKey, monoFont, setupCanvas } from "../parts";
import type { GameProps } from "../types";
import { useHighScore } from "../useHighScore";
import { GOAL, H, HORIZON, W, createHorizon, type Input } from "./horizon-engine";

type Status = "idle" | "playing" | "paused" | "over" | "won";

// The WebGL hole's shadow radius is ~0.161 × zoom of the board height; pick the
// zoom that makes it line up with the game's horizon.
const ZOOM = HORIZON / H / 0.161;

export default function Horizon({ onWin }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fontRef = useRef("monospace");
  const colours = useThemeColors();
  const reduced = useReducedMotion();
  const { best, submit } = useHighScore("horizon");

  const [status, setStatus] = useState<Status>("idle");
  const [packets, setPackets] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [telemetry, setTelemetry] = useState({ r: 85, v: 71 });
  const [result, setResult] = useState<{ score: number; reason: string } | null>(null);
  const input = useRef<Input>({ left: false, right: false, thrust: false, pointer: null });

  const engine = useMemo(
    () =>
      createHorizon(
        {
          packets: setPackets,
          fuel: setFuel,
          telemetry: (r, v) => setTelemetry({ r: Math.round(r), v: Math.round(v) }),
          end: (won, score, reason) => {
            submit(score);
            setResult({ score, reason });
            setStatus(won ? "won" : "over");
            if (won) onWin();
          },
          sound: (kind) => {
            if (kind === "collect") sfx.score();
            else if (kind === "thrust") sfx.thrust();
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
    setResult(null);
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
      else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") keys.thrust = down;
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

  // hold the mouse / a finger on the board: the ship turns toward it and burns
  const toBoard = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
  };
  const release = () => (input.current.pointer = null);

  // on-screen keys: hold to steer / burn
  const press = (key: "left" | "right" | "thrust") => {
    input.current[key] = true;
    const up = () => {
      input.current[key] = false;
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointerup", up);
  };

  return (
    <>
      <Board
        className="touch-none"
        onPointerDown={(e) => {
          if (status !== "playing") return;
          e.currentTarget.setPointerCapture(e.pointerId);
          input.current.pointer = toBoard(e);
        }}
        onPointerMove={(e) => {
          if (input.current.pointer) input.current.pointer = toBoard(e);
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <BlackHole elevation={1.45} zoom={ZOOM} maxScale={1} className="absolute inset-0 size-full" />
        <canvas ref={canvasRef} role="img" aria-label="Event Horizon board" className="relative" style={{ width: W, height: H }} />
        {status !== "playing" && (
          <Overlay
            status={status}
            onStart={start}
            startLabel="launch"
            message={status === "won" ? "DELIVERED!" : status === "over" ? "LOST IN THE VOID" : undefined}
            detail={result ? `${result.reason} · score ${result.score} · best ${Math.max(best, result.score)}` : undefined}
          />
        )}
      </Board>

      <div className="flex flex-1 flex-col text-sm text-white">
        <Panel>
          <p>{"// ← → steer"}</p>
          <p>{"// ↑ or hold: burn"}</p>
          <p>{"// grab {} packets"}</p>
          <div className="mt-4 flex justify-center gap-1">
            {(["left", "thrust", "right"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-label={k === "thrust" ? "burn" : `turn ${k}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  press(k);
                }}
                className="flex h-7 w-12 touch-none items-center justify-center rounded-lg border border-line bg-bg-deep text-white transition-colors hover:bg-btn"
              >
                {k === "left" ? "↺" : k === "right" ? "↻" : "▲"}
              </button>
            ))}
          </div>
        </Panel>

        <p className="mt-5 px-3">{"// packets"}</p>
        <Pips total={GOAL} lit={packets} className="mt-3 px-3" />

        <div className="mt-5 px-3 text-xs">
          <p className="flex justify-between">
            <span>{"// fuel"}</span>
            <span className="tabular-nums text-accent-orange">{Math.round(fuel)}%</span>
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded bg-line">
            <div
              className={fuel < 25 ? "h-full bg-accent-coral" : "h-full bg-accent-orange"}
              style={{ width: `${fuel}%` }}
            />
          </div>
        </div>

        <div className="mt-4 space-y-1 px-3 text-xs">
          <Stat label="r" value={`${(telemetry.r / HORIZON).toFixed(1)} rs`} />
          <Stat label="v" value={`${telemetry.v} px/s`} />
          <Stat label="best" value={best} />
        </div>
      </div>
    </>
  );
}
