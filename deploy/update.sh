#!/usr/bin/env bash
# =============================================================================
# Update/upgrade an already-deployed portfolio stack.
#
# One command:
#   bash deploy/update.sh
#
# What it does:
#   - git pull (fast-forward only)
#   - backend/db: rebuild (or pull from ECR if BACKEND_IMAGE is set) + restart;
#     DB migrations run automatically via the backend entrypoint
#   - frontend: rebuild + rsync only if frontend/ changed (or dist missing)
#   - nginx: config re-rendered with BACKEND_HOST_PORT and reloaded if changed
# =============================================================================
set -euo pipefail

DOMAIN="aloutesana.ai-web-builder.com"
WEB_ROOT="/var/www/portfolio"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_DIR"

log()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo"; fi
COMPOSE="$SUDO docker compose"

[ -f .env ] || die ".env missing — run deploy/deploy.sh first"

host_port() {
  local p
  p="$(grep -E '^BACKEND_HOST_PORT=' .env 2>/dev/null | head -n1 | cut -d= -f2 | tr -d '\r' | xargs || true)"
  echo "${p:-8000}"
}

# -----------------------------------------------------------------------------
log "1/4  Pulling latest code"
# -----------------------------------------------------------------------------
PREV_HEAD="$(git rev-parse HEAD)"
git pull --ff-only || die "git pull failed (local changes?). Commit/stash them or pull manually."
NEW_HEAD="$(git rev-parse HEAD)"

if [ "$PREV_HEAD" = "$NEW_HEAD" ]; then
  log "Already up to date ($(git rev-parse --short HEAD))"
fi

changed() { git diff --name-only "$PREV_HEAD" "$NEW_HEAD" | grep -q "^$1"; }

# -----------------------------------------------------------------------------
log "2/4  Updating backend + database"
# -----------------------------------------------------------------------------
if grep -q '^BACKEND_IMAGE=' .env; then
  $COMPOSE pull
  $COMPOSE up -d --remove-orphans
else
  $COMPOSE up -d --build --remove-orphans
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
log "4/4  Updating nginx config (only if changed)"
# -----------------------------------------------------------------------------
if [ -d /etc/nginx/sites-available ]; then
  NGINX_TARGET="/etc/nginx/sites-available/portfolio"
else
  NGINX_TARGET="/etc/nginx/conf.d/portfolio.conf"
fi
TMP_CONF="$(mktemp)"
sed "s|http://127.0.0.1:8000|http://127.0.0.1:$(host_port)|g" deploy/nginx-portfolio.conf > "$TMP_CONF"
if ! $SUDO cmp -s "$TMP_CONF" "$NGINX_TARGET" 2>/dev/null; then
  $SUDO cp "$TMP_CONF" "$NGINX_TARGET"
  $SUDO nginx -t
  $SUDO systemctl reload nginx
  log "nginx config updated (backend port $(host_port)) and reloaded"
else
  log "nginx config already up to date — skipping reload"
fi
rm -f "$TMP_CONF"

# -----------------------------------------------------------------------------
$COMPOSE ps
sleep 5
if curl -sf "http://127.0.0.1:$(host_port)/health" >/dev/null; then
  echo "backend health: OK"
else
  warn "backend health check failed — last 30 log lines:"
  $COMPOSE logs --tail 30 backend || true
fi

if curl -sfI "https://$DOMAIN" >/dev/null; then
  echo "HTTPS: OK (https://$DOMAIN)"
else
  warn "HTTPS check failed"
fi

log "DONE — updated to $(git rev-parse --short HEAD)"
