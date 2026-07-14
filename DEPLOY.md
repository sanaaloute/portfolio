# Deploying to AWS EC2 (8 GB RAM / 1 TB disk) with a domain + HTTPS

Stack: **nginx (on the host, TLS + static files + `/api`,`/uploads` proxy) → FastAPI (Docker) → PostgreSQL (Docker)**.
Only `db` and `backend` run in Docker. nginx runs directly on the instance and serves the
prebuilt frontend from `/var/www/portfolio`. TLS via Let's Encrypt (certbot).

The `backend` container is published on **127.0.0.1:8000 only** (set `BACKEND_HOST_PORT`
in `.env` if another container on the host already uses that port — the deploy scripts
render the nginx `proxy_pass` to match automatically) — reachable by the host nginx,
never from the internet. `db` is fully internal.

The instance may run other containers/sites alongside this stack. The nginx config is a
`server_name` vhost, so it only handles requests for the domain below and coexists with
other vhosts; just make sure no other container publishes a conflicting host port.

Domain: `aloutesana.ai-web-builder.com`

---

## 1. Security Group (AWS console)

Inbound rules:
- TCP 22  — from **your IP only** (SSH)
- TCP 80  — `0.0.0.0/0` (HTTP → redirects to HTTPS; also used for the ACME challenge)
- TCP 443 — `0.0.0.0/0` (HTTPS)

Do **NOT** open 5432 (Postgres) or 8000 (backend) to the internet — 8000 is bound to
localhost anyway, and 5432 is never published.

## 2. DNS (Spaceship)

Create an **A record**:
- Host: `aloutesana.ai-web-builder.com`
- Value: the EC2 **public IPv4** address
- TTL: default

Wait for propagation, then verify from your laptop: `dig +short aloutesana.ai-web-builder.com`.

## 3. Install Docker + Compose plugin on the instance

**Amazon Linux 2023**
```bash
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user   # log out & back in
# Compose plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

**Ubuntu 22.04/24.04**
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker ubuntu     # log out & back in
```

## 4. Install nginx, Node.js and certbot on the host

**Amazon Linux 2023**
```bash
sudo dnf install -y nginx nodejs20 rsync
sudo dnf install -y python3-certbot-nginx || sudo pip3 install certbot-nginx
sudo systemctl enable nginx        # do NOT start yet — certbot needs port 80 for the bootstrap (§6)
```

**Ubuntu 22.04/24.04**
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx rsync
# Node 20 via NodeSource (Ubuntu's default nodejs is too old for Vite)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo systemctl enable nginx
sudo systemctl stop nginx          # apt auto-starts it; certbot needs port 80 for the bootstrap (§6)
```

## 5. (Optional) Add swap

Not needed on an 8 GB instance, but harmless if you want a safety net:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

## 6. Deploy

> **One-command option:** `bash deploy/deploy.sh` performs sections 3–6 automatically
> (installs packages, generates `.env` secrets on first run, starts Docker, builds the
> frontend, installs the nginx config, bootstraps the certificate). Afterwards, updates
> are a single command: `bash deploy/update.sh`. The manual steps below document exactly
> what the script does.

With 8 GB RAM you can comfortably build everything on the box. (Building in CI and
pulling from ECR is still possible — see **§8 CI/CD with ECR**.)

```bash
git clone <your-repo-url> portfolio && cd portfolio

# Create the real env from the template
cp .env.production.example .env
nano .env                       # set POSTGRES_PASSWORD, JWT_SECRET, CORS_ORIGINS, COOKIE_SECURE
#   JWT_SECRET:   openssl rand -hex 32
#   leave ADMIN_PASSWORD_HASH empty for now (set it after the first build)

# 1) Backend + database (Docker)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 2) Frontend: build static files and publish them for the host nginx
cd frontend && npm ci && npm run build && cd ..
sudo mkdir -p /var/www/portfolio
sudo rsync -a --delete frontend/dist/ /var/www/portfolio/

# 3) Host nginx site config (complete as shipped: HTTPS block, HTTP→HTTPS
#    redirect, security headers — no certbot rewriting of the file needed)
sudo mkdir -p /var/www/portfolio /var/www/letsencrypt
#    Ubuntu/Debian:
sudo cp deploy/nginx-portfolio.conf /etc/nginx/sites-available/portfolio
sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
sudo rm -f /etc/nginx/sites-enabled/default
#    Amazon Linux 2023 instead:
#    sudo cp deploy/nginx-portfolio.conf /etc/nginx/conf.d/portfolio.conf

# 4) TLS certificate — one-time bootstrap. nginx must NOT be running so certbot
#    can bind port 80 (DNS A record + Security Group 80/443 must already be set):
sudo systemctl stop nginx
sudo certbot certonly --standalone -d aloutesana.ai-web-builder.com \
  --non-interactive --agree-tos -m you@example.com
