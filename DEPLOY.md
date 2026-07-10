# Deploying to AWS EC2 (1 GB) with a domain + automatic HTTPS

Stack: Caddy (TLS) → nginx (SPA + `/api`,`/uploads` proxy) → FastAPI → PostgreSQL.
Everything runs in Docker. TLS is automatic via Let's Encrypt (Caddy).

The `web` container is **internal-only** — the site is reachable **only** through Caddy on
80/443 (no direct `:8080`). `backend` and `db` are also internal (never open 8000/5432).

Domain: `aloutesana.ai-web-builder.com`

---

## 1. Security Group (AWS console)

Inbound rules:
- TCP 22  — from **your IP only** (SSH)
- TCP 80  — `0.0.0.0/0` (HTTP → redirects to HTTPS; also used for the ACME challenge)
- TCP 443 — `0.0.0.0/0` (HTTPS)

Do **NOT** open 5432 (Postgres) or 8000 (backend) to the internet — they stay internal.

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

## 4. Add swap (important for 1 GB RAM)

Building the frontend on a 1 GB instance needs swap to avoid OOM:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

## 5. Deploy

> Tip: on a 1 GB instance, prefer building in CI and **pulling** images instead of building here — see **§7 CI/CD with ECR**. The commands below build on the box (fine with the swap from §4).

```bash
git clone <your-repo-url> portfolio && cd portfolio

# Create the real env from the template
cp .env.production.example .env
nano .env                       # set POSTGRES_PASSWORD, JWT_SECRET, CORS_ORIGINS, COOKIE_SECURE
#   JWT_SECRET:   openssl rand -hex 32
#   leave ADMIN_PASSWORD_HASH empty for now (set it after the first build)

# Build sequentially to keep memory low on 1 GB, then start
docker compose -f docker-compose.yml -f docker-compose.prod.yml build backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml build web
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Create the admin password hash (recommended)
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend \
  python -m app.security 'YourStrongPassword'
# paste the printed hash into .env as ADMIN_PASSWORD_HASH, clear ADMIN_PASSWORD, then:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend
```

## 6. Verify

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps     # all Up/healthy
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f caddy
curl -I https://aloutesana.ai-web-builder.com                          # HTTP/2 200
```

- Site: `https://aloutesana.ai-web-builder.com`
- Admin: `https://aloutesana.ai-web-builder.com/admin` (log in with your password)

If Caddy can't get a certificate, it's almost always DNS not yet propagated or port 80 blocked
in the Security Group — check `docker compose ... logs caddy`.

## 7. CI/CD with ECR (recommended for a 1 GB instance)

Avoid building on the box entirely: GitHub Actions builds `backend` + `web` and pushes them to
Amazon ECR; the instance only **pulls**.

**One-time AWS setup**
```bash
# Create the two ECR repositories
aws ecr create-repository --repository-name portfolio-backend --region <region>
aws ecr create-repository --repository-name portfolio-web      --region <region>
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
push to `main` that touches the app.

**On the instance, pull instead of build**
```bash
# Log in to ECR (uses the instance profile)
aws ecr get-login-password --region <region> | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

# Point compose at the ECR images (add to .env)
echo 'BACKEND_IMAGE=<account>.dkr.ecr.<region>.amazonaws.com/portfolio-backend:latest'  >> .env
echo 'FRONTEND_IMAGE=<account>.dkr.ecr.<region>.amazonaws.com/portfolio-web:latest'      >> .env

# Pull and run (no --build!)
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 8. Update / rollback

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml build backend web
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Rollback: `git checkout <prev-commit>` then re-run the build/up commands.

## 9. Backups

Data lives in Docker named volumes `pgdata` and `uploads`. For a portfolio the simplest
backup is periodic EBS snapshots of the instance volume. To dump the DB manually:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec db \
  pg_dump -U portfolio portfolio > backup-$(date +%F).sql
```
