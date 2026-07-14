#!/bin/bash
set -e

# Wait until the database host resolves and accepts TCP connections.
# depends_on: service_healthy only applies at `compose up` time — NOT when
# containers are restarted (daemon/host reboot, restart loops) or started
# individually. Without this wait, migrations crash with
# "socket.gaierror: [Errno -2] Name or service not known".
echo "Waiting for database..."
python - <<'PY'
import os, socket, sys, time

# Parse with SQLAlchemy (the same parser alembic/asyncpg will use), so that a
# password containing URL-unsafe characters (/, #, %, &, ...) is detected here
# instead of surfacing later as a cryptic DNS "Name or service not known".
from sqlalchemy.engine import make_url

url = make_url(os.environ["DATABASE_URL"])
host = url.host or "db"
port = url.port or 5432
print(f"Parsed DB target: host={host!r} port={port} (user={url.username!r}, db={url.database!r})")
if host not in ("db", "localhost", "127.0.0.1") and "." not in host:
    print(f"WARNING: odd DB host {host!r} — check POSTGRES_PASSWORD for URL-unsafe "
          f"characters (use letters/digits only).", file=sys.stderr)

deadline = time.monotonic() + 120
last_err = None
while time.monotonic() < deadline:
    try:
        with socket.create_connection((host, port), timeout=3):
            print(f"Database {host}:{port} is reachable.")
            sys.exit(0)
    except OSError as e:
        last_err = e
        time.sleep(2)

sys.exit(f"ERROR: database {host}:{port} not reachable after 120s (last error: {last_err})")
PY

echo "Running database migrations..."
alembic upgrade head

echo "Seeding database if empty..."
python - <<PY
import asyncio
from app.db import AsyncSessionLocal
from app.seed import seed_database

async def main():
    async with AsyncSessionLocal() as session:
        await seed_database(session)

asyncio.run(main())
PY

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
