import { canonical, tileKey } from "./canonical";
import { CYCLIC_TRACKS, PROPS, TRACKS, TRACKS_BY_PROP, type Prop, type PropValue, type Tile } from "./domain";
import { bounceIndex, mod } from "./rules";

export type HypothesisKind = "constant" | "cycle" | "step" | "bounce" | "stutter";

export interface Hypothesis {
  kind: HypothesisKind;
  label: string;
  weight: number;
  next: PropValue;
  step?: number; // signed track step, used as evidence for a mirrored stream
}

export const CYCLE_WEIGHTS: Record<number, number> = { 2: 1, 3: 1.5, 4: 2 };
export const STEP_WEIGHT = 1.5;
export const BOUNCE_WEIGHT = 2.5;
export const STUTTER_WEIGHT = 2.5;

const CYCLE_PERIODS = [2, 3, 4] as const;
const STEP_SIZES = [-2, -1, 1, 2] as const;
const STUTTER_HOLDS = [2, 3, 4] as const;

export type PropHypotheses = Record<Prop, Hypothesis[]>;

export interface Reading {
  kind: "parallel" | "interleave";
  streams: PropHypotheses[]; // one entry for parallel, two (even, odd) for interleave
  answerStream: number;
  missing: Prop[]; // properties with no evidenced hypothesis, per any stream
  isValid: boolean;
  predicted: Tile[]; // canonical, deduplicated
}

export interface SolverReport {
  readings: Reading[];
  predictedKeys: Set<string>;
}

function hasPeriod(values: readonly PropValue[], p: number): boolean {
  for (let i = p; i < values.length; i++) if (values[i] !== values[i - p]) return false;
  return true;
}

function smallestPeriod(values: readonly PropValue[]): number {
  for (let p = 1; p < values.length; p++) if (hasPeriod(values, p)) return p;
  return values.length;
}

// Steps that land on the same track position are one step: keep the smallest, so mirror evidence needs the same signed step
function isCanonicalStep(by: number, length: number): boolean {
  return !STEP_SIZES.some(
    (other) => other !== by && mod(other, length) === mod(by, length) && (Math.abs(other) < Math.abs(by) || (Math.abs(other) === Math.abs(by) && other > by)),
  );
}

function hasTurnaround(values: readonly PropValue[]): boolean {
  for (let i = 1; i < values.length - 1; i++) {
    if (values[i - 1] === values[i + 1] && values[i] !== values[i - 1]) return true;
  }
  return false;
}

interface Run {
  value: PropValue;
  length: number;
}

function toRuns(values: readonly PropValue[]): Run[] {
  const runs: Run[] = [];
  for (const value of values) {
    const last = runs[runs.length - 1];
    if (last && last.value === value) last.length++;
    else runs.push({ value, length: 1 });
  }
  return runs;
}

function permutations<T>(items: readonly T[], length: number): T[][] {
  if (length === 0) return [[]];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)], length - 1).map((rest) => [item, ...rest]),
  );
}

function bounceSegments(prop: Prop, values: readonly PropValue[]): PropValue[][] {
  const tracks = TRACKS_BY_PROP[prop];
  if (tracks.length === 0) {
    const seen = [...new Set(values)];
    const segments: PropValue[][] = [];
    for (let m = 3; m <= seen.length; m++) segments.push(...permutations(seen, m));
    return segments;
  }
  const segments: PropValue[][] = [];
  for (const name of tracks) {
    const track = TRACKS[name] as readonly PropValue[];
    const length = track.length;
    for (let m = 3; m <= length; m++) {
      const starts = CYCLIC_TRACKS[name] ? length : length - m + 1;
      for (let s = 0; s < starts; s++) segments.push(Array.from({ length: m }, (_, j) => track[(s + j) % length]));
    }
  }
  return segments;
}

// Values that could start the next run once the current run is complete
function nextRunValues(prop: Prop, runValues: readonly PropValue[]): PropValue[] {
  const r = runValues.length;
  const out = new Set<PropValue>();
  if (new Set(runValues).size === r) out.add(runValues[0]); // wrap back to the first value
  for (const p of CYCLE_PERIODS) {
    if (r >= p + 1 && hasPeriod(runValues, p) && smallestPeriod(runValues) === p) out.add(runValues[r - p]);
  }
  for (const name of TRACKS_BY_PROP[prop]) {
    const track = TRACKS[name] as readonly PropValue[];
    const idx = runValues.map((v) => track.indexOf(v));
    if (r < 2 || idx.some((i) => i < 0)) continue;
    const diffs = idx.slice(1).map((x, i) => mod(x - idx[i], track.length));
    if (diffs.every((d) => d === diffs[0]) && diffs[0] !== 0) out.add(track[mod(idx[r - 1] + diffs[0], track.length)]);
  }
  return [...out];
}

