// Known puzzles for browser tests, loaded when NX_CONTENT=fixture. Every answer is option 3.
import { cycle, definePuzzle, parallel, step, stutter, type Family, type Puzzle } from "../../src/content/define";
import type { ScheduleEntry } from "../../src/content/schedule";
import { computeDifficulty } from "../../src/engine/difficulty";
import { pickDistractors, proposeDistractors } from "../../src/engine/distractors";
import { explain } from "../../src/engine/explain";
import { answerOf, sequenceOf, type SequenceRule } from "../../src/engine/generate";
import { addDays } from "../../src/time/day";

export const FIXTURE_ANSWER_INDEX = 2;

function build(id: string, family: Family, rule: SequenceRule, shown: 4 | 5 = 4): Puzzle {
  const choices = pickDistractors(proposeDistractors(rule, shown)).map((c) => c.tile);
  choices.splice(FIXTURE_ANSWER_INDEX, 0, answerOf(rule, shown));
  return definePuzzle({
    id,
    family,
    difficulty: computeDifficulty(rule, shown).tier,
    shown,
    rule,
    sequence: sequenceOf(rule, shown),
    choices,
    answerIndex: FIXTURE_ANSWER_INDEX,
    explanation: explain(rule, shown),
    review: { by: "fixture", on: "2026-11-01" },
  });
}

export const FIXTURE_PUZZLES: readonly Puzzle[] = [
  build("f-0001", "two-clocks", parallel({ base: { fill: "solid" }, vary: { color: cycle("pink", "blue"), shape: cycle("circle", "square", "triangle") } })),
  build("f-0002", "single-step", parallel({ base: { shape: "triangle", color: "yellow", fill: "solid" }, vary: { rotation: step("rotation", 0) } })),
  build("f-0003", "walk", parallel({ base: { shape: "circle", color: "pink", fill: "solid" }, vary: { cell: step("corners", 0) } })),
  // Five tiles shown, so the rail has six slots (it wraps into two rows below 360px)
  build("f-0004", "stutter", parallel({ base: { color: "pink", fill: "solid" }, vary: { shape: stutter(2, "circle", "square", "triangle") } }), 5),
];

export const FIXTURE_FIRST_DAY = "2026-11-16";
export const FIXTURE_DAYS = 35;

export const FIXTURE_SCHEDULE: readonly ScheduleEntry[] = Array.from({ length: FIXTURE_DAYS }, (_, i) => ({
  day: addDays(FIXTURE_FIRST_DAY, i),
  id: FIXTURE_PUZZLES[i % FIXTURE_PUZZLES.length].id,
}));
