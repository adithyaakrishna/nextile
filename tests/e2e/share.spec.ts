import { expect, test } from "@playwright/test";
import { ANSWER_KEY, NOON, atTime, startGame } from "./helpers";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test("desktop share copies the exact spoiler-free text, and the link shows only the score", async ({ page, request }) => {
  await atTime(page, request, NOON);
  await startGame(page);
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByRole("status")).toContainText("Solved");

  await page.getByRole("button", { name: "Share result" }).click();
  await expect(page.getByText("Copied to clipboard")).toBeVisible();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toMatch(
    /^Nextile #003\nSolved in \d+\.\d seconds\nScore: \d+\/100\n[■□]{10}\nStreak: 1 day\n\nPlay today's puzzle: http:\/\/localhost:3200\/s\/[A-Za-z0-9]{10}\nBuilt on Teeny Tiny Computer\.$/,
  );
  expect(text.toLowerCase()).not.toMatch(/circle|square|triangle|diamond|blue|pink|yellow|solid|outline|striped/);

  const link = text.match(/http\S+/)![0];
  await page.goto(link);
  await expect(page.getByRole("heading", { name: /Someone solved #003 in \d+\.\d seconds\./ })).toBeVisible();
  await expect(page.getByText("Can you beat it?")).toBeVisible();
  expect(await page.title()).toMatch(/Nextile #003: solved in \d+\.\d s/);
  expect((await page.locator("body").innerText()).toLowerCase()).not.toMatch(/circle|square|triangle|diamond|striped|outlined|blue|pink|yellow/);
  await page.getByRole("link", { name: "Play today's puzzle" }).click();
  await expect(page.getByRole("heading", { name: "Solved" })).toBeVisible();

  const og = await request.get(`${new URL(link).pathname}/opengraph-image`);
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toBe("image/png");
});

test("the home page has a static preview image", async ({ request }) => {
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toBe("image/png");
});

test("an unknown share link is a 404", async ({ request }) => {
  expect((await request.get("/s/doesnotexist")).status()).toBe(404);
});
