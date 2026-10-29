import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0059",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "square", color: "yellow" }, vary: { count: step("count", 1), fill: cycle("solid", "striped") } }),
  sequence: [
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "yellow", fill: "striped", rotation: 0, count: 2, cell: 4 },
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "square", color: "yellow", fill: "striped", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "yellow", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill, count)
    { shape: "square", color: "yellow", fill: "striped", rotation: 0, count: 2, cell: 4 }, // phase-slip (fill)
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 }, // over-step (count)
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Fills alternate solid and striped; the count goes up by one and wraps back to one. Next is two yellow solid squares.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
