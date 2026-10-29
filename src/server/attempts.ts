import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { content, puzzleForDay, resolveToday, type Content } from "@/content/catalog";
import { LAUNCH_DAY, challengeNumber } from "@/config";
import type { Puzzle } from "@/engine/puzzle";
import { usesGrid } from "@/engine/validate";
import type { AttemptSummary, PastPuzzleResponse, StartResponse, TodayResponse } from "@/game/api-types";
import type { ChoiceIndex, Choices, Outcome, PublicPuzzle, Result, TodayInfo } from "@/game/machine";
import { LIMIT_MS } from "@/scoring/score";
import { addDays, DAY_MS, dayStartMs, nextPublicationMs, toDayKey } from "@/time/day";
import { adjudicate, GRACE_MS } from "./adjudicate";
import { db } from "./db";
import { recordEvents } from "./events";

interface AttemptRow {
  id: string;
  share_id: string;
  player_id: string;
  day: string;
  puzzle_id: string;
  started_at: number;
  finished_at: number | null;
  choice: number | null;
  outcome: Outcome | null;
  client_elapsed_ms: number | null;
  elapsed_ms: number | null;
  score: number | null;
}

type FinishedRow = AttemptRow & { finished_at: number; outcome: Outcome; score: number };

const SHARE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function newShareId(): string {
  return Array.from(randomBytes(10), (b) => SHARE_ALPHABET[b % SHARE_ALPHABET.length]).join("");
}

function isFinished(row: AttemptRow): row is FinishedRow {
  return row.finished_at !== null && row.outcome !== null && row.score !== null;
}

function findForDay(playerId: string, day: string): AttemptRow | undefined {
  return db().prepare("SELECT * FROM attempts WHERE player_id = ? AND day = ?").get(playerId, day) as AttemptRow | undefined;
}

function findById(playerId: string, id: string): AttemptRow | undefined {
  return db().prepare("SELECT * FROM attempts WHERE id = ? AND player_id = ?").get(id, playerId) as AttemptRow | undefined;
}

export function findByShareId(shareId: string): FinishedRow | null {
  const row = db().prepare("SELECT * FROM attempts WHERE share_id = ?").get(shareId) as AttemptRow | undefined;
  return row && isFinished(row) ? row : null;
}

export function toPublicPuzzle(p: Puzzle): PublicPuzzle {
  return {
    sequence: [...p.sequence],
    choices: [...p.choices] as Choices,
    shown: p.shown,
    difficulty: p.difficulty,
    grid: usesGrid(p.rule),
  };
}

export function toResult(row: FinishedRow, p: Puzzle): Result {
  return {
    day: row.day,
    number: challengeNumber(row.day),
    puzzleId: p.id,
    outcome: row.outcome,
    choice: row.choice as ChoiceIndex | null,
    answerIndex: p.answerIndex as ChoiceIndex,
    elapsedMs: row.elapsed_ms,
    score: row.score,
    sequence: [...p.sequence],
    choices: [...p.choices] as Choices,
    explanation: p.explanation,
    shareId: row.share_id,
    grid: usesGrid(p.rule),
    difficulty: p.difficulty,
  };
}

function emitOutcome(row: FinishedRow, p: Puzzle, at: number): void {
  const meta = { day: row.day, puzzleId: p.id, family: p.family, difficulty: p.difficulty };
  switch (row.outcome) {
    case "correct":
      recordEvents([{ name: "puzzle_correct", props: { ...meta, elapsedMs: row.elapsed_ms ?? 0, score: row.score } }], row.player_id, at);
      return;
    case "incorrect":
      recordEvents([{ name: "puzzle_incorrect", props: { ...meta, elapsedMs: row.elapsed_ms ?? 0 } }], row.player_id, at);
      return;
    case "timeout":
      recordEvents([{ name: "puzzle_timeout", props: meta }], row.player_id, at);
      return;
    default: {
      const unreachable: never = row.outcome;
      throw new Error(`Unknown outcome ${unreachable}`);
    }
  }
}

