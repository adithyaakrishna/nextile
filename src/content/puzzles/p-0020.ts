import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0020",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "square", fill: "solid" }, vary: { count: step("count", 1), color: cycle("pink", "blue") } }),
  sequence: [
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 }, // answer
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (color, count)
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 }, // phase-slip (color)
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 }, // over-step (count)
  ],
  answerIndex: 0,
  explanation: "Colors alternate pink and blue; the count goes up by one and wraps back to one. Next is two pink solid squares.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
