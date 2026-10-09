"use client";

import { createContext, useContext } from "react";

export const RunContext = createContext<(cmd: string) => void>(() => {});

/** Clickable output that runs a command, like a link in a real terminal. */
export default function Run({ cmd, children, className }: { cmd: string; children?: React.ReactNode; className?: string }) {
  const run = useContext(RunContext);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        run(cmd);
      }}
      title={`run: ${cmd}`}
      className={className ?? "text-accent-green underline-offset-2 hover:underline"}
    >
      {children ?? cmd}
    </button>
  );
}
