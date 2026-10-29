import { definePuzzle, bounce, parallel } from "../define";

export default definePuzzle({
  id: "p-0048",
  family: "bounce",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "diamond", color: "pink", fill: "solid" }, vary: { cell: bounce(0, 2, 8) } }),
  sequence: [
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 2 },
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 8 },
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 2 },
  ],
  choices: [
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 2 }, // early-wrap (cell)
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 }, // answer
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 1 }, // tweak (cell)
    { shape: "diamond", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 8 }, // early-wrap (cell)
  ],
  answerIndex: 1,
  explanation: "The dot goes from top-left to top-right to bottom-right, then back the same way. Next is one pink solid diamond in the top-left corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
