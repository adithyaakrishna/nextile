import "server-only";
import { isLocalOrigin } from "./switches";

export function publicOrigin(): string {
  return process.env.PUBLIC_ORIGIN ?? "http://localhost:3000";
}

// Test-only switches are refused unless PUBLIC_ORIGIN is explicitly a localhost address
function assertLocal(name: string): void {
  if (!isLocalOrigin()) throw new Error(`${name} is set but PUBLIC_ORIGIN is not a localhost address; refusing to start.`);
}

export function isE2E(): boolean {
  if (process.env.E2E !== "1") return false;
  assertLocal("E2E");
  return true;
}

export function isFixtureContent(): boolean {
  if (process.env.NX_CONTENT !== "fixture") return false;
  assertLocal("NX_CONTENT=fixture");
  return true;
}

export function startingNowOverride(): number | null {
  const raw = process.env.NX_NOW;
  if (!raw) return null;
  assertLocal("NX_NOW");
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) throw new Error(`NX_NOW must be an ISO timestamp, got "${raw}"`);
  return ms;
}
