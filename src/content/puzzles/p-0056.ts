import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0056",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "circle", fill: "solid" }, vary: { cell: step("middleRow", 3), color: cycle("pink", "yellow") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 3 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 5 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 3 },
  ],
  choices: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 3 }, // phase-slip (color, cell)
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 5 }, // over-step (cell)
  ],
  answerIndex: 0,
  explanation: "Colors alternate pink and yellow; the dot moves one cell at a time along the middle row. Next is one pink solid circle in the center.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
