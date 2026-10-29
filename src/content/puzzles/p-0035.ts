import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0035",
  family: "synced",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "diamond" }, vary: { color: cycle("blue", "pink"), fill: cycle("solid", "striped") } }),
  sequence: [
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "diamond", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
    { shape: "diamond", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (color, fill)
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "A solid blue diamond and a striped pink diamond alternate. Next is one blue solid diamond.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
