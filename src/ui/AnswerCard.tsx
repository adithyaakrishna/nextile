import { describe } from "@/engine/describe";
import type { Tile } from "@/engine/domain";
import type { ChoiceIndex } from "@/game/machine";
import { CheckIcon, CrossIcon } from "./Icons";
import { TileArt } from "./TileArt";

export type CardPhase = "idle" | "locked" | "done";
export type CardEnd = "right" | "wrong" | "answer" | null;

interface AnswerCardProps {
  tile: Tile;
  grid: boolean;
  index: ChoiceIndex;
  phase: CardPhase;
  isPick: boolean;
  end: CardEnd;
  onSelect?: (index: ChoiceIndex) => void;
}

export function endFor(index: number, choice: number | null, answerIndex: number): CardEnd {
  if (index === answerIndex) return index === choice ? "right" : "answer";
  return index === choice ? "wrong" : null;
}

function stateSuffix(phase: CardPhase, isPick: boolean, end: CardEnd): string {
  if (end === "right") return " Your pick. Correct.";
  if (end === "wrong") return " Your pick. Incorrect.";
  if (end === "answer") return " Correct answer.";
  return phase === "locked" && isPick ? " Your pick." : "";
}

function Tab({ phase, isPick, end }: { phase: CardPhase; isPick: boolean; end: CardEnd }) {
  if (end === "right") {
    return (
      <span className="om-card-tab">
        <CheckIcon /> Right
      </span>
    );
  }
  if (end === "wrong") {
    return (
      <span className="om-card-tab">
        <CrossIcon /> Your pick
      </span>
    );
  }
  if (end === "answer") return <span className="om-card-tab">Answer</span>;
  if (phase === "locked" && isPick) return <span className="om-card-tab">Your pick</span>;
  return null;
}

function dataState(phase: CardPhase, isPick: boolean): "locked" | "done" | undefined {
  if (phase === "idle") return undefined;
  return phase === "locked" && isPick ? "locked" : "done";
}

// A shadow means you can press it: idle cards cast one, locked and finished cards don't
export function AnswerCard({ tile, grid, index, phase, isPick, end, onSelect }: AnswerCardProps) {
  const name = `Option ${index + 1}: ${describe(tile, { grid })}.${stateSuffix(phase, isPick, end)}`;
  const isLocked = phase !== "idle";
  return (
    <button
      type="button"
      className="om-card press"
      data-state={dataState(phase, isPick)}
      data-end={end ?? undefined}
      data-tab={end !== null || (phase === "locked" && isPick) || undefined}
      aria-label={name}
      aria-keyshortcuts={String(index + 1)}
      aria-disabled={isLocked || undefined}
      onClick={() => {
        if (!isLocked) onSelect?.(index);
      }}
    >
      {!end && !(phase === "locked" && isPick) && (
        <span className="om-card-key" aria-hidden="true">
          {index + 1}
        </span>
      )}
      <span className="om-card-art">
        <TileArt tile={tile} grid={grid} />
      </span>
      <Tab phase={phase} isPick={isPick} end={end} />
    </button>
  );
}

// The same card as a read-only figure, for the rule panel and the archive
export function AnswerFigure({ tile, grid, index, end }: { tile: Tile; grid: boolean; index: number; end: CardEnd }) {
  return (
    <li className="om-card press" data-state="done" data-end={end ?? undefined} data-tab={end !== null || undefined}>
      {!end && (
        <span className="om-card-key" aria-hidden="true">
          {index + 1}
        </span>
      )}
      <span className="om-card-art">
        <TileArt tile={tile} grid={grid} />
      </span>
      <Tab phase="done" isPick={end === "right" || end === "wrong"} end={end} />
      <span className="sr-only">
        Option {index + 1}: {describe(tile, { grid })}.{stateSuffix("done", false, end)}
      </span>
    </li>
  );
}
