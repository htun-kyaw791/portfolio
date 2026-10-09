import { expect, test } from "./fixtures";

const games = [
  { id: "snake", start: "start-game" },
  { id: "breakout", start: "start-game" },
  { id: "invaders", start: "start-game" },
  { id: "horizon", start: "launch" },
];

for (const { id, start } of games) {
  test(`${id} loads and starts`, async ({ page, consoleErrors }) => {
    await page.goto(`/arcade#${id}`);
    await expect(page.getByRole("tab", { name: `${id}.ts` })).toHaveAttribute("aria-selected", "true");
    const button = page.getByRole("tabpanel").getByRole("button", { name: start });
    await expect(button).toBeVisible();
    await button.click();
    // the start overlay goes away while playing
    await expect(button).toBeHidden();
    void consoleErrors;
  });
}

test("typing test counts a typo against accuracy", async ({ page, consoleErrors }) => {
  await page.goto("/arcade#typing");
  const input = page.getByRole("textbox", { name: /Type the snippet/ });
  await input.focus();
  await page.keyboard.type("§§");
  await expect(page.getByRole("tabpanel")).toContainText("0%");
  void consoleErrors;
});

test("tabs switch with arrow keys and update the hash", async ({ page, consoleErrors }) => {
  await page.goto("/arcade");
  await page.getByRole("tab", { name: "snake.ts" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#breakout$/);
  await expect(page.getByRole("tab", { name: "breakout.ts" })).toBeFocused();
  void consoleErrors;
});
