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

export const ATTRIBUTION_PLACEMENTS = ["footer", "result", "about", "share_page"] as const;
export type AttributionPlacement = (typeof ATTRIBUTION_PLACEMENTS)[number];

// Outbound links to Teeny Tiny Computer carry UTM tags so signups can be attributed
export function attributionUrl(base: string, placement: AttributionPlacement): string {
  const url = new URL(base);
  url.searchParams.set("utm_source", "nextile");
  url.searchParams.set("utm_medium", "game");
  url.searchParams.set("utm_campaign", "nextile");
  url.searchParams.set("utm_content", placement);
  return url.toString();
}
