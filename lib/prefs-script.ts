// Not a client module, so the server layout can inline the string.
// Mirrors applyPrefs() in lib/prefs.ts: runs in <head> before first paint.

export const PREFS_KEY = "prefs";

export const prefsInlineScript = `(function(){try{var p=JSON.parse(localStorage.getItem("hk:${PREFS_KEY}")||"{}")||{};var r=document.documentElement;if(typeof p.theme==="string")r.setAttribute("data-theme",p.theme);if(p.motion==="reduced"||p.motion==="full")r.setAttribute("data-motion",p.motion);if(p.crt===true)r.setAttribute("data-crt","")}catch(e){}})()`;
