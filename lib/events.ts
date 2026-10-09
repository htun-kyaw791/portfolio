// Small window-event bus so chrome pieces (palette, toasts) can be triggered
// from anywhere without threading context through server components.

export type PaletteOpenDetail = { query?: string };
export type ToastDetail = { message: string };

export const PALETTE_OPEN = "hk:palette-open";
export const TOAST = "hk:toast";

/** Open the command palette, optionally pre-filled (">" commands, "@" projects, "#" themes). */
export function openPalette(query = "") {
  window.dispatchEvent(new CustomEvent<PaletteOpenDetail>(PALETTE_OPEN, { detail: { query } }));
}

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST, { detail: { message } }));
}

export const BLACKHOLE = "hk:blackhole";
export const TERMINAL_TOGGLE = "hk:terminal-toggle";

/** Ask the page to collapse into a black hole (easter egg; see components/blackhole). */
export function summonBlackHole() {
  window.dispatchEvent(new Event(BLACKHOLE));
}

/** Open/close the integrated terminal drawer. */
export function toggleTerminal() {
  window.dispatchEvent(new Event(TERMINAL_TOGGLE));
}
