import "server-only";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";

// Ordered and append-only; each entry runs once, tracked with PRAGMA user_version
export const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE IF NOT EXISTS attempts (
    id                TEXT PRIMARY KEY,
    share_id          TEXT NOT NULL UNIQUE,
    player_id         TEXT NOT NULL,
    day               TEXT NOT NULL,
    puzzle_id         TEXT NOT NULL,
    started_at        INTEGER NOT NULL,
    finished_at       INTEGER,
    choice            INTEGER CHECK (choice BETWEEN 0 AND 3),
    outcome           TEXT CHECK (outcome IN ('correct', 'incorrect', 'timeout')),
    client_elapsed_ms INTEGER,
    elapsed_ms        INTEGER,
    score             INTEGER CHECK (score BETWEEN 0 AND 100),
    UNIQUE (player_id, day)
  );
  CREATE INDEX IF NOT EXISTS attempts_day_outcome ON attempts (day, outcome);

  CREATE TABLE IF NOT EXISTS events (
    id        INTEGER PRIMARY KEY,
    at        INTEGER NOT NULL,
    name      TEXT NOT NULL,
    player_id TEXT,
    props     TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS events_name_at ON events (name, at);
  `,
];

// The database lives outside the app bundle, so the bundler must not trace this path
export function databasePath(): string {
  const path = process.env.DATABASE_PATH ?? "./data/nextile.db";
  return path === ":memory:" ? path : resolve(/*turbopackIgnore: true*/ path);
}

export function migrate(db: Database.Database): void {
  const current = db.pragma("user_version", { simple: true }) as number;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}

export function openDatabase(path: string): Database.Database {
  if (path !== ":memory:") mkdirSync(/*turbopackIgnore: true*/ dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 3000");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

const globalDb = globalThis as typeof globalThis & { __nxDb?: Database.Database };

// One connection per process, shared by every route bundle
export function db(): Database.Database {
  globalDb.__nxDb ??= openDatabase(databasePath());
  return globalDb.__nxDb;
}
