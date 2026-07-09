#!/bin/bash
set -e

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
