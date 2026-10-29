export interface Clock {
  now(): number;
}

// Monotonic, so a device clock change mid-game can't stretch or shrink the minute
export const monotonicClock: Clock = { now: () => performance.now() };
