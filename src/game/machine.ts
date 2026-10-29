import type { Difficulty } from "@/engine/difficulty";
import type { Tile } from "@/engine/domain";
import { LIMIT_MS } from "@/scoring/score";

export type ChoiceIndex = 0 | 1 | 2 | 3;
export type Outcome = "correct" | "incorrect" | "timeout";
export type Choices = [Tile, Tile, Tile, Tile];

export interface TodayInfo {
  day: string;
  number: number;
  nextAt: number;
  difficulty: Difficulty;
}

export interface PublicPuzzle {
  sequence: Tile[];
  choices: Choices;
  shown: 4 | 5;
  difficulty: Difficulty;
  grid: boolean; // draw the 3×3 position guide
}

export interface Result {
  day: string;
  number: number;
  puzzleId: string;
  outcome: Outcome;
  choice: ChoiceIndex | null;
  answerIndex: ChoiceIndex;
  elapsedMs: number | null;
  score: number;
  sequence: Tile[];
  choices: Choices;
  explanation: string;
  shareId: string;
  grid: boolean;
  difficulty: Difficulty;
}

interface Live {
  today: TodayInfo;
  attemptId: string;
  puzzle: PublicPuzzle;
  startedAt: number; // monotonic clock milliseconds
  deadline: number;
  isResumed: boolean;
}

export type UnavailableReason = "not-launched" | "no-puzzle";

export type PlayingState = { status: "playing" } & Live;
export type SubmittingState = { status: "submitting"; choice: ChoiceIndex | null; elapsedMs: number; syncError: string | null } & Live;

export type GameState =
  | { status: "loading" }
  | { status: "ready"; today: TodayInfo }
  | { status: "starting"; today: TodayInfo }
  | PlayingState
  | SubmittingState
  | { status: "finished"; result: Result; isFresh: boolean }
  | { status: "unavailable"; reason: UnavailableReason; launchDay: string | null }
  | { status: "error"; message: string };

export type GameEvent =
  | { type: "TODAY_LOADED"; today: TodayInfo }
  | { type: "ALREADY_FINISHED"; result: Result }
  | { type: "UNAVAILABLE"; reason: UnavailableReason; launchDay: string | null }
  | { type: "START_REQUESTED" }
  | { type: "ATTEMPT_OPENED"; today: TodayInfo; attemptId: string; puzzle: PublicPuzzle; remainingMs: number; now: number }
  | { type: "RESYNC"; remainingMs: number; now: number } // the server says less time is left (e.g. after the phone slept)
  | { type: "ANSWER"; choice: ChoiceIndex; now: number }
  | { type: "RELOCK"; choice: ChoiceIndex | null; elapsedMs: number } // a saved answer that the server hasn't scored yet
  | { type: "TICK"; now: number }
  | { type: "RESOLVED"; result: Result }
  | { type: "SYNC_FAILED"; message: string }
  | { type: "FAILED"; message: string }
  | { type: "RETRY" };

export const INITIAL_STATE: GameState = { status: "loading" };

function lock(s: PlayingState, choice: ChoiceIndex | null, elapsedMs: number): SubmittingState {
  return { ...s, status: "submitting", choice, elapsedMs, syncError: null };
}

export function reduce(state: GameState, e: GameEvent): GameState {
  switch (e.type) {
    case "TODAY_LOADED":
      return state.status === "loading" ? { status: "ready", today: e.today } : state;
    case "ALREADY_FINISHED":
      return state.status === "loading" || state.status === "starting" ? { status: "finished", result: e.result, isFresh: false } : state;
    case "UNAVAILABLE":
      return state.status === "loading" || state.status === "starting" ? { status: "unavailable", reason: e.reason, launchDay: e.launchDay } : state;
    case "START_REQUESTED":
      return state.status === "ready" ? { status: "starting", today: state.today } : state;
    case "ATTEMPT_OPENED": {
      if (state.status !== "loading" && state.status !== "starting") return state;
      const remainingMs = Math.min(LIMIT_MS, Math.max(0, e.remainingMs));
      const startedAt = e.now - (LIMIT_MS - remainingMs); // a resumed attempt keeps the time already used
      return {
        status: "playing",
        today: e.today,
        attemptId: e.attemptId,
        puzzle: e.puzzle,
        startedAt,
        deadline: startedAt + LIMIT_MS,
        isResumed: state.status === "loading",
      };
    }
    case "RESYNC": {
      if (state.status !== "playing") return state;
      const deadline = Math.min(state.deadline, e.now + e.remainingMs); // only ever shortens
      return { ...state, deadline, startedAt: deadline - LIMIT_MS };
    }
    case "ANSWER":
      if (state.status !== "playing") return state; // already locked: the first terminal event won
      return e.now < state.deadline ? lock(state, e.choice, e.now - state.startedAt) : lock(state, null, LIMIT_MS);
    case "RELOCK":
      return state.status === "playing" ? lock(state, e.choice, e.elapsedMs) : state; // an answer locked before a refresh stays locked
    case "TICK":
      return state.status === "playing" && e.now >= state.deadline ? lock(state, null, LIMIT_MS) : state;
    case "RESOLVED":
      return state.status === "submitting" ? { status: "finished", result: e.result, isFresh: true } : state;
    case "SYNC_FAILED":
      return state.status === "submitting" ? { ...state, syncError: e.message } : state;
    case "FAILED":
      return state.status === "submitting" || state.status === "finished" ? state : { status: "error", message: e.message };
    case "RETRY":
      return state.status === "error" ? { status: "loading" } : state;
    default: {
      const unreachable: never = e;
      return unreachable;
    }
  }
}
