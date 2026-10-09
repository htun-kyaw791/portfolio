"use client";

import { useCallback, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

export const HISCORE_EVENT = "hk:hiscore";

/** Best score per game, kept in this browser. Games render client-only, so reading storage on init is safe. */
export function useHighScore(gameId: string) {
  const key = `hiscore:${gameId}`;
  const [best, setBest] = useState<number>(() => readStorage<number>(key, 0));
  const submit = useCallback(
    (score: number) => {
      setBest((prev) => {
        if (score <= prev) return prev;
        writeStorage(key, score);
        queueMicrotask(() => window.dispatchEvent(new Event(HISCORE_EVENT)));
        return score;
      });
    },
    [key],
  );
  return { best, submit };
}

export function readHighScore(gameId: string) {
  return readStorage<number>(`hiscore:${gameId}`, 0);
}
