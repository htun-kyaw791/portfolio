import { expect, test } from "./fixtures";

const noHorizontalScroll = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

for (const path of ["/", "/about-me", "/projects", "/arcade", "/terminal", "/contact-me"]) {
  test(`${path} fits a phone screen`, async ({ page, consoleErrors }) => {
    await page.goto(path);
    expect(await noHorizontalScroll(page)).toBe(true);
    void consoleErrors;
  });
}

test("menu opens, navigates and closes", async ({ page, consoleErrors }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator("#mobile-menu").getByRole("link", { name: "_arcade" }).click();
  await expect(page).toHaveURL(/\/arcade$/);
  await expect(page.locator("#mobile-menu")).toBeHidden();
  void consoleErrors;
});

test("arcade is playable by touch", async ({ page, consoleErrors }) => {
  await page.goto("/arcade#snake");
  await page.getByRole("tabpanel").getByRole("button", { name: "start-game" }).tap();
  await page.getByRole("button", { name: "left" }).tap();
  await expect(page.getByRole("tabpanel").getByRole("button", { name: "start-game" })).toBeHidden();
  void consoleErrors;
});
