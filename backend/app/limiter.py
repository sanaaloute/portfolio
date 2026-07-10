from __future__ import annotations
from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared rate limiter (keyed by client IP). Imported by main.py (state/handler)
# and by routers that need throttling, to avoid circular imports.
limiter = Limiter(key_func=get_remote_address)
