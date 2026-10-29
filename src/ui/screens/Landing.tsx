"use client";

import { TUTORIAL } from "@/content/tutorial";
import { formatChallengeNumber } from "@/config";
import { usesGrid } from "@/engine/validate";
import type { TodayInfo } from "@/game/machine";
import { streaks } from "@/persistence/stats";
import type { Store } from "@/persistence/store";
import { formatSeconds } from "@/scoring/score";
import { addDays, formatDayLabel } from "@/time/day";
import { DifficultyMark } from "../DifficultyMark";
import { SequenceRail } from "../SequenceRail";

export const RULE_LINE = "Find the pattern. Pick the tile that comes next. One try, sixty seconds.";

function streakLine(store: Store, today: string): string | null {
  const { current } = streaks(store.history, today);
  const yesterday = store.history[addDays(today, -1)];
  const parts: string[] = [];
  if (current > 0) parts.push(`${current}-day streak.`);
  if (yesterday?.outcome === "correct" && yesterday.elapsedMs !== null) parts.push(`Yesterday you solved it in ${formatSeconds(yesterday.elapsedMs)} s.`);
  else if (yesterday) parts.push(yesterday.outcome === "timeout" ? "Yesterday the clock ran out." : "Yesterday's got away.");
  return parts.length > 0 ? parts.join(" ") : null;
}

interface LandingProps {
  today: TodayInfo | null; // null while loading: same layout, so nothing jumps
  isStarting: boolean;
  store: Store;
  onStart: () => void;
}

export function Landing({ today, isStarting, store, onStart }: LandingProps) {
  const streak = today ? streakLine(store, today.day) : null;
  return (
    <div className="flex flex-col gap-6 pt-4 sm:pt-8">
      <div className="flex flex-col gap-3">
        <h1 className={`flex flex-col gap-1 ${today ? "" : "invisible"}`}>
          <span className="type-display text-[44px] sm:text-[64px]">{today ? formatChallengeNumber(today.number) : "#000"}</span>
          <span className="type-heading text-[22px] sm:text-[28px]">
            <span className="sr-only">, </span>
            {today ? formatDayLabel(today.day) : "Wednesday 30 September"}
          </span>
        </h1>
        <p className="type-body text-[17px] sm:text-[19px]">{RULE_LINE}</p>
      </div>

      <figure className="flex flex-col items-start gap-2">
        <SequenceRail sequence={TUTORIAL.sequence} grid={usesGrid(TUTORIAL.rule)} isCompact label="Example sequence" />
        <figcaption className="type-small text-on-mat-soft">Example. Today&apos;s puzzle stays hidden until the clock starts.</figcaption>
      </figure>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="button"
          className="btn btn-signal btn-big press"
          onClick={onStart}
          disabled={!today || isStarting}
          data-state={isStarting ? "pressed" : undefined}
        >
          <span className={today ? "" : "invisible"}>Start the clock</span>
        </button>
        <div className={`flex flex-col gap-1 ${today ? "" : "invisible"}`}>{today && <DifficultyMark difficulty={today.difficulty} />}</div>
      </div>
      <p className="type-small min-h-[18px] text-on-mat-soft">
        {isStarting ? "Dealing the tiles…" : today ? "Press Enter or Space to start. Keys 1 to 4 answer." : ""}
      </p>

      <p className="type-label min-h-[22px] text-[16px]">{streak ?? ""}</p>
    </div>
  );
}
