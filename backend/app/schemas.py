from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import List, Optional
from datetime import datetime

class RoleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class PermissionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# --- USER PROFILE & REGISTRATION SCHEMAS ---

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Must be at least 8 characters.")
    password_confirm: str = Field(..., min_length=8)

    @model_validator(mode='after')
    def passwords_match(self) -> 'UserRegister':
        if self.password != self.password_confirm:
            raise ValueError("passwords do not match")
        return self

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    otp_code: Optional[str] = Field(None, description="6-digit dynamic OTP if 2FA is active")
    remember_me: bool = False

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    is_verified: bool
    is_two_factor_enabled: bool
    roles: List[RoleResponse] = []
    permissions: List[str] = [] # Flattened list of permission names for frontend optimization
    created_at: datetime

    class Config:
        from_attributes = True

# --- TOKEN & SESSIONS ---

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int # access token expiry in seconds
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class SessionResponse(BaseModel):
    id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_type: Optional[str] = None
    browser: Optional[str] = None
    is_active: bool
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

# --- AUTH VERIFICATIONS ---

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class EmailVerificationRequest(BaseModel):
    token: str

class OTPVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, description="6-digit numerical OTP")

class OTPSetupResponse(BaseModel):
    secret: str
    provisioning_uri: str
    message: str = "Scan this QR code in your Authenticator app (Google, Microsoft) or enter secret manually."

# --- PROFILE MODIFICATIONS ---

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class ProfileUpdate(BaseModel):
    email: Optional[EmailStr] = None
    is_two_factor_enabled: Optional[bool] = None
