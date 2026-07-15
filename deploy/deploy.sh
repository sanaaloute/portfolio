#!/usr/bin/env bash
# =============================================================================
# First-time deployment of the portfolio stack on a fresh EC2 instance.
# Supports Ubuntu 22.04/24.04 and Amazon Linux 2023. Idempotent: safe to re-run.
#
# One command:
#   bash deploy/deploy.sh
#
# WARNING: this script does a CLEAN SLATE — it removes the project's containers,
# locally-built images AND volumes (database + uploads) before rebuilding.
# Use deploy/update.sh for non-destructive updates.
#
# Architecture: host nginx (TLS) -> portfolio-web container (nginx: SPA +
# /api,/uploads proxy) -> portfolio-backend -> portfolio-db. Everything except
# the TLS-terminating host nginx runs as Docker images built on the box.
#
# Optional env vars:
#   CERTBOT_EMAIL=you@example.com   Let's Encrypt notification email
#                                   (default: register without email)
#
# Prerequisites (manual, one-time):
#   - Security Group inbound: TCP 22 (your IP), 80 + 443 (0.0.0.0/0)
#   - DNS A record: aloutesana.ai-web-builder.com -> this instance's public IP
# =============================================================================
set -euo pipefail

DOMAIN="aloutesana.ai-web-builder.com"
ACME_WEBROOT="/var/www/letsencrypt"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_DIR"

log()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo"; fi
COMPOSE="$SUDO docker compose"

# WEB_HOST_PORT from .env (default 8081). Robust against duplicate lines,
# CRLF endings and surrounding whitespace.
web_port() {
  local p
  p="$(grep -E '^WEB_HOST_PORT=' .env 2>/dev/null | head -n1 | cut -d= -f2 | tr -d '\r' | xargs || true)"
  echo "${p:-8081}"
}

# -----------------------------------------------------------------------------
log "1/8  Installing packages (OS: $(. /etc/os-release && echo "$PRETTY_NAME"))"
# -----------------------------------------------------------------------------
. /etc/os-release
case "$ID" in
  ubuntu|debian)
    $SUDO apt-get update -y
    $SUDO apt-get install -y git curl nginx certbot python3-certbot-nginx openssl
    if ! command -v docker >/dev/null 2>&1; then
      curl -fsSL https://get.docker.com | $SUDO sh
    fi
    NGINX_TARGET="/etc/nginx/sites-available/portfolio"
    $SUDO ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
    $SUDO rm -f /etc/nginx/sites-enabled/default
    ;;
  amzn)
    $SUDO dnf install -y git curl nginx openssl docker
    if ! command -v certbot >/dev/null 2>&1; then
      $SUDO dnf install -y python3-certbot-nginx 2>/dev/null || $SUDO pip3 install certbot-nginx
    fi
    if ! $SUDO docker compose version >/dev/null 2>&1; then
      $SUDO mkdir -p /usr/local/lib/docker/cli-plugins
      $SUDO curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
        -o /usr/local/lib/docker/cli-plugins/docker-compose
      $SUDO chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    fi
    NGINX_TARGET="/etc/nginx/conf.d/portfolio.conf"
    ;;
  *) die "Unsupported OS: $ID (supported: ubuntu, debian, amzn)" ;;
esac

$SUDO systemctl enable docker nginx
# All docker commands run via sudo — no group membership / re-login needed.

# -----------------------------------------------------------------------------
log "2/8  Preparing .env"
# -----------------------------------------------------------------------------
if [ ! -f .env ]; then
  cp .env.production.example .env
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 24)|" .env
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env
  ADMIN_PW="$(openssl rand -hex 12)"
  sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${ADMIN_PW}|" .env
  warn ".env was created with generated secrets."
  warn "ADMIN PASSWORD (save it now, it will not be shown again): ${ADMIN_PW}"
  warn "Recommended later: replace it with ADMIN_PASSWORD_HASH (see DEPLOY.md)."