// First write wins: the UPDATE only applies to an attempt that is still open
function finalize(row: AttemptRow, p: Puzzle, choice: ChoiceIndex | null, clientElapsedMs: number, nowMs: number): FinishedRow {
  const verdict = adjudicate({
    serverElapsedMs: nowMs - row.started_at,
    clientElapsedMs,
    choice,
    answerIndex: p.answerIndex as ChoiceIndex,
  });
  const changes = db()
    .prepare(
      `UPDATE attempts SET finished_at = ?, choice = ?, outcome = ?, client_elapsed_ms = ?, elapsed_ms = ?, score = ?
       WHERE id = ? AND finished_at IS NULL`,
    )
    .run(nowMs, choice, verdict.outcome, Math.max(0, Math.round(clientElapsedMs)), verdict.elapsedMs, verdict.score, row.id).changes;
  const stored = db().prepare("SELECT * FROM attempts WHERE id = ?").get(row.id) as AttemptRow;
  if (!isFinished(stored)) throw new Error(`Attempt ${row.id} did not finish`);
  if (changes === 1) emitOutcome(stored, p, nowMs);
  return stored;
}

function hasExpired(row: AttemptRow, nowMs: number): boolean {
  return row.finished_at === null && nowMs - row.started_at > LIMIT_MS + GRACE_MS;
}

// Open attempts whose time has run out become timeouts the next time anyone looks
function settle(row: AttemptRow, p: Puzzle, nowMs: number): AttemptRow {
  return hasExpired(row, nowMs) ? finalize(row, p, null, LIMIT_MS, nowMs) : row;
}

function summarize(row: AttemptRow | undefined, p: Puzzle, nowMs: number): AttemptSummary {
  if (!row) return { state: "none" };
  const settled = settle(row, p, nowMs);
  if (isFinished(settled)) return { state: "finished", result: toResult(settled, p) };
  return { state: "open", remainingMs: remainingOf(settled, nowMs) };
}

function remainingOf(row: AttemptRow, nowMs: number): number {
  return Math.max(0, LIMIT_MS - (nowMs - row.started_at));
}

// A day's answer stays secret until nobody can still be playing it: a Start at 23:59:59 may finish 62.5 s after midnight
export function isDaySettled(day: string, nowMs: number): boolean {
  return nowMs > dayStartMs(day) + DAY_MS + LIMIT_MS + GRACE_MS;
}

interface CarriedOver {
  row: AttemptRow;
  puzzle: Puzzle;
  info: TodayInfo;
}

// An attempt started just before 00:00 UTC belongs to its own day, so it stays resumable for its last seconds
function carriedOver(playerId: string, nowMs: number): CarriedOver | null {
  const today = toDayKey(nowMs);
  const day = addDays(today, -1);
  const row = findForDay(playerId, day);
  if (!row || row.finished_at !== null || hasExpired(row, nowMs)) return null;
  const puzzle = content().puzzles.get(row.puzzle_id);
  if (!puzzle) return null;
  // The next puzzle is already out, so the results screen offers it straight away
  return { row, puzzle, info: { day, number: challengeNumber(day), nextAt: dayStartMs(today), difficulty: puzzle.difficulty } };
}

export function getToday(playerId: string | null, nowMs: number): TodayResponse {
  const carry = playerId ? carriedOver(playerId, nowMs) : null;
  if (carry) {
    return {
      status: "available",
      day: carry.info.day,
      number: carry.info.number,
      difficulty: carry.info.difficulty,
      attempt: { state: "open", remainingMs: remainingOf(carry.row, nowMs) },
      serverNow: nowMs,
      nextAt: carry.info.nextAt,
    };
  }
  const timing = { serverNow: nowMs, nextAt: nextPublicationMs(nowMs) };
  const today = resolveToday(nowMs);
  switch (today.status) {
    case "not-launched":
      return { status: "not-launched", launchDay: today.launchDay, ...timing };
    case "no-puzzle":
      return { status: "no-puzzle", day: today.day, number: today.number, ...timing };
    case "available": {
      const row = playerId ? findForDay(playerId, today.day) : undefined;
      return {
        status: "available",
        day: today.day,
        number: today.number,
        difficulty: today.puzzle.difficulty,
        attempt: summarize(row, today.puzzle, nowMs),
        ...timing,
      };
    }
    default: {
      const unreachable: never = today;
      throw new Error(`Unknown status ${JSON.stringify(unreachable)}`);
    }
  }
}

