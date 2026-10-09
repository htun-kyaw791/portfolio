# Portfolio "IDE playground" roadmap

Goal: turn the editor-themed portfolio into an interactive playground (themes,
command palette, arcade, terminal, a black hole, 3D, motion) **without** hurting
load time, accessibility or the content that actually gets interviews.

Ground rules for every phase:

- **Theme-first.** Every new feature reads colours from CSS variables, never hex.
- **Lazy by default.** Games, WebGL and 3D load with `next/dynamic` + `ssr: false`
  from a Client Component, only when shown. The first paint of `/` must not grow
  by more than ~15 KB gzipped from these features.
- **Reduced motion is respected.** `prefers-reduced-motion` (and an in-app
  toggle) swaps WebGL/animation for a static frame.
- **Keyboard + touch.** Everything playable with a keyboard; games get on-screen
  controls on touch devices. Global shortcuts never fire while typing in inputs.
- **Pause when hidden.** All `requestAnimationFrame` loops stop on
  `visibilitychange` / when off-screen (IntersectionObserver).
- **No new state libraries.** React state + context + a tiny `lib/storage.ts`.
- Read `node_modules/next/dist/docs/` before using a Next API (see AGENTS.md).
  Relevant guides: `view-transitions.md`, `preventing-flash-before-hydration.md`,
  `lazy-loading.md`.

---

## Phase 0 — Foundations (small, unblocks everything) ✅ done 2026-10-09

| Task | Files |
| --- | --- |
| Move remaining hard-coded hex/rgba in components to tokens (8 occurrences; glow shadows use `color-mix()` on tokens) | `components/**`, `app/globals.css` |
| Add RGB-free semantic tokens needed later: `--color-glow`, `--color-game-bg`, `--color-game-fg` | `app/globals.css` |
| `lib/storage.ts`: try/catch wrapper around `localStorage` (get/set JSON, namespaced `hk:`) | new |
| `lib/prefs.tsx`: `PrefsProvider` (theme, motion: `auto/reduced/full`, sound on/off, crt) + `usePrefs()` | new |
| `lib/hotkeys.ts`: `useHotkey(combo, handler)` that ignores events from inputs/textareas/contenteditable | new |
| `lib/useReducedMotion.ts`: combines media query with the `motion` pref | moved to Phase 2 (first user) |
| `lib/useAnimationFrame.ts`: rAF loop with dt, auto-pauses on hidden tab | moved to Phase 2 (first user) |

Done when: lint/tsc/build pass and nothing looks different.

---

## Phase 1 — Editor chrome: themes, command palette, status bar ✅ done 2026-10-09

### 1a. Theme switcher
- Themes defined as `[data-theme="…"]` blocks overriding the `@theme` variables:
  `night-owl` (default, current), `dracula`, `monokai`, `tokyo-night`,
  `github-light`, `solarized-dark`. `github-light` also flips `color-scheme`.
- No-flash: inline `<script>` in `app/layout.tsx` `<head>` reads the stored theme
  and sets `data-theme` on `<html>` before paint (per
  `preventing-flash-before-hydration.md`); add `suppressHydrationWarning` on `<html>`.
- `lib/themes.ts` holds the list (id, label, swatches) — used by the palette,
  the status bar and the settings page.
- `viewport.themeColor` stays the default theme; update `<meta name=theme-color>`
  client-side on switch.
- Keystatic admin is untouched (it is outside `(site)`).

### 1b. Command palette (`Ctrl/⌘+K`, also `Ctrl+P`)
- `components/palette/CommandPalette.tsx`: modal `<dialog>`, fuzzy filter
  (small hand-written scorer, no dependency), arrow keys + Enter, Esc closes and
  restores focus.
- Command sources: pages, every project (from `getProjects()` passed down from
  the server layout), themes, "play <game>", "open terminal", "toggle sound",
  "toggle CRT", "download resume", "copy email", and the secret
  `> summon black hole` (Phase 4).
- Prefix modes like VS Code: `>` commands, `@` projects, `#` themes.
- A visible `⌘K` hint button in the header for mouse users.

