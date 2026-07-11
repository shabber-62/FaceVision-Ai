from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.database import engine, Base
import app.models_recognition  # Registers face recognition models on Base
from app.routes.auth import router as auth_router
from app.routes.students import router as students_router
from app.routes.attendance import router as attendance_router
from app.routes.camera import router as camera_router
from app.routes.ai import router as ai_router
from app.routes.recognition import router as recognition_router
from app.routes.security import router as security_router
from app.routes.reports import router as reports_router
from app.middleware import SecurityHeadersMiddleware, PerformanceLoggingMiddleware, SessionAuditMiddleware
from app.dependencies import RoleChecker, PermissionChecker

# Configure application logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("facevision.main")

# Initialize relational database schemas directly on startup
# This serves as a fail-safe fallback if Alembic migrations are not executed yet.
try:
    logger.info("Syncing SQLAlchemy relational schemas with Postgres storage engine...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema verification and creation completed.")
except Exception as e:
    logger.error(f"Error initializing SQL database schemas on startup: {e}")

# Instantiate main enterprise API router
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade highly secure multi-tenant identity and authorization manager with deep RBAC and micro-permission sets.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# --- CORE CORS MIDDLEWARE CONTEXT ---
# Standard CORS config allowing secure requests from React/Vite web terminals on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific domain locations
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INJECT CUSTOM SYSTEM MIDDLEWARES ---
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(PerformanceLoggingMiddleware)
app.add_middleware(SessionAuditMiddleware)

# --- BASE ROUTING CORE ---

@app.get("/", tags=["Health Status Monitor"])
def read_root():
    """Returns absolute base identity state of the FaceVision authorization node."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": "Production-Ready / Containerized"
    }

# --- ATTACH SUBMODULE ROUTES ---
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(students_router, prefix=settings.API_V1_STR)
app.include_router(attendance_router, prefix=settings.API_V1_STR)
app.include_router(camera_router, prefix=settings.API_V1_STR)
app.include_router(ai_router)
app.include_router(recognition_router)
app.include_router(security_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)

# --- SECURED DEMO ENDPOINTS VERIFYING RBAC & PERMISSIONS ---

@app.get(
    "/api/v1/admin/cameras", 
    tags=["Demo Guarded Resources"],
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
def manage_cameras_demo():
    """A demonstration route locked strictly behind the 'Manage Cameras' micro-permission."""
    return {
        "status": "authorized",
        "message": "Authorized access granted. Handshake valid.",
        "payload": {
            "action": "Camera management controls active.",
            "authorized_permission": "Manage Cameras"
        }
    }

@app.get(
    "/api/v1/super-admin/settings", 
    tags=["Demo Guarded Resources"],
    dependencies=[Depends(RoleChecker(["Super Admin"]))]
)
def super_admin_settings_demo():
    """A demonstration route locked strictly behind the 'Super Admin' role group."""
    return {
        "status": "authorized",
        "message": "Super Admin access verified.",
        "payload": {
            "action": "Global core configuration parameters editable.",
            "authorized_role": "Super Admin"
        }
    }
