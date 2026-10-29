import { LAUNCH_DAY } from "@/config";
import type { Puzzle } from "@/engine/puzzle";
import { validateAll, type Issue, type ValidationResult } from "@/engine/validate";
import { addDays, toDayKey } from "@/time/day";
import { puzzleHash, type Lock } from "./lock";
import type { ScheduleEntry } from "./schedule";

export const RUNWAY_WARN_DAYS = 14;
export const RUNWAY_FAIL_DAYS = 7;
export const AGENT_REVIEWER = "ai-agent";

export interface ContentInput {
  puzzles: readonly Puzzle[];
  schedule: readonly ScheduleEntry[];
  lock: Lock;
  nowMs: number;
}

function scheduleIssues({ puzzles, schedule, nowMs }: ContentInput): { errors: Issue[]; warnings: Issue[] } {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const byId = new Map(puzzles.map((p) => [p.id, p]));
  const fail = (message: string, puzzleId?: string) => errors.push({ check: "schedule", puzzleId, message });

  if (schedule.length > 0 && schedule[0].day !== LAUNCH_DAY) fail(`schedule starts on ${schedule[0].day}, not launch day ${LAUNCH_DAY}`);
  const seen = new Set<string>();
  schedule.forEach((entry, i) => {
    if (i > 0 && entry.day !== addDays(schedule[i - 1].day, 1)) fail(`gap or disorder between ${schedule[i - 1].day} and ${entry.day}`);
    if (seen.has(entry.id)) fail(`${entry.id} is scheduled more than once`, entry.id);
    seen.add(entry.id);
    const p = byId.get(entry.id);
    if (!p) return fail(`${entry.day} points to ${entry.id}, which does not exist`, entry.id);
    if (!p.review) errors.push({ check: "review", puzzleId: p.id, message: `scheduled for ${entry.day} without a review` });
    else if (p.review.by.startsWith(AGENT_REVIEWER)) {
      warnings.push({ check: "review", puzzleId: p.id, message: "reviewed by an AI agent only; needs a person to solve it cold before it goes live" });
    }
  });

  const positions = schedule.flatMap((e) => {
    const p = byId.get(e.id);
    return p ? [p.answerIndex] : [];
  });
  positions.forEach((pos, i) => {
    if (i >= 2 && pos === positions[i - 1] && pos === positions[i - 2]) fail(`answer position ${pos + 1} is used three days in a row ending ${schedule[i].day}`);
  });
  if (positions.length >= 20) {
    for (let pos = 0; pos < 4; pos++) {
      const share = positions.filter((x) => x === pos).length / positions.length;
      if (share < 0.2 || share > 0.3) fail(`answer position ${pos + 1} is used ${(share * 100).toFixed(0)}% of the time (want 20–30%)`);
    }
  }

  const today = toDayKey(nowMs);
  let runway = 0;
  for (let day = today < LAUNCH_DAY ? LAUNCH_DAY : today; schedule.some((e) => e.day === day); day = addDays(day, 1)) runway++;
  if (runway < RUNWAY_FAIL_DAYS) fail(`only ${runway} days of puzzles are scheduled (minimum ${RUNWAY_FAIL_DAYS})`);
  else if (runway < RUNWAY_WARN_DAYS) warnings.push({ check: "schedule", message: `runway is ${runway} days; author more puzzles soon` });
  return { errors, warnings };
}

function lockIssues({ puzzles, schedule, lock, nowMs }: ContentInput): { errors: Issue[]; warnings: Issue[] } {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const byId = new Map(puzzles.map((p) => [p.id, p]));
  const byDay = new Map(schedule.map((e) => [e.day, e.id]));
  for (const [day, entry] of Object.entries(lock)) {
    const p = byId.get(entry.id);
    if (byDay.get(day) !== entry.id) errors.push({ check: "lock", puzzleId: entry.id, message: `${day} was published as ${entry.id} but the schedule now says ${byDay.get(day) ?? "nothing"}` });
    if (!p) errors.push({ check: "lock", puzzleId: entry.id, message: `published puzzle ${entry.id} no longer exists` });
    else if (puzzleHash(p) !== entry.hash) errors.push({ check: "lock", puzzleId: p.id, message: `published on ${day} and has since been changed` });
  }
  const today = toDayKey(nowMs);
  for (const e of schedule) {
    if (e.day <= today && !lock[e.day]) warnings.push({ check: "lock", puzzleId: e.id, message: `${e.day} is published but not locked; run pnpm lock:published` });
  }
  return { errors, warnings };
}

export function validateContent(input: ContentInput): ValidationResult {
  const all = validateAll(input.puzzles);
  const schedule = scheduleIssues(input);
  const lock = lockIssues(input);
  return {
    errors: [...all.errors, ...schedule.errors, ...lock.errors],
    warnings: [...all.warnings, ...schedule.warnings, ...lock.warnings],
  };
}
