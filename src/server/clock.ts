import "server-only";
import { startingNowOverride } from "./test-mode";

interface ClockState {
  offsetMs: number;
}

// Route bundles can each get their own copy of a module, so shared state lives on globalThis
const globalClock = globalThis as typeof globalThis & { __nxClock?: ClockState };

function state(): ClockState {
  if (!globalClock.__nxClock) {
    const start = startingNowOverride();
    globalClock.__nxClock = { offsetMs: start === null ? 0 : start - Date.now() };
  }
  return globalClock.__nxClock;
}

// The server's idea of now; only test and local-preview switches ever move it
export function serverNow(): number {
  return Date.now() + state().offsetMs;
}

export function setServerNow(ms: number): void {
  state().offsetMs = ms - Date.now();
}
