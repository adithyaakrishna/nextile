import { definePuzzle, cycle, parallel, stutter } from "../define";

export default definePuzzle({
  id: "p-0062",
  family: "stutter",
  difficulty: "hard",
  shown: 5,
  rule: parallel({ base: { fill: "solid" }, vary: { shape: stutter(2, "circle", "diamond"), color: cycle("pink", "blue", "yellow") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "diamond", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape, color)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (color)
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // early-wrap (shape)
  ],
  answerIndex: 2,
  explanation: "Each shape appears twice before the next one, while colors repeat pink, blue, yellow. Next is one yellow solid circle.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
