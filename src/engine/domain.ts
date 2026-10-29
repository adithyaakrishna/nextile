export const SHAPES = ["circle", "square", "triangle", "diamond"] as const;
export const COLORS = ["blue", "pink", "yellow"] as const;
export const FILLS = ["solid", "outline", "striped"] as const;
export const ROTATIONS = [0, 90, 180, 270] as const;
export const COUNTS = [1, 2, 3] as const;
// 3×3 grid in reading order; only meaningful when count === 1
export const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

export type Shape = (typeof SHAPES)[number];
export type Color = (typeof COLORS)[number];
export type Fill = (typeof FILLS)[number];
export type Rotation = (typeof ROTATIONS)[number];
export type Count = (typeof COUNTS)[number];
export type Cell = (typeof CELLS)[number];

export interface Tile {
  shape: Shape;
  color: Color;
  fill: Fill;
  rotation: Rotation;
  count: Count;
  cell: Cell;
}
export type Prop = keyof Tile;
export type PropValue = Tile[Prop];

export const PROPS = ["shape", "color", "fill", "rotation", "count", "cell"] as const satisfies readonly Prop[];

export const DOMAINS = {
  shape: SHAPES,
  color: COLORS,
  fill: FILLS,
  rotation: ROTATIONS,
  count: COUNTS,
  cell: CELLS,
} as const satisfies { [K in Prop]: readonly Tile[K][] };

// Ordered tracks that "step" and "bounce" rules move along
export const TRACKS = {
  rotation: [0, 90, 180, 270],
  count: [1, 2, 3],
  corners: [0, 2, 8, 6], // top-left → top-right → bottom-right → bottom-left (clockwise)
  ring: [0, 1, 2, 5, 8, 7, 6, 3], // every edge cell, clockwise from top-left
  rowMajor: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  middleRow: [3, 4, 5],
  middleColumn: [1, 4, 7],
} as const;
export type TrackName = keyof typeof TRACKS;

// Cyclic tracks have no ends, so a bounce segment may wrap around them
export const CYCLIC_TRACKS: Record<TrackName, boolean> = {
  rotation: true,
  count: false,
  corners: true,
  ring: true,
  rowMajor: false,
  middleRow: false,
  middleColumn: false,
};

export const TRACKS_BY_PROP: { [K in Prop]: readonly TrackName[] } = {
  shape: [],
  color: [],
  fill: [],
  rotation: ["rotation"],
  count: ["count"],
  cell: ["corners", "ring", "rowMajor", "middleRow", "middleColumn"],
};

export const DEFAULT_TILE: Tile = {
  shape: "circle",
  color: "blue",
  fill: "solid",
  rotation: 0,
  count: 1,
  cell: 4,
};

export function isTrackName(value: string): value is TrackName {
  return Object.hasOwn(TRACKS, value);
}
