import { expect, test } from "@playwright/test";
import { ANSWER_KEY, NOON, WRONG_KEY, answerCards, atTime, setServerTime, startGame } from "./helpers";

test.beforeEach(async ({ page, request }) => {
  await atTime(page, request, NOON);
});

test("play, refresh, and no second attempt", async ({ page }) => {
  await startGame(page);
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByRole("status")).toContainText("Solved");
  await expect(page.getByRole("heading", { name: "Solved" })).toBeFocused();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Solved" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start the clock" })).toHaveCount(0);
  await expect(page.getByText("You've played today's puzzle. Here's how it went.")).toBeVisible();
});

test("time runs out", async ({ page, request }) => {
  await startGame(page);
  await setServerTime(request, new Date(NOON.getTime() + 61_000));
  await page.clock.fastForward(61_000);
  await expect(page.getByRole("status")).toContainText("Time's up");
  await expect(page.getByText("Answer", { exact: true })).toBeVisible();
});

test("a wrong answer shows the answer and the rule", async ({ page }) => {
  await startGame(page);
  await page.keyboard.press(WRONG_KEY);
  await expect(page.getByRole("status")).toContainText("Missed");
  const rule = page.getByRole("region", { name: "The rule" });
  await expect(rule.getByText("Your pick", { exact: true })).toBeVisible();
  await expect(rule.getByText("Answer", { exact: true })).toBeVisible();
  await expect(rule.getByRole("list", { name: "Completed sequence" }).getByText(/the answer, /)).toHaveCount(1);
});

test("an answer locks instantly; mashing keys and clicking change nothing", async ({ page }) => {
  await startGame(page);
  await page.keyboard.press(ANSWER_KEY);
  await page.keyboard.press(WRONG_KEY);
  await answerCards(page)
    .first()
    .click({ force: true, timeout: 500 })
    .catch(() => {});
  await expect(page.getByRole("status")).toContainText("Solved");
  expect(await page.request.post("/api/attempts").then((r) => r.json())).toMatchObject({ state: "finished", result: { choice: 2 } });
});

test("the server refuses a second attempt for the same browser", async ({ page }) => {
  await startGame(page);
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByRole("status")).toContainText("Solved");
  const again = await page.request.post("/api/attempts");
  expect((await again.json()).state).toBe("finished");
});

test("tiles only reach the browser after Start", async ({ page }) => {
  const responses: string[] = [];
  page.on("response", async (r) => {
    if (r.url().includes("/api/")) responses.push(await r.text().catch(() => ""));
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start the clock" })).toBeEnabled();
  expect(responses.join("\n")).not.toMatch(/"sequence"|"choices"|answerIndex/);
  expect(await page.content()).not.toMatch(/answerIndex/);
});

test("refreshing mid-game keeps the clock running", async ({ page, request }) => {
  await startGame(page);
  await setServerTime(request, new Date(NOON.getTime() + 15_000));
  await page.clock.fastForward(15_000);
  await page.reload();
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeVisible();
  await expect(page.locator(".clock .digits")).toHaveText(/^0:4[3-5]$/);
});
