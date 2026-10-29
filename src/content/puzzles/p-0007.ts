import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0007",
  family: "synced",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { fill: "solid" }, vary: { color: cycle("pink", "blue"), shape: cycle("circle", "square") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape, color)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "A pink circle and a blue square alternate. Next is one pink solid circle.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
