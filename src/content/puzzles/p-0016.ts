import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0016",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { color: "blue" }, vary: { shape: cycle("circle", "diamond"), fill: cycle("solid", "outline", "striped") } }),
  sequence: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "circle", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
    { shape: "diamond", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape, fill)
  ],
  answerIndex: 0,
  explanation: "Shapes alternate circle and diamond, while fills repeat solid, outline, striped. Next is one blue outlined circle.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
