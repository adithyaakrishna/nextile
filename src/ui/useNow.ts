"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let timer: number | null = null;
let now = 0;

function tick() {
  now = Date.now();
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (timer === null) {
    now = Date.now();
    timer = window.setInterval(tick, 250);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

function snapshot(): number {
  if (timer === null) now = Date.now();
  return now;
}

// Device time, refreshed four times a second; 0 during server rendering so markup never mismatches
export function useNow(): number {
  return useSyncExternalStore(subscribe, snapshot, () => 0);
}
