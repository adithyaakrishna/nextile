import { useId, type ReactElement, type SVGProps } from "react";
import { canonical } from "@/engine/canonical";
import type { Fill, Shape, Tile } from "@/engine/domain";
import { INK, PAPER, PIECE_HEX, PIECE_LETTERS } from "./palette";

interface TileArtProps {
  tile: Tile;
  grid?: boolean;
  className?: string;
}

// The art for one tile: inline SVG in a 100-unit box, so it scales crisply with no image assets
export function TileArt({ tile, grid = false, className }: TileArtProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const t = canonical(tile);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      {grid && <GuideGrid />}
      {placementsFor(t, grid).map((place, i) => (
        <SymbolArt key={i} clipId={`${id}c${i}`} tile={t} {...place} />
      ))}
    </svg>
  );
}

interface Placement {
  cx: number;
  cy: number;
  size: number;
}

const COUNT_LAYOUTS: Record<1 | 2 | 3, Placement[]> = {
  1: [{ cx: 50, cy: 50, size: 56 }],
  2: [
    { cx: 30, cy: 30, size: 34 },
    { cx: 70, cy: 70, size: 34 },
  ],
  3: [
    { cx: 22, cy: 22, size: 24 },
    { cx: 50, cy: 50, size: 24 },
    { cx: 78, cy: 78, size: 24 },
  ],
};

const CELL_SIZE = 100 / 3;

function placementsFor(t: Tile, grid: boolean): Placement[] {
  if (t.count !== 1 || !grid) return COUNT_LAYOUTS[t.count];
  const col = t.cell % 3;
  const row = Math.floor(t.cell / 3);
  return [{ cx: CELL_SIZE * (col + 0.5), cy: CELL_SIZE * (row + 0.5), size: 24 }];
}

function GuideGrid() {
  const lines = [CELL_SIZE, CELL_SIZE * 2];
  return (
    <g stroke={INK} strokeOpacity={0.16} strokeWidth={1} strokeDasharray="3 3" vectorEffect="non-scaling-stroke">
      {lines.map((at) => (
        <line key={`v${at}`} x1={at} y1={4} x2={at} y2={96} vectorEffect="non-scaling-stroke" />
      ))}
      {lines.map((at) => (
        <line key={`h${at}`} x1={4} y1={at} x2={96} y2={at} vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  );
}

type ShapeProps = SVGProps<SVGCircleElement & SVGRectElement & SVGPolygonElement>;

function outlineOf(shape: Shape, size: number, props: ShapeProps = {}): ReactElement {
  switch (shape) {
    case "circle":
      return <circle r={size / 2} {...props} />;
    case "square": {
      const h = size * 0.43;
      return <rect x={-h} y={-h} width={h * 2} height={h * 2} {...props} />;
    }
    case "diamond": {
      const r = size * 0.56;
      return <polygon points={`0,${-r} ${r},0 0,${r} ${-r},0`} {...props} />;
    }
    case "triangle": {
      const r = size * 0.6;
      const x = r * Math.cos(Math.PI / 6);
      return <polygon points={`0,${-r} ${x},${r / 2} ${-x},${r / 2}`} {...props} />;
    }
    default: {
      const unreachable: never = shape;
      throw new Error(`Unknown shape ${unreachable}`);
    }
  }
}

function Stripes({ size, color }: { size: number; color: string }) {
  const period = Math.max(size * 0.2, 6.5);
  const reach = size * 0.8;
  const offsets: number[] = [];
  for (let c = -2 * reach; c <= 2 * reach; c += period) offsets.push(c);
  // Lines x + y = c run from bottom-left to top-right before the symbol is rotated
  return (
    <g stroke={color} strokeWidth={period * 0.46}>
      {offsets.map((c) => (
        <line key={c} x1={-reach} y1={c + reach} x2={reach} y2={c - reach} />
      ))}
    </g>
  );
}

function FillLayer({ shape, fill, size, color, clipId }: { shape: Shape; fill: Fill; size: number; color: string; clipId: string }) {
  switch (fill) {
    case "solid":
      return outlineOf(shape, size, { fill: color });
    case "outline":
      return (
        <>
          {outlineOf(shape, size, { fill: PAPER })}
          {outlineOf(shape, size, { fill: "none", stroke: color, strokeWidth: size * 0.32, clipPath: `url(#${clipId})` })}
        </>
      );
    case "striped":
      return (
        <>
          {outlineOf(shape, size, { fill: PAPER })}
          <g clipPath={`url(#${clipId})`}>
            <Stripes size={size} color={color} />
          </g>
        </>
      );
    default: {
      const unreachable: never = fill;
      throw new Error(`Unknown fill ${unreachable}`);
    }
  }
}

function SymbolArt({ tile, cx, cy, size, clipId }: Placement & { tile: Tile; clipId: string }) {
  const color = PIECE_HEX[tile.color];
  const markRadius = Math.max(size * 0.22, 7);
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g transform={`rotate(${tile.rotation})`}>
        <defs>
          <clipPath id={clipId}>{outlineOf(tile.shape, size)}</clipPath>
        </defs>
        <FillLayer shape={tile.shape} fill={tile.fill} size={size} color={color} clipId={clipId} />
        {outlineOf(tile.shape, size, {
          fill: "none",
          stroke: INK,
          strokeWidth: 2.5,
          strokeLinejoin: "round",
          vectorEffect: "non-scaling-stroke",
        })}
      </g>
      <g className="om-assist">
        <circle r={markRadius} fill={PAPER} stroke={INK} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        <text
          y={markRadius * 0.36}
          textAnchor="middle"
          fontSize={markRadius * 1.05}
          fontWeight={800}
          fontFamily="Arial, sans-serif"
          fill={INK}
        >
          {PIECE_LETTERS[tile.color]}
        </text>
      </g>
    </g>
  );
}
