import { attributionUrl, type AttributionPlacement } from "@/config";

// [Confirm] the Teeny Tiny Computer URL. Until TTC_URL is set, attribution links point at the About page instead.
export function teenyTinyHref(placement: AttributionPlacement): string {
  const base = process.env.TTC_URL;
  if (!base) return "/about#teeny-tiny-computer";
  try {
    return attributionUrl(base, placement);
  } catch {
    return "/about#teeny-tiny-computer";
  }
}
