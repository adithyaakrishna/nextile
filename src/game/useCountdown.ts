"use client";

import { useEffect, useState, type RefObject } from "react";
import { LIMIT_MS } from "@/scoring/score";
import { monotonicClock, type Clock } from "./clock";
import type { GameEvent, GameState } from "./machine";

// Stores a deadline, not a counter: dropped frames, slow devices and throttled tabs can never make the game run long
export function useCountdown(
  state: GameState,
  dispatch: (e: GameEvent) => void,
  fuseRef: RefObject<HTMLElement | null>,
  clock: Clock = monotonicClock,
): number {
  const [secondsLeft, setSecondsLeft] = useState(LIMIT_MS / 1000);
  const startedAt = state.status === "playing" ? state.startedAt : undefined;
  const deadline = state.status === "playing" ? state.deadline : undefined;

  useEffect(() => {
    if (startedAt === undefined || deadline === undefined) return;
    let raf = 0;
    const frame = () => {
      const now = clock.now();
      // Written straight to CSS: no React render per frame
      fuseRef.current?.style.setProperty("--elapsed", String(Math.min(1, Math.max(0, (now - startedAt) / LIMIT_MS))));
      setSecondsLeft(Math.max(0, Math.ceil((deadline - now) / 1000))); // React skips identical values
      if (now >= deadline) dispatch({ type: "TICK", now });
      else raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Animation frames pause in background tabs; this backstop still ends the game
    const backstop = window.setTimeout(() => dispatch({ type: "TICK", now: clock.now() }), Math.max(0, deadline - clock.now()) + 25);
    const onVisibility = () => dispatch({ type: "TICK", now: clock.now() });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(backstop);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [startedAt, deadline, clock, dispatch, fuseRef]);

  return secondsLeft;
}