### 1c. Status bar
- `components/layout/StatusBar.tsx` between `<main>` and `Footer` (or merged into
  the footer on mobile): `⎇ main`, current route as a file path
  (`src/projects/rezerv.tsx`), `Ln x, Col y` following the mouse, theme name
  (click → palette in `#` mode), live Yangon time, availability dot.
- Hidden below `md`.

Done when: theme survives reload with no flash, palette works keyboard-only,
axe shows no new violations.

---

## Phase 2 — Arcade ✅ done 2026-10-09 (all five games; 2048/Minesweeper/Wordle remain optional)

### 2a. Game shell
- `components/arcade/Arcade.tsx` replaces `<SnakeGame />` on `/`: the same
  bolted glass console, with a tab strip on top (`snake.ts`, `breakout.ts`, …).
- `components/arcade/types.ts`: every game implements
  `{ id, label, load: () => import(...) }` and receives
  `{ width, height, onScore, onEnd, controls }`.
- Shared pieces: `GameCanvas` (DPR-aware canvas + `useAnimationFrame`),
  `TouchPad` (arrows / fire), `useHighScore(id)` (storage), `Overlay`
  (start / paused / game over / win), pause on blur and on `P`.
- `// complete the game to continue` still applies: winning any game shows a
  "continue → _about-me" CTA. `skip` stays.
- `/arcade` route: the same console full size, with all games, high scores and
  a mobile layout (the home page hides the console on small screens today).
- Optional 8-bit sounds via WebAudio oscillators (no audio files), off by default.

### 2b. Games (each one lazy chunk)
1. **Snake** — port the current game onto the shell, unchanged rules.
2. **Breakout: Stack Smash** — bricks are tech-stack icons from
   `content/tech-stack.json` (reuse the icon mapping from `TechStack.tsx`);
   clearing a brick shows its name; win = unlock message.
3. **Typing test** — type a real snippet (Laravel, React, Odoo) sourced from a
   new `content/snippets.json`; live WPM/accuracy, syntax colours from tokens.
4. **Bug Invaders** — Space Invaders with 🐛 sprites drawn on canvas; waves get
   faster; boss is a "null pointer".
5. **Event Horizon** (ties into Phase 4) — Asteroids-style ship orbiting a
   black hole with real-ish gravity (`a = GM/r²`), collect data packets,
   don't cross the horizon.
6. Later/optional: 2048 with tech names, Minesweeper, daily dev-word Wordle.

Done when: each game is its own chunk (check `next build` output), 60 fps on a
mid laptop, playable by keyboard and touch, high scores persist.

---

## Phase 3 — Terminal (`/terminal`, also a palette command and `` Ctrl+` ``) ✅ done 2026-10-09 (Konami code moves to Phase 4)

- `components/terminal/Terminal.tsx`: prompt `htun@portfolio:~$`, history (↑/↓),
  Tab completion, `Ctrl+L` clear, clickable output links.
- Commands registry `components/terminal/commands.ts`, data from `lib/content`:
  `help`, `whoami`, `ls [projects|skills]`, `cat about.md`, `open <project>`,
  `cd <page>` (navigates), `theme <name>`, `play <game>`, `contact`,
  `resume`, `history`, `clear`, `neofetch` (ASCII art + stack).
