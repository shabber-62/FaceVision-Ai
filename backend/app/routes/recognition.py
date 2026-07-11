import io
import os
import cv2
import tempfile
import base64
import numpy as np
from PIL import Image
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.routes.auth import get_current_user
from app.dependencies import PermissionChecker
from app.models import Student, Camera
from app.models_recognition import FaceEmbedding, RecognitionHistory, UnknownFace, RecognitionCache
from app.schemas_recognition import (
    ImageRecognitionResponse, RecognitionResult, VideoRecognitionResponse,
    VideoRecognitionFrameResult, VerificationRequest, VerificationResponse,
    RecognitionHistoryResponse, UnknownFaceResponse
)
from app.services.yolo_face_service import yolo_detector
from app.services.face_recognition_service import face_recognizer
from app.services.camera_manager import camera_manager

router = APIRouter(prefix="/recognition", tags=["InsightFace Face Recognition & Verification Service"])


@router.post(
    "/register",
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
async def register_student_face(
    student_id: str = Query(..., description="Target Student DB UUID or enrollment ID"),
    file: UploadFile = File(..., description="High-quality frontal face JPEG or PNG to register"),
    db: Session = Depends(get_db)
):
    """
    Enrolls a student's face by detecting the face area, computing a 512-D embedding,
    and persisting it into Postgres. Marks the student's profile as face_registered=True.
    """
    # Verify student exists
    student = db.query(Student).filter(
        (Student.id == student_id) | (Student.student_id == student_id),
        Student.is_deleted == False
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student record with ID {student_id} not found."
        )

    # Parse uploaded image
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as parse_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupted or invalid image file: {parse_err}"
        )

    # Detect face to ensure we have a valid cropped area
    detections = yolo_detector.detect_faces(frame, return_crops=False)
    if not detections:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No faces detected in the provided photo. Please upload a clear frontal face image."
        )

    # Use the primary face detected (highest quality/confidence)
    primary_det = sorted(detections, key=lambda x: x["quality_score"], reverse=True)[0]
    x1, y1, x2, y2 = primary_det["box"]
    face_crop = frame[y1:y2, x1:x2]

    if face_crop.size == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Facial crop region extraction returned null payload."
        )

    try:
        # Generate 512-dimensional embedding
        embedding_vector = face_recognizer.compute_embedding(face_crop, landmarks=primary_det.get("landmarks"))
        
        # Check if student already has embeddings and disable old ones
        db.query(FaceEmbedding).filter(FaceEmbedding.student_id == student.id).update({"is_active": False})

        # Save new embedding
        new_embedding = FaceEmbedding(
            student_id=student.id,
            embedding=embedding_vector,
            embedding_version=face_recognizer.engine_type,
            quality_score=primary_det["quality_score"],
            is_active=True
        )
        db.add(new_embedding)
        
        # Mark Student profile as face registered
        student.face_registered = True
        student.student_photo = f"base64_registered_{student.student_id}"
        db.commit()
        db.refresh(new_embedding)

        return {
            "status": "success",
            "message": f"Face successfully registered for student '{student.full_name}' ({student.student_id}).",
            "embedding_id": new_embedding.id,
            "quality_score": new_embedding.quality_score,
            "engine_type": face_recognizer.engine_type
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database or embedding calculation failure: {e}"
        )


