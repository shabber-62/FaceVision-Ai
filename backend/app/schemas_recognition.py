from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class StudentMatchInfo(BaseModel):
    id: str = Field(..., description="Internal DB UUID of the student")
    student_id: str = Field(..., description="Academic unique ID of the student")
    full_name: str = Field(..., description="Student's name")
    email: str = Field(..., description="Student's email address")
    roll_number: str = Field(..., description="Roll number sequence")
    department: str = Field(..., description="Academic department")
    course: str = Field(..., description="Assigned course")
    year: int = Field(..., description="Year of study")
    semester: str = Field(..., description="Semester sequence")
    section: Optional[str] = Field(None, description="Section code")
    group: Optional[str] = Field(None, description="Group designation")

class TopCandidate(BaseModel):
    student_id: str
    student_name: str
    roll_number: str
    department: str
    similarity_score: float
    distance: float
    confidence: float

class RecognitionResult(BaseModel):
    recognition_status: str = Field(..., description="Status of recognition: success, unknown, low_confidence, failed")
    student_id: Optional[str] = Field(None, description="Registered student unique code (Student.student_id)")
    student_name: Optional[str] = Field(None, description="Full name of recognized student")
    department: Optional[str] = Field(None, description="Student's department")
    course: Optional[str] = Field(None, description="Student's course")
    year: Optional[int] = Field(None, description="Year of study")
    semester: Optional[str] = Field(None, description="Semester of study")
    section: Optional[str] = Field(None, description="Section of study")
    group: Optional[str] = Field(None, description="Group of study")
    roll_number: Optional[str] = Field(None, description="Student's Roll Number")
    confidence: float = Field(..., description="Normalized confidence rating from 0.0 to 1.0")
    similarity_score: float = Field(..., description="Cosine similarity score of face match")
    face_embedding_id: Optional[str] = Field(None, description="ID of matching face embedding row in database")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    box: List[int] = Field(..., description="Bounding box of recognized face in pixels: [x1, y1, x2, y2]")
    quality_score: float = Field(..., description="Calculated facial quality factor")

class ImageRecognitionResponse(BaseModel):
    success: bool
    matches: List[RecognitionResult]
    total_faces_detected: int
    latency_ms: float
    device: str
    engine_type: str

class VideoRecognitionFrameResult(BaseModel):
    frame_index: int
    matches: List[RecognitionResult]

class VideoRecognitionResponse(BaseModel):
    success: bool
    processed_frames_count: int
    results: List[VideoRecognitionFrameResult]
    latency_ms: float
    fps: float
    duration: float

class VerificationRequest(BaseModel):
    face_image_base64_1: str = Field(..., description="Base64 encoded string of image 1")
    face_image_base64_2: str = Field(..., description="Base64 encoded string of image 2")

class VerificationResponse(BaseModel):
    verified: bool
    similarity_score: float
    euclidean_distance: float
    match_threshold: float
    confidence: float
    timestamp: datetime

class RecognitionHistoryResponse(BaseModel):
    id: str
    student_id: Optional[str]
    student_name: Optional[str]
    roll_number: Optional[str]
    department: Optional[str]
    confidence: float
    similarity_score: float
    recognition_status: str
    camera_id: Optional[str]
    image_path: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class UnknownFaceResponse(BaseModel):
    id: str
    image_path: Optional[str]
    crop_base64: Optional[str]
    camera_id: Optional[str]
    detected_at: datetime
    matched_count: int
    last_seen_at: datetime

    class Config:
        from_attributes = True
