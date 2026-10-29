import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const NOON = new Date("2026-11-18T12:00:00Z"); // challenge #3 in the fixture schedule
export const ANSWER_KEY = "3"; // every fixture puzzle's answer is option 3
export const WRONG_KEY = "1";

export async function setServerTime(request: APIRequestContext, at: Date): Promise<void> {
  const response = await request.post("/api/test/clock", { data: { now: at.toISOString() } });
  expect(response.ok(), "the test clock endpoint needs E2E=1").toBeTruthy();
}

// Puts the browser and the server on the same fake instant
export async function atTime(page: Page, request: APIRequestContext, at: Date): Promise<void> {
  await setServerTime(request, at);
  await page.clock.install({ time: at });
}

export async function startGame(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Start the clock" }).click();
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeFocused();
}

export function answerCards(page: Page) {
  return page.getByRole("group", { name: "What comes next?" }).getByRole("button");
}
