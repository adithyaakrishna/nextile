import { canonical, isCanonical, looksSame, tileKey } from "./canonical";
import { computeDifficulty, ruleWeight } from "./difficulty";
import { differingProps } from "./distractors";
import { PROPS, type Tile } from "./domain";
import { CLAIM_PATTERNS, MENTION_PATTERNS, ruleText, varyingProps } from "./explain";
import { answerOf, sequenceOf, streamsOf, tileAt, type SequenceRule } from "./generate";
import { EXPLANATION_MAX, type Puzzle } from "./puzzle";
import { isEffectivelyConstant, type PropRule } from "./rules";
import { solve } from "./solver";

export const CHECKS = [
  "record",
  "sequence",
  "answer",
  "solver",
  "distinct",
  "canonical",
  "position",
  "distractors",
  "explanation",
  "difficulty",
  "duplicate",
  "review",
  "lock",
  "schedule",
] as const;
export type CheckName = (typeof CHECKS)[number];

export interface Issue {
  check: CheckName;
  puzzleId?: string;
  message: string;
}

export interface ValidationResult {
  errors: Issue[];
  warnings: Issue[];
}

export function usesGrid(rule: SequenceRule): boolean {
  return streamsOf(rule).some((s) => !isEffectivelyConstant(s.cell));
}

function sameTile(a: Tile, b: Tile): boolean {
  return PROPS.every((p) => a[p] === b[p]);
}

function checkRecord(p: Puzzle): string[] {
  const problems: string[] = [];
  if (p.shown !== 4 && p.shown !== 5) problems.push(`shown must be 4 or 5, got ${p.shown}`);
  if (p.sequence.length !== p.shown) problems.push(`sequence has ${p.sequence.length} tiles but shown is ${p.shown}`);
  if (p.choices.length !== 4) problems.push(`expected 4 choices, got ${p.choices.length}`);
  if (!Number.isInteger(p.answerIndex) || p.answerIndex < 0 || p.answerIndex > 3) problems.push(`answerIndex must be 0–3, got ${p.answerIndex}`);
  if (!p.explanation.trim()) problems.push("explanation is empty");
  return problems;
}

function solverProblems(p: Puzzle): string[] {
  const problems: string[] = [];
  const report = solve(p.sequence);
  if (!report.readings.some((r) => r.isValid)) {
    const missing = [...new Set(report.readings.flatMap((r) => r.missing))];
    return [`no fair rule to find: nothing explains ${missing.join(", ")}`];
  }

  const predicted = p.choices.flatMap((c, i) => (report.predictedKeys.has(tileKey(c)) ? [i] : []));
  if (predicted.length !== 1 || predicted[0] !== p.answerIndex) {
    problems.push(`expected only choice ${p.answerIndex + 1} to be predicted, but predicted: [${predicted.map((i) => i + 1).join(", ") || "none"}]`);
  }

  const intended = report.readings.find((r) => r.kind === p.rule.kind);
  if (!intended?.isValid) {
    problems.push(`the intended ${p.rule.kind} reading is not evidenced (missing: ${intended?.missing.join(", ") || "reading"})`);
    return problems;
  }

  const streams = streamsOf(p.rule);
  intended.streams.forEach((hypotheses, s) => {
    const nextIndex = p.rule.kind === "parallel" || p.shown % 2 === s ? p.shown : p.shown + 1;
    const next = canonical(tileAt(p.rule, nextIndex));
    for (const prop of PROPS) {
      const intendedWeight = ruleWeight(streams[s][prop] as PropRule<unknown>);
      const options = hypotheses[prop];
      const where = streams.length > 1 ? ` in stream ${s + 1}` : "";
      if (!options.some((h) => h.next === next[prop])) {
        problems.push(`${prop}${where}: no evidenced hypothesis predicts the intended ${next[prop]}`);
      }
      const simpler = options.filter((h) => h.weight < intendedWeight && h.next !== next[prop]);
      if (simpler.length > 0) {
        problems.push(`${prop}${where}: Occam check failed, simpler ${simpler.map((h) => `${h.label}→${h.next}`).join(", ")} predicts something else`);
      }
    }
  });

  if (p.rule.kind === "interleave") {
    const parallel = report.readings.find((r) => r.kind === "parallel");
    const answerKey = tileKey(answerOf(p.rule, p.shown));
    if (parallel?.isValid && parallel.predicted.some((t) => tileKey(t) !== answerKey)) {
      problems.push("Occam check failed: a simpler parallel reading predicts a different tile");
    }
  }
  return problems;
}

