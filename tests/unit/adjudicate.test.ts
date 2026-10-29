import { describe, expect, it } from "vitest";
import { GRACE_MS, LATENCY_CREDIT_MS, adjudicate } from "@/server/adjudicate";

describe("adjudicate", () => {
  it("trusts an honest client inside the latency window", () => {
    expect(adjudicate({ serverElapsedMs: 18_900, clientElapsedMs: 18_400, choice: 2, answerIndex: 2 })).toEqual({ outcome: "correct", elapsedMs: 18_400, score: 91 });
  });

  it("credits at most two seconds to a client that claims to be faster", () => {
    expect(adjudicate({ serverElapsedMs: 30_000, clientElapsedMs: 100, choice: 2, answerIndex: 2 }).elapsedMs).toBe(30_000 - LATENCY_CREDIT_MS);
  });

  it("never lets a client claim more time than the server saw", () => {
    expect(adjudicate({ serverElapsedMs: 10_000, clientElapsedMs: 50_000, choice: 2, answerIndex: 2 }).elapsedMs).toBe(10_000);
  });

  it("scores a wrong pick as incorrect with zero points", () => {
    expect(adjudicate({ serverElapsedMs: 9_000, clientElapsedMs: 8_800, choice: 1, answerIndex: 2 })).toEqual({ outcome: "incorrect", elapsedMs: 8_800, score: 0 });
  });

  it("treats no choice as a timeout", () => {
    expect(adjudicate({ serverElapsedMs: 60_100, clientElapsedMs: 60_000, choice: null, answerIndex: 2 })).toEqual({ outcome: "timeout", elapsedMs: null, score: 0 });
  });

  it("refuses an answer that arrives after the deadline plus grace", () => {
    expect(adjudicate({ serverElapsedMs: 60_000 + GRACE_MS + 1, clientElapsedMs: 20_000, choice: 2, answerIndex: 2 }).outcome).toBe("timeout");
  });

  it("accepts a slow network inside the grace period, but only if the answer came in time", () => {
    expect(adjudicate({ serverElapsedMs: 61_000, clientElapsedMs: 59_500, choice: 2, answerIndex: 2 })).toMatchObject({ outcome: "correct", elapsedMs: 59_500 });
    expect(adjudicate({ serverElapsedMs: 62_000, clientElapsedMs: 61_000, choice: 2, answerIndex: 2 }).outcome).toBe("timeout");
  });
});
