import { definePuzzle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0015",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "triangle", color: "pink", fill: "outline" }, vary: { count: step("count", 1), rotation: step("rotation", 0) } }),
  sequence: [
    { shape: "triangle", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "outline", rotation: 90, count: 2, cell: 4 },
    { shape: "triangle", color: "pink", fill: "outline", rotation: 180, count: 3, cell: 4 },
    { shape: "triangle", color: "pink", fill: "outline", rotation: 270, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "pink", fill: "outline", rotation: 180, count: 2, cell: 4 }, // phase-slip (rotation)
    { shape: "triangle", color: "pink", fill: "outline", rotation: 0, count: 2, cell: 4 }, // answer
    { shape: "triangle", color: "pink", fill: "outline", rotation: 90, count: 1, cell: 4 }, // phase-slip (rotation, count)
    { shape: "triangle", color: "pink", fill: "outline", rotation: 90, count: 2, cell: 4 }, // over-step (rotation)
  ],
  answerIndex: 1,
  explanation: "The triangle turns a quarter-turn clockwise each time; the count goes up by one and wraps back to one. Next is two pink outlined triangles pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
