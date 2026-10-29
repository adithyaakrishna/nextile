import type { CSSProperties } from "react";
import { describe } from "@/engine/describe";
import type { Tile } from "@/engine/domain";
import { TileArt } from "./TileArt";

interface SequenceRailProps {
  sequence: readonly Tile[];
  grid: boolean;
  answer?: Tile | null; // dropped into the "?" slot once the attempt ends
  isDealing?: boolean;
  isAnswerFresh?: boolean;
  isCompact?: boolean;
  label?: string;
}

// A real sequence, so slot numbers are honest and reading order is unambiguous even when it wraps
export function SequenceRail({ sequence, grid, answer = null, isDealing = false, isAnswerFresh = false, isCompact = false, label = "Sequence" }: SequenceRailProps) {
  const slots = sequence.length + 1;
  return (
    <ol
      aria-label={label}
      data-slots={slots}
      className={`rail ${isCompact ? "rail-compact" : ""}`}
      style={{ "--slots": slots } as CSSProperties}
    >
      {sequence.map((tile, i) => (
        <li key={i} className={`flex flex-col items-center gap-1 ${isDealing ? "deal" : ""}`} style={{ "--i": i } as CSSProperties}>
          <span className="om-tile rail-tile">
            <TileArt tile={tile} grid={grid} />
          </span>
          <span className="type-small text-on-mat-soft" aria-hidden="true">
            {i + 1}
          </span>
          <span className="sr-only">
            Tile {i + 1}: {describe(tile, { grid })}
          </span>
        </li>
      ))}
      <li className={`flex flex-col items-center gap-1 ${isDealing ? "deal" : ""}`} style={{ "--i": sequence.length } as CSSProperties}>
        {answer ? (
          <span className={`om-tile rail-tile ${isAnswerFresh ? "drop" : ""}`} style={{ borderWidth: 5 }}>
            <TileArt tile={answer} grid={grid} />
          </span>
        ) : (
          <span className="om-slot rail-tile text-[clamp(22px,4vw,36px)]" aria-hidden="true">
            ?
          </span>
        )}
        <span className="type-small text-on-mat-soft" aria-hidden="true">
          {slots}
        </span>
        <span className="sr-only">
          Tile {slots}: {answer ? `the answer, ${describe(answer, { grid })}` : "unknown"}
        </span>
      </li>
    </ol>
  );
}
