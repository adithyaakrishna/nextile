import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0050",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "diamond", fill: "solid" }, vary: { color: cycle("blue", "yellow"), cell: step("corners", 0, -1) } }),
  sequence: [
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 6 },
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 8 },
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 2 },
  ],
  choices: [
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 8 }, // phase-slip (cell)
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 0 }, // phase-slip (color)
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 }, // answer
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 2 }, // phase-slip (color, cell)
  ],
  answerIndex: 2,
  explanation: "Colors alternate blue and yellow; the dot moves counter-clockwise around the corners. Next is one blue solid diamond in the top-left corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
