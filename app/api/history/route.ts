import type { HistoryResponse } from "@/game/api-types";
import { historyFor } from "@/server/attempts";
import { serverNow } from "@/server/clock";
import { json } from "@/server/http";
import { readPlayerId } from "@/server/player";

// Lets a browser that cleared its storage but kept the cookie get its history back
export async function GET() {
  const playerId = await readPlayerId();
  return json<HistoryResponse>({ results: playerId ? historyFor(playerId, serverNow()) : [] });
}
