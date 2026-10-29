import type { Tile } from "@/engine/domain";
import { AnswerFigure, endFor } from "./AnswerCard";
import { SequenceRail } from "./SequenceRail";

interface RulePanelProps {
  sequence: readonly Tile[];
  choices: readonly Tile[];
  answerIndex: number;
  choice: number | null;
  explanation: string;
  grid: boolean;
  isFresh?: boolean;
  heading?: string;
}

// Contains the answer, so it always sits below the spoiler-free result card
export function RulePanel({ sequence, choices, answerIndex, choice, explanation, grid, isFresh = false, heading = "The rule" }: RulePanelProps) {
  return (
    <section aria-labelledby="rule-heading" className="panel flex flex-col gap-5 p-5 sm:p-6">
      <h2 id="rule-heading" className="type-heading text-[20px] sm:text-[25px]">
        {heading}
      </h2>
      <SequenceRail sequence={sequence} grid={grid} answer={choices[answerIndex]} isAnswerFresh={isFresh} isCompact label="Completed sequence" />
      <ul aria-label="Options" className="answers answers-compact">
        {choices.map((tile, i) => (
          <AnswerFigure key={i} tile={tile} grid={grid} index={i} end={endFor(i, choice, answerIndex)} />
        ))}
      </ul>
      <p className="type-body text-[16px] sm:text-[17px]">{explanation}</p>
    </section>
  );
}
