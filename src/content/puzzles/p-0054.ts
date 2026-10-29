import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0054",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "triangle", color: "blue" }, vary: { rotation: step("rotation", 0, -1), fill: cycle("solid", "outline", "striped") } }),
  sequence: [
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "blue", fill: "outline", rotation: 270, count: 1, cell: 4 },
    { shape: "triangle", color: "blue", fill: "striped", rotation: 180, count: 1, cell: 4 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 90, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "blue", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
    { shape: "triangle", color: "blue", fill: "outline", rotation: 180, count: 1, cell: 4 }, // phase-slip (rotation)
    { shape: "triangle", color: "blue", fill: "outline", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "triangle", color: "blue", fill: "striped", rotation: 90, count: 1, cell: 4 }, // phase-slip (fill, rotation)
  ],
  answerIndex: 2,
  explanation: "Fills repeat solid, outline, striped; the triangle turns a quarter-turn counter-clockwise each time. Next is one blue outlined triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
