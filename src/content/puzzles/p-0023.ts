import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0023",
  family: "two-clocks",
  difficulty: "medium",
  shown: 5,
  rule: parallel({ base: { fill: "solid" }, vary: { color: cycle("pink", "blue", "yellow"), shape: cycle("circle", "diamond") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape, color)
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Shapes alternate circle and diamond, while colors repeat pink, blue, yellow. Next is one yellow solid diamond.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
