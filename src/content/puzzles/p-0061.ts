import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0061",
  family: "two-clocks",
  difficulty: "medium",
  shown: 5,
  rule: parallel({ base: { color: "blue", fill: "solid" }, vary: { cell: step("corners", 0), shape: cycle("circle", "square") } }),
  sequence: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 8 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 6 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 },
  ],
  choices: [
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 6 }, // phase-slip (cell)
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 }, // answer
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 }, // phase-slip (shape)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 }, // phase-slip (shape, cell)
  ],
  answerIndex: 1,
  explanation: "Shapes alternate circle and square; the dot moves clockwise around the corners. Next is one blue solid square in the top-right corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
