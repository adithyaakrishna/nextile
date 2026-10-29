import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { ANSWER_KEY, NOON, atTime, startGame } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoViolations(page: Page, label: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(violations.map((v) => `${label}: ${v.id} (${v.nodes.length}) ${v.help}`)).toEqual([]);
}

test.beforeEach(async ({ page, request }) => {
  await atTime(page, request, NOON);
});

test("landing, playing and results have no axe violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start the clock" })).toBeEnabled();
  await expectNoViolations(page, "landing");
  await page.getByRole("button", { name: "Start the clock" }).click();
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeVisible();
  await page.waitForTimeout(400);
  await expectNoViolations(page, "playing");
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByRole("status")).toContainText("Solved");
  await page.waitForTimeout(400);
  await expectNoViolations(page, "results");
});

test("the dark theme has no axe violations", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await startGame(page);
  await page.waitForTimeout(400);
  await expectNoViolations(page, "playing, dark");
});

for (const path of ["/how-to-play", "/about", "/archive", "/archive/2026-11-17"]) {
  test(`${path} has no axe violations`, async ({ page }) => {
    await page.goto(path);
    await expectNoViolations(page, path);
  });
}

test("the share page has no axe violations", async ({ page }) => {
  await startGame(page);
  await page.keyboard.press(ANSWER_KEY);
  const result = await page.request.post("/api/attempts").then((r) => r.json());
  await page.goto(`/s/${result.result.shareId}`);
  await expectNoViolations(page, "share page");
});

test("reduced motion removes transitions but keeps the game playable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startGame(page);
  const duration = await answerCardTransition(page);
  expect(duration).toBe("0s");
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByRole("status")).toContainText("Solved");
});

async function answerCardTransition(page: Page): Promise<string> {
  return page.locator(".om-card").first().evaluate((el) => getComputedStyle(el).transitionDuration.split(",")[0].trim());
}
