import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0039",
  family: "single-cycle",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "circle", color: "blue", count: 2 }, vary: { fill: cycle("outline", "solid") } }),
  sequence: [
    { shape: "circle", color: "blue", fill: "outline", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "blue", fill: "outline", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 }, // phase-slip (fill)
    { shape: "circle", color: "blue", fill: "striped", rotation: 0, count: 2, cell: 4 }, // tweak (fill)
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 2, cell: 4 }, // decoy (shape)
    { shape: "circle", color: "blue", fill: "outline", rotation: 0, count: 2, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Fills alternate outline and solid. Next is two blue outlined circles.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
