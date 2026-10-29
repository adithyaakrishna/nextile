import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0047",
  family: "three-way",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { fill: "solid" }, vary: { count: step("count", 1), color: cycle("yellow", "pink", "blue"), shape: cycle("circle", "square") } }),
  sequence: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 }, // phase-slip (color)
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 }, // phase-slip (shape)
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 }, // phase-slip (shape, color)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Shapes alternate circle and square, while count and color advance together in threes. Next is two pink solid circles.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
