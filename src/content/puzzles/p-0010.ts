import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0010",
  family: "synced",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "diamond", color: "yellow" }, vary: { count: step("count", 1), fill: cycle("solid", "outline", "striped") } }),
  sequence: [
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "striped", rotation: 0, count: 3, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "diamond", color: "yellow", fill: "striped", rotation: 0, count: 2, cell: 4 }, // phase-slip (fill)
    { shape: "diamond", color: "yellow", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill, count)
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 2, cell: 4 }, // answer
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 3, cell: 4 }, // over-step (count)
  ],
  answerIndex: 2,
  explanation: "Count and fill advance together: one solid, two outlined, three striped. Next is two yellow outlined diamonds.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
