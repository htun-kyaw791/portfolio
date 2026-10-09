import { expect, test } from "./fixtures";

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce", withIntro: true });

  test("no intro, no typewriter, still renders", async ({ page, consoleErrors }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", /./);
    const animation = await page.locator(".typewriter").evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    void consoleErrors;
  });

  test("the site's Motion: full overrides the OS setting", async ({ page, consoleErrors }) => {
    await page.addInitScript(() => localStorage.setItem("hk:prefs", JSON.stringify({ motion: "full" })));
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
    await expect(page.locator("html")).toHaveAttribute("data-intro", /pending|playing|done/);
    void consoleErrors;
  });
});

test("navigation between tabs uses a directional view transition", async ({ page, consoleErrors }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const w = window as unknown as { __types: string[] };
    w.__types = [];
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = ((arg: { types?: string[] }) => {
      w.__types.push(...(arg?.types ?? []));
      return original(arg as never);
    }) as typeof document.startViewTransition;
  });
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "_projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  expect(await page.evaluate(() => (window as unknown as { __types: string[] }).__types)).toContain("nav-forward");
  void consoleErrors;
});
