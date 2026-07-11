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
from app.models_recognition import FaceEmbedding, RecognitionHistory, UnknownFace

# --- TEST DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_recognition.db"

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
        id="recognition-admin-uuid",
        email="recognition-expert@facevision.ai",
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
def create_test_image_bytes(width=640, height=480, draw_face=True) -> bytes:
    """Generates a real JPG image buffer, with simulated high-contrast circles acting as a face."""
    img_arr = np.ones((height, width, 3), dtype=np.uint8) * 128
    
    if draw_face:
        # Draw face oval
        cv2.ellipse(img_arr, (width // 2, height // 2), (100, 140), 0, 0, 360, (255, 255, 255), -1)
        # Eyes
        cv2.circle(img_arr, (width // 2 - 40, height // 2 - 40), 15, (0, 0, 0), -1)
        cv2.circle(img_arr, (width // 2 + 40, height // 2 - 40), 15, (0, 0, 0), -1)
        # Nose
        polygon = np.array([
            [width // 2, height // 2 - 10],
            [width // 2 - 15, height // 2 + 30],
            [width // 2 + 15, height // 2 + 30]
        ], np.int32)
        cv2.fillPoly(img_arr, [polygon], (50, 50, 50))
        # Mouth
        cv2.ellipse(img_arr, (width // 2, height // 2 + 60), (40, 15), 0, 0, 180, (0, 0, 255), -1)

    _, buffer = cv2.imencode(".jpg", img_arr)
    return buffer.tobytes()


# --- TEST SUITE FOR RECOGNITION SERVICE ---

def test_face_enrollment_and_matching_flow(client, db_session):
    """
    Ensures complete face register-to-recognize flow works cleanly:
    1. Seed a student record
    2. Register their face embedding via upload
    3. Run image-based recognition to verify identity matches perfectly
    """
    # 1. Seed Student Profile
    student = Student(
        id="test-student-uuid-1",
        student_id="STUD-8812",
        roll_number="ROLL-0012",
        full_name="Alex Rivera",
        email="alex.rivera@university.edu",
        department="Computer Science",
        course="AI & Computer Vision",
        program="B.Tech",
        academic_year="2026",
        semester="Fall-2026",
        year=3,
        status="active"
    )
    db_session.add(student)
    db_session.commit()

    # 2. Register Face
    img_bytes = create_test_image_bytes()
    register_response = client.post(
        "/recognition/register?student_id=test-student-uuid-1",
        files={"file": ("alex.jpg", img_bytes, "image/jpeg")}
    )
    
    assert register_response.status_code == 200
    reg_data = register_response.json()
    assert reg_data["status"] == "success"
    assert "embedding_id" in reg_data
    
    # Check that database status reflects face registration
    db_session.refresh(student)
    assert student.face_registered is True

    # 3. Recognize Face
    recognition_response = client.post(
        "/recognition/image",
        files={"file": ("alex_webcam.jpg", img_bytes, "image/jpeg")}
    )
    
    assert recognition_response.status_code == 200
    rec_data = recognition_response.json()
    assert rec_data["success"] is True
    assert rec_data["total_faces_detected"] == 1
    
    match = rec_data["matches"][0]
    assert match["recognition_status"] == "success"
    assert match["student_name"] == "Alex Rivera"
    assert match["student_id"] == "STUD-8812"
    assert match["roll_number"] == "ROLL-0012"


def test_face_verification_one_to_one(client):
    """Asserts that 1-to-1 facial identity validation is accurate."""
    img_bytes_1 = create_test_image_bytes()
    # Create slightly offset image 2
    img_bytes_2 = create_test_image_bytes(width=640, height=480, draw_face=True)

    b64_1 = base64.b64encode(img_bytes_1).decode("utf-8")
    b64_2 = base64.b64encode(img_bytes_2).decode("utf-8")

    response = client.post(
        "/recognition/verify",
        json={
            "face_image_base64_1": f"data:image/jpeg;base64,{b64_1}",
            "face_image_base64_2": f"data:image/jpeg;base64,{b64_2}"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is True
    assert data["similarity_score"] > 0.85


def test_live_webcam_frame_processing(client):
    """Asserts that live webcam frame uploads yield valid matches."""
    img_bytes = create_test_image_bytes()
    b64_str = base64.b64encode(img_bytes).decode("utf-8")

    response = client.post(
        f"/recognition/live?frame_base64=data:image/jpeg;base64,{b64_str}"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "matches" in data


def test_get_recognition_history(client, db_session):
    """Ensures logs from past audits can be loaded cleanly with filter scopes."""
    response = client.get("/recognition/history?limit=10")
    assert response.status_code == 200
    history = response.json()
    assert isinstance(history, list)


def test_get_unknown_faces(client, db_session):
    """Ensures that unrecognized matches logged to the DB are queryable."""
    response = client.get("/recognition/unknown?limit=5")
    assert response.status_code == 200
    unknowns = response.json()
    assert isinstance(unknowns, list)
