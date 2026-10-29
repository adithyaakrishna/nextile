import { expect, test } from "@playwright/test";
import { ANSWER_KEY, NOON, atTime, startGame } from "./helpers";

test("the archive lists days to today with this browser's results, and views are read-only", async ({ page, request }) => {
  await atTime(page, request, NOON);
  await page.goto("/archive");
  const rows = page.getByRole("row");
  await expect(rows).toHaveCount(4); // header plus #003, #002, #001
  await expect(page.getByRole("link", { name: "Play #003" })).toBeVisible();

  await startGame(page);
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByRole("status")).toContainText("Solved");

  await page.goto("/archive");
  await expect(page.getByRole("row", { name: /#003/ })).toContainText("Solved in");
  await expect(page.getByRole("row", { name: /#002/ })).toContainText("Not played");
  await page.getByRole("link", { name: "View #002" }).click();
  await expect(page.getByRole("heading", { name: "The rule" })).toBeVisible();
  await expect(page.getByText("You didn't play this one.")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Option/ })).toHaveCount(0);
});
