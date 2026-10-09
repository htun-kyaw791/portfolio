"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { snippets } from "@/lib/snippets";
import { sfx } from "@/lib/sound";
import { Board, Overlay, Panel, Stat } from "../parts";
import type { GameProps } from "../types";
import { useHighScore } from "../useHighScore";

// Type a real snippet; mistakes are marked but you keep going (like monkeytype).
// Leading indentation is filled in automatically after each newline.

const WIN_ACCURACY = 90;
/** Faster than any human: don't keep it as a high score (bots, paste). */
const MAX_WPM = 250;

type Status = "ready" | "typing" | "done";

function pickSnippet(not?: number) {
  let i = Math.floor(Math.random() * snippets.length);
  if (snippets.length > 1 && i === not) i = (i + 1) % snippets.length;
  return i;
}

export default function Typing({ onWin }: GameProps) {
  const [index, setIndex] = useState(() => pickSnippet());
  const target = snippets[index].code;
  // per typed position: was it right? (auto-indent counts as right)
  const [marks, setMarks] = useState<boolean[]>([]);
  const [keystrokes, setKeystrokes] = useState({ total: 0, wrong: 0 });
  const [status, setStatus] = useState<Status>("ready");
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [focused, setFocused] = useState(false);
  const [result, setResult] = useState<{ wpm: number; accuracy: number; seconds: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { best, submit } = useHighScore("typing");

  const pos = marks.length;
  const elapsed = status === "ready" ? 0 : Math.max((now - startedAt) / 1000, 0.001);
  const correct = marks.filter(Boolean).length;
  const wpm = result?.wpm ?? (elapsed > 0.5 ? Math.round(correct / 5 / (elapsed / 60)) : 0);
  const accuracy =
    result?.accuracy ?? (keystrokes.total ? Math.round(((keystrokes.total - keystrokes.wrong) / keystrokes.total) * 100) : 100);
  const seconds = result?.seconds ?? Math.floor(elapsed);

  useEffect(() => {
    if (status !== "typing") return;
    const id = setInterval(() => setNow(performance.now()), 250);
    return () => clearInterval(id);
  }, [status]);

  function reset(nextIndex = index) {
    setIndex(nextIndex);
    setMarks([]);
    setKeystrokes({ total: 0, wrong: 0 });
    setStatus("ready");
    setStartedAt(0);
    setNow(0);
    setResult(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function finish(finalMarks: boolean[], strokes: { total: number; wrong: number }, began: number) {
    const t = performance.now();
    const secs = Math.max((t - began) / 1000, 0.001);
    const finalWpm = Math.round(finalMarks.filter(Boolean).length / 5 / (secs / 60));
    const acc = Math.round(((strokes.total - strokes.wrong) / Math.max(strokes.total, 1)) * 100);
    setNow(t);
    setResult({ wpm: finalWpm, accuracy: acc, seconds: Math.round(secs) });
    setStatus("done");
    if (acc >= WIN_ACCURACY) {
      if (finalWpm <= MAX_WPM) submit(finalWpm);
      sfx.win();
      onWin();
    } else sfx.lose();
  }

  function typeChars(chars: string) {
    if (status === "done") return;
    let m = marks;
    let strokes = keystrokes;
    let began = startedAt;
    if (status === "ready") {
      began = performance.now();
      setStartedAt(began);
      setNow(began);
      setStatus("typing");
    }
    for (const raw of chars) {
      if (m.length >= target.length) break;
      const ch = raw === "\r" ? "\n" : raw;
      const expected = target[m.length];
      const ok = ch === expected;
      m = [...m, ok];
      strokes = { total: strokes.total + 1, wrong: strokes.wrong + (ok ? 0 : 1) };
      if (ok) sfx.key();
      // after a correct newline, skip the indentation
      if (ok && ch === "\n") {
        while (target[m.length] === " ") m = [...m, true];
      }
    }
    setMarks(m);
    setKeystrokes(strokes);
    if (m.length >= target.length) finish(m, strokes, began);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (status === "typing" && marks.length) setMarks(marks.slice(0, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (status === "done") reset(pickSnippet(index));
      else typeChars("\n");
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  }

  const lines = target.split("\n");
  const lineStarts = lines.map((_, li) => lines.slice(0, li).reduce((n, l) => n + l.length + 1, 0));

  return (
    <>
      <Board
        onClick={() => inputRef.current?.focus()}
        className={cn("cursor-text p-3 transition-shadow", focused && "ring-1 ring-accent-green/40")}
      >
        <input
          ref={inputRef}
          aria-label={`Type the snippet ${snippets[index].file}`}
          value=""
          onChange={(e) => typeChars(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="absolute inset-0 z-0 opacity-0"
          style={{ fontSize: 16 }}
        />
        <p className="mb-3 text-[11px] text-text">{`// ${snippets[index].file}`}</p>
        <pre aria-hidden className="pointer-events-none relative whitespace-pre text-[11px] leading-5">
          {lines.map((line, li) => {
            const start = lineStarts[li];
            return (
              <div key={li} className="min-h-5">
                {[...line, "\n"].map((ch, ci) => {
                  const at = start + ci;
                  if (li === lines.length - 1 && ch === "\n") return null;
                  const typed = at < pos;
                  const current = at === pos && status !== "done";
                  const wrong = typed && !marks[at];
                  const glyph = ch === "\n" ? (current || wrong ? "↵" : "") : ch;
                  return (
                    <span
                      key={ci}
                      className={cn(
                        typed ? (wrong ? "rounded-sm bg-accent-coral/25 text-accent-coral" : "text-text-light") : "text-text/70",
                        current && (focused ? "animate-pulse rounded-sm bg-accent-orange/60 text-bg-deep" : "border-b border-accent-orange"),
                      )}
                    >
                      {glyph === " " && wrong ? "·" : glyph}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </pre>

        {status === "ready" && !focused && (
          <p className="absolute inset-x-0 bottom-16 bg-bg-deep/80 py-2 text-center text-xs text-accent-green">
            {"// click here and start typing"}
          </p>
        )}
        {status === "done" && (
          <Overlay
            status={accuracy >= WIN_ACCURACY ? "won" : "over"}
            message={accuracy >= WIN_ACCURACY ? `${wpm} WPM!` : "TOO MANY TYPOS"}
            detail={
              wpm > MAX_WPM
                ? `accuracy ${accuracy}% · ${wpm} wpm is not human, not saved`
                : `accuracy ${accuracy}% · best ${Math.max(best, accuracy >= WIN_ACCURACY ? wpm : 0)} wpm`
            }
            onStart={() => reset(pickSnippet(index))}
          />
        )}
      </Board>

      <div className="flex flex-1 flex-col text-sm text-white">
        <Panel>
          <p>{"// type the code"}</p>
          <p>{"// mistakes count"}</p>
          <p>{`// ${WIN_ACCURACY}%+ accuracy wins`}</p>
        </Panel>

        <div className="mt-6 space-y-1 px-3 text-xs">
          <Stat label="wpm" value={wpm} />
          <Stat label="accuracy" value={`${accuracy}%`} />
          <Stat label="time" value={`${seconds}s`} />
          <Stat label="best" value={`${best} wpm`} />
        </div>

        <div className="mt-4 h-1 overflow-hidden rounded bg-line">
          <div className="h-full bg-accent-green transition-[width]" style={{ width: `${(pos / target.length) * 100}%` }} />
        </div>

        <button
          type="button"
          onClick={() => reset(pickSnippet(index))}
          className="mt-6 self-start px-3 text-xs text-accent-orange hover:underline"
        >
          {"> new-snippet"}
        </button>
      </div>
    </>
  );
}
