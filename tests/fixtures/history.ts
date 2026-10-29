import type { Outcome } from "../../src/game/machine";
import type { LocalResult } from "../../src/persistence/store";
import { challengeNumber } from "../../src/config";
import { validResult } from "./states";

// Builds LocalResult records from { day: outcome }
export function history(days: Record<string, Outcome>): Record<string, LocalResult> {
  return Object.fromEntries(
    Object.entries(days).map(([day, outcome]) => [
      day,
      validResult({
        day,
        number: challengeNumber(day),
        outcome,
        choice: outcome === "timeout" ? null : outcome === "correct" ? 1 : 0,
        elapsedMs: outcome === "timeout" ? null : 20_000,
        score: outcome === "correct" ? 83 : 0,
      }),
    ]),
  );
}
