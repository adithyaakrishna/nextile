import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0012",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { fill: "solid" }, vary: { color: cycle("pink", "blue"), shape: cycle("circle", "square", "triangle") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape, color)
  ],
  answerIndex: 2,
  explanation: "Shapes repeat circle, square, triangle; colors alternate pink and blue. Next is one pink solid square.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
