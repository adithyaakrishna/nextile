import { parseClientEvent, type ClientEvent } from "@/analytics/events";
import { isRecord } from "@/persistence/guards";
import { serverNow } from "@/server/clock";
import { recordEvents } from "@/server/events";
import { crossSiteRefusal, fail, isCrossSite, readJson } from "@/server/http";
import { readPlayerId } from "@/server/player";
import { clientIp, isAllowed } from "@/server/rate-limit";

const MAX_EVENTS = 50;

// First-party analytics sink: each event is validated against the typed union before it is stored
export async function POST(request: Request) {
  if (isCrossSite(request)) return crossSiteRefusal();
  if (!isAllowed("events", clientIp(request))) return new Response(null, { status: 204 });
  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return fail("Send { events: [...] } as JSON.", 400);
  }
  if (!isRecord(body) || !Array.isArray(body.events)) return fail("Send { events: [...] } as JSON.", 400);
  const events = body.events.slice(0, MAX_EVENTS).map(parseClientEvent).filter((e): e is ClientEvent => e !== null);
  if (events.length > 0) recordEvents(events, await readPlayerId(), serverNow());
  return new Response(null, { status: 204 });
}
