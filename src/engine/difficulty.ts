import { PROPS, type Prop } from "./domain";
import { ruleOf, streamsOf, type PropRules, type SequenceRule } from "./generate";
import { isEffectivelyConstant, minimalPeriod, periodOf, valueAt, type PropRule } from "./rules";
import { BOUNCE_WEIGHT, CYCLE_WEIGHTS, STEP_WEIGHT, STUTTER_WEIGHT } from "./solver";

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
export const DIFFICULTY_LEVELS: Record<Difficulty, 1 | 2 | 3> = { easy: 1, medium: 2, hard: 3 };

export const CARRY_WEIGHT = 3;
export const LOCKSTEP_EXTRA = 0.5;
export const MIXED_PERIODS_BONUS = 1;
export const INTERLEAVE_BONUS = 2;
export const FIVE_SHOWN_BONUS = 0.5;

export interface Motion {
  props: Prop[];
  period: number;
  points: number;
  isCarry: boolean;
}

export interface DifficultyReport {
  points: number;
  tier: Difficulty;
  streams: Motion[][];
}

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && (DIFFICULTIES as readonly string[]).includes(value);
}

export function tierFor(points: number): Difficulty {
  if (points <= 2) return "easy";
  if (points <= 4) return "medium";
  return "hard";
}

// The weight the solver would give the intended rule for one property
export function ruleWeight(rule: PropRule<unknown>): number {
  if (isEffectivelyConstant(rule)) return 0;
  switch (rule.kind) {
    case "constant":
      return 0;
    case "cycle":
      return CYCLE_WEIGHTS[minimalPeriod(rule.values)] ?? 3;
    case "step":
      return STEP_WEIGHT;
    case "bounce":
      return BOUNCE_WEIGHT;
    case "stutter":
      return STUTTER_WEIGHT;
    default: {
      const unreachable: never = rule;
      throw new Error(`Unknown rule ${JSON.stringify(unreachable)}`);
    }
  }
}

function areInLockstep(a: PropRule<unknown>, b: PropRule<unknown>): boolean {
  const period = periodOf(a);
  if (period !== periodOf(b)) return false;
  const as = Array.from({ length: period }, (_, i) => valueAt(a, i));
  const bs = Array.from({ length: period }, (_, i) => valueAt(b, i));
  const pairs = new Set(as.map((v, i) => `${v}|${bs[i]}`));
  return pairs.size === new Set(as).size && pairs.size === new Set(bs).size;
}

export function motionsOf(props: PropRules): Motion[] {
  const moving = PROPS.filter((p) => !isEffectivelyConstant(ruleOf(props, p)));
  const groups: Prop[][] = [];
  for (const p of moving) {
    const group = groups.find((g) => areInLockstep(ruleOf(props, g[0]), ruleOf(props, p)));
    if (group) group.push(p);
    else groups.push([p]);
  }
  const periods = groups.map((g) => periodOf(ruleOf(props, g[0])));
  return groups.map((group, gi) => {
    const isCarry = group.some((p) => {
      const rule = ruleOf(props, p);
      return rule.kind === "stutter" && periods.some((period, pi) => pi !== gi && period === rule.hold);
    });
    const base = Math.max(...group.map((p) => ruleWeight(ruleOf(props, p))), isCarry ? CARRY_WEIGHT : 0);
    return { props: group, period: periods[gi], points: base + LOCKSTEP_EXTRA * (group.length - 1), isCarry };
  });
}

export function computeDifficulty(rule: SequenceRule, shown: number): DifficultyReport {
  const streams = streamsOf(rule).map(motionsOf);
  let points = 0;
  for (const motions of streams) {
    points += motions.reduce((sum, m) => sum + m.points, 0);
    if (new Set(motions.map((m) => m.period)).size >= 2) points += MIXED_PERIODS_BONUS;
  }
  if (rule.kind === "interleave") points += INTERLEAVE_BONUS;
  if (shown === 5) points += FIVE_SHOWN_BONUS;
  return { points, tier: tierFor(points), streams };
}
