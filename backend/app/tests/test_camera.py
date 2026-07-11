import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.routes.auth import get_current_user
from app.schemas import UserResponse
from app.models import Camera, CameraGroup, CameraLocation

# --- TEST DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_camera.db"

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

# Mock active authenticated user with full administration credentials
@pytest.fixture
def admin_user():
    return UserResponse(
        id="admin-uuid",
        email="superadmin@facevision.ai",
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
    """Bypasses normal JWT headers verification injecting mock profiles."""
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


# --- CAMERA PLATFORM TEST SUITE ---

def test_create_camera_group_success(client):
    """Asserts that creating a camera group is successful."""
    response = client.post(
        "/api/v1/camera/groups",
        json={
            "name": "Front Entrance Group",
            "description": "All cameras located near the outer gates"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Front Entrance Group"
    assert "id" in data


def test_create_camera_location_success(client):
    """Asserts that creating a physical location is successful."""
    response = client.post(
        "/api/v1/camera/locations",
        json={
            "name": "Gate A Lobby",
            "description": "Lobby area inside Gate A building"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Gate A Lobby"
    assert "id" in data


def test_register_camera_success(client, db_session):
    """Asserts that registering a new camera saves correct parameters."""
    # Seed group and location
    group = CameraGroup(id="g-1", name="West Wing Group")
    location = CameraLocation(id="l-1", name="Floor 1 Corridors")
    db_session.add(group)
    db_session.add(location)
    db_session.commit()

    response = client.post(
        "/api/v1/camera/register",
        json={
            "name": "West Entrance Dome 1",
            "type": "RTSP",
            "connection_string": "rtsp://admin:admin123@192.168.1.50:554/h264",
            "ip_address": "192.168.1.50",
            "port": 554,
            "rtsp_url": "rtsp://admin:admin123@192.168.1.50:554/h264",
            "resolution": "1920x1080",
            "fps": 30,
            "group_id": "g-1",
            "location_id": "l-1"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "West Entrance Dome 1"
    assert data["type"] == "RTSP"
    assert data["status"] == "disconnected"
    assert data["group_id"] == "g-1"
    assert data["location_id"] == "l-1"
    assert "id" in data


def test_register_camera_duplicate_blocked(client, db_session):
    """Asserts duplicate registrations on identical camera names are blocked."""
    client.post(
        "/api/v1/camera/register",
        json={
            "name": "Block B Camera",
            "type": "USB",
            "connection_string": "0"
        }
    )
    # Duplicate post
    response = client.post(
        "/api/v1/camera/register",
        json={
            "name": "Block B Camera",
            "type": "USB",
            "connection_string": "0"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_camera_crud_operations(client, db_session):
    """Asserts updating and deleting camera specifications operates cleanly."""
    # Register camera
    reg_res = client.post(
        "/api/v1/camera/register",
        json={
            "name": "Update Test Cam",
            "type": "USB",
            "connection_string": "1"
        }
    )
    camera_id = reg_res.json()["id"]

    # Update camera
    up_res = client.put(
        f"/api/v1/camera/{camera_id}",
        json={
            "name": "Updated Name Cam",
            "resolution": "1280x720",
            "fps": 25
        }
    )
    assert up_res.status_code == 200
    assert up_res.json()["name"] == "Updated Name Cam"
    assert up_res.json()["resolution"] == "1280x720"
    assert up_res.json()["fps"] == 25

    # Get details
    det_res = client.get(f"/api/v1/camera/{camera_id}")
    assert det_res.status_code == 200
    assert det_res.json()["name"] == "Updated Name Cam"

    # Delete camera
    del_res = client.delete(f"/api/v1/camera/{camera_id}")
    assert del_res.status_code == 200
    assert "successfully deleted" in del_res.json()["message"]


def test_camera_streaming_lifecycle(client):
    """Asserts that triggering stream controls (start, stop, restart) functions smoothly."""
    reg_res = client.post(
        "/api/v1/camera/register",
        json={
            "name": "Streaming Cycle Cam",
            "type": "IP",
            "connection_string": "192.168.1.100"
        }
    )
    camera_id = reg_res.json()["id"]

    # Start stream
    start_res = client.post(f"/api/v1/camera/start?camera_id={camera_id}")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "streaming"

    # Health check
    health_res = client.get(f"/api/v1/camera/{camera_id}/health")
    assert health_res.status_code == 200
    assert health_res.json()["is_online"] is True

    # Stop stream
    stop_res = client.post(f"/api/v1/camera/stop?camera_id={camera_id}")
    assert stop_res.status_code == 200
    assert stop_res.json()["status"] == "disconnected"


def test_camera_recording_triggers(client):
    """Asserts that starting and stopping automated file recording sessions operates smoothly."""
    reg_res = client.post(
        "/api/v1/camera/register",
        json={
            "name": "Recording Test Cam",
            "type": "IP",
            "connection_string": "192.168.1.101"
        }
    )
    camera_id = reg_res.json()["id"]

    # Start Recording
    start_res = client.post(f"/api/v1/camera/record/start?camera_id={camera_id}")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "recording"
    assert "file_path" in start_res.json()

    # Stop Recording
    stop_res = client.post(f"/api/v1/camera/record/stop?camera_id={camera_id}")
    assert stop_res.status_code == 200
    assert stop_res.json()["status"] == "completed"
    assert stop_res.json()["duration_seconds"] > 0


def test_camera_snapshot_download(client):
    """Asserts that snapshot endpoint successfully streams visual payloads."""
    reg_res = client.post(
        "/api/v1/camera/register",
        json={
            "name": "Snapshot Test Cam",
            "type": "USB",
            "connection_string": "0"
        }
    )
    camera_id = reg_res.json()["id"]

    response = client.get(f"/api/v1/camera/snapshot/{camera_id}")
    assert response.status_code == 200
    assert "image/jpeg" in response.headers["content-type"]
