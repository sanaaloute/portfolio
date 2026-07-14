#!/usr/bin/env bash
# =============================================================================
# Update/upgrade an already-deployed portfolio stack.
#
# One command:
#   bash deploy/update.sh
#
# What it does:
#   - git pull (fast-forward only)
#   - backend/db: rebuild (or pull from ECR if BACKEND_IMAGE is set) + restart
#   - frontend: rebuild + rsync only if frontend/ changed (or dist missing)
#   - nginx: reload only if deploy/nginx-portfolio.conf changed
#   - runs pending DB migrations via the backend entrypoint on restart
# =============================================================================
set -euo pipefail

DOMAIN="aloutesana.ai-web-builder.com"
WEB_ROOT="/var/www/portfolio"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

cd "$PROJECT_DIR"

log()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo"; fi
COMPOSE="$SUDO $COMPOSE"

[ -f .env ] || die ".env missing — run deploy/deploy.sh first"

# -----------------------------------------------------------------------------
log "1/4  Pulling latest code"
# -----------------------------------------------------------------------------
PREV_HEAD="$(git rev-parse HEAD)"
git pull --ff-only || die "git pull failed (local changes?). Commit/stash them or pull manually."
NEW_HEAD="$(git rev-parse HEAD)"

if [ "$PREV_HEAD" = "$NEW_HEAD" ]; then
  log "Already up to date ($NEW_HEAD)"
fi

changed() { git diff --name-only "$PREV_HEAD" "$NEW_HEAD" | grep -q "^$1"; }

# -----------------------------------------------------------------------------
log "2/4  Updating backend + database"
# -----------------------------------------------------------------------------
if grep -q '^BACKEND_IMAGE=' .env; then
  $COMPOSE pull
  $COMPOSE up -d
else
  $COMPOSE up -d --build
fi

# -----------------------------------------------------------------------------
log "3/4  Updating frontend (only if changed)"
# -----------------------------------------------------------------------------
if changed "frontend/" || [ ! -d "$WEB_ROOT" ] || [ -z "$(ls -A "$WEB_ROOT" 2>/dev/null)" ]; then
  ( cd frontend && npm ci && npm run build )
  $SUDO mkdir -p "$WEB_ROOT"
  $SUDO rsync -a --delete frontend/dist/ "$WEB_ROOT/"
  log "frontend published to $WEB_ROOT"
else
  log "frontend unchanged — skipping build"
fi

# -----------------------------------------------------------------------------
log "4/4  Reloading nginx (only if config changed)"
# -----------------------------------------------------------------------------
if changed "deploy/nginx-portfolio.conf"; then
  if [ -d /etc/nginx/sites-available ]; then
    $SUDO cp deploy/nginx-portfolio.conf /etc/nginx/sites-available/portfolio
  else
    $SUDO cp deploy/nginx-portfolio.conf /etc/nginx/conf.d/portfolio.conf
  fi
  $SUDO nginx -t && $SUDO systemctl reload nginx
  log "nginx config updated and reloaded"
else
  log "nginx config unchanged — skipping reload"
fi

# -----------------------------------------------------------------------------
$COMPOSE ps
HOST_PORT="$(grep -E '^BACKEND_HOST_PORT=' .env | cut -d= -f2 || true)"
curl -sf "http://127.0.0.1:${HOST_PORT:-8000}/health" >/dev/null \
  && echo "backend health: OK" || warn "backend health check failed — check: $COMPOSE logs backend"
curl -sI "https://$DOMAIN" | head -n 1 || warn "HTTPS check failed"

log "DONE — updated to $(git rev-parse --short HEAD)"
