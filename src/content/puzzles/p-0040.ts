import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0040",
  family: "single-step",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "diamond", color: "yellow", fill: "outline" }, vary: { count: step("count", 2, -1) } }),
  sequence: [
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 3, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 },
  ],
  choices: [
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 3, cell: 4 }, // over-step (count)
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 }, // repeat-last (count)
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "circle", color: "yellow", fill: "outline", rotation: 0, count: 1, cell: 4 }, // decoy (shape)
  ],
  answerIndex: 2,
  explanation: "The count goes down by one and wraps back to three. Next is one yellow outlined diamond.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
