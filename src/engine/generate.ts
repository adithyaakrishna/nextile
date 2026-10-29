import type { Prop, PropValue, Tile } from "./domain";
import { valueAt, type PropRule } from "./rules";

export type PropRules = { [K in Prop]: PropRule<Tile[K]> };

// Indexing PropRules with a union key needs a widened type
export function ruleOf(props: PropRules, prop: Prop): PropRule<PropValue> {
  return props[prop] as PropRule<PropValue>;
}

export type SequenceRule =
  | { kind: "parallel"; props: PropRules } // every property follows its own rule
  | { kind: "interleave"; streams: readonly [PropRules, PropRules] }; // two sequences take turns

export function streamPosition(rule: SequenceRule, i: number): { props: PropRules; j: number; stream: 0 | 1 } {
  if (rule.kind === "parallel") return { props: rule.props, j: i, stream: 0 };
  const stream = (i % 2) as 0 | 1;
  return { props: rule.streams[stream], j: Math.floor(i / 2), stream };
}

export function tileAt(rule: SequenceRule, i: number): Tile {
  const { props, j } = streamPosition(rule, i);
  return {
    shape: valueAt(props.shape, j),
    color: valueAt(props.color, j),
    fill: valueAt(props.fill, j),
    rotation: valueAt(props.rotation, j),
    count: valueAt(props.count, j),
    cell: valueAt(props.cell, j),
  };
}

export function sequenceOf(rule: SequenceRule, shown: number): Tile[] {
  return Array.from({ length: shown }, (_, i) => tileAt(rule, i));
}

export function answerOf(rule: SequenceRule, shown: number): Tile {
  return tileAt(rule, shown);
}

export function streamsOf(rule: SequenceRule): readonly PropRules[] {
  return rule.kind === "parallel" ? [rule.props] : rule.streams;
}
