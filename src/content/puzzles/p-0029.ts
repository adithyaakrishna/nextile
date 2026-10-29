import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0029",
  family: "three-way",
  difficulty: "hard",
  shown: 5,
  rule: parallel({ base: { fill: "solid" }, vary: { color: cycle("pink", "blue"), shape: cycle("circle", "square", "triangle"), count: step("count", 1) } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 3, cell: 4 }, // phase-slip (shape)
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 3, cell: 4 }, // answer
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 }, // phase-slip (color)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 }, // phase-slip (shape, color)
  ],
  answerIndex: 1,
  explanation: "Colors alternate pink and blue, while shape and count move together in threes. Next is three blue solid triangles pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
