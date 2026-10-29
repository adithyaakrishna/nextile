import type { Tile } from "../../src/engine/domain";

// Finds a top-level property of the object passed to definePuzzle({ … }) and returns its value span
function findValueSpan(source: string, name: string): { start: number; end: number } | null {
  const match = new RegExp(`^  ${name}: `, "m").exec(source);
  if (!match) return null;
  const start = match.index + match[0].length;
  let depth = 0;
  let quote: string | null = null;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "/" && source[i + 1] === "/") i = source.indexOf("\n", i) - 1;
    else if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) {
      if (depth === 0) return { start, end: i };
      depth--;
    } else if (ch === "," && depth === 0) return { start, end: i };
  }
  return null;
}

export function readProperty(source: string, name: string): string {
  const span = findValueSpan(source, name);
  if (!span) throw new Error(`Property "${name}" not found`);
  return source.slice(span.start, span.end);
}

export function replaceProperty(source: string, name: string, value: string): string {
  const span = findValueSpan(source, name);
  if (!span) throw new Error(`Property "${name}" not found`);
  return source.slice(0, span.start) + value + source.slice(span.end);
}

export function formatTile(t: Tile): string {
  return `{ shape: "${t.shape}", color: "${t.color}", fill: "${t.fill}", rotation: ${t.rotation}, count: ${t.count}, cell: ${t.cell} }`;
}

export function formatTiles(tiles: readonly Tile[], notes: readonly string[] = []): string {
  if (tiles.length === 0) return "[]";
  const lines = tiles.map((t, i) => `    ${formatTile(t)},${notes[i] ? ` // ${notes[i]}` : ""}`);
  return `[\n${lines.join("\n")}\n  ]`;
}

export function formatString(s: string): string {
  return JSON.stringify(s);
}
