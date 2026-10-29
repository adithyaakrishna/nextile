import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0004",
  family: "single-cycle",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "square", fill: "solid", count: 2 }, vary: { color: cycle("pink", "blue", "yellow") } }),
  sequence: [
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 }, // answer
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 }, // phase-slip (color)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 }, // decoy (shape)
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 }, // phase-slip (color)
  ],
  answerIndex: 0,
  explanation: "Colors repeat pink, blue, yellow. Next is two blue solid squares.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
