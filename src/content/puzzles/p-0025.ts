import { definePuzzle, bounce, parallel, step } from "../define";

export default definePuzzle({
  id: "p-0025",
  family: "bounce",
  difficulty: "hard",
  shown: 5,
  rule: parallel({ base: { shape: "triangle", color: "blue", fill: "solid" }, vary: { count: bounce(1, 2, 3), rotation: step("rotation", 0) } }),
  sequence: [
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 90, count: 2, cell: 4 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 180, count: 3, cell: 4 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 270, count: 2, cell: 4 },
    { shape: "triangle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4 },
  ],
  choices: [
    { shape: "triangle", color: "blue", fill: "solid", rotation: 180, count: 1, cell: 4 }, // phase-slip (rotation, count)
    { shape: "triangle", color: "blue", fill: "solid", rotation: 90, count: 2, cell: 4 }, // answer
    { shape: "triangle", color: "blue", fill: "solid", rotation: 270, count: 2, cell: 4 }, // phase-slip (rotation)
    { shape: "triangle", color: "blue", fill: "solid", rotation: 180, count: 2, cell: 4 }, // over-step (rotation)
  ],
  answerIndex: 1,
  explanation: "The triangles turn a quarter-turn clockwise each time, while the count climbs to three and comes back down. Next is two blue solid triangles pointing right.",
  review: { by: "ai-agent", on: "2026-10-29" },
});
