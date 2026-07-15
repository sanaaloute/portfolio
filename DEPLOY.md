# Deploying to AWS EC2 with a domain + HTTPS

Architecture:

```
internet → host nginx (TLS, 80/443)
         → portfolio-web container  (nginx: SPA + /api,/uploads proxy, 127.0.0.1:8081)
         → portfolio-backend container (FastAPI, internal)
         → portfolio-db container      (PostgreSQL 16, internal)
```

Everything runs as Docker images built on the instance — **except** the
TLS-terminating nginx, which runs directly on the host (one nginx can terminate
TLS for all projects on the box). The frontend is built inside the `web` image
(multi-stage Dockerfile) — no Node.js, npm, or static-file copying on the host.

Domain: `aloutesana.ai-web-builder.com`

---

## One-command deploy / update

```bash
git clone <your-repo-url> portfolio && cd portfolio
bash deploy/deploy.sh     # CLEAN-SLATE deploy: wipes containers, images AND
                          # volumes (database!), rebuilds everything from scratch
bash deploy/update.sh     # non-destructive update: pull, rebuild, restart (data kept)
```

The manual steps below document exactly what the scripts do.

## 1. Security Group (AWS console)

Inbound rules:
- TCP 22  — from **your IP only** (SSH)
- TCP 80  — `0.0.0.0/0` (HTTP → redirects to HTTPS; ACME challenge)
- TCP 443 — `0.0.0.0/0` (HTTPS)

Do **NOT** open 5432, 8000 or 8081 — nothing besides 80/443 needs the internet.

## 2. DNS

A record: `aloutesana.ai-web-builder.com` → the EC2 **public IPv4** address.
Verify: `dig +short aloutesana.ai-web-builder.com`.

## 3. Install Docker + Compose plugin on the instance

**Amazon Linux 2023**
```bash
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

**Ubuntu 22.04/24.04**
```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

## 4. Install nginx + certbot on the host

**Amazon Linux 2023**
```bash
sudo dnf install -y nginx
sudo dnf install -y python3-certbot-nginx || sudo pip3 install certbot-nginx
sudo systemctl enable nginx        # do NOT start yet — certbot needs port 80 (§5)
```

**Ubuntu 22.04/24.04**
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl stop nginx          # apt auto-starts it; certbot needs port 80 (§5)
```

## 5. Deploy (manual equivalent of deploy.sh)

```bash
git clone <your-repo-url> portfolio && cd portfolio

cp .env.production.example .env
nano .env                       # set POSTGRES_PASSWORD (letters/digits only!),
                                # JWT_SECRET (openssl rand -hex 32), ADMIN_PASSWORD

# Build all images (backend + web) and start everything
docker compose build
docker compose up -d

# Host nginx site config (TLS termination → proxy to the web container)
sudo mkdir -p /var/www/letsencrypt
#   Ubuntu/Debian:
sudo cp deploy/nginx-portfolio.conf /etc/nginx/sites-available/portfolio
sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
sudo rm -f /etc/nginx/sites-enabled/default
#   Amazon Linux 2023 instead:
#   sudo cp deploy/nginx-portfolio.conf /etc/nginx/conf.d/portfolio.conf

# TLS certificate — one-time bootstrap (nginx must NOT be running):
sudo systemctl stop nginx
sudo certbot certonly --standalone -d aloutesana.ai-web-builder.com \
  --non-interactive --agree-tos -m you@example.com
sudo nginx -t && sudo systemctl start nginx
# Switch renewal to webroot so future renewals work while nginx keeps running:
sudo certbot renew --force-renewal --webroot -w /var/www/letsencrypt
```

### Admin password

Set `ADMIN_PASSWORD=<your-password>` in `.env` **before deploying** (letters, digits and
`-_!.` only — no `$`, `#`, `%`, `&`, spaces or quotes, which break `.env` parsing).

During deployment, `deploy/secure-admin-password.sh` (run automatically by both
`deploy.sh` and `update.sh`) hashes it with bcrypt, stores the hash as
`ADMIN_PASSWORD_HASH` in `.env` and **clears the plaintext** — the plaintext only ever
exists transiently during deployment. Afterwards only the hash works: the backend hashes
the password typed at login and compares (bcrypt is one-way, never decrypted).

To **rotate** the password later:
```bash
sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=<new-password>|" .env
bash deploy/update.sh        # hashes the new password, clears plaintext, keeps all data
```

Manual equivalent (if ever needed):
```bash
HASH=$(docker compose exec -T backend python -m app.security 'YourStrongPassword' | tr -d '\r\n')
sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=|" .env
sed -i "s|^ADMIN_PASSWORD_HASH=.*|ADMIN_PASSWORD_HASH=${HASH//\$/\$\$}|" .env   # every '$' DOUBLED
docker compose up -d --force-recreate backend
```

## 6. Verify

```bash
docker compose ps                                        # all Up/healthy
docker inspect --format '{{.State.Health.Status}}' portfolio-backend
curl -s http://127.0.0.1:8081/ | head -c 200             # web container serves the SPA
curl -I https://aloutesana.ai-web-builder.com            # HTTP 200 through TLS
sudo certbot renew --dry-run                             # auto-renewal works
```

- Site: `https://aloutesana.ai-web-builder.com`
- Admin: `https://aloutesana.ai-web-builder.com/admin`

## 7. Update / rollback

```bash
bash deploy/update.sh
# or manually:
git pull
docker compose build
docker compose up -d --remove-orphans
```

Rollback: `git checkout <prev-commit>`, then the same build/up commands.

## 8. Backups

Data lives in Docker named volumes `pgdata` and `uploads`. The simplest backup
is periodic EBS snapshots. Manual DB dump:
```bash
docker compose exec db pg_dump -U portfolio portfolio > backup-$(date +%F).sql
```

## Troubleshooting

- **Backend dies with `Name or service not known` (gaierror):** `POSTGRES_PASSWORD`
  contains URL-unsafe characters (`/`, `#`, `%`, `&`, `@`). Use letters/digits only,
  and change the password *inside* Postgres too (`ALTER USER ... WITH PASSWORD`),
  since `POSTGRES_PASSWORD` in `.env` only applies at first DB init.
- **`docker compose` port conflict on 8081:** another container uses it — set
  `WEB_HOST_PORT` in `.env` and re-run `bash deploy/update.sh` (the nginx config
  is re-rendered automatically).
- **certbot fails:** DNS not propagated yet, or port 80 blocked in the Security Group.
- **Container names:** `portfolio-db`, `portfolio-backend`, `portfolio-web`.
