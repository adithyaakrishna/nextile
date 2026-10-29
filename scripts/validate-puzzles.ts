// Runs every publication check on the real collection and schedule; fails the build on any error
import { validateContent } from "../src/content/checks";
import { PUBLISHED_LOCK } from "../src/content/lock";
import { PUZZLES } from "../src/content/puzzles";
import { SCHEDULE } from "../src/content/schedule";
import type { Issue } from "../src/engine/validate";
import { toDayKey } from "../src/time/day";

const nowMs = Date.now();
const { errors, warnings } = validateContent({ puzzles: PUZZLES, schedule: SCHEDULE, lock: PUBLISHED_LOCK, nowMs });

function line(issue: Issue): string {
  return `  ${issue.puzzleId ? `${issue.puzzleId} ` : ""}[${issue.check}] ${issue.message}`;
}

const agentReviewed = warnings.filter((w) => w.check === "review");
const otherWarnings = warnings.filter((w) => w.check !== "review");

console.log(`Checked ${PUZZLES.length} puzzles and ${SCHEDULE.length} scheduled days (${SCHEDULE[0]?.day ?? "none"} → ${SCHEDULE.at(-1)?.day ?? "none"}) on ${toDayKey(nowMs)}.`);
if (agentReviewed.length > 0) {
  console.log(`\n${agentReviewed.length} scheduled puzzles are reviewed by an AI agent only and still need a person to solve them cold.`);
}
if (otherWarnings.length > 0) console.log(`\nWarnings:\n${otherWarnings.map(line).join("\n")}`);
if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):\n${errors.map(line).join("\n")}`);
  process.exit(1);
}
console.log("\n✓ All publication checks passed.");
