"use client";

import { useSyncExternalStore } from "react";
import { emptyStore, readStore, safeStorage, saveStore, type Prefs, type Store } from "./store";

interface Live {
  store: Store;
  isWritable: boolean;
  isAvailable: boolean;
}

const SERVER_SNAPSHOT = emptyStore();
const listeners = new Set<() => void>();
let live: Live | null = null;

function ensure(): Live {
  if (!live) {
    const storage = safeStorage();
    const loaded = readStore(storage);
    live = { store: loaded.store, isWritable: loaded.isWritable, isAvailable: storage !== null };
  }
  return live;
}

export function applyPrefs(prefs: Prefs): void {
  const root = document.documentElement;
  if (prefs.theme === "system") delete root.dataset.theme;
  else root.dataset.theme = prefs.theme;
  root.dataset.colorAssist = prefs.colorAssist ? "on" : "off";
}

export function getStore(): Store {
  return ensure().store;
}

export function isStorageAvailable(): boolean {
  return ensure().isAvailable && ensure().isWritable;
}

export function updateStore(update: (store: Store) => Store): Store {
  const state = ensure();
  const before = state.store;
  state.store = update(before);
  if (state.isWritable) saveStore(state.store);
  if (state.store.prefs !== before.prefs) applyPrefs(state.store.prefs);
  for (const listener of listeners) listener();
  return state.store;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== "nextile") return;
    live = null; // another tab wrote: reload on the next read
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStore(): Store {
  return useSyncExternalStore(subscribe, getStore, () => SERVER_SNAPSHOT);
}
