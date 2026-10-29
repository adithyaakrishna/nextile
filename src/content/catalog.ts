import "server-only";
import { LAUNCH_DAY, challengeNumber } from "@/config";
import type { Puzzle } from "@/engine/puzzle";
import { isFixtureContent } from "@/server/test-mode";
import { addDays, toDayKey } from "@/time/day";
import { FIXTURE_PUZZLES, FIXTURE_SCHEDULE } from "../../tests/fixtures/puzzles";
import { PUZZLES } from "./puzzles";
import { SCHEDULE, type ScheduleEntry } from "./schedule";

export interface Content {
  puzzles: ReadonlyMap<string, Puzzle>;
  schedule: readonly ScheduleEntry[];
  idByDay: ReadonlyMap<string, string>;
}

function makeContent(puzzles: readonly Puzzle[], schedule: readonly ScheduleEntry[]): Content {
  return {
    puzzles: new Map(puzzles.map((p) => [p.id, p])),
    schedule,
    idByDay: new Map(schedule.map((e) => [e.day, e.id])),
  };
}

const REAL = makeContent(PUZZLES, SCHEDULE);
const FIXTURE = makeContent(FIXTURE_PUZZLES, FIXTURE_SCHEDULE);

export function content(): Content {
  return isFixtureContent() ? FIXTURE : REAL;
}

export type TodayStatus =
  | { status: "not-launched"; launchDay: string }
  | { status: "available"; day: string; number: number; puzzle: Puzzle }
  | { status: "no-puzzle"; day: string; number: number };

export function puzzleForDay(day: string, c: Content = content()): Puzzle | null {
  const id = c.idByDay.get(day);
  return (id && c.puzzles.get(id)) || null;
}

// The server decides which puzzle is today's; the client never computes it
export function resolveToday(nowMs: number, c: Content = content()): TodayStatus {
  const day = toDayKey(nowMs);
  const number = challengeNumber(day);
  if (number < 1) return { status: "not-launched", launchDay: LAUNCH_DAY };
  const puzzle = puzzleForDay(day, c);
  return puzzle ? { status: "available", day, number, puzzle } : { status: "no-puzzle", day, number };
}

// Consecutive days, starting today (or launch day if that is later), that have a scheduled puzzle
export function runwayDays(nowMs: number, c: Content = content()): number {
  const today = toDayKey(nowMs);
  let n = 0;
  for (let day = today < LAUNCH_DAY ? LAUNCH_DAY : today; c.idByDay.has(day); day = addDays(day, 1)) n++;
  return n;
}
