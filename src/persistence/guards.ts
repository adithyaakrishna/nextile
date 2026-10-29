import { isDifficulty } from "@/engine/difficulty";
import { CELLS, COLORS, COUNTS, FILLS, ROTATIONS, SHAPES, type Tile } from "@/engine/domain";
import type { ChoiceIndex, Choices, Outcome, Result } from "@/game/machine";
import { isDayKey } from "@/time/day";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T>(values: readonly T[], value: unknown): value is T {
  return (values as readonly unknown[]).includes(value);
}

export function isTile(value: unknown): value is Tile {
  return (
    isRecord(value) &&
    isOneOf(SHAPES, value.shape) &&
    isOneOf(COLORS, value.color) &&
    isOneOf(FILLS, value.fill) &&
    isOneOf(ROTATIONS, value.rotation) &&
    isOneOf(COUNTS, value.count) &&
    isOneOf(CELLS, value.cell)
  );
}

export function isChoiceIndex(value: unknown): value is ChoiceIndex {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

export function isOutcome(value: unknown): value is Outcome {
  return value === "correct" || value === "incorrect" || value === "timeout";
}

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isChoices(value: unknown): value is Choices {
  return Array.isArray(value) && value.length === 4 && value.every(isTile);
}

export function isResult(value: unknown): value is Result {
  if (!isRecord(value)) return false;
  return (
    isDayKey(value.day) &&
    isNonNegativeInt(value.number) &&
    typeof value.puzzleId === "string" &&
    isOutcome(value.outcome) &&
    (value.choice === null || isChoiceIndex(value.choice)) &&
    isChoiceIndex(value.answerIndex) &&
    (value.elapsedMs === null || isNonNegativeInt(value.elapsedMs)) &&
    isNonNegativeInt(value.score) &&
    value.score <= 100 &&
    Array.isArray(value.sequence) &&
    value.sequence.length >= 4 &&
    value.sequence.length <= 5 &&
    value.sequence.every(isTile) &&
    isChoices(value.choices) &&
    typeof value.explanation === "string" &&
    typeof value.shareId === "string" &&
    typeof value.grid === "boolean" &&
    isDifficulty(value.difficulty)
  );
}

// Unknown fields are rejected, so request bodies can't smuggle anything in
export function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((k) => keys.includes(k));
}
