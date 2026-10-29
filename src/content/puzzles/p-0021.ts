import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0021",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "triangle", color: "yellow" }, vary: { fill: cycle("solid", "outline", "striped"), rotation: step("rotation", 0) } }),
  sequence: [
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 90, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "striped", rotation: 180, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 270, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "yellow", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 180, count: 1, cell: 4 }, // phase-slip (rotation)
    { shape: "triangle", color: "yellow", fill: "striped", rotation: 270, count: 1, cell: 4 }, // phase-slip (fill, rotation)
  ],
  answerIndex: 1,
  explanation: "Fills repeat solid, outline, striped; the triangle turns a quarter-turn clockwise each time. Next is one yellow outlined triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
