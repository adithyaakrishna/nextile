import { afterEach, describe, expect, it } from "vitest";
import { isCrossSite } from "@/server/http";
import { assertTestSwitchesAllowed, isLocalOrigin } from "@/server/switches";

const ORIGINAL_ORIGIN = process.env.PUBLIC_ORIGIN;

function post(headers: Record<string, string>): Request {
  return new Request("http://127.0.0.1:3000/api/attempts", { method: "POST", headers });
}

afterEach(() => {
  process.env.PUBLIC_ORIGIN = ORIGINAL_ORIGIN;
});

describe("cross-site requests", () => {
  it("refuses requests the browser labels cross-site or same-site", () => {
    expect(isCrossSite(post({ "sec-fetch-site": "cross-site", origin: "https://evil.example" }))).toBe(true);
    expect(isCrossSite(post({ "sec-fetch-site": "same-site" }))).toBe(true);
  });

  it("refuses a foreign Origin even without fetch metadata", () => {
    expect(isCrossSite(post({ origin: "https://evil.example", host: "nextile.example" }))).toBe(true);
  });

  it("accepts the game's own requests, including behind a proxy", () => {
    process.env.PUBLIC_ORIGIN = "https://nextile.example";
    expect(isCrossSite(post({ "sec-fetch-site": "same-origin", origin: "https://nextile.example" }))).toBe(false);
    expect(isCrossSite(post({ origin: "https://nextile.example", host: "127.0.0.1:3000" }))).toBe(false);
    expect(isCrossSite(post({ origin: "http://localhost:3200", host: "localhost:3200" }))).toBe(false);
  });

  it("accepts non-browser clients, which can't carry or replace a player's cookie", () => {
    expect(isCrossSite(post({}))).toBe(false);
  });
});

describe("test-only switches", () => {
  it("treat an unset or remote PUBLIC_ORIGIN as not local", () => {
    expect(isLocalOrigin(undefined)).toBe(false);
    expect(isLocalOrigin("")).toBe(false);
    expect(isLocalOrigin("https://nextile.example")).toBe(false);
    expect(isLocalOrigin("http://localhost:3200")).toBe(true);
  });

  it("stop the server at startup unless it is served from localhost", () => {
    expect(() => assertTestSwitchesAllowed({ E2E: "1" })).toThrow(/refusing to start/);
    expect(() => assertTestSwitchesAllowed({ NX_NOW: "2026-11-18T12:00:00Z", PUBLIC_ORIGIN: "https://nextile.example" })).toThrow();
    expect(() => assertTestSwitchesAllowed({ E2E: "1", PUBLIC_ORIGIN: "http://localhost:3200" })).not.toThrow();
    expect(() => assertTestSwitchesAllowed({})).not.toThrow();
  });
});
