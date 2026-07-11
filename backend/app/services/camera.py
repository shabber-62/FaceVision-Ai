from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional, Dict
from datetime import datetime
import os
import random

from app.repositories.camera import CameraRepository
from app.schemas_camera import (
    CameraRegisterRequest, CameraUpdateRequest, CameraGroupCreate,
    CameraLocationCreate, CameraAssignmentCreate, CameraResponse,
    CameraHealthResponse, CameraRecordingResponse, CameraLogResponse,
    CameraAssignmentResponse, CameraGroupResponse, CameraLocationResponse
)
from app.services.camera_manager import camera_manager
from app.websocket_manager import manager

class CameraService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = CameraRepository(db)

    # --- CAMERA GROUPS PIPELINES ---

    def create_camera_group(self, schema: CameraGroupCreate) -> CameraGroupResponse:
        existing = self.repository.get_group_by_name(schema.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Camera group '{schema.name}' already exists."
            )
        return self.repository.create_group(schema)

    def list_camera_groups(self) -> List[CameraGroupResponse]:
        return self.repository.get_all_groups()


    # --- CAMERA LOCATIONS PIPELINES ---

    def create_camera_location(self, schema: CameraLocationCreate) -> CameraLocationResponse:
        existing = self.repository.get_location_by_name(schema.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Camera location '{schema.name}' already exists."
            )
        return self.repository.create_location(schema)

    def list_camera_locations(self) -> List[CameraLocationResponse]:
        return self.repository.get_all_locations()


    # --- CAMERA LIFECYCLE PIPELINES ---

    async def register_camera(self, schema: CameraRegisterRequest) -> CameraResponse:
        """Saves a camera registration, logs the registration event, and triggers status websocket."""
        existing = self.repository.get_camera_by_name(schema.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Camera with name '{schema.name}' already registered."
            )

        camera = self.repository.register_camera(schema)
        
        # Log event
        self.repository.create_log(
            camera_id=camera.id,
            event_type="Camera Registered",
            message=f"Camera '{camera.name}' has been successfully registered to the database with connection parameters.",
            level="info"
        )

        # Broadcast WS Status
        await manager.broadcast({
            "event": "CameraCreated",
            "camera_id": camera.id,
            "name": camera.name,
            "status": camera.status
        })

        return camera

    def list_cameras(self, is_active: Optional[bool] = None) -> List[CameraResponse]:
        return self.repository.get_all_cameras(is_active)

    def get_camera(self, camera_id: str) -> CameraResponse:
        camera = self.repository.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target camera registration not found."
            )
        return camera

    async def update_camera(self, camera_id: str, schema: CameraUpdateRequest) -> CameraResponse:
        camera = self.repository.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target camera registration not found."
            )

        updated_camera = self.repository.update_camera(camera, schema)
        
        # Log event
        self.repository.create_log(
            camera_id=updated_camera.id,
            event_type="Camera Config Updated",
            message="Camera connection variables or tags were updated by user request.",
            level="info"
        )

        # Broadcast WS change
        await manager.broadcast({
            "event": "CameraUpdated",
            "camera_id": updated_camera.id,
            "name": updated_camera.name,
            "status": updated_camera.status
        })

        # If camera is streaming, restart to apply new properties
        if updated_camera.status == "streaming":
            await self.restart_camera_stream(updated_camera.id)

        return updated_camera

    async def delete_camera(self, camera_id: str) -> dict:
        camera = self.repository.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target camera registration not found."
            )

        # Stop active stream first
        camera_manager.stop_stream(camera.id)

        name = camera.name
        self.repository.delete_camera(camera)

        # Broadcast WS delete
        await manager.broadcast({
            "event": "CameraDeleted",
            "camera_id": camera_id,
            "name": name
        })

        return {"message": f"Camera '{name}' successfully deleted from database registries."}


    # --- STREAM ENGINE CONTROL PIPELINES ---

    async def start_camera_stream(self, camera_id: str) -> CameraResponse:
        """Initializes actual capture thread and updates database states."""
        camera = self.repository.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target camera registration not found."
            )

        # Spin up OpenCV capture worker
        camera_manager.register_and_start_stream(
            camera_id=camera.id,
            connection_string=camera.connection_string,
            resolution=camera.resolution or "1920x1080",
            fps=camera.fps or 30
        )

        # Update Database
        updated = self.repository.update_camera_status(camera.id, "streaming")
        self.repository.update_camera_health(camera.id, is_online=True, current_fps=camera.fps)

        # Log
        self.repository.create_log(
            camera_id=camera.id,
            event_type="Camera Connected",
            message=f"Live stream worker thread successfully initialized. Capture channel opened: {camera.connection_string}",
            level="info"
        )

        # Broadcast
        await manager.broadcast({
            "event": "CameraConnected",
            "camera_id": camera.id,
            "name": camera.name,
            "status": "streaming"
        })

        return updated

    async def stop_camera_stream(self, camera_id: str) -> CameraResponse:
        """Halt streaming thread cleanly."""
        camera = self.repository.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target camera registration not found."
            )

        # Shut thread
        camera_manager.stop_stream(camera.id)

        # Update DB status
        updated = self.repository.update_camera_status(camera.id, "disconnected")
        self.repository.update_camera_health(camera.id, is_online=False, current_fps=0.0)

        # Log
        self.repository.create_log(
            camera_id=camera.id,
            event_type="Camera Disconnected",
            message="Active surveillance channel was stopped cleanly by operator request.",
            level="info"
        )

        # Broadcast
        await manager.broadcast({
            "event": "CameraDisconnected",
            "camera_id": camera.id,
            "name": camera.name,
            "status": "disconnected"
        })

        return updated

    async def restart_camera_stream(self, camera_id: str) -> CameraResponse:
        """Performs stop/start recycle sequence."""
        await self.stop_camera_stream(camera_id)
        return await self.start_camera_stream(camera_id)


    # --- CAMERA HEALTH MONITOR PIPELINES ---

    async def collect_camera_health(self, camera_id: str) -> CameraHealthResponse:
        """Aggregates metrics from background threads, computes stats, and stores in DB."""
        camera = self.repository.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target camera registration not found."
            )

        metrics = camera_manager.get_stream_metrics(camera.id)
        if metrics:
            actual_fps, dropped_frames, latency_ms, resolution = metrics
            is_online = True
        else:
            actual_fps, dropped_frames, latency_ms, resolution = 0.0, 0, 0.0, camera.resolution
            is_online = False if camera.status != "streaming" else True

        # CPU/Memory simulated variations
        cpu_usage = round(random.uniform(1.2, 12.5), 1) if is_online else 0.0
        memory_usage = round(random.uniform(45.0, 110.0), 1) if is_online else 0.0
        temp = round(random.uniform(32.0, 48.0), 1) if is_online else 22.0

        health = self.repository.update_camera_health(
            camera_id=camera.id,
            is_online=is_online,
            current_fps=actual_fps if is_online else 0.0,
            current_resolution=resolution,
            latency_ms=latency_ms,
            dropped_frames=dropped_frames,
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            temperature_c=temp
        )

        # WS Notification for high latency / error spikes
        if is_online and latency_ms > 50.0:
            await manager.broadcast({
                "event": "CameraAlert",
                "camera_id": camera.id,
                "alert_type": "High Latency Detected",
                "message": f"Latency spike on camera '{camera.name}': {latency_ms:.1f}ms"
            })
            self.repository.create_log(
                camera_id=camera.id,
                event_type="Camera Warning",
                message=f"High latency warning issued: {latency_ms:.1f}ms",
                level="warning"
            )

        return health

    async def list_all_camera_health(self) -> List[CameraHealthResponse]:
        """Polls health statistics for all registered cameras and updates databases."""
        cameras = self.repository.get_all_cameras()
        results = []
        for c in cameras:
            # Refresh health metrics
            health = await self.collect_camera_health(c.id)
            results.append(health)
        return results


    # --- VIDEO RECORDING SERVICE PIPELINES ---

    async def start_camera_recording(self, camera_id: str) -> CameraRecordingResponse:
        """Starts a video recording session, logging the state change and saving recordings logs."""
        camera = self.repository.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target camera registration not found."
            )

        # Check duplicate recording
        existing = self.repository.get_active_recording(camera.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A recording session is already running on this camera."
            )

        # Simulated path
        file_name = f"rec_{camera.id[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
        file_path = f"/var/lib/facevision/recordings/{file_name}"

        recording = self.repository.start_recording(camera.id, file_path)

        # Log
        self.repository.create_log(
            camera_id=camera.id,
            event_type="Recording Started",
            message=f"Automated MP4 file write initiated. Location: {file_path}",
            level="info"
        )

        # WS
        await manager.broadcast({
            "event": "RecordingStarted",
            "camera_id": camera.id,
            "recording_id": recording.id,
            "file_path": file_path
        })

        return recording

    async def stop_camera_recording(self, camera_id: str) -> CameraRecordingResponse:
        """Concludes a recording, compiling size, duration, and logging completion."""
        camera = self.repository.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target camera registration not found."
            )

        recording = self.repository.get_active_recording(camera.id)
        if not recording:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active recording is currently executing on this camera."
            )

        # Compute simulated duration & size
        duration = (datetime.utcnow() - recording.start_time).total_seconds()
        size_mb = round((duration * 0.45) + random.uniform(0.5, 3.0), 2)  # 450KB/sec average bitrate mock

        stopped = self.repository.stop_recording(
            recording_id=recording.id,
            file_size_mb=size_mb,
            duration_seconds=duration
        )

        # Log
        self.repository.create_log(
            camera_id=camera.id,
            event_type="Recording Stopped",
            message=f"MP4 write concluded. Duration: {duration:.1f}s, Size: {size_mb}MB",
            level="info"
        )

        # WS
        await manager.broadcast({
            "event": "RecordingStopped",
            "camera_id": camera.id,
            "recording_id": stopped.id,
            "duration": duration,
            "file_size": size_mb
        })

        return stopped


    # --- CAMERA LOGS PIPELINES ---

    def get_camera_logs(self, camera_id: str, limit: int = 50) -> List[CameraLogResponse]:
        camera = self.repository.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target camera registration not found."
            )
        return self.repository.get_logs_for_camera(camera.id, limit)


    # --- CAMERA ASSIGNMENT PIPELINES ---

    def assign_camera_to_classroom(self, schema: CameraAssignmentCreate) -> CameraAssignmentResponse:
        camera = self.repository.get_camera_by_id(schema.camera_id)
        if not camera:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target camera registration not found."
            )
        return self.repository.assign_camera(schema)

    def get_classroom_camera_assignments(self, class_id: str) -> List[CameraAssignmentResponse]:
        return self.repository.get_assignments_by_class(class_id)
