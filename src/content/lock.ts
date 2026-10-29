import { createHash } from "node:crypto";
import { canonical } from "@/engine/canonical";
import type { Tile } from "@/engine/domain";
import type { Puzzle } from "@/engine/puzzle";
import lockData from "./published.lock.json";

export interface LockEntry {
  id: string;
  hash: string;
}

// Keyed by publication day; a locked day's puzzle may never change
export type Lock = Record<string, LockEntry>;

export const PUBLISHED_LOCK: Lock = lockData as Lock;

function tileJson(tile: Tile): Tile {
  const t = canonical(tile);
  return { shape: t.shape, color: t.color, fill: t.fill, rotation: t.rotation, count: t.count, cell: t.cell };
}

export function puzzleHash(p: Pick<Puzzle, "sequence" | "choices" | "answerIndex">): string {
  const json = JSON.stringify({ sequence: p.sequence.map(tileJson), choices: p.choices.map(tileJson), answerIndex: p.answerIndex });
  return createHash("sha256").update(json).digest("hex");
}
