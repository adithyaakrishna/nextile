import "server-only";
import type { ApiError } from "@/game/api-types";
import { publicOrigin } from "./test-mode";

const MAX_BODY_BYTES = 16_384;

export function json<T>(data: T, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(error: string, status: number): Response {
  return json<ApiError>({ error }, status);
}

// Another site must not be able to start attempts, post events, or swap a player's cookie with a form POST
export function isCrossSite(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false; // not a browser request, so it can't carry or replace a player's cookie
  try {
    const from = new URL(origin);
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return from.host !== host && from.origin !== new URL(publicOrigin()).origin;
  } catch {
    return true;
  }
}

export function crossSiteRefusal(): Response {
  return fail("Cross-site requests aren't accepted.", 403);
}

// Bodies are small JSON objects; anything larger or malformed is refused before parsing
export async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new Error("Request body is too large");
  return JSON.parse(text);
}
