"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/events";
import { Board } from "./parts";
import type { ArcadeTech, GameProps } from "./types";
import { games, isGameId, type GameId } from "./games";

// Each game is its own chunk, loaded when its tab is opened.
function Loading() {
  return (
    <>
      <Board className="flex items-center justify-center text-xs">{"// loading…"}</Board>
      <div className="flex-1" />
    </>
  );
}

const components: Record<GameId, React.ComponentType<GameProps>> = {
  snake: dynamic(() => import("./games/Snake"), { ssr: false, loading: Loading }),
  breakout: dynamic(() => import("./games/Breakout"), { ssr: false, loading: Loading }),
  typing: dynamic(() => import("./games/Typing"), { ssr: false, loading: Loading }),
  invaders: dynamic(() => import("./games/Invaders"), { ssr: false, loading: Loading }),
  horizon: dynamic(() => import("./games/Horizon"), { ssr: false, loading: Loading }),
};

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
  };
}

function Bolt({ className }: { className: string }) {
  return <span className={`absolute size-4 rounded-full bg-[radial-gradient(var(--color-bolt),var(--color-bg-deep))] shadow-inner ${className}`} />;
}

/**
 * The glass "console" with a tab per game. On /arcade the open tab lives in the
 * URL hash (#breakout) so it can be linked; on the hello page it's plain state.
 */
export default function Arcade({ technos, variant = "home" }: { technos: readonly ArcadeTech[]; variant?: "home" | "page" }) {
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
  const [picked, setPicked] = useState<GameId>("snake");
  const current: GameId = variant === "page" && isGameId(hash) ? hash : picked;
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = (id: GameId, focus = false) => {
    setPicked(id);
    if (variant === "page") {
      history.replaceState(history.state, "", `#${id}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    if (focus) tabRefs.current[id]?.focus();
  };

  const onWin = useCallback(() => {
    const game = games.find((g) => g.id === current);
    toast(`${game?.file ?? "game"} cleared: _about-me unlocked`);
  }, [current]);

  function onTabKey(e: React.KeyboardEvent) {
    const i = games.findIndex((g) => g.id === current);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % games.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + games.length) % games.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = games.length - 1;
    if (next < 0) return;
    // keep arrow keys from also steering a running game
    e.preventDefault();
    e.stopPropagation();
    select(games[next].id, true);
  }

  const Game = components[current];

  return (
    <div className="relative flex w-full max-w-[510px] flex-col rounded-lg border border-black/30 bg-[linear-gradient(150deg,var(--color-console-from)_1.7%,var(--color-console-to)_81.82%)] px-8 pb-8 pt-5 shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] backdrop-blur-2xl">
      <Bolt className="left-3 top-3" />
      <Bolt className="right-3 top-3" />
      <Bolt className="bottom-3 left-3" />
      <Bolt className="bottom-3 right-3" />

      <div role="tablist" aria-label="Games" onKeyDown={onTabKey} className="mb-4 flex justify-center gap-0.5 overflow-x-auto text-[11px]">
        {games.map((g) => (
          <button
            key={g.id}
            ref={(el) => {
              tabRefs.current[g.id] = el;
            }}
            type="button"
            role="tab"
            id={`arcade-tab-${g.id}`}
            aria-selected={g.id === current}
            aria-controls="arcade-panel"
            tabIndex={g.id === current ? 0 : -1}
            onClick={() => select(g.id)}
            className={cn(
              "shrink-0 rounded-t-md border-b-2 px-1.5 py-1.5 transition-colors",
              g.id === current ? "border-accent-orange bg-bg-deep/40 text-white" : "border-transparent text-text-light/70 hover:text-white",
            )}
          >
            {g.file}
          </button>
        ))}
      </div>

      <div
        id="arcade-panel"
        role="tabpanel"
        aria-labelledby={`arcade-tab-${current}`}
        className="flex flex-col items-center gap-6 sm:flex-row sm:items-stretch"
      >
        <Game key={current} technos={technos} onWin={onWin} />
      </div>

      {variant === "home" ? (
        <Link
          href="/about-me"
          className="absolute bottom-8 right-8 hidden rounded-lg border border-white px-4 py-2.5 text-sm text-white transition-colors hover:border-white/50 sm:block"
        >
          skip
        </Link>
      ) : null}
    </div>
  );
}
