import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Puzzle } from "../../src/engine/puzzle";

export const PUZZLE_DIR = join(process.cwd(), "src/content/puzzles");

export function puzzleFile(id: string): string {
  return join(PUZZLE_DIR, `${id}.ts`);
}

export function listPuzzleIds(): string[] {
  return readdirSync(PUZZLE_DIR)
    .filter((f) => /^p-\d{4}\.ts$/.test(f))
    .map((f) => f.replace(/\.ts$/, ""))
    .sort();
}

let loads = 0;

// Dynamic import is required here: the file to load is chosen by the author at run time
export async function loadPuzzle(id: string): Promise<Puzzle> {
  loads++;
  const mod = (await import(`${pathToFileURL(puzzleFile(id)).href}?load=${loads}`)) as { default: Puzzle };
  return mod.default;
}

export function idsFromArgs(args: readonly string[]): string[] {
  const ids = args.filter((a) => !a.startsWith("--"));
  return args.includes("--all") || ids.length === 0 ? listPuzzleIds() : ids;
}
