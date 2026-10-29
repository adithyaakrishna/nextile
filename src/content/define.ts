import "server-only";
import type { Puzzle } from "@/engine/puzzle";

export { bounce, constant, cycle, interleave, parallel, step, stutter } from "@/engine/author";
export type { Family, Puzzle, Review } from "@/engine/puzzle";

export function definePuzzle(puzzle: Puzzle): Puzzle {
  return puzzle;
}
