import pytest
import io
import base64
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.routes.auth import get_current_user
from app.schemas import UserResponse

# --- TEST DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_ai.db"

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
        id="ai-admin-uuid",
        email="ai-expert@facevision.ai",
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
    # Base slate gray background
    img_arr = np.ones((height, width, 3), dtype=np.uint8) * 128
    
    if draw_face:
        # Draw face oval
        cv2.ellipse(img_arr, (width // 2, height // 2), (100, 140), 0, 0, 360, (255, 255, 255), -1)
        # Eyes
        cv2.circle(img_arr, (width // 2 - 40, height // 2 - 40), 15, (0, 0, 0), -1)
        cv2.circle(img_arr, (width // 2 + 40, height // 2 - 40), 15, (0, 0, 0), -1)
        # Nose
        cv2.polygon = np.array([
            [width // 2, height // 2 - 10],
            [width // 2 - 15, height // 2 + 30],
            [width // 2 + 15, height // 2 + 30]
        ], np.int32)
        cv2.fillPoly(img_arr, [cv2.polygon], (50, 50, 50))
        # Mouth
        cv2.ellipse(img_arr, (width // 2, height // 2 + 60), (40, 15), 0, 0, 180, (0, 0, 255), -1)

    _, buffer = cv2.imencode(".jpg", img_arr)
    return buffer.tobytes()


# --- AI DETECTOR SERVICE TEST SUITE ---

def test_get_ai_status(client):
    """Asserts that system telemetry is queried successfully."""
    response = client.get("/ai/status")
    assert response.status_code == 200
    data = response.json()
    assert "model_loaded" in data
    assert "model_type" in data
    assert "device_type" in data
    assert "throughput_fps" in data


def test_update_ai_config(client):
    """Asserts that configuration parameters can be hot-reloaded dynamically."""
    response = client.put(
        "/ai/config",
        json={
            "confidence_threshold": 0.55,
            "nms_threshold": 0.35,
            "hot_reload": True,
            "use_gpu": False
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["config"]["confidence_threshold"] == 0.55
    assert data["config"]["nms_threshold"] == 0.35


def test_detect_faces_image_success(client):
    """Asserts that image upload and analysis returns structured face payloads."""
    img_bytes = create_test_image_bytes()
    
    response = client.post(
        "/ai/detect/image?confidence_threshold=0.3&nms_threshold=0.3",
        files={"file": ("face_test.jpg", img_bytes, "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "detections" in data
    assert "latency_ms" in data
    assert "device" in data


def test_detect_faces_image_invalid_file(client):
    """Asserts that uploading a corrupted or non-image file is caught gracefully."""
    response = client.post(
        "/ai/detect/image",
        files={"file": ("corrupted.txt", b"this is not a valid jpeg image", "text/plain")}
    )
    assert response.status_code == 400
    assert "Invalid image format" in response.json()["detail"]


def test_process_single_frame_base64(client):
    """Asserts that posting a base64 camera frame payload detects face features successfully."""
    img_bytes = create_test_image_bytes()
    b64_str = base64.b64encode(img_bytes).decode("utf-8")
    
    response = client.post(
        "/ai/frame",
        json={
            "frame_base64": f"data:image/jpeg;base64,{b64_str}",
            "confidence_threshold": 0.25,
            "nms_threshold": 0.4,
            "return_crops": True
        }
    )
    
    assert response.status_code == 200
    detections = response.json()
    assert isinstance(detections, list)
    if len(detections) > 0:
        det = detections[0]
        assert "box" in det
        assert "confidence" in det
        assert "landmarks" in det
        assert "quality_score" in det
        assert "crop_base64" in det


def test_detect_faces_video_processing(client):
    """Asserts that video uploads are processed sequentially without crashes."""
    # Build a simple mock video payload (using avi container parameters)
    temp_video_path = "mock_video.avi"
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(temp_video_path, fourcc, 10.0, (640, 480))
    
    # Write 5 frames of face drawings
    for _ in range(5):
        img_arr = np.ones((480, 640, 3), dtype=np.uint8) * 128
        cv2.ellipse(img_arr, (320, 240), (100, 140), 0, 0, 360, (255, 255, 255), -1)
        out.write(img_arr)
    out.release()

    try:
        with open(temp_video_path, "rb") as video_file:
            video_bytes = video_file.read()
            
        response = client.post(
            "/ai/detect/video?confidence_threshold=0.2",
            files={"file": ("mock_face.avi", video_bytes, "video/avi")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["total_frames_processed"] > 0
        assert "detections_by_frame" in data
        assert "fps" in data
    finally:
        # Cleanup test file
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
