import { definePuzzle, bounce, parallel } from "../define";

export default definePuzzle({
  id: "p-0053",
  family: "bounce",
  difficulty: "medium",
  shown: 5,
  rule: parallel({ base: { shape: "diamond", color: "yellow", fill: "solid" }, vary: { count: bounce(3, 2, 1) } }),
  sequence: [
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 },
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 },
  ],
  choices: [
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 3, cell: 4 }, // early-wrap (count)
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 }, // answer
    { shape: "circle", color: "yellow", fill: "solid", rotation: 0, count: 2, cell: 4 }, // decoy (shape)
    { shape: "diamond", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4 }, // early-wrap (count)
  ],
  answerIndex: 1,
  explanation: "The count drops to one and climbs back up. Next is two yellow solid diamonds.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
