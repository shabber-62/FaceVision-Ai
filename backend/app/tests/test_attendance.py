import io
import pytest
from datetime import date, timedelta, datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.routes.auth import get_current_user
from app.schemas import UserResponse
from app.models import Student

# --- TEST DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_attendance.db"

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

# Mock active authenticated user with full administration/faculty credentials
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
            "View Students", "Create Students", "Edit Students", "Delete Students",
            "View Attendance", "Mark Attendance", "Manage Attendance"
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


# --- ATTENDANCE SYSTEM TEST SUITE ---

def test_start_session_success(client):
    """Asserts that starting an attendance session with proper parameters is successful."""
    response = client.post(
        "/api/v1/attendance/start-session",
        json={
            "class_id": "CS-A-2023",
            "subject_id": "CS101",
            "period": "Period 1",
            "duration_minutes": 45
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["class_id"] == "CS-A-2023"
    assert data["subject_id"] == "CS101"
    assert data["period"] == "Period 1"
    assert data["status"] == "active"
    assert "id" in data


def test_start_session_duplicate_rejected(client):
    """Asserts that opening two active sessions for the same class and period is blocked."""
    # Start first session
    client.post(
        "/api/v1/attendance/start-session",
        json={
            "class_id": "CS-B-2023",
            "subject_id": "CS102",
            "period": "Period 2",
            "duration_minutes": 50
        }
    )
    # Attempt second session for same class and period
    response = client.post(
        "/api/v1/attendance/start-session",
        json={
            "class_id": "CS-B-2023",
            "subject_id": "CS102",
            "period": "Period 2",
            "duration_minutes": 50
        }
    )
    assert response.status_code == 400
    assert "already open" in response.json()["detail"]


def test_mark_ai_attendance_scenarios(client, db_session):
    """Asserts AI recognition outcomes depending on confidence thresholds and duplicate checks."""
    # 1. Seed Student
    student = Student(
        id="student-uuid-abc",
        student_id="STUDENT001",
        roll_number="ROLL202699",
        full_name="Mark AI Student",
        email="mark_ai@facevision.ai",
        department="CS-A-2023",
        course="CS101",
        program="B.Tech",
        academic_year="2023-2027",
        semester="Semester 1",
        year=1,
        attendance_percentage=100.0,
        face_registered=True,
        status="active"
    )
    db_session.add(student)
    db_session.commit()

    # 2. Start session
    session_res = client.post(
        "/api/v1/attendance/start-session",
        json={
            "class_id": "CS-A-2023",
            "subject_id": "CS101",
            "period": "Period 3",
            "duration_minutes": 60
        }
    )
    session_id = session_res.json()["id"]

    # 3. Test High Confidence (Present)
    mark_res = client.post(
        "/api/v1/attendance/mark",
        json={
            "student_id": "student-uuid-abc",
            "session_id": session_id,
            "confidence": 85.0,
            "raw_image_path": "/static/uploads/logs/img1.jpg"
        }
    )
    assert mark_res.status_code == 201
    assert mark_res.json()["status"] in ("present", "late")

    # 4. Test Duplicate Prevention
    dupe_res = client.post(
        "/api/v1/attendance/mark",
        json={
            "student_id": "student-uuid-abc",
            "session_id": session_id,
            "confidence": 90.0
        }
    )
    assert dupe_res.status_code == 400
    assert "Duplicate Attendance Error" in dupe_res.json()["detail"]

    # 5. Create another student for Low Confidence Test
    student2 = Student(
        id="student-uuid-low",
        student_id="STUDENT002",
        roll_number="ROLL202688",
        full_name="Low Conf Student",
        email="low_conf@facevision.ai",
        department="CS-A-2023",
        course="CS101",
        program="B.Tech",
        academic_year="2023-2027",
        semester="Semester 1",
        year=1,
        attendance_percentage=100.0,
        face_registered=True,
        status="active"
    )
    db_session.add(student2)
    db_session.commit()

    # 6. Test Low Confidence (Sent for manual review / rejected)
    low_res = client.post(
        "/api/v1/attendance/mark",
        json={
            "student_id": "student-uuid-low",
            "session_id": session_id,
            "confidence": 55.0
        }
    )
    assert low_res.status_code == 422
    assert "too low" in low_res.json()["detail"]


def test_manual_override_and_corrections(client, db_session):
    """Asserts that faculty manual overrides and student correction petitions operate smoothly."""
    # Seed student and session
    student = Student(
        id="student-manual-id",
        student_id="STUDENT003",
        roll_number="ROLL202677",
        full_name="Manual Override Student",
        email="manual@facevision.ai",
        department="CS-C-2023",
        course="CS101",
        program="B.Tech",
        academic_year="2023-2027",
        semester="Semester 1",
        year=1,
        attendance_percentage=100.0,
        face_registered=True,
        status="active"
    )
    db_session.add(student)
    db_session.commit()

    sess_res = client.post(
        "/api/v1/attendance/start-session",
        json={
            "class_id": "CS-C-2023",
            "subject_id": "CS101",
            "period": "Period 4",
            "duration_minutes": 60
        }
    )
    session_id = sess_res.json()["id"]

    # Faculty overrides status to Present
    override_res = client.post(
        "/api/v1/attendance/manual",
        json={
            "student_id": "student-manual-id",
            "session_id": session_id,
            "status": "present",
            "reason": "Student was sitting at the back and couldn't scan"
        }
    )
    assert override_res.status_code == 201
    attendance_id = override_res.json()["id"]

    # Student submits Correction request
    correct_res = client.post(
        "/api/v1/attendance/corrections",
        json={
            "attendance_id": attendance_id,
            "requested_status": "excused",
            "reason": "Submitted official duty leave slip for sports tournament"
        }
    )
    assert correct_res.status_code == 200
    correction_id = correct_res.json()["id"]

    # Faculty reviews and approves Correction request
    review_res = client.post(
        f"/api/v1/attendance/corrections/{correction_id}/review?approved=true"
    )
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "approved"


def test_leave_request_workflow(client, db_session):
    """Asserts leave application creation and subsequent retroactive status modifications."""
    # Seed Student
    student = Student(
        id="student-leave-id",
        student_id="STUDENT004",
        roll_number="ROLL202666",
        full_name="Leave Student",
        email="leave@facevision.ai",
        department="CS-D-2023",
        course="CS101",
        program="B.Tech",
        academic_year="2023-2027",
        semester="Semester 1",
        year=1,
        attendance_percentage=100.0,
        face_registered=True,
        status="active"
    )
    db_session.add(student)
    db_session.commit()

    sess_res = client.post(
        "/api/v1/attendance/start-session",
        json={
            "class_id": "CS-D-2023",
            "subject_id": "CS101",
            "period": "Period 5",
            "duration_minutes": 60
        }
    )
    session_id = sess_res.json()["id"]

    # Mark as absent first
    abs_res = client.post(
        "/api/v1/attendance/manual",
        json={
            "student_id": "student-leave-id",
            "session_id": session_id,
            "status": "absent",
            "reason": "Not present in class slot"
        }
    )
    assert abs_res.status_code == 201

    # Student requests leave
    today_str = date.today().isoformat()
    leave_res = client.post(
        "/api/v1/attendance/leaves",
        json={
            "student_id": "student-leave-id",
            "start_date": today_str,
            "end_date": today_str,
            "leave_type": "medical",
            "reason": "Diagnosed with seasonal fever"
        }
    )
    assert leave_res.status_code == 200
    leave_id = leave_res.json()["id"]

    # Review and approve leave (retroactively excuses the student)
    app_res = client.post(
        f"/api/v1/attendance/leaves/{leave_id}/review?approved=true"
    )
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "approved"


def test_reports_and_csv_export(client):
    """Asserts that fetching performance reports and CSV streams operates seamlessly."""
    # Fetch today report
    today_res = client.get("/api/v1/attendance/today")
    assert today_res.status_code == 200
    assert "total_marked" in today_res.json()

    # Trigger export downloadable stream
    export_res = client.get("/api/v1/attendance/export")
    assert export_res.status_code == 200
    assert "text/csv" in export_res.headers["content-type"]
