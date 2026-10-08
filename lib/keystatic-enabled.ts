import config from "../keystatic.config";

/**
 * Whether the admin (/keystatic) and its API may run.
 * - local mode writes straight to disk with no login: dev server only.
 * - GitHub mode needs the app credentials; without them (e.g. before they're added on
 *   Vercel) the admin is switched off instead of failing the build.
 */
export const keystaticEnabled =
  config.storage.kind === "local"
    ? process.env.NODE_ENV === "development"
    : process.env.NODE_ENV === "development" ||
      Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_GITHUB_CLIENT_SECRET && process.env.KEYSTATIC_SECRET);
