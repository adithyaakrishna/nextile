#!/usr/bin/env bash
# Builds a release next to the live one, checks it, then switches the symlink and restarts.
# Usage: deploy/deploy.sh <git-ref>   (run on the server as the nextile user)
set -euo pipefail

REF="${1:-main}"
ROOT=/srv/nextile
RELEASE="$ROOT/releases/$(date +%Y%m%d%H%M%S)"

# PUBLIC_ORIGIN and TTC_URL are baked into static pages, so the build needs the same env as the server
set -a
source "$ROOT/env"
set +a

REPO_URL="${REPO_URL:-https://github.com/adithyaakrishna/nextile.git}" # a private repo needs an SSH URL and a deploy key
git clone --quiet --depth 1 --branch "$REF" "$REPO_URL" "$RELEASE"
cd "$RELEASE"
pnpm install --frozen-lockfile
# Fails if any already-published puzzle was changed; browser tests belong in CI, not on the server
pnpm lock:published
pnpm lint
pnpm typecheck
pnpm test
pnpm build

ln -sfn "$RELEASE" "$ROOT/current"
sudo systemctl restart nextile
sleep 2
curl --fail --silent --show-error http://127.0.0.1:3000/api/health
echo
echo "Deployed $REF as $RELEASE"
# Keep the five most recent releases
ls -1dt "$ROOT"/releases/* | tail -n +6 | xargs -r rm -rf
