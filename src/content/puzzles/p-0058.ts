import { definePuzzle, bounce, parallel } from "../define";

export default definePuzzle({
  id: "p-0058",
  family: "bounce",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "square", color: "blue" }, vary: { fill: bounce("solid", "outline", "striped") } }),
  sequence: [
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 }, // early-wrap (fill)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // decoy (shape)
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "square", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 }, // early-wrap (fill)
  ],
  answerIndex: 2,
  explanation: "Fills go solid, outline, striped and back. Next is one blue solid square.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
