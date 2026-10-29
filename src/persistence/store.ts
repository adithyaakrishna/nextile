import type { ChoiceIndex, Result } from "@/game/machine";
import { migrate } from "./migrate";

export const STORE_KEY = "nextile";
export const STORE_VERSION = 2;

export type LocalResult = Result; // the same shape the server returns

export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export interface Pending {
  day: string;
  attemptId: string;
  choice: ChoiceIndex | null;
  clientElapsedMs: number;
}

export interface Prefs {
  sound: boolean;
  colorAssist: boolean;
  theme: Theme;
}

export interface Store {
  v: typeof STORE_VERSION;
  history: Record<string, LocalResult>; // keyed by UTC day
  pending: Pending | null;
  prefs: Prefs;
  lastVisitDay: string | null;
}

export function emptyStore(): Store {
  return {
    v: STORE_VERSION,
    history: {},
    pending: null,
    prefs: { sound: false, colorAssist: false, theme: "system" },
    lastVisitDay: null,
  };
}

// Storage can be missing, disabled, full, or throw (Safari private mode, embedded browsers)
export function safeStorage(): Storage | null {
  try {
    const s = window.localStorage;
    s.setItem("__nx_probe", "1");
    s.removeItem("__nx_probe");
    return s;
  } catch {
    return null;
  }
}

export interface LoadedStore {
  store: Store;
  // False when a newer deployment wrote data this tab doesn't understand, so it must not overwrite it
  isWritable: boolean;
}

export function readStore(storage: Pick<Storage, "getItem"> | null): LoadedStore {
  try {
    const raw = storage?.getItem(STORE_KEY);
    if (!raw) return { store: emptyStore(), isWritable: storage !== null };
    const parsed: unknown = JSON.parse(raw);
    const version = typeof parsed === "object" && parsed !== null ? (parsed as { v?: unknown }).v : undefined;
    if (typeof version === "number" && version > STORE_VERSION) return { store: emptyStore(), isWritable: false };
    return { store: migrate(parsed) ?? emptyStore(), isWritable: true };
  } catch {
    return { store: emptyStore(), isWritable: storage !== null }; // malformed JSON never breaks the game
  }
}

export function loadStore(storage: Pick<Storage, "getItem"> | null = safeStorage()): Store {
  return readStore(storage).store;
}

export function saveStore(store: Store, storage: Pick<Storage, "setItem"> | null = safeStorage()): boolean {
  try {
    storage?.setItem(STORE_KEY, JSON.stringify(store));
    return storage !== null;
  } catch {
    return false; // quota or disabled: the game continues; the server still has the result
  }
}

export function withResult(store: Store, result: LocalResult): Store {
  return {
    ...store,
    history: { ...store.history, [result.day]: result },
    pending: store.pending?.day === result.day ? null : store.pending,
  };
}

// The server wins for the same day
export function withResults(store: Store, results: readonly LocalResult[]): Store {
  return results.reduce(withResult, store);
}
