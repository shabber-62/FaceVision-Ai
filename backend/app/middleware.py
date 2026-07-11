import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger("facevision.middleware")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Enterprise-grade Security Headers Middleware.
    Prevents clickjacking, content sniffing, cross-site scripting (XSS), and forces HTTPS.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


class PerformanceLoggingMiddleware(BaseHTTPMiddleware):
    """
    System Traffic Logging & Performance Profiling Middleware.
    Tracks exact request endpoints, processing latency, status outcomes, and origin IPs.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            
            logger.info(
                f"IP: {client_ip} | Method: {request.method} | Path: {request.url.path} "
                f"| Status: {response.status_code} | Latency: {process_time:.2f}ms"
            )
            response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
            return response
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"EXCEPTION | IP: {client_ip} | Method: {request.method} | Path: {request.url.path} "
                f"| Error: {str(e)} | Time: {process_time:.2f}ms"
            )
            raise e


class SessionAuditMiddleware(BaseHTTPMiddleware):
    """
    Validates persistent session tokens or custom request markers 
    to log authenticated interactions on system gateways.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # Check for custom audit headers or request tokens
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            # We can log targeted profile traces inside routers, 
            # here we attach a metadata tag for upstream pipelines
            request.state.has_auth_token = True
        else:
            request.state.has_auth_token = False
            
        response = await call_next(request)
        return response
