import { expect, palette, test } from "./fixtures";

test("palette jumps to a project", async ({ page, consoleErrors }) => {
  await page.goto("/");
  await palette(page, "@rezerv");
  await expect(page).toHaveURL(/\/projects\/rezerv-datatable$/);
  void consoleErrors;
});

test("theme persists across reloads without a flash", async ({ page, consoleErrors }) => {
  await page.goto("/about-me");
  await palette(page, "#dracula");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dracula");
  await page.reload();
  // set by the inline script before React runs
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dracula");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(33, 34, 44)");
  void consoleErrors;
});

test("status bar shows the route as a file", async ({ page, consoleErrors }) => {
  await page.goto("/projects/flowdesk");
  await expect(page.getByText("src/projects/flowdesk.tsx")).toBeVisible();
  void consoleErrors;
});

test("terminal drawer opens with Ctrl+` and keeps scrollback across pages", async ({ page, consoleErrors }) => {
  await page.goto("/projects");
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("Control+`");
  const prompt = page.getByRole("textbox", { name: "Terminal command" });
  await expect(prompt).toBeFocused();
  await prompt.fill("whoami");
  await prompt.press("Enter");
  await expect(page.getByRole("log", { name: "Terminal output" })).toContainText("Htun Kyaw");
  await prompt.fill("cd about-me");
  await prompt.press("Enter");
  await expect(page).toHaveURL(/\/about-me$/);
  await expect(page.getByRole("log", { name: "Terminal output" })).toContainText("whoami");
  void consoleErrors;
});
