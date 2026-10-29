"use client";

import type { ClientEvent } from "./events";

const FLUSH_MS = 4_000;
const ENDPOINT = "/api/e";

let queue: ClientEvent[] = [];
let timer: number | null = null;
let isListening = false;

// An adapter for PostHog, Plausible or similar can be added here; nothing is forwarded until one is connected
function send(events: ClientEvent[], isUnloading: boolean): void {
  const body = JSON.stringify({ events });
  if (isUnloading && typeof navigator.sendBeacon === "function") {
    if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }))) return;
  }
  void fetch(ENDPOINT, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
}

export function flush(isUnloading = false): void {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (queue.length === 0) return;
  const batch = queue;
  queue = [];
  send(batch, isUnloading);
}

function listen(): void {
  if (isListening) return;
  isListening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
  window.addEventListener("pagehide", () => flush(true));
}

export function track(event: ClientEvent): void {
  if (typeof window === "undefined") return;
  listen();
  queue.push(event);
  timer ??= window.setTimeout(() => flush(), FLUSH_MS);
}
