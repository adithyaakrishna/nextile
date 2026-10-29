import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0052",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "circle", fill: "outline" }, vary: { count: step("count", 3, -1), color: cycle("blue", "pink") } }),
  sequence: [
    { shape: "circle", color: "blue", fill: "outline", rotation: 0, count: 3, cell: 4 },
    { shape: "circle", color: "pink", fill: "outline", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "pink", fill: "outline", rotation: 0, count: 3, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "blue", fill: "outline", rotation: 0, count: 2, cell: 4 }, // answer
    { shape: "circle", color: "pink", fill: "outline", rotation: 0, count: 3, cell: 4 }, // phase-slip (color, count)
    { shape: "circle", color: "pink", fill: "outline", rotation: 0, count: 2, cell: 4 }, // phase-slip (color)
    { shape: "circle", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 }, // over-step (count)
  ],
  answerIndex: 0,
  explanation: "Colors alternate blue and pink; the count goes down by one and wraps back to three. Next is two blue outlined circles.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
