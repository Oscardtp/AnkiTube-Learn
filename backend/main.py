import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import get_settings
from database import connect_db, disconnect_db
from utils.rate_limit import limiter
from routers import auth, decks, feedback, licenses, admin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AnkiTube Learn API starting...")
    await connect_db()
    logger.info("✅ MongoDB connected")
    yield
    logger.info("🛑 Shutting down...")
    await disconnect_db()
    logger.info("✅ MongoDB disconnected")


app = FastAPI(
    title="AnkiTube Learn API",
    description="Convierte cualquier video de YouTube en tu clase de inglés personalizada.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global error handler — never leak stack traces to clients
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Error interno del servidor. Ya lo estamos revisando."},
    )


# Routers
app.include_router(auth.router)
app.include_router(decks.router)
app.include_router(feedback.router)
app.include_router(licenses.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "AnkiTube Learn API"}


@app.get("/")
async def root():
    return {
        "service": "AnkiTube Learn API",
        "tagline": "Convierte cualquier video de YouTube en tu clase de inglés personalizada.",
        "docs": "/docs" if settings.debug else "disabled in production",
    }