"use client";

import { useCallback, useEffect, useReducer, useRef, useState, type RefObject } from "react";
import { track } from "@/analytics/client";
import { withResult, withResults } from "@/persistence/store";
import { getStore, updateStore } from "@/persistence/use-store";
import { daysBetween, toDayKey } from "@/time/day";
import { playSound } from "@/ui/sound";
import { fetchHistory, fetchToday, finishAttempt, isApiFailure, openAttempt } from "./api";
import type { StartResponse } from "./api-types";
import { monotonicClock, type Clock } from "./clock";
import { INITIAL_STATE, reduce, type ChoiceIndex, type GameState } from "./machine";
import { useCountdown } from "./useCountdown";

export const MESSAGES = {
  offline: "Can't reach the puzzle server. Check your connection, then try again.",
  startFailed: "Couldn't start the clock. Check your connection, then try again.",
  reconnecting: "Your answer is locked in. Reconnecting to score it.",
  noCookies: "This browser isn't keeping cookies, so this answer can't be scored. Allow cookies for this site, then reload.",
} as const;

const RETRY_DELAYS_MS = [300, 1_000, 3_000];
const RETRY_EVERY_MS = 10_000;

export interface Timing {
  offsetMs: number; // server time minus device time
  nextAt: number | null;
}

export interface GameController {
  state: GameState;
  timing: Timing;
  secondsLeft: number;
  fuseRef: RefObject<HTMLDivElement | null>;
  start: () => void;
  answer: (choice: ChoiceIndex) => void;
  retry: () => void;
}

async function resubmitPending(): Promise<void> {
  const pending = getStore().pending;
  if (!pending) return;
  try {
    const { result } = await finishAttempt(pending.attemptId, { choice: pending.choice, clientElapsedMs: pending.clientElapsedMs });
    updateStore((s) => withResult(s, result));
  } catch (error) {
    if (isApiFailure(error) && error.status === 404) updateStore((s) => ({ ...s, pending: null }));
  }
}

async function refreshHistory(): Promise<void> {
  try {
    const { results } = await fetchHistory();
    if (results.length > 0) updateStore((s) => withResults(s, results));
  } catch {
    // history is a convenience; local results still show
  }
}

function dayOf(state: GameState): string | null {
  switch (state.status) {
    case "ready":
    case "starting":
    case "playing":
    case "submitting":
      return state.today.day;
    case "finished":
      return state.result.day;
    case "loading":
    case "unavailable":
    case "error":
      return null;
    default: {
      const unreachable: never = state;
      return unreachable;
    }
  }
}

function arrivalSource(): "direct" | "share" | "other" {
  if (!document.referrer) return "direct";
  try {
    const ref = new URL(document.referrer);
    return ref.origin === window.location.origin && ref.pathname.startsWith("/s/") ? "share" : "other";
  } catch {
    return "other";
  }
}

