import sys
import os

# Ensure backend/ is always in sys.path for task imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from celery_app import celery_app
import beat_schedule  # noqa: F401 — ensure beat_schedule is loaded

# Ejecutar con:
#   cd backend
#   .venv\Scripts\activate
#   celery -A worker worker --pool=solo --loglevel=info
#
# En Windows, --pool=solo es obligatorio para el worker (prefork no funciona).
# Beat se ejecuta en terminal separada (NO necesita --pool):
#   celery -A worker beat --loglevel=info
