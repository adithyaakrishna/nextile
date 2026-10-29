import { definePuzzle, bounce, parallel } from "../define";

export default definePuzzle({
  id: "p-0011",
  family: "bounce",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "square", color: "blue", fill: "solid" }, vary: { count: bounce(1, 2, 3) } }),
  sequence: [
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 }, // early-wrap (count)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // decoy (shape)
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 3, cell: 4 }, // early-wrap (count)
  ],
  answerIndex: 0,
  explanation: "The count climbs to three and comes back down. Next is one blue solid square.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
