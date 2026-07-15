#!/usr/bin/env bash
# =============================================================================
# Called automatically by deploy.sh and update.sh (after services are up).
#
# If .env contains a plaintext ADMIN_PASSWORD, it is replaced with a bcrypt
# hash (ADMIN_PASSWORD_HASH) and the plaintext is cleared — so the plaintext
# only ever exists transiently during deployment. Afterwards only the hash
# works: the backend hashes the password typed at login and compares it to
# the stored hash (bcrypt is one-way — it is never "decrypted").
#
# To ROTATE the admin password later:
#   1) set ADMIN_PASSWORD=<new-password> in .env
#   2) bash deploy/update.sh        (runs this script, keeps all data)
# =============================================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

log()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo"; fi
COMPOSE="$SUDO docker compose"

env_value() {
  grep -E "^$1=" .env 2>/dev/null | head -n1 | cut -d= -f2- | tr -d '\r' | xargs || true
}

ADMIN_PW="$(env_value ADMIN_PASSWORD)"
EXISTING_HASH="$(env_value ADMIN_PASSWORD_HASH)"

if [ -z "$ADMIN_PW" ]; then
  if [ -n "$EXISTING_HASH" ]; then
    log "Admin password already stored as hash — nothing to do"
  else
    warn "Neither ADMIN_PASSWORD nor ADMIN_PASSWORD_HASH is set in .env."
    warn "Admin login is disabled. Set ADMIN_PASSWORD=<password> in .env and"
    warn "re-run this script (or bash deploy/update.sh)."
  fi
  exit 0
fi

# Safety: .env/Compose mangle these characters in plaintext values.
if printf '%s' "$ADMIN_PW" | grep -q '[$#%&[:space:]"'"'"']'; then
  die "ADMIN_PASSWORD contains characters that break .env parsing ($, #, %, &, spaces, quotes). Use letters, digits and -_!. only."
fi

log "Hashing ADMIN_PASSWORD and storing it as ADMIN_PASSWORD_HASH..."

# Generate the bcrypt hash inside the running backend container
# (retry: the backend may still be running migrations right after `up`).
HASH=""
for i in $(seq 1 10); do
  if HASH="$($COMPOSE exec -T backend python -m app.security "$ADMIN_PW" 2>/dev/null | tr -d '\r\n')"; then
    case "$HASH" in \$2b\$*) break ;; esac
  fi
  HASH=""
  sleep 3
done
[ -n "$HASH" ] || die "Could not generate the password hash (is the backend container running?)"

# Write the hash with every '$' DOUBLED — Compose interpolates '$' in .env values.
ESCAPED="${HASH//\$/\$\$}"
sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=|" .env
if grep -q '^ADMIN_PASSWORD_HASH=' .env; then
  sed -i "s|^ADMIN_PASSWORD_HASH=.*|ADMIN_PASSWORD_HASH=${ESCAPED}|" .env
else
  printf 'ADMIN_PASSWORD_HASH=%s\n' "$ESCAPED" >> .env
fi

# Recreate the backend so it picks up the new env (hash instead of plaintext).
$COMPOSE up -d --force-recreate backend

log "Done — plaintext password cleared from .env; only the bcrypt hash remains."
