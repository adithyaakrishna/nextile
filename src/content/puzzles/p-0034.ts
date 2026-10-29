import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0034",
  family: "single-cycle",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { color: "yellow", fill: "outline", count: 2 }, vary: { shape: cycle("square", "diamond", "triangle") } }),
  sequence: [
    { shape: "square", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 },
    { shape: "square", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 }, // phase-slip (shape)
    { shape: "circle", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 }, // tweak (shape)
    { shape: "square", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 }, // phase-slip (shape)
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Shapes repeat square, diamond, triangle. Next is two yellow outlined diamonds.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
