import { definePuzzle, parallel, step, stutter } from "../define";

export default definePuzzle({
  id: "p-0030",
  family: "odometer",
  difficulty: "hard",
  shown: 5,
  rule: parallel({ base: { shape: "circle", fill: "solid" }, vary: { cell: step("corners", 0), color: stutter(4, "pink", "blue", "yellow") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 2 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 8 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 6 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 0 },
  ],
  choices: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 2 }, // early-wrap (color)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 6 }, // phase-slip (cell)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 }, // answer
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 8 }, // over-step (cell)
  ],
  answerIndex: 2,
  explanation: "The dot walks clockwise around the corners, and the color changes after each full lap. Next is one blue solid circle in the top-right corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
