import { describe, expect, it } from "vitest";
import { formatSeconds, score } from "@/scoring/score";

describe("score", () => {
  it.each([
    [0, 100],
    [5_000, 98],
    [10_000, 95],
    [18_400, 91],
    [30_000, 85],
    [45_000, 78],
    [59_999, 70],
  ])("a correct answer at %i ms scores %i", (ms, expected) => {
    expect(score("correct", ms)).toBe(expected);
  });

  it("scores zero for a miss or a timeout", () => {
    expect(score("incorrect", 1_000)).toBe(0);
    expect(score("timeout", 60_000)).toBe(0);
  });

  it("is deterministic and bounded", () => {
    for (let ms = 0; ms <= 60_000; ms += 137) {
      const s = score("correct", ms);
      expect(s).toBe(score("correct", ms));
      expect(s).toBeGreaterThanOrEqual(70);
      expect(s).toBeLessThanOrEqual(100);
    }
  });

  it("truncates displayed time to tenths so 59.96 s never shows as 60.0 s", () => {
    expect(formatSeconds(59_960)).toBe("59.9");
    expect(formatSeconds(18_400)).toBe("18.4");
    expect(formatSeconds(0)).toBe("0.0");
  });
});
