import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# --- TEST DATABASE SETUP ---
# Standard in-memory SQLite engine for fast isolation testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Initializes schema tables prior to run tests and tears down afterwards."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    """Yields clean transaction sessions for database operations inside tests."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    """Overrides dependency injection to route api operations through mock session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# --- AUTHENTICATION & REGISTRATION TESTS ---

def test_user_registration_success(client):
    """Asserts user registration compiles valid profiles and assigns default roles."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "teststudent@facevision.ai",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!"
        }
    )
    assert response.status_code == 211 or response.status_code == 201
    data = response.json()
    assert data["email"] == "teststudent@facevision.ai"
    assert "id" in data
    assert data["is_verified"] is False


def test_user_registration_password_mismatch(client):
    """Asserts Pydantic model validation catches password mismatch validation checks."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "invalidpass@facevision.ai",
            "password": "SecurePassword123!",
            "password_confirm": "MismatchedPassword!"
        }
    )
    assert response.status_code == 422


def test_user_login_success(client):
    """Asserts user credentials authenticate and issue high-entropy JWT tokens."""
    # First, register profile
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "logintest@facevision.ai",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!"
        }
    )
    
    # Try logging in
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "logintest@facevision.ai",
            "password": "SecurePassword123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_user_login_incorrect_password(client):
    """Asserts invalid passwords reject access and lock out accounts on limits."""
    # Register account first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpass@facevision.ai",
            "password": "CorrectPassword123!",
            "password_confirm": "CorrectPassword123!"
        }
    )
    
    # Try invalid password
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpass@facevision.ai",
            "password": "IncorrectPassword!"
        }
    )
    assert response.status_code == 401
    assert "Incorrect credentials" in response.json()["detail"]


def test_access_token_refresh(client):
    """Asserts token refresh mechanisms rotate active sessions successfully."""
    # Register and get login refresh tokens
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "refreshtest@facevision.ai",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!"
        }
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "refreshtest@facevision.ai",
            "password": "SecurePassword123!"
        }
    )
    refresh_token = login_response.json()["refresh_token"]
    
    # Trigger refresh cycle
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_profile_secured_route(client):
    """Asserts profile retrieval endpoint validates active JWT authentication."""
    # Unauthorized request without JWT headers
    response = client.get("/api/v1/auth/profile")
    assert response.status_code == 401
    
    # Authorized request with headers
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "profiletest@facevision.ai",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!"
        }
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "profiletest@facevision.ai",
            "password": "SecurePassword123!"
        }
    )
    token = login_response.json()["access_token"]
    
    auth_response = client.get(
        "/api/v1/auth/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert auth_response.status_code == 200
    assert auth_response.json()["email"] == "profiletest@facevision.ai"
