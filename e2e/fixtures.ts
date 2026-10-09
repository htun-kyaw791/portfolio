import { test as base, expect, type Page } from "@playwright/test";

/**
 * Every test starts with the black hole intro already "seen" (it holds the
 * page back ~3s) and collects console errors, failing the test if any appear.
 * Tests that need the intro use `withIntro`.
 */
export const test = base.extend<{ consoleErrors: string[]; withIntro: boolean; allowedConsole: RegExp[] }>({
  withIntro: [false, { option: true }],
  allowedConsole: [[], { option: true }],
  // (`provide` is Playwright's fixture callback, usually called `use`; renamed
  // so the React hooks lint rule doesn't mistake it for a hook)
  consoleErrors: async ({ page, withIntro, allowedConsole }, provide) => {
    if (!withIntro) await page.addInitScript(() => sessionStorage.setItem("hk:intro", "1"));
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await provide(errors);
    expect(errors.filter((e) => !allowedConsole.some((re) => re.test(e))), "console errors").toEqual([]);
  },
});

export { expect };

/** Open the command palette and run the first match for `query`. */
export async function palette(page: Page, query: string) {
  await page.keyboard.press("Control+k");
  const input = page.getByRole("combobox");
  await expect(input).toBeVisible();
  await input.fill(query);
  await input.press("Enter");
}
