import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0006",
  family: "walk",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "circle", color: "pink", fill: "solid" }, vary: { cell: step("corners", 0) } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 2 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 8 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 6 },
  ],
  choices: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 8 }, // phase-slip (cell)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 2 }, // over-step (cell)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 6 }, // repeat-last (cell)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 }, // answer
  ],
  answerIndex: 3,
  explanation: "The dot moves clockwise around the corners. Next is one pink solid circle in the top-left corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
