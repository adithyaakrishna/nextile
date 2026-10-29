// The standalone server needs static assets and the OG font copied next to it after `next build`
import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next/standalone");
if (!existsSync(standalone)) {
  console.error("No .next/standalone output found. Is output: 'standalone' set in next.config.ts?");
  process.exit(1);
}

const copies = [
  [".next/static", ".next/standalone/.next/static"],
  ["public", ".next/standalone/public"],
  ["assets", ".next/standalone/assets"],
];
for (const [from, to] of copies) {
  if (!existsSync(join(root, from))) continue;
  cpSync(join(root, from), join(root, to), { recursive: true });
  console.log(`copied ${from} → ${to}`);
}
