import { canonical, tileKey } from "./canonical";
import { motionsOf } from "./difficulty";
import { DOMAINS, PROPS, type Prop, type PropValue, type Tile } from "./domain";
import { answerOf, ruleOf, sequenceOf, streamPosition, tileAt, type SequenceRule } from "./generate";
import { isEffectivelyConstant, valueAt, type PropRule } from "./rules";
import { solve } from "./solver";

// In order of preference; "decoy" changes a property that never moves, so it is the weakest
export const RECIPES = ["phase-slip", "over-step", "wrong-stream", "early-wrap", "repeat-last", "tweak", "decoy"] as const;
export type Recipe = (typeof RECIPES)[number];

export interface Candidate {
  tile: Tile;
  recipe: Recipe;
  props: Prop[]; // properties that differ from the answer
  targetsHardest: boolean;
}

export function differingProps(a: Tile, b: Tile): Prop[] {
  const x = canonical(a);
  const y = canonical(b);
  return PROPS.filter((p) => x[p] !== y[p]);
}

function withValue(tile: Tile, prop: Prop, value: PropValue): Tile {
  return canonical({ ...tile, [prop]: value } as Tile);
}

function slipsFor(prop: Prop, rule: PropRule<PropValue>, j: number): { value: PropValue; recipe: Recipe }[] {
  switch (rule.kind) {
    case "constant":
      return [];
    case "cycle":
      return [
        { value: valueAt(rule, j + 1), recipe: "phase-slip" },
        { value: valueAt(rule, j - 1), recipe: "phase-slip" },
      ];
    case "step":
      return [
        { value: valueAt(rule, j + 1), recipe: "over-step" },
        { value: valueAt(rule, j - 1), recipe: "repeat-last" },
        { value: valueAt(rule, j - 2), recipe: "phase-slip" }, // turned or moved the wrong way
      ];
    case "bounce":
      return rule.values.map((value) => ({ value, recipe: "early-wrap" as const }));
    case "stutter":
      return [
        { value: valueAt(rule, (Math.floor(j / rule.hold) + 1) * rule.hold), recipe: "early-wrap" },
        { value: valueAt(rule, j - rule.hold), recipe: "phase-slip" },
      ];
    default: {
      const unreachable: never = rule;
      throw new Error(`Unknown rule ${JSON.stringify(unreachable)}`);
    }
  }
}

// Every plausible wrong answer, best first; the author (or the build script) picks three
export function proposeDistractors(rule: SequenceRule, shown: number): Candidate[] {
  const answer = canonical(answerOf(rule, shown));
  const sequence = sequenceOf(rule, shown);
  const last = canonical(sequence[shown - 1]);
  const { props, j } = streamPosition(rule, shown);
  const isGrid = sequence.some((t) => canonical(t).cell !== 4) || answer.cell !== 4;
  const predicted = solve(sequence).predictedKeys;

  const hardest = [...motionsOf(props)].sort((a, b) => b.points - a.points)[0]?.props ?? [];

  const raw: { tile: Tile; recipe: Recipe }[] = [];
  const moving = PROPS.filter((p) => !isEffectivelyConstant(ruleOf(props, p)));
  for (const p of moving) {
    for (const slip of slipsFor(p, ruleOf(props, p), j)) raw.push({ tile: withValue(answer, p, slip.value), recipe: slip.recipe });
    raw.push({ tile: withValue(answer, p, last[p]), recipe: "repeat-last" });
  }
  if (rule.kind === "interleave") {
    raw.push({ tile: canonical(tileAt(rule, shown + 1)), recipe: "wrong-stream" });
    raw.push({ tile: canonical(tileAt(rule, shown - 1)), recipe: "wrong-stream" });
  }
  for (let a = 0; a < moving.length; a++) {
    for (let b = a + 1; b < moving.length; b++) {
      const pa = moving[a];
      const pb = moving[b];
      raw.push({ tile: withValue(withValue(answer, pa, valueAt(ruleOf(props, pa), j + 1)), pb, last[pb]), recipe: "phase-slip" });
      raw.push({ tile: withValue(withValue(answer, pa, last[pa]), pb, valueAt(ruleOf(props, pb), j + 1)), recipe: "phase-slip" });
    }
  }
  for (const p of moving) {
    for (const value of DOMAINS[p] as readonly PropValue[]) raw.push({ tile: withValue(answer, p, value), recipe: "tweak" });
  }
  for (const p of PROPS.filter((x) => !moving.includes(x))) {
    for (const value of DOMAINS[p] as readonly PropValue[]) raw.push({ tile: withValue(answer, p, value), recipe: "decoy" });
  }

  const seen = new Set<string>([tileKey(answer)]);
  const out: Candidate[] = [];
  for (const { tile, recipe } of raw) {
    const key = tileKey(tile);
    if (seen.has(key) || predicted.has(key)) continue;
    if (isGrid ? tile.count !== 1 : tile.cell !== 4) continue;
    const diff = differingProps(tile, answer);
    if (diff.length < 1 || diff.length > 2) continue;
    seen.add(key);
    out.push({ tile, recipe, props: diff, targetsHardest: diff.some((d) => hardest.includes(d)) });
  }
  return out;
}

// Three distractors with as many different recipes as possible, at least one on the hardest motion
export function pickDistractors(candidates: readonly Candidate[]): Candidate[] {
  const ranked = [...candidates].sort((a, b) => RECIPES.indexOf(a.recipe) - RECIPES.indexOf(b.recipe));
  const picked: Candidate[] = [];
  const first = ranked.find((c) => c.targetsHardest && c.recipe !== "tweak") ?? ranked.find((c) => c.targetsHardest);
  if (first) picked.push(first);
  for (const c of ranked) {
    if (picked.length === 3) break;
    if (picked.includes(c) || picked.some((x) => x.recipe === c.recipe && c.recipe !== "phase-slip")) continue;
    if (picked.some((x) => x.props.join() === c.props.join() && x.recipe === c.recipe)) continue;
    picked.push(c);
  }
  for (const c of ranked) {
    if (picked.length === 3) break;
    if (!picked.includes(c)) picked.push(c);
  }
  return picked;
}
