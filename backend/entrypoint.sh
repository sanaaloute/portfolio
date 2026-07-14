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
from urllib.parse import urlparse

url = os.environ["DATABASE_URL"]
parsed = urlparse(url)
host = parsed.hostname or "db"
port = parsed.port or 5432

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
