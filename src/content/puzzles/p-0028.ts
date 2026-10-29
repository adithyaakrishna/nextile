import { definePuzzle, cycle, parallel, stutter } from "../define";

export default definePuzzle({
  id: "p-0028",
  family: "odometer",
  difficulty: "hard",
  shown: 5,
  rule: parallel({ base: { shape: "diamond" }, vary: { color: cycle("blue", "pink", "yellow"), fill: stutter(3, "solid", "outline", "striped") } }),
  sequence: [
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "diamond", color: "yellow", fill: "outline", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
    { shape: "diamond", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "diamond", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (color, fill)
  ],
  answerIndex: 0,
  explanation: "Colors cycle blue, pink, yellow; each time they start over, the fill moves on. Next is one yellow outlined diamond.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
