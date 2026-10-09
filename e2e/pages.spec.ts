import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

const pages = [
  { path: "/", heading: /Htun Kyaw/ },
  { path: "/about-me", heading: /_about-me/ },
  { path: "/projects", heading: /_projects|projects/i },
  { path: "/projects/rezerv-datatable", heading: /Rezerv Data Table/ },
  { path: "/arcade", heading: /_arcade/ },
  { path: "/terminal", heading: /Terminal/ },
  { path: "/contact-me", heading: /_contact-me/ },
];

for (const { path, heading } of pages) {
  test(`${path} renders without errors and passes axe`, async ({
    page,
    consoleErrors,
  }) => {
    // measure settled colours: reveals and typing animate opacity/width
    await page.emulateMedia({ reducedMotion: "reduce" });
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: heading }),
    ).toBeAttached();
    void consoleErrors;

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // decorative canvases (games, black hole) have no text to check
      .exclude("canvas")
      .analyze();
    const summary = results.violations.map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes.length}× e.g. ${v.nodes[0]?.target.join(" ")}`,
    );
    expect(summary, "accessibility violations").toEqual([]);
  });
}

test.describe("404", () => {
  // the browser logs the document's own 404 status as a console error
  test.use({ allowedConsole: [/status of 404/] });

  test("unknown routes return 404 with the event horizon page", async ({
    page,
    consoleErrors,
  }) => {
    const res = await page.goto("/definitely-not-a-page");
    expect(res?.status()).toBe(404);
    await expect(
      page.getByText("this route fell past the event horizon"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /escape to _hello/ }),
    ).toBeVisible();
    void consoleErrors;
  });
});
