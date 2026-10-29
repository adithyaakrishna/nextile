import { definePuzzle, cycle, parallel, stutter } from "../define";

export default definePuzzle({
  id: "p-0064",
  family: "odometer",
  difficulty: "hard",
  shown: 5,
  rule: parallel({ base: { color: "pink" }, vary: { fill: cycle("solid", "outline"), shape: stutter(2, "circle", "square", "triangle") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "square", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (fill)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape, fill)
  ],
  answerIndex: 0,
  explanation: "Fills alternate solid and outline; each time they start over, the shape moves on. Next is one pink outlined triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
