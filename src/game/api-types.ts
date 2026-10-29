import type { Difficulty } from "@/engine/difficulty";
import type { Tile } from "@/engine/domain";
import type { ChoiceIndex, Choices, PublicPuzzle, Result, TodayInfo, UnavailableReason } from "./machine";

export type AttemptSummary = { state: "none" } | { state: "open"; remainingMs: number } | { state: "finished"; result: Result };

interface Timing {
  serverNow: number;
  nextAt: number;
}

// Never contains tiles: the puzzle is only sent once the player presses Start
export type TodayResponse =
  | ({ status: "not-launched"; launchDay: string } & Timing)
  | ({ status: "no-puzzle"; day: string; number: number } & Timing)
  | ({ status: "available"; day: string; number: number; difficulty: Difficulty; attempt: AttemptSummary } & Timing);

export type StartResponse =
  | { state: "playing"; attemptId: string; remainingMs: number; puzzle: PublicPuzzle; today: TodayInfo }
  | { state: "finished"; result: Result }
  | { state: "unavailable"; reason: UnavailableReason; launchDay: string | null };

export interface FinishBody {
  choice: ChoiceIndex | null;
  clientElapsedMs: number;
}

export interface FinishResponse {
  result: Result;
}

export interface HistoryResponse {
  results: Result[];
}

export interface PastPuzzleResponse {
  day: string;
  number: number;
  sequence: Tile[];
  choices: Choices;
  answerIndex: ChoiceIndex;
  explanation: string;
  grid: boolean;
  difficulty: Difficulty;
  result: Result | null;
}

export interface ApiError {
  error: string;
}
