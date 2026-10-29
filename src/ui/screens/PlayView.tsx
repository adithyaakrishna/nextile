"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { ChoiceIndex, PlayingState, SubmittingState } from "@/game/machine";
import { LIMIT_MS } from "@/scoring/score";
import { AnswerCard, type CardPhase } from "../AnswerCard";
import { Clock } from "../Clock";
import { DifficultyMark } from "../DifficultyMark";
import { SequenceRail } from "../SequenceRail";

const WAIT_BEFORE_NOTICE_MS = 300;

// Only a few announcements, so the clock never floods a screen reader
function clockAnnouncement(secondsLeft: number, isResumed: boolean): string {
  if (secondsLeft > 30) return isResumed ? "The clock is still running." : "Sixty seconds. Go.";
  if (secondsLeft > 10) return "30 seconds left";
  if (secondsLeft > 5) return "10 seconds left";
  return "5 seconds left";
}

interface PlayViewProps {
  state: PlayingState | SubmittingState;
  secondsLeft: number;
  fuseRef: RefObject<HTMLDivElement | null>;
  onAnswer: (choice: ChoiceIndex) => void;
}

export function PlayView({ state, secondsLeft, fuseRef, onAnswer }: PlayViewProps) {
  const promptRef = useRef<HTMLHeadingElement>(null);
  const [isWaitingLong, setIsWaitingLong] = useState(false);
  const isLocked = state.status === "submitting";
  const choice = state.status === "submitting" ? state.choice : null;
  const syncError = state.status === "submitting" ? state.syncError : null;
  const { puzzle } = state;

  // Focus moves to the prompt when play starts, so a screen reader reads the sequence next
  useEffect(() => {
    promptRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isLocked) return;
    const timer = window.setTimeout(() => setIsWaitingLong(true), WAIT_BEFORE_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [isLocked]);

  const phase: CardPhase = isLocked ? "locked" : "idle";
  const notice = syncError ?? (isLocked && isWaitingLong ? "Checking your answer" : "");
  // Once locked, the clock freezes at the moment of the answer, even when restored after a refresh
  const lockedElapsed = state.status === "submitting" ? Math.min(LIMIT_MS, state.elapsedMs) : null;
  const shownSeconds = lockedElapsed === null ? secondsLeft : Math.ceil((LIMIT_MS - lockedElapsed) / 1000);

  return (
    <div className="flex flex-col pt-1" data-slots={puzzle.sequence.length + 1}>
      <Clock secondsLeft={shownSeconds} fuseRef={fuseRef} elapsed={lockedElapsed === null ? undefined : lockedElapsed / LIMIT_MS} />
      <p className="sr-only" aria-live="polite">
        {clockAnnouncement(secondsLeft, state.isResumed)}
      </p>

      <div className="mt-3 flex min-h-[28px] items-center justify-between gap-3 sm:mt-4">
        <h2 id="prompt" ref={promptRef} tabIndex={-1} className="type-heading whitespace-nowrap text-[18px] outline-none min-[360px]:text-[20px] sm:text-[25px]">
          What comes next?
        </h2>
        <DifficultyMark difficulty={puzzle.difficulty} />
      </div>

      <div className="mt-2 sm:mt-4">
        <SequenceRail sequence={puzzle.sequence} grid={puzzle.grid} isDealing={!state.isResumed} />
      </div>

      <div role="group" aria-labelledby="prompt" className="answers mt-4 sm:mt-6">
        {puzzle.choices.map((tile, i) => (
          <AnswerCard
            key={i}
            tile={tile}
            grid={puzzle.grid}
            index={i as ChoiceIndex}
            phase={phase}
            isPick={choice === i}
            end={null}
            onSelect={onAnswer}
          />
        ))}
      </div>

      <p aria-live="polite" className="type-label mt-4 min-h-[22px] text-center text-[15px]">
        {notice}
      </p>
    </div>
  );
}
