import { definePuzzle, interleave, step } from "../define";

export default definePuzzle({
  id: "p-0063",
  family: "interleave",
  difficulty: "hard",
  shown: 5,
  rule: interleave(
    { base: { shape: "circle", color: "blue", fill: "solid" }, vary: { count: step("count", 1) } },
    { base: { shape: "triangle", color: "yellow", fill: "solid" }, vary: { rotation: step("rotation", 0) } },
  ),
  sequence: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 90, count: 1, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 3, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (rotation)
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 270, count: 1, cell: 4 }, // over-step (rotation)
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 90, count: 1, cell: 4 }, // repeat-last (rotation)
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 180, count: 1, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Two sequences alternate: blue circles count up by one, and yellow triangles turn a quarter-turn clockwise. Next is one yellow solid triangle pointing down.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
