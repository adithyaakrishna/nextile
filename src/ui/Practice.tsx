"use client";

import { useEffect, useState } from "react";
import type { Puzzle } from "@/engine/puzzle";
import type { ChoiceIndex } from "@/game/machine";
import { AnswerCard, endFor } from "./AnswerCard";
import { SequenceRail } from "./SequenceRail";

// Untimed and unscored, so anyone can learn the format without pressure
export function Practice({ puzzle, grid }: { puzzle: Puzzle; grid: boolean }) {
  const [choice, setChoice] = useState<ChoiceIndex | null>(null);
  const isDone = choice !== null;

  useEffect(() => {
    if (isDone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || !/^[1-4]$/.test(e.key)) return;
      e.preventDefault();
      setChoice((Number(e.key) - 1) as ChoiceIndex);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDone]);

  return (
    <section aria-labelledby="practice-heading" className="panel flex flex-col gap-5 p-5 sm:p-6">
      <div>
        <h2 id="practice-heading" className="type-heading text-[22px] sm:text-[25px]">
          Try one, no clock
        </h2>
        <p className="type-body mt-1 text-[16px]">What comes next? Pick a card, or press its number.</p>
      </div>
      <SequenceRail sequence={puzzle.sequence} grid={grid} answer={isDone ? puzzle.choices[puzzle.answerIndex] : null} isAnswerFresh isCompact label="Practice sequence" />
      <div role="group" aria-labelledby="practice-heading" className="answers answers-compact">
        {puzzle.choices.map((tile, i) => (
          <AnswerCard
            key={i}
            tile={tile}
            grid={grid}
            index={i as ChoiceIndex}
            phase={isDone ? "done" : "idle"}
            isPick={choice === i}
            end={isDone ? endFor(i, choice, puzzle.answerIndex) : null}
            onSelect={setChoice}
          />
        ))}
      </div>
      <div aria-live="polite" className="flex min-h-[48px] flex-col items-start gap-3">
        {isDone && (
          <>
            <p className="type-body text-[16px]">
              <strong>{choice === puzzle.answerIndex ? "Solved." : "Not quite."}</strong> {puzzle.explanation}
            </p>
            <button type="button" className="btn press" onClick={() => setChoice(null)}>
              Try again
            </button>
          </>
        )}
      </div>
    </section>
  );
}
