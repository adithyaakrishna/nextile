// Deliberately free of "server-only" so instrumentation.ts can check the switches at startup
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export const TEST_SWITCHES = ["E2E", "NX_CONTENT", "NX_NOW"] as const;

type Env = Record<string, string | undefined>;

// Unset counts as not local: test switches need an explicit localhost PUBLIC_ORIGIN
export function isLocalOrigin(raw: string | undefined = process.env.PUBLIC_ORIGIN): boolean {
  if (!raw) return false;
  try {
    return LOCAL_HOSTS.has(new URL(raw).hostname);
  } catch {
    return false;
  }
}

export function activeTestSwitches(env: Env = process.env): string[] {
  return TEST_SWITCHES.filter((name) => Boolean(env[name]));
}

export function assertTestSwitchesAllowed(env: Env = process.env): void {
  const active = activeTestSwitches(env);
  if (active.length > 0 && !isLocalOrigin(env.PUBLIC_ORIGIN)) {
    throw new Error(`${active.join(", ")} set but PUBLIC_ORIGIN is not a localhost address; refusing to start.`);
  }
}
