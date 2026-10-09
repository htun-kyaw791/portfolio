"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { VscCheck, VscError, VscRemote, VscSourceControl, VscTerminal, VscWarning } from "react-icons/vsc";
import { openPalette, toggleTerminal } from "@/lib/events";
import { usePrefs } from "@/lib/prefs";
import { getTheme } from "@/lib/themes";

// Approximate editor cell for 16px Fira Code: 0.6em wide, 24px line height.
const CELL_W = 9.6;
const LINE_H = 24;

function routeToFile(path: string) {
  if (path === "/") return "src/hello.tsx";
  if (path === "/projects") return "src/projects/index.tsx";
  return `src${path}.tsx`;
}

function useCursor() {
  const [pos, setPos] = useState({ ln: 1, col: 1 });
  useEffect(() => {
    let frame = 0;
    function onMove(e: PointerEvent) {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setPos({ ln: Math.floor(e.clientY / LINE_H) + 1, col: Math.floor(e.clientX / CELL_W) + 1 });
      });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
  return pos;
}

const clockFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Yangon" });

function subscribeMinute(cb: () => void) {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
}

const noop = () => () => {};

/** Owner's local time; empty during SSR so there is no hydration mismatch. */
function useYangonTime() {
  return useSyncExternalStore(subscribeMinute, () => clockFormat.format(new Date()), () => "");
}

const item = "flex h-full items-center gap-1.5 px-2.5 transition-colors hover:bg-btn hover:text-white";

/** VS Code-style status bar along the bottom of the window (desktop only). */
export default function StatusBar({ repoHref, availability }: { repoHref: string; availability: string }) {
  const pathname = usePathname();
  const prefs = usePrefs();
  const { ln, col } = useCursor();
  const time = useYangonTime();
  // the 404 page is prerendered once for every unknown URL, so the path is only known after hydration
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  return (
    <div className="hidden h-6 shrink-0 items-stretch border-t border-line bg-bg-deep text-[11px] md:flex">
      <button
        type="button"
        onClick={() => openPalette(">")}
        title="Open command palette"
        className="flex items-center bg-accent-indigo px-2.5 text-white transition-opacity hover:opacity-85"
      >
        <VscRemote aria-hidden />
        <span className="sr-only">Open command palette</span>
      </button>

      {repoHref ? (
        <a href={repoHref} target="_blank" rel="noreferrer" className={item} title="GitHub">
          <VscSourceControl aria-hidden /> main
        </a>
      ) : (
        <span className={item}>
          <VscSourceControl aria-hidden /> main
        </span>
      )}

      <span className={item} title="No problems">
        <VscError aria-hidden /> 0 <VscWarning aria-hidden /> 0
      </span>

      <span className="flex items-center px-2.5">{hydrated ? routeToFile(pathname) : ""}</span>

      <button type="button" onClick={toggleTerminal} className={item} title="Toggle terminal (Ctrl+`)">
        <VscTerminal aria-hidden /> terminal
      </button>

      <div className="ml-auto flex items-stretch">
        <span aria-hidden className="flex items-center px-2.5 tabular-nums">
          Ln {ln}, Col {col}
        </span>
        <span className="hidden items-center px-2.5 lg:flex">UTF-8</span>
        <span className="hidden items-center px-2.5 lg:flex">TypeScript JSX</span>
        <button type="button" onClick={() => openPalette("#")} className={item} title="Change colour theme">
          {getTheme(prefs.theme).label}
        </button>
        {availability && (
          <span className="flex items-center gap-1.5 px-2.5 text-accent-green" title={availability}>
            <VscCheck aria-hidden /> open to work
          </span>
        )}
        {time && (
          <span className="flex items-center px-2.5 tabular-nums" title="My local time (Yangon)">
            {time} MMT
          </span>
        )}
      </div>
    </div>
  );
}
