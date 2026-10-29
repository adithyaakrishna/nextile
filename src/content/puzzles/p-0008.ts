import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0008",
  family: "single-step",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "circle", color: "yellow", fill: "striped" }, vary: { count: step("count", 3, -1) } }),
  sequence: [
    { shape: "circle", color: "yellow", fill: "striped", rotation: 0, count: 3, cell: 4 },
    { shape: "circle", color: "yellow", fill: "striped", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "yellow", fill: "striped", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "yellow", fill: "striped", rotation: 0, count: 3, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "yellow", fill: "striped", rotation: 0, count: 2, cell: 4 }, // answer
    { shape: "circle", color: "yellow", fill: "striped", rotation: 0, count: 1, cell: 4 }, // over-step (count)
    { shape: "circle", color: "yellow", fill: "striped", rotation: 0, count: 3, cell: 4 }, // repeat-last (count)
    { shape: "square", color: "yellow", fill: "striped", rotation: 0, count: 2, cell: 4 }, // decoy (shape)
  ],
  answerIndex: 0,
  explanation: "The count goes down by one and wraps back to three. Next is two yellow striped circles, stripes running up to the right.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
