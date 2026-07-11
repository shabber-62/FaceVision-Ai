from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.dependencies import PermissionChecker
from app.routes.auth import get_current_user
from app.schemas import UserResponse
from app.schemas_attendance import (
    AttendanceSessionCreate, AttendanceSessionResponse, AttendanceMarkRequest,
    AttendanceManualRequest, AttendanceUpdateRequest, AttendanceResponse,
    CorrectionCreateRequest, CorrectionResponse, LeaveRequestCreate, LeaveRequestResponse,
    AttendanceSummaryResponse, DailyAttendanceSummary
)
from app.services.attendance import AttendanceService
from app.websocket_manager import manager

router = APIRouter(prefix="/attendance", tags=["Attendance Management Platform"])

# --- SESSION LIFECYCLE ---

@router.post(
    "/start-session",
    response_model=AttendanceSessionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker(["Manage Attendance"]))]
)
async def start_session(
    schema: AttendanceSessionCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Starts a dynamic automated/AI period-wise attendance window."""
    service = AttendanceService(db)
    return await service.start_attendance_session(schema, current_user.id)


@router.post(
    "/stop-session",
    response_model=AttendanceSessionResponse,
    dependencies=[Depends(PermissionChecker(["Manage Attendance"]))]
)
async def stop_session(
    session_id: str = Query(..., description="Target session UUID to close"),
    db: Session = Depends(get_db)
):
    """Closes an active attendance session prematurely to prevent further entries."""
    service = AttendanceService(db)
    return await service.stop_attendance_session(session_id)


# --- ATTENDANCE MARKING AND ACTIONS ---

@router.post(
    "/mark",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker(["Mark Attendance"]))]
)
async def mark_attendance(
    schema: AttendanceMarkRequest,
    db: Session = Depends(get_db)
):
    """Endpoint for camera feeds / AI models to report facial recognition matches."""
    service = AttendanceService(db)
    return await service.mark_ai_attendance(schema)


@router.post(
    "/manual",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker(["Manage Attendance"]))]
)
async def mark_manual(
    schema: AttendanceManualRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Enables faculty to directly override / save manual student attendance details."""
    service = AttendanceService(db)
    return await service.mark_manual_attendance(schema, current_user.id)


@router.put(
    "/update",
    response_model=AttendanceResponse,
    dependencies=[Depends(PermissionChecker(["Manage Attendance"]))]
)
async def update_attendance(
    schema: AttendanceUpdateRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Performs updates/corrections on a specific record of attendance."""
    service = AttendanceService(db)
    return await service.update_attendance(schema, current_user.id)


@router.delete(
    "/delete",
    dependencies=[Depends(PermissionChecker(["Manage Attendance"]))]
)
async def delete_attendance(
    attendance_id: str = Query(..., description="The attendance UUID to delete"),
    db: Session = Depends(get_db)
):
    """Deletes an attendance record cleanly and updates subject summaries."""
    service = AttendanceService(db)
    return service.delete_attendance(attendance_id)


# --- REPORTING & QUERIES ---

@router.get(
    "/student/{student_id}",
    dependencies=[Depends(PermissionChecker(["View Attendance"]))]
)
def get_student_history(
    student_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves full attendance breakdown card for a specific student."""
    service = AttendanceService(db)
    return service.get_student_report(student_id)


@router.get(
    "/class/{class_id}",
    dependencies=[Depends(PermissionChecker(["View Attendance"]))]
)
def get_class_history(
    class_id: str,
    db: Session = Depends(get_db)
):
    """Compiles a complete class roster with individual performance levels."""
    service = AttendanceService(db)
    return service.get_class_report(class_id)


@router.get(
    "/today",
    dependencies=[Depends(PermissionChecker(["View Attendance"]))]
)
def get_today_stats(
    db: Session = Depends(get_db)
):
    """Retrieves flat attendance performance indicators representing today's actions."""
    service = AttendanceService(db)
    return service.get_today_report()


@router.get(
    "/history",
    response_model=List[AttendanceResponse],
    dependencies=[Depends(PermissionChecker(["View Attendance"]))]
)
def get_history(
    student_id: Optional[str] = Query(None, description="Filter by student UUID"),
    db: Session = Depends(get_db)
):
    """Fetches a list of historical attendance logs."""
    service = AttendanceService(db)
    if student_id:
        return service.repository.get_student_history(student_id)
    return service.repository.get_today_attendance()


@router.get(
    "/report",
    dependencies=[Depends(PermissionChecker(["View Attendance"]))]
)
def get_detailed_report(
    scope: str = Query("daily", description="Scope parameters: daily, weekly, monthly, semester"),
    class_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Generates detailed aggregated analytical summaries."""
    service = AttendanceService(db)
    if class_id:
        return service.get_class_report(class_id)
    return service.get_today_report()


@router.get(
    "/export",
    dependencies=[Depends(PermissionChecker(["View Attendance"]))]
)
def export_attendance_report(
    class_id: Optional[str] = Query(None, description="Optionally limit export to specific class"),
    db: Session = Depends(get_db)
):
    """Triggers clean CSV download streams representing current attendance records."""
    service = AttendanceService(db)
    stream = service.export_attendance_csv(class_id)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=attendance_export_{date.today()}.csv"
    return response


# --- LEAVES & CORRECTIONS INTEGRATION ENDPOINTS ---

@router.post(
    "/corrections",
    response_model=CorrectionResponse,
    dependencies=[Depends(PermissionChecker(["Mark Attendance"]))]
)
def request_correction(
    schema: CorrectionCreateRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Enables students or staff to submit correction petitions."""
    service = AttendanceService(db)
    return service.request_correction(schema, current_user.id)


@router.post(
    "/corrections/{id}/review",
    response_model=CorrectionResponse,
    dependencies=[Depends(PermissionChecker(["Manage Attendance"]))]
)
def review_correction(
    id: str,
    approved: bool = Query(..., description="Set to true to approve, false to deny"),
    rejection_reason: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Approves or rejects a student's correction challenge."""
    service = AttendanceService(db)
    return service.review_correction(id, approved, current_user.id, rejection_reason)


@router.post(
    "/leaves",
    response_model=LeaveRequestResponse,
    dependencies=[Depends(PermissionChecker(["Mark Attendance"]))]
)
def apply_leave(
    schema: LeaveRequestCreate,
    db: Session = Depends(get_db)
):
    """Logs a prospective student leave application."""
    service = AttendanceService(db)
    return service.apply_leave_request(schema)


@router.post(
    "/leaves/{id}/review",
    response_model=LeaveRequestResponse,
    dependencies=[Depends(PermissionChecker(["Manage Attendance"]))]
)
def review_leave(
    id: str,
    approved: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Approves or rejects leave logs, retroactively updating overlapping attendance slots."""
    service = AttendanceService(db)
    return service.review_leave_request(id, approved, current_user.id)


# --- WEBSOCKET EVENT HUB ---

@router.websocket("/ws/{group_id}")
async def websocket_event_hub(websocket: WebSocket, group_id: str):
    """Real-time bi-directional events monitoring for classes or dashboards."""
    await manager.connect(websocket, group_id)
    try:
        while True:
            # Wait for any heartbeat ping from clients
            data = await websocket.receive_text()
            await websocket.send_json({"pong": True, "received": data})
    except Exception:
        pass
    finally:
        manager.disconnect(websocket, group_id)
