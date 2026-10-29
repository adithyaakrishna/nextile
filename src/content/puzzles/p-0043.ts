import { definePuzzle, parallel, stutter } from "../define";

export default definePuzzle({
  id: "p-0043",
  family: "stutter",
  difficulty: "medium",
  shown: 5,
  rule: parallel({ base: { shape: "circle", fill: "solid", count: 2 }, vary: { color: stutter(2, "blue", "yellow", "pink") } }),
  sequence: [
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 },
  ],
  choices: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 }, // phase-slip (color)
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 2, cell: 4 }, // early-wrap (color)
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 }, // decoy (shape)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Each color appears twice before the next one. Next is two pink solid circles.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
