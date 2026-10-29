import { expect, it } from "vitest";
import { parseClientEvent } from "@/analytics/events";

it("accepts well-formed client events", () => {
  expect(parseClientEvent({ name: "start_clicked", props: { day: "2026-11-16" } })).not.toBeNull();
  expect(parseClientEvent({ name: "landing_viewed", props: { day: "2026-11-16", returning: true, daysSinceLastVisit: 1, via: "share" } })).not.toBeNull();
  expect(parseClientEvent({ name: "attribution_clicked", props: { placement: "footer" } })).not.toBeNull();
  expect(parseClientEvent({ name: "about_viewed", props: {} })).not.toBeNull();
});

it("rejects unknown events, extra fields and bad values", () => {
  expect(parseClientEvent({ name: "hack", props: {} })).toBeNull();
  expect(parseClientEvent({ name: "start_clicked", props: { day: "2026-11-16", family: "interleave" } })).toBeNull();
  expect(parseClientEvent({ name: "start_clicked", props: { day: "tomorrow" } })).toBeNull();
  expect(parseClientEvent({ name: "share_clicked", props: { day: "2026-11-16", method: "fax" } })).toBeNull();
  expect(parseClientEvent({ name: "start_clicked", props: { day: "2026-11-16" }, extra: 1 })).toBeNull();
});

it("refuses outcome events from the browser, because only the server may emit them", () => {
  expect(parseClientEvent({ name: "puzzle_correct", props: { day: "2026-11-16", puzzleId: "p-0001", family: "walk", difficulty: "easy", elapsedMs: 1, score: 99 } })).toBeNull();
});
