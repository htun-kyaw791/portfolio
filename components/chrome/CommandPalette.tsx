"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  VscCheck,
  VscCopy,
  VscDebugStart,
  VscFlame,
  VscFileCode,
  VscFilePdf,
  VscGithub,
  VscLinkExternal,
  VscMail,
  VscProject,
  VscSettingsGear,
  VscSymbolColor,
  VscTerminal,
  VscUnmute,
} from "react-icons/vsc";
import { games } from "@/components/arcade/games";
import { cn } from "@/lib/cn";
import { PALETTE_OPEN, summonBlackHole, toast, toggleTerminal, type PaletteOpenDetail } from "@/lib/events";
import { fuzzyMatch } from "@/lib/fuzzy";
import { navTypes } from "@/lib/nav";
import { useHotkey } from "@/lib/hotkeys";
import { applyPrefs, getPrefs, setPrefs, usePrefs, type MotionPref } from "@/lib/prefs";
import { themes } from "@/lib/themes";
import Kbd from "@/components/ui/Kbd";

export type PaletteProject = { slug: string; name: string; description: string };
export type PaletteLinks = { email: string; resume: string; github: string; linkedin: string };

type Group = "page" | "project" | "game" | "theme" | "preference" | "link" | "fun";

type Command = {
  id: string;
  group: Group;
  label: string;
  hint?: string;
  /** extra words that match but aren't shown */
  keywords?: string;
  icon: React.ReactNode;
  swatches?: readonly string[];
  current?: boolean;
  /** live preview while highlighted (themes) */
  preview?: () => void;
  run: () => void;
};

/** Prefix → which groups are searched, like VS Code's quick open. */
const MODES: Record<string, { groups: readonly Group[]; placeholder: string }> = {
  "": { groups: ["page", "project", "game", "theme", "preference", "link", "fun"], placeholder: "Search pages, projects, commands…" },
  ">": { groups: ["game", "preference", "theme", "link", "fun"], placeholder: "Run a command…" },
  "@": { groups: ["project"], placeholder: "Go to project…" },
  "#": { groups: ["theme"], placeholder: "Select colour theme…" },
};

const pages = [
  { label: "_hello", href: "/", hint: "src/hello.tsx" },
  { label: "_about-me", href: "/about-me", hint: "src/about-me.tsx" },
  { label: "_projects", href: "/projects", hint: "src/projects/index.tsx" },
  { label: "_arcade", href: "/arcade", hint: "src/arcade.tsx" },
  { label: "_terminal", href: "/terminal", hint: "full-screen shell" },
  { label: "_contact-me", href: "/contact-me", hint: "src/contact-me.tsx" },
];

const NEXT_MOTION: Record<MotionPref, MotionPref> = { auto: "reduced", reduced: "full", full: "auto" };

function parse(input: string) {
  const prefix = input[0] && input[0] in MODES ? input[0] : "";
  return { prefix, text: input.slice(prefix.length) };
}

function Highlight({ text, indices }: { text: string; indices: readonly number[] }) {
  if (!indices.length) return <>{text}</>;
  const set = new Set(indices);
  return (
    <>
      {[...text].map((ch, i) =>
        set.has(i) ? (
          <span key={i} className="text-accent-orange">
            {ch}
          </span>
        ) : (
          ch
        ),
      )}
    </>
  );
}

