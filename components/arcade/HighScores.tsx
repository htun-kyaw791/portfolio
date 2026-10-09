"use client";

import { useSyncExternalStore } from "react";
import { games } from "./games";
import { HISCORE_EVENT, readHighScore } from "./useHighScore";

const UNITS: Record<string, string> = { snake: "dots", breakout: "pts", typing: "wpm" };

function subscribe(cb: () => void) {
  window.addEventListener(HISCORE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(HISCORE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

// a string snapshot keeps useSyncExternalStore's equality check simple
const snapshot = () => games.map((g) => readHighScore(g.id)).join(",");

/** This browser's best scores. */
export default function HighScores() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const scores = raw ? raw.split(",").map(Number) : [];
  return (
    <ul className="space-y-2 text-sm">
      {games.map((g, i) => (
        <li key={g.id} className="flex justify-between gap-4">
          <span>{g.file}</span>
          <span className="tabular-nums text-accent-orange">
            {scores.length ? `${scores[i]} ${UNITS[g.id]}` : "–"}
          </span>
        </li>
      ))}
    </ul>
  );
}
