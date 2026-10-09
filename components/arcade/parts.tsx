"use client";

import Link from "next/link";
import { IoMdArrowDropdown, IoMdArrowDropleft, IoMdArrowDropright, IoMdArrowDropup } from "react-icons/io";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Shared building blocks for arcade games: every game is a board on the left
// and a side panel of `// comments` on the right, inside the Arcade console.

export const BOARD_W = 240;
export const BOARD_H = 405;

export type Dir = "up" | "down" | "left" | "right";
export const ARROW_KEYS: Record<string, Dir> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };

export function Board({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      style={{ width: BOARD_W, height: BOARD_H, ...style }}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-bg/85 shadow-[inset_1px_5px_11px_color-mix(in_oklab,var(--color-bg-deep)_70%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

/** Start / game-over / win banner at the bottom of the board. */
export function Overlay({
  status,
  onStart,
  message,
  detail,
  startLabel = "start-game",
}: {
  status: "idle" | "over" | "won" | "paused";
  onStart: () => void;
  message?: string;
  detail?: React.ReactNode;
  startLabel?: string;
}) {
  const title = message ?? { idle: "", over: "GAME OVER!", won: "WELL DONE!", paused: "PAUSED" }[status];
  return (
    <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-3">
      {title && <p className="w-full bg-bg-deep/80 py-2 text-center text-xl text-accent-green">{title}</p>}
      {detail && <div className="w-full bg-bg-deep/80 px-3 py-2 text-center text-xs text-text-light">{detail}</div>}
      <div className="flex gap-2">
        <Button variant={status === "idle" ? "primary" : "ghost"} onClick={onStart} autoFocus={status !== "idle"}>
          {status === "idle" ? startLabel : status === "paused" ? "resume" : "play-again"}
        </Button>
        {status === "won" && (
          <Link href="/about-me" className="rounded-lg bg-btn-primary px-4 py-2.5 text-sm text-bg-deep transition-colors hover:bg-btn-primary-hover">
            continue
          </Link>
        )}
      </div>
    </div>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-lg bg-bg-deep/20 p-3", className)}>{children}</div>;
}

/** Row of glowing dots, e.g. food left or lives. */
export function Pips({ total, lit, className }: { total: number; lit: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-5 gap-4", className)}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn("size-2.5 rounded-full bg-accent-green", i < lit ? "glow-accent-green" : "opacity-20")}
        />
      ))}
    </div>
  );
}

function Key({ dir, onPress, children }: { dir: Dir; onPress: (d: Dir) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={dir}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(dir);
      }}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPress(dir)}
      className="flex h-7 w-12 touch-none items-center justify-center rounded-lg border border-line bg-bg-deep text-white transition-colors hover:bg-btn"
    >
      {children}
    </button>
  );
}

/** On-screen arrow keys (also the touch controls). */
export function KeyPad({ onPress, only }: { onPress: (d: Dir) => void; only?: "horizontal" }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-1">
      {only !== "horizontal" && (
        <Key dir="up" onPress={onPress}>
          <IoMdArrowDropup />
        </Key>
      )}
      <div className="flex gap-1">
        <Key dir="left" onPress={onPress}>
          <IoMdArrowDropleft />
        </Key>
        {only !== "horizontal" && (
          <Key dir="down" onPress={onPress}>
            <IoMdArrowDropdown />
          </Key>
        )}
        <Key dir="right" onPress={onPress}>
          <IoMdArrowDropright />
        </Key>
      </div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="flex justify-between gap-2">
      <span>{`// ${label}`}</span>
      <span className="tabular-nums text-accent-orange">{value}</span>
    </p>
  );
}

/**
 * True when a keydown should start a round: Enter/Space on the page itself or
 * on a game tab, but not on other controls that handle those keys themselves.
 */
export function isStartKey(e: KeyboardEvent) {
  if (e.key !== "Enter" && e.key !== " ") return false;
  const t = e.target as HTMLElement | null;
  return t === document.body || t?.getAttribute("role") === "tab";
}

/** Size a canvas for the device pixel ratio and return a context in CSS pixels. */
export function setupCanvas(canvas: HTMLCanvasElement, width = BOARD_W, height = BOARD_H) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** The page's monospace font family (next/font gives it a generated name). */
export function monoFont() {
  return getComputedStyle(document.body).fontFamily || "monospace";
}
