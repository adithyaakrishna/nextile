import { DEFAULT_TILE, PROPS, TRACKS, type Prop, type PropValue, type Tile, type TrackName } from "./domain";
import type { PropRules, SequenceRule } from "./generate";
import type { PropRule } from "./rules";

export type Vary = { [K in Prop]?: PropRule<Tile[K]> };

export interface StreamSpec {
  base?: Partial<Tile>;
  vary?: Vary;
}

export function constant<T>(value: T): PropRule<T> {
  return { kind: "constant", value };
}

export function cycle<T>(...values: T[]): PropRule<T> {
  return { kind: "cycle", values };
}

export function step<T extends PropValue>(track: TrackName, start: T, by = 1): PropRule<T> {
  return { kind: "step", track: TRACKS[track] as readonly PropValue[] as readonly T[], start, by };
}

export function bounce<T>(...values: T[]): PropRule<T> {
  return { kind: "bounce", values };
}

export function stutter<T>(hold: number, ...values: T[]): PropRule<T> {
  return { kind: "stutter", values, hold };
}

// Anything not listed under `vary` is a constant taken from `base` or the defaults
export function stream({ base = {}, vary = {} }: StreamSpec): PropRules {
  const tile = { ...DEFAULT_TILE, ...base };
  return Object.fromEntries(PROPS.map((p) => [p, vary[p] ?? constant(tile[p])])) as PropRules;
}

export function parallel(spec: StreamSpec): SequenceRule {
  return { kind: "parallel", props: stream(spec) };
}

export function interleave(first: StreamSpec, second: StreamSpec): SequenceRule {
  return { kind: "interleave", streams: [stream(first), stream(second)] };
}