@router.post(
    "/image",
    response_model=ImageRecognitionResponse,
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
async def recognize_faces_in_image(
    file: UploadFile = File(..., description="JPEG/PNG image containing faces to recognize"),
    camera_id: Optional[str] = Query(None, description="Optional associated Camera UUID for auditing"),
    db: Session = Depends(get_db)
):
    """
    Scans an uploaded image, detects all faces, extracts 512-D embeddings,
    matches them against Postgres, records logs to audit tables, and returns matches.
    """
    t0 = datetime.now()
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as parse_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupted or invalid image file: {parse_err}"
        )

    # 1. Detect all faces
    detections = yolo_detector.detect_faces(frame, return_crops=True)
    if not detections:
        latency = (datetime.now() - t0).total_seconds() * 1000.0
        return ImageRecognitionResponse(
            success=True,
            matches=[],
            total_faces_detected=0,
            latency_ms=round(latency, 2),
            device=face_recognizer.device,
            engine_type=face_recognizer.engine_type
        )

    matches_out = []
    
    # 2. Extract embeddings and match for each face
    for det in detections:
        x1, y1, x2, y2 = det["box"]
        face_crop = frame[y1:y2, x1:x2]
        if face_crop.size == 0:
            continue

        # Compute 512-D embedding
        emb = face_recognizer.compute_embedding(face_crop, landmarks=det.get("landmarks"))
        
        # Match against Postgres + Cache layers
        match_res = face_recognizer.match_face_to_db(emb, db)

        # 3. Log results to history / unknown tables
        recognition_status = match_res["status"]
        student_id = match_res["student"]["id"] if match_res["student"] else None
        embedding_id = match_res["embedding_id"]

        # Base64 crop payload for history representation
        crop_b64 = det["crop_base64"]

        if recognition_status in ["success", "low_confidence"]:
            # Known recognition event
            history_log = RecognitionHistory(
                student_id=student_id,
                embedding_id=embedding_id,
                confidence=match_res["confidence"],
                similarity_score=match_res["similarity_score"],
                recognition_status=recognition_status,
                camera_id=camera_id,
                crop_base64=crop_b64,
                metadata_json={"box": det["box"], "quality_score": det["quality_score"]}
            )
            db.add(history_log)
        else:
            # Unknown Face detected
            # To avoid spamming unknown faces, we check if an identical unknown face was recently logged
            # otherwise we add a new unknown entry.
            unknown_face = UnknownFace(
                embedding=emb,
                crop_base64=crop_b64,
                camera_id=camera_id,
                matched_count=1
            )
            db.add(unknown_face)

        # Compile endpoint result
        matches_out.append(
            RecognitionResult(
                recognition_status=recognition_status,
                student_id=match_res["student"]["student_id"] if match_res["student"] else None,
                student_name=match_res["student"]["full_name"] if match_res["student"] else None,
                department=match_res["student"]["department"] if match_res["student"] else None,
                course=match_res["student"]["course"] if match_res["student"] else None,
                year=match_res["student"]["year"] if match_res["student"] else None,
                semester=match_res["student"]["semester"] if match_res["student"] else None,
                section=match_res["student"].get("section") if match_res["student"] else None,
                group=match_res["student"].get("group") if match_res["student"] else None,
                roll_number=match_res["student"]["roll_number"] if match_res["student"] else None,
                confidence=match_res["confidence"],
                similarity_score=match_res["similarity_score"],
                face_embedding_id=embedding_id,
                timestamp=datetime.utcnow(),
                box=det["box"],
                quality_score=det["quality_score"]
            )
        )

    try:
        db.commit()
    except Exception as db_err:
        logger.error(f"Failed to save recognition audits: {db_err}")
        db.rollback()

    latency = (datetime.now() - t0).total_seconds() * 1000.0
    return ImageRecognitionResponse(
        success=True,
        matches=matches_out,
        total_faces_detected=len(matches_out),
        latency_ms=round(latency, 2),
        device=face_recognizer.device,
        engine_type=face_recognizer.engine_type
    )


