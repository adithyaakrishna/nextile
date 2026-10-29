// UTC days are exactly 86,400,000 ms in JavaScript time (no daylight saving, no leap seconds)
export const DAY_MS = 86_400_000;

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function toDayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function dayStartMs(key: string): number {
  return Date.parse(`${key}T00:00:00.000Z`);
}

export function addDays(key: string, n: number): string {
  return toDayKey(dayStartMs(key) + n * DAY_MS);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((dayStartMs(to) - dayStartMs(from)) / DAY_MS);
}

export function nextPublicationMs(nowMs: number): number {
  return dayStartMs(toDayKey(nowMs)) + DAY_MS;
}

export function isDayKey(value: unknown): value is string {
  return typeof value === "string" && DAY_KEY.test(value) && toDayKey(dayStartMs(value)) === value;
}

// 0 = Sunday … 6 = Saturday, for the UTC day
export function weekdayOf(key: string): number {
  return new Date(dayStartMs(key)).getUTCDay();
}

const DAY_LABEL = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const SHORT_DAY_LABEL = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

// "Sunday 27 December": the puzzle's UTC calendar date, identical on server and client
export function formatDayLabel(key: string): string {
  return DAY_LABEL.format(dayStartMs(key)).replace(",", "");
}

export function formatShortDayLabel(key: string): string {
  return SHORT_DAY_LABEL.format(dayStartMs(key)).replace(",", "");
}

// "7:00 pm" in the viewer's own time zone; only call this in the browser
export function formatLocalTime(ms: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(ms).toLowerCase();
}
