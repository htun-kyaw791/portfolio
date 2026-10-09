"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { VscTerminal } from "react-icons/vsc";
import { TERMINAL_TOGGLE } from "@/lib/events";
import { useHotkey } from "@/lib/hotkeys";
import { cn } from "@/lib/cn";
import Kbd from "@/components/ui/Kbd";
import type { TerminalData } from "./types";

const Terminal = dynamic(() => import("./Terminal"), {
  ssr: false,
  loading: () => <p className="px-4 py-3 text-[13px]">{"// starting hksh…"}</p>,
});

/**
 * VS Code-style integrated terminal under the editor. Loaded on first open and
 * then kept mounted (hidden) so scrollback survives closing it.
 */
export default function TerminalDrawer({ data }: { data: TerminalData }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [focusSignal, setFocusSignal] = useState(0);
  // the /terminal page already is a terminal
  const onTerminalPage = pathname === "/terminal";

  const toggle = () => {
    if (onTerminalPage) return;
    if (!open) {
      setLoaded(true);
      setFocusSignal((n) => n + 1);
    }
    setOpen(!open);
  };

  useHotkey("mod+`", toggle, { allowInInputs: true });

  useEffect(() => {
    window.addEventListener(TERMINAL_TOGGLE, toggle);
    return () => window.removeEventListener(TERMINAL_TOGGLE, toggle);
  });

  const visible = open && !onTerminalPage;
  if (!loaded) return null;

  return (
    <section
      aria-label="Terminal"
      hidden={!visible}
      className={cn("flex h-[42%] min-h-48 shrink-0 flex-col border-t border-line bg-bg-deep/60", !visible && "hidden")}
    >
      <div className="flex h-9 shrink-0 items-center gap-4 border-b border-line px-4 text-xs">
        <span className="flex items-center gap-2 border-b border-accent-orange py-2 text-white">
          <VscTerminal aria-hidden /> TERMINAL
        </span>
        <span className="hidden sm:inline">hksh</span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <Kbd mod>`</Kbd> toggle
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close terminal"
          title="Close terminal"
          className="rounded p-0.5 text-base transition-colors hover:bg-btn hover:text-white max-sm:ml-auto"
        >
          <IoClose />
        </button>
      </div>
      <Terminal data={data} onClose={() => setOpen(false)} focusSignal={focusSignal} className="min-h-0 flex-1" />
    </section>
  );
}
