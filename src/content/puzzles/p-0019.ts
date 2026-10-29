import { definePuzzle, bounce, parallel } from "../define";

export default definePuzzle({
  id: "p-0019",
  family: "bounce",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "circle", color: "yellow", fill: "solid" }, vary: { cell: bounce(3, 4, 5) } }),
  sequence: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 3 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 5 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // early-wrap (cell)
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 0 }, // tweak (cell)
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 5 }, // early-wrap (cell)
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 3 }, // answer
  ],
  answerIndex: 3,
  explanation: "The dot slides across the middle row and back. Next is one yellow solid circle at the middle left.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
