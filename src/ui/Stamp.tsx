import type { Ref } from "react";
import type { Outcome } from "@/game/machine";

export const STAMP_WORDS: Record<Outcome, string> = {
  correct: "Solved",
  incorrect: "Missed",
  timeout: "Time's up",
};

interface StampProps {
  outcome: Outcome;
  isFresh?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
}

// Lands with a slight overshoot when the attempt ends; focus moves here for screen readers
export function Stamp({ outcome, isFresh = false, headingRef }: StampProps) {
  return (
    <h2 ref={headingRef} tabIndex={-1} className="stamp type-stamp outline-none" data-outcome={outcome} data-fresh={isFresh}>
      {STAMP_WORDS[outcome]}
    </h2>
  );
}
