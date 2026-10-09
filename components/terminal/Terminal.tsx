"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { navTypes } from "@/lib/nav";
import { readStorage, writeStorage } from "@/lib/storage";
import { commandNames, commands, cwd, resolveCommand } from "./commands";
import Run, { RunContext } from "./Run";
import type { CommandContext, LineKind, TerminalData } from "./types";

type Line = { id: number; kind: LineKind; node: React.ReactNode };

const HISTORY_KEY = "term:history";
const HISTORY_MAX = 50;

/** Split on spaces, keeping "quoted strings" together. */
function parse(raw: string) {
  return [...raw.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3]);
}

function commonPrefix(list: readonly string[]) {
  if (!list.length) return "";
  let prefix = list[0];
  for (const s of list) while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return prefix;
}

/** Closest command by edit distance, for "did you mean". */
function suggest(name: string) {
  const dist = (a: string, b: string) => {
    const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = dp[j];
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return dp[b.length];
  };
  const best = commandNames()
    .map((c) => [c, dist(name.toLowerCase(), c)] as const)
    .sort((a, b) => a[1] - b[1])[0];
  return best && best[1] <= 2 ? best[0] : null;
}

let lineId = 0;
const nextId = () => ++lineId;

function welcome(data: TerminalData): Line[] {
  return [
    {
      id: nextId(),
      kind: "muted",
      node: (
        <div>
          <p>
            hksh 1.0 · {data.profile.name}&apos;s portfolio shell
          </p>
          <p>
            type <Run cmd="help" /> to see commands, or try <Run cmd="neofetch" />, <Run cmd="ls projects" />, <Run cmd="sudo hire-me" />
          </p>
        </div>
      ),
    },
  ];
}

