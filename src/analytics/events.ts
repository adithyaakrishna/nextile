import { isDifficulty, type Difficulty } from "@/engine/difficulty";
import { hasOnlyKeys, isRecord } from "@/persistence/guards";
import { isDayKey } from "@/time/day";

interface Day {
  day: string;
}

interface PuzzleMeta {
  puzzleId: string;
  family: string;
  difficulty: Difficulty;
}

export type AnalyticsEvent =
  | { name: "landing_viewed"; props: Day & { returning: boolean; daysSinceLastVisit: number | null; via: "direct" | "share" | "other" } }
  | { name: "start_clicked"; props: Day }
  | { name: "puzzle_started"; props: Day & { resumed: boolean } }
  | { name: "answer_submitted"; props: Day & { choice: number; clientElapsedMs: number } }
  | { name: "puzzle_correct"; props: Day & PuzzleMeta & { elapsedMs: number; score: number } } // emitted by the server
  | { name: "puzzle_incorrect"; props: Day & PuzzleMeta & { elapsedMs: number } } // emitted by the server
  | { name: "puzzle_timeout"; props: Day & PuzzleMeta } // emitted by the server
  | { name: "result_viewed"; props: Day & { outcome: "correct" | "incorrect" | "timeout" } }
  | { name: "share_clicked"; props: Day & { method: "native" | "copy" } }
  | { name: "share_completed"; props: Day }
  | { name: "share_link_copied"; props: Day }
  | { name: "about_viewed"; props: Record<string, never> };

export type EventName = AnalyticsEvent["name"];
export type ClientEvent = Exclude<AnalyticsEvent, { name: "puzzle_correct" | "puzzle_incorrect" | "puzzle_timeout" }>;

function isBool(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function isCount(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 10_000_000;
}

type PropsCheck = (props: Record<string, unknown>) => boolean;

const day: PropsCheck = (p) => isDayKey(p.day);

// Each client event's allowed keys and value checks; anything else is dropped
const CLIENT_EVENTS: Record<ClientEvent["name"], { keys: readonly string[]; check: PropsCheck }> = {
  landing_viewed: {
    keys: ["day", "returning", "daysSinceLastVisit", "via"],
    check: (p) => day(p) && isBool(p.returning) && (p.daysSinceLastVisit === null || isCount(p.daysSinceLastVisit)) && ["direct", "share", "other"].includes(p.via as string),
  },
  start_clicked: { keys: ["day"], check: day },
  puzzle_started: { keys: ["day", "resumed"], check: (p) => day(p) && isBool(p.resumed) },
  answer_submitted: {
    keys: ["day", "choice", "clientElapsedMs"],
    check: (p) => day(p) && [0, 1, 2, 3].includes(p.choice as number) && isCount(p.clientElapsedMs),
  },
  result_viewed: { keys: ["day", "outcome"], check: (p) => day(p) && ["correct", "incorrect", "timeout"].includes(p.outcome as string) },
  share_clicked: { keys: ["day", "method"], check: (p) => day(p) && ["native", "copy"].includes(p.method as string) },
  share_completed: { keys: ["day"], check: day },
  share_link_copied: { keys: ["day"], check: day },
  about_viewed: { keys: [], check: () => true },
};

export function parseClientEvent(value: unknown): ClientEvent | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["name", "props"]) || typeof value.name !== "string" || !isRecord(value.props)) return null;
  const spec = CLIENT_EVENTS[value.name as ClientEvent["name"]];
  if (!spec || !hasOnlyKeys(value.props, spec.keys) || !spec.check(value.props)) return null;
  return value as ClientEvent;
}

export function isServerMeta(meta: unknown): meta is PuzzleMeta {
  return isRecord(meta) && typeof meta.puzzleId === "string" && typeof meta.family === "string" && isDifficulty(meta.difficulty);
}