export function useGame(clock: Clock = monotonicClock): GameController {
  const [state, dispatch] = useReducer(reduce, INITIAL_STATE);
  const [timing, setTiming] = useState<Timing>({ offsetMs: 0, nextAt: null });
  const fuseRef = useRef<HTMLDivElement | null>(null);
  const tracked = useRef(new Set<string>());
  const secondsLeft = useCountdown(state, dispatch, fuseRef, clock);
  const { status } = state;

  const once = useCallback((key: string, run: () => void) => {
    if (tracked.current.has(key)) return;
    tracked.current.add(key);
    run();
  }, []);

  const applyStart = useCallback(
    (s: StartResponse) => {
      switch (s.state) {
        case "playing":
          dispatch({ type: "ATTEMPT_OPENED", today: s.today, attemptId: s.attemptId, puzzle: s.puzzle, remainingMs: s.remainingMs, now: clock.now() });
          return;
        case "finished":
          updateStore((st) => withResult(st, s.result));
          dispatch({ type: "ALREADY_FINISHED", result: s.result });
          return;
        case "unavailable":
          dispatch({ type: "UNAVAILABLE", reason: s.reason, launchDay: s.launchDay });
          return;
        default: {
          const unreachable: never = s;
          return unreachable;
        }
      }
    },
    [clock],
  );

  // Loading: resubmit any pending answer first, then ask the server what today looks like for this browser
  useEffect(() => {
    if (status !== "loading") return;
    let isCancelled = false;
    const run = async () => {
      await resubmitPending();
      let today;
      try {
        today = await fetchToday();
      } catch {
        if (isCancelled) return;
        const local = getStore().history[toDayKey(Date.now())];
        dispatch(local ? { type: "ALREADY_FINISHED", result: local } : { type: "FAILED", message: MESSAGES.offline });
        return;
      }
      if (isCancelled) return;
      setTiming({ offsetMs: today.serverNow - Date.now(), nextAt: today.nextAt });
      void refreshHistory();
      switch (today.status) {
        case "not-launched":
          dispatch({ type: "UNAVAILABLE", reason: "not-launched", launchDay: today.launchDay });
          return;
        case "no-puzzle":
          dispatch({ type: "UNAVAILABLE", reason: "no-puzzle", launchDay: null });
          return;
        case "available": {
          const info = { day: today.day, number: today.number, nextAt: today.nextAt, difficulty: today.difficulty };
          const { attempt } = today;
          if (attempt.state === "finished") {
            updateStore((s) => withResult(s, attempt.result));
            dispatch({ type: "ALREADY_FINISHED", result: attempt.result });
          } else if (attempt.state === "open") {
            try {
              const opened = await openAttempt();
              if (isCancelled) return;
              applyStart(opened);
              // The resubmit above failed, but the answer was already locked: keep it locked and keep retrying
              const pending = getStore().pending;
              if (opened.state === "playing" && pending?.attemptId === opened.attemptId) {
                dispatch({ type: "RELOCK", choice: pending.choice, elapsedMs: pending.clientElapsedMs });
              }
            } catch {
              if (!isCancelled) dispatch({ type: "FAILED", message: MESSAGES.offline });
            }
          } else {
            // Without cookies the server can't recognize this browser; local history still prevents a replay
            const local = getStore().history[today.day];
            dispatch(local ? { type: "ALREADY_FINISHED", result: local } : { type: "TODAY_LOADED", today: info });
          }
          return;
        }
        default: {
          const unreachable: never = today;
          return unreachable;
        }
      }
    };
    void run();
    return () => {
      isCancelled = true;
    };
  }, [status, applyStart]);

  // Starting: the server records the start time; the clock starts when the tiles arrive
  useEffect(() => {
    if (status !== "starting") return;
    let isCancelled = false;
    openAttempt()
      .then((s) => {
        if (!isCancelled) applyStart(s);
      })
      .catch(() => {
        if (!isCancelled) dispatch({ type: "FAILED", message: MESSAGES.startFailed });
      });
    return () => {
      isCancelled = true;
    };
  }, [status, applyStart]);

  const playingAttempt = state.status === "playing" ? state.attemptId : null;
  const playingDay = state.status === "playing" ? state.today.day : null;
  const isResumed = state.status === "playing" && state.isResumed;

  useEffect(() => {
    if (!playingAttempt || !playingDay) return;
    once(`started:${playingAttempt}`, () => track({ name: "puzzle_started", props: { day: playingDay, resumed: isResumed } }));
  }, [playingAttempt, playingDay, isResumed, once]);

  // A phone that slept may not have advanced its monotonic clock; the server's remaining time wins
  useEffect(() => {
    if (!playingAttempt) return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      fetchToday()
        .then((t) => {
          if (t.status !== "available") return;
          if (t.attempt.state === "open") dispatch({ type: "RESYNC", remainingMs: t.attempt.remainingMs, now: clock.now() });
          if (t.attempt.state === "finished") dispatch({ type: "RESYNC", remainingMs: 0, now: clock.now() });
        })
        .catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [playingAttempt, clock]);

  const submitting = state.status === "submitting" ? state : null;
  const submitAttempt = submitting?.attemptId ?? null;
  const submitChoice = submitting ? submitting.choice : null;
  const submitElapsed = submitting?.elapsedMs ?? 0;
  const submitDay = submitting?.today.day ?? null;

  // Submitting: save the locked answer first so a refresh can't lose it, then retry until the server scores it
  useEffect(() => {
    if (!submitAttempt || !submitDay) return;
    updateStore((s) => ({ ...s, pending: { day: submitDay, attemptId: submitAttempt, choice: submitChoice, clientElapsedMs: submitElapsed } }));
    if (submitChoice !== null) {
      once(`answered:${submitAttempt}`, () => track({ name: "answer_submitted", props: { day: submitDay, choice: submitChoice, clientElapsedMs: submitElapsed } }));
    }
    let isCancelled = false;
    let isSending = false;
    let timer: number | undefined;
    let tries = 0;
    const send = async () => {
      if (isSending) return; // one retry chain at a time
      isSending = true;
      window.clearTimeout(timer);
      try {
        const { result } = await finishAttempt(submitAttempt, { choice: submitChoice, clientElapsedMs: submitElapsed });
        if (isCancelled) return;
        updateStore((s) => withResult(s, result));
        dispatch({ type: "RESOLVED", result });
      } catch (error) {
        if (isCancelled) return;
        if (isApiFailure(error) && (error.status === 404 || error.status === 400)) {
          updateStore((s) => ({ ...s, pending: null }));
          dispatch({ type: "SYNC_FAILED", message: MESSAGES.noCookies });
          return;
        }
        dispatch({ type: "SYNC_FAILED", message: MESSAGES.reconnecting });
        timer = window.setTimeout(() => void send(), RETRY_DELAYS_MS[tries] ?? RETRY_EVERY_MS);
        tries++;
      } finally {
        isSending = false;
      }
    };
    void send();
    const onOnline = () => void send();
    window.addEventListener("online", onOnline);
    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [submitAttempt, submitChoice, submitElapsed, submitDay, once]);

  const finished = state.status === "finished" ? state : null;
  const finishedDay = finished?.result.day ?? null;
  const finishedOutcome = finished?.result.outcome ?? null;
  const isFreshFinish = finished?.isFresh ?? false;

  useEffect(() => {
    if (!finishedDay || !finishedOutcome) return;
    once(`result:${finishedDay}`, () => {
      track({ name: "result_viewed", props: { day: finishedDay, outcome: finishedOutcome } });
      if (isFreshFinish) playSound(finishedOutcome === "correct" ? "correct" : "miss");
    });
  }, [finishedDay, finishedOutcome, isFreshFinish, once]);

  const landingDay = dayOf(state);
  useEffect(() => {
    if (status === "loading") return;
    once("landing", () => {
      const day = landingDay ?? toDayKey(Date.now() + timing.offsetMs);
      const last = getStore().lastVisitDay;
      track({
        name: "landing_viewed",
        props: { day, returning: last !== null, daysSinceLastVisit: last ? Math.max(0, daysBetween(last, day)) : null, via: arrivalSource() },
      });
      updateStore((s) => ({ ...s, lastVisitDay: day }));
    });
  }, [status, landingDay, timing.offsetMs, once]);

  const start = useCallback(() => {
    if (state.status !== "ready") return;
    track({ name: "start_clicked", props: { day: state.today.day } });
    playSound("clack");
    dispatch({ type: "START_REQUESTED" });
  }, [state]);

  const answer = useCallback(
    (choice: ChoiceIndex) => {
      if (state.status === "playing") playSound("clack");
      dispatch({ type: "ANSWER", choice, now: clock.now() });
    },
    [state.status, clock],
  );

  const retry = useCallback(() => dispatch({ type: "RETRY" }), []);

  return { state, timing, secondsLeft, fuseRef, start, answer, retry };
}
