import { definePuzzle, cycle, parallel } from "../define";

export default definePuzzle({
  id: "p-0051",
  family: "two-clocks",
  difficulty: "medium",
  shown: 5,
  rule: parallel({ base: { color: "yellow" }, vary: { fill: cycle("solid", "outline", "striped"), shape: cycle("square", "triangle") } }),
  sequence: [
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "yellow", fill: "striped", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "yellow", fill: "outline", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
    { shape: "square", color: "yellow", fill: "striped", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "square", color: "yellow", fill: "outline", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape, fill)
    { shape: "triangle", color: "yellow", fill: "striped", rotation: 0, count: 1, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Shapes alternate square and triangle, while fills repeat solid, outline, striped. Next is one yellow striped triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
