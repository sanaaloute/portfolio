# Portfolio Backend

FastAPI + PostgreSQL + Alembic backend for the redesigned personal portfolio.

## Run with Docker Compose

```bash
cp backend/.env.example backend/.env
# edit backend/.env with a secure JWT_SECRET and ADMIN_PASSWORD
docker compose up --build
```

The API is available at `http://localhost:8000` (via nginx at `http://localhost:8080/api`).

## Local development (requires Python 3.12+ and PostgreSQL)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env, then run migrations + seed:
alembic upgrade head
python -m app.seed

uvicorn app.main:app --reload
```

## Generate a bcrypt admin password hash

```bash
python -m app.security your-password-here
```

Then set `ADMIN_PASSWORD_HASH` (and remove `ADMIN_PASSWORD`) in `.env`.

## API overview

| Resource | Prefix | Auth required for writes |
|---|---|---|
| Auth | `/api/auth` | — |
| Profile | `/api/profile` | GET public, PUT protected |
| Projects | `/api/projects` | GET public, POST/PUT/DELETE protected |
| Experiences | `/api/experiences` | GET public, POST/PUT/DELETE protected |
| Skills | `/api/skills` | GET public, POST/PUT/DELETE protected |
| Blogs | `/api/blogs` | GET public, POST/PUT/DELETE protected |
| Uploads | `/api/upload` | all protected |
| Chat | `/api/chat` | public |
| Static uploads | `/uploads` | public |

OpenAPI docs: `/docs`
