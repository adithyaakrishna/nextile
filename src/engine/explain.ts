import { canonical } from "./canonical";
import { describe, CELL_NAMES } from "./describe";
import { motionsOf } from "./difficulty";
import { PROPS, type Cell, type Prop, type PropValue, type Rotation, type Tile } from "./domain";
import { answerOf, streamsOf, type PropRules, type SequenceRule } from "./generate";
import { minimalPeriod, type PropRule } from "./rules";

const PLURAL_NOUNS: Record<Prop, string> = {
  shape: "Shapes",
  color: "Colors",
  fill: "Fills",
  rotation: "Turns",
  count: "Counts",
  cell: "Positions",
};

const SINGULAR_NOUNS: Record<Prop, string> = {
  shape: "shape",
  color: "color",
  fill: "fill",
  rotation: "turn",
  count: "count",
  cell: "position",
};

const DIRECTIONS: Record<Rotation, string> = { 0: "up", 90: "right", 180: "down", 270: "left" };
const HOLD_WORDS: Record<number, string> = { 2: "twice", 3: "three times", 4: "four times" };
const PERIOD_WORDS: Record<number, string> = { 2: "twos", 3: "threes", 4: "fours" };

// Matched against the rule part of an explanation (everything before "Next is")
export const MENTION_PATTERNS: Record<Prop, RegExp> = {
  shape: /\b(shapes?|circles?|squares?|triangles?|diamonds?)\b/i,
  color: /\b(colou?rs?|blue|pink|yellow)\b/i,
  fill: /\b(fills?|solid|outlined?|outlines|striped|stripes)\b/i,
  rotation: /\b(turns?|turning|rotat\w*|quarter-turn|clockwise|counter-clockwise|pointing|points?)\b/i,
  count: /\b(count|counts|counting|number)\b/i,
  cell: /\b(dot|position|moves?|corners?|cells?|row|column|slides?|walks?|lap|edge)\b/i,
};

// Generic words that claim a property changes; forbidden when it does not
export const CLAIM_PATTERNS: Record<Prop, RegExp> = {
  shape: /\bshapes?\b/i,
  color: /\bcolou?rs?\b/i,
  fill: /\bfills?\b/i,
  rotation: /\b(turns?|turning|rotat\w*|quarter-turn)\b/i,
  count: /\b(count|counts|counting)\b/i,
  cell: /\b(position|corners?|cells?|slides?|walks?|lap)\b/i,
};

export function ruleText(explanation: string): string {
  const at = explanation.lastIndexOf("Next is");
  return at === -1 ? explanation : explanation.slice(0, at);
}

function word(prop: Prop, value: PropValue): string {
  if (prop === "rotation") return DIRECTIONS[value as Rotation];
  if (prop === "cell") return CELL_NAMES[value as Cell];
  return String(value);
}

function list(prop: Prop, values: readonly PropValue[]): string {
  const words = values.map((v) => word(prop, v));
  return words.length === 2 ? `${words[0]} and ${words[1]}` : words.join(", ");
}

function stepSentence(prop: Prop, rule: Extract<PropRule<PropValue>, { kind: "step" }>): string {
  const n = rule.track.length;
  const by = ((rule.by % n) + n) % n;
  const isForward = by * 2 < n || (by * 2 === n && rule.by > 0);
  if (prop === "rotation") {
    if (by === 2) return "The triangle turns half a turn each time";
    return `The triangle turns a quarter-turn ${by === 1 ? "clockwise" : "counter-clockwise"} each time`;
  }
  if (prop === "count") return isForward ? "The count goes up by one and wraps back to one" : "The count goes down by one and wraps back to three";
  const track = rule.track.join(",");
  if (track === "0,2,8,6") return `The dot moves ${isForward ? "clockwise" : "counter-clockwise"} around the corners`;
  if (track === "0,1,2,5,8,7,6,3") return `The dot moves ${isForward ? "clockwise" : "counter-clockwise"} around the edge`;
  if (track === "0,1,2,3,4,5,6,7,8") return "The dot moves one cell at a time in reading order";
  return `The dot moves one cell at a time along the ${track === "3,4,5" ? "middle row" : "middle column"}`;
}

