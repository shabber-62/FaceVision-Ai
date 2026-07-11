import io
from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.dependencies import PermissionChecker
from app.routes.auth import get_current_user
from app.schemas import UserResponse
from app.schemas_camera import (
    CameraRegisterRequest, CameraUpdateRequest, CameraResponse,
    CameraHealthResponse, CameraRecordingResponse, CameraLogResponse,
    CameraAssignmentCreate, CameraAssignmentResponse, CameraGroupCreate,
    CameraGroupResponse, CameraLocationCreate, CameraLocationResponse
)
from app.services.camera import CameraService
from app.services.camera_manager import camera_manager
from app.websocket_manager import manager

router = APIRouter(prefix="/camera", tags=["Camera Management & Live Streaming Platform"])

# --- CAMERA GROUPS ENDPOINTS ---

@router.post(
    "/groups",
    response_model=CameraGroupResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
def create_camera_group(
    schema: CameraGroupCreate,
    db: Session = Depends(get_db)
):
    """Creates a new camera group classification tag."""
    service = CameraService(db)
    return service.create_camera_group(schema)


@router.get(
    "/groups",
    response_model=List[CameraGroupResponse],
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def list_camera_groups(
    db: Session = Depends(get_db)
):
    """Retrieves all registered camera groups."""
    service = CameraService(db)
    return service.list_camera_groups()


# --- CAMERA LOCATIONS ENDPOINTS ---

@router.post(
    "/locations",
    response_model=CameraLocationResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
def create_camera_location(
    schema: CameraLocationCreate,
    db: Session = Depends(get_db)
):
    """Creates a physical camera location label."""
    service = CameraService(db)
    return service.create_camera_location(schema)


@router.get(
    "/locations",
    response_model=List[CameraLocationResponse],
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def list_camera_locations(
    db: Session = Depends(get_db)
):
    """Retrieves all registered camera locations."""
    service = CameraService(db)
    return service.list_camera_locations()


# --- CORE CAMERA CRUD ENDPOINTS ---

@router.post(
    "/register",
    response_model=CameraResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
async def register_camera(
    schema: CameraRegisterRequest,
    db: Session = Depends(get_db)
):
    """Registers a new physical or virtual camera connection into the database registry."""
    service = CameraService(db)
    return await service.register_camera(schema)


@router.get(
    "/list",
    response_model=List[CameraResponse],
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def list_cameras(
    is_active: Optional[bool] = Query(None, description="Filter active/inactive cameras"),
    db: Session = Depends(get_db)
):
    """Lists all camera channels registered under local nodes."""
    service = CameraService(db)
    return service.list_cameras(is_active)


@router.get(
    "/{id}",
    response_model=CameraResponse,
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def get_camera_details(
    id: str,
    db: Session = Depends(get_db)
):
    """Fetches details for a single registered camera."""
    service = CameraService(db)
    return service.get_camera(id)


@router.put(
    "/{id}",
    response_model=CameraResponse,
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
async def update_camera_details(
    id: str,
    schema: CameraUpdateRequest,
    db: Session = Depends(get_db)
):
    """Updates specifications for a registered camera."""
    service = CameraService(db)
    return await service.update_camera(id, schema)


@router.delete(
    "/{id}",
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
async def delete_camera(
    id: str,
    db: Session = Depends(get_db)
):
    """Unregisters a camera connection and stops all active streaming loops."""
    service = CameraService(db)
    return await service.delete_camera(id)


# --- STREAM CHANNEL CONTROLLER ENDPOINTS ---

@router.post(
    "/start",
    response_model=CameraResponse,
    dependencies=[Depends(PermissionChecker(["Control Streams"]))]
)
async def start_camera_stream(
    camera_id: str = Query(..., description="Target camera UUID"),
    db: Session = Depends(get_db)
):
    """Starts the background capture and streaming processes for a camera."""
    service = CameraService(db)
    return await service.start_camera_stream(camera_id)


@router.post(
    "/stop",
    response_model=CameraResponse,
    dependencies=[Depends(PermissionChecker(["Control Streams"]))]
)
async def stop_camera_stream(
    camera_id: str = Query(..., description="Target camera UUID"),
    db: Session = Depends(get_db)
):
    """Gracefully terminates active streaming capture threads for a camera."""
    service = CameraService(db)
    return await service.stop_camera_stream(camera_id)


@router.post(
    "/restart",
    response_model=CameraResponse,
    dependencies=[Depends(PermissionChecker(["Control Streams"]))]
)
async def restart_camera_stream(
    camera_id: str = Query(..., description="Target camera UUID"),
    db: Session = Depends(get_db)
):
    """Restarts the background camera streaming process (recycles connection)."""
    service = CameraService(db)
    return await service.restart_camera_stream(camera_id)


# --- HEALTH MONITORING ENDPOINTS ---

@router.get(
    "/health",
    response_model=List[CameraHealthResponse],
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
async def get_all_camera_health(
    db: Session = Depends(get_db)
):
    """Polls real-time hardware status metrics (CPU, Memory, FPS, Latency) across all channels."""
    service = CameraService(db)
    return await service.list_all_camera_health()


@router.get(
    "/{camera_id}/health",
    response_model=CameraHealthResponse,
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
async def get_single_camera_health(
    camera_id: str,
    db: Session = Depends(get_db)
):
    """Triggers telemetry refresh and pulls operational stats for a specific camera."""
    service = CameraService(db)
    return await service.collect_camera_health(camera_id)


# --- LIVE VIDEO STREAMING AND SNAPSHOT CHANNELS ---

@router.get(
    "/live/{camera_id}",
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def get_live_mjpeg_stream(
    camera_id: str
):
    """
    Feeds a low-latency multipart/x-mixed-replace MJPEG raw frame stream.
    Can be loaded directly into `<img src='/api/v1/camera/live/...'>`.
    """
    return StreamingResponse(
        camera_manager.get_frame_stream(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.get(
    "/snapshot/{camera_id}",
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def get_snapshot_image(
    camera_id: str
):
    """Retrieves a single JPEG capture from the specified active channel."""
    frame = camera_manager.get_static_snapshot(camera_id)
    if not frame:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Camera stream is offline and failed to return a snapshot."
        )
    return Response(content=frame, media_type="image/jpeg")


# --- VIDEO RECORDING ENDPOINTS ---

@router.post(
    "/record/start",
    response_model=CameraRecordingResponse,
    dependencies=[Depends(PermissionChecker(["Control Streams"]))]
)
async def start_video_recording(
    camera_id: str = Query(..., description="Target camera UUID"),
    db: Session = Depends(get_db)
):
    """Triggers file write capture logs on standard storage folders."""
    service = CameraService(db)
    return await service.start_camera_recording(camera_id)


@router.post(
    "/record/stop",
    response_model=CameraRecordingResponse,
    dependencies=[Depends(PermissionChecker(["Control Streams"]))]
)
async def stop_video_recording(
    camera_id: str = Query(..., description="Target camera UUID"),
    db: Session = Depends(get_db)
):
    """Closes the current video file write handle, calculating file properties."""
    service = CameraService(db)
    return await service.stop_camera_recording(camera_id)


# --- EVENT LOGS ENDPOINTS ---

@router.get(
    "/{camera_id}/logs",
    response_model=List[CameraLogResponse],
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def get_camera_event_logs(
    camera_id: str,
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retrieves structural historical logs (e.g. Disconnects, Error alerts, Trigger captures) for audit reviews."""
    service = CameraService(db)
    return service.get_camera_logs(camera_id, limit)


# --- CAMERA BATCH CLASS ASSIGNMENT ENDPOINTS ---

@router.post(
    "/assign",
    response_model=CameraAssignmentResponse,
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
def assign_camera_to_classroom(
    schema: CameraAssignmentCreate,
    db: Session = Depends(get_db)
):
    """Binds a camera to a classroom session for face verification pipelines."""
    service = CameraService(db)
    return service.assign_camera_to_classroom(schema)


@router.get(
    "/assignment/class/{class_id}",
    response_model=List[CameraAssignmentResponse],
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def list_classroom_camera_assignments(
    class_id: str,
    db: Session = Depends(get_db)
):
    """Fetches all cameras currently linked to the specified academic batch."""
    service = CameraService(db)
    return service.get_classroom_camera_assignments(class_id)
