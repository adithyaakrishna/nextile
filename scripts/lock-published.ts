// Usage: pnpm lock:published [--today=YYYY-MM-DD]
// Records a hash for every puzzle whose day has arrived, so it can never change afterwards.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PUBLISHED_LOCK, puzzleHash, type Lock } from "../src/content/lock";
import { PUZZLES } from "../src/content/puzzles";
import { SCHEDULE } from "../src/content/schedule";
import { isDayKey, toDayKey } from "../src/time/day";

const todayFlag = process.argv.find((a) => a.startsWith("--today="))?.split("=")[1];
if (todayFlag !== undefined && !isDayKey(todayFlag)) throw new Error(`--today must be YYYY-MM-DD, got ${todayFlag}`);
const today = todayFlag ?? toDayKey(Date.now());

const byId = new Map(PUZZLES.map((p) => [p.id, p]));
const lock: Lock = { ...PUBLISHED_LOCK };
let added = 0;
for (const entry of SCHEDULE) {
  if (entry.day > today) break;
  const p = byId.get(entry.id);
  if (!p) throw new Error(`${entry.day} points to missing puzzle ${entry.id}`);
  const existing = lock[entry.day];
  if (existing) {
    if (existing.id !== entry.id || existing.hash !== puzzleHash(p)) throw new Error(`${entry.day} (${entry.id}) changed after it was published`);
    continue;
  }
  lock[entry.day] = { id: entry.id, hash: puzzleHash(p) };
  added++;
}

const sorted = Object.fromEntries(Object.entries(lock).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(process.cwd(), "src/content/published.lock.json"), `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Locked ${added} newly published day(s); ${Object.keys(sorted).length} in total, up to ${today}.`);
