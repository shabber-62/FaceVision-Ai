from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
import pyotp
import logging
from app.config import settings

logger = logging.getLogger("facevision.security")

# Configure bcrypt context for robust secure password storage
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password matches its hashed representation."""
    return pwd_context.verify(plain_password, hashed_password)

# --- JWT TOKENS ---

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates an Access Token (JWT) with subject payload."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates a Refresh Token (JWT) with subject payload."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    """Decodes a JWT and returns its claims payload or None if invalid."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"Failed to decode secure JWT token payload: {e}")
        return None

# --- OTP (TWO FACTOR AUTHENTICATION) ---

def generate_otp_secret() -> str:
    """Generates a secure Base32 OTP secret key."""
    return pyotp.random_base32()

def get_otp_provisioning_uri(secret: str, email: str) -> str:
    """Returns the OTP provisioning URI for Google Authenticator QR scans."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=settings.OTP_ISSUER_NAME)

def verify_otp_code(secret: str, code: str) -> bool:
    """Validates the 6-digit verification code against the OTP secret."""
    try:
        totp = pyotp.TOTP(secret)
        # Allows a small window buffer (30 seconds drift back and forth)
        return totp.verify(code, valid_window=1)
    except Exception as e:
        logger.error(f"Error validating 2FA dynamic OTP: {e}")
        return False
