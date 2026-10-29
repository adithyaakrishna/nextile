import { describe, expect, it } from "vitest";
import { COLORS, FILLS, SHAPES } from "@/engine/domain";
import { shareText, timeBar } from "@/share/text";
import { validResult } from "../fixtures/states";

const URL = "https://nextile.example/s/k3J9xQ2mPa";

describe("share text", () => {
  it("matches the brief's example exactly", () => {
    expect(shareText(validResult({ number: 42 }), 4, URL)).toBe(
      ["Nextile #042", "Solved in 18.4 seconds", "Score: 91/100", "■■■■□□□□□□", "Streak: 4 days", "", `Play today's puzzle: ${URL}`, "Built on Teeny Tiny Computer."].join("\n"),
    );
  });

  it("uses the singular for a one-day streak and omits a zero streak", () => {
    expect(shareText(validResult(), 1, URL)).toContain("Streak: 1 day\n");
    expect(shareText(validResult({ outcome: "incorrect", score: 0 }), 0, URL)).not.toContain("Streak");
  });

  it("marks a wrong answer in the time bar", () => {
    const r = validResult({ outcome: "incorrect", score: 0, elapsedMs: 13_000 });
    expect(timeBar(r)).toBe("■■✕□□□□□□□");
    expect(shareText(r, 0, URL)).toContain("Missed it\nScore: 0/100\n■■✕□□□□□□□");
  });

  it("fills the bar when time runs out", () => {
    const r = validResult({ outcome: "timeout", score: 0, elapsedMs: null, choice: null });
    expect(shareText(r, 0, URL)).toContain("Ran out of time\nScore: 0/100\n■■■■■■■■■■");
  });

  it("never mentions a shape, color or fill", () => {
    const words = [...SHAPES, ...COLORS, ...FILLS];
    for (const outcome of ["correct", "incorrect", "timeout"] as const) {
      const text = shareText(validResult({ outcome }), 3, URL).toLowerCase();
      for (const w of words) expect(text).not.toContain(w);
    }
  });
});
