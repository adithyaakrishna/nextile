import type { Difficulty } from "./difficulty";
import type { Tile } from "./domain";
import type { SequenceRule } from "./generate";

export const FAMILIES = [
  "single-step",
  "single-cycle",
  "walk",
  "synced",
  "two-clocks",
  "bounce",
  "stutter",
  "interleave",
  "odometer",
  "three-way",
] as const;
export type Family = (typeof FAMILIES)[number];

export interface Review {
  by: string;
  on: string;
}

export interface Puzzle {
  id: string; // "p-0012", never reused
  family: Family;
  difficulty: Difficulty; // must equal the computed tier
  shown: 4 | 5; // tiles shown before the "?"
  rule: SequenceRule; // the proof
  sequence: readonly Tile[]; // the publication, stored literally
  choices: readonly Tile[]; // exactly four once built
  answerIndex: number; // 0–3
  explanation: string; // one or two sentences, ≤ 180 characters
  review: Review | null; // sign-off; null blocks scheduling
}

export const EXPLANATION_MAX = 180;
