import { formatChallengeNumber } from "@/config";
import type { LocalResult } from "@/persistence/store";
import { formatSeconds } from "@/scoring/score";

export const TIME_BAR_CELLS = 10;

// Ten cells, one per six seconds of the minute. Filled cells are time used; ✕ marks a wrong answer.
export function timeBar(r: Pick<LocalResult, "outcome" | "elapsedMs">): string {
  if (r.outcome === "timeout" || r.elapsedMs === null) return "■".repeat(TIME_BAR_CELLS);
  const used = Math.min(TIME_BAR_CELLS, Math.max(1, Math.ceil(r.elapsedMs / 6000)));
  const cells = "■".repeat(used) + "□".repeat(TIME_BAR_CELLS - used);
  return r.outcome === "correct" ? cells : cells.slice(0, used - 1) + "✕" + cells.slice(used);
}

export function headline(r: Pick<LocalResult, "outcome" | "elapsedMs">): string {
  switch (r.outcome) {
    case "correct":
      return `Solved in ${formatSeconds(r.elapsedMs ?? 0)} seconds`;
    case "incorrect":
      return "Missed it";
    case "timeout":
      return "Ran out of time";
    default: {
      const unreachable: never = r.outcome;
      return unreachable;
    }
  }
}

// Spoiler-free: nothing in the text hints at the tiles or the rule
export function shareText(r: LocalResult, streak: number, url: string): string {
  const lines = [`Nextile ${formatChallengeNumber(r.number)}`, headline(r), `Score: ${r.score}/100`, timeBar(r)];
  if (streak > 0) lines.push(`Streak: ${streak} ${streak === 1 ? "day" : "days"}`);
  lines.push("", `Play today's puzzle: ${url}`);
  return lines.join("\n");
}
