from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- CAMERA GROUP SCHEMAS ---

class CameraGroupCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="The name of the camera group, e.g. Exterior Cameras")
    description: Optional[str] = Field(None, max_length=255, description="Brief description of the group purpose")

class CameraGroupResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- CAMERA LOCATION SCHEMAS ---

class CameraLocationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="The name of the camera location, e.g. Main Lobby")
    description: Optional[str] = Field(None, max_length=255, description="Brief description of the physical location")

class CameraLocationResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- CAMERA SCHEMAS ---

class CameraRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Friendly unique camera identifier")
    type: str = Field("RTSP", description="Camera hardware protocol interface: USB, IP, RTSP")
    connection_string: str = Field(..., description="Access descriptor. RTSP link, local device node, or IP address")
    ip_address: Optional[str] = Field(None, description="IP Address for IP/RTSP cameras")
    port: Optional[int] = Field(None, ge=1, le=65535, description="Network connection port")
    rtsp_url: Optional[str] = Field(None, description="Detailed RTSP connection URI")
    onvif_profile: Optional[str] = Field(None, description="ONVIF discovery profile code")
    resolution: Optional[str] = Field("1920x1080", description="Expected frame layout width x height")
    fps: int = Field(30, ge=1, le=120, description="Target frame capture frequency")
    group_id: Optional[str] = Field(None, description="Camera group classification UUID")
    location_id: Optional[str] = Field(None, description="Location classification UUID")

class CameraUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    type: Optional[str] = Field(None, description="USB, IP, RTSP")
    connection_string: Optional[str] = None
    ip_address: Optional[str] = None
    port: Optional[int] = Field(None, ge=1, le=65535)
    rtsp_url: Optional[str] = None
    onvif_profile: Optional[str] = None
    resolution: Optional[str] = None
    fps: Optional[int] = Field(None, ge=1, le=120)
    group_id: Optional[str] = None
    location_id: Optional[str] = None
    is_active: Optional[bool] = None

class CameraResponse(BaseModel):
    id: str
    name: str
    type: str
    connection_string: str
    ip_address: Optional[str] = None
    port: Optional[int] = None
    rtsp_url: Optional[str] = None
    onvif_profile: Optional[str] = None
    status: str
    resolution: Optional[str] = None
    fps: int
    is_active: bool
    group_id: Optional[str] = None
    location_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    group: Optional[CameraGroupResponse] = None
    location: Optional[CameraLocationResponse] = None

    class Config:
        from_attributes = True


# --- CAMERA HEALTH MONITORING SCHEMAS ---

class CameraHealthResponse(BaseModel):
    id: str
    camera_id: str
    is_online: bool
    current_fps: float
    current_resolution: Optional[str] = None
    latency_ms: float
    dropped_frames: int
    cpu_usage: float
    memory_usage: float
    temperature_c: float
    last_ping: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- CAMERA RECORDINGS SCHEMAS ---

class RecordingStartRequest(BaseModel):
    camera_id: str = Field(..., description="Target camera UUID to trigger video recording on")

class CameraRecordingResponse(BaseModel):
    id: str
    camera_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    file_path: Optional[str] = None
    file_size_mb: Optional[float] = None
    duration_seconds: Optional[float] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- CAMERA LOGS SCHEMAS ---

class CameraLogResponse(BaseModel):
    id: str
    camera_id: str
    event_type: str
    message: str
    level: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- CAMERA ASSIGNMENT SCHEMAS ---

class CameraAssignmentCreate(BaseModel):
    camera_id: str = Field(..., description="Target camera UUID to assign")
    assigned_to_class_id: str = Field(..., description="Target academic batch code/classroom, e.g. CS-A-2023")
    purpose: Optional[str] = Field("Attendance Face Capture", description="Purpose of assignment")

class CameraAssignmentResponse(BaseModel):
    id: str
    camera_id: str
    assigned_to_class_id: Optional[str] = None
    purpose: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