sudo nginx -t && sudo systemctl start nginx
# Switch renewal to webroot so future renewals work while nginx keeps running:
sudo certbot renew --force-renewal --webroot -w /var/www/letsencrypt
```

### Create the admin password hash (recommended)

> ⚠️ **bcrypt hashes contain `$` characters.** Docker Compose interpolates `$` in `.env`
> values, so every `$` in the hash must be **doubled** (`$$`) when stored in `.env` —
> otherwise the hash is silently corrupted and login returns **500**. The commands below
> handle this automatically.

```bash
# 1) Generate the hash (raw, single '$')
HASH=$(docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm -T backend \
  python -m app.security 'YourStrongPassword' | tr -d '\r\n')

# 2) Write it into .env with every '$' doubled, and clear the plaintext password
sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=|" .env
if grep -q '^ADMIN_PASSWORD_HASH=' .env; then
  sed -i "s|^ADMIN_PASSWORD_HASH=.*|ADMIN_PASSWORD_HASH=${HASH//\$/\$\$}|" .env
else
  printf 'ADMIN_PASSWORD_HASH=%s\n' "${HASH//\$/\$\$}" >> .env
fi

# 3) Recreate the backend so it loads the hash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend
```
> On macOS, use `sed -i ''` instead of `sed -i`.
> The result in `.env` looks like: `ADMIN_PASSWORD_HASH=$$2b$$12$$…` (note the doubled `$`).

## 7. Verify

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps     # db + backend Up/healthy
curl -s http://127.0.0.1:8000/health                                       # backend reachable locally
sudo nginx -t && systemctl status nginx
curl -I https://aloutesana.ai-web-builder.com                          # HTTP/2 200
```

- Site: `https://aloutesana.ai-web-builder.com`
- Admin: `https://aloutesana.ai-web-builder.com/admin` (log in with your password)

If certbot can't get a certificate, it's almost always DNS not yet propagated or port 80
blocked in the Security Group.

Certbot installs a systemd timer that renews the certificate automatically (webroot mode,
no downtime) — verify with `sudo systemctl list-timers | grep certbot` and
`sudo certbot renew --dry-run`.

## 8. CI/CD with ECR (optional)

If you'd rather not build the backend on the box, GitHub Actions can build `backend` and
push it to Amazon ECR; the instance then only **pulls**. The frontend is static files, so
it needs no image — build it on the host (step 6.2) or in CI and rsync the `dist/` output.

**One-time AWS setup**
```bash
aws ecr create-repository --repository-name portfolio-backend --region <region>
```
- Create an IAM role for **GitHub OIDC** with ECR push permissions
  (`ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:InitiateLayerUpload`,
  `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`, `ecr:PutImage`) and a trust policy for
  `token.actions.githubusercontent.com` scoped to this repo.
- Attach an **instance profile** to the EC2 with ECR **read** access
  (`AmazonEC2ContainerRegistryReadOnly`) so it can pull.

**GitHub repo settings → Settings → Secrets and variables → Actions**
- Variables: `AWS_ACCOUNT_ID`, `AWS_REGION`
- Secret: `AWS_ROLE_TO_ASSUME` (the OIDC role ARN)

The workflow (`.github/workflows/build-and-push.yml`) pushes `:latest` and `:<sha>` on every
push to `main` that touches the backend.

**On the instance, pull instead of build**
```bash
# Log in to ECR (uses the instance profile)
aws ecr get-login-password --region <region> | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

# Point compose at the ECR image (add to .env)
echo 'BACKEND_IMAGE=<account>.dkr.ecr.<region>.amazonaws.com/portfolio-backend:latest' >> .env

# Pull and run (no --build!)
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 9. Update / rollback

> **One-command option:** `bash deploy/update.sh` — pulls the code, rebuilds/restarts the
> backend, rebuilds the frontend only if `frontend/` changed, reloads nginx only if the
> config changed. The manual equivalent:

```bash
git pull

# Backend (if changed)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build backend
#   — or, in ECR pull mode:  docker compose ... pull && docker compose ... up -d

# Frontend (if changed)
cd frontend && npm ci && npm run build && cd ..
sudo rsync -a --delete frontend/dist/ /var/www/portfolio/
# nginx serves static files directly — no reload needed for content changes
```

Rollback: `git checkout <prev-commit>` then re-run the steps above.

## 10. Backups

Data lives in Docker named volumes `pgdata` and `uploads`. For a portfolio the simplest
backup is periodic EBS snapshots of the instance volume. To dump the DB manually:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec db \
  pg_dump -U portfolio portfolio > backup-$(date +%F).sql
```

---

### Legacy note

The previous setup ran everything in Docker (nginx `web` container + Caddy for TLS). The
`Caddyfile`, `frontend/Dockerfile` and `frontend/nginx.conf` are kept for reference but are
no longer used by the compose files.
