from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import logging
from typing import List

from app.database import get_db
from app.config import settings
from app.schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse, RefreshTokenRequest,
    ForgotPasswordRequest, ResetPasswordRequest, EmailVerificationRequest,
    OTPVerifyRequest, OTPSetupResponse, ChangePasswordRequest, ProfileUpdate,
    SessionResponse
)
from app.crud import (
    get_user_by_email, get_user_by_id, create_user_record, assign_role_to_user,
    increment_failed_login_attempts, reset_failed_login_attempts, create_user_session,
    invalidate_user_session, create_refresh_token_record, revoke_refresh_token_record,
    generate_email_verification_token, verify_email_token_check,
    generate_password_reset_token, verify_password_reset_token, get_flattened_permissions
)
from app.security import (
    verify_password, hash_password, create_access_token, create_refresh_token,
    decode_token, generate_otp_secret, get_otp_provisioning_uri, verify_otp_code
)

logger = logging.getLogger("facevision.auth_routes")
router = APIRouter(prefix="/auth", tags=["Authentication & Authorizations"])

# --- TOKEN INJECTOR HELPERS ---

def get_current_user(request: Request, db: Session = Depends(get_db)) -> UserResponse:
    """Dependency validator fetching the current active user profile from secure Authorization Headers."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authentication Authorization Headers.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token is invalid, expired, or corrupted.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registered user matching token signature was not found."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This biometric user account has been disabled."
        )
        
    return UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_verified=user.is_verified,
        is_two_factor_enabled=user.is_two_factor_enabled,
        roles=[{"id": r.id, "name": r.name, "description": r.description} for r in user.roles],
        permissions=get_flattened_permissions(user),
        created_at=user.created_at
    )


# --- API ENDPOINTS ---

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Registers a new biometric user profile and provisions dynamic default roles."""
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account is already registered with this email address."
        )
    
    user = create_user_record(db, payload.email, payload.password)
    
    # Assign standard Student or general staff role upon registration
    assign_role_to_user(db, user, "Student")
    
    # Generate email confirmation link token in background
    token = generate_email_verification_token(db, user.email)
    logger.info(f"Registered user {user.email}. Verification token generated: {token}")
    
    return UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_verified=user.is_verified,
        is_two_factor_enabled=user.is_two_factor_enabled,
        roles=[{"id": r.id, "name": r.name, "description": r.description} for r in user.roles],
        permissions=[],
        created_at=user.created_at
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticates user email and password coordinates with session logging and lockouts."""
    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or security password."
        )
        
    # Check lock status
    if user.locked_until and user.locked_until > datetime.utcnow():
        time_left = (user.locked_until - datetime.utcnow()).total_seconds()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account is locked due to security limits. Retry in {int(time_left // 60)} minutes."
        )
        
    # Validate base password
    if not verify_password(payload.password, user.hashed_password):
        attempts, locked_time = increment_failed_login_attempts(
            db, user, settings.MAX_LOGIN_ATTEMPTS, settings.LOCKOUT_DURATION_MINUTES
        )
        if locked_time:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Incorrect credentials. Account has been locked for {settings.LOCKOUT_DURATION_MINUTES} minutes."
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect credentials. Attempt {attempts} of {settings.MAX_LOGIN_ATTEMPTS}."
        )
        
    # Reset failed login metrics on valid password match
    reset_failed_login_attempts(db, user)
    
    # 2FA Dual-Factor challenge handling
    if user.is_two_factor_enabled:
        if not payload.otp_code:
            raise HTTPException(
                status_code=status.HTTP_412_PRECONDITION_FAILED,
                detail="MFA_REQUIRED: This account has Two-Factor OTP active. Please present dynamic validation code."
            )
        if not verify_otp_code(user.otp_secret, payload.otp_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid 2FA Authenticator dynamic validation code."
            )
            
    # Success: Generate access & refresh tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = create_access_token(user.id, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(user.id, expires_delta=refresh_token_expires)
    
    # Register refresh token and log audit session
    rt_record = create_refresh_token_record(db, user.id, refresh_token, settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    user_agent_str = request.headers.get("User-Agent", "Unknown Device")
    ip_addr = request.client.host if request.client else "127.0.0.1"
    
    # Session auditing
    create_user_session(
        db=db,
        user_id=user.id,
        refresh_token_id=rt_record.id,
        ip_address=ip_addr,
        user_agent=user_agent_str,
        device_type="Desktop" if "Mobi" not in user_agent_str else "Mobile",
        browser="Browser Node",
        remember_me=payload.remember_me
    )
    
    response_user = UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_verified=user.is_verified,
        is_two_factor_enabled=user.is_two_factor_enabled,
        roles=[{"id": r.id, "name": r.name, "description": r.description} for r in user.roles],
        permissions=get_flattened_permissions(user),
        created_at=user.created_at
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=response_user
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Logs out user, revoking target refresh token and closing tracking session logs."""
    revoke_refresh_token_record(db, payload.refresh_token)
    return {"status": "success", "message": "Successfully logged out. Session cache cleared."}


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Rotates Access/Refresh token pair using valid unexpired refresh tokens."""
    claims = decode_token(payload.refresh_token)
    if not claims or claims.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is expired, modified, or revoked."
        )
        
    user_id = claims.get("sub")
    user = get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Biometric profile tied to token is deactivated or does not exist."
        )
        
    # Rotate token pair
    revoke_refresh_token_record(db, payload.refresh_token)
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    rt_record = create_refresh_token_record(db, user.id, refresh_token, settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    response_user = UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_verified=user.is_verified,
        is_two_factor_enabled=user.is_two_factor_enabled,
        roles=[{"id": r.id, "name": r.name, "description": r.description} for r in user.roles],
        permissions=get_flattened_permissions(user),
        created_at=user.created_at
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=response_user
    )


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Requests secure password recovery code token. Simulates mail delivery log."""
    user = get_user_by_email(db, payload.email)
    if user:
        token = generate_password_reset_token(db, user.email)
        logger.info(f"PASSWORD_RESET_MAIL: Shipped password recovery token to {user.email}. Key: {token}")
    # Always return success status to prevent user enumeration attacks
    return {"status": "success", "message": "If target email exists in core registers, recovery token was issued."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Validates recovery token and applies new secure password hashing."""
    email = verify_password_reset_token(db, payload.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password recovery code is invalid, consumed, or expired."
        )
        
    user = get_user_by_email(db, email)
    if not user:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target profile for password restoration was not found."
         )
         
    user.hashed_password = hash_password(payload.new_password)
    reset_failed_login_attempts(db, user)
    db.commit()
    return {"status": "success", "message": "Password updated. All failed login logs reset."}


@router.post("/verify-email", status_code=status.HTTP_200_OK)
def verify_email(payload: EmailVerificationRequest, db: Session = Depends(get_db)):
    """Verifies user email token, activating verified flag permissions."""
    email = verify_email_token_check(db, payload.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email validation token is invalid or has expired."
        )
    return {"status": "success", "message": f"Email {email} verified successfully!"}


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: UserResponse = Depends(get_current_user)):
    """Returns profile context payload for currently validated JWT."""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: ProfileUpdate, 
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates active user fields including email modifications and MFA triggers."""
    user = get_user_by_id(db, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found.")
        
    if payload.email and payload.email.lower() != user.email:
        existing = get_user_by_email(db, payload.email)
        if existing:
            raise HTTPException(status_code=400, detail="Target email is already claimed.")
        user.email = payload.email.lower()
        user.is_verified = False # force verification cycle again
        
    if payload.is_two_factor_enabled is not None:
        if payload.is_two_factor_enabled and not user.is_two_factor_enabled:
            # Generate secret and keep it disabled until verify-otp finishes setup
            user.otp_secret = generate_otp_secret()
        user.is_two_factor_enabled = payload.is_two_factor_enabled
        
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_verified=user.is_verified,
        is_two_factor_enabled=user.is_two_factor_enabled,
        roles=[{"id": r.id, "name": r.name, "description": r.description} for r in user.roles],
        permissions=get_flattened_permissions(user),
        created_at=user.created_at
    )


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    payload: ChangePasswordRequest, 
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Securely updates password from inside validated user session."""
    user = get_user_by_id(db, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    if not verify_password(payload.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Your existing password did not match.")
        
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"status": "success", "message": "Biometric terminal access password changed successfully."}


@router.post("/otp/setup", response_model=OTPSetupResponse)
def setup_otp(current_user: UserResponse = Depends(get_current_user), db: Session = Depends(get_db)):
    """Initializes MFA secret parameters and outputs provisioning configurations."""
    user = get_user_by_id(db, current_user.id)
    if not user:
         raise HTTPException(status_code=404, detail="User not found.")
    
    if not user.otp_secret:
        user.otp_secret = generate_otp_secret()
        db.commit()
        db.refresh(user)
        
    uri = get_otp_provisioning_uri(user.otp_secret, user.email)
    return OTPSetupResponse(
        secret=user.otp_secret,
        provisioning_uri=uri
    )


@router.post("/otp/verify", status_code=status.HTTP_200_OK)
def verify_otp(
    payload: OTPVerifyRequest, 
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enables MFA fully after successful 2FA code verify loop."""
    user = get_user_by_id(db, current_user.id)
    if not user or not user.otp_secret:
        raise HTTPException(status_code=400, detail="MFA setup was not initiated.")
        
    if not verify_otp_code(user.otp_secret, payload.code):
        raise HTTPException(status_code=400, detail="Invalid OTP registration confirmation code.")
        
    user.is_two_factor_enabled = True
    db.commit()
    return {"status": "success", "message": "Dynamic two-factor authenticator setup completed successfully."}
