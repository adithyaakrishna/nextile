import { definePuzzle, parallel, stutter } from "../define";

export default definePuzzle({
  id: "p-0049",
  family: "stutter",
  difficulty: "medium",
  shown: 5,
  rule: parallel({ base: { shape: "square", color: "pink", fill: "solid" }, vary: { count: stutter(2, 1, 2, 3) } }),
  sequence: [
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 },
  ],
  choices: [
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 2, cell: 4 }, // phase-slip (count)
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 }, // early-wrap (count)
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 }, // decoy (shape)
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 3, cell: 4 }, // answer
  ],
  answerIndex: 3,
  explanation: "Each count appears twice, then the count goes up by one. Next is three pink solid squares.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
