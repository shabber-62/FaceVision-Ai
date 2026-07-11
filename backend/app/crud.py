from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import logging
from typing import Optional, List, Tuple
from app.models import User, Role, Permission, Session as UserSession, RefreshToken, PasswordResetToken, EmailVerificationToken
from app.security import hash_password

logger = logging.getLogger("facevision.crud")

# --- USERS MANAGEMENT ---

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieves user model matching the specified email."""
    return db.query(User).filter(User.email == email.lower()).first()

def get_user_by_id(db: Session, id: str) -> Optional[User]:
    """Retrieves user model matching the specified primary key ID."""
    return db.query(User).filter(User.id == id).first()

def create_user_record(db: Session, email: str, plain_password: str) -> User:
    """Inserts a new user record with active roles."""
    hashed = hash_password(plain_password)
    user = User(
        email=email.lower(),
        hashed_password=hashed,
        is_active=True,
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def increment_failed_login_attempts(db: Session, user: User, max_attempts: int, lock_minutes: int) -> Tuple[int, Optional[datetime]]:
    """Increments failure logs and auto-locks account if it hits threshold limits."""
    user.failed_login_attempts += 1
    lock_until = None
    if user.failed_login_attempts >= max_attempts:
        lock_until = datetime.utcnow() + timedelta(minutes=lock_minutes)
        user.locked_until = lock_until
        logger.warning(f"User account locked due to security attempts limit: {user.email}")
    db.commit()
    db.refresh(user)
    return user.failed_login_attempts, lock_until

def reset_failed_login_attempts(db: Session, user: User) -> None:
    """Resets failed logs upon a successful login."""
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

# --- SESSIONS & REFRESH TOKENS ---

def create_user_session(
    db: Session, 
    user_id: str, 
    refresh_token_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    device_type: Optional[str] = None,
    browser: Optional[str] = None,
    remember_me: bool = False
) -> UserSession:
    """Stores active login session parameters in the audit tracking database."""
    expiry_days = 30 if remember_me else 1
    expires_at = datetime.utcnow() + timedelta(days=expiry_days)
    
    session = UserSession(
        user_id=user_id,
        refresh_token_id=refresh_token_id,
        ip_address=ip_address,
        user_agent=user_agent,
        device_type=device_type,
        browser=browser,
        is_active=True,
        expires_at=expires_at
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def invalidate_user_session(db: Session, session_id: str) -> bool:
    """Marks user session as inactive upon explicit logout requests."""
    session = db.query(UserSession).filter(UserSession.id == session_id).first()
    if session:
        session.is_active = False
        db.commit()
        return True
    return False

def create_refresh_token_record(db: Session, user_id: str, token: str, expires_in_days: int) -> RefreshToken:
    """Caches refresh token records to allow access token rotations."""
    expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
    record = RefreshToken(
        token=token,
        user_id=user_id,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def revoke_refresh_token_record(db: Session, token: str) -> bool:
    """Revokes refresh tokens to block session reuse."""
    record = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    if record:
        record.is_revoked = True
        db.commit()
        return True
    return False

# --- VERIFICATIONS & RESET TOKENS ---

def generate_email_verification_token(db: Session, email: str) -> str:
    """Generates unique email validation links valid for 24 hours."""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    record = EmailVerificationToken(
        email=email.lower(),
        token=token,
        expires_at=expires_at,
        is_used=False
    )
    db.add(record)
    db.commit()
    return token

def verify_email_token_check(db: Session, token: str) -> Optional[str]:
    """Validates the link code and triggers verification flags."""
    record = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token == token,
        EmailVerificationToken.expires_at > datetime.utcnow(),
        EmailVerificationToken.is_used == False
    ).first()
    
    if record:
        record.is_used = True
        # Mark target user email as verified
        user = get_user_by_email(db, record.email)
        if user:
            user.is_verified = True
        db.commit()
        return record.email
    return None

def generate_password_reset_token(db: Session, email: str) -> str:
    """Generates password recovery reset tokens valid for 1 hour."""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    record = PasswordResetToken(
        email=email.lower(),
        token=token,
        expires_at=expires_at,
        is_used=False
    )
    db.add(record)
    db.commit()
    return token

def verify_password_reset_token(db: Session, token: str) -> Optional[str]:
    """Verifies validity of recovery payload tokens."""
    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.expires_at > datetime.utcnow(),
        PasswordResetToken.is_used == False
    ).first()
    
    if record:
        record.is_used = True
        db.commit()
        return record.email
    return None

# --- RBAC INITIALIZATION & RETRIEVAL ---

def assign_role_to_user(db: Session, user: User, role_name: str) -> None:
    """Associates standard system access group configurations directly to a user."""
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(name=role_name, description=f"Automatic provisioned group {role_name}")
        db.add(role)
        db.commit()
        db.refresh(role)
    if role not in user.roles:
        user.roles.append(role)
        db.commit()

def get_flattened_permissions(user: User) -> List[str]:
    """Gathers all associated system privileges mapped across current user roles."""
    permissions = set()
    for role in user.roles:
        for perm in role.permissions:
            permissions.add(perm.name)
    return list(permissions)
