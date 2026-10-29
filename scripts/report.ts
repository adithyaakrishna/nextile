// Usage: pnpm report [--days=14] [--to=YYYY-MM-DD]
// Prints the brief's launch metrics straight from SQLite, so there are numbers on day one without a dashboard.
import { existsSync } from "node:fs";
import Database from "better-sqlite3";
import { LIMIT_MS } from "../src/scoring/score";
import { GRACE_MS } from "../src/server/adjudicate";
import { databasePath } from "../src/server/db";
import { addDays, dayStartMs, isDayKey, toDayKey } from "../src/time/day";

const flag = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const days = Number(flag("days") ?? 14);
const toFlag = flag("to");
if (toFlag !== undefined && !isDayKey(toFlag)) throw new Error(`--to must be YYYY-MM-DD, got ${toFlag}`);

const path = databasePath();
if (!existsSync(path)) {
  console.log(`No database at ${path} yet. Set DATABASE_PATH or play a round first.`);
  process.exit(0);
}
const db = new Database(path, { readonly: true });

function playersWith(name: string, day: string): Set<string> {
  const rows = db
    .prepare("SELECT DISTINCT player_id AS p FROM events WHERE name = ? AND json_extract(props, '$.day') = ? AND player_id IS NOT NULL")
    .all(name, day) as { p: string }[];
  return new Set(rows.map((r) => r.p));
}

function overlap(a: Set<string>, b: Set<string>): number {
  return [...a].filter((p) => b.has(p)).length;
}

function pct(num: number, den: number): string {
  return den === 0 ? "—" : `${((100 * num) / den).toFixed(1)}%`;
}

// Completion uses server records: an attempt finished inside the minute (plus grace) was played out, not abandoned
function completion(day: string): { finished: number; started: number } {
  const row = db
    .prepare("SELECT COUNT(*) AS started, SUM(finished_at IS NOT NULL AND finished_at - started_at <= ?) AS finished FROM attempts WHERE day = ?")
    .get(LIMIT_MS + GRACE_MS, day) as { started: number; finished: number | null };
  return { started: row.started, finished: row.finished ?? 0 };
}

const today = toFlag ?? toDayKey(Date.now());
const columns = ["day", "visitors", "→start", "completion", "share", "next-day", "TTC visits"];
console.log(`Nextile metrics, ${days} days to ${today} (${path})\n`);
console.log(columns.map((c, i) => (i === 0 ? c.padEnd(10) : c.padStart(11))).join(" "));
for (let i = days - 1; i >= 0; i--) {
  const day = addDays(today, -i);
  const landed = playersWith("landing_viewed", day);
  const viewed = playersWith("result_viewed", day);
  const from = dayStartMs(day);
  const clickers = new Set(
    (
      db
        .prepare("SELECT DISTINCT player_id AS p FROM events WHERE name = 'attribution_clicked' AND at >= ? AND at < ? AND player_id IS NOT NULL")
        .all(from, from + 86_400_000) as { p: string }[]
    ).map((r) => r.p),
  );
  const { finished, started } = completion(day);
  const cells = [
    String(landed.size),
    pct(overlap(landed, playersWith("start_clicked", day)), landed.size),
    pct(finished, started),
    pct(overlap(viewed, playersWith("share_clicked", day)), viewed.size),
    pct(overlap(landed, playersWith("landing_viewed", addDays(day, 1))), landed.size),
    pct(overlap(viewed, clickers), viewed.size),
  ];
  console.log([day.padEnd(10), ...cells.map((c) => c.padStart(11))].join(" "));
}
console.log(
  "\nShare and Teeny Tiny visits are shares of players who saw a result. Developer signups are measured on Teeny Tiny's side via utm_source=nextile.",
);
