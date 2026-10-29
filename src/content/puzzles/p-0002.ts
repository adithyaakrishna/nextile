import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0002",
  family: "single-step",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "square", color: "blue", fill: "outline" }, vary: { count: step("count", 1) } }),
  sequence: [
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 2, cell: 4 },
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 3, cell: 4 },
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 2, cell: 4 }, // answer
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 3, cell: 4 }, // over-step (count)
    { shape: "square", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 }, // repeat-last (count)
    { shape: "circle", color: "blue", fill: "outline", rotation: 0, count: 2, cell: 4 }, // decoy (shape)
  ],
  answerIndex: 0,
  explanation: "The count goes up by one and wraps back to one. Next is two blue outlined squares.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
