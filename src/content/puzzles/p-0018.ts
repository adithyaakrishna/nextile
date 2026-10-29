import { definePuzzle, parallel, stutter } from "../define";

export default definePuzzle({
  id: "p-0018",
  family: "stutter",
  difficulty: "medium",
  shown: 5,
  rule: parallel({ base: { color: "pink", fill: "solid" }, vary: { shape: stutter(2, "circle", "square", "triangle") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // phase-slip (shape)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // early-wrap (shape)
    { shape: "triangle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // answer
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // tweak (shape)
  ],
  answerIndex: 2,
  explanation: "Each shape appears twice before the next one. Next is one pink solid triangle pointing up.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
