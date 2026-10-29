// Usage: node scripts/backup-db.mjs [destination.db]
// Takes a consistent online backup of the SQLite database (safe while the server is running, unlike copying the file).
import { mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

// A full checkout resolves it normally; the standalone server keeps it under a hashed name, so fall back to pnpm's layout.
// The location is only known at run time, which is why this is a require rather than a top-level import.
function loadSqlite() {
  try {
    return require("better-sqlite3");
  } catch {
    const store = resolve(dirname(fileURLToPath(import.meta.url)), "../node_modules/.pnpm");
    const dir = readdirSync(store).find((d) => d.startsWith("better-sqlite3@"));
    if (!dir) throw new Error(`better-sqlite3 not found under ${store}`);
    return require(join(store, dir, "node_modules/better-sqlite3"));
  }
}

const Database = loadSqlite();
const source = resolve(process.env.DATABASE_PATH ?? "./data/nextile.db");
const stamp = new Date().toISOString().slice(0, 10);
const destination = resolve(process.argv[2] ?? `${dirname(source)}/backups/nextile-${stamp}.db`);

mkdirSync(dirname(destination), { recursive: true });
const db = new Database(source, { readonly: true, fileMustExist: true });
await db.backup(destination);
db.close();
console.log(`Backed up ${source} → ${destination}`);
