import type { Metadata } from "next";
import Link from "next/link";
import { LAUNCH_DAY, challengeNumber, formatChallengeNumber } from "@/config";
import { puzzleForDay } from "@/content/catalog";
import type { Result } from "@/game/machine";
import { formatSeconds } from "@/scoring/score";
import { historyFor } from "@/server/attempts";
import { serverNow } from "@/server/clock";
import { readPlayerId } from "@/server/player";
import { addDays, formatDayLabel, formatShortDayLabel, toDayKey } from "@/time/day";
import { PageShell } from "@/ui/PageShell";

export const metadata: Metadata = { title: "Archive · Nextile" };

function resultLabel(r: Result | undefined): string {
  if (!r) return "Not played";
  switch (r.outcome) {
    case "correct":
      return `Solved in ${formatSeconds(r.elapsedMs ?? 0)} s`;
    case "incorrect":
      return "Missed";
    case "timeout":
      return "Time's up";
    default: {
      const unreachable: never = r.outcome;
      return unreachable;
    }
  }
}

// Every day from launch to today, newest first; future days are never listed
export default async function ArchivePage() {
  const now = serverNow();
  const today = toDayKey(now);
  const playerId = await readPlayerId();
  const results = new Map((playerId ? historyFor(playerId, now) : []).map((r) => [r.day, r]));
  const days: string[] = [];
  for (let d = today; d >= LAUNCH_DAY; d = addDays(d, -1)) if (puzzleForDay(d)) days.push(d);

  return (
    <PageShell>
      <h1 className="type-display text-[36px] sm:text-[48px]">Archive</h1>
      <p className="type-body mt-3 text-[17px]">Every puzzle so far, with the answer and the rule. You can look back, but each day only counts once.</p>
      {days.length === 0 ? (
        <p className="panel mt-6 p-6 text-[17px]">The archive starts on {formatDayLabel(LAUNCH_DAY)}, when the first puzzle goes live.</p>
      ) : (
        <div className="panel mt-6 overflow-hidden">
          <table className="w-full border-collapse text-left">
            <caption className="type-small px-4 pt-3 text-left">Your results on this device</caption>
            <thead>
              <tr className="border-b-[3px] border-ink">
                <th scope="col" className="type-label px-4 py-3 text-[14px]">
                  Challenge
                </th>
                <th scope="col" className="type-label px-2 py-3 text-[14px]">
                  Your result
                </th>
                <th scope="col" className="type-label hidden px-2 py-3 text-[14px] sm:table-cell">
                  Score
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const r = results.get(day);
                const isTodayOpen = day === today && !r;
                return (
                  <tr key={day} className="border-b-2 border-ink/15 last:border-b-0">
                    <th scope="row" className="px-4 py-3 align-middle font-normal">
                      <span className="type-label block text-[16px]">{formatChallengeNumber(challengeNumber(day))}</span>
                      <span className="type-small">{formatShortDayLabel(day)}</span>
                    </th>
                    <td className="px-2 py-3 align-middle">
                      {resultLabel(r)}
                      <span className="block text-[13px] sm:hidden">{r ? `Score ${r.score}` : ""}</span>
                    </td>
                    <td className="hidden px-2 py-3 align-middle sm:table-cell">{r ? r.score : "—"}</td>
                    <td className="px-4 py-3 text-right align-middle">
                      {isTodayOpen ? (
                        <Link href="/" className="btn btn-signal press min-h-[40px]">
                          Play<span className="sr-only"> {formatChallengeNumber(challengeNumber(day))}</span>
                        </Link>
                      ) : (
                        <Link href={`/archive/${day}`} className="btn press min-h-[40px]">
                          View<span className="sr-only"> {formatChallengeNumber(challengeNumber(day))}</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
