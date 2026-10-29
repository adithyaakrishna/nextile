// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Clock } from "@/game/clock";
import type { GameEvent } from "@/game/machine";
import { useCountdown } from "@/game/useCountdown";
import { playingState } from "../fixtures/states";

let frames: FrameRequestCallback[] = [];
let time = 0;
const clock: Clock = { now: () => time };

function runFrame(at: number) {
  time = at;
  const due = frames;
  frames = [];
  act(() => due.forEach((cb) => cb(at)));
}

beforeEach(() => {
  frames = [];
  time = 0;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("derives everything from the deadline, so it is accurate to the frame", () => {
  const dispatch = vi.fn<(e: GameEvent) => void>();
  const fuse = { current: document.createElement("div") };
  const { result } = renderHook(() => useCountdown(playingState(), dispatch, fuse, clock));

  runFrame(0);
  expect(result.current).toBe(60);
  runFrame(30_000.5);
  expect(result.current).toBe(30);
  expect(fuse.current.style.getPropertyValue("--elapsed")).toBe(String(30_000.5 / 60_000));
  runFrame(59_999);
  expect(result.current).toBe(1);
  expect(dispatch).not.toHaveBeenCalled();
  runFrame(60_000);
  expect(result.current).toBe(0);
  expect(dispatch).toHaveBeenCalledWith({ type: "TICK", now: 60_000 });
  expect(frames).toHaveLength(0);
});

it("still ends the game when animation frames stop, as in a background tab", () => {
  const dispatch = vi.fn<(e: GameEvent) => void>();
  renderHook(() => useCountdown(playingState(), dispatch, { current: null }, clock));
  time = 60_030;
  act(() => vi.advanceTimersByTime(60_030));
  expect(dispatch).toHaveBeenCalledWith({ type: "TICK", now: 60_030 });
});
