import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { puzzleForDay } from "@/content/catalog";
import { finishAttempt, getToday, historyFor, pastPuzzle, startAttempt } from "@/server/attempts";
import { db } from "@/server/db";

const NOON = Date.parse("2026-11-18T12:00:00Z");
const PLAYER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const answerIndex = () => puzzleForDay("2026-11-18")!.answerIndex as 0 | 1 | 2 | 3;
const wrongIndex = () => ((answerIndex() + 1) % 4) as 0 | 1 | 2 | 3;

function openedId(nowMs: number, player = PLAYER): string {
  const s = startAttempt(player, nowMs);
  if (s.state !== "playing") throw new Error(`expected playing, got ${s.state}`);
  return s.attemptId;
}

beforeAll(() => {
  process.env.DATABASE_PATH = ":memory:";
});

beforeEach(() => {
  db().exec("DELETE FROM attempts; DELETE FROM events;");
});

describe("starting", () => {
  it("sends tiles and choices but never the answer", () => {
    const s = startAttempt(PLAYER, NOON);
    expect(s).toMatchObject({ state: "playing", remainingMs: 60_000 });
    expect(JSON.stringify(s)).not.toMatch(/answerIndex|explanation|family/);
  });

  it("never sends tiles from /api/today", () => {
    const today = getToday(PLAYER, NOON);
    expect(today).toMatchObject({ status: "available", number: 3, attempt: { state: "none" } });
    expect(JSON.stringify(today)).not.toMatch(/sequence|choices|shape/);
  });

  it("keeps the clock running across a refresh", () => {
    const id = openedId(NOON);
    const again = startAttempt(PLAYER, NOON + 20_000);
    expect(again).toMatchObject({ state: "playing", attemptId: id, remainingMs: 40_000 });
    expect(getToday(PLAYER, NOON + 20_000)).toMatchObject({ attempt: { state: "open", remainingMs: 40_000 } });
  });

  it("gives two tabs pressing Start at once the same attempt", () => {
    expect(openedId(NOON)).toBe(openedId(NOON + 5));
  });

  it("returns the result instead of a second attempt", () => {
    const id = openedId(NOON);
    finishAttempt(PLAYER, id, answerIndex(), 10_000, NOON + 10_200);
    expect(startAttempt(PLAYER, NOON + 60_000)).toMatchObject({ state: "finished", result: { outcome: "correct" } });
  });

  it("refuses before launch and after the schedule runs out", () => {
    expect(startAttempt(PLAYER, Date.parse("2026-11-01T12:00:00Z"))).toMatchObject({ state: "unavailable", reason: "not-launched" });
    expect(startAttempt(PLAYER, Date.parse("2030-01-01T12:00:00Z"))).toMatchObject({ state: "unavailable", reason: "no-puzzle" });
  });
});

describe("finishing", () => {
  it("scores a correct answer with the official time", () => {
    const id = openedId(NOON);
    const r = finishAttempt(PLAYER, id, answerIndex(), 18_400, NOON + 18_900);
    expect(r).toMatchObject({ status: "ok", result: { outcome: "correct", elapsedMs: 18_400, score: 91, answerIndex: answerIndex() } });
  });

  it("is idempotent: the first finish wins", () => {
    const id = openedId(NOON);
    const first = finishAttempt(PLAYER, id, wrongIndex(), 5_000, NOON + 5_100);
    const second = finishAttempt(PLAYER, id, answerIndex(), 6_000, NOON + 6_100);
    expect(first).toEqual(second);
    expect(second).toMatchObject({ result: { outcome: "incorrect", score: 0 } });
  });

  it("only accepts a finish from the browser that started the attempt", () => {
    const id = openedId(NOON);
    expect(finishAttempt(OTHER, id, answerIndex(), 5_000, NOON + 5_100)).toEqual({ status: "not-found" });
  });

  it("records the outcome as a server event", () => {
    const id = openedId(NOON);
    finishAttempt(PLAYER, id, answerIndex(), 9_000, NOON + 9_100);
    finishAttempt(PLAYER, id, answerIndex(), 9_000, NOON + 9_200);
    const rows = db().prepare("SELECT name, props FROM events").all() as { name: string; props: string }[];
    expect(rows.map((r) => r.name)).toEqual(["puzzle_correct"]);
    expect(JSON.parse(rows[0].props)).toMatchObject({ day: "2026-11-18", score: 96 });
  });
});

