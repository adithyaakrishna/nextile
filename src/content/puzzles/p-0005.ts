import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0005",
  family: "single-cycle",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "diamond", color: "blue" }, vary: { fill: cycle("solid", "outline", "striped") } }),
  sequence: [
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "diamond", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
    { shape: "diamond", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "circle", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 }, // decoy (shape)
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
  ],
  answerIndex: 1,
  explanation: "Fills repeat solid, outline, striped. Next is one blue outlined diamond.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
