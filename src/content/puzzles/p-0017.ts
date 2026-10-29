import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0017",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "triangle", fill: "solid" }, vary: { rotation: step("rotation", 0, -1), color: cycle("pink", "blue") } }),
  sequence: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 270, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 180, count: 1, cell: 4 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 90, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 180, count: 1, cell: 4 }, // phase-slip (rotation)
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "triangle", color: "blue", fill: "solid", rotation: 90, count: 1, cell: 4 }, // phase-slip (color, rotation)
  ],
  answerIndex: 1,
  explanation: "Colors alternate pink and blue; the triangle turns a quarter-turn counter-clockwise each time. Next is one pink solid triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
