import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0036",
  family: "single-step",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { shape: "triangle", color: "pink", fill: "solid" }, vary: { count: step("count", 2) } }),
  sequence: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 }, // answer
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // over-step (count)
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 }, // repeat-last (count)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 }, // decoy (shape)
  ],
  answerIndex: 0,
  explanation: "The count goes up by one and wraps back to one. Next is three pink solid triangles pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
