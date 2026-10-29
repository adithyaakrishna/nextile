import { definePuzzle, parallel, step, stutter } from "../define";

export default definePuzzle({
  id: "p-0027",
  family: "odometer",
  difficulty: "hard",
  shown: 5,
  rule: parallel({ base: { color: "yellow", fill: "solid" }, vary: { count: step("count", 1), shape: stutter(3, "circle", "square", "triangle") } }),
  sequence: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 }, // phase-slip (shape)
    { shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 }, // phase-slip (shape, count)
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // over-step (count)
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "The count runs one to three; each time it starts over, the shape moves on. Next is three yellow solid squares.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
