import { startAttempt } from "@/server/attempts";
import { serverNow } from "@/server/clock";
import { crossSiteRefusal, fail, isCrossSite, json } from "@/server/http";
import { ensurePlayerId } from "@/server/player";
import { clientIp, isAllowed } from "@/server/rate-limit";

// Starts today's attempt, or resumes the open one; never returns the answer
export async function POST(request: Request) {
  if (isCrossSite(request)) return crossSiteRefusal();
  if (!isAllowed("start", clientIp(request))) return fail("Too many attempts to start. Wait a minute, then try again.", 429);
  const playerId = await ensurePlayerId();
  return json(startAttempt(playerId, serverNow()));
}
