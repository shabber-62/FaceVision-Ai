import io
import base64
import numpy as np
import cv2
from PIL import Image
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import PermissionChecker
from app.models import Camera
from app.models_recognition import SecurityLog, ThreatScorecard
from app.services.anti_spoof_service import anti_spoof_service

router = APIRouter(prefix="/security", tags=["AI Anti-Spoofing & Security Service"])

@router.get(
    "/logs",
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def get_security_logs(
    camera_id: Optional[str] = Query(None, description="Filter logs by camera ID"),
    threat_level: Optional[str] = Query(None, description="Filter by threat level (low, medium, high, critical)"),
    attack_vector: Optional[str] = Query(None, description="Filter by attack vector (printed_photo, mobile_screen, video_replay, mask)"),
    resolved: Optional[bool] = Query(None, description="Filter resolved/unresolved issues"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieves security event logs and spoofing threat history.
    """
    query = db.query(SecurityLog)
    
    if camera_id:
        query = query.filter(SecurityLog.camera_id == camera_id)
    if threat_level:
        query = query.filter(SecurityLog.threat_level == threat_level)
    if attack_vector:
        query = query.filter(SecurityLog.attack_vector == attack_vector)
    if resolved is not None:
        query = query.filter(SecurityLog.resolved == resolved)
        
    logs = query.order_by(SecurityLog.timestamp.desc()).offset(offset).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "camera_id": log.camera_id,
            "event_type": log.event_type,
            "threat_score": log.threat_score,
            "threat_level": log.threat_level,
            "attack_vector": log.attack_vector,
            "details": log.details,
            "crop_base64": log.crop_base64,
            "is_blocked": log.is_blocked,
            "resolved": log.resolved,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]


@router.get(
    "/scorecards",
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def get_camera_threat_scorecards(
    status_filter: Optional[str] = Query(None, description="Filter status (secure, warning, locked)"),
    db: Session = Depends(get_db)
):
    """
    Returns threat scorecards and status matrices across all monitoring cameras.
    """
    query = db.query(ThreatScorecard)
    if status_filter:
        query = query.filter(ThreatScorecard.status == status_filter)
        
    scorecards = query.all()
    return [
        {
            "id": sc.id,
            "camera_id": sc.camera_id,
            "cumulative_score": sc.cumulative_score,
            "alert_count": sc.alert_count,
            "status": sc.status,
            "last_threat_at": sc.last_threat_at.isoformat() if sc.last_threat_at else None,
            "updated_at": sc.updated_at.isoformat()
        }
        for sc in scorecards
    ]


@router.post(
    "/resolve/{log_id}",
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
def resolve_security_threat(
    log_id: str,
    remarks: Optional[str] = Query(None, description="Optional description of resolution"),
    db: Session = Depends(get_db)
):
    """
    Manually resolves a security spoof warning or alert, updating state variables.
    """
    log = db.query(SecurityLog).filter(SecurityLog.id == log_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Security log not found."
        )
        
    log.resolved = True
    if log.details is None:
        log.details = {}
    
    # Store resolution history in JSON field
    log.details["resolution"] = {
        "resolved_at": datetime.utcnow().isoformat(),
        "remarks": remarks or "Manually resolved by administrator"
    }
    
    # Re-evaluate associated camera status if blocked
    if log.camera_id:
        scorecard = db.query(ThreatScorecard).filter(ThreatScorecard.camera_id == log.camera_id).first()
        if scorecard:
            scorecard.cumulative_score = max(0.0, scorecard.cumulative_score - log.threat_score)
            if scorecard.cumulative_score < 0.5:
                scorecard.status = "secure"
            elif scorecard.cumulative_score < 1.5:
                scorecard.status = "warning"
                
    db.commit()
    return {"status": "resolved", "message": f"Security log {log_id} has been marked as resolved."}


@router.post(
    "/unlock/{camera_id}",
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
def unlock_blocked_camera(
    camera_id: str,
    db: Session = Depends(get_db)
):
    """
    Releases automatic streaming lockouts for a specified camera, resetting threat counters.
    """
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified camera does not exist."
        )
        
    scorecard = db.query(ThreatScorecard).filter(ThreatScorecard.camera_id == camera_id).first()
    if scorecard:
        scorecard.status = "secure"
        scorecard.cumulative_score = 0.0
        
    # Reactivate camera
    camera.is_active = True
    camera.status = "disconnected" # Triggers camera daemon to reconnect
    
    # Resolve all associated logs for this camera
    db.query(SecurityLog).filter(
        SecurityLog.camera_id == camera_id,
        SecurityLog.resolved == False
    ).update({"resolved": True})
    
    db.commit()
    return {"status": "unlocked", "message": f"Camera {camera_id} unlocked and reactivated successfully."}


@router.post(
    "/liveness-test",
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
async def test_face_liveness_manually(
    challenge: Optional[str] = Query(None, description="Apply optional liveness action check (TURN_LEFT, TURN_RIGHT, SMILE, BLINK, NEUTRAL)"),
    file: UploadFile = File(..., description="JPEG/PNG image to analyze for spoof vectors")
):
    """
    Inspects an uploaded face frame directly to calculate immediate anti-spoof scoring metrics.
    """
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as parse_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to parse image binary: {parse_err}"
        )
        
    # Detect bounding box for anti_spoof crop
    from app.services.yolo_face_service import yolo_detector
    detections = yolo_detector.detect_faces(frame, return_crops=False)
    
    if not detections:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No face detected in the sent image. Check cropping boundaries or lightning."
        )
        
    primary_det = detections[0]
    liveness = anti_spoof_service.analyze_liveness(
        frame=frame,
        box=primary_det["box"],
        landmarks=primary_det.get("landmarks"),
        challenge=challenge
    )
    
    return {
        "face_detected": True,
        "box": primary_det["box"],
        "confidence": primary_det["confidence"],
        "quality_score": primary_det["quality_score"],
        "liveness": liveness
    }
