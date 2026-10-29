import { cycle, parallel } from "@/engine/author";
import type { Puzzle } from "@/engine/puzzle";

// The unscheduled example and practice puzzle. It is public, so it lives outside server-only content.
export const TUTORIAL: Puzzle = {
  id: "tutorial",
  family: "single-cycle",
  difficulty: "easy",
  shown: 4,
  rule: parallel({ base: { color: "yellow", fill: "solid" }, vary: { shape: cycle("circle", "square", "diamond") } }),
  sequence: [
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "square", color: "pink", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  answerIndex: 1,
  explanation: "Shapes repeat circle, square, diamond. Next is one yellow solid square.",
  review: null,
};
