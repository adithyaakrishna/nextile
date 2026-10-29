import { expect, test } from "@playwright/test";
import { NOON, answerCards, atTime } from "./helpers";

const LAYOUTS = [
  { name: "five slots", at: NOON, slots: 5 },
  { name: "six slots", at: new Date("2026-11-19T12:00:00Z"), slots: 6 },
];

// Runs on every device project: the whole game must fit in the first viewport without scrolling
for (const layout of LAYOUTS) {
  test(`${layout.name}: Start is above the fold, and during play the clock, every tile and all four answers are visible`, async ({ page, request }) => {
    await atTime(page, request, layout.at);
    await page.goto("/");
    const start = page.getByRole("button", { name: "Start the clock" });
    await expect(start).toBeEnabled();
    await expect(start).toBeInViewport({ ratio: 1 });

    await start.click();
    await expect(page.getByRole("heading", { name: "What comes next?" })).toBeFocused();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator(".clock")).toBeInViewport({ ratio: 1 });
    const tiles = page.getByRole("list", { name: "Sequence" }).getByRole("listitem");
    await expect(tiles).toHaveCount(layout.slots);
    for (const tile of await tiles.all()) await expect(tile).toBeInViewport({ ratio: 1 });
    const cards = answerCards(page);
    await expect(cards).toHaveCount(4);
    for (const card of await cards.all()) await expect(card).toBeInViewport({ ratio: 1 });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
