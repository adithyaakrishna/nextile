import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0037",
  family: "walk",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "circle", color: "yellow", fill: "solid" }, vary: { cell: step("ring", 0) } }),
  sequence: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 1 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 2 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 5 },
  ],
  choices: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 2 }, // phase-slip (cell)
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 8 }, // answer
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 7 }, // over-step (cell)
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 5 }, // repeat-last (cell)
  ],
  answerIndex: 1,
  explanation: "The dot moves clockwise around the edge. Next is one yellow solid circle in the bottom-right corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
