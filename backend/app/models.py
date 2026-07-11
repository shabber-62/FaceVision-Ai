import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Table, Float, Date
from sqlalchemy.orm import relationship
from app.database import Base

# Association Tables for M2M structures
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", String(36), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # 2FA / OTP Configuration
    is_two_factor_enabled = Column(Boolean, default=False, nullable=False)
    otp_secret = Column(String(100), nullable=True)
    
    # Account Lockout parameters
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    
    # Audit metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False) # e.g. "Super Admin", "Admin", "Faculty", "Student", "Security", "Parent"
    description = Column(String(255), nullable=True)
    
    # Relationships
    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False) # e.g. "View Students", "Create Students", "Edit Students", "Delete Students" etc.
    description = Column(String(255), nullable=True)
    
    # Relationships
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    refresh_token_id = Column(String(36), nullable=True) # References the active RefreshToken ID
    
    # Device / Location tracking
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    device_type = Column(String(100), nullable=True) # e.g. "Desktop", "Mobile", "Tablet"
    browser = Column(String(100), nullable=True)
    
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="sessions")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    token = Column(String(500), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="refresh_tokens")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), index=True, nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), index=True, nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(100), unique=True, index=True, nullable=False)
    roll_number = Column(String(100), unique=True, index=True, nullable=False)
    
    # Profile & Bio
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    dob = Column(String(50), nullable=True)
    gender = Column(String(50), nullable=True)
    blood_group = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    
    # Academics
    department = Column(String(100), index=True, nullable=False)
    course = Column(String(100), index=True, nullable=False)
    program = Column(String(100), nullable=False)
    academic_year = Column(String(50), nullable=False)
    semester = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    section = Column(String(50), index=True, nullable=True)
    group = Column(String(50), index=True, nullable=True)
    batch = Column(String(50), nullable=True)
    
    # Guardian / Emergency
    guardian_name = Column(String(255), nullable=True)
    guardian_phone = Column(String(50), nullable=True)
    emergency_contact = Column(String(255), nullable=True)
    
    # Status & AI features
    student_photo = Column(String(500), nullable=True)
    attendance_percentage = Column(Float, default=0.0, nullable=False)
    face_registered = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="active", index=True, nullable=False) # e.g. "active", "suspended", "graduated"
    
    # Soft delete
    is_deleted = Column(Boolean, default=False, index=True, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    faculty_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    class_id = Column(String(100), index=True, nullable=False)
    subject_id = Column(String(100), index=True, nullable=False)
    period = Column(String(50), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(50), default="active", index=True, nullable=False)  # "active", "completed", "locked"
    is_locked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("attendance_sessions.id", ondelete="CASCADE"), nullable=True)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="present", index=True, nullable=False)  # "present", "absent", "late", "excused"
    confidence = Column(Float, nullable=True)
    marked_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_manual = Column(Boolean, default=False, nullable=False)
    marked_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks = Column(String(255), nullable=True)
    is_late = Column(Boolean, default=False, nullable=False)
    is_early_exit = Column(Boolean, default=False, nullable=False)


