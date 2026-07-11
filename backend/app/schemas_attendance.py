from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date

# --- ATTENDANCE SESSION SCHEMAS ---

class AttendanceSessionCreate(BaseModel):
    class_id: str = Field(..., description="Target class or batch code, e.g. CS-A-2023")
    subject_id: str = Field(..., description="Unique course/subject identifier, e.g. CS101")
    period: str = Field(..., description="Academic slot, e.g. Period 1, Slot A")
    duration_minutes: int = Field(50, ge=5, le=480, description="Session validity window in minutes")

class AttendanceSessionResponse(BaseModel):
    id: str
    faculty_id: Optional[str] = None
    class_id: str
    subject_id: str
    period: str
    start_time: datetime
    end_time: datetime
    status: str
    is_locked: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- ATTENDANCE MARKING SCHEMAS ---

class AttendanceMarkRequest(BaseModel):
    student_id: str = Field(..., description="UUID or academic enrollment student ID")
    session_id: Optional[str] = Field(None, description="Active session UUID. If omitted, matches latest active slot")
    confidence: float = Field(..., ge=0.0, le=100.0, description="Facial recognition confidence percentage")
    raw_image_path: Optional[str] = Field(None, description="Path to captured snapshot verification")

class AttendanceManualRequest(BaseModel):
    student_id: str = Field(..., description="Student UUID or ID")
    session_id: str = Field(..., description="Target session UUID")
    status: str = Field("present", description="Status string: present, absent, late, excused")
    reason: str = Field(..., min_length=5, max_length=255, description="Auditable reason for override")

class AttendanceUpdateRequest(BaseModel):
    attendance_id: str = Field(..., description="The UUID of the targeted attendance record")
    status: str = Field(..., description="New target status: present, absent, late, excused")
    reason: str = Field(..., min_length=5, max_length=255, description="Audit reason for update")

class AttendanceResponse(BaseModel):
    id: str
    session_id: Optional[str] = None
    student_id: str
    status: str
    confidence: Optional[float] = None
    marked_at: datetime
    is_manual: bool
    marked_by: Optional[str] = None
    remarks: Optional[str] = None
    is_late: bool
    is_early_exit: bool

    class Config:
        from_attributes = True


# --- ATTENDANCE CORRECTION SCHEMAS ---

class CorrectionCreateRequest(BaseModel):
    attendance_id: str
    requested_status: str = Field(..., description="Requested status: present, excused")
    reason: str = Field(..., min_length=10, max_length=500, description="Detailed explanation for review")

class CorrectionApprovalRequest(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = Field(None, description="Reason if correction is rejected")

class CorrectionResponse(BaseModel):
    id: str
    attendance_id: str
    student_id: str
    requested_status: str
    reason: str
    status: str
    approved_by: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- LEAVE INTEGRATION SCHEMAS ---

class LeaveRequestCreate(BaseModel):
    student_id: str
    start_date: date = Field(..., description="Start date of leave period")
    end_date: date = Field(..., description="End date of leave period")
    leave_type: str = Field(..., description="Type of leave, e.g. medical, casual, duty_leave")
    reason: str = Field(..., min_length=10, max_length=500)

class LeaveRequestResponse(BaseModel):
    id: str
    student_id: str
    start_date: date
    end_date: date
    leave_type: str
    reason: str
    status: str
    approved_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- REPORT & SUMMARY SCHEMAS ---

class AttendanceSummaryResponse(BaseModel):
    id: str
    student_id: str
    subject_id: str
    total_sessions: int
    attended_sessions: int
    attendance_percentage: float
    updated_at: datetime

    class Config:
        from_attributes = True

class StudentReportCard(BaseModel):
    student_id: str
    full_name: str
    roll_number: str
    department: str
    attendance_percentage: float
    total_present: int
    total_absent: int
    total_late: int
    total_excused: int

class ClassReportSummary(BaseModel):
    class_id: str
    subject_id: str
    total_students: int
    average_attendance: float
    present_today: int
    absent_today: int
    late_today: int

class DailyAttendanceSummary(BaseModel):
    date: date
    total_marked: int
    present: int
    absent: int
    late: int
    excused: int
