import { canonical } from "./canonical";
import type { Cell, Count, Fill, Rotation, Shape, Tile } from "./domain";

const COUNT_WORDS: Record<Count, string> = { 1: "one", 2: "two", 3: "three" };

const FILL_WORDS: Record<Fill, string> = { solid: "solid", outline: "outlined", striped: "striped" };

const SHAPE_PLURALS: Record<Shape, string> = {
  circle: "circles",
  square: "squares",
  triangle: "triangles",
  diamond: "diamonds",
};

const POINTING: Record<Rotation, string> = {
  0: "pointing up",
  90: "pointing right",
  180: "pointing down",
  270: "pointing left",
};

// At 0° the stripes run from bottom-left to top-right; each quarter-turn flips them
const STRIPES: Record<0 | 90, string> = {
  0: "stripes running up to the right",
  90: "stripes running down to the right",
};

const CELL_PLACES: Record<Cell, string> = {
  0: "in the top-left corner",
  1: "at the top middle",
  2: "in the top-right corner",
  3: "at the middle left",
  4: "in the center",
  5: "at the middle right",
  6: "in the bottom-left corner",
  7: "at the bottom middle",
  8: "in the bottom-right corner",
};

export const CELL_NAMES: Record<Cell, string> = {
  0: "top-left",
  1: "top middle",
  2: "top-right",
  3: "middle left",
  4: "center",
  5: "middle right",
  6: "bottom-left",
  7: "bottom middle",
  8: "bottom-right",
};

export interface DescribeOptions {
  grid?: boolean; // the puzzle draws the 3×3 position guide
}

// Plain English, so the puzzle can be solved from words alone
export function describe(tile: Tile, options: DescribeOptions = {}): string {
  const t = canonical(tile);
  const noun = t.count === 1 ? t.shape : SHAPE_PLURALS[t.shape];
  const pointing = t.shape === "triangle" ? ` ${POINTING[t.rotation]}` : "";
  const place = t.count === 1 && (options.grid || t.cell !== 4) ? ` ${CELL_PLACES[t.cell]}` : "";
  const stripes = t.shape !== "triangle" && t.fill === "striped" ? `, ${STRIPES[t.rotation === 90 ? 90 : 0]}` : "";
  return `${COUNT_WORDS[t.count]} ${t.color} ${FILL_WORDS[t.fill]} ${noun}${pointing}${place}${stripes}`;
}
