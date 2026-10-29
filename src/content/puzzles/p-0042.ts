import { definePuzzle, bounce, parallel } from "../define";

export default definePuzzle({
  id: "p-0042",
  family: "bounce",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "triangle", color: "yellow", fill: "outline" }, vary: { rotation: bounce(0, 90, 180) } }),
  sequence: [
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 90, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 180, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 90, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 90, count: 1, cell: 4 }, // early-wrap (rotation)
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 270, count: 1, cell: 4 }, // tweak (rotation)
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 180, count: 1, cell: 4 }, // early-wrap (rotation)
  ],
  answerIndex: 2,
  explanation: "The triangle turns from pointing up to pointing down and back, a quarter-turn at a time. Next is one yellow outlined triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
