import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0038",
  family: "synced",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { fill: "solid" }, vary: { shape: cycle("circle", "square", "triangle"), color: cycle("yellow", "pink", "blue") } }),
  sequence: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape, color)
  ],
  answerIndex: 2,
  explanation: "Shapes and colors move together: yellow circle, pink square, blue triangle, then repeat. Next is one pink solid square.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
