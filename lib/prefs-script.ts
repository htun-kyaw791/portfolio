// Not a client module, so the server layout can inline the string.
// Mirrors applyPrefs() in lib/prefs.ts: runs in <head> before first paint.

export const PREFS_KEY = "prefs";
/** sessionStorage flag: the black hole intro already played in this tab. */
export const INTRO_KEY = "hk:intro";

// Written as a normal function so it can be read and type-checked; its source
// text is what gets inlined. It must not reference anything outside itself.
function boot(prefsKey: string, introKey: string) {
  try {
    const p = JSON.parse(localStorage.getItem("hk:" + prefsKey) || "{}") || {};
    const r = document.documentElement;
    if (typeof p.theme === "string") r.setAttribute("data-theme", p.theme);
    if (p.motion === "reduced" || p.motion === "full") r.setAttribute("data-motion", p.motion);
    if (p.crt === true) r.setAttribute("data-crt", "");
    if (p.hero === "blackhole") r.setAttribute("data-hero", "blackhole");

    // intro: first page of a session, not the admin, and only when motion is welcome
    const osReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reduced = p.motion === "reduced" || (p.motion !== "full" && osReduced);
    if (!reduced && !sessionStorage.getItem(introKey) && !location.pathname.startsWith("/keystatic")) {
      r.setAttribute("data-intro", "pending");
    }
  } catch {
    // storage blocked: defaults, no intro
  }
}

export const prefsInlineScript = `(${boot.toString()})(${JSON.stringify(PREFS_KEY)}, ${JSON.stringify(INTRO_KEY)})`;
