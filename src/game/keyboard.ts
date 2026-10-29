import type { ChoiceIndex, GameEvent, GameState } from "./machine";

// Number keys answer from anywhere during play; Enter or Space starts. Held keys never repeat.
export function keyToEvent(e: KeyboardEvent, state: GameState, now: number): GameEvent | null {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return null;
  if (state.status === "playing" && /^[1-4]$/.test(e.key)) {
    return { type: "ANSWER", choice: (Number(e.key) - 1) as ChoiceIndex, now };
  }
  const isOnControl = e.target instanceof HTMLElement && e.target.closest("button, a, input, textarea, select, summary, [role='button']");
  if (state.status === "ready" && (e.key === "Enter" || e.key === " ") && !isOnControl) {
    return { type: "START_REQUESTED" }; // the caller also calls e.preventDefault() so Space doesn't scroll
  }
  return null;
}
