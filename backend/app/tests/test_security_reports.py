import pytest
import io
import base64
import numpy as np
import cv2
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.routes.auth import get_current_user
from app.schemas import UserResponse
from app.models import Student, Camera
from app.models_recognition import SecurityLog, ThreatScorecard, RecognitionHistory

# --- TEST DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_security_reports.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Initializes tables before tests run and clears schemas on exit."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    """Yields an isolated db transaction session for each test execution."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

# Mock active authenticated user with micro-permission clearance
@pytest.fixture
def admin_user():
    return UserResponse(
        id="security-admin-uuid",
        email="security-expert@facevision.ai",
        is_active=True,
        is_verified=True,
        is_two_factor_enabled=False,
        roles=[{"id": "role-1", "name": "Super Admin", "description": "Super Admin Bypass"}],
        permissions=[
            "View Cameras", "Manage Cameras", "Control Streams"
        ],
        created_at="2026-07-11T00:00:00"
    )

@pytest.fixture
def client(db_session, admin_user):
    """Overrides dependency bindings injecting mock profiles."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
        
    def override_current_user():
        return admin_user
        
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_current_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# --- DYNAMIC MOCK IMAGE GENERATOR ---
def create_test_image_bytes(width=640, height=480) -> bytes:
    """Generates a real JPG image buffer."""
    img_arr = np.ones((height, width, 3), dtype=np.uint8) * 128
    cv2.circle(img_arr, (width // 2, height // 2), 100, (255, 255, 255), -1)
    _, buffer = cv2.imencode(".jpg", img_arr)
    return buffer.tobytes()


# --- TEST CASES FOR SECURITY CONTROLLER ---

def test_security_logs_and_scorecard_endpoints(client, db_session):
    """Ensures security logs can be queried, resolved, and camera blockings are managed."""
    # 1. Seed a Mock Camera and Security Log
    camera = Camera(
        id="cam-security-uuid",
        name="Main Entrance Gate 1",
        type="USB",
        connection_string="0",
        is_active=True,
        status="streaming"
    )
    db_session.add(camera)
    db_session.commit()

    log = SecurityLog(
        id="log-spoof-1",
        camera_id="cam-security-uuid",
        event_type="spoof_attempt",
        threat_score=0.85,
        threat_level="high",
        attack_vector="printed_photo",
        is_blocked=True,
        resolved=False
    )
    scorecard = ThreatScorecard(
        id="sc-cam-1",
        camera_id="cam-security-uuid",
        cumulative_score=0.85,
        alert_count=1,
        status="warning"
    )
    db_session.add(log)
    db_session.add(scorecard)
    db_session.commit()

    # 2. Get Security Logs
    response = client.get("/api/v1/security/logs?threat_level=high")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["id"] == "log-spoof-1"
    assert data[0]["attack_vector"] == "printed_photo"

    # 3. Get Threat Scorecards
    sc_response = client.get("/api/v1/security/scorecards")
    assert sc_response.status_code == 200
    sc_data = sc_response.json()
    assert len(sc_data) >= 1
    assert sc_data[0]["camera_id"] == "cam-security-uuid"

    # 4. Resolve the security alert
    res_response = client.post("/api/v1/security/resolve/log-spoof-1?remarks=Verified%20alex%20is%20safe")
    assert res_response.status_code == 200
    assert res_response.json()["status"] == "resolved"

    # Verify resolution in DB
    db_session.refresh(log)
    assert log.resolved is True

    # 5. Unlock the camera
    unlock_response = client.post("/api/v1/security/unlock/cam-security-uuid")
    assert unlock_response.status_code == 200
    assert unlock_response.json()["status"] == "unlocked"

    # Verify camera reactivated
    db_session.refresh(camera)
    assert camera.is_active is True


def test_liveness_test_manual_uploader(client):
    """Ensures manual face liveness checking accepts image files."""
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/v1/security/liveness-test",
        files={"file": ("test_face.jpg", img_bytes, "image/jpeg")}
    )
    # Since we generated a generic white circle, yolo_detector will fallback.
    # We assert either a 200 (if it registers a face) or 422 (if no face detected as expected for solid circles).
    assert response.status_code in (200, 422)


# --- TEST CASES FOR REPORTS & ANALYTICS ---

def test_reports_analytics_compilation(client, db_session):
    """Ensures attendance spreadsheet, CSV downloads, and PDF previews render perfectly."""
    # Seed a Mock Student
    student = Student(
        id="student-test-uuid-2",
        student_id="STUD-9900",
        roll_number="ROLL-0090",
        full_name="Maria Thorne",
        email="maria.thorne@university.edu",
        department="Information Tech",
        course="Cloud Computing",
        program="B.Tech",
        academic_year="2026",
        semester="Fall-2026",
        year=4,
        status="active"
    )
    db_session.add(student)
    db_session.commit()

    # 1. Get dashboard analytics summary
    response = client.get("/api/v1/reports/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "ai_performance" in data
    assert "weekly_trends" in data

    # 2. Download CSV report
    csv_response = client.get("/api/v1/reports/attendance/csv")
    assert csv_response.status_code == 200
    assert "text/csv" in csv_response.headers["content-type"]
    assert "attachment" in csv_response.headers["content-disposition"]

    # 3. Download Excel report
    excel_response = client.get("/api/v1/reports/attendance/excel")
    assert excel_response.status_code == 200
    assert "application/vnd.ms-excel" in excel_response.headers["content-type"]

    # 4. View PDF print-ready layout
    pdf_response = client.get("/api/v1/reports/attendance/pdf")
    assert pdf_response.status_code == 200
    assert "text/html" in pdf_response.headers["content-type"]
    assert b"<!DOCTYPE html>" in pdf_response.content


def test_manual_trigger_alert(client):
    """Ensures operators can trigger notifications across websockets/email/push channels."""
    response = client.post(
        "/api/v1/reports/trigger-test-alert?channel=all&recipient=operator@facevision.ai&alert_message=Webcam%20tampered!"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "websocket_broadcast" in data["channels_processed"]
    assert "email_smtp" in data["channels_processed"]
    assert "mobile_push_fcm" in data["channels_processed"]