export default function Terminal({
  data,
  onClose,
  focusSignal = 0,
  className,
}: {
  data: TerminalData;
  onClose?: () => void;
  /** Bump to move focus into the prompt (e.g. when a drawer opens). */
  focusSignal?: number;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [lines, setLines] = useState<Line[]>(() => welcome(data));
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"vim" | null>(null);
  const [history, setHistory] = useState<string[]>(() => readStorage<string[]>(HISTORY_KEY, []));
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef("");

  const prompt = (
    <>
      <span className="text-accent-green">guest@{data.profile.handle}</span>
      <span className="text-text">:</span>
      <span className="text-accent-indigo">{cwd(pathname)}</span>
      <span className="text-text">{mode === "vim" ? " -- NORMAL --" : "$"}</span>
    </>
  );

  const print = useCallback((node: React.ReactNode, kind: LineKind = "out") => {
    setLines((l) => [...l, { id: nextId(), kind, node }]);
  }, []);

  const execute = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const echo = (
        <p className="whitespace-pre-wrap break-all">
          {prompt} <span className="text-text-light">{raw}</span>
        </p>
      );
      setLines((l) => [...l, { id: nextId(), kind: "input", node: echo }]);
      if (!trimmed) return;

      setHistory((h) => {
        const next = [...h.filter((x) => x !== trimmed), trimmed].slice(-HISTORY_MAX);
        writeStorage(HISTORY_KEY, next);
        return next;
      });
      setHistIndex(null);

      if (mode === "vim") {
        if ([":q", ":q!", ":wq", ":x", "ZZ"].includes(trimmed)) {
          setMode(null);
          print("phew. you escaped vim. most people don't.", "muted");
        } else {
          print(`E492: Not an editor command: ${trimmed} (hint: :q)`, "err");
        }
        return;
      }

      const [name, ...args] = parse(trimmed);
      const { command, args: finalArgs } = resolveCommand(name, args);
      if (!command) {
        const hint = suggest(name);
        print(
          <p>
            hksh: command not found: {name}
            {hint ? (
              <>
                . did you mean <Run cmd={hint} />?
              </>
            ) : (
              <>
                . try <Run cmd="help" />
              </>
            )}
          </p>,
          "err",
        );
        return;
      }

      const ctx: CommandContext = {
        args: finalArgs,
        data,
        pathname,
        history: [...history, trimmed],
        print,
        clear: () => setLines([]),
        navigate: (href) => router.push(href, { transitionTypes: navTypes(window.location.pathname, href) }),
        close: () => (onClose ? onClose() : print("exit: this is the full-screen terminal, try `cd ~`", "muted")),
        setMode,
      };
      try {
        command.run(ctx);
      } catch (err) {
        print(`${command.name}: ${err instanceof Error ? err.message : "failed"}`, "err");
      }
    },
    // `prompt` is derived from pathname/mode/data, already listed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, pathname, history, mode, print, router, onClose],
  );

  // keep the newest output in view
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    if (focusSignal) inputRef.current?.focus({ preventScroll: true });
  }, [focusSignal]);

  function complete() {
    const endsWithSpace = /\s$/.test(input);
    const parts = parse(input);
    if (parts.length <= 1 && !endsWithSpace) {
      const word = parts[0] ?? "";
      const matches = commandNames().filter((c) => c.startsWith(word.toLowerCase()));
      if (matches.length === 1) setInput(`${matches[0]} `);
      else if (matches.length > 1) {
        const prefix = commonPrefix(matches);
        if (prefix.length > word.length) setInput(prefix);
        else print(<p className="flex flex-wrap gap-x-4">{matches.map((m) => <span key={m}>{m}</span>)}</p>, "muted");
      }
      return;
    }
    const [name, ...rest] = parts;
    const command = commands.find((c) => c.name === resolveCommand(name, []).command?.name);
    if (!command?.complete) return;
    const word = endsWithSpace ? "" : (rest[rest.length - 1] ?? "");
    const options = command.complete(data).filter((o) => o.toLowerCase().startsWith(word.toLowerCase()));
    const base = endsWithSpace ? input : input.slice(0, input.length - word.length);
    if (options.length === 1) setInput(`${base}${options[0]} `);
    else if (options.length > 1) {
      const prefix = commonPrefix(options);
      if (prefix.length > word.length) setInput(base + prefix);
      else print(<p className="flex flex-wrap gap-x-4">{options.map((o) => <span key={o}>{o}</span>)}</p>, "muted");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      execute(input);
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      if (histIndex === null) draftRef.current = input;
      const i = histIndex === null ? history.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex === null) return;
      const i = histIndex + 1;
      if (i >= history.length) {
        setHistIndex(null);
        setInput(draftRef.current);
      } else {
        setHistIndex(i);
        setInput(history[i]);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setLines([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
      e.preventDefault();
      setLines((l) => [...l, { id: nextId(), kind: "input", node: <p>{prompt} <span className="text-text-light">{input}</span>^C</p> }]);
      setInput("");
      setHistIndex(null);
    } else if (e.key === "Escape" && onClose) {
      e.preventDefault();
      onClose();
    }
  }

  const runFromOutput = useCallback(
    (cmd: string) => {
      // a trailing space means "fill the prompt", e.g. `cat ` from help
      if (cmd.endsWith(" ")) setInput(cmd);
      else execute(cmd);
      inputRef.current?.focus({ preventScroll: true });
    },
    [execute],
  );

  return (
    <RunContext.Provider value={runFromOutput}>
      <div
        ref={scrollRef}
        onClick={() => {
          // let people select text; only focus on a plain click
          if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
        }}
        className={cn("overflow-y-auto px-4 py-3 font-mono text-[13px] leading-6", className)}
      >
        <div role="log" aria-live="polite" aria-label="Terminal output">
          {lines.map((l) => (
            <div
              key={l.id}
              className={cn(
                "break-words",
                l.kind === "err" && "text-accent-coral",
                l.kind === "muted" && "text-text",
                l.kind === "out" && "text-text-light/90",
              )}
            >
              {l.node}
            </div>
          ))}
        </div>
        <label className="flex items-baseline gap-2">
          <span className="shrink-0 whitespace-pre">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setHistIndex(null);
            }}
            onKeyDown={onKeyDown}
            aria-label="Terminal command"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-text-light caret-accent-orange outline-none"
          />
        </label>
      </div>
    </RunContext.Provider>
  );
}
