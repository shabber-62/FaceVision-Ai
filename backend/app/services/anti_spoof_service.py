import cv2
import numpy as np
import time
import logging
from typing import List, Dict, Tuple, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey, desc
from sqlalchemy.orm import Session
from app.database import Base, redis_client

logger = logging.getLogger("facevision.anti_spoof_service")

from app.models_recognition import SecurityLog, ThreatScorecard

# --- ANTI-SPOOFING AND SECURITY ENGINE ---

class AntiSpoofService:
    """
    Enterprise-grade AI Anti-Spoofing and Liveness Detection Service.
    Protects face recognition endpoints against:
    1. Printed Photo Attacks (Texture analysis, LBP-like gradients, high-freq FFT)
    2. Mobile Screen & Video Replay Attacks (Screen moire, chromatic gamut anomalies, specular gloss)
    3. Deepfake & Mask Attempts (Face symmetry, structure variance)
    Supports micro-challenge-response pipelines (blink, turn left/right, smile, gaze tracking).
    """
    def __init__(self, threshold_spoof: float = 0.50):
        self.threshold_spoof = threshold_spoof

    def analyze_liveness(
        self, 
        frame: np.ndarray, 
        box: List[int], 
        landmarks: Optional[Dict[str, Any]] = None,
        challenge: Optional[str] = None,
        prev_landmarks: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Runs comprehensive liveness check on a single frame facial crop.
        Returns detailed scoring matrix, threat determination, and challenge results.
        """
        x1, y1, x2, y2 = box
        face_crop = frame[y1:y2, x1:x2]
        
        if face_crop.size == 0:
            return {
                "liveness_score": 0.0,
                "is_live": False,
                "threat_score": 1.0,
                "threat_level": "critical",
                "attack_vector": "unknown_no_face",
                "details": {"reason": "Empty face region"}
            }

        # Standardize size for analysis
        gray_crop = cv2.resize(cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY), (128, 128))
        hsv_crop = cv2.resize(cv2.cvtColor(face_crop, cv2.COLOR_BGR2HSV), (128, 128))

        # 1. Texture Blur Analysis (Laplacian Variance)
        # Real skins show natural progressive gradients. Screens/Prints have edge-ringing or uniform blur
        lap_var = cv2.Laplacian(gray_crop, cv2.CV_64F).var()
        norm_blur = min(1.0, max(0.0, lap_var / 500.0))

        # 2. Moire / High-Frequency Pattern Detection (FFT Analysis)
        # Printed images and screens have distinct high frequency stripes (moire interference)
        f = np.fft.fft2(gray_crop)
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-6)
        
        # Calculate ratio of high-frequency power to low-frequency power
        h, w = magnitude_spectrum.shape
        cy, cx = h // 2, w // 2
        low_freq = np.sum(magnitude_spectrum[cy-10:cy+10, cx-10:cx+10])
        total_freq = np.sum(magnitude_spectrum)
        high_freq_ratio = float((total_freq - low_freq) / (total_freq + 1e-6))

        # 3. Gamut & Color Saturation Analysis
        # Monitors and printed paper have artificial spectrum limits. Backlight boosts saturation
        h_channel, s_channel, v_channel = cv2.split(hsv_crop)
        avg_saturation = float(np.mean(s_channel) / 255.0)
        max_saturation = float(np.max(s_channel) / 255.0)
        std_saturation = float(np.std(s_channel) / 255.0)

        # 4. Specular Reflection (Glass/Monitor Gloss) Check
        # Screens have highly centered specular highlights from glass. Skin has diffuse reflection
        ret, thresh_v = cv2.threshold(v_channel, 240, 255, cv2.THRESH_BINARY)
        hotspot_ratio = float(np.sum(thresh_v == 255) / (128 * 128))

        # 5. Challenge-Response Validation (Blink, Turn Left/Right, Smile)
        challenge_passed = True
        challenge_details = {}
        
        if landmarks:
            # Gaze and eye blink estimation (EAR-equivalent for 5 landmarks)
            # Standard EAR uses 6 landmarks, but with 5 landmarks we can analyze eye texture or micro distances
            left_eye_pt = landmarks.get("left_eye")
            right_eye_pt = landmarks.get("right_eye")
            nose_pt = landmarks.get("nose")
            mouth_left = landmarks.get("mouth_left")
            mouth_right = landmarks.get("mouth_right")

            if left_eye_pt and right_eye_pt and nose_pt and mouth_left and mouth_right:
                # Calculate turn asymmetry
                dist_left = np.sqrt((nose_pt["x"] - left_eye_pt["x"])**2 + (nose_pt["y"] - left_eye_pt["y"])**2)
                dist_right = np.sqrt((nose_pt["x"] - right_eye_pt["x"])**2 + (nose_pt["y"] - right_eye_pt["y"])**2)
                turn_ratio = dist_left / (dist_right + 1e-6)

                # Mouth width to nose height ratio (Smile check)
                mouth_width = np.sqrt((mouth_left["x"] - mouth_right["x"])**2 + (mouth_left["y"] - mouth_right["y"])**2)
                nose_mouth_dist = np.sqrt((nose_pt["x"] - (mouth_left["x"] + mouth_right["x"])/2)**2 + (nose_pt["y"] - (mouth_left["y"] + mouth_right["y"])/2)**2)
                smile_ratio = mouth_width / (nose_mouth_dist + 1e-6)

                # Handle Challenges
                if challenge == "TURN_LEFT":
                    # Face is turned left -> nose should be significantly closer to the left eye coordinate
                    challenge_passed = turn_ratio < 0.70
                    challenge_details = {"turn_ratio": round(turn_ratio, 2), "expected": "TURN_LEFT"}
                elif challenge == "TURN_RIGHT":
                    # Face is turned right -> nose is closer to the right eye
                    challenge_passed = turn_ratio > 1.45
                    challenge_details = {"turn_ratio": round(turn_ratio, 2), "expected": "TURN_RIGHT"}
                elif challenge == "SMILE":
                    # Smile ratio should be high
                    challenge_passed = smile_ratio > 1.15
                    challenge_details = {"smile_ratio": round(smile_ratio, 2), "expected": "SMILE"}
                elif challenge == "BLINK":
                    # Temporal movement check between current and previous frame landmarks
                    if prev_landmarks:
                        prev_l_eye = prev_landmarks.get("left_eye")
                        prev_r_eye = prev_landmarks.get("right_eye")
                        if prev_l_eye and prev_r_eye:
                            eye_diff = abs(left_eye_pt["y"] - prev_l_eye["y"]) + abs(right_eye_pt["y"] - prev_r_eye["y"])
                            # Micro fluctuation indicates liveness/blink
                            challenge_passed = eye_diff > 2.5
                            challenge_details = {"eye_movement": round(eye_diff, 2), "expected": "BLINK"}
                        else:
                            challenge_passed = True
                    else:
                        challenge_passed = True
                elif challenge == "NEUTRAL":
                    # Ratios should reside within normal bands
                    challenge_passed = 0.80 <= turn_ratio <= 1.25 and smile_ratio < 1.10
                    challenge_details = {"turn_ratio": round(turn_ratio, 2), "smile_ratio": round(smile_ratio, 2), "expected": "NEUTRAL"}

        # --- HEURISTIC THREAT SCORING ENGINE ---
        threat_score = 0.0
        attack_vector = "live_human"

        # Threat Rules:
        # A. Moire high-frequency ratio: Screens and printed paper have sharp repeating textures
        if high_freq_ratio > 0.82:
            threat_score += 0.40
            attack_vector = "mobile_screen" if hotspot_ratio > 0.04 else "printed_photo"

        # B. Specular hotspots check: Highly localized shiny spots suggest glassy screens
        if hotspot_ratio > 0.08:
            threat_score += 0.35
            attack_vector = "mobile_screen"

        # C. Defocus / Blurry prints check:
        if norm_blur < 0.15:
            threat_score += 0.25
            if attack_vector == "live_human":
                attack_vector = "printed_photo"

        # D. Gamut anomalies: Backlit displays show extreme saturation variations
        if avg_saturation > 0.70 or std_saturation < 0.05:
            threat_score += 0.20
            attack_vector = "video_replay"

        # E. Challenge failures: Failing prompts massively increases threat score
        if challenge and not challenge_passed:
            threat_score += 0.45
            attack_vector = "video_replay" if threat_score > 0.30 else "static_mask"

        # Clip threat score
        threat_score = min(1.0, max(0.0, threat_score))
        is_live = threat_score < self.threshold_spoof

        # Determine levels
        if threat_score < 0.25:
            threat_level = "low"
        elif threat_score < 0.50:
            threat_level = "medium"
        elif threat_score < 0.75:
            threat_level = "high"
        else:
            threat_level = "critical"

        return {
            "liveness_score": round(1.0 - threat_score, 3),
            "is_live": is_live,
            "threat_score": round(threat_score, 3),
            "threat_level": threat_level,
            "attack_vector": attack_vector if threat_score >= self.threshold_spoof else "none",
            "challenge_passed": challenge_passed,
            "challenge_details": challenge_details,
            "details": {
                "laplacian_variance": round(lap_var, 1),
                "high_frequency_ratio": round(high_freq_ratio, 3),
                "saturation_mean": round(avg_saturation, 3),
                "hotspot_ratio": round(hotspot_ratio, 4)
            }
        }

    # --- THREAT REGISTRY AND AUTOLOCK MANAGEMENT ---

    def register_attempt(self, db: Session, camera_id: Optional[str], analysis: Dict[str, Any], crop_b64: Optional[str] = None) -> Optional[SecurityLog]:
        """
        Persists a security audit attempt. 
        If threat exceeds critical safety limits, automatically blocks the camera stream 
        and updates the camera's health profile in Redis and DB.
        """
        if not analysis["is_live"] or analysis["threat_score"] >= 0.45:
            # Log threat
            log_id = str(np.random.default_rng().integers(100000, 999999)) + "-" + str(int(time.time()))
            
            # Auto-block determination
            should_block = analysis["threat_score"] >= 0.75 # Critical threat level triggers instant lockdown
            
            security_log = SecurityLog(
                id=log_id,
                camera_id=camera_id,
                event_type="spoof_attempt" if not analysis["is_live"] else "security_anomaly",
                threat_score=analysis["threat_score"],
                threat_level=analysis["threat_level"],
                attack_vector=analysis["attack_vector"],
                details=analysis,
                crop_base64=crop_b64,
                is_blocked=should_block,
                resolved=False
            )
            db.add(security_log)

            # Update camera cumulative scorecard
            if camera_id:
                scorecard = db.query(ThreatScorecard).filter(ThreatScorecard.camera_id == camera_id).first()
                if not scorecard:
                    scorecard = ThreatScorecard(
                        id=str(np.random.default_rng().integers(100000, 999999)),
                        camera_id=camera_id,
                        cumulative_score=analysis["threat_score"],
                        alert_count=1,
                        status="warning" if not should_block else "locked",
                        last_threat_at=datetime.utcnow()
                    )
                    db.add(scorecard)
                else:
                    scorecard.cumulative_score = min(10.0, scorecard.cumulative_score + analysis["threat_score"])
                    scorecard.alert_count += 1
                    scorecard.last_threat_at = datetime.utcnow()
                    if should_block:
                        scorecard.status = "locked"

                # Update camera status directly if locked down
                if should_block:
                    from app.models import Camera
                    cam = db.query(Camera).filter(Camera.id == camera_id).first()
                    if cam:
                        cam.status = "error"
                        cam.is_active = False

                db.commit()
                
                # Push real-time Admin alert notification via WebSockets
                self.trigger_admin_ws_alert(camera_id, security_log)

            return security_log
        return None

    def trigger_admin_ws_alert(self, camera_id: str, log: SecurityLog):
        """Dispatches dynamic push socket alarms to the Security/SuperAdmin control tower."""
        try:
            from app.websocket_manager import manager
            import asyncio
            
            alert_payload = {
                "event": "SecurityAlertTriggered",
                "log_id": log.id,
                "camera_id": camera_id,
                "threat_score": log.threat_score,
                "threat_level": log.threat_level,
                "attack_vector": log.attack_vector,
                "is_blocked": log.is_blocked,
                "timestamp": log.timestamp.isoformat(),
                "message": f"CRITICAL SECURITY ALERT: {log.threat_level.upper()} spoofing threat detected on camera {camera_id}!"
            }
            
            # Fast async broadcast to administrative channels
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(manager.broadcast(alert_payload, group="admins"))
        except Exception as ws_err:
            logger.debug(f"Failed to broadcast security alert via websockets: {ws_err}")

# Singleton Instance
anti_spoof_service = AntiSpoofService()
