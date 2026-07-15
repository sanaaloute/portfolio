#!/usr/bin/env bash
# =============================================================================
# Update/upgrade an already-deployed portfolio stack.
#
# One command:
#   bash deploy/update.sh
#
# What it does:
#   - git pull (fast-forward only)
#   - rebuild all images (docker layer cache keeps it fast when nothing
#     changed) and recreate containers; DB migrations run automatically
#     via the backend entrypoint
#   - nginx config re-rendered with WEB_HOST_PORT and reloaded if changed
# =============================================================================
set -euo pipefail

DOMAIN="aloutesana.ai-web-builder.com"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_DIR"

log()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo"; fi
COMPOSE="$SUDO docker compose"

[ -f .env ] || die ".env missing — run deploy/deploy.sh first"

web_port() {
  local p
  p="$(grep -E '^WEB_HOST_PORT=' .env 2>/dev/null | head -n1 | cut -d= -f2 | tr -d '\r' | xargs || true)"
  echo "${p:-8081}"
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

# -----------------------------------------------------------------------------
log "2/4  Rebuilding images and restarting services"
# -----------------------------------------------------------------------------
$COMPOSE build
$COMPOSE up -d --remove-orphans

# If ADMIN_PASSWORD was set in .env (e.g. password rotation), hash it and clear
# the plaintext. No-op when only ADMIN_PASSWORD_HASH exists.
bash deploy/secure-admin-password.sh

# -----------------------------------------------------------------------------
log "3/4  Updating nginx config (only if changed)"
# -----------------------------------------------------------------------------
if [ -d /etc/nginx/sites-available ]; then
  NGINX_TARGET="/etc/nginx/sites-available/portfolio"
else
  NGINX_TARGET="/etc/nginx/conf.d/portfolio.conf"
fi
TMP_CONF="$(mktemp)"
sed "s|http://127.0.0.1:8081|http://127.0.0.1:$(web_port)|g" deploy/nginx-portfolio.conf > "$TMP_CONF"
if ! $SUDO cmp -s "$TMP_CONF" "$NGINX_TARGET" 2>/dev/null; then
  $SUDO cp "$TMP_CONF" "$NGINX_TARGET"
  $SUDO nginx -t
  $SUDO systemctl reload nginx
  log "nginx config updated (proxying to web on port $(web_port)) and reloaded"
else
  log "nginx config already up to date — skipping reload"
fi
rm -f "$TMP_CONF"

# -----------------------------------------------------------------------------
log "4/4  Verifying"
# -----------------------------------------------------------------------------
$COMPOSE ps
sleep 10
BACKEND_HEALTH="$($SUDO docker inspect --format '{{.State.Health.Status}}' portfolio-backend 2>/dev/null || echo unknown)"
if [ "$BACKEND_HEALTH" = "healthy" ]; then
  echo "backend health: OK"
else
  warn "backend health: $BACKEND_HEALTH — last 30 log lines:"
  $COMPOSE logs --tail 30 backend || true
fi

if curl -sfI "https://$DOMAIN" >/dev/null; then
  echo "HTTPS: OK (https://$DOMAIN)"
else
  warn "HTTPS check failed"
fi

log "DONE — updated to $(git rev-parse --short HEAD)"
