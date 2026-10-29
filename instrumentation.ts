import { assertTestSwitchesAllowed } from "@/server/switches";

// POSIX or Windows absolute path; written by hand because this file is also compiled for the Edge runtime
const ABSOLUTE_PATH = /^(\/|[A-Za-z]:[\\/])/;

// Runs once when the server starts: test-only switches stop it unless it is served from localhost
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  assertTestSwitchesAllowed();
  const path = process.env.DATABASE_PATH;
  // The standalone server runs from inside its release folder, so a relative path would not survive a redeploy
  if (process.env.NODE_ENV === "production" && (!path || !ABSOLUTE_PATH.test(path))) {
    console.warn(JSON.stringify({ level: "warn", msg: "DATABASE_PATH should be an absolute path on persistent disk", DATABASE_PATH: path ?? null }));
  }
}
