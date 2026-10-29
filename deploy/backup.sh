#!/usr/bin/env bash
# Nightly SQLite backup, keeping 14 days. Run from cron, e.g. `15 3 * * * /srv/nextile/current/deploy/backup.sh`.
# Restore is a file copy: stop the service, copy a backup over DATABASE_PATH, start the service.
set -euo pipefail

set -a
source /srv/nextile/env
set +a
BACKUP_DIR="${BACKUP_DIR:-/srv/nextile/backups}"
cd /srv/nextile/current
node scripts/backup-db.mjs "$BACKUP_DIR/nextile-$(date +%F).db"
find "$BACKUP_DIR" -name 'nextile-*.db' -mtime +14 -delete
