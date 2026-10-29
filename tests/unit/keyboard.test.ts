// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { keyToEvent } from "@/game/keyboard";
import { INITIAL_STATE } from "@/game/machine";
import { TODAY, playingState } from "../fixtures/states";

function key(k: string, init: KeyboardEventInit = {}, target?: HTMLElement): KeyboardEvent {
  const e = new KeyboardEvent("keydown", { key: k, bubbles: true, ...init });
  if (target) Object.defineProperty(e, "target", { value: target });
  return e;
}

describe("keyboard", () => {
  it("answers with 1–4 during play", () => {
    expect(keyToEvent(key("3"), playingState(), 1_000)).toEqual({ type: "ANSWER", choice: 2, now: 1_000 });
    expect(keyToEvent(key("5"), playingState(), 1_000)).toBeNull();
  });

  it("ignores held keys and shortcuts", () => {
    expect(keyToEvent(key("1", { repeat: true }), playingState(), 0)).toBeNull();
    expect(keyToEvent(key("1", { metaKey: true }), playingState(), 0)).toBeNull();
  });

  it("starts with Enter or Space, but not while a control has focus", () => {
    const ready = { status: "ready" as const, today: TODAY };
    expect(keyToEvent(key("Enter", {}, document.body), ready, 0)).toEqual({ type: "START_REQUESTED" });
    expect(keyToEvent(key(" ", {}, document.body), ready, 0)).toEqual({ type: "START_REQUESTED" });
    expect(keyToEvent(key("Enter", {}, document.createElement("a")), ready, 0)).toBeNull();
  });

  it("does nothing while loading", () => {
    expect(keyToEvent(key("Enter", {}, document.body), INITIAL_STATE, 0)).toBeNull();
    expect(keyToEvent(key("1"), INITIAL_STATE, 0)).toBeNull();
  });
});