function explanationProblems(p: Puzzle): string[] {
  const problems: string[] = [];
  if (p.explanation.length > EXPLANATION_MAX) problems.push(`explanation is ${p.explanation.length} characters (max ${EXPLANATION_MAX})`);
  const text = ruleText(p.explanation);
  const varying = varyingProps([...p.sequence, answerOf(p.rule, p.shown)]);
  for (const prop of PROPS) {
    if (varying.includes(prop) && !MENTION_PATTERNS[prop].test(text)) problems.push(`does not mention ${prop}, which changes`);
    if (!varying.includes(prop) && CLAIM_PATTERNS[prop].test(text)) problems.push(`talks about ${prop}, which never changes`);
  }
  return problems;
}

export function validate(p: Puzzle): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const fail = (check: CheckName, message: string) => errors.push({ check, puzzleId: p.id, message });

  const structural = checkRecord(p);
  if (structural.length > 0) {
    structural.forEach((m) => fail("record", m));
    return { errors, warnings };
  }

  const expected = sequenceOf(p.rule, p.shown);
  expected.forEach((t, i) => {
    if (!sameTile(t, p.sequence[i])) fail("sequence", `tile ${i + 1} differs from what the rule generates`);
  });

  const answer = answerOf(p.rule, p.shown);
  if (!looksSame(p.choices[p.answerIndex], answer)) fail("answer", `choice ${p.answerIndex + 1} does not match the rule's next tile`);

  solverProblems(p).forEach((m) => fail("solver", m));

  if (new Set(p.choices.map(tileKey)).size !== 4) fail("distinct", "two or more choices look identical");

  [...p.sequence, ...p.choices].forEach((t, i) => {
    if (!isCanonical(t)) fail("canonical", `${i < p.shown ? `tile ${i + 1}` : `choice ${i - p.shown + 1}`} is not in canonical form (an invisible change)`);
  });

  const tiles = [...p.sequence, ...p.choices];
  if (usesGrid(p.rule)) {
    if (tiles.some((t) => t.count !== 1)) fail("position", "position changes, so every tile must have count 1");
  } else if (tiles.some((t) => canonical(t).cell !== 4)) {
    fail("position", "a tile sits off-center but the puzzle draws no position grid");
  }

  p.choices.forEach((c, i) => {
    if (i === p.answerIndex) return;
    const diff = differingProps(c, p.choices[p.answerIndex]);
    if (diff.length < 1 || diff.length > 2) fail("distractors", `choice ${i + 1} differs from the answer in ${diff.length} properties (want 1–2)`);
  });

  explanationProblems(p).forEach((m) => fail("explanation", m));

  const computed = computeDifficulty(p.rule, p.shown);
  if (computed.tier !== p.difficulty) fail("difficulty", `labeled ${p.difficulty}, computed ${computed.tier} (${computed.points} points)`);

  return { errors, warnings };
}

export function puzzleSignature(p: Pick<Puzzle, "sequence" | "choices" | "answerIndex">): string {
  return [...p.sequence.map(tileKey), "→", tileKey(p.choices[p.answerIndex])].join(" ");
}

export function validateAll(puzzles: readonly Puzzle[]): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const ids = new Set<string>();
  const signatures = new Map<string, string>();
  for (const p of puzzles) {
    if (ids.has(p.id)) errors.push({ check: "duplicate", puzzleId: p.id, message: "puzzle id is used twice" });
    ids.add(p.id);
    const result = validate(p);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.errors.some((e) => e.check === "record")) continue;
    const sig = puzzleSignature(p);
    const other = signatures.get(sig);
    if (other) errors.push({ check: "duplicate", puzzleId: p.id, message: `same sequence and answer as ${other}` });
    else signatures.set(sig, p.id);
  }
  return { errors, warnings };
}
