import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    embedding = Column(JSON, nullable=False)  # List of 512 floats
    embedding_version = Column(String(100), default="insightface-r100", nullable=False)
    quality_score = Column(Float, default=1.0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    student = relationship("Student", backref="embeddings")


class RecognitionHistory(Base):
    __tablename__ = "recognition_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("students.id", ondelete="SET NULL"), nullable=True)
    embedding_id = Column(String(36), ForeignKey("face_embeddings.id", ondelete="SET NULL"), nullable=True)
    confidence = Column(Float, nullable=False)
    similarity_score = Column(Float, nullable=False)
    recognition_status = Column(String(50), default="success", index=True, nullable=False)  # "success", "unknown", "low_confidence", "failed"
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True)
    image_path = Column(String(500), nullable=True)
    crop_base64 = Column(JSON, nullable=True)  # Base64 crop of recognized face
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    metadata_json = Column(JSON, nullable=True)

    # Relationships
    student = relationship("Student", backref="recognition_records")
    embedding = relationship("FaceEmbedding", backref="recognition_records")
    camera = relationship("Camera", backref="recognition_records")


class UnknownFace(Base):
    __tablename__ = "unknown_faces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    embedding = Column(JSON, nullable=False)  # List of 512 floats
    image_path = Column(String(500), nullable=True)
    crop_base64 = Column(JSON, nullable=True)  # Base64 crop of unknown face
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    matched_count = Column(Integer, default=1, nullable=False)
    last_seen_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    camera = relationship("Camera", backref="unknown_faces")


class RecognitionCache(Base):
    __tablename__ = "recognition_cache"

    id = Column(String(100), primary_key=True)  # Key like "student_id" or "camera_id" or simple MD5
    embedding = Column(JSON, nullable=False)
    label = Column(String(255), nullable=False)
    metadata_json = Column(JSON, nullable=True)
    last_accessed = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(String(36), primary_key=True, index=True)
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True)
    event_type = Column(String(100), nullable=False, index=True)  # "spoof_attempt", "camera_tamper", "unauthorized_access"
    threat_score = Column(Float, nullable=False)
    threat_level = Column(String(50), nullable=False)  # "low", "medium", "high", "critical"
    attack_vector = Column(String(100), nullable=True)  # "printed_photo", "mobile_screen", "video_replay", "mask"
    details = Column(JSON, nullable=True)
    crop_base64 = Column(JSON, nullable=True)
    is_blocked = Column(Boolean, default=False, nullable=False)
    resolved = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)


class ThreatScorecard(Base):
    __tablename__ = "threat_scorecards"

    id = Column(String(36), primary_key=True, index=True)
    camera_id = Column(String(36), unique=True, nullable=False)
    cumulative_score = Column(Float, default=0.0, nullable=False)
    alert_count = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="secure", nullable=False)  # "secure", "warning", "locked"
    last_threat_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

