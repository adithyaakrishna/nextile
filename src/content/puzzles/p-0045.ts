import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0045",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "square", fill: "solid" }, vary: { cell: step("ring", 0), color: cycle("pink", "blue", "yellow") } }),
  sequence: [
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 1 },
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 2 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 5 },
  ],
  choices: [
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 8 }, // phase-slip (color)
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 8 }, // answer
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 }, // phase-slip (cell)
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 5 }, // phase-slip (color, cell)
  ],
  answerIndex: 1,
  explanation: "Colors repeat pink, blue, yellow; the dot moves clockwise around the edge. Next is one blue solid square in the bottom-right corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
