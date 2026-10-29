import { definePuzzle, cycle, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0024",
  family: "two-clocks",
  difficulty: "medium",
  shown: 4,
  rule: parallel({ base: { shape: "circle", color: "pink" }, vary: { cell: step("corners", 0), fill: cycle("solid", "outline", "striped") } }),
  sequence: [
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 0 },
    { shape: "circle", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 2 },
    { shape: "circle", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 8 },
    { shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 6 },
  ],
  choices: [
    { shape: "circle", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 0 }, // phase-slip (fill)
    { shape: "circle", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 0 }, // answer
    { shape: "circle", color: "pink", fill: "outline", rotation: 0, count: 1, cell: 8 }, // phase-slip (cell)
    { shape: "circle", color: "pink", fill: "striped", rotation: 0, count: 1, cell: 6 }, // phase-slip (fill, cell)
  ],
  answerIndex: 1,
  explanation: "Fills repeat solid, outline, striped; the dot moves clockwise around the corners. Next is one pink outlined circle in the top-left corner.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
