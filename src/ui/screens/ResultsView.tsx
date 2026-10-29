"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatChallengeNumber } from "@/config";
import type { Result } from "@/game/machine";
import type { Timing } from "@/game/useGame";
import { stats } from "@/persistence/stats";
import type { Store } from "@/persistence/store";
import { shareText } from "@/share/text";
import { NextCountdown } from "../NextCountdown";
import { announcement, ResultCard } from "../ResultCard";
import { RulePanel } from "../RulePanel";
import { ShareButton } from "../ShareButton";
import { StatsGrid } from "../StatsGrid";

interface ResultsViewProps {
  result: Result;
  isFresh: boolean;
  timing: Timing;
  store: Store;
  isStorageAvailable: boolean;
}

export function ResultsView({ result, isFresh, timing, store, isStorageAvailable }: ResultsViewProps) {
  const stampRef = useRef<HTMLHeadingElement>(null);
  const history = store.history[result.day] ? store.history : { ...store.history, [result.day]: result };
  const summary = stats(history, result.day);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/s/${result.shareId}`;

  useEffect(() => {
    stampRef.current?.focus({ preventScroll: !isFresh });
    if (isFresh) window.scrollTo({ top: 0 });
  }, [isFresh]);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <h1 className="sr-only">Nextile {formatChallengeNumber(result.number)} result</h1>
      <p role="status" className="sr-only">
        {announcement(result)}
      </p>
      {!isFresh && <p className="type-label text-[16px]">You&apos;ve played today&apos;s puzzle. Here&apos;s how it went.</p>}

      <ResultCard result={result} isFresh={isFresh} stampRef={stampRef} />

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-[3px] flex-1 bg-current opacity-40" />
        <span className="type-small">The answer is below</span>
        <span className="h-[3px] flex-1 bg-current opacity-40" />
      </div>

      <RulePanel
        sequence={result.sequence}
        choices={result.choices}
        answerIndex={result.answerIndex}
        choice={result.choice}
        explanation={result.explanation}
        grid={result.grid}
        isFresh={isFresh}
      />

      <StatsGrid stats={summary} />
      {!isStorageAvailable && <p className="type-small text-on-mat-soft">This browser isn&apos;t saving data, so results can&apos;t be kept on this device.</p>}

      <ShareButton text={shareText(result, summary.current, url)} day={result.day} />

      <NextCountdown nextAt={timing.nextAt} offsetMs={timing.offsetMs} nextNumber={result.number + 1} />

      <p className="type-small text-on-mat-soft">
        This game runs on a Teeny Tiny Computer.{" "}
        <Link href="/about#teeny-tiny-computer" className="link">
          What&apos;s that?
        </Link>
      </p>
    </div>
  );
}
