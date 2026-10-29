// Usage: pnpm puzzle:build p-0031 [more ids] | --all  [--force] [--explain] [--answer=1..4]
import { readFileSync, writeFileSync } from "node:fs";
import { tileKey } from "../src/engine/canonical";
import { computeDifficulty } from "../src/engine/difficulty";
import { pickDistractors, proposeDistractors } from "../src/engine/distractors";
import { explain } from "../src/engine/explain";
import { answerOf, sequenceOf } from "../src/engine/generate";
import { usesGrid, validate } from "../src/engine/validate";
import { asciiPreview, glyph } from "./lib/ascii";
import { writeIndex } from "./lib/index-file";
import { idsFromArgs, loadPuzzle, puzzleFile } from "./lib/puzzles";
import { formatString, formatTiles, replaceProperty } from "./lib/source";

const args = process.argv.slice(2);
const isForced = args.includes("--force");
const shouldExplain = args.includes("--explain");
const answerFlag = args.find((a) => a.startsWith("--answer="));
const requestedAnswer = answerFlag ? Number(answerFlag.split("=")[1]) - 1 : null;

function defaultAnswerIndex(id: string): number {
  return Number(id.replace(/\D/g, "")) % 4;
}

let failures = 0;
for (const id of idsFromArgs(args)) {
  const p = await loadPuzzle(id);
  const grid = usesGrid(p.rule);
  let source = readFileSync(puzzleFile(id), "utf8");

  source = replaceProperty(source, "sequence", formatTiles(sequenceOf(p.rule, p.shown)));
  const difficulty = computeDifficulty(p.rule, p.shown);
  source = replaceProperty(source, "difficulty", formatString(difficulty.tier));

  const candidates = proposeDistractors(p.rule, p.shown);
  const answer = answerOf(p.rule, p.shown);
  const hasChoices = p.choices.length === 4 && p.choices.some((c) => tileKey(c) === tileKey(answer));
  if (!hasChoices || isForced || requestedAnswer !== null) {
    const picks = pickDistractors(candidates);
    const answerIndex = requestedAnswer ?? (hasChoices ? p.answerIndex : defaultAnswerIndex(id));
    const choices = picks.map((c) => c.tile);
    const notes = picks.map((c) => `${c.recipe} (${c.props.join(", ")})`);
    choices.splice(answerIndex, 0, answer);
    notes.splice(answerIndex, 0, "answer");
    source = replaceProperty(source, "choices", formatTiles(choices, notes));
    source = replaceProperty(source, "answerIndex", String(answerIndex));
  }
  if (!p.explanation || shouldExplain) {
    source = replaceProperty(source, "explanation", formatString(explain(p.rule, p.shown, { grid })));
  }
  writeFileSync(puzzleFile(id), source);

  const built = await loadPuzzle(id);
  const result = validate(built);
  console.log(`\n${asciiPreview(built)}`);
  console.log(`  difficulty: ${difficulty.points} points → ${difficulty.tier}`);
  console.log(`  distractor candidates: ${candidates.slice(0, 8).map((c) => `${glyph(c.tile, grid)} [${c.recipe}]`).join(", ")}`);
  if (result.errors.length === 0) console.log("  ✓ passes every per-puzzle check");
  else {
    failures++;
    for (const e of result.errors) console.log(`  ✗ ${e.check}: ${e.message}`);
  }
}

writeIndex();
if (failures > 0) {
  console.log(`\n${failures} puzzle(s) need attention.`);
  process.exitCode = 1;
}
