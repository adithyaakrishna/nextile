import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0001",
  family: "single-step",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "triangle", color: "yellow", fill: "solid" }, vary: { rotation: step("rotation", 0) } }),
  sequence: [
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 90, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 180, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 270, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 180, count: 1, cell: 4 }, // phase-slip (rotation)
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 90, count: 1, cell: 4 }, // over-step (rotation)
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 270, count: 1, cell: 4 }, // repeat-last (rotation)
  ],
  answerIndex: 1,
  explanation: "The triangle turns a quarter-turn clockwise each time. Next is one yellow solid triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
