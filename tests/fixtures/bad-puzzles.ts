// Deliberately broken puzzles: the validator must reject each one for the right reason
import { cycle, parallel, step, stutter } from "../../src/engine/author";
import type { Tile } from "../../src/engine/domain";
import { answerOf, sequenceOf, type SequenceRule } from "../../src/engine/generate";
import type { Puzzle } from "../../src/engine/puzzle";

function make(rule: SequenceRule, shown: 4 | 5, distractors: Tile[], overrides: Partial<Puzzle> = {}): Puzzle {
  return {
    id: "x-0001",
    family: "single-step",
    difficulty: "easy",
    shown,
    rule,
    sequence: sequenceOf(rule, shown),
    choices: [answerOf(rule, shown), ...distractors],
    answerIndex: 0,
    explanation: "Draft.",
    review: { by: "test", on: "2026-11-01" },
    ...overrides,
  };
}

const t = (partial: Partial<Tile>): Tile => ({ shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4, ...partial });

// A solid circle looks identical at every rotation: the change is invisible
export function rotatingCirclePuzzle(): Puzzle {
  const rule = parallel({ base: { shape: "circle", color: "yellow" }, vary: { rotation: step("rotation", 0) } });
  return make(rule, 4, [t({ color: "pink" }), t({ color: "blue" }), t({ shape: "square", color: "yellow" })], {
    explanation: "The circle turns a quarter-turn each time. Next is one yellow solid circle.",
  });
}

// With four tiles (● ● ■ ■) nothing tells the player what follows the squares
export function shortStutterPuzzle(): Puzzle {
  const rule = parallel({ base: { color: "pink" }, vary: { shape: stutter(2, "circle", "square", "triangle") } });
  return make(rule, 4, [t({ color: "pink" }), t({ shape: "square", color: "pink" }), t({ shape: "diamond", color: "pink" })], {
    family: "stutter",
    difficulty: "medium",
    explanation: "Each shape appears twice before the next one. Next is one pink solid triangle pointing up.",
  });
}

// Two choices that look exactly alike
export function twinChoicesPuzzle(): Puzzle {
  const rule = parallel({ base: { color: "pink" }, vary: { shape: cycle("circle", "square", "triangle") } });
  return make(rule, 4, [t({ shape: "diamond", color: "pink" }), t({ shape: "diamond", color: "pink" }), t({ shape: "circle", color: "pink" })], {
    family: "single-cycle",
    explanation: "Shapes repeat circle, square, triangle. Next is one pink solid square.",
  });
}

// A well-formed easy puzzle to break one field at a time
export function goodPuzzle(): Puzzle {
  const rule = parallel({ base: { shape: "square", color: "blue", fill: "outline" }, vary: { count: step("count", 1) } });
  return make(rule, 4, [t({ shape: "square", fill: "outline", count: 3 }), t({ shape: "square", fill: "outline", count: 1 }), t({ shape: "circle", fill: "outline", count: 2 })], {
    explanation: "The count goes up by one and wraps back to one. Next is two blue outlined squares.",
  });
}