else
  log ".env already exists — keeping it"
  # A POSTGRES_PASSWORD with URL-unsafe chars (/, #, %, &, ...) breaks SQLAlchemy's
  # DATABASE_URL parsing (backend dies with a bogus "Name or service not known").
  PW="$(grep -E '^POSTGRES_PASSWORD=' .env | head -n1 | cut -d= -f2 | tr -d '\r' || true)"
  if printf '%s' "$PW" | grep -q '[/@#%&?]'; then
    warn "POSTGRES_PASSWORD contains URL-unsafe characters (/ @ # % & ?)."
    warn "The backend will fail with 'Name or service not known'. See DEPLOY.md."
  fi
fi

# -----------------------------------------------------------------------------
log "3/8  Clean slate: removing old containers, images and volumes"
# -----------------------------------------------------------------------------
# -v              : delete named volumes (pgdata, uploads) — DATABASE IS WIPED
# --rmi local     : delete locally-built images (portfolio-backend, portfolio-web)
# --remove-orphans: delete leftover containers from previous compose files
$COMPOSE down -v --rmi local --remove-orphans || true
# Belt & braces: remove any leftover one-off containers from this project
# (e.g. `docker compose run` orphans) that still hold the network.
PROJECT_NAME="$(basename "$PROJECT_DIR")"
$SUDO docker ps -aq --filter "label=com.docker.compose.project=${PROJECT_NAME}" \
  | xargs -r $SUDO docker rm -f

# -----------------------------------------------------------------------------
log "4/8  Building images and starting services (db + backend + web)"
# -----------------------------------------------------------------------------
$COMPOSE build
$COMPOSE up -d

# -----------------------------------------------------------------------------
log "5/8  Securing admin password (plaintext -> bcrypt hash)"
# -----------------------------------------------------------------------------
bash deploy/secure-admin-password.sh

# -----------------------------------------------------------------------------
log "6/8  Installing nginx site config (proxying to web on port $(web_port))"
# -----------------------------------------------------------------------------
# Render the web container port into proxy_pass while installing.
# No `nginx -t` yet: the config references the TLS certificate, which is only
# issued in the next step. Validation happens there, right before nginx starts.
$SUDO mkdir -p "$ACME_WEBROOT"
sed "s|http://127.0.0.1:8081|http://127.0.0.1:$(web_port)|g" deploy/nginx-portfolio.conf \
  | $SUDO tee "$NGINX_TARGET" >/dev/null

# -----------------------------------------------------------------------------
log "7/8  TLS certificate"
# -----------------------------------------------------------------------------
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  log "Certificate already exists — skipping issuance"
  $SUDO nginx -t
  $SUDO systemctl start nginx 2>/dev/null || $SUDO systemctl reload nginx
else
  # nginx must not hold port 80 during standalone issuance
  $SUDO systemctl stop nginx || true
  EMAIL_ARGS=(--register-unsafely-without-email)
  [ -n "${CERTBOT_EMAIL:-}" ] && EMAIL_ARGS=(-m "$CERTBOT_EMAIL")
  $SUDO certbot certonly --standalone -d "$DOMAIN" \
    --non-interactive --agree-tos "${EMAIL_ARGS[@]}"
  $SUDO nginx -t
  $SUDO systemctl start nginx
  # Switch renewal to webroot: future renewals work while nginx runs (no downtime)
  $SUDO certbot renew --force-renewal --webroot -w "$ACME_WEBROOT"
fi

# -----------------------------------------------------------------------------
log "8/8  Verifying"
# -----------------------------------------------------------------------------
$COMPOSE ps

# Give the backend a few seconds to pass migrations + healthcheck
sleep 10
BACKEND_HEALTH="$($SUDO docker inspect --format '{{.State.Health.Status}}' portfolio-backend 2>/dev/null || echo unknown)"
if [ "$BACKEND_HEALTH" = "healthy" ]; then
  echo "backend health: OK"
else
  warn "backend health: $BACKEND_HEALTH — last 30 log lines:"
  $COMPOSE logs --tail 30 backend || true
fi

if curl -sf "http://127.0.0.1:$(web_port)/" >/dev/null; then
  echo "web container: OK"
else
  warn "web container not responding on 127.0.0.1:$(web_port)"
fi

if curl -sfI "https://$DOMAIN" >/dev/null; then
  echo "HTTPS: OK (https://$DOMAIN)"
else
  warn "HTTPS check failed — DNS / Security Group?"
fi

log "DONE — site should be live at https://$DOMAIN"
