import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0014",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "circle", fill: "solid" }, vary: { cell: step("corners", 0), color: cycle("pink", "blue") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 8 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 6 },
  ],
  choices: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 8 }, // phase-slip (cell)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 }, // phase-slip (color)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 }, // answer
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 6 }, // phase-slip (color, cell)
  ],
  answerIndex: 2,
  explanation: "Colors alternate pink and blue; the dot moves clockwise around the corners. Next is one pink solid circle in the top-left corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
