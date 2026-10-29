import "server-only";
import { isE2E } from "./test-mode";

export const LIMITS = { start: 10, finish: 30, events: 60 } as const;
export type Bucket = keyof typeof LIMITS;

const WINDOW_MS = 60_000;

interface Window {
  startedAt: number;
  count: number;
}

// In memory only, which is fine for a single process; IP addresses never reach the disk
const globalLimits = globalThis as typeof globalThis & { __nxLimits?: Map<string, Window> };

function windows(): Map<string, Window> {
  globalLimits.__nxLimits ??= new Map();
  return globalLimits.__nxLimits;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

export function isAllowed(bucket: Bucket, ip: string, nowMs: number = Date.now()): boolean {
  const limit = isE2E() ? LIMITS[bucket] * 100 : LIMITS[bucket];
  const map = windows();
  const key = `${bucket}:${ip}`;
  const current = map.get(key);
  if (!current || nowMs - current.startedAt >= WINDOW_MS) {
    if (map.size > 10_000) for (const [k, w] of map) if (nowMs - w.startedAt >= WINDOW_MS) map.delete(k);
    map.set(key, { startedAt: nowMs, count: 1 });
    return true;
  }
  current.count++;
  return current.count <= limit;
}
