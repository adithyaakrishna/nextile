import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0060",
  family: "synced",
  difficulty: "medium",
  shown: 5,
  rule: parallel({ base: { shape: "diamond" }, vary: { count: step("count", 1), color: cycle("blue", "pink", "yellow"), fill: cycle("solid", "outline", "striped") } }),
  sequence: [
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "pink", fill: "outline", rotation: 0, count: 2, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "striped", rotation: 0, count: 3, cell: 4 },
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "pink", fill: "outline", rotation: 0, count: 2, cell: 4 },
  ],
  choices: [
    { shape: "diamond", color: "yellow", fill: "striped", rotation: 0, count: 3, cell: 4 }, // answer
    { shape: "diamond", color: "blue", fill: "striped", rotation: 0, count: 3, cell: 4 }, // phase-slip (color)
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 }, // phase-slip (fill)
    { shape: "diamond", color: "blue", fill: "outline", rotation: 0, count: 3, cell: 4 }, // phase-slip (color, fill)
  ],
  answerIndex: 0,
  explanation: "Count, color and fill all advance together in threes. Next is three yellow striped diamonds, stripes running up to the right.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
