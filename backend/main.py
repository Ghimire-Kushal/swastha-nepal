from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import auth, patients, doctors, ai, translate


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 Swastha Nepal AI backend starting — DB: {settings.database_url[:40]}...")
    yield
    print("⏹  Backend shutdown")


app = FastAPI(
    title="Swastha Nepal AI — REST API",
    description="""
## Nepal's AI-powered health platform backend

### Authentication
All protected endpoints require a Bearer token in the `Authorization` header.
Obtain tokens via `POST /auth/login` or `POST /auth/register`.

### Roles
| Role | Access |
|------|--------|
| `patient` | Own health records |
| `doctor` | Patient records, diagnoses, prescriptions |
| `lab_technician` | Lab orders and reports |
| `pharmacist` | Prescriptions and dispensing |
| `hospital_admin` | Hospital-level analytics |
| `government_admin` | National analytics |
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Rate limiting placeholder — plug in slowapi or redis-based limiter here
# from slowapi import Limiter; limiter = Limiter(key_func=get_remote_address)

# Routers
app.include_router(auth.router,      prefix="/api/v1")
app.include_router(patients.router,  prefix="/api/v1")
app.include_router(doctors.router,   prefix="/api/v1")
app.include_router(ai.router,        prefix="/api/v1")
app.include_router(translate.router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "Swastha Nepal AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "swastha-nepal-ai-backend"}


@app.exception_handler(404)
async def not_found(_request: Request, _exc):
    return JSONResponse(status_code=404, content={"error": "Endpoint not found"})


@app.exception_handler(500)
async def server_error(_request: Request, _exc):
    return JSONResponse(status_code=500, content={"error": "Internal server error"})
