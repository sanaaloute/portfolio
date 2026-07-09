# Portfolio — Redesigned

A fresh, premium, minimal personal portfolio for **Aloute Sana**, rebuilt with a modern FastAPI + PostgreSQL backend, React + TypeScript + Tailwind frontend, and Docker Compose for one-command local and production-like runs.

## What's included

- **Attractive, data-driven hero** — name, headline, tagline, avatar, stats, and focus areas are all editable from the admin.
- **Projects & Experience CRUD** — add, edit, delete projects and work experience through a protected admin UI.
- **Blog + Skills** — publish articles and manage skill categories from the admin.
- **AI assistant** — a lightweight `/chat` endpoint that answers questions based on your real profile, projects, experience, and blogs.
- **JWT-protected admin** — single-password login with token-based access to all write routes.
- **Docker Compose** — production-like stack (Postgres + FastAPI + nginx) plus a dev override with hot reload.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, async SQLAlchemy 2.x, asyncpg, Alembic, Pydantic v2, JWT |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, react-quill |
| Database | PostgreSQL 16 |
| Deployment | Docker Compose + nginx |

## Quick start

```bash
# 1. Copy and fill environment variables
cp .env.example .env
# Edit .env — set JWT_SECRET and ADMIN_PASSWORD

# 2. Start everything
docker compose up --build -d

# 3. Open http://localhost:8080
```

The first boot will run Alembic migrations and seed the database with your existing profile, experience, and skills.

## Development

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- Frontend dev server: http://localhost:5173
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432

## Managing content

1. Go to **/login** and enter your `ADMIN_PASSWORD`.
2. Use the **Admin** panel to edit:
   - **Profile** — hero copy, avatar, contact links, stats, focus areas
   - **Projects** — add new projects with rich-text bodies and cover images
   - **Experience** — add roles, companies, highlights, and stacks
   - **Skills** — add skills grouped by category
   - **Blog** — write and publish articles
   - **Uploads** — manage images used across the site

## Environment variables

| Variable | Purpose |
|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Postgres credentials |
| `JWT_SECRET` | Secret for signing admin JWTs |
| `ADMIN_PASSWORD` | Plaintext admin password (dev convenience) |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password (recommended for production) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `OPENAI_API_KEY` | Optional — polishes chat responses |

Generate a password hash:

```bash
cd backend
python -m app.security your-password
```
