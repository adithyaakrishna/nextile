// Starts the production standalone server for browser tests, building first if needed, on a fresh database
import { spawn, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const server = join(root, ".next/standalone/server.js");

if (!existsSync(server) || process.env.E2E_REBUILD === "1") {
  const build = spawnSync("pnpm", ["build"], { stdio: "inherit", env: process.env });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const db = process.env.DATABASE_PATH;
if (db) rmSync(dirname(db), { recursive: true, force: true });

const child = spawn(process.execPath, [server], { stdio: "inherit", env: process.env });
const stop = () => child.kill("SIGTERM");
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
child.on("exit", (code) => process.exit(code ?? 0));