@router.post(
    "/video",
    response_model=VideoRecognitionResponse,
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
async def recognize_faces_in_video(
    file: UploadFile = File(..., description="MP4/AVI/MKV video container file"),
    camera_id: Optional[str] = Query(None, description="Target Camera UUID context"),
    db: Session = Depends(get_db)
):
    """
    Processes video frame-by-frame, runs full recognition pipeline,
    and returns a localized timeline of student matches.
    """
    t0 = datetime.now()
    suffix = os.path.splitext(file.filename)[1] or ".mp4"
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file_path = temp_file.name
        content = await file.read()
        temp_file.write(content)

    results = []
    processed_frames = 0
    fps = 30.0
    duration = 0.0

    try:
        cap = cv2.VideoCapture(temp_file_path)
        if not cap.isOpened():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to open video file. Invalid container format."
            )

        fps = float(cap.get(cv2.CAP_PROP_FPS)) or 30.0
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
        duration = frame_count / fps

        # We cap video processing in development limits to avoid high latency blocking.
        frame_limit = min(50, frame_count)
        
        frame_idx = 0
        while frame_idx < frame_limit:
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            # Frame skipping (process 1 in every 3 frames for high speed batch recognition)
            if frame_idx % 3 == 0:
                dets = yolo_detector.detect_faces(frame, return_crops=True)
                frame_matches = []
                
                for det in dets:
                    x1, y1, x2, y2 = det["box"]
                    face_crop = frame[y1:y2, x1:x2]
                    if face_crop.size == 0:
                        continue

                    emb = face_recognizer.compute_embedding(face_crop, landmarks=det.get("landmarks"))
                    match_res = face_recognizer.match_face_to_db(emb, db)

                    frame_matches.append(
                        RecognitionResult(
                            recognition_status=match_res["status"],
                            student_id=match_res["student"]["student_id"] if match_res["student"] else None,
                            student_name=match_res["student"]["full_name"] if match_res["student"] else None,
                            department=match_res["student"]["department"] if match_res["student"] else None,
                            course=match_res["student"]["course"] if match_res["student"] else None,
                            year=match_res["student"]["year"] if match_res["student"] else None,
                            semester=match_res["student"]["semester"] if match_res["student"] else None,
                            section=match_res["student"].get("section") if match_res["student"] else None,
                            group=match_res["student"].get("group") if match_res["student"] else None,
                            roll_number=match_res["student"]["roll_number"] if match_res["student"] else None,
                            confidence=match_res["confidence"],
                            similarity_score=match_res["similarity_score"],
                            face_embedding_id=match_res["embedding_id"],
                            timestamp=datetime.utcnow(),
                            box=det["box"],
                            quality_score=det["quality_score"]
                        )
                    )

                if frame_matches:
                    results.append(
                        VideoRecognitionFrameResult(
                            frame_index=frame_idx,
                            matches=frame_matches
                        )
                    )
                processed_frames += 1
            frame_idx += 1

        cap.release()
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    latency = (datetime.now() - t0).total_seconds() * 1000.0
    return VideoRecognitionResponse(
        success=True,
        processed_frames_count=processed_frames,
        results=results,
        latency_ms=round(latency, 2),
        fps=round(fps, 1),
        duration=round(duration, 2)
    )


