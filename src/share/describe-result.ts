import { formatChallengeNumber } from "@/config";
import type { Result } from "@/game/machine";
import { formatSeconds } from "@/scoring/score";

// Spoiler-free sentences for the share page and its metadata
export function sharedHeadline(r: Pick<Result, "outcome" | "elapsedMs" | "number">): string {
  const n = formatChallengeNumber(r.number);
  switch (r.outcome) {
    case "correct":
      return `Someone solved ${n} in ${formatSeconds(r.elapsedMs ?? 0)} seconds.`;
    case "incorrect":
      return `Someone took on ${n} and missed.`;
    case "timeout":
      return `Someone ran out of time on ${n}.`;
    default: {
      const unreachable: never = r.outcome;
      return unreachable;
    }
  }
}

export function sharedTitle(r: Pick<Result, "outcome" | "elapsedMs" | "number">): string {
  const n = formatChallengeNumber(r.number);
  switch (r.outcome) {
    case "correct":
      return `Nextile ${n}: solved in ${formatSeconds(r.elapsedMs ?? 0)} s`;
    case "incorrect":
      return `Nextile ${n}: missed it`;
    case "timeout":
      return `Nextile ${n}: ran out of time`;
    default: {
      const unreachable: never = r.outcome;
      return unreachable;
    }
  }
}
