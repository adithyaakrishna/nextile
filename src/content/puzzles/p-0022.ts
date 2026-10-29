import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0022",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { color: "blue", fill: "solid" }, vary: { cell: step("corners", 0), shape: cycle("circle", "square", "triangle") } }),
  sequence: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 8 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 6 },
  ],
  choices: [
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 }, // phase-slip (shape)
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 8 }, // phase-slip (cell)
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 }, // answer
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 6 }, // phase-slip (shape, cell)
  ],
  answerIndex: 2,
  explanation: "Shapes repeat circle, square, triangle; the dot moves clockwise around the corners. Next is one blue solid square in the top-left corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
