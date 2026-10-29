import { runwayDays } from "@/content/catalog";
import { serverNow } from "@/server/clock";
import { db } from "@/server/db";
import { json } from "@/server/http";

// Liveness for an external uptime check: 503 if the database is unreachable or the puzzles have run out
export async function GET() {
  const now = serverNow();
  let isDatabaseOk = false;
  try {
    isDatabaseOk = db().prepare("SELECT 1 AS ok").get() !== undefined;
  } catch (error) {
    console.error(JSON.stringify({ level: "error", msg: "health: database check failed", error: String(error) }));
  }
  const runway = runwayDays(now);
  const isOk = isDatabaseOk && runway > 0;
  return json({ ok: isOk, database: isDatabaseOk ? "ok" : "unreachable", runwayDays: runway, serverNow: now }, isOk ? 200 : 503);
}
