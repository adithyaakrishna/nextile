import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0055",
  family: "three-way",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ vary: { shape: cycle("circle", "square", "triangle"), fill: cycle("solid", "outline", "striped"), color: cycle("pink", "blue") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "square", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "square", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
  ],
  answerIndex: 1,
  explanation: "Colors alternate pink and blue, while shape and fill advance together in threes. Next is one pink outlined square.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
