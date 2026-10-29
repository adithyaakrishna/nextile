export type PropRule<T> =
  | { kind: "constant"; value: T }
  | { kind: "cycle"; values: readonly T[] } // a b c a b c …
  | { kind: "step"; track: readonly T[]; start: T; by: number } // walk along an ordered track, wrapping
  | { kind: "bounce"; values: readonly T[] } // a b c b a b c …
  | { kind: "stutter"; values: readonly T[]; hold: number }; // a a b b c c … (hold = 2)

export type RuleKind = PropRule<unknown>["kind"];

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function bounceIndex(length: number, i: number): number {
  if (length < 2) return 0;
  const k = mod(i, 2 * length - 2);
  return k < length ? k : 2 * length - 2 - k;
}

export function valueAt<T>(rule: PropRule<T>, i: number): T {
  switch (rule.kind) {
    case "constant":
      return rule.value;
    case "cycle":
      return rule.values[mod(i, rule.values.length)];
    case "step": {
      const n = rule.track.length;
      const s = rule.track.indexOf(rule.start);
      return rule.track[mod(s + rule.by * i, n)];
    }
    case "bounce":
      return rule.values[bounceIndex(rule.values.length, i)];
    case "stutter":
      return rule.values[mod(Math.floor(i / rule.hold), rule.values.length)];
    default: {
      const unreachable: never = rule;
      throw new Error(`Unknown rule ${JSON.stringify(unreachable)}`);
    }
  }
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

// Smallest p such that values repeat every p items (1 for a constant list)
export function minimalPeriod<T>(values: readonly T[]): number {
  const n = values.length;
  for (let p = 1; p < n; p++) {
    if (n % p !== 0) continue;
    if (values.every((v, i) => v === values[i % p])) return p;
  }
  return n;
}

// How many positions before the rule's output repeats
export function periodOf<T>(rule: PropRule<T>): number {
  switch (rule.kind) {
    case "constant":
      return 1;
    case "cycle":
      return minimalPeriod(rule.values);
    case "step": {
      const n = rule.track.length;
      const by = mod(rule.by, n);
      return by === 0 ? 1 : n / gcd(n, by);
    }
    case "bounce":
      return rule.values.length < 2 ? 1 : minimalPeriod(Array.from({ length: 2 * rule.values.length - 2 }, (_, i) => valueAt(rule, i)));
    case "stutter": {
      const p = minimalPeriod(rule.values);
      return p === 1 ? 1 : p * rule.hold;
    }
    default: {
      const unreachable: never = rule;
      throw new Error(`Unknown rule ${JSON.stringify(unreachable)}`);
    }
  }
}

export function isEffectivelyConstant<T>(rule: PropRule<T>): boolean {
  return periodOf(rule) === 1;
}
