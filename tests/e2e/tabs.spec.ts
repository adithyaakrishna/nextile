import { expect, test } from "@playwright/test";
import { ANSWER_KEY, NOON, WRONG_KEY, atTime, setServerTime } from "./helpers";

test("two tabs share one attempt and the first finish wins", async ({ context, request }) => {
  await setServerTime(request, NOON);
  await context.clock.install({ time: NOON });
  const first = await context.newPage();
  await first.goto("/");
  await first.getByRole("button", { name: "Start the clock" }).click();
  await expect(first.getByRole("heading", { name: "What comes next?" })).toBeVisible();

  const second = await context.newPage();
  await second.goto("/");
  await expect(second.getByRole("heading", { name: "What comes next?" })).toBeVisible();

  await first.keyboard.press(ANSWER_KEY);
  await expect(first.getByRole("status")).toContainText("Solved");
  await second.keyboard.press(WRONG_KEY);
  await expect(second.getByRole("status")).toContainText("Solved");
});

test("same instant, opposite time zones, same challenge", async ({ browser, request }) => {
  const instant = new Date("2026-11-18T10:30:00Z"); // 00:30 tomorrow in Kiritimati, 23:30 yesterday in Pago Pago
  await setServerTime(request, instant);
  const numbers: string[] = [];
  for (const timezoneId of ["Pacific/Kiritimati", "Pacific/Pago_Pago"]) {
    const ctx = await browser.newContext({ timezoneId });
    const page = await ctx.newPage();
    await page.clock.install({ time: instant });
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toContainText("Wednesday 18 November");
    numbers.push((await heading.textContent()) ?? "");
    await ctx.close();
  }
  expect(numbers[0]).toBe(numbers[1]);
  expect(numbers[0]).toContain("#003");
});

test("the next-puzzle countdown matches 00:00 UTC in local time", async ({ browser, request }) => {
  await setServerTime(request, NOON);
  const ctx = await browser.newContext({ timezoneId: "America/New_York", locale: "en-US" });
  const page = await ctx.newPage();
  await atTime(page, request, NOON);
  await page.goto("/");
  await page.getByRole("button", { name: "Start the clock" }).click();
  await expect(page.getByRole("heading", { name: "What comes next?" })).toBeFocused();
  await page.keyboard.press(ANSWER_KEY);
  await expect(page.getByText("Next puzzle in")).toBeVisible();
  await expect(page.getByText("7:00 pm your time")).toBeVisible();
  await ctx.close();
});
