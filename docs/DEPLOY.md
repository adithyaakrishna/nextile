# Deploying Nextile

Nextile is one Next.js process plus one SQLite file. It has no external services, so it runs on any single machine with persistent disk. Pick one of two paths:

- **[Docker](#option-a-docker)**: any host that runs containers and can mount a volume.
- **[A plain Linux machine](#option-b-a-plain-linux-machine-with-systemd-and-caddy)**: systemd keeps the server running and Caddy provides HTTPS.

## Before you start

**Requirements**

- One instance only. The database is a local SQLite file and the rate limiter lives in memory, so don't run replicas or serverless functions. A platform like Vercel's serverless functions is not a fit; a VM, a container host with a volume, or a Teeny Tiny Computer is.
- Persistent disk for the database file.
- A domain pointing at the machine, and HTTPS. The player cookie is marked `Secure` whenever `PUBLIC_ORIGIN` starts with `https://`.
- To build from source: Node 22 or newer, and pnpm 10 (`corepack enable` installs the version pinned in `package.json`).

**Configuration**

| Variable | Example | Needed at | Notes |
|---|---|---|---|
| `PUBLIC_ORIGIN` | `https://nextile.example` | build and run | Share links, metadata and preview-image URLs. Static pages bake it in at build time |
| `DATABASE_PATH` | `/srv/nextile/data/nextile.db` | run | Must be an **absolute** path on persistent disk. The standalone server runs from inside its release folder, so a relative path would be lost on the next deploy (the server logs a warning if it isn't absolute) |
| `TTC_URL` | **[Confirm]** | build | Teeny Tiny Computer link. Until it is set, attribution links point at `/about` |
| `PORT`, `HOSTNAME` | `3000`, `127.0.0.1` | run | Where the server listens. Use `0.0.0.0` inside a container |

Never set `E2E`, `NX_CONTENT` or `NX_NOW` in production. They are test-only switches, and the server refuses to start with any of them unless `PUBLIC_ORIGIN` is a localhost address.

**Check the release first**

From a checkout, on your machine or in CI:

```sh
pnpm install
pnpm lock:published   # records a hash for every puzzle whose day has arrived; commit the updated lock file
pnpm check            # lint, typecheck, unit tests, build, browser tests
```

`pnpm build` runs every puzzle publication check first and fails if any puzzle is invalid, the schedule has a gap, a published puzzle has changed, or fewer than 7 days of puzzles remain.

## Option A: Docker

Build the image. `PUBLIC_ORIGIN` and `TTC_URL` are build arguments because static pages bake them in:

```sh
docker build -t nextile \
  --build-arg PUBLIC_ORIGIN=https://nextile.example \
  --build-arg TTC_URL=https://teenytiny.example \
  .
```

Run it with a named volume for the database:

```sh
docker volume create nextile-data
docker run -d --name nextile --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  -v nextile-data:/data \
  -e PUBLIC_ORIGIN=https://nextile.example \
  nextile
```

Details:

- The image runs `node server.js` as the unprivileged `node` user, stores the database at `/data/nextile.db`, and has a built-in health check against `/api/health` (see `docker ps` or `docker inspect --format '{{.State.Health.Status}}' nextile`).
- Put HTTPS in front of it with Caddy (see [step 5 of option B](#5-https-with-caddy)), or with your host's load balancer.
- **Upgrade:** build a new image, then `docker rm -f nextile` and run it again with the same volume. Starting takes about a second. Open attempts survive the restart because their state is in SQLite, and browsers retry any finish that was in flight.
- **Back up:** run `docker exec nextile node scripts/backup-db.mjs`. This takes a consistent online backup to `/data/backups/nextile-YYYY-MM-DD.db` inside the volume. To copy it out, run `docker cp nextile:/data/backups/nextile-YYYY-MM-DD.db .`.
- **Logs:** `docker logs -f nextile`.

On container platforms such as Railway or Fly.io, run a single instance, mount a persistent volume at `/data`, set `PUBLIC_ORIGIN` as both a build argument and an environment variable, and point the platform's health check at `/api/health`.

## Option B: a plain Linux machine with systemd and Caddy

These steps assume Debian or Ubuntu. **[Confirm]** what a Teeny Tiny Computer provides (public address, TLS, persistent disk, process supervision) and skip whatever it already handles.

### 1. Prepare the machine

```sh
sudo apt-get update && sudo apt-get install -y git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs
sudo corepack enable
sudo useradd --system --create-home --home-dir /srv/nextile --shell /bin/bash nextile
sudo -u nextile mkdir -p /srv/nextile/{data,backups,releases}
```

### 2. Write the environment file

`/srv/nextile/env`, readable only by the `nextile` user:

```ini
PUBLIC_ORIGIN=https://nextile.example
DATABASE_PATH=/srv/nextile/data/nextile.db
TTC_URL=
```

```sh
sudo chown nextile:nextile /srv/nextile/env && sudo chmod 600 /srv/nextile/env
```

### 3. Build the first release

```sh
sudo -iu nextile
git clone https://github.com/adithyaakrishna/nextile.git /srv/nextile/releases/first
cd /srv/nextile/releases/first
set -a; source /srv/nextile/env; set +a
pnpm install --frozen-lockfile
pnpm build
ln -sfn /srv/nextile/releases/first /srv/nextile/current
exit
```

### 4. Run it with systemd

```sh
sudo cp /srv/nextile/current/deploy/nextile.service /etc/systemd/system/nextile.service
sudo systemctl daemon-reload
sudo systemctl enable --now nextile
curl http://127.0.0.1:3000/api/health   # {"ok":true,"database":"ok","runwayDays":…}
```

The unit runs `node .next/standalone/server.js` from `/srv/nextile/current` on `127.0.0.1:3000`, loads `/srv/nextile/env`, and restarts on failure. Logs go to the journal: `journalctl -u nextile -f`.

### 5. HTTPS with Caddy

```sh
sudo apt-get install -y caddy
sudo cp /srv/nextile/current/deploy/Caddyfile /etc/caddy/Caddyfile   # then replace nextile.example with your domain
sudo systemctl reload caddy
```

Caddy gets and renews the certificate on its own, compresses responses, and proxies to the app.

### 6. Later deploys

`deploy/deploy.sh <git-ref>` clones the ref into a new release folder, loads the env file, installs, runs `lock:published`, lint, typecheck, unit tests and the build, switches the `current` symlink, restarts the service, checks `/api/health`, and keeps the five latest releases. To roll back, point `current` at an older release and restart.

```sh
sudo -iu nextile /srv/nextile/current/deploy/deploy.sh main
```

For a private repository, set `REPO_URL` to its SSH URL in the env file and add a deploy key for the `nextile` user. Give that user passwordless `sudo systemctl restart nextile` (or restart the service yourself after the script).

### 7. Backups

`deploy/backup.sh` takes a consistent online backup with SQLite's backup API and keeps 14 days. Schedule it with `crontab -e` as the `nextile` user:

```cron
15 3 * * * /srv/nextile/current/deploy/backup.sh
```

To restore: run `sudo systemctl stop nextile`, copy a backup over `DATABASE_PATH`, then run `sudo systemctl start nextile`.

## Operating

- **Uptime:** poll `GET /api/health` every minute. It returns `503` if the database is unreachable or no puzzle is scheduled for today, and reports `runwayDays` so you can alert well before puzzles run out (validation warns under 14 days and fails the build under 7).
- **New puzzles:** author, validate and schedule them in the repository (see [PUZZLE-AUTHORING.md](PUZZLE-AUTHORING.md)), commit, and deploy. Published puzzles are frozen by `published.lock.json`; run `pnpm lock:published` and commit the result at least once a day, or before each deploy.
- **Metrics:** on the server, `cd /srv/nextile/current && set -a && source ../env && set +a && pnpm report` prints the last 14 days straight from SQLite.
- **Logs:** structured JSON lines to stdout (journal or `docker logs`). IP addresses are never written to disk; they live only in the rate limiter's one-minute memory window.
- **Scale:** one process handles far more than a daily puzzle needs. If you outgrow it, move the database and rate limiter to shared services before adding instances.
