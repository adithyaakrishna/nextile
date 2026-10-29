import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0009",
  family: "walk",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "circle", color: "blue", fill: "solid" }, vary: { cell: step("rowMajor", 0) } }),
  sequence: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 1 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 3 },
  ],
  choices: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 }, // phase-slip (cell)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 5 }, // over-step (cell)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 3 }, // repeat-last (cell)
  ],
  answerIndex: 1,
  explanation: "The dot moves one cell at a time in reading order. Next is one blue solid circle in the center.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
