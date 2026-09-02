import os
import secrets
import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ["MONGODB_URL"] = "mongodb://localhost:27017"
os.environ["JWT_SECRET"] = secrets.token_hex(32)  # Random secret for tests
os.environ["GOOGLE_API_KEY"] = os.environ.get("GOOGLE_API_KEY", "test-google-key")
os.environ["ANTHROPIC_API_KEY"] = os.environ.get("ANTHROPIC_API_KEY", "test-anthropic-key")

import main


@pytest.fixture
def client():
    with patch("main.connect_db", new=AsyncMock()), patch("main.disconnect_db", new=AsyncMock()):
        with TestClient(main.app) as test_client:
            yield test_client


def test_devtunnel_origin_is_NOT_allowed_for_preflight(client):
    """SECURITY: DevTunnel origins should NOT be allowed (was a security hole)."""
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "https://mxx51kxj-3000.use.devtunnels.ms",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type, authorization",
        },
    )

    # Should NOT allow devtunnels origin
    assert response.headers.get("access-control-allow-origin") != "https://mxx51kxj-3000.use.devtunnels.ms"
