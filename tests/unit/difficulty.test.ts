import { expect, it } from "vitest";
import { PUZZLES } from "@/content/puzzles";
import { computeDifficulty, tierFor } from "@/engine/difficulty";

// Points from the plan's launch table (section 5.11) for seeds 01–30
const PLAN_POINTS: Record<string, number> = {
  "p-0001": 1.5, "p-0002": 1.5, "p-0003": 1.5, "p-0004": 1.5, "p-0005": 1.5, "p-0006": 1.5, "p-0007": 1.5, "p-0008": 1.5, "p-0009": 1.5, "p-0010": 2,
  "p-0011": 2.5, "p-0012": 3.5, "p-0013": 4, "p-0014": 3.5, "p-0015": 4, "p-0016": 3.5, "p-0017": 3.5, "p-0018": 3, "p-0019": 2.5, "p-0020": 3.5,
  "p-0021": 4, "p-0022": 4, "p-0023": 4, "p-0024": 4, "p-0025": 4.5, "p-0026": 5.5, "p-0027": 6, "p-0028": 6, "p-0029": 4.5, "p-0030": 6,
};

it("reproduces the plan's points for every launch seed", () => {
  for (const [id, points] of Object.entries(PLAN_POINTS)) {
    const p = PUZZLES.find((x) => x.id === id)!;
    expect(computeDifficulty(p.rule, p.shown).points, id).toBe(points);
  }
});

it("uses the plan's tier boundaries", () => {
  expect(tierFor(2)).toBe("easy");
  expect(tierFor(2.5)).toBe("medium");
  expect(tierFor(4)).toBe("medium");
  expect(tierFor(4.5)).toBe("hard");
});

it("labels every puzzle with its computed tier", () => {
  for (const p of PUZZLES) expect(p.difficulty, p.id).toBe(computeDifficulty(p.rule, p.shown).tier);
});
