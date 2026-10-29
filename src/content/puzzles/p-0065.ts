import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0065",
  family: "three-way",
  difficulty: "hard",
  shown: 5,
  rule: parallel({ base: { fill: "solid" }, vary: { cell: step("corners", 0), color: cycle("pink", "blue"), shape: cycle("circle", "square", "triangle") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 8 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 6 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 },
  ],
  choices: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 }, // phase-slip (shape)
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 2 }, // answer
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 2 }, // phase-slip (color)
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 6 }, // phase-slip (cell)
  ],
  answerIndex: 1,
  explanation: "Shapes repeat circle, square, triangle; colors alternate pink and blue; the dot walks clockwise around the corners. Next is a blue triangle in the top-right corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
