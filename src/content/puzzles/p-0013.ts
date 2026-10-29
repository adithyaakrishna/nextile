import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0013",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "triangle", fill: "solid" }, vary: { rotation: step("rotation", 0), color: cycle("pink", "blue", "yellow") } }),
  sequence: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 90, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 180, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 270, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "triangle", color: "blue", fill: "solid", rotation: 180, count: 1, cell: 4 }, // phase-slip (rotation)
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 270, count: 1, cell: 4 }, // phase-slip (color, rotation)
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Colors repeat pink, blue, yellow; the triangle turns a quarter-turn clockwise each time. Next is one blue solid triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
