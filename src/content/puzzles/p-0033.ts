import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0033",
  family: "walk",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "square", color: "blue", fill: "outline" }, vary: { cell: step("corners", 0, -1) } }),
  sequence: [
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 0 },
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 6 },
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 8 },
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 2 },
  ],
  choices: [
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 0 }, // answer
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 8 }, // phase-slip (cell)
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 6 }, // over-step (cell)
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 2 }, // repeat-last (cell)
  ],
  answerIndex: 0,
  explanation: "The dot moves counter-clockwise around the corners. Next is one blue outlined square in the top-left corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
