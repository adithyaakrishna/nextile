import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { challengeNumber, formatChallengeNumber } from "@/config";
import { formatSeconds } from "@/scoring/score";
import { pastPuzzle } from "@/server/attempts";
import { serverNow } from "@/server/clock";
import { readPlayerId } from "@/server/player";
import { formatDayLabel, isDayKey } from "@/time/day";
import { DifficultyMark } from "@/ui/DifficultyMark";
import { PageShell } from "@/ui/PageShell";
import { RulePanel } from "@/ui/RulePanel";

interface ArchiveDayProps {
  params: Promise<{ day: string }>;
}

export async function generateMetadata({ params }: ArchiveDayProps): Promise<Metadata> {
  const { day } = await params;
  return { title: isDayKey(day) ? `${formatChallengeNumber(challengeNumber(day))} · Archive · Nextile` : "Archive · Nextile" };
}

// Read-only: there is no way to answer from the archive, so a second scored attempt is impossible
export default async function ArchiveDayPage({ params }: ArchiveDayProps) {
  const { day } = await params;
  if (!isDayKey(day)) notFound();
  const outcome = pastPuzzle(day, await readPlayerId(), serverNow());
  if (outcome.status === "not-found") notFound();

  if (outcome.status === "locked") {
    return (
      <PageShell>
        <section className="panel flex flex-col items-start gap-4 p-6">
          <h1 className="type-heading text-[25px]">The answer to {formatChallengeNumber(challengeNumber(day))} isn&apos;t out yet</h1>
          <p className="type-body text-[17px]">
            It appears here once you&apos;ve finished it, or for everyone shortly after the day ends, once no one can still be playing it.
          </p>
          <Link href="/" className="btn btn-signal press">
            Play today&apos;s puzzle
          </Link>
        </section>
      </PageShell>
    );
  }

  const p = outcome.puzzle;
  const r = p.result;
  const summary = !r
    ? "You didn't play this one."
    : r.outcome === "correct"
      ? `You solved it in ${formatSeconds(r.elapsedMs ?? 0)} s and scored ${r.score}.`
      : r.outcome === "incorrect"
        ? "You missed this one."
        : "The clock ran out on this one.";

  return (
    <PageShell>
      <Link href="/archive" className="type-label link inline-flex min-h-[44px] items-center">
        ← Archive
      </Link>
      <div className="mb-5 mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="flex flex-col gap-1">
          <span className="type-display text-[40px] sm:text-[56px]">{formatChallengeNumber(p.number)}</span>
          <span className="type-heading text-[20px] sm:text-[24px]">{formatDayLabel(p.day)}</span>
        </h1>
        <DifficultyMark difficulty={p.difficulty} />
      </div>
      <p className="type-label mb-5 text-[17px]">{summary}</p>
      <RulePanel
        sequence={p.sequence}
        choices={p.choices}
        answerIndex={p.answerIndex}
        choice={r?.choice ?? null}
        explanation={p.explanation}
        grid={p.grid}
      />
    </PageShell>
  );
}
