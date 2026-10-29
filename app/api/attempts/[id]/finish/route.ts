import type { FinishResponse } from "@/game/api-types";
import { LIMIT_MS } from "@/scoring/score";
import { hasOnlyKeys, isChoiceIndex, isRecord } from "@/persistence/guards";
import { finishAttempt } from "@/server/attempts";
import { serverNow } from "@/server/clock";
import { crossSiteRefusal, fail, isCrossSite, json, readJson } from "@/server/http";
import { readPlayerId } from "@/server/player";
import { clientIp, isAllowed } from "@/server/rate-limit";

function parseBody(value: unknown): { choice: 0 | 1 | 2 | 3 | null; clientElapsedMs: number } | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["choice", "clientElapsedMs"])) return null;
  const { choice, clientElapsedMs } = value;
  if (choice !== null && !isChoiceIndex(choice)) return null;
  if (typeof clientElapsedMs !== "number" || !Number.isFinite(clientElapsedMs) || clientElapsedMs < 0 || clientElapsedMs > LIMIT_MS * 10) return null;
  return { choice, clientElapsedMs };
}

// Idempotent: retries and resubmission after a refresh always return the stored result
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (isCrossSite(request)) return crossSiteRefusal();
  if (!isAllowed("finish", clientIp(request))) return fail("Too many requests. Wait a minute, then try again.", 429);
  const { id } = await params;
  const playerId = await readPlayerId();
  if (!playerId) return fail("Attempt not found.", 404);

  let body: ReturnType<typeof parseBody>;
  try {
    body = parseBody(await readJson(request));
  } catch {
    body = null;
  }
  if (!body) return fail("Send { choice: 0–3 or null, clientElapsedMs }.", 400);

  const outcome = finishAttempt(playerId, id, body.choice, body.clientElapsedMs, serverNow());
  if (outcome.status === "not-found") return fail("Attempt not found.", 404);
  return json<FinishResponse>({ result: outcome.result });
}