export function hypothesesFor(
  prop: Prop,
  values: readonly PropValue[],
  mirrorSteps: ReadonlySet<number> = new Set(),
): Hypothesis[] {
  const n = values.length;
  if (n === 0) return [];
  if (values.every((v) => v === values[0])) {
    return [{ kind: "constant", label: "constant", weight: 0, next: values[0] }];
  }

  const out: Hypothesis[] = [];
  const period = smallestPeriod(values);
  for (const p of CYCLE_PERIODS) {
    if (n >= p + 1 && period === p) {
      out.push({ kind: "cycle", label: `cycle(${p})`, weight: CYCLE_WEIGHTS[p], next: values[n - p] });
    }
  }

  for (const name of TRACKS_BY_PROP[prop]) {
    const track = TRACKS[name] as readonly PropValue[];
    const length = track.length;
    const idx = values.map((v) => track.indexOf(v));
    if (idx.some((i) => i < 0)) continue;
    const diffs = idx.slice(1).map((x, i) => mod(x - idx[i], length));
    for (const by of STEP_SIZES) {
      if (mod(by, length) === 0 || !isCanonicalStep(by, length) || !diffs.every((d) => d === mod(by, length))) continue;
      const isEvidenced = diffs.length >= 2 || (diffs.length === 1 && mirrorSteps.has(by));
      if (!isEvidenced) continue;
      out.push({
        kind: "step",
        label: `step(${by > 0 ? "+" : ""}${by} on ${name})`,
        weight: STEP_WEIGHT,
        next: track[mod(idx[n - 1] + by, length)],
        step: by,
      });
    }
  }

  if (hasTurnaround(values)) {
    for (const segment of bounceSegments(prop, values)) {
      const m = segment.length;
      for (let k = 0; k < 2 * m - 2; k++) {
        if (!values.every((v, i) => segment[bounceIndex(m, k + i)] === v)) continue;
        out.push({
          kind: "bounce",
          label: `bounce(${segment.join(",")})`,
          weight: BOUNCE_WEIGHT,
          next: segment[bounceIndex(m, k + n)],
        });
      }
    }
  }

  const runs = toRuns(values);
  if (runs.length >= 2) {
    const first = runs[0];
    const last = runs[runs.length - 1];
    const middle = runs.slice(1, -1);
    for (const hold of STUTTER_HOLDS) {
      if (first.length > hold || last.length > hold || middle.some((r) => r.length !== hold)) continue;
      if (!runs.slice(0, -1).some((r) => r.length === hold)) continue;
      const nexts = last.length < hold ? [last.value] : nextRunValues(prop, runs.map((r) => r.value));
      for (const next of nexts) out.push({ kind: "stutter", label: `stutter(${hold})`, weight: STUTTER_WEIGHT, next });
    }
  }

  return dedupe(out);
}

function dedupe(hypotheses: Hypothesis[]): Hypothesis[] {
  const seen = new Set<string>();
  return hypotheses.filter((h) => {
    const key = `${h.label}→${h.next}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function valuesOf(tiles: readonly Tile[], prop: Prop): PropValue[] {
  return tiles.map((t) => t[prop]);
}

function streamHypotheses(tiles: readonly Tile[], mirrorSteps: ReadonlySet<number> = new Set()): PropHypotheses {
  return Object.fromEntries(PROPS.map((p) => [p, hypothesesFor(p, valuesOf(tiles, p), mirrorSteps)])) as PropHypotheses;
}

function fullyEvidencedSteps(h: PropHypotheses): Set<number> {
  const steps = new Set<number>();
  for (const p of PROPS) for (const x of h[p]) if (x.kind === "step" && x.step !== undefined) steps.add(x.step);
  return steps;
}

function predictTiles(h: PropHypotheses): Tile[] {
  let partials: Partial<Tile>[] = [{}];
  for (const p of PROPS) {
    const nexts = [...new Set(h[p].map((x) => x.next))];
    partials = partials.flatMap((partial) => nexts.map((v) => ({ ...partial, [p]: v })));
  }
  const byKey = new Map<string, Tile>();
  for (const t of partials as Tile[]) byKey.set(tileKey(t), canonical(t));
  return [...byKey.values()];
}

function missingProps(streams: readonly PropHypotheses[]): Prop[] {
  return PROPS.filter((p) => streams.some((s) => s[p].length === 0));
}

export function parallelReading(sequence: readonly Tile[]): Reading {
  const tiles = sequence.map(canonical);
  const stream = streamHypotheses(tiles);
  const missing = missingProps([stream]);
  return {
    kind: "parallel",
    streams: [stream],
    answerStream: 0,
    missing,
    isValid: missing.length === 0,
    predicted: missing.length === 0 ? predictTiles(stream) : [],
  };
}

export function interleaveReading(sequence: readonly Tile[]): Reading | null {
  if (sequence.length < 4) return null;
  const tiles = sequence.map(canonical);
  const even = tiles.filter((_, i) => i % 2 === 0);
  const odd = tiles.filter((_, i) => i % 2 === 1);
  const evenSteps = fullyEvidencedSteps(streamHypotheses(even));
  const oddSteps = fullyEvidencedSteps(streamHypotheses(odd));
  const streams = [streamHypotheses(even, oddSteps), streamHypotheses(odd, evenSteps)];
  const answerStream = sequence.length % 2;
  const missing = missingProps(streams);
  return {
    kind: "interleave",
    streams,
    answerStream,
    missing,
    isValid: missing.length === 0,
    predicted: missing.length === 0 ? predictTiles(streams[answerStream]) : [],
  };
}

export function solve(sequence: readonly Tile[]): SolverReport {
  const readings = [parallelReading(sequence), interleaveReading(sequence)].filter((r): r is Reading => r !== null);
  const predictedKeys = new Set(readings.flatMap((r) => r.predicted.map(tileKey)));
  return { readings, predictedKeys };
}
