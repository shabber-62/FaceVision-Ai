from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
import uuid

from app.models import (
    Camera, CameraGroup, CameraLocation, CameraHealth,
    CameraRecording, CameraLog, CameraAssignment
)
from app.schemas_camera import (
    CameraRegisterRequest, CameraUpdateRequest, CameraGroupCreate,
    CameraLocationCreate, CameraAssignmentCreate
)

class CameraRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- CAMERA GROUPS OPERATIONS ---

    def create_group(self, schema: CameraGroupCreate) -> CameraGroup:
        group = CameraGroup(
            name=schema.name,
            description=schema.description
        )
        self.db.add(group)
        self.db.commit()
        self.db.refresh(group)
        return group

    def get_group_by_id(self, group_id: str) -> Optional[CameraGroup]:
        return self.db.query(CameraGroup).filter(CameraGroup.id == group_id).first()

    def get_group_by_name(self, name: str) -> Optional[CameraGroup]:
        return self.db.query(CameraGroup).filter(CameraGroup.name == name).first()

    def get_all_groups(self) -> List[CameraGroup]:
        return self.db.query(CameraGroup).all()


    # --- CAMERA LOCATIONS OPERATIONS ---

    def create_location(self, schema: CameraLocationCreate) -> CameraLocation:
        location = CameraLocation(
            name=schema.name,
            description=schema.description
        )
        self.db.add(location)
        self.db.commit()
        self.db.refresh(location)
        return location

    def get_location_by_id(self, location_id: str) -> Optional[CameraLocation]:
        return self.db.query(CameraLocation).filter(CameraLocation.id == location_id).first()

    def get_location_by_name(self, name: str) -> Optional[CameraLocation]:
        return self.db.query(CameraLocation).filter(CameraLocation.name == name).first()

    def get_all_locations(self) -> List[CameraLocation]:
        return self.db.query(CameraLocation).all()


    # --- CORE CAMERA OPERATIONS ---

    def register_camera(self, schema: CameraRegisterRequest) -> Camera:
        camera = Camera(
            name=schema.name,
            type=schema.type,
            connection_string=schema.connection_string,
            ip_address=schema.ip_address,
            port=schema.port,
            rtsp_url=schema.rtsp_url,
            onvif_profile=schema.onvif_profile,
            status="disconnected",
            resolution=schema.resolution,
            fps=schema.fps,
            is_active=True,
            group_id=schema.group_id,
            location_id=schema.location_id
        )
        self.db.add(camera)
        self.db.commit()
        self.db.refresh(camera)
        
        # Initialize default health metrics
        self.initialize_camera_health(camera.id, schema.resolution, schema.fps)
        
        return camera

    def get_camera_by_id(self, camera_id: str) -> Optional[Camera]:
        return self.db.query(Camera).filter(Camera.id == camera_id).first()

    def get_camera_by_name(self, name: str) -> Optional[Camera]:
        return self.db.query(Camera).filter(Camera.name == name).first()

    def get_all_cameras(self, is_active: Optional[bool] = None) -> List[Camera]:
        query = self.db.query(Camera)
        if is_active is not None:
            query = query.filter(Camera.is_active == is_active)
        return query.all()

    def update_camera(self, camera: Camera, schema: CameraUpdateRequest) -> Camera:
        for field, value in schema.model_dump(exclude_unset=True).items():
            setattr(camera, field, value)
        
        camera.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(camera)
        return camera

    def delete_camera(self, camera: Camera) -> None:
        self.db.delete(camera)
        self.db.commit()

    def update_camera_status(self, camera_id: str, status: str) -> Optional[Camera]:
        camera = self.get_camera_by_id(camera_id)
        if camera:
            camera.status = status
            camera.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(camera)
        return camera


    # --- CAMERA HEALTH MONITORING OPERATIONS ---

    def initialize_camera_health(self, camera_id: str, resolution: Optional[str], fps: int) -> CameraHealth:
        health = CameraHealth(
            camera_id=camera_id,
            is_online=False,
            current_fps=0.0,
            current_resolution=resolution,
            latency_ms=0.0,
            dropped_frames=0,
            cpu_usage=0.0,
            memory_usage=0.0,
            temperature_c=0.0,
            last_ping=datetime.utcnow()
        )
        self.db.add(health)
        self.db.commit()
        self.db.refresh(health)
        return health

    def update_camera_health(
        self,
        camera_id: str,
        is_online: bool,
        current_fps: float,
        current_resolution: Optional[str] = None,
        latency_ms: float = 0.0,
        dropped_frames: int = 0,
        cpu_usage: float = 0.0,
        memory_usage: float = 0.0,
        temperature_c: float = 0.0
    ) -> Optional[CameraHealth]:
        health = self.db.query(CameraHealth).filter(CameraHealth.camera_id == camera_id).first()
        if not health:
            health = CameraHealth(camera_id=camera_id)
            self.db.add(health)
        
        health.is_online = is_online
        health.current_fps = current_fps
        if current_resolution:
            health.current_resolution = current_resolution
        health.latency_ms = latency_ms
        health.dropped_frames = dropped_frames
        health.cpu_usage = cpu_usage
        health.memory_usage = memory_usage
        health.temperature_c = temperature_c
        health.last_ping = datetime.utcnow()
        health.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(health)
        return health

    def get_camera_health(self, camera_id: str) -> Optional[CameraHealth]:
        return self.db.query(CameraHealth).filter(CameraHealth.camera_id == camera_id).first()

    def get_all_health_records(self) -> List[CameraHealth]:
        return self.db.query(CameraHealth).all()


    # --- CAMERA RECORDINGS OPERATIONS ---

    def start_recording(self, camera_id: str, file_path: str) -> CameraRecording:
        recording = CameraRecording(
            camera_id=camera_id,
            start_time=datetime.utcnow(),
            file_path=file_path,
            status="recording"
        )
        self.db.add(recording)
        self.db.commit()
        self.db.refresh(recording)
        return recording

    def stop_recording(self, recording_id: str, file_size_mb: float, duration_seconds: float) -> Optional[CameraRecording]:
        recording = self.db.query(CameraRecording).filter(CameraRecording.id == recording_id).first()
        if recording:
            recording.end_time = datetime.utcnow()
            recording.file_size_mb = file_size_mb
            recording.duration_seconds = duration_seconds
            recording.status = "completed"
            self.db.commit()
            self.db.refresh(recording)
        return recording

    def fail_recording(self, recording_id: str) -> Optional[CameraRecording]:
        recording = self.db.query(CameraRecording).filter(CameraRecording.id == recording_id).first()
        if recording:
            recording.end_time = datetime.utcnow()
            recording.status = "failed"
            self.db.commit()
            self.db.refresh(recording)
        return recording

    def get_active_recording(self, camera_id: str) -> Optional[CameraRecording]:
        return self.db.query(CameraRecording).filter(
            and_(
                CameraRecording.camera_id == camera_id,
                CameraRecording.status == "recording"
            )
        ).first()


    # --- CAMERA LOGGING OPERATIONS ---

    def create_log(self, camera_id: str, event_type: str, message: str, level: str = "info") -> CameraLog:
        log = CameraLog(
            camera_id=camera_id,
            event_type=event_type,
            message=message,
            level=level
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_logs_for_camera(self, camera_id: str, limit: int = 50) -> List[CameraLog]:
        return self.db.query(CameraLog).filter(CameraLog.camera_id == camera_id).order_by(desc(CameraLog.created_at)).limit(limit).all()


    # --- CAMERA ASSIGNMENTS OPERATIONS ---

    def assign_camera(self, schema: CameraAssignmentCreate) -> CameraAssignment:
        # Deactivate previous assignments for this camera
        self.db.query(CameraAssignment).filter(
            and_(
                CameraAssignment.camera_id == schema.camera_id,
                CameraAssignment.is_active == True
            )
        ).update({"is_active": False})
        
        assignment = CameraAssignment(
            camera_id=schema.camera_id,
            assigned_to_class_id=schema.assigned_to_class_id,
            purpose=schema.purpose,
            is_active=True
        )
        self.db.add(assignment)
        self.db.commit()
        self.db.refresh(assignment)
        return assignment

    def get_assignments_by_class(self, class_id: str) -> List[CameraAssignment]:
        return self.db.query(CameraAssignment).filter(
            and_(
                CameraAssignment.assigned_to_class_id == class_id,
                CameraAssignment.is_active == True
            )
        ).all()
