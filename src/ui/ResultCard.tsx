import type { Ref } from "react";
import { formatChallengeNumber } from "@/config";
import type { Result } from "@/game/machine";
import { formatSeconds } from "@/scoring/score";
import { formatDayLabel } from "@/time/day";
import { Stamp } from "./Stamp";
import { TimeBar } from "./TimeBar";
import { WordmarkText } from "./Wordmark";

interface ResultCardProps {
  result: Result;
  isFresh: boolean;
  stampRef?: Ref<HTMLHeadingElement>;
}

export function announcement(r: Pick<Result, "outcome" | "elapsedMs" | "score">): string {
  switch (r.outcome) {
    case "correct":
      return `Solved in ${formatSeconds(r.elapsedMs ?? 0)} seconds. Score ${r.score}.`;
    case "incorrect":
      return "Missed. Score 0.";
    case "timeout":
      return "Time's up. Score 0.";
    default: {
      const unreachable: never = r.outcome;
      return unreachable;
    }
  }
}

// Spoiler-free and 4:5, so a phone screenshot crops cleanly
export function ResultCard({ result, isFresh, stampRef }: ResultCardProps) {
  const time = result.outcome === "correct" && result.elapsedMs !== null ? `${formatSeconds(result.elapsedMs)} s` : result.outcome === "timeout" ? "60.0 s" : "—";
  return (
    <section aria-label="Your result" className="panel mx-auto flex aspect-[4/5] w-full max-w-[400px] flex-col justify-between p-5 sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <WordmarkText size="small" />
        <span className="type-label text-right text-[14px]">
          {formatChallengeNumber(result.number)}
          <span className="block font-medium">{formatDayLabel(result.day)}</span>
        </span>
      </div>
      <div>
        <Stamp outcome={result.outcome} isFresh={isFresh} headingRef={stampRef} />
      </div>
      <div>
        <p className="flex items-baseline gap-2">
          <span className="type-display text-[64px] sm:text-[88px]">{result.score}</span>
          <span className="type-heading text-[22px]">/100</span>
        </p>
        <p className="type-heading mt-1 text-[20px]">
          <span className="sr-only">Time: </span>
          {time}
        </p>
      </div>
      <TimeBar result={result} />
    </section>
  );
}
