import { canonical } from "../../src/engine/canonical";
import type { Cell, Color, Fill, Shape, Tile } from "../../src/engine/domain";
import type { Puzzle } from "../../src/engine/puzzle";
import { usesGrid } from "../../src/engine/validate";

const SHAPE_GLYPHS: Record<Shape, string> = { circle: "●", square: "■", triangle: "▲", diamond: "◆" };
const COLOR_LETTERS: Record<Color, string> = { blue: "B", pink: "P", yellow: "Y" };
const FILL_LETTERS: Record<Fill, string> = { solid: "s", outline: "o", striped: "x" };
const CELL_CODES: Record<Cell, string> = { 0: "TL", 1: "TM", 2: "TR", 3: "ML", 4: "MC", 5: "MR", 6: "BL", 7: "BM", 8: "BR" };

// Notation from the build plan: ▲Y·s·×1·90° plus a cell code for position puzzles
export function glyph(tile: Tile, grid: boolean): string {
  const t = canonical(tile);
  const parts = [`${SHAPE_GLYPHS[t.shape]}${COLOR_LETTERS[t.color]}`, FILL_LETTERS[t.fill], `×${t.count}`];
  if (t.shape === "triangle" || t.fill === "striped") parts.push(`${t.rotation}°`);
  if (grid) parts.push(CELL_CODES[t.cell]);
  return parts.join("·");
}

export function asciiPreview(p: Puzzle): string {
  const grid = usesGrid(p.rule);
  const sequence = p.sequence.map((t) => glyph(t, grid)).join("  ");
  const choices = p.choices
    .map((c, i) => `${i + 1}) ${glyph(c, grid)}${i === p.answerIndex ? " ✓" : ""}`)
    .join("   ");
  return [`${p.id}  ${p.family}  ${p.difficulty}  shown ${p.shown}`, `  ${sequence}  ?`, `  ${choices}`, `  ${p.explanation}`].join("\n");
}
