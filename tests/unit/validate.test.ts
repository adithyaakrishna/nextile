import { describe as group, expect, it } from "vitest";
import { validateContent } from "@/content/checks";
import { PUBLISHED_LOCK, puzzleHash } from "@/content/lock";
import { PUZZLES } from "@/content/puzzles";
import { SCHEDULE } from "@/content/schedule";
import { validate, validateAll } from "@/engine/validate";
import { FIXTURE_ANSWER_INDEX, FIXTURE_PUZZLES } from "../fixtures/puzzles";
import { goodPuzzle, rotatingCirclePuzzle, shortStutterPuzzle, twinChoicesPuzzle } from "../fixtures/bad-puzzles";

const checksOf = (errors: { check: string }[]) => [...new Set(errors.map((e) => e.check))];
const NOW = Date.parse("2026-11-10T12:00:00Z");

group("the validator rejects bad puzzles, not just accepts good ones", () => {
  it("accepts the reference good puzzle", () => {
    expect(validate(goodPuzzle()).errors).toEqual([]);
  });
  it("rejects a rule that rotates circles (invisible change)", () => {
    expect(validate(rotatingCirclePuzzle()).errors).toContainEqual(expect.objectContaining({ check: "canonical" }));
  });
  it("rejects a four-tile stutter whose next value can't be known", () => {
    expect(validate(shortStutterPuzzle()).errors).toContainEqual(expect.objectContaining({ check: "solver" }));
  });
  it("rejects two choices that look identical", () => {
    expect(validate(twinChoicesPuzzle()).errors).toContainEqual(expect.objectContaining({ check: "distinct" }));
  });
  it("rejects a hand-edited sequence", () => {
    const p = goodPuzzle();
    expect(checksOf(validate({ ...p, sequence: [...p.sequence.slice(0, 3), { ...p.sequence[3], color: "pink" }] }).errors)).toContain("sequence");
  });
  it("rejects a wrong answer index", () => {
    expect(checksOf(validate({ ...goodPuzzle(), answerIndex: 1 }).errors)).toContain("answer");
  });
  it("rejects a distractor that differs in three properties", () => {
    const p = goodPuzzle();
    const choices = [...p.choices];
    choices[3] = { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 };
    expect(checksOf(validate({ ...p, choices }).errors)).toContain("distractors");
  });
  it("rejects an explanation that skips the changing property or names a fixed one", () => {
    expect(checksOf(validate({ ...goodPuzzle(), explanation: "Shapes change. Next is two blue outlined squares." }).errors)).toContain("explanation");
  });
  it("rejects a wrong difficulty label", () => {
    expect(checksOf(validate({ ...goodPuzzle(), difficulty: "hard" }).errors)).toContain("difficulty");
  });
  it("rejects an off-center tile in a puzzle with no position grid", () => {
    const p = goodPuzzle();
    const choices = [...p.choices];
    choices[2] = { ...choices[2], count: 1, cell: 0 };
    expect(checksOf(validate({ ...p, choices }).errors)).toContain("position");
  });
  it("rejects two puzzles that are the same in disguise", () => {
    expect(checksOf(validateAll([goodPuzzle(), { ...goodPuzzle(), id: "x-0002" }]).errors)).toContain("duplicate");
  });
});

group("the real collection", () => {
  it("accepts every puzzle and the whole schedule", () => {
    const { errors } = validateContent({ puzzles: PUZZLES, schedule: SCHEDULE, lock: PUBLISHED_LOCK, nowMs: NOW });
    expect(errors).toEqual([]);
  });
  it("has at least 60 days of runway from launch", () => {
    expect(SCHEDULE.length).toBeGreaterThanOrEqual(60);
  });
  it("flags a schedule gap, a missing review and a changed published puzzle", () => {
    const schedule = [SCHEDULE[0], SCHEDULE[2], ...SCHEDULE.slice(3)];
    const unreviewed = PUZZLES.map((p) => (p.id === SCHEDULE[0].id ? { ...p, review: null } : p));
    const first = PUZZLES.find((p) => p.id === SCHEDULE[0].id)!;
    const lock = { [SCHEDULE[0].day]: { id: first.id, hash: puzzleHash({ ...first, answerIndex: (first.answerIndex + 1) % 4 }) } };
    const checks = checksOf(validateContent({ puzzles: unreviewed, schedule, lock, nowMs: NOW }).errors);
    expect(checks).toEqual(expect.arrayContaining(["schedule", "review", "lock"]));
  });
  it("uses each answer position 20–30% of the time and never three days running", () => {
    const byId = new Map(PUZZLES.map((p) => [p.id, p]));
    const positions = SCHEDULE.map((e) => byId.get(e.id)!.answerIndex);
    for (let pos = 0; pos < 4; pos++) {
      const share = positions.filter((x) => x === pos).length / positions.length;
      expect(share).toBeGreaterThanOrEqual(0.2);
      expect(share).toBeLessThanOrEqual(0.3);
    }
    positions.forEach((p, i) => i >= 2 && expect(p === positions[i - 1] && p === positions[i - 2]).toBe(false));
  });
  it("builds browser-test fixtures that pass every check, with option 3 as the answer", () => {
    for (const p of FIXTURE_PUZZLES) {
      expect(validate(p).errors, p.id).toEqual([]);
      expect(p.answerIndex).toBe(FIXTURE_ANSWER_INDEX);
    }
  });
});
