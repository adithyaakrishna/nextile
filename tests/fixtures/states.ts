import type { PlayingState, PublicPuzzle, Result, TodayInfo } from "../../src/game/machine";

const tile = { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 } as const;

export const TODAY: TodayInfo = { day: "2026-11-18", number: 3, nextAt: Date.parse("2026-11-19T00:00:00Z"), difficulty: "medium" };

export const PUZZLE: PublicPuzzle = {
  sequence: [tile, tile, tile, tile],
  choices: [tile, { ...tile, color: "blue" }, { ...tile, color: "yellow" }, { ...tile, shape: "square" }],
  shown: 4,
  difficulty: "medium",
  grid: false,
};

// startedAt: 0, deadline: 60_000
export function playingState(overrides: Partial<PlayingState> = {}): PlayingState {
  return { status: "playing", today: TODAY, attemptId: "a1", puzzle: PUZZLE, startedAt: 0, deadline: 60_000, isResumed: false, ...overrides };
}

export function validResult(overrides: Partial<Result> = {}): Result {
  return {
    day: "2026-11-16",
    number: 1,
    puzzleId: "p-0001",
    outcome: "correct",
    choice: 1,
    answerIndex: 1,
    elapsedMs: 18_400,
    score: 91,
    sequence: [...PUZZLE.sequence],
    choices: [...PUZZLE.choices],
    explanation: "Shapes repeat. Next is one pink solid circle.",
    shareId: "k3J9xQ2mPa",
    grid: false,
    difficulty: "easy",
    ...overrides,
  };
}
