#!/usr/bin/env bash
# =============================================================================
# First-time deployment of the portfolio stack on a fresh EC2 instance.
# Supports Ubuntu 22.04/24.04 and Amazon Linux 2023.
#
# One command:
#   bash deploy/deploy.sh
#
# Optional env vars:
#   CERTBOT_EMAIL=you@example.com   Let's Encrypt notification email
#                                   (default: register without email)
#
# Prerequisites (manual, one-time, AWS console):
#   - Security Group inbound: TCP 22 (your IP), 80 + 443 (0.0.0.0/0)
#   - DNS A record: aloutesana.ai-web-builder.com -> this instance's public IP
# =============================================================================
set -euo pipefail

DOMAIN="aloutesana.ai-web-builder.com"
WEB_ROOT="/var/www/portfolio"
ACME_WEBROOT="/var/www/letsencrypt"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

cd "$PROJECT_DIR"

log()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo"; fi

# -----------------------------------------------------------------------------
log "1/7  Detecting OS and installing packages"
# -----------------------------------------------------------------------------
. /etc/os-release
case "$ID" in
  ubuntu|debian)
    $SUDO apt-get update -y
    $SUDO apt-get install -y git curl rsync nginx certbot python3-certbot-nginx openssl
    if ! command -v docker >/dev/null 2>&1; then
      curl -fsSL https://get.docker.com | $SUDO sh
    fi
    if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
      curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
      $SUDO apt-get install -y nodejs
    fi
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_ENABLE="$SUDO ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio"
    $SUDO rm -f /etc/nginx/sites-enabled/default
    ;;
  amzn)
    $SUDO dnf install -y git curl rsync nginx nodejs20 openssl docker
    if ! command -v certbot >/dev/null 2>&1; then
      $SUDO dnf install -y python3-certbot-nginx 2>/dev/null || $SUDO pip3 install certbot-nginx
    fi
    # Compose plugin (AL2023 docker package does not include it)
    if ! docker compose version >/dev/null 2>&1; then
      $SUDO mkdir -p /usr/local/lib/docker/cli-plugins
      $SUDO curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
        -o /usr/local/lib/docker/cli-plugins/docker-compose
      $SUDO chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    fi
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_ENABLE="true"
    ;;
  *) die "Unsupported OS: $ID (supported: ubuntu, debian, amzn)" ;;
esac

$SUDO systemctl enable docker nginx
# Docker commands run via sudo, so no group membership / re-login needed.
COMPOSE="$SUDO $COMPOSE"

# -----------------------------------------------------------------------------
log "2/7  Preparing .env"
# -----------------------------------------------------------------------------
if [ ! -f .env ]; then
  cp .env.production.example .env
  # Generate secrets so a single command gets a working stack.
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 24)|" .env
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env
  ADMIN_PW="$(openssl rand -hex 12)"
  sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${ADMIN_PW}|" .env
  warn ".env was created with generated secrets."
  warn "ADMIN PASSWORD (save it now, it will not be shown again): ${ADMIN_PW}"
  warn "Recommended later: replace it with ADMIN_PASSWORD_HASH (see DEPLOY.md)."
else
  log ".env already exists — keeping it"
fi

# -----------------------------------------------------------------------------
log "3/7  Starting Docker services (db + backend)"
# -----------------------------------------------------------------------------
if grep -q '^BACKEND_IMAGE=' .env; then
  $COMPOSE pull
  $COMPOSE up -d
else
  $COMPOSE up -d --build
fi

# -----------------------------------------------------------------------------
log "4/7  Building frontend and publishing static files"
# -----------------------------------------------------------------------------
( cd frontend && npm ci && npm run build )
$SUDO mkdir -p "$WEB_ROOT" "$ACME_WEBROOT"
$SUDO rsync -a --delete frontend/dist/ "$WEB_ROOT/"

# -----------------------------------------------------------------------------
log "5/7  Installing nginx site config"
# -----------------------------------------------------------------------------
$SUDO cp deploy/nginx-portfolio.conf "$NGINX_CONF_DIR/portfolio"
$NGINX_ENABLE
$SUDO nginx -t

# -----------------------------------------------------------------------------
log "6/7  TLS certificate"
# -----------------------------------------------------------------------------
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  log "Certificate already exists — skipping issuance"
  $SUDO systemctl start nginx 2>/dev/null || $SUDO systemctl reload nginx
else
  # nginx must not hold port 80 during standalone issuance
  $SUDO systemctl stop nginx || true
  EMAIL_ARGS=(--register-unsafely-without-email)
  [ -n "${CERTBOT_EMAIL:-}" ] && EMAIL_ARGS=(-m "$CERTBOT_EMAIL")
  $SUDO certbot certonly --standalone -d "$DOMAIN" \
    --non-interactive --agree-tos "${EMAIL_ARGS[@]}"
  $SUDO nginx -t && $SUDO systemctl start nginx
  # Switch renewal to webroot: future renewals work with nginx running (no downtime)
  $SUDO certbot renew --force-renewal --webroot -w "$ACME_WEBROOT"
fi

# -----------------------------------------------------------------------------
log "7/7  Verifying"
# -----------------------------------------------------------------------------
$COMPOSE ps
HOST_PORT="$(grep -E '^BACKEND_HOST_PORT=' .env | cut -d= -f2 || true)"
curl -sf "http://127.0.0.1:${HOST_PORT:-8000}/health" >/dev/null \
  && echo "backend health: OK" || warn "backend health check failed — check: $COMPOSE logs backend"
curl -sI "https://$DOMAIN" | head -n 1 || warn "HTTPS check failed — DNS/Security Group?"

log "DONE — site should be live at https://$DOMAIN"
