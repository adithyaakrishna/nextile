import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0044",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { color: "blue", fill: "striped" }, vary: { count: step("count", 1), shape: cycle("circle", "diamond") } }),
  sequence: [
    { shape: "circle", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "blue", fill: "striped", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "blue", fill: "striped", rotation: 0, count: 3, cell: 4 },
    { shape: "diamond", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "blue", fill: "striped", rotation: 0, count: 2, cell: 4 }, // answer
    { shape: "diamond", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape, count)
    { shape: "diamond", color: "blue", fill: "striped", rotation: 0, count: 2, cell: 4 }, // phase-slip (shape)
    { shape: "circle", color: "blue", fill: "striped", rotation: 0, count: 3, cell: 4 }, // over-step (count)
  ],
  answerIndex: 0,
  explanation: "Shapes alternate circle and diamond; the count goes up by one and wraps back to one. Next is two blue striped circles, stripes running up to the right.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
