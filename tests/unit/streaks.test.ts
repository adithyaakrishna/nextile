import { expect, it } from "vitest";
import { stats, streaks } from "@/persistence/stats";
import { history } from "../fixtures/history";

it("counts consecutive solved days ending today", () => {
  const h = history({ "2026-11-16": "correct", "2026-11-17": "correct", "2026-11-18": "correct" });
  expect(streaks(h, "2026-11-18")).toEqual({ current: 3, best: 3 });
});

it("keeps the streak alive until today is played", () => {
  const h = history({ "2026-11-16": "correct", "2026-11-17": "correct" });
  expect(streaks(h, "2026-11-18").current).toBe(2);
});

it("resets on a wrong answer today", () => {
  const h = history({ "2026-11-16": "correct", "2026-11-17": "correct", "2026-11-18": "incorrect" });
  expect(streaks(h, "2026-11-18")).toEqual({ current: 0, best: 2 });
});

it("resets on a timeout", () => {
  const h = history({ "2026-11-17": "correct", "2026-11-18": "timeout" });
  expect(streaks(h, "2026-11-18").current).toBe(0);
});

it("resets after a missed day", () => {
  const h = history({ "2026-11-16": "correct", "2026-11-18": "correct" });
  expect(streaks(h, "2026-11-18")).toEqual({ current: 1, best: 1 });
});

it("is zero once a skipped day separates today from the last solve", () => {
  const h = history({ "2026-11-15": "correct", "2026-11-16": "correct" });
  expect(streaks(h, "2026-11-18")).toEqual({ current: 0, best: 2 });
});

it("summarizes played, solved and the average solve time", () => {
  const h = history({ "2026-11-16": "correct", "2026-11-17": "incorrect", "2026-11-18": "correct" });
  expect(stats(h, "2026-11-18")).toMatchObject({ played: 3, solved: 2, averageSolveMs: 20_000, bestScore: 83, current: 1, best: 1 });
});
