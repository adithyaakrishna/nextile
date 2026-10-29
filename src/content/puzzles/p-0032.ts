import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0032",
  family: "single-cycle",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "circle", fill: "solid", count: 3 }, vary: { color: cycle("yellow", "blue") } }),
  sequence: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 3, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 }, // answer
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 3, cell: 4 }, // phase-slip (color)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 }, // tweak (color)
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 }, // decoy (shape)
  ],
  answerIndex: 0,
  explanation: "Colors alternate yellow and blue. Next is three yellow solid circles.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
