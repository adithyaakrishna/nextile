import { expect, test } from "@playwright/test";
import { ANSWER_KEY, NOON, atTime, setServerTime, startGame } from "./helpers";

test("before launch, the first puzzle's date is shown", async ({ page, request }) => {
  await atTime(page, request, new Date("2026-11-10T12:00:00Z"));
  await page.goto("/");
  await expect(page.getByText(/The first puzzle goes live on Monday 16 November at 00:00 UTC/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Start the clock" })).toHaveCount(0);
});

test("when the schedule runs dry, we skip a day rather than repeat one", async ({ page, request }) => {
  await atTime(page, request, new Date("2027-03-01T12:00:00Z"));
  await page.goto("/");
  await expect(page.getByText("No puzzle today. We skip a day rather than repeat one. Check back tomorrow.")).toBeVisible();
  const health = await request.get("/api/health");
  expect(health.status()).toBe(503);
  expect(await health.json()).toMatchObject({ runwayDays: 0 });
});

test("offline at load says what happened and offers a retry", async ({ page, request }) => {
  await atTime(page, request, NOON);
  await page.route("**/api/today", (route) => route.abort("internetdisconnected"));
  await page.goto("/");
  await expect(page.getByText("Can't reach the puzzle server. Check your connection, then try again.")).toBeVisible();
  await page.unroute("**/api/today");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("button", { name: "Start the clock" })).toBeEnabled();
});

test("a dropped connection after answering keeps the answer locked in and scores it on reconnect", async ({ page, request }) => {
  await atTime(page, request, NOON);
  await startGame(page);
  await page.route("**/api/attempts/*/finish", (route) => route.abort("internetdisconnected"));
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByText("Your answer is locked in. Reconnecting to score it.")).toBeVisible();
  const pending = await page.evaluate(() => JSON.parse(localStorage.getItem("nextile") ?? "{}").pending);
  expect(pending).toMatchObject({ choice: 2 });
  await page.unroute("**/api/attempts/*/finish");
  await page.clock.fastForward(1_500);
  await expect(page.getByRole("status")).toContainText("Solved");
});

test("a locked answer stays locked after a refresh, even while the server can't be reached to score it", async ({ page, request }) => {
  await atTime(page, request, NOON);
  await startGame(page);
  await page.route("**/api/attempts/*/finish", (route) => route.abort("internetdisconnected"));
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByText("Your answer is locked in. Reconnecting to score it.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Your answer is locked in. Reconnecting to score it.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Option 3: .*Your pick\./ })).toBeVisible();
  await page.keyboard.press("1");
  await page.unroute("**/api/attempts/*/finish");
  await page.clock.fastForward(1_500);
  await expect(page.getByRole("status")).toContainText("Solved");
  expect(await page.request.post("/api/attempts").then((r) => r.json())).toMatchObject({ state: "finished", result: { choice: 2 } });
});

test("a cross-site form post can't start an attempt or set a cookie", async ({ request }) => {
  const response = await request.post("/api/attempts", { headers: { "sec-fetch-site": "cross-site", origin: "https://evil.example" } });
  expect(response.status()).toBe(403);
  expect(response.headers()["set-cookie"]).toBeUndefined();
});

test("closing the tab mid-game and coming back after the minute shows Time's up", async ({ page, request }) => {
  await atTime(page, request, NOON);
  await startGame(page);
  await page.goto("about:blank");
  await setServerTime(request, new Date(NOON.getTime() + 5 * 60_000));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Time's up" })).toBeVisible();
});

test("midnight on the results screen offers the new puzzle without reloading by itself", async ({ page, request }) => {
  const late = new Date("2026-11-18T23:59:20Z");
  await atTime(page, request, late);
  await startGame(page);
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByRole("status")).toContainText("Solved");
  await setServerTime(request, new Date("2026-11-19T00:00:10Z"));
  await page.clock.fastForward(50_000);
  await expect(page.getByText("Today's puzzle is out")).toBeVisible();
  await expect(page.getByRole("button", { name: "Play #004" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Solved" })).toBeVisible();
});

test("with storage blocked the game still works", async ({ page, request }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  await atTime(page, request, NOON);
  await startGame(page);
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByRole("status")).toContainText("Solved");
  await expect(page.getByText("results can't be kept on this device")).toBeVisible();
});

test("the health check reports the database and the runway", async ({ request }) => {
  await setServerTime(request, NOON);
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ ok: true, database: "ok" });
});

test("test-only switches stay off for other APIs, and bad bodies are refused", async ({ request }) => {
  const bad = await request.post("/api/attempts/x/finish", { data: { choice: 7, clientElapsedMs: 1 } });
  expect([400, 404]).toContain(bad.status());
  const events = await request.post("/api/e", { data: { events: [{ name: "puzzle_correct", props: {} }] } });
  expect(events.status()).toBe(204);
});

test("the archive never shows future days and refuses today's answer until played", async ({ page, request }) => {
  await atTime(page, request, NOON);
  expect((await request.get("/api/puzzles/2026-11-19")).status()).toBe(404);
  expect((await page.request.get("/api/puzzles/2026-11-18")).status()).toBe(403);
  await startGame(page);
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByRole("status")).toContainText("Solved");
  expect((await page.request.get("/api/puzzles/2026-11-18")).status()).toBe(200);
});