class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("attendance_sessions.id", ondelete="SET NULL"), nullable=True)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="SET NULL"), nullable=True)
    raw_image_path = Column(String(500), nullable=True)
    confidence = Column(Float, nullable=True)
    status = Column(String(50), nullable=False)  # "success", "failed", "low_confidence", "unknown_face"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ManualAttendance(Base):
    __tablename__ = "manual_attendance"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attendance_id = Column(String(36), ForeignKey("attendance.id", ondelete="CASCADE"), nullable=False)
    faculty_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AttendanceCorrection(Base):
    __tablename__ = "attendance_corrections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attendance_id = Column(String(36), ForeignKey("attendance.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    requested_status = Column(String(50), nullable=False)  # "present", "excused", "absent"
    reason = Column(String(500), nullable=False)
    status = Column(String(50), default="pending", index=True, nullable=False)  # "pending", "approved", "rejected"
    approved_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rejection_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    leave_type = Column(String(100), nullable=False)  # "medical", "casual", "duty_leave"
    reason = Column(String(500), nullable=False)
    status = Column(String(50), default="pending", index=True, nullable=False)  # "pending", "approved", "rejected"
    approved_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AttendanceSummary(Base):
    __tablename__ = "attendance_summary"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(100), index=True, nullable=False)
    total_sessions = Column(Integer, default=0, nullable=False)
    attended_sessions = Column(Integer, default=0, nullable=False)
    attendance_percentage = Column(Float, default=0.0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


# --- CAMERA MANAGEMENT PLATFORM MODELS ---

class CameraGroup(Base):
    __tablename__ = "camera_groups"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    cameras = relationship("Camera", back_populates="group")


class CameraLocation(Base):
    __tablename__ = "camera_locations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    cameras = relationship("Camera", back_populates="location")


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)
    type = Column(String(50), nullable=False)  # "USB", "IP", "RTSP"
    connection_string = Column(String(500), nullable=False)  # e.g., "rtsp://...", "/dev/video0", "0"
    ip_address = Column(String(100), nullable=True)
    port = Column(Integer, nullable=True)
    rtsp_url = Column(String(500), nullable=True)
    onvif_profile = Column(String(100), nullable=True)
    status = Column(String(50), default="disconnected", index=True, nullable=False)  # "connected", "disconnected", "error", "streaming"
    resolution = Column(String(50), nullable=True)  # e.g., "1920x1080"
    fps = Column(Integer, default=30, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    group_id = Column(String(36), ForeignKey("camera_groups.id", ondelete="SET NULL"), nullable=True)
    location_id = Column(String(36), ForeignKey("camera_locations.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    group = relationship("CameraGroup", back_populates="cameras")
    location = relationship("CameraLocation", back_populates="cameras")
    health = relationship("CameraHealth", back_populates="camera", uselist=False, cascade="all, delete-orphan")
    recordings = relationship("CameraRecording", back_populates="camera", cascade="all, delete-orphan")
    logs = relationship("CameraLog", back_populates="camera", cascade="all, delete-orphan")
    assignments = relationship("CameraAssignment", back_populates="camera", cascade="all, delete-orphan")


class CameraHealth(Base):
    __tablename__ = "camera_health"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="CASCADE"), unique=True, nullable=False)
    is_online = Column(Boolean, default=False, nullable=False)
    current_fps = Column(Float, default=0.0, nullable=False)
    current_resolution = Column(String(50), nullable=True)
    latency_ms = Column(Float, default=0.0, nullable=False)
    dropped_frames = Column(Integer, default=0, nullable=False)
    cpu_usage = Column(Float, default=0.0, nullable=False)
    memory_usage = Column(Float, default=0.0, nullable=False)
    temperature_c = Column(Float, default=0.0, nullable=False)
    last_ping = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    camera = relationship("Camera", back_populates="health")


class CameraRecording(Base):
    __tablename__ = "camera_recordings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    file_path = Column(String(500), nullable=True)
    file_size_mb = Column(Float, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    status = Column(String(50), default="recording", nullable=False)  # "recording", "completed", "failed"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    camera = relationship("Camera", back_populates="recordings")


class CameraLog(Base):
    __tablename__ = "camera_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), index=True, nullable=False)  # "Camera Connected", "Camera Disconnected", "Camera Error", etc.
    message = Column(String(500), nullable=False)
    level = Column(String(50), default="info", nullable=False)  # "info", "warning", "error"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    camera = relationship("Camera", back_populates="logs")


class CameraAssignment(Base):
    __tablename__ = "camera_assignments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)
    assigned_to_class_id = Column(String(100), index=True, nullable=True)  # Links camera with target student batch / class
    purpose = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    camera = relationship("Camera", back_populates="assignments")



