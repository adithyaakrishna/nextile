import { isDayKey } from "@/time/day";
import { pastPuzzle } from "@/server/attempts";
import { serverNow } from "@/server/clock";
import { fail, json } from "@/server/http";
import { readPlayerId } from "@/server/player";

// A past puzzle with its solution; while a day can still be played, only for a player who has finished it; never the future
export async function GET(_request: Request, { params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  if (!isDayKey(day)) return fail("Use a date like 2026-11-16.", 400);
  const outcome = pastPuzzle(day, await readPlayerId(), serverNow());
  switch (outcome.status) {
    case "ok":
      return json(outcome.puzzle);
    case "locked":
      return fail("This puzzle can still be played. Finish it to see its answer.", 403);
    case "not-found":
      return fail("No puzzle for that day.", 404);
    default: {
      const unreachable: never = outcome;
      return unreachable;
    }
  }
}
