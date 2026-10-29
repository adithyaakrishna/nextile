import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0057",
  family: "single-cycle",
  difficulty: "medium",
  shown: 5,
  rule: parallel({ base: { color: "pink", fill: "solid" }, vary: { shape: cycle("circle", "square", "triangle", "diamond") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // tweak (shape)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
  ],
  answerIndex: 1,
  explanation: "Shapes repeat circle, square, triangle, diamond. Next is one pink solid square.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
