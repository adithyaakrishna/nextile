import type { ChoiceIndex, Outcome } from "@/game/machine";
import { LIMIT_MS, score } from "@/scoring/score";

export const GRACE_MS = 2_500; // how late a finish may arrive after the deadline
export const LATENCY_CREDIT_MS = 2_000; // the most network time we will credit back to the player

export interface AdjudicationInput {
  serverElapsedMs: number;
  clientElapsedMs: number;
  choice: ChoiceIndex | null;
  answerIndex: ChoiceIndex;
}

export interface Adjudication {
  outcome: Outcome;
  elapsedMs: number | null;
  score: number;
}

// The client measures precisely but can lie; the server can't be lied to but includes network latency
export function adjudicate(i: AdjudicationInput): Adjudication {
  if (i.choice === null || i.serverElapsedMs > LIMIT_MS + GRACE_MS) {
    return { outcome: "timeout", elapsedMs: null, score: 0 };
  }
  const lo = Math.max(0, i.serverElapsedMs - LATENCY_CREDIT_MS);
  const hi = i.serverElapsedMs;
  const elapsedMs = Math.floor(Math.min(Math.max(i.clientElapsedMs, lo), hi));
  if (elapsedMs >= LIMIT_MS) return { outcome: "timeout", elapsedMs: null, score: 0 };
  const outcome: Outcome = i.choice === i.answerIndex ? "correct" : "incorrect";
  return { outcome, elapsedMs, score: score(outcome, elapsedMs) };
}
