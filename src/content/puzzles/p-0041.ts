import { definePuzzle, bounce, parallel } from "../define";

export default definePuzzle({
  id: "p-0041",
  family: "bounce",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { color: "blue", fill: "solid" }, vary: { shape: bounce("circle", "square", "triangle") } }),
  sequence: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // early-wrap (shape)
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // tweak (shape)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // early-wrap (shape)
  ],
  answerIndex: 2,
  explanation: "Shapes go circle, square, triangle and back. Next is one blue solid circle.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
