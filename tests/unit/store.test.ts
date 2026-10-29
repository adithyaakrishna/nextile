import { expect, it } from "vitest";
import { STORE_KEY, emptyStore, loadStore, readStore, saveStore, withResult } from "@/persistence/store";
import { validResult } from "../fixtures/states";

const fake = (value: string | null) => ({ getItem: () => value });

it("survives malformed JSON", () => {
  expect(loadStore(fake("{not json"))).toEqual(emptyStore());
});

it("survives storage that throws", () => {
  expect(
    loadStore({
      getItem: () => {
        throw new Error("SecurityError");
      },
    }),
  ).toEqual(emptyStore());
});

it("survives having no storage at all", () => {
  expect(loadStore(null)).toEqual(emptyStore());
  expect(saveStore(emptyStore(), null)).toBe(false);
});

it("keeps valid history entries and drops broken ones", () => {
  const raw = JSON.stringify({ v: 2, history: { "2026-11-16": validResult(), "2026-11-17": { score: "lots" } } });
  expect(Object.keys(loadStore(fake(raw)).history)).toEqual(["2026-11-16"]);
});

it("drops a history entry filed under the wrong day", () => {
  const raw = JSON.stringify({ v: 2, history: { "2026-11-17": validResult({ day: "2026-11-16" }) } });
  expect(loadStore(fake(raw)).history).toEqual({});
});

it("falls back to defaults for invalid preferences, field by field", () => {
  const raw = JSON.stringify({ v: 2, prefs: { sound: "loud", colorAssist: true, theme: "neon" } });
  expect(loadStore(fake(raw)).prefs).toEqual({ sound: false, colorAssist: true, theme: "system" });
});

it("upgrades version 1 data", () => {
  const raw = JSON.stringify({ v: 1, history: { "2026-11-16": validResult() }, sound: true, theme: "dark" });
  const store = loadStore(fake(raw));
  expect(store.v).toBe(2);
  expect(store.prefs).toEqual({ sound: true, colorAssist: false, theme: "dark" });
  expect(Object.keys(store.history)).toEqual(["2026-11-16"]);
});

it("refuses to overwrite data from a newer version", () => {
  const loaded = readStore(fake(JSON.stringify({ v: 9, history: {} })));
  expect(loaded.isWritable).toBe(false);
  expect(loaded.store).toEqual(emptyStore());
});

it("writes under one versioned key", () => {
  let written: [string, string] | null = null;
  expect(saveStore(emptyStore(), { setItem: (k, v) => (written = [k, v]) })).toBe(true);
  expect(written![0]).toBe(STORE_KEY);
  expect(JSON.parse(written![1]).v).toBe(2);
});

it("reports a full storage quota without throwing", () => {
  expect(
    saveStore(emptyStore(), {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    }),
  ).toBe(false);
});

it("clears the pending finish once that day's result arrives", () => {
  const store = { ...emptyStore(), pending: { day: "2026-11-16", attemptId: "a1", choice: 1 as const, clientElapsedMs: 18_000 } };
  expect(withResult(store, validResult()).pending).toBeNull();
});
