import { daysBetween } from "@/time/day";

// Isomorphic: contains no puzzle content
// [Confirm] the real launch date before going live
export const LAUNCH_DAY = "2026-11-16"; // challenge #1, a Monday

export function challengeNumber(day: string): number {
  return daysBetween(LAUNCH_DAY, day) + 1;
}

export function formatChallengeNumber(n: number): string {
  return `#${String(n).padStart(3, "0")}`;
}

export const SITE_NAME = "Nextile";