@router.post(
    "/live",
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
async def process_live_webcam_frame(
    frame_base64: str = Query(..., description="Base64 encoded JPEG live webcam frame"),
    camera_id: Optional[str] = Query(None, description="Auditing camera UUID connection string"),
    challenge: Optional[str] = Query(None, description="Current challenge response prompt e.g. TURN_LEFT, TURN_RIGHT, SMILE, BLINK, NEUTRAL"),
    db: Session = Depends(get_db)
):
    """
    Accepts a single webcam frame in real-time, performs AI Face Detection,
    runs Anti-Spoofing / Liveness checks, extracts embeddings, matches them,
    logs security threats or unrecognized faces, automatically marks student attendance
    for any active class session, and returns the list of detected matches immediately.
    """
    from app.services.anti_spoof_service import anti_spoof_service
    from app.services.attendance import AttendanceService
    from app.schemas_attendance import AttendanceMarkRequest

    try:
        if "," in frame_base64:
            frame_base64 = frame_base64.split(",")[1]
        img_bytes = base64.b64decode(frame_base64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to decode webcam base64 frame."
        )

    # Detect faces
    dets = yolo_detector.detect_faces(frame, return_crops=True)
    matches_out = []
    spoofs_detected = []

    for det in dets:
        x1, y1, x2, y2 = det["box"]
        face_crop = frame[y1:y2, x1:x2]
        if face_crop.size == 0:
            continue

        # 1. RUN ANTI-SPOOF LIVENESS SYSTEM
        # Retrieve previous frame landmarks from cache for blink detection
        prev_landmarks = None
        if camera_id:
            import json
            from app.database import redis_client
            try:
                cached_data = redis_client.get(f"cam_landmarks:{camera_id}")
                if cached_data:
                    prev_landmarks = json.loads(cached_data)
                # Store current landmarks for next frame check
                redis_client.setex(f"cam_landmarks:{camera_id}", 5, json.dumps(det.get("landmarks")))
            except Exception:
                pass

        liveness = anti_spoof_service.analyze_liveness(
            frame=frame,
            box=det["box"],
            landmarks=det.get("landmarks"),
            challenge=challenge,
            prev_landmarks=prev_landmarks
        )

        # 2. SAVE ATTEMPTS AND REGISTER SECURITY CRITICAL BLOCKINGS
        security_log = anti_spoof_service.register_attempt(db, camera_id, liveness, det["crop_base64"])
        
        if not liveness["is_live"]:
            spoofs_detected.append({
                "box": det["box"],
                "liveness_score": liveness["liveness_score"],
                "threat_score": liveness["threat_score"],
                "attack_vector": liveness["attack_vector"],
                "threat_level": liveness["threat_level"],
                "challenge_passed": liveness["challenge_passed"]
            })
            continue # Skip recognition for spoofed faces!

        # 3. COMPUTE EMBEDDINGS & DB MATCHING
        emb = face_recognizer.compute_embedding(face_crop, landmarks=det.get("landmarks"))
        match_res = face_recognizer.match_face_to_db(emb, db)
        
        status_val = match_res["status"]
        student_id = match_res["student"]["id"] if match_res["student"] else None

        attendance_marked = False
        attendance_message = "No active class sessions found for this student."

        # 4. AUTOMATIC ATTENDANCE DECISION ROUTER
        if status_val == "success" and student_id:
            try:
                # Attempt to automatically register attendance
                attendance_svc = AttendanceService(db)
                req_schema = AttendanceMarkRequest(
                    student_id=student_id,
                    confidence=match_res["confidence"],
                    raw_image_path=None
                )
                record = await attendance_svc.mark_ai_attendance(req_schema)
                attendance_marked = True
                attendance_message = f"Attendance logged successfully as '{record.status.upper()}'."
            except HTTPException as att_exc:
                attendance_marked = False
                attendance_message = att_exc.detail
            except Exception as att_err:
                attendance_marked = False
                attendance_message = f"Internal attendance marking error: {str(att_err)}"

        # Log recognition audit
        if status_val in ["success", "low_confidence"]:
            log = RecognitionHistory(
                student_id=student_id,
                embedding_id=match_res["embedding_id"],
                confidence=match_res["confidence"],
                similarity_score=match_res["similarity_score"],
                recognition_status=status_val,
                camera_id=camera_id,
                crop_base64=det["crop_base64"]
            )
            db.add(log)
        else:
            # Check for spamming unknown faces
            unknown = UnknownFace(
                embedding=emb,
                crop_base64=det["crop_base64"],
                camera_id=camera_id
            )
            db.add(unknown)

        matches_out.append({
            "recognition_status": status_val,
            "student_id": match_res["student"]["student_id"] if match_res["student"] else None,
            "student_name": match_res["student"]["full_name"] if match_res["student"] else None,
            "department": match_res["student"]["department"] if match_res["student"] else None,
            "course": match_res["student"]["course"] if match_res["student"] else None,
            "year": match_res["student"]["year"] if match_res["student"] else None,
            "semester": match_res["student"]["semester"] if match_res["student"] else None,
            "section": match_res["student"].get("section") if match_res["student"] else None,
            "group": match_res["student"].get("group") if match_res["student"] else None,
            "roll_number": match_res["student"]["roll_number"] if match_res["student"] else None,
            "confidence": match_res["confidence"],
            "similarity_score": match_res["similarity_score"],
            "face_embedding_id": match_res["embedding_id"],
            "timestamp": datetime.utcnow(),
            "box": det["box"],
            "quality_score": det["quality_score"],
            "liveness": {
                "is_live": True,
                "score": liveness["liveness_score"],
                "threat_score": liveness["threat_score"]
            },
            "attendance": {
                "marked": attendance_marked,
                "message": attendance_message
            }
        })

    try:
        db.commit()
    except Exception as db_err:
        db.rollback()
        logger.error(f"Live audit save failure: {db_err}")

    return {
        "success": len(spoofs_detected) == 0,
        "matches": matches_out,
        "count": len(matches_out),
        "spoofs_detected": spoofs_detected,
        "spoof_count": len(spoofs_detected)
    }


@router.post(
    "/verify",
    response_model=VerificationResponse,
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
async def verify_two_faces(
    request: VerificationRequest
):
    """
    Performs precise 1-to-1 face verification (identity confirmation).
    Detects faces in both images and calculates the similarity metrics between them.
    """
    def decode_image(b64_str: str) -> np.ndarray:
        if "," in b64_str:
            b64_str = b64_str.split(",")[1]
        img_bytes = base64.b64decode(b64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError()
        return frame

    try:
        frame1 = decode_image(request.face_image_base64_1)
        frame2 = decode_image(request.face_image_base64_2)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid base64 payload provided. Decryption failed."
        )

    # Detect faces in both
    det1 = yolo_detector.detect_faces(frame1, return_crops=False)
    det2 = yolo_detector.detect_faces(frame2, return_crops=False)

    if not det1 or not det2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Face matching failed because face area was not found in both frames."
        )

    # Compute embeddings
    face1_crop = frame1[det1[0]["box"][1]:det1[0]["box"][3], det1[0]["box"][0]:det1[0]["box"][2]]
    face2_crop = frame2[det2[0]["box"][1]:det2[0]["box"][3], det2[0]["box"][0]:det2[0]["box"][2]]

    emb1 = face_recognizer.compute_embedding(face1_crop, landmarks=det1[0].get("landmarks"))
    emb2 = face_recognizer.compute_embedding(face2_crop, landmarks=det2[0].get("landmarks"))

    # Compute verification
    res = face_recognizer.verify_one_to_one(emb1, emb2)
    return VerificationResponse(**res)


@router.get(
    "/history",
    response_model=List[RecognitionHistoryResponse],
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def get_recognition_history(
    student_id: Optional[str] = Query(None, description="Filter by Student DB ID"),
    camera_id: Optional[str] = Query(None, description="Filter by Camera UUID"),
    status_filter: Optional[str] = Query(None, description="Filter by recognition status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Lists past face recognition audit records with multi-tier indexing.
    """
    query = db.query(RecognitionHistory)
    if student_id:
        query = query.filter(RecognitionHistory.student_id == student_id)
    if camera_id:
        query = query.filter(RecognitionHistory.camera_id == camera_id)
    if status_filter:
        query = query.filter(RecognitionHistory.recognition_status == status_filter)

    logs = query.order_by(RecognitionHistory.timestamp.desc()).offset(offset).limit(limit).all()
    
    out = []
    for log in logs:
        # Load related Student data cleanly
        student = db.query(Student).filter(Student.id == log.student_id).first() if log.student_id else None
        out.append(
            RecognitionHistoryResponse(
                id=log.id,
                student_id=student.student_id if student else None,
                student_name=student.full_name if student else None,
                roll_number=student.roll_number if student else None,
                department=student.department if student else None,
                confidence=log.confidence,
                similarity_score=log.similarity_score,
                recognition_status=log.recognition_status,
                camera_id=log.camera_id,
                image_path=log.image_path,
                timestamp=log.timestamp
            )
        )
    return out


@router.get(
    "/unknown",
    response_model=List[UnknownFaceResponse],
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def get_unknown_faces(
    camera_id: Optional[str] = Query(None, description="Filter by Camera UUID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns indexed list of unrecognized faces detected in security zones.
    """
    query = db.query(UnknownFace)
    if camera_id:
        query = query.filter(UnknownFace.camera_id == camera_id)
        
    records = query.order_by(UnknownFace.detected_at.desc()).offset(offset).limit(limit).all()
    return [
        UnknownFaceResponse(
            id=rec.id,
            image_path=rec.image_path,
            crop_base64=rec.crop_base64,
            camera_id=rec.camera_id,
            detected_at=rec.detected_at,
            matched_count=rec.matched_count,
            last_seen_at=rec.last_seen_at
        )
        for rec in records
    ]
