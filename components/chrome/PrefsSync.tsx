"use client";

import { useLayoutEffect } from "react";
import { applyPrefs, getPrefs } from "@/lib/prefs";

/**
 * Re-applies stored prefs on mount. The inline script already did this before
 * paint; in development Strict Mode resets <html> attributes on remount, and
 * the meta theme-color needs updating once the page exists.
 */
export default function PrefsSync() {
  useLayoutEffect(() => {
    applyPrefs(getPrefs());
  }, []);
  return null;
}
