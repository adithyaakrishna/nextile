import { expect, test } from "@playwright/test";
import { NOON, answerCards, atTime } from "./helpers";

test.beforeEach(async ({ page, request }) => {
  await atTime(page, request, NOON);
});

test("keyboard only: Enter starts, Tab moves through the cards in order, Enter answers", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start the clock" })).toBeEnabled();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeFocused();

  const cards = answerCards(page);
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Tab");
    await expect(cards.nth(i)).toBeFocused();
    await expect(cards.nth(i)).toHaveAccessibleName(new RegExp(`^Option ${i + 1}: `));
  }
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(cards.nth(1)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Missed");
});

test("cards announce their end state after the lock, and keep focus", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start the clock" })).toBeEnabled();
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Solved");
  await expect(page.getByRole("region", { name: "The rule" }).getByText(/Option 3: .*Your pick\. Correct\./)).toHaveCount(1);
});

test("holding a number key does not repeat", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start the clock" })).toBeEnabled();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeFocused();
  await page.keyboard.down("3");
  await page.keyboard.down("3");
  await page.keyboard.up("3");
  await expect(page.getByRole("status")).toContainText("Solved");
  expect(await page.request.post("/api/attempts").then((r) => r.json())).toMatchObject({ state: "finished", result: { choice: 2 } });
});
