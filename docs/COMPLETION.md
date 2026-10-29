# Completion report

Facts only. Anything not verified is marked as such.

## 1. What was built

Nextile (built from the "ONE MINUTE" build plan and renamed afterwards), the daily sixty-second visual logic puzzle, as a single Next.js 16 app with its own backend:

- **Game:** landing, a server-timed sixty-second attempt (clock and sixty-segment fuse, final-ten-seconds hazard state), one locked answer, stamp, results with score, the rule and the completed sequence, stats "On this device", share, and the next-puzzle countdown. Keyboard play (Enter or Space starts, 1–4 answer), sound (off by default, synthesized), light and night mats, and color assist.
- **Puzzle engine:** tile model, rules as data, visual canonicalization, a solver that searches a broader grammar than authors use (cycles, steps on seven tracks, bounces, stutters, interleaved streams with the parallel-streams exception), computed difficulty, distractor recipes, drafted explanations, plain-English tile descriptions, and all twelve publication checks plus schedule checks.
- **Content:** 65 puzzles (the plan's 30 seeds and 35 more across every family: 20 easy, 35 medium, 10 hard), all passing every check, scheduled for 65 consecutive days from launch (16 November 2026 to 19 January 2027) in the weekly difficulty rhythm with balanced answer positions. Plus an unscheduled tutorial puzzle for the landing example and the untimed practice on How to play.
- **Server:** SQLite (WAL, migrations by `user_version`), an anonymous HttpOnly player cookie, start, resume and idempotent finish with first-write-wins, adjudication with a 2 s latency credit and 2.5 s grace, lazy timeout finalization, history, the archive API, an in-memory rate limiter, a first-party analytics sink with server-emitted outcome events, and a health check.
- **Pages:** `/`, `/how-to-play`, `/archive`, `/archive/[day]`, `/about`, `/s/[shareId]` with per-result Open Graph image, a static home Open Graph image, and `/dev/puzzles` (a contact sheet with answers that returns 404 in production).
- **Tooling:** `puzzle:build`, `puzzle:preview` (ASCII plus an SVG contact sheet rendered from the same React tile component), `validate:puzzles`, `schedule:extend`, `lock:published`, and `report` (the brief's metrics from SQLite).
- **Deployment:** a Dockerfile (built and run locally, see below), a systemd unit, Caddyfile, nightly backup and deploy scripts in `deploy/`, `.env.example`, and the step-by-step guide in `docs/DEPLOY.md`.

## 2. Key architectural decisions and deviations from the plan

The plan's architecture is followed as written. These are the places it was adapted, with reasons.

| Deviation | Reason |
|---|---|
| Renamed from ONE MINUTE to Nextile, with a new mark: a paper tile holding the stopwatch dial | Requested after the build. The old wordmark drew the stopwatch as the O of ONE, which no longer exists. Local storage key, cookie (`nx_pid`), UTM tags (`utm_source=nextile`) and test switches (`NX_NOW`, `NX_CONTENT`) were renamed to match |
| The app has its own repository, `adithyaakrishna/nextile` (default branch `main`) | Requested; it sits in `Experiments/nextile/` locally |
| `better-sqlite3` uses its bundled prebuilt binary (`pnpm.ignoredBuiltDependencies`) | Compiling from source fails here because the Xcode license isn't accepted; version 13 ships binaries for every platform |
| TypeScript 5.9, Playwright 1.63 (with a `playwright-core` override), jsdom 29 | Compatibility with Next's type checker, the cached Chromium build, and Node 22.14. Details in `docs/ENVIRONMENT.md` |
| Test clock at `/api/test/clock`, not `/api/__test/clock` | Next.js treats `_`-prefixed folders as private and doesn't route them. Still refused unless `E2E=1` and `PUBLIC_ORIGIN` is localhost |
| Added `NX_NOW` (localhost only) | Launch is after today, so the game correctly shows "not launched"; this lets anyone try it locally |
| Test-only switches (`E2E`, `NX_CONTENT`, `NX_NOW`) also stop the server at startup unless `PUBLIC_ORIGIN` is explicitly localhost; an unset value doesn't count | The plan says they are "refused at startup"; an unset origin defaulting to localhost would have left them open |
| POST routes refuse cross-site requests (`Sec-Fetch-Site`, then `Origin`) | Otherwise another site could auto-submit a form to `/api/attempts`, replace the player's cookie and break their streak |
| A day's solution stays locked until 62.5 s after the day ends, unless this player has finished it | Attempts started just before midnight can be scored until then; the archive must not reveal the answer in that window |
| An attempt started before midnight can be resumed after it | The plan's rule that an attempt belongs to its start day, applied to refreshes too |
| `schedule.ts` is data only; `resolveToday` and `runwayDays` live in `src/content/catalog.ts` | So browser tests can swap in fixture content (`NX_CONTENT=fixture`) at run time |
| `Result` also carries `grid` and `difficulty` | The results and archive screens need them to draw tiles correctly |
| Feedback and results are one screen | When the attempt ends, the spoiler-free result card (with the stamp) appears on top and the board moves into the rule panel with its end states and the answer dropped into the slot |
| Solver: two extra position tracks (`ring`, `middleColumn`); bounces may extend past seen values on ordered tracks; a completed stutter run predicts every plausible next run value | A broader hypothesis space makes the uniqueness proof stricter |
| Occam check fails only when a simpler hypothesis predicts a *different* value | The literal reading would reject the plan's own seed #25 (a simpler cycle(4) predicts the same count as the intended bounce) |
| Difficulty: "in lockstep" means a one-to-one value mapping over a shared period; the mixed-periods bonus is applied per stream; cycle(4) weighs 2 | These definitions reproduce every point value in the plan's seed table (unit-tested) |
| A seventh distractor recipe, "decoy" (change a property that never moves), ranked last | Puzzles where only one three-valued property changes have only two other values for it, so a fourth choice is otherwise impossible |
| Answer-position balance and "never three days running" are validation errors | They were warnings-or-unspecified in the plan; the scheduler always satisfies them |
| The archive shows this browser's results from the server (by cookie), not merged with local storage | Server-rendered and authoritative; only a browser that blocks cookies would differ |
| Below 360 px, a six-slot rail wraps (as planned) and the answer cards shrink to 108 px; the header's challenge number is hidden | The plan's sizes don't fit 320×568 with two rail rows; this keeps the whole game in the first viewport, as the plan also requires |
| Tiles are dealt with a hidden-then-snap animation instead of a fade | Design principle 5: things snap, nothing fades up |
| No Teeny Tiny Computer attribution (section 17 of the plan): no footer line, results line, share-text line, About section, outbound link, `attribution_clicked` event or `TTC_URL` | Removed on request after the build. The About page also drops "solved by a person before it's published", because puzzles have so far been reviewed by an AI agent only |
| `postbuild` is part of `build` | pnpm does not reliably run `post` hooks |
| Not built: optional "How everyone did today" (8.7) | Marked optional in the plan and first on the roadmap |

## 3. URLs

| URL | What | Verified |
|---|---|---|
| `http://localhost:3000` | `pnpm dev` | Yes (run on port 3100 during the build, with `NX_NOW`) |
| `http://localhost:3300` | Production standalone server (`node .next/standalone/server.js`) with real content | Yes: `/`, `/about`, `/api/today`, `/api/health` (200, runway 65), `/opengraph-image` (200 PNG), `/dev/puzzles` (404), test clock refused (404) |
| `http://localhost:3400` | The Docker image (`docker build` then `docker run` with a volume) | Yes: pages and APIs 200, health check "healthy", runs as the `node` user, database on the volume, cross-site POST refused (403), online backup written, test switch refused at startup |
| `http://localhost:3200` | Production standalone server under the browser tests, fixture content | Yes, by 57 passing tests |
| Preview or production deployment | — | **Not deployed.** This machine has no public address, domain or TLS |

## 4. Commands

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Run locally | `pnpm dev`, then open `http://localhost:3000` |
| Try it before launch day | `PUBLIC_ORIGIN=http://localhost:3000 NX_NOW=2026-11-18T12:00:00Z pnpm dev` |
| Unit tests | `pnpm test` (127 tests in 16 files, passing) |
| Browser tests | `pnpm test:e2e` (57 tests, passing; builds first if needed) |
| Everything, as CI runs it | `pnpm check` (lint, typecheck, unit tests, build, browser tests: passing) |
| Validate puzzles | `pnpm validate:puzzles` |
| Author a puzzle | `pnpm puzzle:build p-0066`, `pnpm puzzle:preview p-0066` (see `docs/PUZZLE-AUTHORING.md`) |
| Extend the schedule | `pnpm schedule:extend` |
| Lock published puzzles | `pnpm lock:published` (run daily or on each deploy) |
| Production build and run | `pnpm build && pnpm start` |
| Metrics | `pnpm report --days=14` |

In a sandboxed shell that redirects Playwright's browser cache, prefix browser tests with `PLAYWRIGHT_BROWSERS_PATH="$HOME/Library/Caches/ms-playwright"`.

## 5. Remaining limitations

**Needs a person or a fact this build couldn't know**

- **Human review.** Every puzzle has `review: { by: "ai-agent" }`. An AI agent reviewed each sequence, choice set and explanation, and the solver proves uniqueness, but no person has solved them cold with a timer. `pnpm validate:puzzles` lists all 65. Replace each `review` with a person's initials once they have.
- **[Confirm] launch date and domain.** `LAUNCH_DAY` in `src/config.ts` (2026-11-16) and `PUBLIC_ORIGIN`.
- **Deployment.** Not done: no public address, TLS or target machine was available. The Docker image was built and run locally; the systemd and Caddy path in `docs/DEPLOY.md` has not been run on a real Linux server.
- **Analytics provider.** Events go only to the first-party `events` table. Nothing is forwarded to PostHog, Plausible or similar; the place to add an adapter is `send()` in `src/analytics/client.ts` (or a server-side forwarder in `src/server/events.ts`).

**Measured and not met**

- **First-load JavaScript for `/` is 158.7 KB gzipped for modern browsers**, against a 130 KB budget (plus 38.7 KB of polyfills that only legacy browsers download). The Next.js 16 and React 19 runtime alone is about 133 KB; the game's own code is about 26 KB. The validator and solver are confirmed absent from client bundles. Meeting the budget would mean a lighter framework.

**Not verified here**

- WebKit and Firefox (every device project ran in Chromium; WebKit and Firefox projects are commented out in `playwright.config.ts`).
- VoiceOver and NVDA passes. axe reports zero violations on landing, playing, results, dark theme, How to play, About, Archive, an archive day and a share page, and the semantics follow section 13, but no screen reader was run.
- Native share sheets on iOS and Android, and link previews in iMessage, WhatsApp, Slack and X. The preview images themselves render (200 PNG, checked by test).
- LCP, CLS and INP on a mid-range phone over 4G.

**Known behavior**

- One attempt per browser, not per person: clearing cookies and site data allows another attempt. No leaderboard for that reason.
- An answer that can't reach the server within 2.5 s of the deadline is scored as a timeout, by design, so holding an answer back can never help.
- Progress doesn't sync across devices, and today's puzzle needs a connection.

## 6. Screenshots and recording

All produced by `tests/e2e/screenshots.spec.ts` against the production build, on an iPhone 13-sized phone (390×844) and a 1366×768 laptop:

- `artifacts/screenshots/{phone,desktop}-01-landing.png`
- `artifacts/screenshots/{phone,desktop}-02-playing.png`
- `artifacts/screenshots/{phone,desktop}-03-correct.png`
- `artifacts/screenshots/{phone,desktop}-04-results-full.png`
- `artifacts/screenshots/{phone,desktop}-05-share-page.png`
- `artifacts/screenshots/{phone,desktop}-06-archive.png`
- `artifacts/screenshots/{phone,desktop}-07-incorrect.png`
- `artifacts/screenshots/{phone,desktop}-08-final-ten-seconds.png`
- `artifacts/screenshots/{phone,desktop}-09-timeout.png`
- `artifacts/screenshots/{phone,desktop}-10-dark-color-assist.png` (six-slot puzzle, night mat, color letters)
- `artifacts/recording-correct-answer.webm` (phone: landing to correct answer, results, share page and archive)
