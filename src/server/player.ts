import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { publicOrigin } from "./test-mode";

export const PLAYER_COOKIE = "nx_pid";
const MAX_AGE_SECONDS = 400 * 24 * 60 * 60; // the longest browsers honor

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isPlayerId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

// Identifies a browser, not a person; it is not authentication and nothing personal is stored
export async function readPlayerId(): Promise<string | null> {
  const value = (await cookies()).get(PLAYER_COOKIE)?.value;
  return isPlayerId(value) ? value : null;
}

// Route handlers only: server components cannot set cookies
export async function ensurePlayerId(): Promise<string> {
  const existing = await readPlayerId();
  if (existing) return existing;
  const id = randomUUID();
  (await cookies()).set(PLAYER_COOKIE, id, {
    httpOnly: true,
    secure: publicOrigin().startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return id;
}
