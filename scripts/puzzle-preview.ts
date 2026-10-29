// Usage: pnpm puzzle:preview [ids…]
// Prints an ASCII preview and writes tmp/contact-sheet.svg (answers marked) for visual review.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Tile } from "../src/engine/domain";
import { usesGrid } from "../src/engine/validate";
import { TileArt } from "../src/ui/TileArt";
import { asciiPreview } from "./lib/ascii";
import { idsFromArgs, loadPuzzle } from "./lib/puzzles";

const TILE = 72;
const GAP = 10;
const ROW = TILE + 44;
const LEFT = 120;

let renders = 0;

function tileSvg(tile: Tile, grid: boolean, x: number, y: number, frame: string): string {
  renders++;
  // Each tile is its own React root, so give each one distinct ids for its clip paths
  const art = renderToStaticMarkup(createElement(TileArt, { tile, grid }), { identifierPrefix: `t${renders}-` }).replace(
    "<svg ",
    `<svg x="${x}" y="${y}" width="${TILE}" height="${TILE}" `,
  );
  return `<rect x="${x}" y="${y}" width="${TILE}" height="${TILE}" rx="6" fill="#fff" stroke="#000" stroke-width="${frame === "answer" ? 5 : 3}"/>${art}`;
}

const ids = idsFromArgs(process.argv.slice(2));
const rows: string[] = [];
let width = 0;
for (const [r, id] of ids.entries()) {
  const p = await loadPuzzle(id);
  console.log(`${asciiPreview(p)}\n`);
  const grid = usesGrid(p.rule);
  const y = 20 + r * ROW;
  const parts = [`<text x="12" y="${y + 24}" font-size="15" font-weight="700">${p.id}</text>`, `<text x="12" y="${y + 44}" font-size="12">${p.difficulty}</text>`];
  p.sequence.forEach((t, i) => parts.push(tileSvg(t, grid, LEFT + i * (TILE + GAP), y, "tile")));
  const slotX = LEFT + p.shown * (TILE + GAP);
  parts.push(`<rect x="${slotX}" y="${y}" width="${TILE}" height="${TILE}" rx="6" fill="none" stroke="#000" stroke-width="3" stroke-dasharray="8 6"/>`);
  parts.push(`<text x="${slotX + TILE / 2}" y="${y + TILE / 2 + 10}" font-size="28" font-weight="900" text-anchor="middle">?</text>`);
  const choicesX = slotX + TILE + 40;
  p.choices.forEach((c, i) => {
    const x = choicesX + i * (TILE + GAP);
    parts.push(tileSvg(c, grid, x, y, i === p.answerIndex ? "answer" : "tile"));
    parts.push(`<text x="${x + TILE / 2}" y="${y + TILE + 18}" font-size="12" text-anchor="middle">${i + 1}${i === p.answerIndex ? " ✓" : ""}</text>`);
  });
  width = Math.max(width, choicesX + 4 * (TILE + GAP) + 20);
  rows.push(parts.join(""));
}

const height = 40 + ids.length * ROW;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Arial, sans-serif">
<style>.om-assist{display:none}</style>
<rect width="100%" height="100%" fill="#CDDFD2"/>
${rows.join("\n")}
</svg>`;
mkdirSync(join(process.cwd(), "tmp"), { recursive: true });
writeFileSync(join(process.cwd(), "tmp/contact-sheet.svg"), svg);
console.log(`Wrote tmp/contact-sheet.svg with ${ids.length} puzzle(s).`);
