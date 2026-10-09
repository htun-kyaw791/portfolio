import { expect, palette, test } from "./fixtures";

test("summon collapses the page and restores it exactly", async ({ page, consoleErrors }) => {
  await page.goto("/projects");
  const before = await page.locator("[data-frame]").innerHTML();

  await palette(page, "summon black hole");
  const overlay = page.getByRole("alertdialog", { name: /Black hole/ });
  await expect(overlay).toBeVisible();
  // the page's own elements are being animated
  // generous timeout: parallel workers share one GPU and the code is lazy-loaded
  await expect.poll(() => page.evaluate(() => document.getAnimations().length), { timeout: 15_000 }).toBeGreaterThan(10);

  await page.keyboard.press("Escape");
  await expect(overlay).toBeHidden();
  await expect(page.getByText("system restored")).toBeVisible();
  // nothing left mid-flight, and the DOM is what it was
  expect(await page.evaluate(() => document.getAnimations().filter((a) => a.effect?.getComputedTiming().fill === "forwards").length)).toBe(0);
  expect(await page.locator("[data-frame]").innerHTML()).toBe(before);
  void consoleErrors;
});

test("rm -rf / in the terminal summons it too", async ({ page, consoleErrors }) => {
  await page.goto("/terminal");
  const prompt = page.getByRole("textbox", { name: "Terminal command" });
  await prompt.fill("rm -rf /");
  await prompt.press("Enter");
  await expect(page.getByRole("alertdialog", { name: /Black hole/ })).toBeVisible();
  // panic screen, then reboot on its own
  await expect(page.getByText("Kernel panic").first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("system restored")).toBeVisible({ timeout: 10_000 });
  void consoleErrors;
});

test.describe("intro", () => {
  test.use({ withIntro: true });

  test("plays once per session and reveals the page", async ({ page, consoleErrors }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-intro", /pending|playing/);
    await expect(page.getByText("click to skip")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done", { timeout: 8_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.reload();
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", /./);
    void consoleErrors;
  });

  test("click skips it", async ({ page, consoleErrors }) => {
    // don't wait for the load event: by then most of the 3s intro has played
    await page.goto("/about-me", { waitUntil: "commit" });
    await page.getByText("click to skip").waitFor();
    // click by position: the busy WebGL frame loop keeps Playwright's
    // "element is stable" check from settling before the intro ends
    await page.mouse.click(40, 40);
    // the intro runs ~3s on its own; ending within 1s means the click skipped it
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done", { timeout: 1_000 });
    void consoleErrors;
  });
});