export function sentenceFor(prop: Prop, rule: PropRule<PropValue>): string {
  switch (rule.kind) {
    case "constant":
      return "";
    case "cycle": {
      const values = rule.values.slice(0, minimalPeriod(rule.values));
      if (prop === "rotation") return `The triangle turns to point ${list(prop, values)}`;
      if (prop === "count") return `The count repeats ${list(prop, values)}`;
      if (prop === "cell") return `The dot moves between ${list(prop, values)}`;
      const verb = values.length === 2 ? "alternate" : "repeat";
      return `${PLURAL_NOUNS[prop]} ${verb} ${list(prop, values)}`;
    }
    case "step":
      return stepSentence(prop, rule);
    case "bounce": {
      const first = rule.values[0];
      const last = rule.values[rule.values.length - 1];
      if (prop === "count" && Number(first) > Number(last)) return `The count drops to ${last} and climbs back up`;
      if (prop === "count") return `The count climbs to ${last} and comes back down`;
      if (prop === "cell" && rule.values.join(",") === "3,4,5") return "The dot slides across the middle row and back";
      if (prop === "cell") return `The dot slides from ${word(prop, first)} to ${word(prop, last)} and back`;
      if (prop === "rotation") return `The triangle turns from ${word(prop, first)} to ${word(prop, last)} and back`;
      return `${PLURAL_NOUNS[prop]} go ${list(prop, rule.values)} and back`;
    }
    case "stutter":
      return `Each ${SINGULAR_NOUNS[prop]} appears ${HOLD_WORDS[rule.hold] ?? `${rule.hold} times`} before the next one`;
    default: {
      const unreachable: never = rule;
      throw new Error(`Unknown rule ${JSON.stringify(unreachable)}`);
    }
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function lower(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function streamSentence(props: PropRules): string {
  const motions = motionsOf(props);
  const carryHolds = motions.flatMap((m) => (m.isCarry ? m.props.map((p) => props[p]).filter((r) => r.kind === "stutter").map((r) => r.hold) : []));
  const visible = motions.filter((m) => m.isCarry || !carryHolds.includes(m.period));
  const parts = visible.map((m) => {
    if (m.isCarry) {
      const slow = m.props.find((p) => props[p].kind === "stutter") ?? m.props[0];
      const fast = motions.find((o) => o !== m && o.period === (props[slow] as { hold: number }).hold);
      const fastProp = fast?.props[0] ?? slow;
      return `${capitalize(SINGULAR_NOUNS[fastProp])} cycles; each time it starts over, the ${SINGULAR_NOUNS[slow]} moves on`;
    }
    if (m.props.length > 1) {
      const names = m.props.map((p) => SINGULAR_NOUNS[p]);
      return `${capitalize(names.slice(0, -1).join(", "))} and ${names[names.length - 1]} change together`;
    }
    const p = m.props[0];
    const sentence = sentenceFor(p, props[p]);
    return motions.length > 1 && m.period !== motions[0].period && props[p].kind === "cycle" && minimalPeriod((props[p] as { values: readonly PropValue[] }).values) > 2
      ? sentence.replace(/repeat .*/, `repeat in ${PERIOD_WORDS[m.period] ?? `${m.period}s`}`)
      : sentence;
  });
  return parts.filter(Boolean).map((s, i) => (i === 0 ? s : lower(s))).join("; ");
}

// A first draft, edited by a person for voice before review
export function explain(rule: SequenceRule, shown: number, options: { grid?: boolean } = {}): string {
  const answer = answerOf(rule, shown);
  const body =
    rule.kind === "parallel"
      ? streamSentence(rule.props)
      : `Two sequences take turns: ${streamsOf(rule).map((s) => lower(streamSentence(s)) || "nothing changes").join("; ")}`;
  return `${body}. Next is ${describe(answer, options)}.`;
}

// Properties whose displayed value changes anywhere in the sequence or the answer
export function varyingProps(tiles: readonly Tile[]): Prop[] {
  const shown = tiles.map(canonical);
  return PROPS.filter((p) => new Set(shown.map((t) => t[p])).size > 1);
}
