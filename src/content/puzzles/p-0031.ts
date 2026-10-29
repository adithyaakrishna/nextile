import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0031",
  family: "single-step",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "triangle", color: "pink", fill: "striped" }, vary: { rotation: step("rotation", 90) } }),
  sequence: [
    { shape: "triangle", color: "pink", fill: "striped", rotation: 90, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "striped", rotation: 180, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "striped", rotation: 270, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "pink", fill: "striped", rotation: 90, count: 1, cell: 4 }, // answer
    { shape: "triangle", color: "pink", fill: "striped", rotation: 270, count: 1, cell: 4 }, // phase-slip (rotation)
    { shape: "triangle", color: "pink", fill: "striped", rotation: 180, count: 1, cell: 4 }, // over-step (rotation)
    { shape: "triangle", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 4 }, // repeat-last (rotation)
  ],
  answerIndex: 0,
  explanation: "The triangle turns a quarter-turn clockwise each time. Next is one pink striped triangle pointing right.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
