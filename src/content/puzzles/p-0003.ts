import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0003",
  family: "single-cycle",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { color: "pink", fill: "solid" }, vary: { shape: cycle("circle", "triangle", "square") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // tweak (shape)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Shapes repeat circle, triangle, square. Next is one pink solid triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
