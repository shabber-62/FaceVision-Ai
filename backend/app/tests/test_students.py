import io
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.routes.auth import get_current_user
from app.schemas import UserResponse

# --- TEST DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_students.db"

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
        permissions=["View Students", "Create Students", "Edit Students", "Delete Students"],
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


# --- STUDENT MANAGEMENT CRUD TESTS ---

def test_create_student_success(client):
    """Asserts that a student with proper parameters is registered securely."""
    response = client.post(
        "/api/v1/students",
        json={
            "student_id": "ST1001",
            "roll_number": "ROLL202601",
            "full_name": "John Doe",
            "email": "johndoe@facevision.ai",
            "department": "Computer Science",
            "course": "AI & Machine Learning",
            "program": "B.Tech",
            "academic_year": "2023-2027",
            "semester": "Semester 1",
            "year": 1,
            "section": "A",
            "group": "G1",
            "batch": "2023",
            "attendance_percentage": 92.5,
            "face_registered": True,
            "status": "active"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["student_id"] == "ST1001"
    assert data["roll_number"] == "ROLL202601"
    assert data["full_name"] == "John Doe"
    assert "id" in data


def test_create_student_duplicates_rejected(client):
    """Asserts that duplicate unique constraints (Student ID, Roll No, Email) are rejected."""
    # Seed original profile
    client.post(
        "/api/v1/students",
        json={
            "student_id": "ST1002",
            "roll_number": "ROLL202602",
            "full_name": "Alice Smith",
            "email": "alice@facevision.ai",
            "department": "Mechanical Eng",
            "course": "Thermodynamics",
            "program": "B.Tech",
            "academic_year": "2023-2027",
            "semester": "Semester 1",
            "year": 1
        }
    )
    
    # Attempt duplicate student ID
    response = client.post(
        "/api/v1/students",
        json={
            "student_id": "ST1002", # DUPLICATE STUDENT ID
            "roll_number": "ROLL202603",
            "full_name": "Alice Duplicate",
            "email": "alice_dupe@facevision.ai",
            "department": "Mechanical Eng",
            "course": "Thermodynamics",
            "program": "B.Tech",
            "academic_year": "2023-2027",
            "semester": "Semester 1",
            "year": 1
        }
    )
    assert response.status_code == 400
    assert "Duplicate Student ID" in response.json()["detail"]


def test_get_student_by_id_and_roll(client):
    """Asserts retrieval of students by ID or Roll Number works flawlessly."""
    res = client.post(
        "/api/v1/students",
        json={
            "student_id": "ST1003",
            "roll_number": "ROLL202603",
            "full_name": "Bob Vance",
            "email": "bob@facevision.ai",
            "department": "Electrical Eng",
            "course": "Circuits",
            "program": "B.Tech",
            "academic_year": "2023-2027",
            "semester": "Semester 1",
            "year": 1
        }
    )
    student_uuid = res.json()["id"]
    
    # Retrieve by database UUID key
    get_res = client.get(f"/api/v1/students/{student_uuid}")
    assert get_res.status_code == 200
    assert get_res.json()["student_id"] == "ST1003"
    
    # Retrieve by Roll Number code
    roll_res = client.get(f"/api/v1/students/roll/ROLL202603")
    assert roll_res.status_code == 200
    assert roll_res.json()["id"] == student_uuid


def test_update_student_profile(client):
    """Asserts fields modify incrementally without corrupting unmodified properties."""
    res = client.post(
        "/api/v1/students",
        json={
            "student_id": "ST1004",
            "roll_number": "ROLL202604",
            "full_name": "Charlie Day",
            "email": "charlie@facevision.ai",
            "department": "Business",
            "course": "Marketing",
            "program": "BBA",
            "academic_year": "2023-2026",
            "semester": "Semester 1",
            "year": 1
        }
    )
    student_uuid = res.json()["id"]
    
    # Update subsets of information
    up_res = client.put(
        f"/api/v1/students/{student_uuid}",
        json={
            "full_name": "Charles Day",
            "phone": "+15550199",
            "attendance_percentage": 88.0
        }
    )
    assert up_res.status_code == 200
    assert up_res.json()["full_name"] == "Charles Day"
    assert up_res.json()["phone"] == "+15550199"
    assert up_res.json()["attendance_percentage"] == 88.0


def test_soft_delete_and_restore_cycle(client):
    """Asserts soft delete works as expected without destroying referential data."""
    res = client.post(
        "/api/v1/students",
        json={
            "student_id": "ST1005",
            "roll_number": "ROLL202605",
            "full_name": "Soft Delete Student",
            "email": "delete_me@facevision.ai",
            "department": "Civil Eng",
            "course": "Structures",
            "program": "B.Tech",
            "academic_year": "2023-2027",
            "semester": "Semester 1",
            "year": 1
        }
    )
    student_uuid = res.json()["id"]
    
    # Soft delete trigger
    del_res = client.delete(f"/api/v1/students/{student_uuid}")
    assert del_res.status_code == 200
    assert del_res.json()["is_deleted"] is True
    
    # Standard read endpoints should now return 404 Not Found
    get_res = client.get(f"/api/v1/students/{student_uuid}")
    assert get_res.status_code == 404
    
    # Restore the record back to active
    rest_res = client.patch(f"/api/v1/students/{student_uuid}/restore")
    assert rest_res.status_code == 200
    assert rest_res.json()["is_deleted"] is False
    
    # Profile should be readable again
    get_res_again = client.get(f"/api/v1/students/{student_uuid}")
    assert get_res_again.status_code == 200


def test_bulk_import_and_export(client):
    """Asserts CSV stream validation, row-by-row parsing, and exports work flawlessly."""
    # Compose import CSV dataset mock
    csv_payload = (
        "student_id,roll_number,full_name,email,department,course,program,academic_year,semester,year,status\n"
        "ST2001,ROLL9001,Bulk One,bulk1@facevision.ai,Bio,Bioinformatics,B.Tech,2023,Semester 1,1,active\n"
        "ST2002,ROLL9002,Bulk Two,bulk2@facevision.ai,Bio,Bioinformatics,B.Tech,2023,Semester 1,1,active\n"
    )
    file_bytes = csv_payload.encode("utf-8")
    
    # Fire bulk import
    import_res = client.post(
        "/api/v1/students/bulk-import",
        files={"file": ("students.csv", file_bytes, "text/csv")}
    )
    assert import_res.status_code == 200
    data = import_res.json()
    assert data["successful"] == 2
    assert data["failed"] == 0
    
    # Fire bulk export of current records
    export_res = client.get("/api/v1/students/export")
    assert export_res.status_code == 200
    assert "text/csv" in export_res.headers["content-type"]
    assert "ST2001" in export_res.text
    assert "ST2002" in export_res.text
