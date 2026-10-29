export const LIMIT_MS = 60_000;
export const BASE = 70;
export const SPEED_BONUS = 30;

export type ScoredOutcome = "correct" | "incorrect" | "timeout";

// Deterministic: integer milliseconds in, integer points out
export function score(outcome: ScoredOutcome, elapsedMs: number): number {
  if (outcome !== "correct") return 0;
  const ms = Math.min(Math.max(Math.floor(elapsedMs), 0), LIMIT_MS);
  return BASE + Math.round((SPEED_BONUS * (LIMIT_MS - ms)) / LIMIT_MS);
}

// Truncated to tenths, so 59.96 s shows as 59.9 s and never as a misleading 60.0 s
export function formatSeconds(ms: number): string {
  return (Math.floor(ms / 100) / 10).toFixed(1);
}
