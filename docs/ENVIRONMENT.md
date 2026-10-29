# Environment

Recorded before building, as required by step 1 of the build plan. Updated when something about the machine turned out to matter.

## What was there

| Item | Finding |
|---|---|
| Repository | `~/Desktop/Experiments` was an empty git repository with no commits. The app lives in `Experiments/nextile/`, which is its own repository (`github.com/adithyaakrishna/nextile`, branch `main`). |
| Existing stack | None. Greenfield build, so the plan's stack is used as written. |
| OS | macOS 26.6 (Darwin 25.6.0), Apple Silicon (arm64) |
| Node | v22.14.0 (via nvm) |
| Package manager | pnpm 10.24.0 (no lockfile existed; `pnpm-lock.yaml` now pins every version) |
| SQLite CLI | `/usr/bin/sqlite3` is available for backups and ad-hoc queries |
| Disk | About 6.7 GB free on the system volume. Enough, but large downloads were avoided on purpose. |
| Network | Outbound HTTPS works (npm registry, Google Fonts, GitHub). |
| Public port, TLS, domain | Not available from this machine. Everything was verified on `http://localhost`. |
| Persistent disk | The local disk. SQLite lives at `DATABASE_PATH` (default `./data/nextile.db`). |

## Versions chosen

| Package | Version | Note |
|---|---|---|
| next | 16.4.3 | Current stable, App Router, Turbopack |
| react, react-dom | 19.3.1 | |
| better-sqlite3 | 13.0.3 | See below |
| tailwindcss | 4.3.3 | CSS-first config in `app/globals.css` |
| typescript | 5.9.3 | 7.x (the native port) is newer, but 5.9 is the safest match for Next's type checker |
| eslint | 9.39 with `eslint-config-next` 16.4.3 | Flat config. `next lint` no longer exists in Next 16, so `pnpm lint` calls ESLint directly |
| vitest | 5.0.5 | |
| @playwright/test | 1.63.0 | Pinned because its Chromium build (1243) was already in `~/Library/Caches/ms-playwright`, avoiding a large download. `pnpm.overrides` keeps `@axe-core/playwright` on the same `playwright-core`, otherwise the two `Page` types clash |
| jsdom | 29.x | jsdom 30 needs Node ≥ 22.22 (its `undici` uses a newer zlib API); 29 supports this machine's Node 22.14 |

## Decisions that differ from the plan, with reasons

- **better-sqlite3 uses its bundled prebuilt binary.** Version 13 ships N-API binaries for every platform inside the package. pnpm would normally also run `node-gyp rebuild`, which fails on this Mac because the Xcode license has not been accepted. `package.json` lists it under `pnpm.ignoredBuiltDependencies`, so pnpm skips the rebuild and the bundled `prebuilds/darwin-arm64.node` is used. The same applies on Linux x64/arm64.
- **`postbuild` is folded into `build`.** pnpm does not run `pre`/`post` hooks reliably across versions, so `pnpm build` runs `scripts/copy-standalone.mjs` explicitly after `next build`.
- **Scripts run with `tsx --tsconfig tsconfig.scripts.json`.** Content modules start with `import "server-only"`, which throws under plain Node. That tsconfig maps `server-only` to an empty module for scripts (the `react-server` export condition would also work, but it breaks `react-dom/server`, which `puzzle:preview` uses to render the contact sheet). Vitest aliases it the same way.
- **A local clock override for trying the game before launch.** Launch is 2026-11-16 and today is earlier, so the home page correctly says the first puzzle is not out yet. Setting `NX_NOW=2026-11-18T12:00:00Z` starts the server clock at that instant and lets it run. Like every test-only switch, it needs `PUBLIC_ORIGIN` set explicitly to a localhost address; otherwise the server refuses to start (checked in `instrumentation.ts`).
- **Browser tests run in Chromium only.** Every device project in the plan is emulated with Chromium viewports and touch settings. WebKit and Firefox were not downloaded because of disk space; the configuration has a commented project for each so they can be enabled with one line.

## Running Playwright inside a sandboxed shell

Some agent shells redirect `PLAYWRIGHT_BROWSERS_PATH` to a temporary cache. If Playwright asks to download a browser that is already installed, run with:

```sh
PLAYWRIGHT_BROWSERS_PATH="$HOME/Library/Caches/ms-playwright" pnpm test:e2e
```