describe("timeouts and the attempt day", () => {
  it("finalizes an abandoned attempt as a timeout on the next visit", () => {
    openedId(NOON);
    expect(getToday(PLAYER, NOON + 90_000)).toMatchObject({ attempt: { state: "finished", result: { outcome: "timeout", score: 0 } } });
  });

  it("scores an attempt against the day it was started, even after midnight", () => {
    const late = Date.parse("2026-11-18T23:59:30Z");
    const id = openedId(late);
    const r = finishAttempt(PLAYER, id, answerIndex(), 39_000, late + 40_000);
    expect(r).toMatchObject({ result: { day: "2026-11-18", outcome: "correct" } });
    expect(getToday(PLAYER, late + 40_000)).toMatchObject({ day: "2026-11-19", attempt: { state: "none" } });
  });
});

describe("midnight", () => {
  const MIDNIGHT = Date.parse("2026-11-19T00:00:00Z");

  it("keeps yesterday's answer secret while an attempt started before midnight can still be scored", () => {
    const id = openedId(MIDNIGHT - 400);
    expect(pastPuzzle("2026-11-18", null, MIDNIGHT + 10)).toEqual({ status: "locked" });
    expect(pastPuzzle("2026-11-18", OTHER, MIDNIGHT + 62_000)).toEqual({ status: "locked" });
    expect(pastPuzzle("2026-11-18", null, MIDNIGHT + 62_501)).toMatchObject({ status: "ok" });
    finishAttempt(PLAYER, id, answerIndex(), 300, MIDNIGHT + 20);
    expect(pastPuzzle("2026-11-18", PLAYER, MIDNIGHT + 30)).toMatchObject({ status: "ok", puzzle: { result: { outcome: "correct" } } });
  });

  it("lets an attempt started before midnight be resumed after it, for its own day", () => {
    const id = openedId(MIDNIGHT - 30_000);
    expect(getToday(PLAYER, MIDNIGHT + 10_000)).toMatchObject({ day: "2026-11-18", number: 3, nextAt: MIDNIGHT, attempt: { state: "open", remainingMs: 20_000 } });
    expect(startAttempt(PLAYER, MIDNIGHT + 10_000)).toMatchObject({ state: "playing", attemptId: id, remainingMs: 20_000, today: { day: "2026-11-18" } });
    expect(getToday(OTHER, MIDNIGHT + 10_000)).toMatchObject({ day: "2026-11-19", attempt: { state: "none" } });
  });

  it("moves on to the new day once the carried-over attempt has run out", () => {
    openedId(MIDNIGHT - 30_000);
    expect(getToday(PLAYER, MIDNIGHT + 40_000)).toMatchObject({ day: "2026-11-19", attempt: { state: "none" } });
    expect(historyFor(PLAYER, MIDNIGHT + 40_000)).toMatchObject([{ day: "2026-11-18", outcome: "timeout" }]);
  });
});

describe("history and the archive", () => {
  it("returns finished results for this browser only", () => {
    const id = openedId(NOON);
    finishAttempt(PLAYER, id, answerIndex(), 9_000, NOON + 9_100);
    expect(historyFor(PLAYER, NOON + 10_000).map((r) => r.day)).toEqual(["2026-11-18"]);
    expect(historyFor(OTHER, NOON + 10_000)).toEqual([]);
  });

  it("opens past days, locks today until finished, and hides the future", () => {
    expect(pastPuzzle("2026-11-17", null, NOON)).toMatchObject({ status: "ok", puzzle: { number: 2, result: null } });
    expect(pastPuzzle("2026-11-18", PLAYER, NOON)).toEqual({ status: "locked" });
    expect(pastPuzzle("2026-11-19", PLAYER, NOON)).toEqual({ status: "not-found" });
    const id = openedId(NOON);
    finishAttempt(PLAYER, id, wrongIndex(), 9_000, NOON + 9_100);
    expect(pastPuzzle("2026-11-18", PLAYER, NOON + 10_000)).toMatchObject({ status: "ok", puzzle: { result: { outcome: "incorrect" } } });
  });
});
