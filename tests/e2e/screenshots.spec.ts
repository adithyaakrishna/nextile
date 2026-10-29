import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { ANSWER_KEY, NOON, WRONG_KEY, atTime, setServerTime } from "./helpers";

// The completion deliverable: every step of the flow on a phone and a desktop, plus one recording
const DIR = "artifacts/screenshots";
mkdirSync(DIR, { recursive: true });

function deviceName(): string {
  return test.info().project.name.replace("screenshots-", "");
}

async function shot(page: Page, step: string, fullPage = false) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${DIR}/${deviceName()}-${step}.png`, fullPage });
}

test("landing, playing, correct, results, share page, archive", async ({ page, request }) => {
  await atTime(page, request, NOON);
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start the clock" })).toBeEnabled();
  await shot(page, "01-landing");
  await page.getByRole("button", { name: "Start the clock" }).click();
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeVisible();
  await page.clock.fastForward(6_000);
  await shot(page, "02-playing");
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByRole("status")).toContainText("Solved");
  await shot(page, "03-correct");
  await shot(page, "04-results-full", true);
  const { result } = await page.request.post("/api/attempts").then((r) => r.json());
  await page.goto(`/s/${result.shareId}`);
  await shot(page, "05-share-page");
  await page.goto("/archive");
  await shot(page, "06-archive", true);
  const video = page.video();
  await page.close();
  if (video) await video.saveAs("artifacts/recording-correct-answer.webm");
});

test("incorrect", async ({ page, request }) => {
  await atTime(page, request, NOON);
  await page.goto("/");
  await page.getByRole("button", { name: "Start the clock" }).click();
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeFocused();
  await page.clock.fastForward(3_000);
  await page.keyboard.press(WRONG_KEY);
  await expect(page.getByRole("status")).toContainText("Missed");
  await shot(page, "07-incorrect");
});

test("timeout and the final ten seconds", async ({ page, request }) => {
  await atTime(page, request, NOON);
  await page.goto("/");
  await page.getByRole("button", { name: "Start the clock" }).click();
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeFocused();
  await page.clock.fastForward(52_000);
  await shot(page, "08-final-ten-seconds");
  await setServerTime(request, new Date(NOON.getTime() + 61_000));
  await page.clock.fastForward(9_000);
  await expect(page.getByRole("status")).toContainText("Time's up");
  await shot(page, "09-timeout");
});

test("six slots, dark theme and color assist", async ({ page, request }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await atTime(page, request, new Date("2026-11-19T12:00:00Z"));
  await page.goto("/");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByLabel(/Color assist/).check();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Start the clock" }).click();
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeFocused();
  await page.clock.fastForward(2_000);
  await shot(page, "10-dark-color-assist");
});
