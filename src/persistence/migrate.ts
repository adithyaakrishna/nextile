import { isDayKey } from "@/time/day";
import { isChoiceIndex, isRecord, isResult } from "./guards";
import { STORE_VERSION, THEMES, emptyStore, type LocalResult, type Pending, type Prefs, type Store, type Theme } from "./store";

// Version 1 (pre-release) kept preferences at the top level and had no pending finish or visit tracking
function upgradeFromV1(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    v: 2,
    history: raw.history,
    pending: null,
    prefs: { sound: raw.sound, colorAssist: false, theme: raw.theme },
    lastVisitDay: null,
  };
}

function sanitizeHistory(value: unknown): Record<string, LocalResult> {
  if (!isRecord(value)) return {};
  const out: Record<string, LocalResult> = {};
  for (const [day, entry] of Object.entries(value)) {
    if (isDayKey(day) && isResult(entry) && entry.day === day) out[day] = entry; // a broken entry is dropped on its own
  }
  return out;
}

function sanitizePending(value: unknown): Pending | null {
  if (!isRecord(value)) return null;
  const { day, attemptId, choice, clientElapsedMs } = value;
  if (!isDayKey(day) || typeof attemptId !== "string" || !(choice === null || isChoiceIndex(choice))) return null;
  if (typeof clientElapsedMs !== "number" || !Number.isFinite(clientElapsedMs) || clientElapsedMs < 0) return null;
  return { day, attemptId, choice, clientElapsedMs };
}

function sanitizePrefs(value: unknown): Prefs {
  const defaults = emptyStore().prefs;
  if (!isRecord(value)) return defaults;
  return {
    sound: typeof value.sound === "boolean" ? value.sound : defaults.sound,
    colorAssist: typeof value.colorAssist === "boolean" ? value.colorAssist : defaults.colorAssist,
    theme: (THEMES as readonly unknown[]).includes(value.theme) ? (value.theme as Theme) : defaults.theme,
  };
}

// Upgrades older shapes step by step, then keeps every field that is still valid; null only when nothing is salvageable
export function migrate(raw: unknown): Store | null {
  if (!isRecord(raw)) return null;
  let data = raw;
  if (data.v === 1) data = upgradeFromV1(data);
  if (data.v !== STORE_VERSION) return null;
  return {
    v: STORE_VERSION,
    history: sanitizeHistory(data.history),
    pending: sanitizePending(data.pending),
    prefs: sanitizePrefs(data.prefs),
    lastVisitDay: isDayKey(data.lastVisitDay) ? data.lastVisitDay : null,
  };
}
