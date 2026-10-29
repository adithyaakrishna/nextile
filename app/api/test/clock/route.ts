import { isRecord } from "@/persistence/guards";
import { serverNow, setServerNow } from "@/server/clock";
import { crossSiteRefusal, fail, isCrossSite, json, readJson } from "@/server/http";
import { isE2E } from "@/server/test-mode";

// Test-only: moves the server clock. Exists only when E2E=1 and the app is served from localhost.
export async function POST(request: Request) {
  if (!isE2E()) return fail("Not found.", 404);
  if (isCrossSite(request)) return crossSiteRefusal();
  const body = await readJson(request).catch(() => null);
  const raw = isRecord(body) ? body.now : undefined;
  const ms = typeof raw === "number" ? raw : typeof raw === "string" ? Date.parse(raw) : Number.NaN;
  if (Number.isNaN(ms)) return fail("Send { now: ISO string or epoch ms }.", 400);
  setServerNow(ms);
  return json({ serverNow: serverNow() });
}

export async function GET() {
  if (!isE2E()) return fail("Not found.", 404);
  return json({ serverNow: serverNow() });
}