- Easter eggs: `sudo hire-me`, `rm -rf /` → **black hole** (Phase 4),
  `vim` (you can't quit), `coffee`, `exit`, Konami code anywhere on the site.
- Opens as a bottom drawer panel on any page (like VS Code's integrated
  terminal), and full screen at `/terminal`.

---

## Phase 4 — Black hole 🕳️ ✅ done 2026-10-09

One reusable WebGL piece, used in several places.

### 4a. `components/blackhole/BlackHole.tsx`
- Raw WebGL2 full-screen quad + fragment shader (no three.js needed, ~5 KB):
  ray-marched Schwarzschild-style light bending over a procedural starfield,
  a glowing accretion disk with Doppler brightening on one side, photon ring,
  slow rotation. Colours come from the active theme tokens (read via
  `getComputedStyle`, passed as uniforms) so it matches every theme.
- Props: `intensity`, `mass` (animatable), `interactive` (mouse moves the
  camera), `quality` (auto-drops resolution if frame time > 20 ms).
- Fallbacks: no WebGL2 or reduced motion → a CSS radial-gradient + `conic-gradient`
  still image.

### 4b. Where it appears
1. **404 page** — "this route fell past the event horizon"; the 404 text slowly
   spirals in; `> escape to _hello` link.
2. **The "collapse" easter egg** (`rm -rf /`, palette `> summon black hole`,
   Konami code): the page's real DOM elements get pulled to the centre with the
   Web Animations API (spiral path, scale → 0, stretch/blur), the shader fades in,
   holds, then a "kernel panic → rebooting…" boot log types out and the page
   restores. Esc skips it at any time.
3. **Hello hero option** — a tiny, slow black hole behind the name replacing
   the blurred blobs, only on desktop with full motion (setting toggle).
4. **Event Horizon** game background (Phase 2b #5).
5. **Intro / preloader** (added 2026-10-09): first page of each session boots
   out of a black hole. Skipped with reduced motion; click or Esc skips.

Done when: shader runs ≥ 50 fps at 1080p on an integrated GPU, the easter egg
fully restores the page (focus, scroll), and the 404 works without JS.

---

## Phase 5 — 3D ✅ done 2026-10-09 (globe + tilt cards; desk scene skipped)

Built without three.js: the globe is real links on a Fibonacci sphere,
projected in JS (~5 KB vs ~200 KB for react-three-fiber + drei), so text
stays crisp, focusable and crawlable. Original plan kept below for reference.

### Original plan: react-three-fiber

Deps: `three`, `@react-three/fiber`, `@react-three/drei` (pin exact versions).
Only loaded on routes that use them.

1. **Tech-stack globe** on `/about-me`: icons on a Fibonacci sphere, drag to
   spin, hover a node → tooltip + highlight matching projects; reduced motion →
   current flat list.
2. **3D project cards** on `/projects`: lighter CSS 3D tilt + glare (no three.js)
   on hover; keep the grid accessible.
3. Optional: **desk scene** on hello (monitor rendering a live mini page,
   keyboard keys light up as you type) — only after 1–2 prove the perf budget.

---

## Phase 6 — Motion polish

- **Route transitions** with React `<ViewTransition>` (built into the App Router,
  no library): tab-slide between top-level pages, directional for prev/next
  project, shared-element morph from project card cover → project hero.
- Typewriter on `> {role}`; about text "types itself" once per session.
- Count-up stats, scroll reveal on the experience timeline (CSS
  `animation-timeline: view()` with fallback).
- Cursor-follow glow on the hello page, magnetic primary buttons,
  smooth folder open/close in the sidebar file tree.
- **CRT mode** (pref): scanlines + slight curvature overlay, mainly for arcade.
- Only add `motion` (Motion One / framer) if something can't be done with
  CSS + ViewTransition + WAAPI.

---

## Phase 7 — Quality gate (do alongside, finish here)

- GitHub Action: lint, `tsc --noEmit`, `next build` (backlog #8).
- Playwright smoke: theme persists, palette navigation, each game starts,
  terminal commands, 404 black hole renders, reduced-motion path.
- Lighthouse budget on `/`: Performance ≥ 90, A11y 100, CLS < 0.05.
- Manual pass on a phone (touch games, drawer terminal, palette).

---

## Suggested order & size

| # | Phase | Size |
| --- | --- | --- |
| 0 | Foundations | S |
| 1 | Themes + palette + status bar | M |
| 2 | Arcade shell + Snake port + Breakout + Typing | L |
| 3 | Terminal | M |
| 4 | Black hole (404 + easter egg) | M–L |
| 2b | Bug Invaders + Event Horizon | M |
| 6 | Route transitions + motion polish | M |
| 5 | 3D globe | M |
| 7 | QA gate (ongoing) | S |

Each phase ships as its own branch + PR so the site is always deployable.

## Open questions (defaults chosen; change any)

- Sound: off by default — yes.
- `/arcade` and `/terminal` as real routes (indexed in sitemap) — yes.
- Hello hero black hole on by default for desktop — no, opt-in via setting.
- Content still matters most: the backlog items (screenshots, case-study
  numbers) can be done in parallel by you.
