import { describe, expect, it } from "vitest";
import { INITIAL_STATE, reduce, type GameState } from "@/game/machine";
import { PUZZLE, TODAY, playingState, validResult } from "../fixtures/states";

describe("state machine", () => {
  it("the first terminal event wins: answer then timeout", () => {
    const s = reduce(reduce(playingState(), { type: "ANSWER", choice: 2, now: 59_999 }), { type: "TICK", now: 60_000 });
    expect(s).toMatchObject({ status: "submitting", choice: 2, elapsedMs: 59_999 });
  });

  it("the first terminal event wins: timeout then answer", () => {
    const s = reduce(reduce(playingState(), { type: "TICK", now: 60_000 }), { type: "ANSWER", choice: 2, now: 60_001 });
    expect(s).toMatchObject({ status: "submitting", choice: null });
  });

  it("treats an answer exactly at the deadline as a timeout", () => {
    expect(reduce(playingState(), { type: "ANSWER", choice: 1, now: 60_000 })).toMatchObject({ choice: null, elapsedMs: 60_000 });
  });

  it("ignores a second answer", () => {
    const once = reduce(playingState(), { type: "ANSWER", choice: 0, now: 10_000 });
    expect(reduce(once, { type: "ANSWER", choice: 3, now: 10_050 })).toBe(once);
  });

  it("ignores ticks before the deadline", () => {
    const s = playingState();
    expect(reduce(s, { type: "TICK", now: 59_999 })).toBe(s);
  });

  it("never lengthens the deadline on resync", () => {
    const s = reduce(playingState(), { type: "RESYNC", remainingMs: 90_000, now: 10_000 }) as Extract<GameState, { status: "playing" }>;
    expect(s.deadline).toBe(60_000);
  });

  it("shortens the deadline when the server says less time is left", () => {
    const s = reduce(playingState(), { type: "RESYNC", remainingMs: 5_000, now: 30_000 }) as Extract<GameState, { status: "playing" }>;
    expect(s.deadline).toBe(35_000);
    expect(s.startedAt).toBe(-25_000);
  });

  it("keeps time already used when an attempt is resumed after a refresh", () => {
    const s = reduce(INITIAL_STATE, { type: "ATTEMPT_OPENED", today: TODAY, attemptId: "a1", puzzle: PUZZLE, remainingMs: 42_000, now: 1_000 });
    expect(s).toMatchObject({ status: "playing", startedAt: -17_000, deadline: 43_000, isResumed: true });
  });

  it("walks the happy path", () => {
    let s = reduce(INITIAL_STATE, { type: "TODAY_LOADED", today: TODAY });
    s = reduce(s, { type: "START_REQUESTED" });
    expect(s.status).toBe("starting");
    s = reduce(s, { type: "ATTEMPT_OPENED", today: TODAY, attemptId: "a1", puzzle: PUZZLE, remainingMs: 60_000, now: 500 });
    expect(s).toMatchObject({ status: "playing", isResumed: false, deadline: 60_500 });
    s = reduce(s, { type: "ANSWER", choice: 1, now: 18_900 });
    expect(s).toMatchObject({ status: "submitting", elapsedMs: 18_400 });
    s = reduce(s, { type: "SYNC_FAILED", message: "offline" });
    expect(s).toMatchObject({ status: "submitting", syncError: "offline" });
    s = reduce(s, { type: "FAILED", message: "ignored while locked" });
    expect(s.status).toBe("submitting");
    s = reduce(s, { type: "RESOLVED", result: validResult() });
    expect(s).toMatchObject({ status: "finished", isFresh: true });
  });

  it("re-locks a saved answer after a refresh instead of letting the player pick again", () => {
    const s = reduce(playingState({ isResumed: true }), { type: "RELOCK", choice: 1, elapsedMs: 12_000 });
    expect(s).toMatchObject({ status: "submitting", choice: 1, elapsedMs: 12_000 });
    expect(reduce(s, { type: "ANSWER", choice: 3, now: 20_000 })).toBe(s);
    expect(reduce(INITIAL_STATE, { type: "RELOCK", choice: 1, elapsedMs: 1 })).toBe(INITIAL_STATE);
  });

  it("recovers from an error only through a retry", () => {
    const failed = reduce(INITIAL_STATE, { type: "FAILED", message: "offline" });
    expect(failed.status).toBe("error");
    expect(reduce(failed, { type: "START_REQUESTED" })).toBe(failed);
    expect(reduce(failed, { type: "RETRY" })).toEqual({ status: "loading" });
  });
});
