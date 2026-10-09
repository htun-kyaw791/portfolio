// localStorage that never throws (private mode, blocked storage, SSR).
// Keys are namespaced so they don't collide with Keystatic's own entries.

const PREFIX = "hk:";

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage unavailable: the preference just won't persist
  }
}
