import type { Fill, Rotation, Shape, Tile } from "./domain";

// How many of the four rotations look different for this shape and fill
export function distinctRotations(shape: Shape, fill: Fill): 1 | 2 | 4 {
  if (shape === "triangle") return 4; // equilateral, point up: no 90° symmetry
  return fill === "striped" ? 2 : 1; // stripes have direction; 180° looks the same as 0°
}

export function canonical(t: Tile): Tile {
  const n = distinctRotations(t.shape, t.fill);
  const rotation = (((t.rotation / 90) % n) * 90) as Rotation;
  const cell = t.count === 1 ? t.cell : 4; // position only exists for single symbols
  return { ...t, rotation, cell };
}

export function isCanonical(t: Tile): boolean {
  return tileKey(t) === rawKey(t);
}

function rawKey(t: Tile): string {
  return `${t.shape}|${t.color}|${t.fill}|${t.rotation}|${t.count}|${t.cell}`;
}

export function tileKey(t: Tile): string {
  return rawKey(canonical(t));
}

export function looksSame(a: Tile, b: Tile): boolean {
  return tileKey(a) === tileKey(b);
}
