import { definePuzzle, interleave, step } from "../define";

export default definePuzzle({
  id: "p-0026",
  family: "interleave",
  difficulty: "hard",
  shown: 5,
  rule: interleave(
    { base: { shape: "triangle", color: "pink", fill: "solid" }, vary: { rotation: step("rotation", 0) } },
    { base: { shape: "circle", color: "pink", fill: "solid" }, vary: { count: step("count", 1) } },
  ),
  sequence: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 90, count: 1, cell: 4 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 180, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // over-step (count)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 }, // repeat-last (count)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 }, // answer
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 }, // decoy (shape)
  ],
  answerIndex: 2,
  explanation: "Two sequences alternate: triangles turn a quarter-turn clockwise, and circles count up by one. Next is three pink solid circles.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
