"use client";

import { useEffect, type ReactNode } from "react";
import { monotonicClock } from "@/game/clock";
import { keyToEvent } from "@/game/keyboard";
import type { GameState } from "@/game/machine";
import { useGame, type GameController } from "@/game/useGame";
import type { Store } from "@/persistence/store";
import { isStorageAvailable, useStore } from "@/persistence/use-store";
import { Header } from "./Header";
import { Landing } from "./screens/Landing";
import { ErrorNotice, Unavailable } from "./screens/Notice";
import { PlayView } from "./screens/PlayView";
import { ResultsView } from "./screens/ResultsView";
import { playSound } from "./sound";

export function Game() {
  const game = useGame();
  const { state, secondsLeft, start, answer } = game;
  const store = useStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const event = keyToEvent(e, state, monotonicClock.now());
      if (!event) return;
      e.preventDefault();
      if (event.type === "START_REQUESTED") start();
      if (event.type === "ANSWER") answer(event.choice);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, start, answer]);

  const isPlaying = state.status === "playing";
  useEffect(() => {
    if (isPlaying && secondsLeft > 0 && secondsLeft <= 5) playSound("tick");
  }, [isPlaying, secondsLeft]);

  return (
    <>
      <Header number={challengeOf(state)} />
      <main id="main" tabIndex={-1} className="outline-none">
        {screenFor(game, store)}
      </main>
    </>
  );
}

function challengeOf(state: GameState): number | null {
  switch (state.status) {
    case "ready":
    case "starting":
    case "playing":
    case "submitting":
      return state.today.number;
    case "finished":
      return state.result.number;
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

function screenFor({ state, timing, secondsLeft, fuseRef, start, answer, retry }: GameController, store: Store): ReactNode {
  switch (state.status) {
    case "loading":
      return <Landing today={null} isStarting={false} store={store} onStart={start} />;
    case "ready":
      return <Landing today={state.today} isStarting={false} store={store} onStart={start} />;
    case "starting":
      return <Landing today={state.today} isStarting store={store} onStart={start} />;
    case "playing":
    case "submitting":
      return <PlayView key={state.attemptId} state={state} secondsLeft={secondsLeft} fuseRef={fuseRef} onAnswer={answer} />;
    case "finished":
      return (
        <ResultsView
          key={state.result.day}
          result={state.result}
          isFresh={state.isFresh}
          timing={timing}
          store={store}
          isStorageAvailable={isStorageAvailable()}
        />
      );
    case "unavailable":
      return <Unavailable reason={state.reason} launchDay={state.launchDay} />;
    case "error":
      return <ErrorNotice message={state.message} onRetry={retry} />;
    default: {
      const unreachable: never = state;
      return unreachable;
    }
  }
}
