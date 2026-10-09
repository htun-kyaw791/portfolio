import { expect, test } from "./fixtures";

async function run(page: import("@playwright/test").Page, command: string) {
  const prompt = page.getByRole("textbox", { name: "Terminal command" });
  await prompt.fill(command);
  await prompt.press("Enter");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/terminal");
  await expect(page.getByRole("textbox", { name: "Terminal command" })).toBeFocused();
});

test("ls, cat and tab completion", async ({ page, consoleErrors }) => {
  const log = page.getByRole("log", { name: "Terminal output" });
  await run(page, "ls projects");
  await expect(log).toContainText("rezerv-datatable");

  const prompt = page.getByRole("textbox", { name: "Terminal command" });
  await prompt.fill("cat rez");
  await prompt.press("Tab");
  await expect(prompt).toHaveValue("cat rezerv-datatable ");
  await prompt.press("Enter");
  await expect(log).toContainText("# Rezerv Data Table");
  void consoleErrors;
});

test("typos get a suggestion, history recalls", async ({ page, consoleErrors }) => {
  const log = page.getByRole("log", { name: "Terminal output" });
  await run(page, "gti log");
  await expect(log).toContainText("did you mean");
  await run(page, "git log");
  await expect(log).toContainText("(HEAD -> main)");
  const prompt = page.getByRole("textbox", { name: "Terminal command" });
  await prompt.press("ArrowUp");
  await expect(prompt).toHaveValue("git log");
  void consoleErrors;
});

test("vim traps you until :q", async ({ page, consoleErrors }) => {
  const log = page.getByRole("log", { name: "Terminal output" });
  await run(page, "vim");
  await run(page, "exit");
  await expect(log).toContainText("E492");
  await run(page, ":q");
  await expect(log).toContainText("you escaped vim");
  void consoleErrors;
});

test("theme command switches theme", async ({ page, consoleErrors }) => {
  await run(page, "theme monokai");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "monokai");
  void consoleErrors;
});
