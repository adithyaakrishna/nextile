import { describe as group, expect, it } from "vitest";
import { tileKey } from "@/engine/canonical";
import { hypothesesFor, interleaveReading, parallelReading, solve } from "@/engine/solver";
import { PUZZLES } from "@/content/puzzles";

const byId = new Map(PUZZLES.map((p) => [p.id, p]));
const nexts = (prop: Parameters<typeof hypothesesFor>[0], values: (string | number)[]) =>
  [...new Set(hypothesesFor(prop, values as never).map((h) => h.next))].sort();

group("per-property hypotheses", () => {
  it("finds a constant and nothing else when nothing changes", () => {
    expect(hypothesesFor("color", ["pink", "pink", "pink", "pink"]).map((h) => h.kind)).toEqual(["constant"]);
  });

  it("only accepts a bounce when a reversal is visible (#11)", () => {
    expect(nexts("count", [1, 2, 3, 2])).toEqual([1]);
  });

  it("sees step and cycle readings of a wrapping count agree", () => {
    expect(nexts("count", [1, 2, 3, 1])).toEqual([2]);
  });

  it("predicts the first value again when a four-tile stutter can't say what follows", () => {
    expect(nexts("shape", ["circle", "circle", "square", "square"])).toEqual(["circle"]);
  });

  it("predicts the run continues once the next run has started (#18)", () => {
    expect(nexts("shape", ["circle", "circle", "square", "square", "triangle"])).toEqual(["triangle"]);
  });

  it("considers both the cycle reading and the track step for an ordered stutter", () => {
    expect(nexts("count", [1, 1, 2, 2])).toEqual([1, 3]);
  });

  it("needs two transitions before it calls something a step", () => {
    expect(hypothesesFor("rotation", [0, 90])).toEqual([]);
    expect(hypothesesFor("rotation", [0, 90], new Set([1])).map((h) => h.next)).toEqual([180]);
  });
});

group("readings", () => {
  it("rejects the parallel reading of the interleave puzzle and accepts the interleaved one (#26)", () => {
    const p = byId.get("p-0026")!;
    expect(parallelReading(p.sequence).isValid).toBe(false);
    const interleaved = interleaveReading(p.sequence)!;
    expect(interleaved.isValid).toBe(true);
    expect(interleaved.predicted.map(tileKey)).toEqual([tileKey(p.choices[p.answerIndex])]);
  });

  it("doesn't let a step alias on another track count as a mirrored stream", () => {
    const circle = { shape: "circle", color: "blue", fill: "solid", rotation: 0, cell: 4 } as const;
    const triangle = { shape: "triangle", color: "blue", fill: "solid", count: 1, cell: 4 } as const;
    // Counting +1 on the three-value track must not back up a single 180° turn (+2 on the rotation track)
    const sequence = [
      { ...circle, count: 1 as const },
      { ...triangle, rotation: 0 as const },
      { ...circle, count: 2 as const },
      { ...triangle, rotation: 180 as const },
      { ...circle, count: 3 as const },
    ];
    expect(interleaveReading(sequence)!.isValid).toBe(false);
    expect(hypothesesFor("count", [1, 2, 3]).map((h) => h.label)).toEqual(["step(+1 on count)"]);
  });

  it("predicts exactly the answer for every scheduled puzzle", () => {
    for (const p of PUZZLES) {
      const predicted = p.choices.filter((c) => solve(p.sequence).predictedKeys.has(tileKey(c)));
      expect(predicted.map(tileKey), p.id).toEqual([tileKey(p.choices[p.answerIndex])]);
    }
  });
});