export default function CommandPalette({ projects, links }: { projects: readonly PaletteProject[]; links: PaletteLinks }) {
  const router = useRouter();
  const prefs = usePrefs();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const show = (query = "") => {
    setInput(query);
    setActive(0);
    setOpen(true);
  };

  useHotkey(["mod+k", "mod+p"], () => (open ? setOpen(false) : show()), { allowInInputs: true });
  useHotkey("mod+shift+p", () => show(">"), { allowInInputs: true });

  useEffect(() => {
    const onOpen = (e: Event) => {
      setInput((e as CustomEvent<PaletteOpenDetail>).detail?.query ?? "");
      setActive(0);
      setOpen(true);
    };
    window.addEventListener(PALETTE_OPEN, onOpen);
    return () => window.removeEventListener(PALETTE_OPEN, onOpen);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href, { transitionTypes: navTypes(window.location.pathname, href) });
    const external = (href: string) => () => window.open(href, "_blank", "noopener,noreferrer");

    const list: Command[] = [
      ...pages.map((p) => ({
        id: `page:${p.href}`,
        group: "page" as const,
        label: p.label,
        hint: p.hint,
        icon: <VscFileCode />,
        run: go(p.href),
      })),
      ...projects.map((p) => ({
        id: `project:${p.slug}`,
        group: "project" as const,
        label: p.name,
        hint: p.description,
        keywords: p.slug,
        icon: <VscProject />,
        run: go(`/projects/${p.slug}`),
      })),
      ...games.map((g) => ({
        id: `game:${g.id}`,
        group: "game" as const,
        label: `Play: ${g.label}`,
        hint: g.blurb,
        keywords: `${g.file} game arcade`,
        icon: <VscDebugStart />,
        run: () => {
          // already on /arcade: a hash change switches the tab without navigating
          if (window.location.pathname === "/arcade") window.location.hash = g.id;
          else router.push(`/arcade#${g.id}`);
        },
      })),
      ...themes.map((t) => ({
        id: `theme:${t.id}`,
        group: "theme" as const,
        label: `Theme: ${t.label}`,
        keywords: "colour color dark light",
        icon: <VscSymbolColor />,
        swatches: t.swatches,
        current: prefs.theme === t.id,
        preview: () => applyPrefs({ ...getPrefs(), theme: t.id }),
        run: () => {
          setPrefs({ theme: t.id });
          toast(`theme: ${t.label}`);
        },
      })),
      {
        id: "pref:motion",
        group: "preference",
        label: `Preferences: Motion (${prefs.motion})`,
        hint: `switch to ${NEXT_MOTION[prefs.motion]}`,
        keywords: "animation reduce accessibility",
        icon: <VscSettingsGear />,
        run: () => {
          const motion = NEXT_MOTION[getPrefs().motion];
          setPrefs({ motion });
          toast(`motion: ${motion}`);
        },
      },
      {
        id: "view:terminal",
        group: "preference",
        label: "View: Toggle terminal",
        hint: "Ctrl+`",
        keywords: "shell bash console command line",
        icon: <VscTerminal />,
        run: () => toggleTerminal(),
      },
      {
        id: "pref:hero",
        group: "preference",
        label: `Preferences: Hero background (${prefs.hero === "blackhole" ? "black hole" : "blobs"})`,
        hint: "hello page, desktop only",
        keywords: "background blackhole space",
        icon: <VscSettingsGear />,
        run: () => {
          const hero = getPrefs().hero === "blackhole" ? "blobs" : "blackhole";
          setPrefs({ hero });
          toast(`hero: ${hero === "blackhole" ? "black hole" : "blobs"}`);
        },
      },
      {
        id: "fun:blackhole",
        group: "fun",
        label: "Summon black hole",
        hint: "don't worry, it gives everything back",
        keywords: "easter egg collapse rm -rf",
        icon: <VscFlame />,
        run: () => setTimeout(summonBlackHole, 150),
      },
      {
        id: "pref:crt",
        group: "preference",
        label: `Preferences: CRT mode (${prefs.crt ? "on" : "off"})`,
        hint: "scanlines and phosphor glow",
        keywords: "retro monitor scanline vintage",
        icon: <VscSettingsGear />,
        run: () => {
          const crt = !getPrefs().crt;
          setPrefs({ crt });
          toast(`crt: ${crt ? "on" : "off"}`);
        },
      },
      {
        id: "pref:sound",
        group: "preference",
        label: `Preferences: Sound (${prefs.sound ? "on" : "off"})`,
        hint: "8-bit game sounds",
        keywords: "audio mute volume",
        icon: <VscUnmute />,
        run: () => {
          const sound = !getPrefs().sound;
          setPrefs({ sound });
          toast(`sound: ${sound ? "on" : "off"}`);
        },
      },
    ];

    if (links.email) {
      list.push(
        {
          id: "link:copy-email",
          group: "link",
          label: "Copy email address",
          hint: links.email,
          icon: <VscCopy />,
          run: () => {
            navigator.clipboard
              ?.writeText(links.email)
              .then(() => toast("email copied"))
              .catch(() => toast(links.email));
          },
        },
        {
          id: "link:mail",
          group: "link",
          label: "Send an email",
          hint: links.email,
          icon: <VscMail />,
          run: () => {
            window.location.href = `mailto:${links.email}`;
          },
        },
      );
    }
    if (links.resume)
      list.push({ id: "link:resume", group: "link", label: "Open resume.pdf", keywords: "cv download", icon: <VscFilePdf />, run: external(links.resume) });
    if (links.github)
      list.push({ id: "link:github", group: "link", label: "Open GitHub profile", hint: links.github, icon: <VscGithub />, run: external(links.github) });
    if (links.linkedin)
      list.push({ id: "link:linkedin", group: "link", label: "Open LinkedIn profile", icon: <VscLinkExternal />, run: external(links.linkedin) });

    return list;
  }, [router, projects, links, prefs.theme, prefs.motion, prefs.sound, prefs.hero, prefs.crt]);

  const { prefix, text } = parse(input);
  const mode = MODES[prefix];

  const results = useMemo(() => {
    const pool = commands.filter((c) => mode.groups.includes(c.group));
    if (!text.trim()) return pool.map((c) => ({ c, indices: [] as number[] }));
    return pool
      .flatMap((c) => {
        const onLabel = fuzzyMatch(text, c.label);
        if (onLabel) return [{ c, indices: onLabel.indices, score: onLabel.score + 2 }];
        // hints and keywords only match whole substrings, so long descriptions don't match everything
        const extra = `${c.keywords ?? ""} ${c.hint ?? ""}`.toLowerCase();
        const words = text.toLowerCase().split(/\s+/).filter(Boolean);
        return words.every((w) => extra.includes(w)) ? [{ c, indices: [] as number[], score: 0 }] : [];
      })
      .sort((a, b) => b.score - a.score);
  }, [commands, mode, text]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));
  const activeCommand = results[activeIndex]?.c;

  // theme preview follows the highlighted row; anything else shows the saved theme
  useEffect(() => {
    if (!open) return;
    if (activeCommand?.preview) activeCommand.preview();
    else applyPrefs(getPrefs());
  }, [open, activeCommand]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function close() {
    setOpen(false);
  }

  function run(c: Command | undefined) {
    if (!c) return;
    close();
    c.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const n = results.length;
    if (!n) return;
    const move = (to: number) => {
      e.preventDefault();
      setActive((to + n) % n);
    };
    if (e.key === "ArrowDown") move(activeIndex + 1);
    else if (e.key === "ArrowUp") move(activeIndex - 1);
    else if (e.key === "PageDown") move(Math.min(activeIndex + 8, n - 1));
    else if (e.key === "PageUp") move(Math.max(activeIndex - 8, 0));
    else if (e.key === "Enter") {
      e.preventDefault();
      run(activeCommand);
    }
  }

  const optionId = (i: number) => `${listId}-${i}`;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClose={() => {
        setOpen(false);
        applyPrefs(getPrefs());
      }}
      onClick={(e) => e.target === dialogRef.current && close()}
      className="mx-auto mt-[12vh] w-[min(640px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-line bg-bg p-0 text-text shadow-2xl backdrop:bg-bg-deep/60 backdrop:backdrop-blur-[2px] open:animate-[palette-in_140ms_ease-out]"
    >
      {open && (
        <div>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <span aria-hidden className="text-accent-green">
              {prefix || "›"}
            </span>
            <input
              ref={inputRef}
              onKeyDown={onKeyDown}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results.length ? optionId(activeIndex) : undefined}
              aria-autocomplete="list"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setActive(0);
              }}
              placeholder={mode.placeholder}
              spellCheck={false}
              className="h-12 flex-1 bg-transparent text-sm text-text-light outline-none placeholder:text-text/70"
            />
            <Kbd>esc</Kbd>
          </div>

          <ul ref={listRef} id={listId} role="listbox" aria-label="Results" className="max-h-[min(420px,55vh)] overflow-y-auto py-1">
            {results.map(({ c, indices }, i) => (
              <li
                key={c.id}
                id={optionId(i)}
                role="option"
                aria-selected={i === activeIndex}
                onPointerMove={() => i !== activeIndex && setActive(i)}
                onClick={() => run(c)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-4 py-2 text-sm",
                  i === activeIndex ? "bg-btn text-white" : "text-text-light",
                )}
              >
                <span aria-hidden className="shrink-0 text-base text-text">
                  {c.icon}
                </span>
                <span className="shrink-0 truncate">
                  <Highlight text={c.label} indices={indices} />
                </span>
                {c.hint && <span className="min-w-0 truncate text-xs text-text">{c.hint}</span>}
                <span className="ml-auto flex shrink-0 items-center gap-2">
                  {c.swatches && (
                    <span aria-hidden className="flex gap-1">
                      {c.swatches.map((s) => (
                        <span key={s} className="size-2.5 rounded-full" style={{ background: s }} />
                      ))}
                    </span>
                  )}
                  {c.current && <VscCheck aria-label="current" className="text-accent-green" />}
                  <span className="hidden text-[11px] text-text sm:inline">{c.group}</span>
                </span>
              </li>
            ))}
            {!results.length && <li className="px-4 py-6 text-center text-sm">{"// no matching results"}</li>}
          </ul>

          <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2 text-[11px]">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            {(Object.keys(MODES) as string[])
              .filter(Boolean)
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setInput(p);
                    setActive(0);
                    inputRef.current?.focus();
                  }}
                  className={cn("hover:text-white", prefix === p && "text-accent-orange")}
                >
                  {p} {p === ">" ? "commands" : p === "@" ? "projects" : "themes"}
                </button>
              ))}
          </p>
        </div>
      )}
    </dialog>
  );
}
