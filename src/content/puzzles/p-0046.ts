import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0046",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "triangle", color: "pink" }, vary: { fill: cycle("solid", "outline"), rotation: step("rotation", 0) } }),
  sequence: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "outline", rotation: 90, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 180, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "outline", rotation: 270, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "pink", fill: "solid", rotation: 180, count: 1, cell: 4 }, // phase-slip (rotation)
    { shape: "triangle", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "triangle", color: "pink", fill: "outline", rotation: 270, count: 1, cell: 4 }, // phase-slip (fill, rotation)
  ],
  answerIndex: 2,
  explanation: "Fills alternate solid and outline; the triangle turns a quarter-turn clockwise each time. Next is one pink solid triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
