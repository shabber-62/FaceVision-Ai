from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class FaceLandmark(BaseModel):
    x: float = Field(..., description="X coordinate normalized or absolute")
    y: float = Field(..., description="Y coordinate normalized or absolute")

class FaceDetectionResult(BaseModel):
    box: List[int] = Field(..., description="Bounding box [x1, y1, x2, y2] absolute coordinates")
    confidence: float = Field(..., description="Face confidence score between 0.0 and 1.0")
    tracking_id: Optional[int] = Field(None, description="Assigned identity tracking number across consecutive frames")
    landmarks: Optional[Dict[str, FaceLandmark]] = Field(None, description="Coordinates of eyes, nose, and mouth corners")
    quality_score: float = Field(..., description="Calculated face quality score based on blur, alignment, and resolution")
    crop_base64: Optional[str] = Field(None, description="Base64 encoded JPEG representation of cropped facial region")

class AIDetectionImageResponse(BaseModel):
    success: bool
    detections: List[FaceDetectionResult]
    latency_ms: float
    device: str
    model_version: str
    timestamp: datetime

class AIDetectionVideoResponse(BaseModel):
    success: bool
    total_frames_processed: int
    detections_by_frame: Dict[int, List[FaceDetectionResult]]
    latency_ms: float
    video_duration: float
    fps: float

class AIFrameRequest(BaseModel):
    frame_base64: str = Field(..., description="Base64 encoded JPEG/PNG camera frame string")
    confidence_threshold: Optional[float] = Field(0.5, ge=0.0, le=1.0)
    nms_threshold: Optional[float] = Field(0.4, ge=0.0, le=1.0)
    return_crops: Optional[bool] = Field(True, description="Whether to return base64 cropped face image payloads")

class AIStatusResponse(BaseModel):
    model_loaded: bool
    model_type: str = Field(..., description="YOLOv8, ONNX, OpenCV DNN, Cascade")
    model_version: str
    device_type: str = Field(..., description="CUDA, CPU, OpenCL")
    confidence_threshold: float
    nms_threshold: float
    hot_reload_enabled: bool
    gpu_acceleration_available: bool
    frame_queue_size: int
    throughput_fps: float
    uptime_seconds: float
    memory_usage_mb: float

class AIConfigRequest(BaseModel):
    confidence_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    nms_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    hot_reload: Optional[bool] = None
    use_gpu: Optional[bool] = None
