import { addDays } from "@/time/day";
import type { LocalResult } from "./store";

export interface Streaks {
  current: number;
  best: number;
}

// Derived from history every time, never stored as counters, so they can't drift
export function streaks(history: Record<string, LocalResult>, today: string): Streaks {
  const solved = new Set(
    Object.values(history)
      .filter((r) => r.outcome === "correct")
      .map((r) => r.day),
  );

  let current = 0;
  for (let d = history[today] ? today : addDays(today, -1); solved.has(d); d = addDays(d, -1)) current++;

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of [...solved].sort()) {
    run = prev !== null && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current, best };
}

export interface Stats extends Streaks {
  played: number;
  solved: number;
  averageSolveMs: number | null;
  bestScore: number;
}

export function stats(history: Record<string, LocalResult>, today: string): Stats {
  const all = Object.values(history);
  const solvedTimes = all.flatMap((r) => (r.outcome === "correct" && r.elapsedMs !== null ? [r.elapsedMs] : []));
  return {
    played: all.length,
    solved: solvedTimes.length,
    averageSolveMs: solvedTimes.length ? Math.round(solvedTimes.reduce((a, b) => a + b, 0) / solvedTimes.length) : null,
    bestScore: all.reduce((m, r) => Math.max(m, r.score), 0),
    ...streaks(history, today),
  };
}