export function startAttempt(playerId: string, nowMs: number): StartResponse {
  const carry = carriedOver(playerId, nowMs);
  if (carry) {
    return { state: "playing", attemptId: carry.row.id, remainingMs: remainingOf(carry.row, nowMs), puzzle: toPublicPuzzle(carry.puzzle), today: carry.info };
  }
  const today = resolveToday(nowMs);
  if (today.status === "not-launched") return { state: "unavailable", reason: "not-launched", launchDay: today.launchDay };
  if (today.status === "no-puzzle") return { state: "unavailable", reason: "no-puzzle", launchDay: null };

  const p = today.puzzle;
  const existing = findForDay(playerId, today.day);
  if (!existing) {
    // Two tabs pressing Start at once end up sharing one attempt
    db()
      .prepare(
        "INSERT INTO attempts (id, share_id, player_id, day, puzzle_id, started_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (player_id, day) DO NOTHING",
      )
      .run(randomUUID(), newShareId(), playerId, today.day, p.id, nowMs);
  }
  const row = settle(findForDay(playerId, today.day) as AttemptRow, p, nowMs);
  if (isFinished(row)) return { state: "finished", result: toResult(row, p) };

  const info: TodayInfo = { day: today.day, number: today.number, nextAt: nextPublicationMs(nowMs), difficulty: p.difficulty };
  // The clock keeps running across refreshes, so refreshing never buys time
  return { state: "playing", attemptId: row.id, remainingMs: remainingOf(row, nowMs), puzzle: toPublicPuzzle(p), today: info };
}

export type FinishOutcome = { status: "ok"; result: Result } | { status: "not-found" };

export function finishAttempt(playerId: string, attemptId: string, choice: ChoiceIndex | null, clientElapsedMs: number, nowMs: number): FinishOutcome {
  const row = findById(playerId, attemptId);
  if (!row) return { status: "not-found" };
  const p = content().puzzles.get(row.puzzle_id);
  if (!p) return { status: "not-found" };
  const finished = isFinished(row) ? row : finalize(row, p, choice, clientElapsedMs, nowMs);
  return { status: "ok", result: toResult(finished, p) };
}

export function historyFor(playerId: string, nowMs: number, c: Content = content()): Result[] {
  const rows = db().prepare("SELECT * FROM attempts WHERE player_id = ? ORDER BY day DESC LIMIT 400").all(playerId) as AttemptRow[];
  return rows.flatMap((row) => {
    const p = c.puzzles.get(row.puzzle_id);
    if (!p) return [];
    const settled = settle(row, p, nowMs);
    return isFinished(settled) ? [toResult(settled, p)] : [];
  });
}

export type PastPuzzleOutcome = { status: "ok"; puzzle: PastPuzzleResponse } | { status: "not-found" } | { status: "locked" };

// Settled days are open to everyone; an unsettled day only once this player has finished it; the future never
export function pastPuzzle(day: string, playerId: string | null, nowMs: number): PastPuzzleOutcome {
  const today = toDayKey(nowMs);
  if (day < LAUNCH_DAY || day > today) return { status: "not-found" };
  const p = puzzleForDay(day);
  if (!p) return { status: "not-found" };
  const row = playerId ? findForDay(playerId, day) : undefined;
  const settled = row ? settle(row, p, nowMs) : undefined;
  const result = settled && isFinished(settled) ? toResult(settled, p) : null;
  if (!result && !isDaySettled(day, nowMs)) return { status: "locked" };
  return {
    status: "ok",
    puzzle: {
      day,
      number: challengeNumber(day),
      sequence: [...p.sequence],
      choices: [...p.choices] as Choices,
      answerIndex: p.answerIndex as ChoiceIndex,
      explanation: p.explanation,
      grid: usesGrid(p.rule),
      difficulty: p.difficulty,
      result,
    },
  };
}

// Share cards come from the database, so they can't be forged
export function sharedResult(shareId: string): Result | null {
  const row = findByShareId(shareId);
  const p = row ? content().puzzles.get(row.puzzle_id) : undefined;
  return row && p ? toResult(row, p) : null;
}
